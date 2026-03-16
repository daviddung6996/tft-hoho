import { COACHES_BY_ID } from './coachSelect.data';
import type {
    CoachAskResponse,
    CoachGameContext,
    CoachId,
    CoachStreamEvent,
} from './coachSelect.types';
import { getVisianChatHeaders, getVisianChatUrl } from '../../lib/visianChat';

class CoachSelectUnavailableError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'CoachSelectUnavailableError';
    }
}

function buildCoachUnavailableMessage(coachId: CoachId): string {
    const coachName = COACHES_BY_ID[coachId]?.displayName ?? 'Coach';
    return `${coachName} đang bận train, thử lại sau nha.`;
}

async function readFunctionErrorDetail(error: unknown): Promise<string | null> {
    if (!error || typeof error !== 'object') {
        return null;
    }

    const maybeError = error as {
        message?: unknown;
        context?: unknown;
    };
    const message = typeof maybeError.message === 'string' ? maybeError.message.trim() : '';
    const contextMessage = maybeError.context
        && typeof maybeError.context === 'object'
        && 'message' in maybeError.context
        && typeof maybeError.context.message === 'string'
        ? maybeError.context.message.trim()
        : '';
    const response = typeof Response !== 'undefined' && maybeError.context instanceof Response
        ? maybeError.context
        : null;

    if (!response) {
        return [message, contextMessage].filter(Boolean).join(' | ') || null;
    }

    return readResponseErrorDetail(response, message);
}

async function readResponseErrorDetail(response: Response, messagePrefix = ''): Promise<string | null> {
    try {
        const payload = await response.clone().json() as {
            error?: unknown;
            detail?: unknown;
            missingEnv?: unknown;
        };
        const missingEnvDetail = Array.isArray(payload.missingEnv)
            ? payload.missingEnv
                .filter((part): part is string => typeof part === 'string' && part.trim().length > 0)
                .join(', ')
            : '';
        const responseDetail = [
            payload.error,
            payload.detail,
            missingEnvDetail ? `missingEnv=${missingEnvDetail}` : '',
        ]
            .filter((part): part is string => typeof part === 'string' && part.trim().length > 0)
            .join(' | ');

        if (responseDetail) {
            return [messagePrefix, responseDetail].filter(Boolean).join(' | ');
        }
    } catch {
        // JSON error body is optional.
    }

    try {
        const responseText = (await response.clone().text()).trim();
        if (responseText) {
            return [messagePrefix, responseText].filter(Boolean).join(' | ');
        }
    } catch {
        // Response body may be unreadable; fall through to status/message.
    }

    return [messagePrefix, `HTTP ${response.status}`].filter(Boolean).join(' | ') || null;
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

function parseCoachStreamEvent(block: string): CoachStreamEvent | null {
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
        case 'pick':
            return typeof data.pick === 'string' && data.pick.trim()
                ? {
                    type: 'pick',
                    pick: data.pick.trim(),
                    pickId: typeof data.pickId === 'string' ? data.pickId : undefined,
                }
                : null;
        case 'status':
            return data.phase === 'thinking' || data.phase === 'explaining'
                ? { type: 'status', phase: data.phase }
                : null;
        case 'reasoning_chunk':
            return typeof data.text === 'string'
                ? { type: 'reasoning_chunk', text: data.text }
                : null;
        case 'upstream_chunk':
            return typeof data.text === 'string'
                ? { type: 'upstream_chunk', text: data.text }
                : null;
        case 'complete':
            return typeof data.reasoning === 'string'
                ? { type: 'complete', reasoning: data.reasoning }
                : null;
        case 'error':
            return typeof data.message === 'string' && data.message.trim()
                ? { type: 'error', message: data.message.trim() }
                : null;
        default:
            return null;
    }
}

async function consumeCoachEventStream(
    stream: ReadableStream<Uint8Array>,
    onEvent: (event: CoachStreamEvent) => void,
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
                const event = parseCoachStreamEvent(block);
                if (event) {
                    onEvent(event);
                }
            }
        }

        buffer += decoder.decode();
        const trailingBlock = buffer.trim();
        if (trailingBlock) {
            const event = parseCoachStreamEvent(trailingBlock);
            if (event) {
                onEvent(event);
            }
        }
    } finally {
        reader.releaseLock();
    }
}

async function consumeLegacyJsonCoachResponse(
    response: Response,
    onEvent: (event: CoachStreamEvent) => void,
): Promise<void> {
    const payload = await response.json() as {
        answer?: unknown;
    };
    const answer = typeof payload.answer === 'string'
        ? payload.answer.trim()
        : '';

    if (!answer) {
        throw new Error('Legacy JSON coach stream response was empty');
    }

    onEvent({
        type: 'complete',
        reasoning: answer,
    });
}

async function readAnswerResponse(response: Response): Promise<CoachAskResponse> {
    const data = await response.json() as { answer?: unknown };
    const answer = typeof data.answer === 'string'
        ? data.answer.trim()
        : '';

    return { answer };
}

export const coachSelectService = {
    async askCoach(
        coachId: CoachId,
        question: string,
        gameContext: CoachGameContext | null,
        signal?: AbortSignal,
    ): Promise<CoachAskResponse> {
        const unavailableMessage = buildCoachUnavailableMessage(coachId);
        const requestStartedAt = performance.now();

        try {
            const response = await fetch(getVisianChatUrl(), {
                method: 'POST',
                headers: getVisianChatHeaders(),
                body: JSON.stringify({
                    coachId,
                    question,
                    gameContext,
                    mode: 'coach_select',
                }),
                signal,
            });

            if (!response.ok) {
                const errorDetail = await readResponseErrorDetail(response);
                console.error('Coach select HTTP error:', {
                    coachId,
                    status: response.status,
                    errorDetail,
                });
                throw new CoachSelectUnavailableError(unavailableMessage);
            }

            const result = await readAnswerResponse(response);
            if (!result.answer) {
                console.error('Coach select returned empty answer:', {
                    coachId,
                });
                throw new CoachSelectUnavailableError(unavailableMessage);
            }

            const elapsedMs = Math.round((performance.now() - requestStartedAt) * 100) / 100;
            if (import.meta.env.DEV && elapsedMs > 3000) {
                console.warn('Coach select slow response:', {
                    coachId,
                    elapsedMs,
                    bridgeCache: response.headers.get('x-bridge-cache'),
                    bridgeTotalMs: response.headers.get('x-bridge-total-ms'),
                });
            }

            return result;
        } catch (error) {
            if (error instanceof CoachSelectUnavailableError) {
                throw error;
            }

            if (error instanceof DOMException && error.name === 'AbortError') {
                throw error;
            }

            const errorDetail = await readFunctionErrorDetail(error);
            console.error('Coach select request failed:', {
                coachId,
                error,
                errorDetail,
            });
            throw new CoachSelectUnavailableError(unavailableMessage);
        }
    },

    async streamCoachExplanation(
        coachId: CoachId,
        question: string,
        gameContext: CoachGameContext | null,
        onEvent: (event: CoachStreamEvent) => void,
        signal?: AbortSignal,
    ): Promise<void> {
        const unavailableMessage = buildCoachUnavailableMessage(coachId);

        try {
            const response = await fetch(getVisianChatUrl(), {
                method: 'POST',
                headers: getVisianChatHeaders({
                    Accept: 'text/event-stream',
                }),
                body: JSON.stringify({
                    coachId,
                    question,
                    gameContext,
                    mode: 'coach_select_stream',
                }),
                signal,
            });

            if (!response.ok) {
                const errorDetail = await readResponseErrorDetail(response);
                console.error('Coach select stream HTTP error:', {
                    coachId,
                    status: response.status,
                    errorDetail,
                });
                throw new CoachSelectUnavailableError(unavailableMessage);
            }

            if (!response.body) {
                console.error('Coach select stream missing body:', { coachId });
                throw new CoachSelectUnavailableError(unavailableMessage);
            }

            const contentType = response.headers.get('Content-Type')?.toLowerCase() ?? '';
            if (!contentType.includes('text/event-stream')) {
                await consumeLegacyJsonCoachResponse(response, onEvent);
                return;
            }

            await consumeCoachEventStream(response.body, onEvent);
        } catch (error) {
            if (error instanceof CoachSelectUnavailableError) {
                throw error;
            }

            console.error('Coach select stream failed:', {
                coachId,
                error,
            });
            throw new CoachSelectUnavailableError(unavailableMessage);
        }
    },
};
