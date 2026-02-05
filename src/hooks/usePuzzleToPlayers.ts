import { useMemo, useState, useEffect } from 'react';
import { PuzzleScenario, OpponentData } from '../data/puzzleScenarios';
import { PlayerData } from '../data/mockPlayers';
import { UnitData, Synergy, Champion } from '../data/types';
import { Item, itemService } from '../services/itemService';
import { Trait } from '../services/traitService';
import { championService } from '../services/championService';
import { traitService } from '../services/traitService';
import { calculateSynergies } from '../utils/synergyCalculator';

// Tactician Images
import penguImg from '../assets/tacticians/pengu.webp';
import chonccImg from '../assets/tacticians/choncc.webp';
import ahriImg from '../assets/tacticians/ahri.webp';
import norraImg from '../assets/tacticians/norra.webp';
import bunbunImg from '../assets/tacticians/bunbun.webp';
import fenroarImg from '../assets/tacticians/fenroar.webp';
import spriteImg from '../assets/tacticians/sprite.webp';
import molediverImg from '../assets/tacticians/molediver.webp';

const OPPONENT_AVATARS = [chonccImg, ahriImg, norraImg, bunbunImg, fenroarImg, spriteImg, molediverImg];

const DEFAULT_PLAYER_STATE = {
    gold: 0,
    level: 1,
    hp: 100,
    xp: 0
};

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
    const [isLoading, setIsLoading] = useState(true);

    // Load static data on mount
    useEffect(() => {
        const loadData = async () => {
            try {
                const [champData, traitData, itemData] = await Promise.all([
                    championService.getAll(),
                    traitService.getAll(),
                    itemService.getAll()
                ]);
                setChampions(champData || []);
                setTraits(traitData || []);
                setDbItems(itemData || []);
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



        // Helper to enrich items with icons
        const enrichItems = (rawItems: (Item | null)[]) => {
            return (rawItems || []).map(item => {
                if (!item) return null;
                const normalizedName = item.name.toLowerCase().replace(/\s+/g, '');
                const dbItem = dbItems.find(db => {
                    const dbNormalized = db.name.toLowerCase().replace(/\s+/g, '');
                    return dbNormalized === normalizedName || db.id === item.id;
                });
                return {
                    ...item,
                    icon: dbItem?.icon || item.icon || ''
                };
            });
        };

        const myItems = enrichItems(puzzle.startingItems || []);

        // Transform player
        const playerState = puzzle.playerState || DEFAULT_PLAYER_STATE;
        const myPlayer = createPlayerData({
            id: '1',
            name: 'You',
            avatar: penguImg,
            isMe: true,
            units: normalizeUnits(puzzle.playerBoard || [], champions),
            bench: normalizeBench(puzzle.playerBench || [], champions),
            gold: playerState.gold,
            hp: playerState.hp,
            augments: (puzzle.augments || []).filter((a): a is NonNullable<typeof a> => Boolean(a)),
            arenaId: 'summoners_rift',
            items: myItems
        });

        // Helper to transform opponents with items
        const transformOpponentsWithItems = (puzzle: PuzzleScenario, champions: Champion[]): PlayerData[] => {
            if (puzzle.opponents && puzzle.opponents.length > 0) {
                return puzzle.opponents.map((opp, index) =>
                    createOpponentPlayerData({
                        ...opp,
                        // Ensure we pass enriched items
                        startingItems: enrichItems(opp.startingItems || [])
                    } as OpponentData, index + 2, champions)
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
                    startingItems: [] // Legacy has no items usually
                };
                return [createOpponentPlayerData(legacyOpponent, 2, champions)];
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
    }, [puzzle, champions, traits, dbItems, isLoading]);
}

/**
 * Transform opponents from puzzle data
 * Supports both multi-opponent (opponents[]) and legacy (opponentBoard) formats
 */


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
    augments: any[];
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
        status: config.hp > 0 ? 'active' : 'eliminated',
        isMe: config.isMe,
        units: config.units,
        bench: config.bench,
        augments: config.augments,
        arenaId: config.arenaId,
        augmentTreeUrl: '/src/assets/augment-tree/augment-tree.png',
        items: config.items || []
    };
}

/**
 * Create PlayerData from OpponentData
 */
function createOpponentPlayerData(opp: OpponentData, index: number, champions: Champion[]): PlayerData {
    return {
        id: String(index),
        name: opp.name || `Opponent ${index - 1}`,
        avatar: OPPONENT_AVATARS[(index - 2) % OPPONENT_AVATARS.length],
        hp: opp.state?.hp || 100,
        gold: opp.state?.gold || 0,
        status: (opp.state?.hp || 100) > 0 ? 'active' : 'eliminated',
        isMe: false,
        units: normalizeUnits(opp.board || [], champions),
        bench: normalizeBench(opp.bench || [], champions),
        augments: (opp.augments || []).filter((a): a is NonNullable<typeof a> => Boolean(a)),
        arenaId: 'summoners_rift',
        augmentTreeUrl: '/src/assets/augment-tree/augment-tree.png',
        items: opp.startingItems || []
    };
}

/**
 * Normalize board units - ensure image URLs are set from Admin data if available
 */
function normalizeUnits(units: UnitData[], champions: Champion[]): UnitData[] {
    if (!units) return [];

    return units
        .filter(u => u && u.row !== undefined && u.col !== undefined)
        .map(u => {
            // [NEW] Lookup champion in admin data
            const adminChamp = champions.find(c => c.name.toLowerCase() === u.name.toLowerCase());

            return {
                ...u,
                // Use admin avatar/icon from DB only
                image: adminChamp?.icon || adminChamp?.avatar || u.image || '',
                // Ensure cost is synced if missing (optional but good)
                cost: adminChamp?.cost !== undefined ? adminChamp.cost : u.cost
            };
        });
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
            const adminChamp = champions.find(c => c.name.toLowerCase() === u.name.toLowerCase());

            return {
                ...u,
                // Use admin avatar/icon from DB only
                image: adminChamp?.icon || adminChamp?.avatar || u.image || '',
                cost: adminChamp?.cost !== undefined ? adminChamp.cost : u.cost,
                benchIndex: u.benchIndex ?? idx,
                row: -1 // Mark as bench unit
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
        status: 'active',
        isMe: true,
        units: [],
        bench: [],
        augments: [],
        arenaId: 'summoners_rift',
        augmentTreeUrl: '/src/assets/augment-tree/augment-tree.png',
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
