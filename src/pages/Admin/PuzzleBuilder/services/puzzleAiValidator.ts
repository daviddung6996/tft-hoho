import { AugmentData } from '../../../../services/augmentService';
import { Champion } from '../../../../data/types';
import { Item } from '../../../../services/itemService';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

const MODEL_CHAIN = [
    'gemini-2.0-flash-lite',
    'gemini-2.0-flash',
];

function buildApiUrl(model: string): string {
    return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
}

const SYSTEM_PROMPT = `You are a TFT (Teamfight Tactics) data validator. Your job is to match imported puzzle JSON data against the actual database records and fix mismatches.

You will receive:
1. The raw imported JSON (a puzzle scenario)
2. A catalog of valid champions (with id, name, avatar/icon)
3. A catalog of valid augments (with id, title [Vietnamese], name_en [English], icon, tier)
4. A catalog of valid items (with id, name, icon)

Your task:
- For each champion in playerBoard, opponentBoard, playerBench, opponentBench, and opponents[].board/bench: match the "name" and "id" against the champion catalog. If the name is close but not exact, correct it. Set the correct "image" field from the champion's avatar/icon. Preserve row, col, benchIndex, cost, stars, and items.
- For each augment in augments, rerollAugments, secondRerollAugments, proFirstRoll, proSecondRoll, proFinalPick, opponents[].augments, augment21, previousAugments: match against the augment catalog by title (Vietnamese), name_en (English), or id. The input may use English names — match against name_en first if title does not match. Correct title, icon, tier, and id to exact DB values. Keep description if present.
- IMPORTANT: If proFirstRoll, proSecondRoll, or similar augment fields contain PLAIN STRINGS instead of objects (e.g. ["Thẻ Ước Bảo Hộ", "Gói Bảo Hộ"]), you MUST convert each string into a full augment object by matching the string against augment titles in the catalog. The result should be {id, title, icon, tier, description} from the catalog. If proFinalPick is a plain string, convert it to an augment object the same way.
- For each item in startingItems and opponents[].startingItems: match against the item catalog by name/id. Correct name, icon, and id.
- For unit items (the "items" array inside each unit on the board): these are item name strings. Match them against the item catalog names.
- DO NOT add or remove entries. Only correct the values of existing entries.
- If an entry cannot be matched to any DB record, keep it unchanged.
- Return ONLY the corrected JSON. No explanation, no markdown, no code fences. Pure JSON only.`;

interface DbCatalogs {
    champions: Champion[];
    augments: AugmentData[];
    items: Item[];
}

function buildCompactCatalog(catalogs: DbCatalogs): string {
    const champList = catalogs.champions.map(c => ({
        id: c.id, name: c.name, avatar: c.avatar || c.icon, cost: c.cost
    }));
    const augList = catalogs.augments.map(a => ({
        id: a.id, title: a.title, name_en: a.name_en || '', icon: a.icon, tier: a.tier
    }));
    const itemList = catalogs.items.map(i => ({
        id: i.id, name: i.name, icon: i.icon
    }));

    return JSON.stringify({ champions: champList, augments: augList, items: itemList });
}

/**
 * Deterministic local resolver: converts plain string augment names
 * to full AugmentData objects by matching against the DB catalog.
 * Runs BEFORE AI validation to handle the common case without needing AI.
 */
function resolveStringToAugment(value: unknown, dbAugments: AugmentData[]): unknown {
    if (typeof value === 'string') {
        // Plain string → try Vietnamese title, then English name
        const normalized = value.toLowerCase().trim();
        const match =
            dbAugments.find(a => a.title.toLowerCase().trim() === normalized) ||
            dbAugments.find(a => (a.name_en || '').toLowerCase().trim() === normalized);
        if (match) {
            return { id: match.id, title: match.title, description: match.description || '', icon: match.icon, tier: match.tier };
        }
        // No match — return as-is (AI might fix it)
        console.warn(`[PuzzleAI] Could not locally resolve augment string: "${value}"`);
        return value;
    }
    if (value && typeof value === 'object' && !Array.isArray(value)) {
        // Already an object — enrich with DB data if possible
        const aug = value as Record<string, unknown>;
        const title = (aug.title as string) || (aug.name as string) || '';
        if (!title) return value;
        const normalized = title.toLowerCase().trim();
        const match =
            dbAugments.find(a => a.title.toLowerCase().trim() === normalized) ||
            dbAugments.find(a => (a.name_en || '').toLowerCase().trim() === normalized) ||
            dbAugments.find(a => a.id === aug.id);
        if (match) {
            return { ...aug, id: match.id, title: match.title, description: match.description || '', icon: match.icon, tier: match.tier };
        }
    }
    return value;
}

function resolveAugmentArray(arr: unknown, dbAugments: AugmentData[]): unknown {
    if (!Array.isArray(arr)) return arr;
    return arr.map(item => resolveStringToAugment(item, dbAugments));
}

export function resolveAugmentsLocally(
    rawJson: Record<string, unknown>,
    dbAugments: AugmentData[]
): Record<string, unknown> {
    if (!dbAugments.length) return rawJson;

    const result = { ...rawJson };

    // Augment array fields
    const arrayFields = ['augments', 'rerollAugments', 'secondRerollAugments', 'proFirstRoll', 'proSecondRoll', 'previousAugments'];
    for (const field of arrayFields) {
        if (result[field]) {
            result[field] = resolveAugmentArray(result[field], dbAugments);
        }
    }

    // Single augment fields
    const singleFields = ['proFinalPick', 'augment21'];
    for (const field of singleFields) {
        if (result[field] !== undefined && result[field] !== null) {
            result[field] = resolveStringToAugment(result[field], dbAugments);
        }
    }

    // Opponents augments
    if (Array.isArray(result.opponents)) {
        result.opponents = (result.opponents as Record<string, unknown>[]).map(opp => {
            if (opp && typeof opp === 'object' && opp.augments) {
                return { ...opp, augments: resolveAugmentArray(opp.augments, dbAugments) };
            }
            return opp;
        });
    }

    console.log('[PuzzleAI] Local augment resolution complete');
    return result;
}

export async function validatePuzzleWithAI(
    rawJson: Record<string, unknown>,
    catalogs: DbCatalogs
): Promise<Record<string, unknown>> {
    if (!GEMINI_API_KEY) {
        console.warn('[PuzzleAI] No API key — skipping AI validation');
        return rawJson;
    }

    const catalogStr = buildCompactCatalog(catalogs);
    const puzzleStr = JSON.stringify(rawJson);

    const userPrompt = `PUZZLE JSON:\n${puzzleStr}\n\nDATABASE CATALOG:\n${catalogStr}`;

    const requestBody = JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ parts: [{ text: userPrompt }] }],
        generationConfig: {
            temperature: 0.0,
            topP: 1.0,
            maxOutputTokens: 65536,
            responseMimeType: 'application/json',
        },
    });

    for (const model of MODEL_CHAIN) {
        try {
            console.log(`[PuzzleAI] Trying model: ${model}`);
            const res = await fetch(buildApiUrl(model), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: requestBody,
            });

            if (res.status === 429 || res.status === 403) {
                console.warn(`[PuzzleAI] ${model} rate limited (${res.status}), falling back...`);
                continue;
            }

            if (!res.ok) {
                console.error(`[PuzzleAI] ${model} error:`, res.status, await res.text());
                continue;
            }

            const json = await res.json();
            const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
            console.log(`[PuzzleAI] ✅ ${model} responded (${rawText.length} chars)`);

            if (!rawText.trim()) continue;

            // Parse the corrected JSON
            const corrected = JSON.parse(rawText.trim());
            if (typeof corrected === 'object' && corrected !== null && !Array.isArray(corrected)) {
                return corrected;
            }
            console.warn('[PuzzleAI] Response was not a valid object, using raw input');
            return rawJson;
        } catch (err) {
            console.error(`[PuzzleAI] ${model} failed:`, err);
            continue;
        }
    }

    console.error('[PuzzleAI] All models exhausted — using raw JSON');
    return rawJson;
}

/**
 * After local + AI resolution, collect any augment values that are still plain strings.
 * These need to be either added to the DB or skipped before import.
 */
export function collectUnresolvedAugmentStrings(
    json: Record<string, unknown>
): string[] {
    const unresolved = new Set<string>();

    const checkValue = (v: unknown) => {
        if (typeof v === 'string' && v.trim()) unresolved.add(v.trim());
    };

    const arrayFields = ['augments', 'rerollAugments', 'secondRerollAugments', 'proFirstRoll', 'proSecondRoll', 'previousAugments'];
    for (const field of arrayFields) {
        if (Array.isArray(json[field])) (json[field] as unknown[]).forEach(checkValue);
    }

    ['proFinalPick', 'augment21'].forEach(f => checkValue(json[f]));

    if (Array.isArray(json.opponents)) {
        (json.opponents as Record<string, unknown>[]).forEach(opp => {
            if (Array.isArray(opp?.augments)) (opp.augments as unknown[]).forEach(checkValue);
        });
    }

    return Array.from(unresolved);
}
