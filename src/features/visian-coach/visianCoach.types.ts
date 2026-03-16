export interface VisianMessage {
    id: string;
    role: 'user' | 'visian';
    content: string;
    timestamp: number;
    gameContext?: VisianGameContext | null;
}

export interface VisianGameContext {
    stage: string;
    gold: number;
    level: number;
    hp: number;
    augments: string[];
    synergies: string[];
    boardChampions: string[];
    items: string[];
    previousAugment?: string;
}

export const VISIAN_FREE_HOURLY_LIMIT = 5;
