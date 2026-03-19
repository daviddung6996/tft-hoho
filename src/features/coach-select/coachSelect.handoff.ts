import type { CoachId } from './coachSelect.types';

export const COACH_DEEP_DIVE_CTA =
    'Hỏi sâu hơn với NotebookLM đã tổng hợp hàng trăm tài liệu + góc nhìn Pro.';

const DEFAULT_NOTEBOOKLM_DEEP_DIVE_URL = 'https://notebooklm.google.com/';
const DEFAULT_NOTEBOOKLM_DEEP_DIVE_URLS: Record<CoachId, string> = {
    visian: 'https://notebooklm.google.com/notebook/2c208255-a880-48db-924d-f106cd340256/preview',
    dit_sap: 'https://notebooklm.google.com/notebook/87d04732-612e-4000-8d67-599a2fafd700/preview',
    one_by_one: 'https://notebooklm.google.com/notebook/cb28f7a2-cf9b-4ec4-b39b-162b2707ea55/preview',
    buffalow: 'https://notebooklm.google.com/notebook/c348c743-20c5-421e-b909-9a1b82873e28/preview',
    tftiseasy: 'https://notebooklm.google.com/notebook/06f9ca46-d3bc-4040-8d57-3afe462a362d/preview',
};

const COACH_DEEP_DIVE_ENV_KEYS: Record<CoachId, string> = {
    visian: 'VITE_NOTEBOOKLM_VISIAN_DEEP_DIVE_URL',
    dit_sap: 'VITE_NOTEBOOKLM_DIT_SAP_DEEP_DIVE_URL',
    one_by_one: 'VITE_NOTEBOOKLM_ONE_BY_ONE_DEEP_DIVE_URL',
    buffalow: 'VITE_NOTEBOOKLM_BUFFALOW_DEEP_DIVE_URL',
    tftiseasy: 'VITE_NOTEBOOKLM_TFTISEASY_DEEP_DIVE_URL',
};

function normalizeExternalUrl(rawUrl: string | undefined): string | null {
    const trimmed = rawUrl?.trim();
    if (!trimmed) {
        return null;
    }

    try {
        const url = new URL(trimmed);
        const normalizedPath = url.pathname.replace(/\/+$/, '');

        if (/^\/notebook\/[^/]+$/i.test(normalizedPath) && /(^|\.)notebooklm\.google\.com$/i.test(url.hostname)) {
            url.pathname = `${normalizedPath}/preview`;
            return url.toString();
        }

        if (/^\/notebook\/[^/]+\/preview$/i.test(normalizedPath) && /(^|\.)notebooklm\.google\.com$/i.test(url.hostname)) {
            url.pathname = normalizedPath;
            return url.toString();
        }
    } catch {
        // Keep non-URL strings untouched; callers decide whether they are valid enough to use.
    }

    return trimmed;
}

export function resolveCoachDeepDiveUrl(coachId: CoachId): string {
    const env = import.meta.env as Record<string, string | undefined>;
    const coachSpecific = normalizeExternalUrl(env[COACH_DEEP_DIVE_ENV_KEYS[coachId]]);
    if (coachSpecific) {
        return coachSpecific;
    }

    const defaultCoachUrl = normalizeExternalUrl(DEFAULT_NOTEBOOKLM_DEEP_DIVE_URLS[coachId]);
    if (defaultCoachUrl) {
        return defaultCoachUrl;
    }

    const sharedUrl = normalizeExternalUrl(env.VITE_NOTEBOOKLM_DEEP_DIVE_URL);
    if (sharedUrl) {
        return sharedUrl;
    }

    return DEFAULT_NOTEBOOKLM_DEEP_DIVE_URL;
}
