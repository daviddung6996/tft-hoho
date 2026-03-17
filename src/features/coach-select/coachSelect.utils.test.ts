import { describe, expect, it } from 'vitest';
import { buildCoachAnswerCacheKey, buildCoachContextSignature, deriveCoachCompLabel } from './coachSelect.utils';
import type { CoachGameContext } from './coachSelect.types';

describe('deriveCoachCompLabel', () => {
    it('prefers top two active synergies by count', () => {
        const result = deriveCoachCompLabel(
            [
                { id: '1', name: 'Invoker', breakpoints: [2, 4], activeCount: 2, icon: '' },
                { id: '2', name: 'Bruiser', breakpoints: [2, 4, 6], activeCount: 4, icon: '' },
                { id: '3', name: 'Scholar', breakpoints: [2, 4], activeCount: 1, icon: '' },
            ],
            ['Lissandra', 'Rumble'],
        );

        expect(result).toBe('Bruiser / Invoker');
    });

    it('falls back to first two board champions when there are no active synergies', () => {
        const result = deriveCoachCompLabel([], ['Maddie', 'Jhin', 'Nautilus']);
        expect(result).toBe('Maddie / Jhin');
    });

    it('falls back to Open Board when nothing is available', () => {
        const result = deriveCoachCompLabel([], []);
        expect(result).toBe('Open Board');
    });
});

const baseContext: CoachGameContext = {
    stage: '3-2',
    comp: 'Faerie / Mage',
    gold: 24,
    level: 6,
    hp: 72,
    decisionType: 'augment',
    currentAugments: ['Featherweights III'],
    currentAugmentOptions: [
        { id: 'featherweights-3', title: 'Featherweights III', icon: '/fw.png', tier: 2 as const },
    ],
    chosenAugments: ['Starter Kit'],
    synergies: ['Faerie', 'Mage'],
    boardChampions: ['Lux'],
    items: ['Jeweled Gauntlet'],
};

describe('buildCoachContextSignature', () => {
    it('returns no-context for null', () => {
        expect(buildCoachContextSignature(null)).toBe('no-context');
    });

    it('produces a deterministic signature from game context', () => {
        const sig1 = buildCoachContextSignature(baseContext);
        const sig2 = buildCoachContextSignature({ ...baseContext });
        expect(sig1).toBe(sig2);
    });

    it('changes when gold changes', () => {
        const sig1 = buildCoachContextSignature(baseContext);
        const sig2 = buildCoachContextSignature({ ...baseContext, gold: 30 });
        expect(sig1).not.toBe(sig2);
    });
});

describe('buildCoachAnswerCacheKey', () => {
    it('returns null when puzzleId is null', () => {
        expect(buildCoachAnswerCacheKey(null, 'visian', 'sig')).toBeNull();
    });

    it('builds key from puzzleId, coachId, and signature', () => {
        expect(buildCoachAnswerCacheKey('p1', 'visian', 'sig')).toBe('p1:visian:sig');
    });
});
