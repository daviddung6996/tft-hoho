import { UnitData } from './types';
import { AugmentData } from '../services/augmentService';
import { Item } from '../services/itemService';

// Tactician Images
import penguImg from '../assets/tacticians/pengu.webp';

export interface PlayerData {
    id: string;
    name: string;
    avatar: string;
    hp: number;
    gold: number;
    level: number;
    xp: number;
    status: 'active' | 'eliminated';
    isMe: boolean;
    inCombat?: boolean;
    isGhost?: boolean;
    units: UnitData[];
    bench: UnitData[];
    augments?: AugmentData[];
    items?: (Item | null)[];
    arenaId: string;
    augmentTreeUrl?: string;
}

/**
 * Legacy mock export retained only for compatibility with type imports.
 * Runtime player data now comes from Set 17 puzzle payloads and Supabase.
 */
export const MOCK_PLAYERS: PlayerData[] = [
    {
        id: 'preview-player',
        name: 'Pengu',
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
        items: [],
        arenaId: 'summoners_rift',
    },
];
