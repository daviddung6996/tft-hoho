import { describe, expect, it } from 'vitest';
import {
    mapArtifactChampionToDbChampion,
    resolveSupabaseSeedKey,
    sanitizeSet17AbilityDescription,
} from './set17ChampionSeed';

const sampleArtifactChampion = {
    apiName: 'TFT17_Ryze',
    characterName: 'TFT17_Ryze',
    name: 'Ryze',
    cost: 4,
    traits: ['N.O.V.A.', 'Sorcerer'],
    icon: 'https://ap.tft.tools/img/new17/face/tft17_ryze.jpg',
    tileIcon: 'https://ap.tft.tools/img/new17/face/tft17_ryze.jpg',
    squareIcon: 'https://ap.tft.tools/img/new17/face/tft17_ryze.jpg',
    stats: {
        hp: [800, 1440, 2592],
        ad: [35, 53, 95],
        as: 0.75,
        armor: 30,
        mr: 30,
        mana: { min: 15, max: 75 },
        range: 4,
        dps: [26, 40, 71],
    },
    ability: {
        name: 'Rune Prison',
        desc: 'Deal magic damage. Ability Traits',
        icon: 'https://ap.tft.tools/img/new17/ability/TFT17_Ryze.png',
        variables: [],
    },
};

const expectedDbChampion = {
    id: 'TFT17_Ryze',
    name: 'Ryze',
    cost: 4,
    traits: ['N.O.V.A.', 'Sorcerer'],
    avatar: 'https://ap.tft.tools/img/new17/face/tft17_ryze.jpg',
    stats: {
        hp: [800, 1440, 2592],
        ad: [35, 53, 95],
        as: 0.75,
        armor: 30,
        mr: 30,
        mana: { min: 15, max: 75 },
        range: 4,
        dps: [26, 40, 71],
    },
    ability_name: 'Rune Prison',
    ability_name_en: 'Rune Prison',
    ability_description: 'Deal magic damage.',
    ability_variables: [],
    deleted_at: null,
};

describe('mapArtifactChampionToDbChampion', () => {
    it('passes through the nested Set 17 stats contract without a flat compatibility layer', () => {
        expect(mapArtifactChampionToDbChampion(sampleArtifactChampion)).toEqual(expectedDbChampion);
    });
});

describe('resolveSupabaseSeedKey', () => {
    it('requires the service role key for seed scripts', () => {
        expect(resolveSupabaseSeedKey({
            anonKey: 'anon-key',
            serviceRoleKey: 'service-role-key',
        })).toBe('service-role-key');
        expect(resolveSupabaseSeedKey({ anonKey: 'anon-key' })).toBeNull();
    });
});

describe('sanitizeSet17AbilityDescription', () => {
    it('removes trailing page chrome tokens from parsed tactics.tools descriptions', () => {
        expect(
            sanitizeSet17AbilityDescription(
                'Gain ShieldAmount () Shield for 4 seconds. Ability Traits',
            ),
        ).toBe('Gain ShieldAmount () Shield for 4 seconds.');
    });
});
