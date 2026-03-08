import { describe, expect, it } from 'vitest';
import {
    canAddUnitToBoard,
    countBoardUnits,
    getDefaultLevelForStage,
    getXpToNextLevel,
    sanitizePlayerLevel,
    sanitizePlayerXp,
    shouldBlockBoardPlacementAtLevelCap,
} from './playerLevel';

describe('playerLevel helpers', () => {
    it('falls back to stage defaults for legacy puzzles', () => {
        expect(getDefaultLevelForStage('2-1')).toBe(4);
        expect(getDefaultLevelForStage('3-2')).toBe(6);
        expect(getDefaultLevelForStage('4-2')).toBe(8);
        expect(getDefaultLevelForStage('5-1')).toBe(10);
    });

    it('clamps level into the supported range', () => {
        expect(sanitizePlayerLevel(undefined, '2-1')).toBe(4);
        expect(sanitizePlayerLevel(0)).toBe(1);
        expect(sanitizePlayerLevel(11)).toBe(10);
        expect(sanitizePlayerLevel(6)).toBe(6);
    });

    it('uses TFT xp thresholds and clamps xp to the current level band', () => {
        expect(getXpToNextLevel(3)).toBe(6);
        expect(getXpToNextLevel(10)).toBe(0);
        expect(sanitizePlayerXp(undefined, 3)).toBe(0);
        expect(sanitizePlayerXp(8, 3)).toBe(6);
        expect(sanitizePlayerXp(2, 3)).toBe(2);
        expect(sanitizePlayerXp(99, 10)).toBe(0);
    });

    it('counts only units standing on the board', () => {
        expect(countBoardUnits([
            { id: 'a', name: 'A', row: 0, col: 0, cost: 1, stars: 1, image: '' },
            { id: 'b', name: 'B', row: -1, col: 0, cost: 1, stars: 1, image: '', benchIndex: 0 },
        ])).toBe(1);
    });

    it('blocks only moves that would increase board count past level', () => {
        expect(canAddUnitToBoard(2, 3)).toBe(true);
        expect(canAddUnitToBoard(3, 3)).toBe(false);

        expect(shouldBlockBoardPlacementAtLevelCap({
            source: 'bench',
            boardCount: 3,
            level: 3,
            targetOccupied: false,
        })).toBe(true);

        expect(shouldBlockBoardPlacementAtLevelCap({
            source: 'pool',
            boardCount: 3,
            level: 3,
            targetOccupied: true,
        })).toBe(false);

        expect(shouldBlockBoardPlacementAtLevelCap({
            source: 'board',
            boardCount: 3,
            level: 3,
            targetOccupied: false,
        })).toBe(false);
    });
});

