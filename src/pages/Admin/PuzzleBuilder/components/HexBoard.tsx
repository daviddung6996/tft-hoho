import React, { useState } from 'react';
import { UnitData, Champion, Synergy } from '../../../../data/types';
import { AssetImage } from '../../../../hooks/useAssetUrl';
import { SynergyPanel } from '../../../../components/Sidebar/SynergyPanel';
import { calculateHexPosition, getGridDimensions, swapOrMoveToBoard, swapOrMoveToBench, type HexConfig } from '../../../../utils/hexGrid';
import { countBoardUnits, shouldBlockBoardPlacementAtLevelCap } from '../../../../features/puzzle/playerLevel';

// Board configuration
const BOARD_ROWS = 4;
const BOARD_COLS = 7;
const BENCH_SIZE = 9;

// Hex sizing in cqw - synced with Bench CSS
const HEX_CONFIG: HexConfig = {
    WIDTH: 9,
    HEIGHT: 10,
    GAP: 0.5,
};

export interface DragItem {
    type: 'champion' | 'unit';
    data: Champion | UnitData;
    source: 'pool' | 'board' | 'bench';
    sourceIndex?: number;
}

interface HexBoardProps {
    units: UnitData[];
    onUnitsChange: (units: UnitData[]) => void;
    level: number;
    dragItem: DragItem | null;
    onDropSuccess: () => void;
    onSafeDrop: () => void;
    synergies: Synergy[];
    onLevelCapHit?: () => void;
}

const HexBoard: React.FC<HexBoardProps> = ({
    units,
    onUnitsChange,
    level,
    dragItem,
    onDropSuccess,
    onSafeDrop,
    synergies,
    onLevelCapHit,
}) => {
    const [hoverTarget, setHoverTarget] = useState<{ type: 'board' | 'bench'; row?: number; col?: number; index?: number } | null>(null);

    // Separate board and bench units
    const boardUnits = units.filter(u => u.row !== undefined && u.col !== undefined);
    const benchUnits = Array.from({ length: BENCH_SIZE }, (_, i) =>
        units.find(u => u.benchIndex === i) || null
    );

    const handleDropOnBoard = (row: number, col: number) => {
        if (!dragItem) return;

        const isOccupied = boardUnits.some(u => u.row === row && u.col === col);
        const shouldBlock = shouldBlockBoardPlacementAtLevelCap({
            source: dragItem.source,
            boardCount: countBoardUnits(units),
            level,
            targetOccupied: isOccupied,
        });

        if (shouldBlock) {
            onLevelCapHit?.();
            setHoverTarget(null);
            return;
        }

        if (dragItem.source === 'pool') {
            // Adding from champion pool — only allowed on empty cells
            if (isOccupied) return;
            const champ = dragItem.data as Champion;
            const newUnit: UnitData = {
                id: `unit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                name: champ.name,
                row,
                col,
                cost: champ.cost,
                stars: 1,
                image: champ.icon || '',
                items: []
            };
            onUnitsChange([...units, newUnit]);
            onDropSuccess();
        } else if (dragItem.source === 'board') {
            const unit = dragItem.data as UnitData;
            const source = { sourceRow: unit.row, sourceCol: unit.col };
            const updatedUnits = swapOrMoveToBoard(units, unit.id, row, col, source);
            onUnitsChange(updatedUnits);
            onDropSuccess();
        } else if (dragItem.source === 'bench') {
            const unit = dragItem.data as UnitData;
            const source = { sourceBenchIndex: dragItem.sourceIndex };
            const updatedUnits = swapOrMoveToBoard(units, unit.id, row, col, source);
            onUnitsChange(updatedUnits);
            onDropSuccess();
        }

        setHoverTarget(null);
    };

    const handleDropOnBench = (benchIndex: number) => {
        if (!dragItem) return;

        const isOccupied = benchUnits[benchIndex] !== null;

        if (dragItem.source === 'pool') {
            // Adding from champion pool — only allowed on empty slots
            if (isOccupied) return;
            const champ = dragItem.data as Champion;
            const newUnit: UnitData = {
                id: `unit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                name: champ.name,
                benchIndex,
                cost: champ.cost,
                stars: 1,
                image: champ.icon || '',
                items: []
            };
            onUnitsChange([...units, newUnit]);
            onDropSuccess();
        } else if (dragItem.source === 'board') {
            const unit = dragItem.data as UnitData;
            const source = { sourceRow: unit.row, sourceCol: unit.col };
            const updatedUnits = swapOrMoveToBench(units, unit.id, benchIndex, source);
            onUnitsChange(updatedUnits);
            onDropSuccess();
        } else if (dragItem.source === 'bench') {
            const unit = dragItem.data as UnitData;
            const source = { sourceBenchIndex: dragItem.sourceIndex };
            const updatedUnits = swapOrMoveToBench(units, unit.id, benchIndex, source);
            onUnitsChange(updatedUnits);
            onDropSuccess();
        }

        setHoverTarget(null);
    };

    const handleUnitContextMenu = (e: React.MouseEvent, unit: UnitData) => {
        e.preventDefault();
        e.stopPropagation();

        const currentStars = unit.stars || 1;
        // Cycle: 1 -> 2 -> 3 -> 1
        const nextStars = currentStars >= 3 ? 1 : currentStars + 1;

        const updatedUnits = units.map(u =>
            u.id === unit.id ? { ...u, stars: nextStars } : u
        );
        onUnitsChange(updatedUnits);
    };

    const gridDims = getGridDimensions(BOARD_ROWS, BOARD_COLS, HEX_CONFIG);

    return (
        <div
            className="ptb-right-panel"
            style={{ position: 'relative' }}
        >
            {/* Trait Web - Positioned absolutely to prevent layout shift */}
            <div style={{
                position: 'absolute',
                top: '2cqw',
                left: 0,
                width: '100%',
                padding: '0 2cqw',
                display: 'flex',
                justifyContent: 'center',
                zIndex: 10
            }}>
                <SynergyPanel
                    synergies={synergies}
                    className="horizontal"
                />
            </div>

            {/* Board Container - Absolute position to prevent shift */}
            <div
                className="hb-board-container"
                style={{
                    position: 'absolute',
                    top: '14cqw',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 'fit-content'
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                    e.preventDefault();
                    // This fires for drops on the container (gaps between hexes/bench)
                    onSafeDrop();
                }}
            >
                {/* Hex Grid */}
                <div
                    className="hb-hex-grid"
                    style={{
                        width: `${gridDims.width}cqw`,
                        height: `${gridDims.height}cqw`
                    }}
                >
                    {/* Render hex cells */}
                    {Array.from({ length: BOARD_ROWS }).map((_, r) =>
                        Array.from({ length: BOARD_COLS }).map((_, c) => {
                            const { left, top } = calculateHexPosition(r, c, HEX_CONFIG);
                            const isHovered = hoverTarget?.type === 'board' && hoverTarget.row === r && hoverTarget.col === c;
                            const isOccupied = boardUnits.some(u => u.row === r && u.col === c);
                            const dragIsUnit = dragItem?.source === 'board' || dragItem?.source === 'bench';
                            const willSwap = isHovered && isOccupied && dragIsUnit;

                            return (
                                <div
                                    key={`cell-${r}-${c}`}
                                    className={`hb-hex-cell ${isHovered && !willSwap ? 'drag-over' : ''} ${willSwap ? 'drag-over--swap' : ''} ${isOccupied ? 'occupied' : ''}`}
                                    style={{
                                        left: `${left}cqw`,
                                        top: `${top}cqw`,
                                        width: `${HEX_CONFIG.WIDTH}cqw`,
                                        height: `${HEX_CONFIG.HEIGHT}cqw`
                                    }}
                                    onDragOver={(e) => {
                                        e.preventDefault();
                                        setHoverTarget({ type: 'board', row: r, col: c });
                                    }}
                                    onDragLeave={() => setHoverTarget(null)}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleDropOnBoard(r, c);
                                    }}
                                />
                            );
                        })
                    )}

                    {/* Render units on board */}
                    {boardUnits.map(unit => {
                        const { left, top } = calculateHexPosition(unit.row!, unit.col!, HEX_CONFIG);
                        const isDragging = dragItem?.source === 'board' && (dragItem.data as UnitData).id === unit.id;

                        return (
                            <div
                                key={unit.id}
                                data-unit-id={unit.id}
                                className={`hb-unit ${isDragging ? 'dragging' : ''}`}
                                style={{
                                    left: `${left}cqw`,
                                    top: `${top}cqw`,
                                    width: `${HEX_CONFIG.WIDTH}cqw`,
                                    height: `${HEX_CONFIG.HEIGHT}cqw`
                                }}
                                draggable
                                onDragStart={(e) => {
                                    e.dataTransfer.effectAllowed = 'move';
                                    e.dataTransfer.setData('text/plain', unit.id);
                                }}
                                onContextMenu={(e) => handleUnitContextMenu(e, unit)}
                            >
                                <div className={`hb-unit-inner cost-${unit.cost || 1}`}>
                                    <div className="hb-unit-content">
                                        {unit.image ? (
                                            <img
                                                src={unit.image}
                                                alt={unit.name}
                                                className="hb-unit-img"
                                            />
                                        ) : (
                                            <AssetImage
                                                type="champion"
                                                name={unit.name}
                                                alt={unit.name}
                                                className="hb-unit-img"
                                            />
                                        )}
                                    </div>
                                    {(unit.stars || 1) > 1 && (
                                        <div className={`hb-unit-stars stars-${unit.stars}`}>
                                            {'★'.repeat(unit.stars || 1)}
                                        </div>
                                    )}
                                    <div className="hb-unit-name">{unit.name}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Bench */}
                <div className="hb-bench">
                    {benchUnits.map((unit, index) => {
                        const isHovered = hoverTarget?.type === 'bench' && hoverTarget.index === index;
                        const isDragging = dragItem?.source === 'bench' && unit && (dragItem.data as UnitData).id === unit.id;
                        const dragIsUnit = dragItem?.source === 'board' || dragItem?.source === 'bench';
                        const willSwap = isHovered && !!unit && dragIsUnit;

                        return (
                            <div
                                key={`bench-${index}`}
                                className={`hb-bench-slot ${unit ? 'occupied' : ''} ${isHovered && !willSwap ? 'drag-over' : ''} ${willSwap ? 'drag-over--swap' : ''}`}
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    setHoverTarget({ type: 'bench', index });
                                }}
                                onDragLeave={() => setHoverTarget(null)}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleDropOnBench(index);
                                }}
                            >
                                {unit && (
                                    <div
                                        className={`hb-bench-unit cost-${unit.cost || 1} ${isDragging ? 'dragging' : ''}`}
                                        draggable
                                        onContextMenu={(e) => handleUnitContextMenu(e, unit)}
                                    >
                                        {unit.image ? (
                                            <img
                                                src={unit.image}
                                                alt={unit.name}
                                                className="hb-unit-img"
                                            />
                                        ) : (
                                            <AssetImage
                                                type="champion"
                                                name={unit.name}
                                                alt={unit.name}
                                                className="hb-unit-img"
                                            />
                                        )}
                                        {(unit.stars || 1) > 1 && (
                                            <div className={`hb-unit-stars stars-${unit.stars}`}>
                                                {'★'.repeat(unit.stars || 1)}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default HexBoard;
