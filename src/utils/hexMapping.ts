import { UnitData } from '../data/types';

// Board configurations matching HexBoard.tsx and Board.tsx
const BOARD_ROWS = 4;
const BOARD_COLS = 7;

/**
 * Transforms a unit's coordinates from the Data/Storage format to the Visual/Builder format.
 * 
 * For Opponents:
 * Data is stored as if the board is inverted (standard gameplay view logic).
 * Visual Builder should show "What You See Is What You Get".
 * So we invert the data coordinates back to visual coordinates.
 * 
 * Data (3, 6) -> Visual (0, 0)
 */
export const transformToVisual = (unit: UnitData, isOpponent: boolean): UnitData => {
    if (!isOpponent || unit.row === undefined || unit.col === undefined) {
        return unit;
    }

    return {
        ...unit,
        row: (BOARD_ROWS - 1) - unit.row,
        col: (BOARD_COLS - 1) - unit.col
    };
};

/**
 * Transforms a unit's coordinates from the Visual/Builder format to the Data/Storage format.
 * 
 * For Opponents:
 * Visual Builder puts unit at (0, 0) (Top Left).
 * Gameplay expects this to be at (3, 6) (Bottom Right relative to empty board, inverted render).
 */
export const transformToData = (unit: UnitData, isOpponent: boolean): UnitData => {
    if (!isOpponent || unit.row === undefined || unit.col === undefined) {
        return unit;
    }

    return {
        ...unit,
        row: (BOARD_ROWS - 1) - unit.row,
        col: (BOARD_COLS - 1) - unit.col
    };
};

/**
 * Helper to get human-readable hex label (e.g., "A1")
 * Rows: 0->A, 1->B, 2->C, 3->D
 * Cols: 0->1, 1->2...
 */
export const getHexLabel = (row: number, col: number): string => {
    const rowChar = String.fromCharCode(65 + row); // 65 is 'A'
    return `${rowChar}${col + 1}`;
};
