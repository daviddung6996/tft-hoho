export type AugmentId = string;
export type AugmentRarity = 'silver' | 'gold' | 'prismatic';

export interface PuzzleAugment {
    id: AugmentId;
    title: string;
    description: string;
    icon: string;
    rarity: AugmentRarity;
}

export type ProActionType = 'REROLL' | 'PICK';

export interface ProAction {
    step: number;        // 1-based index of the action
    type: ProActionType;
    slotIndex: number;   // 0, 1, or 2

    // If type is 'REROLL', this is the ID of the new augment that appears
    resultAugmentId?: AugmentId;
}

// Snapshots for Game State
export interface UnitSnapshot {
    characterId: string; // e.g., "TFT13_Jinx"
    name: string;
    rarity: number; // 0-5 (Cost)
    stars: 1 | 2 | 3;
    items: string[]; // List of item IDs/names
    position: { row: number; col: number }; // Hex coordinates
}

export interface PlayerSnapshot {
    name: string;
    health: number;
    level: number;
    gold: number;
    xp: number;
    activeTraits: Record<string, number>; // e.g., { "Sniper": 2 }
    board: UnitSnapshot[];
    bench: UnitSnapshot[];
}

export interface PuzzleState {
    player: PlayerSnapshot;
    opponent: PlayerSnapshot; // The specific opponent being faced
    gameInfo: {
        stage: string;   // "3-2"
        round: number;
        encounter: string; // "Scuttle Puddle"
    };
}

export interface PuzzleMetadata {
    title: string;        // e.g., "2-1 Augments"
    patch: string;        // e.g., "16.3b"
    date: string;         // ISO Date "2025-01-31"
    proPlayer: string;    // e.g., "Pengu"
    proRank: string;      // e.g., "Set 16 T1"
    encounter: string;    // e.g., "Howling Abyss"

    // The "See Pro Pick" Button Data
    vodUrl: string;       // Link to Twitch/YouTube
    vodTimestamp?: number; // Specific timestamp in seconds
}

export interface Puzzle {
    id: string; // Unique ID
    metadata: PuzzleMetadata;

    // The context for the puzzle (Board, Gold, HP, etc.)
    initialState: PuzzleState;

    // The augments shown when the puzzle starts (before any user rerolls)
    initialAugments: [PuzzleAugment, PuzzleAugment, PuzzleAugment];

    // The exact sequence of actions the pro took
    proHistory: ProAction[];
}
