import { describe, expect, it } from 'vitest';
import { deriveCoachCompLabel } from './coachSelect.utils';

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
