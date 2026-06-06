import { describe, expect, it } from 'vitest';
import {
    REALM_GODS,
    REALM_GODS_PER_GAME,
    STARGAZER_CONSTELLATIONS,
    getRandomGods,
} from './gameInfoData';

describe('gameInfoData', () => {
    it('ships the official Set 17 Stargazer constellations only', () => {
        expect(STARGAZER_CONSTELLATIONS.map(constellation => constellation.name)).toEqual(
            expect.arrayContaining([
                'The Serpent',
                'The Huntress',
                'The Mountain',
                'The Altar',
                'The Medallion',
                'The Fountain',
                'The Boar',
            ]),
        );
        expect(STARGAZER_CONSTELLATIONS.map(constellation => constellation.name)).not.toContain('Path of Blades');
        expect(STARGAZER_CONSTELLATIONS).toHaveLength(7);
    });

    it('ships the official Set 17 Realm of the Gods roster only', () => {
        expect(REALM_GODS.map(god => god.name)).toEqual(
            expect.arrayContaining([
                'Ahri',
                'Aurelion Sol',
                'Ekko',
                'Evelynn',
                'Kayle',
                'Soraka',
                'Thresh',
                'Varus',
                'Yasuo',
            ]),
        );
        expect(REALM_GODS.map(god => god.name)).not.toContain('God of Fortune');
        expect(REALM_GODS).toHaveLength(9);
    });

    it('rolls 2 distinct gods for a game', () => {
        const gods = getRandomGods(REALM_GODS_PER_GAME);

        expect(gods).toHaveLength(REALM_GODS_PER_GAME);
        expect(new Set(gods.map(god => god.id)).size).toBe(REALM_GODS_PER_GAME);
    });
});
