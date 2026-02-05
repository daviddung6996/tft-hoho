import { PuzzleScenario } from '../data/puzzleScenarios';
// UnitData is not strictly needed for the implementation, removing to fix lint.
// import { UnitData } from '../data/types';

// Map long keys to short keys to save space
const KEY_MAP: Record<string, string> = {
    playerBoard: 'pb',
    opponentBoard: 'ob',
    playerBench: 'pbn',
    opponentBench: 'obn',
    playerState: 'ps',
    opponentState: 'os',
    proPlayer: 'pp',
    rank: 'r',
    stage: 's',
    augments: 'ag',
    proFirstRoll: 'pfr',
    proSecondRoll: 'psr',
    proFinalPick: 'pfp',
    proPickRound: 'pr',
    // Unit keys
    character_id: 'c',
    name: 'n',
    items: 'i',
    stars: 't', // t for tier
    position: 'p',
    row: 'y',
    col: 'x'
};

const REVERSE_KEY_MAP: Record<string, string> = Object.entries(KEY_MAP).reduce((acc, [k, v]) => {
    acc[v] = k;
    return acc;
}, {} as Record<string, string>);

// Helper to minimize an object based on keys
function minimize(obj: any): any {
    if (Array.isArray(obj)) {
        return obj.map(minimize);
    } else if (typeof obj === 'object' && obj !== null) {
        const newObj: any = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                // Skip empty values to save space
                if (obj[key] === null || obj[key] === undefined || obj[key] === '' || (Array.isArray(obj[key]) && obj[key].length === 0)) {
                    continue;
                }
                const shortKey = KEY_MAP[key] || key;
                newObj[shortKey] = minimize(obj[key]);
            }
        }
        return newObj;
    }
    return obj;
}

// Helper to expand an object based on keys
function expand(obj: any): any {
    if (Array.isArray(obj)) {
        return obj.map(expand);
    } else if (typeof obj === 'object' && obj !== null) {
        const newObj: any = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                const longKey = REVERSE_KEY_MAP[key] || key;
                newObj[longKey] = expand(obj[key]);
            }
        }
        return newObj;
    }
    return obj;
}

export function compressPuzzleState(puzzle: Partial<PuzzleScenario>): string {
    try {
        const minified = minimize(puzzle);
        const json = JSON.stringify(minified);
        // Simple base64 encoding (standard browser API)
        return btoa(json);
    } catch (e) {
        console.error('Failed to compress puzzle state', e);
        return '';
    }
}

export function decompressPuzzleState(encoded: string): Partial<PuzzleScenario> | null {
    try {
        const json = atob(encoded);
        const minified = JSON.parse(json);
        return expand(minified);
    } catch (e) {
        console.error('Failed to decompress puzzle state', e);
        return null;
    }
}
