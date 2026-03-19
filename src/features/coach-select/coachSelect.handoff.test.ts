import { afterEach, describe, expect, it, vi } from 'vitest';
import { resolveCoachDeepDiveUrl } from './coachSelect.handoff';

describe('resolveCoachDeepDiveUrl', () => {
    afterEach(() => {
        vi.unstubAllEnvs();
    });

    it('returns the built-in NotebookLM notebook for each coach by default', () => {
        expect(resolveCoachDeepDiveUrl('visian')).toBe(
            'https://notebooklm.google.com/notebook/2c208255-a880-48db-924d-f106cd340256/preview',
        );
        expect(resolveCoachDeepDiveUrl('dit_sap')).toBe(
            'https://notebooklm.google.com/notebook/87d04732-612e-4000-8d67-599a2fafd700/preview',
        );
        expect(resolveCoachDeepDiveUrl('one_by_one')).toBe(
            'https://notebooklm.google.com/notebook/cb28f7a2-cf9b-4ec4-b39b-162b2707ea55/preview',
        );
        expect(resolveCoachDeepDiveUrl('buffalow')).toBe(
            'https://notebooklm.google.com/notebook/c348c743-20c5-421e-b909-9a1b82873e28/preview',
        );
        expect(resolveCoachDeepDiveUrl('tftiseasy')).toBe(
            'https://notebooklm.google.com/notebook/06f9ca46-d3bc-4040-8d57-3afe462a362d/preview',
        );
    });

    it('prefers a coach-specific env override when present', () => {
        vi.stubEnv('VITE_NOTEBOOKLM_VISIAN_DEEP_DIVE_URL', 'https://notebooklm.google.com/notebook/custom-visian');
        vi.stubEnv('VITE_NOTEBOOKLM_DEEP_DIVE_URL', 'https://example.com/shared');

        expect(resolveCoachDeepDiveUrl('visian')).toBe('https://notebooklm.google.com/notebook/custom-visian/preview');
    });

    it('does not let the shared env override the built-in coach mapping', () => {
        vi.stubEnv('VITE_NOTEBOOKLM_DEEP_DIVE_URL', 'https://example.com/shared');

        expect(resolveCoachDeepDiveUrl('buffalow')).toBe(
            'https://notebooklm.google.com/notebook/c348c743-20c5-421e-b909-9a1b82873e28/preview',
        );
    });
});
