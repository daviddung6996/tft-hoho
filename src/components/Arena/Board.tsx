import React from 'react';
import './Board.css';

import { UnitData } from '../../data/types';
import { AugmentData } from '../../services/augmentService';
import { BOARD_CONFIG } from './BoardComponents/BoardConfig';
import { BoardUnit, calculatePosition } from './BoardComponents/BoardUnit';
import { BoardHalf } from './BoardComponents/BoardHalf';
import { OpponentBenchArea, BenchArea } from './BoardComponents/BenchComponents';

interface BoardProps {
    units?: UnitData[];
    benchUnits?: UnitData[];
    isMirrored?: boolean;
    opponentUnits?: UnitData[];
    opponentBenchUnits?: UnitData[];
    augmentTreeUrl?: string; // Dynamic Augment Tree Asset
    opponentAugments?: AugmentData[]; // [NEW] Opponent's augments for the tree
}

/**
 * MAIN COMPONENT: TFT Game Board & Bench
 * Renders 7x4 board + bench. Shows opponent bench when scouting (isMirrored).
 */
export const Board: React.FC<BoardProps> = ({
    units = [],
    benchUnits = [],
    isMirrored = false,
    opponentUnits = [],
    opponentBenchUnits = [],
    augmentTreeUrl,
    opponentAugments = [] // Default to empty array
}) => {
    const boardContainerRef = React.useRef<HTMLDivElement>(null);

    // Board Hex Drop Handler (Keep existing hex logic for units)
    const handleDrop = (e: React.DragEvent, _row: number, _col: number) => {
        e.preventDefault();
        // ... unit logic ...
    };

    // Main Board Drop Handler for Free Movement
    const handleBoardDrop = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault(); // Allow drop
    };

    return (
        <div
            ref={boardContainerRef}
            className={`game-board-container ${isMirrored ? 'rotated-view' : ''}`}
            onDragOver={handleDragOver}
            onDrop={handleBoardDrop}
        >
            {isMirrored ? (
                <>
                    {/* SCOUTING VIEW: Opponent Bench + Board */}
                    <OpponentBenchArea units={opponentBenchUnits} config={BOARD_CONFIG.OPPONENT_BENCH} />
                    <BoardHalf
                        isOpponent={true}
                        units={opponentUnits}
                        hideHexes={false}
                        hexConfig={BOARD_CONFIG.OPPONENT_HEX}
                    />

                    {/* Augment Tree - STATIC POSITION on Opponent Board */}
                    {augmentTreeUrl && (
                        <div
                            className="augment-tree"
                            style={{
                                left: '69.12cqw',
                                top: '17.77cqw',
                                cursor: 'default'
                            }}
                        >
                            {/* Dynamic Augments Popup - Fixed 3 Slots */}
                            <div className="augment-tree-popups">
                                {[0, 1, 2].map((slotIndex) => {
                                    const aug = opponentAugments[slotIndex];
                                    return (
                                        <div key={slotIndex} className="augment-tree-icon" style={{ opacity: aug ? 1 : 0 }}>
                                            {aug && <img src={aug.icon} alt={aug.title} draggable={false} />}
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="augment-tree-inner">
                                <img src={augmentTreeUrl} alt="Augment Tree" draggable={false} />
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <>
                    {/* PLAYER VIEW: Board + Bench */}
                    <div className="board-half player-side">
                        <div className="board-grid">
                            {/* Render grid cells with drop handlers */}
                            {Array.from({ length: BOARD_CONFIG.ROWS }).map((_, r) => (
                                Array.from({ length: BOARD_CONFIG.COLS }).map((_, c) => {
                                    const { left, top } = calculatePosition(r, c, BOARD_CONFIG.HEX);
                                    return (
                                        <div
                                            key={`${r}-${c}`}
                                            className="hex-cell"
                                            style={{
                                                left: `${left}cqw`,
                                                top: `${top}cqw`,
                                                width: `${BOARD_CONFIG.HEX.WIDTH}cqw`,
                                                height: `${BOARD_CONFIG.HEX.HEIGHT}cqw`,
                                            }}
                                            onDragOver={handleDragOver}
                                            onDrop={(e) => handleDrop(e, r, c)}
                                        />
                                    );
                                })
                            ))}

                            {/* Render Units */}
                            {units.filter(u => u.row !== undefined && u.col !== undefined).map(u => (
                                <BoardUnit key={u.id} unit={u as UnitData & { row: number; col: number }} hexConfig={BOARD_CONFIG.HEX} />
                            ))}
                        </div>
                    </div>

                    <BenchArea units={benchUnits} isMirrored={false} config={BOARD_CONFIG.BENCH} />
                </>
            )}
        </div>
    );
};

export { GoldPillarHexes, GoldPillarHexesPlayer } from './BoardComponents/GoldPillars';
