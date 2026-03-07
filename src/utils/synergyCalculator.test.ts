import { describe, expect, it } from 'vitest';
import { calculateSynergies } from './synergyCalculator';
import type { Champion, UnitData } from '../data/types';
import type { Trait } from '../services/traitService';

describe('calculateSynergies', () => {
    it('ignores units with missing names instead of throwing', () => {
        const champions: Champion[] = [
            {
                id: 'ahri',
                name: 'Ahri',
                cost: 2,
                traits: ['Sorcerer'],
                stars: 1,
                icon: '',
            },
        ];

        const traits = [
            {
                id: 'sorcerer',
                name: 'Phap Su',
                name_en: 'Sorcerer',
                description: '',
                effects: { '2': { style: 1 } },
                icon: '',
            },
        ] as Trait[];

        const units = [
            { id: '1', name: undefined, row: 0, col: 0, cost: 1, stars: 1, image: '' },
            { id: '2', name: 'Ahri', row: 0, col: 1, cost: 2, stars: 1, image: '' },
        ] as unknown as UnitData[];

        expect(() => calculateSynergies({ units, championData: champions, traitData: traits })).not.toThrow();
        expect(calculateSynergies({ units, championData: champions, traitData: traits })).toEqual([
            expect.objectContaining({
                id: 'sorcerer',
                name: 'Phap Su',
                activeCount: 1,
            }),
        ]);
    });
});
