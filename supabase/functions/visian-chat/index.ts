/// <reference path="../types.d.ts" />

import {
  COACH_NOTEBOOK_IDS,
  buildCoachSourceGroups,
  buildCoachExplainQuery,
  buildCoachSelectQuery,
  isValidCoachId,
  resolveCoachId,
  serializeCoachCacheContext,
  type GameContext,
} from './prompt.ts';
import { stripNotebookLmCitations } from './answer.ts';

const NOTEBOOKLM_BRIDGE_URL = Deno.env.get('NOTEBOOKLM_BRIDGE_URL');
const NOTEBOOKLM_BRIDGE_API_KEY = Deno.env.get('NOTEBOOKLM_BRIDGE_API_KEY');

const DEFAULT_BRIDGE_FETCH_TIMEOUT_MS = 100_000;
const DEFAULT_STREAM_ERROR_MESSAGE = 'Coach đang bận train, thử lại sau nha.';
const SSE_KEEPALIVE_INTERVAL_MS = 10_000;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
  bridgeCache: string | null;
};

class BridgeRequestError extends Error {
  status: number;
  payload: BridgeErrorPayload;
  bridgeRequestId: string;
  bridgeFetchMs: number;
  forwardedHeaders: Record<string, string>;

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

function getMissingRuntimeEnv(): string[] {
  const missing: string[] = [];

  if (!NOTEBOOKLM_BRIDGE_URL) missing.push('NOTEBOOKLM_BRIDGE_URL');
  if (!NOTEBOOKLM_BRIDGE_API_KEY) missing.push('NOTEBOOKLM_BRIDGE_API_KEY');

  return missing;
}

function getBridgeFetchTimeoutMs(): number {
  const raw = Deno.env.get('BRIDGE_FETCH_TIMEOUT_MS');
  if (!raw) return DEFAULT_BRIDGE_FETCH_TIMEOUT_MS;

  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_BRIDGE_FETCH_TIMEOUT_MS;
}

function normalizeBridgeUrl(url: string): string {
  return url.replace(/\/+$/, '');
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

function jsonResponse(body: unknown, status = 200, requestId?: string): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
      ...(requestId ? { 'x-request-id': requestId } : {}),
    },
  });
}

function jsonResponseWithHeaders(
  body: unknown,
  status = 200,
  requestId?: string,
  extraHeaders?: Record<string, string>,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
      ...(requestId ? { 'x-request-id': requestId } : {}),
      ...(extraHeaders ?? {}),
    },
  });
}

function sseResponse(stream: ReadableStream<Uint8Array>, requestId: string): Response {
  return new Response(stream, {
    status: 200,
    headers: {
      ...corsHeaders,
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'x-request-id': requestId,
    },
  });
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

function formatSseEvent(event: string, data: Record<string, unknown>): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

function formatSseComment(comment: string): string {
  return `: ${comment}\n\n`;
}

type BridgeStreamEvent =
  | { type: 'status'; phase: string }
  | { type: 'chunk'; text: string }
  | { type: 'complete'; answer: string; totalMs?: number }
  | { type: 'error'; payload: BridgeErrorPayload };

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
    .map(line => line.trimEnd())
    .filter(line => line.length > 0);

  if (lines.length === 0 || lines.every(line => line.startsWith(':'))) {
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
    case 'status':
      return typeof data.phase === 'string'
        ? { type: 'status', phase: data.phase }
        : null;
    case 'chunk':
      return typeof data.text === 'string'
        ? { type: 'chunk', text: data.text }
        : null;
    case 'complete':
      return typeof data.answer === 'string'
        ? {
          type: 'complete',
          answer: data.answer,
          totalMs: typeof data.total_ms === 'number' ? data.total_ms : undefined,
        }
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
  const explicitReasoning = strippedAnswer.match(/(?:giai\s*thich|giải\s*thích|tai\s*sao)\s*:\s*([\s\S]+)/i)?.[1];
  const normalizedReasoning = (explicitReasoning ?? strippedAnswer)
    .replace(/\s+/g, ' ')
    .trim();
  const reasoning = normalizedReasoning || 'Pro chọn nước này vì hợp spot hiện tại.';

  return {
    reasoning,
    fullReasoning: `Giai thich: ${reasoning}`,
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
  const timeoutId = setTimeout(() => controller.abort(), getBridgeFetchTimeoutMs());

  try {
    const bridgeFetchStartedAt = performance.now();
    const response = await fetch(`${normalizeBridgeUrl(NOTEBOOKLM_BRIDGE_URL!)}/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-request-id': params.requestId,
      },
      body: JSON.stringify({
        query: params.query,
        api_key: NOTEBOOKLM_BRIDGE_API_KEY,
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

    const data = await response.json();
    if (data?.error) {
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
      bridgeCache: response.headers.get('x-bridge-cache'),
    };
  } catch (err) {
    clearTimeout(timeoutId);

    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new BridgeTimeoutError();
    }

    throw err;
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
  const timeoutId = setTimeout(() => controller.abort(), getBridgeFetchTimeoutMs());

  try {
    const bridgeFetchStartedAt = performance.now();
    const response = await fetch(`${normalizeBridgeUrl(NOTEBOOKLM_BRIDGE_URL!)}/ask-stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
        'x-request-id': params.requestId,
      },
      body: JSON.stringify({
        query: params.query,
        api_key: NOTEBOOKLM_BRIDGE_API_KEY,
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
  } catch (err) {
    clearTimeout(timeoutId);

    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new BridgeTimeoutError();
    }

    throw err;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID();
  const requestStartedAt = performance.now();

  try {
    const missingEnv = getMissingRuntimeEnv();
    if (missingEnv.length > 0) {
      console.error('visian-chat missing runtime env', {
        request_id: requestId,
        missing_env: missingEnv,
        status: 500,
      });
      return jsonResponse(
        {
          error: 'NotebookLM bridge not configured',
          detail: `Missing required Edge Function secrets: ${missingEnv.join(', ')}`,
          missingEnv,
        },
        500,
        requestId,
      );
    }

    const { coachId, question, gameContext, mode } = await req.json();

    if (!question || typeof question !== 'string') {
      return jsonResponse({ error: 'Missing question' }, 400, requestId);
    }

    const isCoachSelectMode = mode === 'coach_select';
    const isCoachSelectStreamMode = mode === 'coach_select_stream';
    if ((isCoachSelectMode || isCoachSelectStreamMode) && !isValidCoachId(coachId)) {
      return jsonResponse({ error: 'Invalid coachId' }, 400, requestId);
    }

    const resolvedCoachId = resolveCoachId(coachId);
    const notebookId = COACH_NOTEBOOK_IDS[resolvedCoachId];
    const typedGameContext = (gameContext || null) as GameContext | null;
    const sourceGroups = buildCoachSourceGroups(resolvedCoachId, typedGameContext);

    if (isCoachSelectStreamMode) {
      const proChoiceLabel = typedGameContext?.proChoiceLabel?.trim();
      if (!proChoiceLabel) {
        return jsonResponse({ error: 'Missing proChoiceLabel' }, 400, requestId);
      }

      const query = buildCoachExplainQuery(resolvedCoachId, question, typedGameContext);
      const cacheContext = serializeCoachCacheContext(typedGameContext);
      const encoder = new TextEncoder();

      let keepAliveTimer: number | null = null;

      const stream = new ReadableStream<Uint8Array>({
        start(controller) {
          const enqueueText = (value: string) => {
            controller.enqueue(encoder.encode(value));
          };

          const stopKeepAlive = () => {
            if (keepAliveTimer !== null) {
              clearInterval(keepAliveTimer);
              keepAliveTimer = null;
            }
          };

          const safeClose = () => {
            stopKeepAlive();
            try {
              controller.close();
            } catch {
              // Ignore double-close or closed-stream races.
            }
          };

          const sendEvent = (event: string, data: Record<string, unknown>) => {
            enqueueText(formatSseEvent(event, data));
          };

          const sendError = (message: string) => {
            try {
              sendEvent('error', { message });
            } finally {
              safeClose();
            }
          };

          void (async () => {
            try {
              sendEvent('pick', {
                pick: proChoiceLabel,
                pickId: typedGameContext?.proChoiceId,
              });
              sendEvent('status', { phase: 'thinking' });

              keepAliveTimer = setInterval(() => {
                try {
                  enqueueText(formatSseComment('ping'));
                } catch {
                  stopKeepAlive();
                }
              }, SSE_KEEPALIVE_INTERVAL_MS) as unknown as number;

              let streamedAnswer = '';
              const bridgeStreamMeta = await streamNotebookBridge(
                {
                  requestId,
                  coachId: resolvedCoachId,
                  notebookId,
                  query,
                  sourceGroups,
                },
                (event) => {
                  if (event.type === 'chunk' && event.text.trim()) {
                    sendEvent('upstream_chunk', { text: event.text });
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

              stopKeepAlive();

              sendEvent('status', { phase: 'explaining' });
              const { reasoning, fullReasoning } = normalizeCoachExplanation(streamedAnswer);
              const chunks = chunkReasoningText(reasoning);

              for (const chunk of chunks) {
                sendEvent('reasoning_chunk', { text: chunk });
              }

              sendEvent('complete', { reasoning: fullReasoning });

              console.info('visian-chat stream request completed', {
                request_id: requestId,
                bridge_request_id: bridgeStreamMeta.bridgeRequestId,
                coach_id: resolvedCoachId,
                notebook_id: notebookId,
                bridge_fetch_ms: bridgeStreamMeta.bridgeFetchMs,
                total_ms: Math.round((performance.now() - requestStartedAt) * 100) / 100,
                status: 200,
              });

              safeClose();
            } catch (err) {
              stopKeepAlive();

              if (err instanceof BridgeTimeoutError) {
                console.error('visian-chat stream bridge timeout', {
                  request_id: requestId,
                  coach_id: resolvedCoachId,
                  notebook_id: notebookId,
                  total_ms: Math.round((performance.now() - requestStartedAt) * 100) / 100,
                  status: 504,
                });
                sendError(DEFAULT_STREAM_ERROR_MESSAGE);
                return;
              }

              if (err instanceof BridgeRequestError) {
                console.error('visian-chat stream bridge error', {
                  request_id: requestId,
                  bridge_request_id: err.bridgeRequestId,
                  coach_id: resolvedCoachId,
                  notebook_id: notebookId,
                  bridge_fetch_ms: err.bridgeFetchMs,
                  total_ms: Math.round((performance.now() - requestStartedAt) * 100) / 100,
                  status: err.status,
                  detail: err.payload.detail,
                });
                sendError(DEFAULT_STREAM_ERROR_MESSAGE);
                return;
              }

              console.error('visian-chat stream unhandled error', {
                request_id: requestId,
                coach_id: resolvedCoachId,
                total_ms: Math.round((performance.now() - requestStartedAt) * 100) / 100,
                status: 500,
                error: (err as Error).message,
              });
              sendError(DEFAULT_STREAM_ERROR_MESSAGE);
            }
          })();
        },
        cancel() {
          if (keepAliveTimer !== null) {
            clearInterval(keepAliveTimer);
            keepAliveTimer = null;
          }
        },
      });

      return sseResponse(stream, requestId);
    }

    const query = buildCoachSelectQuery(resolvedCoachId, question, typedGameContext);
    const requestMode = isCoachSelectMode ? 'coach_select' : 'default';
    const cacheContext = isCoachSelectMode
      ? serializeCoachCacheContext(typedGameContext)
      : '';

    try {
      const bridgeResult = await callNotebookBridge({
        requestId,
        coachId: resolvedCoachId,
        notebookId,
        query,
        requestMode,
        cacheContext,
        sourceGroups,
      });

      console.info('visian-chat request completed', {
        request_id: requestId,
        bridge_request_id: bridgeResult.bridgeRequestId,
        coach_id: resolvedCoachId,
        notebook_id: notebookId,
        bridge_fetch_ms: bridgeResult.bridgeFetchMs,
        total_ms: Math.round((performance.now() - requestStartedAt) * 100) / 100,
        status: 200,
      });

      return jsonResponseWithHeaders(
        { answer: bridgeResult.answer },
        200,
        requestId,
        bridgeResult.forwardedHeaders,
      );
    } catch (err) {
      if (err instanceof BridgeTimeoutError) {
        console.error('visian-chat bridge timeout', {
          request_id: requestId,
          coach_id: resolvedCoachId,
          notebook_id: notebookId,
          total_ms: Math.round((performance.now() - requestStartedAt) * 100) / 100,
          status: 504,
        });
        return jsonResponse({ error: 'NotebookLM bridge timeout, thu lai sau nhe!' }, 504, requestId);
      }

      if (err instanceof BridgeRequestError) {
        console.error('visian-chat bridge error', {
          request_id: requestId,
          bridge_request_id: err.bridgeRequestId,
          coach_id: resolvedCoachId,
          notebook_id: notebookId,
          bridge_fetch_ms: err.bridgeFetchMs,
          total_ms: Math.round((performance.now() - requestStartedAt) * 100) / 100,
          status: err.status,
          detail: err.payload.detail,
        });

        return jsonResponseWithHeaders(
          err.payload,
          err.status,
          requestId,
          err.forwardedHeaders,
        );
      }

      throw err;
    }
  } catch (err) {
    console.error('visian-chat unhandled error', {
      request_id: requestId,
      total_ms: Math.round((performance.now() - requestStartedAt) * 100) / 100,
      status: 500,
      error: (err as Error).message,
    });
    return jsonResponse({ error: (err as Error).message }, 500, requestId);
  }
});
