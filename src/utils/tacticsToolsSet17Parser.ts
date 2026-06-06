interface ParsedChampionRow {
    id: string;
    name: string;
    cost: number;
    traits: string[];
    avatar: string;
    stats: {
        hp: number[] | null;
        ad: number[] | null;
        as: number | null;
        armor: number | null;
        mr: number | null;
        mana: { min: number; max: number } | null;
        range: number | null;
        dps: number[] | null;
    };
    ability_name: string | null;
    ability_name_en: string | null;
    ability_description: string | null;
    ability: {
        name: string | null;
        desc: string | null;
        icon: string | null;
        variables: never[];
    };
    ability_variables: never[];
    deleted_at: null;
}

function normalizeChampionKey(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function decodeHtmlEntities(value: string): string {
    return value
        .replace(/&#x27;|&#39;/gi, "'")
        .replace(/&quot;/gi, '"')
        .replace(/&amp;/gi, '&')
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>');
}

function stripTags(value: string): string {
    return decodeHtmlEntities(value.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
}

export function sanitizeSet17AbilityDescription(value: string | null): string | null {
    if (!value) {
        return value;
    }

    return value
        .replace(/\s+([,])/g, '$1')
        .replace(/\(\s+\)/g, '()')
        .replace(/([A-Za-z])\(\)/g, '$1 ()')
        .replace(/\s+Ability\s+Traits\s*$/i, '')
        .trim();
}

function sanitizeLiveAbilityDescription(value: string): string {
    return sanitizeSet17AbilityDescription(stripTags(value)) ?? '';
}

function extractChampionCards(html: string): string[] {
    if (!html.includes('class="champion-card"')) {
        return [];
    }

    return html.split('<div class="champion-card">').slice(1).map(fragment => `<div class="champion-card">${fragment}`);
}

function parseSimplifiedChampionCards(html: string): ParsedChampionRow[] {
    const rows = extractChampionCards(html)
        .map<ParsedChampionRow | null>(card => {
            const idMatch = card.match(/face_full_ultrawide\/(TFT17_[A-Za-z0-9]+)\.jpg/i);
            const nameMatch = card.match(/<div class="font-semibold">([^<]+)<\/div>/i);
            const costMatch = card.match(/<span>(\d+)<\/span>\s*<img[^>]*alt="gold"/i);
            const rangeMatch = card.match(/title="Range"[^>]*\/?>\s*<div>(\d+)<\/div>/i);
            const abilityIconMatch = card.match(/<img[^>]*src="([^"]*\/ability\/TFT17_[^"]+\.png)"/i);
            const abilityLineMatch = card.match(/<div>([^<]+?)\s+(\d+)\/(\d+)<\/div>/i);

            if (!idMatch || !nameMatch || !costMatch || !rangeMatch || !abilityLineMatch) {
                return null;
            }

            const id = idMatch[1];
            const name = stripTags(nameMatch[1]);
            const traitMatches = [...card.matchAll(/trait-icons\/new17_tft17_[^"']+\.svg[^>]*>\s*<div>([^<]+)<\/div>/gi)];
            const traits = [...new Set(traitMatches.map(match => stripTags(match[1])).filter(Boolean))];
            const abilityDescriptionCandidates = [...card.matchAll(/<div>([^<]*\d+\/\d+\/\d+[^<]*)<\/div>/gi)]
                .map(match => stripTags(match[1]))
                .filter(text => /damage|heal|shield|gain|attack|magic|deal|cast|passive|active/i.test(text));
            const abilityDescription = sanitizeSet17AbilityDescription(abilityDescriptionCandidates[0] ?? null);
            const abilityName = stripTags(abilityLineMatch[1]);

            return {
                id,
                name,
                cost: Number(costMatch[1]),
                traits,
                avatar: `https://ap.tft.tools/img/new17/face/tft17_${normalizeChampionKey(name)}.jpg`,
                stats: {
                    hp: null,
                    ad: null,
                    as: null,
                    armor: null,
                    mr: null,
                    mana: {
                        min: Number(abilityLineMatch[2]),
                        max: Number(abilityLineMatch[3]),
                    },
                    range: Number(rangeMatch[1]),
                    dps: null,
                },
                ability_name: null,
                ability_name_en: abilityName,
                ability_description: abilityDescription,
                ability: {
                    name: abilityName,
                    desc: abilityDescription,
                    icon: abilityIconMatch?.[1] ?? null,
                    variables: [],
                },
                ability_variables: [],
                deleted_at: null,
            } satisfies ParsedChampionRow;
        });

    return rows.filter((row): row is ParsedChampionRow => row !== null);
}

function parseLivePageChampionCards(html: string): ParsedChampionRow[] {
    const pattern = /<div class="relative flex justify-between[^"]*">([^<]+)<div class="flex items-end[^"]*">(\d+)<img[^>]*alt="gold"[\s\S]*?<img[^>]*alt="[^"]+"[^>]*src="https:\/\/ap\.tft\.tools\/img\/new17\/face_full_ultrawide\/(TFT17_[A-Za-z0-9]+)\.jpg[^"]*"[\s\S]*?<div class="absolute text-lg leading-snug bottom-\[6px\] left-\[6px\]">([\s\S]*?)<\/div><\/div><div class="p-3 flex flex-col text-sm">[\s\S]*?title="Range"[^>]*>[\s\S]*?<div class="pl-1 font-montserrat text-lg font-medium text-white1 break-all">(\d+)<\/div>[\s\S]*?<img[^>]*src="([^"]*\/ability\/TFT17_[^"]+\.png)[^"]*"[\s\S]*?<div class="font-medium text-sm">([^<]+)<\/div>[\s\S]*?<div class="pt-\[1px\]">(\d+)\/(\d+)<\/div>[\s\S]*?<div class="leading-tight[^"]*">([\s\S]*?)<\/div><\/div><\/div>/g;

    return [...html.matchAll(pattern)].map(match => {
        const [, rawName, rawCost, id, traitBlock, rawRange, abilityIcon, rawAbilityName, rawManaMin, rawManaMax, abilityBlock] = match;
        const name = stripTags(rawName);
        const traits = [...new Set([...traitBlock.matchAll(/<div class="pl-1[^"]*">([^<]+)<\/div>/g)].map(entry => stripTags(entry[1])).filter(Boolean))];
        const abilityDescription = sanitizeLiveAbilityDescription(abilityBlock);
        const abilityName = stripTags(rawAbilityName);

        return {
            id,
            name,
            cost: Number(rawCost),
            traits,
            avatar: `https://ap.tft.tools/img/new17/face/tft17_${normalizeChampionKey(name)}.jpg`,
            stats: {
                hp: null,
                ad: null,
                as: null,
                armor: null,
                mr: null,
                mana: {
                    min: Number(rawManaMin),
                    max: Number(rawManaMax),
                },
                range: Number(rawRange),
                dps: null,
            },
            ability_name: null,
            ability_name_en: abilityName,
            ability_description: abilityDescription,
            ability: {
                name: abilityName,
                desc: abilityDescription,
                icon: abilityIcon.replace(/\?w=\d+$/, ''),
                variables: [],
            },
            ability_variables: [],
            deleted_at: null,
        } satisfies ParsedChampionRow;
    });
}

export function parseChampionCardsFromTacticsToolsHtml(html: string): ParsedChampionRow[] {
    const simplifiedRows = parseSimplifiedChampionCards(html);
    if (simplifiedRows.length > 0) {
        return simplifiedRows;
    }

    return parseLivePageChampionCards(html);
}

export function buildSet17ChampionArtifactFromTacticsToolsHtml(html: string) {
    return {
        champions: parseChampionCardsFromTacticsToolsHtml(html).map(champion => ({
            apiName: champion.id,
            characterName: champion.id,
            name: champion.name,
            cost: champion.cost,
            traits: champion.traits,
            icon: champion.avatar,
            tileIcon: champion.avatar,
            squareIcon: champion.avatar,
            stats: champion.stats,
            ability: {
                name: champion.ability.name,
                desc: champion.ability.desc,
                icon: champion.ability.icon,
                variables: champion.ability.variables,
            },
        })),
    };
}
