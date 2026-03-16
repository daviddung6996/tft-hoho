import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { config as loadEnv } from 'dotenv';
import { resolve } from 'node:path';

import {
  COACH_NOTEBOOK_IDS,
  buildCoachExplainQuery,
  buildCoachSelectQuery,
  buildCoachSourceGroups,
  isValidCoachId,
  resolveCoachId,
  serializeCoachCacheContext,
  type GameContext,
} from '../supabase/functions/visian-chat/prompt.ts';
import { stripNotebookLmCitations } from '../supabase/functions/visian-chat/answer.ts';

loadEnv({ path: resolve(process.cwd(), '.env'), quiet: true });
loadEnv({ path: resolve(process.cwd(), 'services/notebooklm_bridge/.env'), quiet: true });

const BRIDGE_URL = (process.env.NOTEBOOKLM_BRIDGE_URL || 'http://127.0.0.1:8080').trim();
const BRIDGE_API_KEY = (process.env.NOTEBOOKLM_BRIDGE_API_KEY || '').trim();
const HOST = (process.env.LOCAL_VISIAN_CHAT_HOST || '127.0.0.1').trim();
const PORT = Number.parseInt(process.env.LOCAL_VISIAN_CHAT_PORT || '54321', 10);
const BRIDGE_FETCH_TIMEOUT_MS = Number.parseInt(process.env.BRIDGE_FETCH_TIMEOUT_MS || '100000', 10);
const DEFAULT_STREAM_ERROR_MESSAGE = 'Coach dang ban train, thu lai sau nha.';
const FUNCTION_PATH = '/functions/v1/visian-chat';

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, accept',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
};

type BridgeErrorPayload = {
  error: string;
  detail?: string;
  code?: string;
  missingEnv?: unknown;
};

type BridgeResult = {
  answer: string;
  bridgeRequestId: string;
  bridgeFetchMs: number;
  forwardedHeaders: Record<string, string>;
};

type BridgeStreamEvent =
  | { type: 'chunk'; text: string }
  | { type: 'complete'; answer: string }
  | { type: 'error'; payload: BridgeErrorPayload };

class BridgeRequestError extends Error {
  readonly status: number;
  readonly payload: BridgeErrorPayload;
  readonly bridgeRequestId: string;
  readonly bridgeFetchMs: number;
  readonly forwardedHeaders: Record<string, string>;

  constructor(
    message: string,
    status: number,
    payload: BridgeErrorPayload,
    bridgeRequestId: string,
    bridgeFetchMs: number,
    forwardedHeaders: Record<string, string>,
  ) {
    super(message);
    this.name = 'BridgeRequestError';
    this.status = status;
    this.payload = payload;
    this.bridgeRequestId = bridgeRequestId;
    this.bridgeFetchMs = bridgeFetchMs;
    this.forwardedHeaders = forwardedHeaders;
  }
}

class BridgeTimeoutError extends Error {
  constructor() {
    super('NotebookLM bridge timeout');
    this.name = 'BridgeTimeoutError';
  }
}

function getRequestId(): string {
  return crypto.randomUUID();
}

function normalizeBridgeUrl(url: string): string {
  return url.replace(/\/+$/, '');
}

function getMissingRuntimeEnv(): string[] {
  const missing: string[] = [];

  if (!BRIDGE_URL) {
    missing.push('NOTEBOOKLM_BRIDGE_URL');
  }

  if (!BRIDGE_API_KEY || BRIDGE_API_KEY === 'replace-with-a-strong-secret') {
    missing.push('NOTEBOOKLM_BRIDGE_API_KEY');
  }

  return missing;
}

function setHeaders(res: ServerResponse, headers: Record<string, string>) {
  Object.entries(headers).forEach(([key, value]) => {
    res.setHeader(key, value);
  });
}

function sendJson(
  res: ServerResponse,
  status: number,
  body: unknown,
  requestId?: string,
  extraHeaders?: Record<string, string>,
) {
  res.statusCode = status;
  setHeaders(res, {
    ...corsHeaders,
    'Content-Type': 'application/json',
    ...(requestId ? { 'x-request-id': requestId } : {}),
    ...(extraHeaders ?? {}),
  });
  res.end(JSON.stringify(body));
}

function sendText(res: ServerResponse, status: number, body: string, headers?: Record<string, string>) {
  res.statusCode = status;
  setHeaders(res, {
    ...corsHeaders,
    'Content-Type': 'text/plain; charset=utf-8',
    ...(headers ?? {}),
  });
  res.end(body);
}

function startSse(res: ServerResponse, requestId: string) {
  res.statusCode = 200;
  setHeaders(res, {
    ...corsHeaders,
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'x-request-id': requestId,
  });
  res.flushHeaders();
}

function writeSseEvent(res: ServerResponse, event: string, data: Record<string, unknown>) {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

function endSse(res: ServerResponse) {
  if (!res.writableEnded) {
    res.end();
  }
}

function buildBridgeErrorPayload(
  status: number,
  fallbackDetail: string,
  data?: { error?: unknown; detail?: unknown; code?: unknown; missingEnv?: unknown },
): BridgeErrorPayload {
  return {
    error: typeof data?.error === 'string' && data.error ? data.error : `NotebookLM bridge error: ${status}`,
    detail: typeof data?.detail === 'string' && data.detail ? data.detail : fallbackDetail,
    code: typeof data?.code === 'string' ? data.code : undefined,
    missingEnv: Array.isArray(data?.missingEnv) ? data.missingEnv : undefined,
  };
}

function getForwardedBridgeHeaders(response: Response): Record<string, string> {
  const forwardedHeaders: Record<string, string> = {};
  const bridgeCache = response.headers.get('x-bridge-cache');
  const bridgeTotalMs = response.headers.get('x-bridge-total-ms');

  if (bridgeCache) {
    forwardedHeaders['x-bridge-cache'] = bridgeCache;
  }

  if (bridgeTotalMs) {
    forwardedHeaders['x-bridge-total-ms'] = bridgeTotalMs;
  }

  return forwardedHeaders;
}

async function readJsonBody(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];

  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  const raw = Buffer.concat(chunks).toString('utf8').trim();
  return raw ? JSON.parse(raw) : {};
}

function takeSseBlocks(buffer: string): { blocks: string[]; remaining: string } {
  const blocks: string[] = [];
  let remaining = buffer;

  while (true) {
    const match = /\r?\n\r?\n/.exec(remaining);
    if (!match || match.index < 0) {
      break;
    }

    blocks.push(remaining.slice(0, match.index));
    remaining = remaining.slice(match.index + match[0].length);
  }

  return { blocks, remaining };
}

function parseBridgeStreamEvent(block: string): BridgeStreamEvent | null {
  const lines = block
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter((line) => line.length > 0);

  if (lines.length === 0 || lines.every((line) => line.startsWith(':'))) {
    return null;
  }

  let eventName = '';
  const dataLines: string[] = [];

  for (const line of lines) {
    if (line.startsWith(':')) {
      continue;
    }

    if (line.startsWith('event:')) {
      eventName = line.slice('event:'.length).trim();
      continue;
    }

    if (line.startsWith('data:')) {
      dataLines.push(line.slice('data:'.length).trimStart());
    }
  }

  if (!eventName || dataLines.length === 0) {
    return null;
  }

  const data = JSON.parse(dataLines.join('\n')) as Record<string, unknown>;

  switch (eventName) {
    case 'chunk':
      return typeof data.text === 'string'
        ? { type: 'chunk', text: data.text }
        : null;
    case 'complete':
      return typeof data.answer === 'string'
        ? { type: 'complete', answer: data.answer }
        : null;
    case 'error':
      return typeof data.error === 'string'
        ? {
          type: 'error',
          payload: {
            error: data.error,
            detail: typeof data.detail === 'string' ? data.detail : undefined,
            code: typeof data.code === 'string' ? data.code : undefined,
            missingEnv: Array.isArray(data.missingEnv) ? data.missingEnv : undefined,
          },
        }
        : null;
    default:
      return null;
  }
}

async function consumeBridgeEventStream(
  stream: ReadableStream<Uint8Array>,
  onEvent: (event: BridgeStreamEvent) => void,
): Promise<void> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const { blocks, remaining } = takeSseBlocks(buffer);
      buffer = remaining;

      for (const block of blocks) {
        const event = parseBridgeStreamEvent(block);
        if (event) {
          onEvent(event);
        }
      }
    }

    buffer += decoder.decode();
    const trailingBlock = buffer.trim();
    if (trailingBlock) {
      const event = parseBridgeStreamEvent(trailingBlock);
      if (event) {
        onEvent(event);
      }
    }
  } finally {
    reader.releaseLock();
  }
}

function normalizeCoachExplanation(answer: string): { reasoning: string; fullReasoning: string } {
  const strippedAnswer = stripNotebookLmCitations(answer).trim();
  const explicitReasoning = strippedAnswer.match(/tai\s*sao\s*:\s*([\s\S]+)/i)?.[1];
  const normalizedReasoning = (explicitReasoning ?? strippedAnswer)
    .replace(/\s+/g, ' ')
    .trim();
  const reasoning = normalizedReasoning || 'Pro chon nuoc nay vi hop spot hien tai.';

  return {
    reasoning,
    fullReasoning: `Tai sao: ${reasoning}`,
  };
}

function chunkReasoningText(reasoning: string): string[] {
  const normalized = reasoning.replace(/\s+/g, ' ').trim();
  if (!normalized) {
    return [];
  }

  const words = normalized.split(' ');
  const chunks: string[] = [];
  let currentChunk = '';

  for (const word of words) {
    const candidate = currentChunk ? `${currentChunk} ${word}` : word;

    if (candidate.length <= 32 || currentChunk.length < 18) {
      currentChunk = candidate;
      continue;
    }

    chunks.push(currentChunk);
    currentChunk = word;
  }

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks;
}

async function callNotebookBridge(params: {
  requestId: string;
  coachId: string;
  notebookId: string;
  query: string;
  requestMode: string;
  cacheContext: string;
  sourceGroups?: string[];
  sourceIds?: string[];
}): Promise<BridgeResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), BRIDGE_FETCH_TIMEOUT_MS);

  try {
    const bridgeFetchStartedAt = performance.now();
    const response = await fetch(`${normalizeBridgeUrl(BRIDGE_URL)}/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-request-id': params.requestId,
      },
      body: JSON.stringify({
        query: params.query,
        api_key: BRIDGE_API_KEY,
        notebook_id: params.notebookId,
        coach_id: params.coachId,
        request_mode: params.requestMode,
        cache_context: params.cacheContext || undefined,
        source_groups: params.sourceGroups?.length ? params.sourceGroups : undefined,
        source_ids: params.sourceIds?.length ? params.sourceIds : undefined,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const bridgeFetchMs = Math.round((performance.now() - bridgeFetchStartedAt) * 100) / 100;
    const bridgeRequestId = response.headers.get('x-request-id') ?? params.requestId;
    const forwardedHeaders = getForwardedBridgeHeaders(response);

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      let bridgeError: { error?: unknown; detail?: unknown; code?: unknown; missingEnv?: unknown } | undefined;

      try {
        bridgeError = JSON.parse(errorText);
      } catch {
        bridgeError = undefined;
      }

      throw new BridgeRequestError(
        'NotebookLM bridge request failed',
        502,
        buildBridgeErrorPayload(response.status, errorText, bridgeError),
        bridgeRequestId,
        bridgeFetchMs,
        forwardedHeaders,
      );
    }

    const data = await response.json() as Record<string, unknown>;
    if (data.error) {
      throw new BridgeRequestError(
        'NotebookLM bridge returned an application error',
        502,
        {
          error: 'NotebookLM bridge returned an application error',
          detail: typeof data.detail === 'string' && data.detail ? data.detail : String(data.error),
          code: typeof data.code === 'string' ? data.code : undefined,
          missingEnv: Array.isArray(data.missingEnv) ? data.missingEnv : undefined,
        },
        bridgeRequestId,
        bridgeFetchMs,
        forwardedHeaders,
      );
    }

    const rawAnswer = data.answer || data.response || data.text || '';
    const answer = typeof rawAnswer === 'string'
      ? stripNotebookLmCitations(rawAnswer)
      : '';

    return {
      answer,
      bridgeRequestId,
      bridgeFetchMs,
      forwardedHeaders,
    };
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new BridgeTimeoutError();
    }

    throw error;
  }
}

async function streamNotebookBridge(
  params: {
    requestId: string;
    coachId: string;
    notebookId: string;
    query: string;
    sourceGroups?: string[];
    sourceIds?: string[];
  },
  onEvent: (event: BridgeStreamEvent) => void,
): Promise<{ bridgeRequestId: string; bridgeFetchMs: number }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), BRIDGE_FETCH_TIMEOUT_MS);

  try {
    const bridgeFetchStartedAt = performance.now();
    const response = await fetch(`${normalizeBridgeUrl(BRIDGE_URL)}/ask-stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
        'x-request-id': params.requestId,
      },
      body: JSON.stringify({
        query: params.query,
        api_key: BRIDGE_API_KEY,
        notebook_id: params.notebookId,
        coach_id: params.coachId,
        source_groups: params.sourceGroups?.length ? params.sourceGroups : undefined,
        source_ids: params.sourceIds?.length ? params.sourceIds : undefined,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const bridgeFetchMs = Math.round((performance.now() - bridgeFetchStartedAt) * 100) / 100;
    const bridgeRequestId = response.headers.get('x-request-id') ?? params.requestId;

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      let bridgeError: { error?: unknown; detail?: unknown; code?: unknown; missingEnv?: unknown } | undefined;

      try {
        bridgeError = JSON.parse(errorText);
      } catch {
        bridgeError = undefined;
      }

      throw new BridgeRequestError(
        'NotebookLM bridge stream request failed',
        502,
        buildBridgeErrorPayload(response.status, errorText, bridgeError),
        bridgeRequestId,
        bridgeFetchMs,
        {},
      );
    }

    const contentType = response.headers.get('content-type')?.toLowerCase() ?? '';
    if (!contentType.includes('text/event-stream')) {
      const data = await response.json() as Record<string, unknown>;
      const rawAnswer = data.answer || data.response || data.text || '';
      const answer = typeof rawAnswer === 'string'
        ? stripNotebookLmCitations(rawAnswer)
        : '';

      onEvent({ type: 'complete', answer });
      return {
        bridgeRequestId,
        bridgeFetchMs,
      };
    }

    if (!response.body) {
      throw new BridgeRequestError(
        'NotebookLM bridge stream response was empty',
        502,
        {
          error: 'NotebookLM bridge stream response was empty',
          detail: 'Expected a readable SSE body from /ask-stream.',
        },
        bridgeRequestId,
        bridgeFetchMs,
        {},
      );
    }

    await consumeBridgeEventStream(response.body, onEvent);
    return {
      bridgeRequestId,
      bridgeFetchMs,
    };
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new BridgeTimeoutError();
    }

    throw error;
  }
}

async function handleRequest(req: IncomingMessage, res: ServerResponse) {
  const requestId = getRequestId();
  const requestStartedAt = performance.now();
  const requestUrl = new URL(req.url || '/', `http://${req.headers.host || '127.0.0.1'}`);

  if (req.method === 'OPTIONS') {
    sendText(res, 200, 'ok');
    return;
  }

  if (req.method === 'GET' && (requestUrl.pathname === '/live' || requestUrl.pathname === '/health')) {
    sendJson(res, 200, { ok: true, mode: 'local-visian-chat', bridgeUrl: normalizeBridgeUrl(BRIDGE_URL) }, requestId);
    return;
  }

  if (req.method !== 'POST' || requestUrl.pathname !== FUNCTION_PATH) {
    sendJson(res, 404, { error: 'Not found' }, requestId);
    return;
  }

  try {
    const missingEnv = getMissingRuntimeEnv();
    if (missingEnv.length > 0) {
      sendJson(
        res,
        500,
        {
          error: 'NotebookLM bridge not configured',
          detail: `Missing required local env: ${missingEnv.join(', ')}`,
          missingEnv,
        },
        requestId,
      );
      return;
    }

    const body = await readJsonBody(req) as {
      coachId?: unknown;
      question?: unknown;
      gameContext?: unknown;
      mode?: unknown;
    };
    const question = typeof body.question === 'string' ? body.question : '';

    if (!question.trim()) {
      sendJson(res, 400, { error: 'Missing question' }, requestId);
      return;
    }

    const mode = typeof body.mode === 'string' ? body.mode : '';
    const isCoachSelectMode = mode === 'coach_select';
    const isCoachSelectStreamMode = mode === 'coach_select_stream';

    if ((isCoachSelectMode || isCoachSelectStreamMode) && !isValidCoachId(body.coachId)) {
      sendJson(res, 400, { error: 'Invalid coachId' }, requestId);
      return;
    }

    const resolvedCoachId = resolveCoachId(body.coachId);
    const notebookId = COACH_NOTEBOOK_IDS[resolvedCoachId];
    const typedGameContext = (body.gameContext || null) as GameContext | null;
    const sourceGroups = buildCoachSourceGroups(resolvedCoachId, typedGameContext);

    if (isCoachSelectStreamMode) {
      const proChoiceLabel = typedGameContext?.proChoiceLabel?.trim();
      if (!proChoiceLabel) {
        sendJson(res, 400, { error: 'Missing proChoiceLabel' }, requestId);
        return;
      }

      startSse(res, requestId);
      writeSseEvent(res, 'pick', {
        pick: proChoiceLabel,
        pickId: typedGameContext?.proChoiceId,
      });
      writeSseEvent(res, 'status', { phase: 'thinking' });

      try {
        let streamedAnswer = '';

        await streamNotebookBridge(
          {
            requestId,
            coachId: resolvedCoachId,
            notebookId,
            query: buildCoachExplainQuery(resolvedCoachId, question, typedGameContext),
            sourceGroups,
          },
          (event) => {
            if (event.type === 'chunk' && event.text.trim()) {
              writeSseEvent(res, 'upstream_chunk', { text: event.text });
              return;
            }

            if (event.type === 'complete') {
              streamedAnswer = event.answer;
              return;
            }

            if (event.type === 'error') {
              throw new BridgeRequestError(
                'NotebookLM bridge returned an application error',
                502,
                event.payload,
                requestId,
                0,
                {},
              );
            }
          },
        );

        writeSseEvent(res, 'status', { phase: 'explaining' });

        const { reasoning, fullReasoning } = normalizeCoachExplanation(streamedAnswer);
        for (const chunk of chunkReasoningText(reasoning)) {
          writeSseEvent(res, 'reasoning_chunk', { text: chunk });
        }

        writeSseEvent(res, 'complete', { reasoning: fullReasoning });
        endSse(res);
        console.info('local visian-chat stream request completed', {
          request_id: requestId,
          coach_id: resolvedCoachId,
          notebook_id: notebookId,
          total_ms: Math.round((performance.now() - requestStartedAt) * 100) / 100,
          status: 200,
        });
        return;
      } catch (error) {
        console.error('local visian-chat stream error', {
          request_id: requestId,
          coach_id: resolvedCoachId,
          notebook_id: notebookId,
          total_ms: Math.round((performance.now() - requestStartedAt) * 100) / 100,
          error: error instanceof Error ? error.message : String(error),
        });
        writeSseEvent(res, 'error', { message: DEFAULT_STREAM_ERROR_MESSAGE });
        endSse(res);
        return;
      }
    }

    const shouldExplainAuthoritativeChoice = isCoachSelectMode && Boolean(typedGameContext?.proChoiceLabel?.trim());
    const query = shouldExplainAuthoritativeChoice
      ? buildCoachExplainQuery(resolvedCoachId, question, typedGameContext)
      : buildCoachSelectQuery(resolvedCoachId, question, typedGameContext);
    const requestMode = isCoachSelectMode ? 'coach_select' : 'default';
    const cacheContext = isCoachSelectMode
      ? serializeCoachCacheContext(typedGameContext)
      : '';

    const bridgeResult = await callNotebookBridge({
      requestId,
      coachId: resolvedCoachId,
      notebookId,
      query,
      requestMode,
      cacheContext,
      sourceGroups,
    });

    console.info('local visian-chat request completed', {
      request_id: requestId,
      coach_id: resolvedCoachId,
      notebook_id: notebookId,
      bridge_fetch_ms: bridgeResult.bridgeFetchMs,
      total_ms: Math.round((performance.now() - requestStartedAt) * 100) / 100,
      status: 200,
    });

    sendJson(
      res,
      200,
      { answer: bridgeResult.answer },
      requestId,
      bridgeResult.forwardedHeaders,
    );
  } catch (error) {
    if (error instanceof BridgeTimeoutError) {
      sendJson(res, 504, { error: 'NotebookLM bridge timeout, thu lai sau nhe!' }, requestId);
      return;
    }

    if (error instanceof BridgeRequestError) {
      sendJson(res, error.status, error.payload, requestId, error.forwardedHeaders);
      return;
    }

    console.error('local visian-chat unhandled error', {
      request_id: requestId,
      error: error instanceof Error ? error.message : String(error),
    });
    sendJson(res, 500, { error: error instanceof Error ? error.message : 'Unknown error' }, requestId);
  }
}

const server = createServer((req, res) => {
  void handleRequest(req, res);
});

server.listen(PORT, HOST, () => {
  console.info('Local visian-chat server listening', {
    host: HOST,
    port: PORT,
    function_url: `http://${HOST}:${PORT}${FUNCTION_PATH}`,
    live_url: `http://${HOST}:${PORT}/live`,
    bridge_url: normalizeBridgeUrl(BRIDGE_URL),
  });
});
