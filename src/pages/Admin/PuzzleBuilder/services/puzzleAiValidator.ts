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
3. A catalog of valid augments (with id, title, icon, tier)
4. A catalog of valid items (with id, name, icon)

Your task:
- For each champion in playerBoard, opponentBoard, playerBench, opponentBench, and opponents[].board/bench: match the "name" and "id" against the champion catalog. If the name is close but not exact, correct it. Set the correct "image" field from the champion's avatar/icon. Preserve row, col, benchIndex, cost, stars, and items.
- For each augment in augments, rerollAugments, secondRerollAugments, proFirstRoll, proSecondRoll, proFinalPick, opponents[].augments, augment21, previousAugments: match against the augment catalog by title/id. Correct title, icon, tier, and id to exact DB values. Keep description if present.
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
        id: a.id, title: a.title, icon: a.icon, tier: a.tier
    }));
    const itemList = catalogs.items.map(i => ({
        id: i.id, name: i.name, icon: i.icon
    }));

    return JSON.stringify({ champions: champList, augments: augList, items: itemList });
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
