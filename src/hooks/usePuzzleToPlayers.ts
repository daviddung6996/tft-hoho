import { useMemo, useState, useEffect } from 'react';
import { PuzzleScenario, OpponentData } from '../data/puzzleScenarios';
import { PlayerData } from '../data/mockPlayers';
import { UnitData, Synergy, Champion } from '../data/types';
import { Item, itemService } from '../services/itemService';
import { Trait } from '../services/traitService';
import { championService } from '../services/championService';
import { traitService } from '../services/traitService';
import { AugmentData, augmentService } from '../services/augmentService';
import { calculateSynergies } from '../utils/synergyCalculator';
import { ARENA_SKINS } from '../data/arenas';
import { normalizeCompactLookupValue, normalizeLookupValue } from '../utils/stringNormalization';
import { sanitizePuzzlePlayerState } from '../features/puzzle/playerState';

// Tactician Images
import penguImg from '../assets/tacticians/pengu.webp';
import chonccImg from '../assets/tacticians/choncc.webp';
import ahriImg from '../assets/tacticians/ahri.webp';
import norraImg from '../assets/tacticians/norra.webp';
import bunbunImg from '../assets/tacticians/bunbun.webp';
import fenroarImg from '../assets/tacticians/fenroar.webp';
import spriteImg from '../assets/tacticians/sprite.webp';
import molediverImg from '../assets/tacticians/molediver.webp';
import augmentTreeImg from '../assets/augment-tree/augment-tree.webp';

const OPPONENT_AVATARS = [chonccImg, ahriImg, norraImg, bunbunImg, fenroarImg, spriteImg, molediverImg];

// Simple hash from string to number for deterministic random per puzzle
function hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash);
}

// Get shuffled arena IDs for a puzzle (deterministic based on puzzle ID)
function getShuffledArenaIds(puzzleId: string): string[] {
    const ids = ARENA_SKINS.map(a => a.id);
    const seed = hashString(puzzleId);
    // Fisher-Yates shuffle with seeded random
    for (let i = ids.length - 1; i > 0; i--) {
        const j = (seed * (i + 1) + i) % (i + 1);
        [ids[i], ids[j]] = [ids[j], ids[i]];
    }
    return ids;
}

const DEFAULT_PLAYER_STATE = {
    gold: 0,
    level: 1,
    hp: 100,
    xp: 0
};

export function getPuzzleStateLevel(stage: string, state?: { level?: number } | null): number {
    return sanitizePuzzlePlayerState(stage, state).level;
}

export function getPuzzleStateXp(stage: string, state?: { level?: number; xp?: number } | null): number {
    return sanitizePuzzlePlayerState(stage, state).xp;
}

export interface PuzzlePlayersResult {
    myPlayer: PlayerData;
    opponents: PlayerData[];
    allPlayers: PlayerData[];  // [myPlayer, ...opponents] for ScoutingPanel
    synergies: Synergy[];
    items: (Item | null)[];
    isLoading: boolean;
}

/**
 * Transform PuzzleScenario data into PlayerData[] for gameplay view
 */
export function usePuzzleToPlayers(puzzle: PuzzleScenario | null): PuzzlePlayersResult {
    const [champions, setChampions] = useState<Champion[]>([]);
    const [traits, setTraits] = useState<Trait[]>([]);
    const [dbItems, setDbItems] = useState<Item[]>([]);
    const [dbAugments, setDbAugments] = useState<AugmentData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Load static data on mount
    useEffect(() => {
        const loadData = async () => {
            try {
                const [champData, traitData, itemData, augData] = await Promise.all([
                    championService.getAll(),
                    traitService.getAll(),
                    itemService.getAll(),
                    augmentService.getAll()
                ]);
                setChampions(champData || []);
                setTraits(traitData || []);
                setDbItems(itemData || []);
                setDbAugments(augData || []);
            } catch (err) {
                console.error('Failed to load champion/trait/item data:', err);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    return useMemo(() => {
        // Return loading/empty state if no puzzle or still loading
        if (!puzzle || isLoading) {
            return getDefaultResult(isLoading);
        }



        // Helper to enrich augments with Vietnamese names from DB
        const enrichAugments = (rawAugs: any[]) => {
            if (!rawAugs || !dbAugments.length) return rawAugs;
            return rawAugs.map((aug: any) => {
                if (!aug) return aug;
                const dbAug = dbAugments.find(db => db.id === aug.id) ||
                    dbAugments.find(db => normalizeLookupValue(db.title) === normalizeLookupValue(aug.title));
                if (dbAug) {
                    return { ...aug, title: dbAug.title, description: dbAug.description, icon: dbAug.icon || aug.icon };
                }
                return aug;
            });
        };

        // Helper to enrich items with icons and Vietnamese names
        const enrichItems = (rawItems: (Item | null)[]) => {
            return (rawItems || []).map(item => {
                if (!item) return null;
                const normalizedName = normalizeCompactLookupValue(item.name || item.name_en || item.id);
                const dbItem = dbItems.find(db => {
                    const dbNormalized = normalizeCompactLookupValue(db.name);
                    const dbEnNormalized = normalizeCompactLookupValue(db.name_en);
                    return dbNormalized === normalizedName || dbEnNormalized === normalizedName || db.id === item.id;
                });
                return {
                    ...item,
                    name: dbItem?.name || item.name || item.name_en || item.id,
                    icon: dbItem?.icon || item.icon || ''
                };
            });
        };

        const myItems = enrichItems(puzzle.startingItems || []);

        // Shuffle arenas per puzzle (deterministic: same puzzle = same arenas)
        const arenaIds = getShuffledArenaIds(puzzle.id);

        // Transform player
        const playerState = puzzle.playerState || DEFAULT_PLAYER_STATE;
        const playerLevel = getPuzzleStateLevel(puzzle.stage, playerState);
        const playerXp = getPuzzleStateXp(puzzle.stage, playerState);
        const myPlayer = createPlayerData({
            id: '1',
            name: 'You',
            avatar: penguImg,
            isMe: true,
            units: normalizeUnits(puzzle.playerBoard || [], champions, playerLevel),
            bench: normalizeBench(puzzle.playerBench || [], champions),
            gold: playerState.gold,
            hp: playerState.hp,
            level: playerLevel,
            xp: playerXp,
            augments: enrichAugments(getChosenAugments(puzzle)),
            arenaId: arenaIds[0],
            items: myItems
        });

        // Helper to transform opponents with items
        const transformOpponentsWithItems = (puzzle: PuzzleScenario, champions: Champion[]): PlayerData[] => {
            if (puzzle.opponents && puzzle.opponents.length > 0) {
                return puzzle.opponents.map((opp, index) =>
                    createOpponentPlayerData({
                        ...opp,
                        startingItems: enrichItems(opp.startingItems || [])
                    } as OpponentData, index + 2, champions, arenaIds[index + 1] || arenaIds[(index + 1) % arenaIds.length], puzzle.stage)
                );
            }
            // Legacy support
            if (puzzle.opponentBoard && puzzle.opponentBoard.length > 0) {
                const legacyOpponent: OpponentData = {
                    id: '2',
                    name: 'Opponent',
                    board: puzzle.opponentBoard,
                    bench: puzzle.opponentBench || [],
                    state: puzzle.opponentState || DEFAULT_PLAYER_STATE,
                    augments: [],
                    startingItems: []
                };
                return [createOpponentPlayerData(legacyOpponent, 2, champions, arenaIds[1], puzzle.stage)];
            }
            return [];
        };

        const opponents = transformOpponentsWithItems(puzzle, champions);

        // Calculate synergies from player board
        const synergies = calculateSynergies({
            units: puzzle.playerBoard || [],
            championData: champions,
            traitData: traits
        });

        return {
            myPlayer,
            opponents,
            allPlayers: [myPlayer, ...opponents],
            synergies,
            items: myItems, // Legacy prop for compatibility, prefer using player.items in HUD
            isLoading: false
        };
    }, [puzzle, champions, traits, dbItems, dbAugments, isLoading]);
}

/**
 * Transform opponents from puzzle data
 * Supports both multi-opponent (opponents[]) and legacy (opponentBoard) formats
 */


/**
 * Get the augments already CHOSEN (not the current options).
 * - Round 2-1: No augments chosen yet → empty
 * - Round 3-2: Has augment21 (1 prior choice) → [augment21]
 * - Round 4-2: Has previousAugments (2 prior choices) → previousAugments
 */
export function getChosenAugments(puzzle: PuzzleScenario): AugmentData[] {
    const stage = puzzle.stage || '';

    if (stage.startsWith('4-2') || stage === '4-2') {
        // 4-2: Show the 2 previously chosen augments
        return (puzzle.previousAugments || []).filter((a): a is AugmentData => Boolean(a));
    }

    if (stage.startsWith('3-2') || stage === '3-2') {
        // 3-2: Show only the 1 augment chosen at 2-1
        return puzzle.augment21 ? [puzzle.augment21] : [];
    }

    // 2-1: No augments chosen yet, tree should be empty
    return [];
}

/**
 * Create PlayerData from config
 */
function createPlayerData(config: {
    id: string;
    name: string;
    avatar: string;
    isMe: boolean;
    units: UnitData[];
    bench: UnitData[];
    gold: number;
    hp: number;
    level: number;
    xp: number;
    augments: any[];

    arenaId: string;
    items?: (Item | null)[];
}): PlayerData {
    return {
        id: config.id,
        name: config.name,
        avatar: config.avatar,
        hp: config.hp,
        gold: config.gold,
        level: config.level,
        xp: config.xp,
        status: config.hp > 0 ? 'active' : 'eliminated',
        isMe: config.isMe,
        units: config.units,
        bench: config.bench,
        augments: config.augments,
        arenaId: config.arenaId,
        augmentTreeUrl: augmentTreeImg,
        items: config.items || []
    };
}

const OPPONENT_NAMES = ['Choncc', 'Ahri', 'Irelia', 'BunBun', 'Chihuahua', 'Fuwa', 'Mèo bánh mì'];

/**
 * Create PlayerData from OpponentData
 */
function createOpponentPlayerData(opp: OpponentData, index: number, champions: Champion[], arenaId: string, stage: string): PlayerData {
    const level = getPuzzleStateLevel(stage, opp.state);
    const xp = getPuzzleStateXp(stage, opp.state);
    return {
        id: String(index),
        name: OPPONENT_NAMES[(index - 2) % OPPONENT_NAMES.length],
        avatar: OPPONENT_AVATARS[(index - 2) % OPPONENT_AVATARS.length],
        hp: opp.state?.hp || 100,
        gold: opp.state?.gold || 0,
        level,
        xp,
        status: (opp.state?.hp || 100) > 0 ? 'active' : 'eliminated',
        isMe: false,
        units: normalizeUnits(opp.board || [], champions, level),
        bench: normalizeBench(opp.bench || [], champions),
        augments: (opp.augments || []).filter((a: any): a is NonNullable<typeof a> => Boolean(a)),
        arenaId,
        augmentTreeUrl: augmentTreeImg,
        items: opp.startingItems || []
    };
}

/**
 * Normalize board units - ensure image URLs are set from Admin data if available.
 * If levelCap is provided, at most levelCap units will be returned (TFT rule: max board = level).
 */
function normalizeUnits(units: UnitData[], champions: Champion[], levelCap?: number): UnitData[] {
    if (!units) return [];

    const ROWS = 4;
    const COLS = 7;
    const occupied = new Set<string>();

    const findNearestEmpty = (row: number, col: number): { row: number; col: number } | null => {
        for (let radius = 1; radius <= ROWS + COLS; radius++) {
            for (let dr = -radius; dr <= radius; dr++) {
                for (let dc = -radius; dc <= radius; dc++) {
                    if (Math.abs(dr) !== radius && Math.abs(dc) !== radius) continue;
                    const r = row + dr;
                    const c = col + dc;
                    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) continue;
                    if (!occupied.has(`${r},${c}`)) return { row: r, col: c };
                }
            }
        }
        return null;
    };

    const result: UnitData[] = [];

    for (const u of units.filter(u => u && u.row !== undefined && u.col !== undefined)) {
        if (levelCap !== undefined && result.length >= levelCap) break;

        const normalizedUnitName = normalizeLookupValue(u.name);
        const adminChamp = u.name
            ? champions.find(c => normalizeLookupValue(c.name) === normalizedUnitName)
            : undefined;
        let finalRow = u.row as number;
        let finalCol = u.col as number;

        if (occupied.has(`${finalRow},${finalCol}`)) {
            const empty = findNearestEmpty(finalRow, finalCol);
            if (!empty) continue;
            finalRow = empty.row;
            finalCol = empty.col;
        }
        occupied.add(`${finalRow},${finalCol}`);

        result.push({
            ...u,
            row: finalRow,
            col: finalCol,
            image: adminChamp?.icon || adminChamp?.avatar || u.image || '',
            cost: adminChamp?.cost !== undefined ? adminChamp.cost : u.cost,
            traits: adminChamp?.traits || u.traits || []
        });
    }

    return result;
}

/**
 * Normalize bench units - ensure image URLs and benchIndex are set from Admin data if available
 */
function normalizeBench(bench: UnitData[], champions: Champion[]): UnitData[] {
    if (!bench) return [];

    return bench
        .filter(u => u && (u.benchIndex !== undefined || u.row === -1))
        .map((u, idx) => {
            // [NEW] Lookup champion in admin data
            const normalizedUnitName = normalizeLookupValue(u.name);
            const adminChamp = u.name
                ? champions.find(c => normalizeLookupValue(c.name) === normalizedUnitName)
                : undefined;

            const benchIdx = u.benchIndex ?? idx;
            return {
                ...u,
                // Use admin avatar/icon from DB only
                image: adminChamp?.icon || adminChamp?.avatar || u.image || '',
                cost: adminChamp?.cost !== undefined ? adminChamp.cost : u.cost,
                benchIndex: benchIdx,
                col: benchIdx, // BenchArea finds units by u.col === slotIndex
                row: -1, // Mark as bench unit (row < 0 = not on board)
                // Add traits for tooltip display
                traits: adminChamp?.traits || u.traits || []
            };
        });
}

/**
 * Get default/empty result
 */
function getDefaultResult(isLoading: boolean): PuzzlePlayersResult {
    const emptyPlayer: PlayerData = {
        id: '1',
        name: 'You',
        avatar: penguImg,
        hp: 100,
        gold: 0,
        level: 1,
        xp: 0,
        status: 'active',
        isMe: true,
        units: [],
        bench: [],
        augments: [],
        arenaId: 'summoners_rift',
        augmentTreeUrl: augmentTreeImg,
        items: []
    };

    return {
        myPlayer: emptyPlayer,
        opponents: [],
        allPlayers: [emptyPlayer],
        synergies: [],
        items: [],
        isLoading
    };
}
