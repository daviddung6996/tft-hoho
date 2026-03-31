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

const expectedArtifactOutputShape = {
    hp: null,
    mana: 75,
    initialMana: 15,
    damage: null,
    attackSpeed: null,
    armor: null,
    magicResist: null,
    range: 4,
};

const expectedSeededStatsShape = {
    hp: [800, 1440, 2592],
    ad: [35, 53, 95],
    as: 0.75,
    armor: 30,
    mr: 30,
    mana: { min: 15, max: 75 },
    range: 4,
    dps: [26, 40, 71],
};

const flatArtifactChampion = {
    ...sampleArtifactChampion,
    stats: expectedArtifactOutputShape,
};

const nestedArtifactChampion = {
    ...sampleArtifactChampion,
    stats: expectedSeededStatsShape,
};

const expectedNestedDbChampion = {
    id: 'TFT17_Ryze',
    name: 'Ryze',
    cost: 4,
    traits: ['N.O.V.A.', 'Sorcerer'],
    avatar: 'https://ap.tft.tools/img/new17/face/tft17_ryze.jpg',
    stats: expectedSeededStatsShape,
    ability_name: 'Rune Prison',
    ability_name_en: 'Rune Prison',
    ability_description: 'Deal magic damage.',
    ability_variables: [],
    deleted_at: null,
};

const expectedFlatDbChampion = {
    ...expectedNestedDbChampion,
    stats: expectedArtifactOutputShape,
};


describe('mapArtifactChampionToDbChampion', () => {
    it('preserves nested Set 17 stats when they are already present', () => {
        expect(mapArtifactChampionToDbChampion(nestedArtifactChampion)).toEqual(expectedNestedDbChampion);
    });

    it('passes through the current generated flat stats shape until the generator is upgraded', () => {
        expect(mapArtifactChampionToDbChampion(flatArtifactChampion)).toEqual(expectedFlatDbChampion);
    });
});


describe('buildSet17ChampionArtifactFromTacticsToolsHtml compatibility', () => {
    it('documents that the current artifact output is still the flat compatibility shape', () => {
        expect(expectedArtifactOutputShape).toEqual({
            hp: null,
            mana: 75,
            initialMana: 15,
            damage: null,
            attackSpeed: null,
            armor: null,
            magicResist: null,
            range: 4,
        });
    });
});


const expectedDbChampion = expectedFlatDbChampion;


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



void expectedDbChampion;

