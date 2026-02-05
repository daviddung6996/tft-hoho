import { AugmentData } from '../services/augmentService';
import { Item } from '../services/itemService';
import { UnitData } from './types';

// Puzzle scenario data for TFTDojo-style gameplay
export interface PuzzleScenario {
    id: string;
    title?: string;
    proPlayer: string;
    rank: string;
    stage: string;
    // Stream/VOD information
    streamUrl?: string;
    vodTimestamp?: string;        // e.g., "12:34" or "1:23:45"
    vodSource?: 'twitch' | 'youtube' | 'other';
    date?: string;
    server?: string;
    encounter?: string;
    patch?: string;
    // Pro player details
    proSocialLink?: string;       // Twitch/Twitter profile URL
    proLpRank?: string;          // e.g., "Challenger 1200 LP" or "Set 16 T1"
    // Game context
    lobbyHealth?: string;         // Comma-separated HP values (e.g., "100, 95, 90, 85, 80, 75, 70, 65")
    tournamentName?: string;      // e.g., "Tactician's Cup", "Regional Finals"
    // Initial augments shown to user (First Roll)
    augments: (AugmentData | null)[];
    // Augments that appear after rerolling the corresponding initial augment (Index 0 -> 0, etc.)
    rerollAugments?: (AugmentData | null)[];
    // Second reroll option (for encounters like Teemo that give +1 reroll)
    secondRerollAugments?: (AugmentData | null)[];
    // Flag to enable the second reroll logic
    hasExtraReroll?: boolean;
    // Indices of initial augments (0-2) that the Pro chose to reroll
    proRerollIndices?: number[];
    // Indices of reroll augments (0-2) that the Pro chose to reroll (only valid if hasExtraReroll)
    proSecondRerollIndices?: number[];
    // Index of the slot that the Pro picked (0-2 if initial, 3-5 if reroll, 6-8 if second reroll)
    proPickIndex?: number;
    // Pro's first roll augments (may differ from user's)
    proFirstRoll: (AugmentData | null)[];
    // Pro's second roll augments (after their reroll)
    proSecondRoll: (AugmentData | null)[];
    // Pro's final pick
    proFinalPick: AugmentData | null;
    // Index of which roll pro made their pick (0 = first roll, 1 = second roll)
    proPickRound: 0 | 1;
    explanation?: string;
    // Board State
    playerBoard?: UnitData[];
    // Deprecated singular opponent fields (Use opponents array instead)
    opponentBoard?: UnitData[];
    playerBench?: UnitData[];
    opponentBench?: UnitData[];
    playerState?: {
        gold: number;
        level: number;
        hp: number;
        xp: number;
    };
    opponentState?: {
        gold: number;
        level: number;
        hp: number;
        xp: number;
    };
    // Multi-opponent support (up to 7 opponents)
    opponents?: OpponentData[];
    // Starting items/components available to the player
    startingItems?: (Item | null)[];
}

export interface OpponentData {
    id: string;
    name: string;
    board: UnitData[];
    bench: UnitData[];
    state: {
        gold: number;
        level: number;
        hp: number;
        xp: number;
    };
    augments?: (AugmentData | null)[]; // Optional augments for opponent
    startingItems?: (Item | null)[]; // Starting items/components
}

// Simulated community votes (title -> vote count)
export interface CommunityVotes {
    [augmentTitle: string]: number;
}

// Augment data should be loaded from DB via augmentService
// This fallback uses empty arrays - puzzles from DB should have proper augment references

// Sample puzzle scenarios - augment data should come from DB
// This is a fallback with empty augments - real puzzles should be loaded from DB
export const PUZZLE_SCENARIOS: PuzzleScenario[] = [
    {
        id: 'puzzle-1',
        proPlayer: 'Dishsoap',
        rank: 'Challenger T1',
        stage: '2-1',
        streamUrl: 'https://www.twitch.tv/videos/2345678901',
        date: '1/30/26',
        server: 'NA',
        encounter: 'Component Anvils',
        patch: '16.3b',
        augments: [], // Load from DB
        proFirstRoll: [], // Load from DB
        proSecondRoll: [], // Load from DB
        proFinalPick: null,
        proPickRound: 0,
        explanation: "Air Axiom provides consistent attack speed scaling which is crucial for the planned comp."
    },
    {
        id: 'puzzle-2',
        proPlayer: 'Soju',
        rank: 'Challenger T1',
        stage: '2-1',
        streamUrl: 'https://www.twitch.tv/videos/2345678902',
        date: '1/29/26',
        server: 'NA',
        encounter: 'Gold Opener',
        patch: '16.3b',
        augments: [], // Load from DB
        proFirstRoll: [], // Load from DB
        proSecondRoll: [], // Load from DB
        proFinalPick: null,
        proPickRound: 0,
        explanation: "Fire Axiom offers immediate combat power and healing reduction."
    },
    {
        id: 'puzzle-3',
        proPlayer: 'Ramblinnn',
        rank: 'Grandmaster',
        stage: '2-1',
        streamUrl: 'https://www.twitch.tv/videos/2345678903',
        date: '1/28/26',
        server: 'NA',
        encounter: 'Krugs',
        patch: '16.3a',
        augments: [], // Load from DB
        proFirstRoll: [], // Load from DB
        proSecondRoll: [], // Load from DB
        proFinalPick: null,
        proPickRound: 1,
        explanation: "Pro rerolled for a combat augment and found Fire Axiom."
    }
];

// Generate simulated community votes for given augments
export function generateCommunityVotes(augments: AugmentData[]): CommunityVotes {
    const votes: CommunityVotes = {};

    augments.forEach((aug, index) => {
        // First augment tends to get more votes
        const baseVotes = index === 0 ? 15 : (index === 1 ? 8 : 5);
        votes[aug.title] = baseVotes + Math.floor(Math.random() * 10);
    });

    return votes;
}

// Get current puzzle (can be expanded for puzzle progression)
let currentPuzzleIndex = 0;

export function getCurrentPuzzle(): PuzzleScenario {
    return PUZZLE_SCENARIOS[currentPuzzleIndex];
}

export function getNextPuzzle(): PuzzleScenario {
    currentPuzzleIndex = (currentPuzzleIndex + 1) % PUZZLE_SCENARIOS.length;
    return PUZZLE_SCENARIOS[currentPuzzleIndex];
}

export function resetPuzzleIndex(): void {
    currentPuzzleIndex = 0;
}
