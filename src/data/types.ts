// Champion data type
export interface Champion {
    id: string;
    name: string;
    cost: 1 | 2 | 3 | 4 | 5;
    traits: string[];
    stars: 1 | 2 | 3;
    items?: string[];
    icon: string;
    avatar?: string;
}

// Augment data type
export type AugmentTier = 'silver' | 'gold' | 'prismatic';

export interface Augment {
    id: string;
    name: string;
    description: string;
    tier: AugmentTier;
    icon: string;
}

// Synergy/Trait data type
export interface Synergy {
    id: string;
    name: string;
    breakpoints: number[]; // e.g., [2, 4, 6]
    styles?: number[];     // e.g., [1, 3, 4] mapping to bronze/silver/gold
    activeCount: number;
    icon: string;
}

// Player data type
export interface Player {
    id: string;
    name: string;
    health: number;
    avatar: string;
    isCurrentPlayer?: boolean;
    boardUnits?: BoardUnit[];
}

// Board position
export interface HexPosition {
    row: number;
    col: number;
}

// Unit on board
export interface BoardUnit {
    champion: Champion;
    position: HexPosition;
}

// Common Unit Data for Board/Bench components
export interface UnitData {
    id: string;
    name: string;
    row?: number;
    col?: number;
    benchIndex?: number;
    cost: number;
    stars: number;
    image: string;
    items?: string[]; // Item names/emojis for display
}

// Game state
export interface GameState {
    stage: string; // e.g., "2-1"
    round: number;
    gold: number;
    level: number;
    xp: number;
    xpToNext: number;
    boardUnits: BoardUnit[];
    benchUnits: Champion[];
    synergies: Synergy[];
    players: Player[];
    showAugmentSelection: boolean;
    availableAugments: Augment[];
}
