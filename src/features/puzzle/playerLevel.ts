import { UnitData } from '../../data/types';

export const MIN_PLAYER_LEVEL = 1;
export const MAX_PLAYER_LEVEL = 10;

const DEFAULT_STAGE_LEVELS: Record<string, number> = {
    '2-1': 4,
    '3-2': 6,
    '4-2': 8,
};

const XP_TO_NEXT_LEVEL: Record<number, number> = {
    1: 2,
    2: 2,
    3: 6,
    4: 10,
    5: 20,
    6: 36,
    7: 60,
    8: 68,
    9: 68,
    10: 0,
};

export function getDefaultLevelForStage(stage: string): number {
    return DEFAULT_STAGE_LEVELS[stage] ?? MAX_PLAYER_LEVEL;
}

export function sanitizePlayerLevel(level: unknown, stage?: string): number {
    const parsedLevel = Number(level);
    const fallbackLevel = getDefaultLevelForStage(stage || '');
    const nextLevel = Number.isFinite(parsedLevel) ? parsedLevel : fallbackLevel;
    return Math.min(MAX_PLAYER_LEVEL, Math.max(MIN_PLAYER_LEVEL, Math.floor(nextLevel)));
}

export function getXpToNextLevel(level: number): number {
    return XP_TO_NEXT_LEVEL[sanitizePlayerLevel(level)] ?? 0;
}

export function sanitizePlayerXp(xp: unknown, level: unknown, stage?: string): number {
    const sanitizedLevel = sanitizePlayerLevel(level, stage);
    const maxXp = getXpToNextLevel(sanitizedLevel);
    if (maxXp <= 0) return 0;

    const parsedXp = Number(xp);
    const nextXp = Number.isFinite(parsedXp) ? Math.floor(parsedXp) : 0;
    return Math.min(maxXp, Math.max(0, nextXp));
}

export function countBoardUnits(units: UnitData[]): number {
    return units.filter(unit => unit.row !== undefined && unit.row >= 0 && unit.col !== undefined).length;
}

export function canAddUnitToBoard(boardCount: number, level: number): boolean {
    return boardCount < sanitizePlayerLevel(level);
}

export function isBoardAtLevelCap(boardUnits: UnitData[], level: number): boolean {
    return !canAddUnitToBoard(countBoardUnits(boardUnits), level);
}

export function shouldBlockBoardPlacementAtLevelCap(params: {
    source: 'board' | 'bench' | 'pool';
    boardCount: number;
    level: number;
    targetOccupied: boolean;
}): boolean {
    const { source, boardCount, level, targetOccupied } = params;

    if (source === 'board') return false;
    if (targetOccupied) return false;
    return !canAddUnitToBoard(boardCount, level);
}

