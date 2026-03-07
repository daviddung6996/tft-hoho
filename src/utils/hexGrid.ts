import { UnitData } from '../data/types';

// ============================================================================
// HEX GRID TYPES
// ============================================================================

export interface HexConfig {
    WIDTH: number;   // cqw
    HEIGHT: number;  // cqw
    GAP: number;     // cqw
}

export interface HexPosition {
    left: number;    // cqw
    top: number;     // cqw
}

export interface GridDimensions {
    width: number;   // cqw
    height: number;  // cqw
}

/** Source of a drag operation */
export type DragSource = 'board' | 'bench' | 'pool';

/** Drag item data transferred during drag-and-drop */
export interface DragItem {
    unitId: string;
    source: DragSource;
    sourceRow?: number;
    sourceCol?: number;
    sourceBenchIndex?: number;
}

// ============================================================================
// HEX MATH — Pointy-topped hex grid with offset coordinates
// ============================================================================

/**
 * Calculate absolute pixel position (in cqw) for a hex cell.
 * Uses offset coordinates: even rows aligned left, odd rows offset right by half hex.
 */
export const calculateHexPosition = (
    row: number,
    col: number,
    config: HexConfig
): HexPosition => {
    const { WIDTH, HEIGHT, GAP } = config;
    const offsetX = row % 2 === 0 ? 0 : (WIDTH + GAP) * 0.5;
    return {
        left: col * (WIDTH + GAP) + offsetX,
        top: row * (HEIGHT * 0.75 + GAP * 0.5),
    };
};

/**
 * Calculate total grid dimensions in cqw for a given rows × cols hex grid.
 */
export const getGridDimensions = (
    rows: number,
    cols: number,
    config: HexConfig
): GridDimensions => {
    const { WIDTH, HEIGHT, GAP } = config;
    // Odd rows have an offset, so max width accounts for that
    const maxRowOffset = (WIDTH + GAP) * 0.5;
    const width = (cols - 1) * (WIDTH + GAP) + WIDTH + maxRowOffset;
    const height = (rows - 1) * (HEIGHT * 0.75 + GAP * 0.5) + HEIGHT;
    return { width, height };
};

// ============================================================================
// DRAG-AND-DROP HELPERS
// ============================================================================

/** Serialize drag data into dataTransfer (kept for admin pages that still use HTML5 drag) */
export const setDragData = (e: React.DragEvent, item: DragItem): void => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/json', JSON.stringify(item));
};

/** Deserialize drag data from dataTransfer */
export const getDragData = (e: React.DragEvent): DragItem | null => {
    try {
        const data = e.dataTransfer.getData('application/json');
        if (!data) return null;
        return JSON.parse(data) as DragItem;
    } catch {
        return null;
    }
};

// ============================================================================
// BOARD MOVEMENT LOGIC
// ============================================================================

/** Move a unit to a board cell. Returns updated units array or null if move blocked. */
export const moveUnitToBoard = (
    units: UnitData[],
    unitId: string,
    targetRow: number,
    targetCol: number
): UnitData[] | null => {
    const boardUnits = units.filter(u => u.row !== undefined && u.col !== undefined);
    const isOccupied = boardUnits.some(u => u.row === targetRow && u.col === targetCol && u.id !== unitId);
    if (isOccupied) return null;

    return units.map(u =>
        u.id === unitId
            ? { ...u, row: targetRow, col: targetCol, benchIndex: undefined }
            : u
    );
};

/** Move a unit to a bench slot. Returns updated units array or null if move blocked. */
export const moveUnitToBench = (
    units: UnitData[],
    unitId: string,
    targetBenchIndex: number
): UnitData[] | null => {
    const benchUnits = units.filter(u => u.benchIndex !== undefined);
    const isOccupied = benchUnits.some(u => u.benchIndex === targetBenchIndex && u.id !== unitId);
    if (isOccupied) return null;

    return units.map(u =>
        u.id === unitId
            ? { ...u, row: undefined, col: undefined, benchIndex: targetBenchIndex }
            : u
    );
};

// ============================================================================
// SWAP HELPERS — always succeed, swap units when target is occupied
// ============================================================================

export interface SwapSource {
    sourceRow?: number;
    sourceCol?: number;
    sourceBenchIndex?: number;
}

/**
 * Move/swap a unit onto a board cell.
 * - If target is empty: simply moves the unit there.
 * - If target is occupied by another unit: swaps them.
 * Always returns updated UnitData[].
 */
export const swapOrMoveToBoard = (
    units: UnitData[],
    unitId: string,
    targetRow: number,
    targetCol: number,
    source: SwapSource
): UnitData[] => {
    const occupant = units.find(
        u => u.row === targetRow && u.col === targetCol && u.id !== unitId
    );

    return units.map(u => {
        if (u.id === unitId) {
            return { ...u, row: targetRow, col: targetCol, benchIndex: undefined };
        }
        if (occupant && u.id === occupant.id) {
            if (source.sourceBenchIndex !== undefined) {
                // Occupant goes to bench — set col=benchIndex so BenchArea can find it
                return { ...u, row: undefined, col: source.sourceBenchIndex, benchIndex: source.sourceBenchIndex };
            }
            return { ...u, row: source.sourceRow, col: source.sourceCol, benchIndex: undefined };
        }
        return u;
    });
};

/**
 * Move/swap a unit onto a bench slot.
 * - If target is empty: simply moves the unit there.
 * - If target is occupied by another unit: swaps them.
 * Always returns updated UnitData[].
 * NOTE: bench units must have col=benchIndex so BenchArea (u.col === i) can find them.
 */
export const swapOrMoveToBench = (
    units: UnitData[],
    unitId: string,
    targetBenchIndex: number,
    source: SwapSource
): UnitData[] => {
    const occupant = units.find(
        u => u.benchIndex === targetBenchIndex && u.id !== unitId
    );

    return units.map(u => {
        if (u.id === unitId) {
            // col=targetBenchIndex so BenchArea lookup (u.col === i) works
            return { ...u, row: undefined, col: targetBenchIndex, benchIndex: targetBenchIndex };
        }
        if (occupant && u.id === occupant.id) {
            if (source.sourceRow !== undefined && source.sourceCol !== undefined) {
                // Occupant goes back to board
                return { ...u, row: source.sourceRow, col: source.sourceCol, benchIndex: undefined };
            }
            // Occupant goes to bench — col=benchIndex so BenchArea can find it
            return { ...u, row: undefined, col: source.sourceBenchIndex, benchIndex: source.sourceBenchIndex };
        }
        return u;
    });
};
