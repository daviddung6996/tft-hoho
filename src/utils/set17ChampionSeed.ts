import { sanitizeSet17AbilityDescription } from './tacticsToolsSet17Parser';

type FlatArtifactStats = {
    hp: number | null;
    mana: number | null;
    initialMana: number | null;
    damage: number | null;
    attackSpeed: number | null;
    armor: number | null;
    magicResist: number | null;
    range: number | null;
};

type NestedSet17Stats = {
    hp: number[] | null;
    ad: number[] | null;
    as: number | null;
    armor: number | null;
    mr: number | null;
    mana: { min: number; max: number } | null;
    range: number | null;
    dps: number[] | null;
};

export interface Set17ArtifactChampion {
    apiName: string;
    name: string;
    cost: number;
    traits: string[];
    icon: string;
    tileIcon: string;
    squareIcon: string;
    stats: FlatArtifactStats | NestedSet17Stats;
    ability: {
        name: string | null;
        desc: string | null;
        icon?: string | null;
        variables?: unknown[];
    };
}

export interface ChampionDbRow {
    id: string;
    name: string;
    cost: number;
    traits: string[];
    avatar: string;
    stats: FlatArtifactStats | NestedSet17Stats;
    ability_name: string | null;
    ability_name_en: string | null;
    ability_description: string | null;
    ability_variables: unknown[];
    deleted_at: null;
}

export { sanitizeSet17AbilityDescription };

export function resolveSupabaseSeedKey(keys: { anonKey?: string; serviceRoleKey?: string }): string | null {
    return keys.serviceRoleKey ?? null;
}

export function mapArtifactChampionToDbChampion(champion: Set17ArtifactChampion): ChampionDbRow {
    return {
        id: champion.apiName,
        name: champion.name,
        cost: champion.cost,
        traits: champion.traits,
        avatar: champion.tileIcon || champion.squareIcon || champion.icon,
        stats: champion.stats,
        ability_name: champion.ability.name,
        ability_name_en: champion.ability.name,
        ability_description: sanitizeSet17AbilityDescription(champion.ability.desc),
        ability_variables: champion.ability.variables ?? [],
        deleted_at: null,
    };
}
