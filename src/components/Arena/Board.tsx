import React from 'react';
import './Board.css';

import { UnitData } from '../../data/types';
import { AugmentData } from '../../services/augmentService';
import { IoniaPath, VoidMod } from '../../data/gameInfoData';
import { BOARD_CONFIG } from './BoardComponents/BoardConfig';
import { BoardUnit, calculatePosition } from './BoardComponents/BoardUnit';
import { BoardHalf } from './BoardComponents/BoardHalf';
import { OpponentBenchArea, BenchArea } from './BoardComponents/BenchComponents';
import { AugmentTooltip } from '../common/HextechTooltip';
import { GameInfoIcons } from './GameInfoIcons';


interface BoardProps {
    units?: UnitData[];
    benchUnits?: UnitData[];
    isMirrored?: boolean;
    opponentUnits?: UnitData[];
    opponentBenchUnits?: UnitData[];
    augmentTreeUrl?: string; // Dynamic Augment Tree Asset
    opponentAugments?: AugmentData[]; // [NEW] Opponent's augments for the tree
    playerAugmentTreeUrl?: string; // Player's Augment Tree Asset
    playerAugments?: AugmentData[]; // Player's augments for the tree
    ioniaPath?: IoniaPath; // [NEW] Current game's Ionia Path
    voidMods?: VoidMod[]; // [NEW] Current game's Void Mods (3 items)
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
    opponentAugments = [], // Default to empty array
    playerAugmentTreeUrl,
    playerAugments = [],
    ioniaPath,
    voidMods = []
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
                            {/* Dynamic Augments Popup - Only show when augments exist */}
                            {opponentAugments.some(aug => aug) && (
                                <div className="augment-tree-popups">
                                    {opponentAugments.filter(aug => aug).map((aug, index) => (
                                        <AugmentTooltip
                                            key={index}
                                            title={aug.title}
                                            description={aug.description || ''}
                                            tier={aug.tier || 2}
                                            position="bottom"
                                        >
                                            <div className="augment-tree-icon" style={{ opacity: 1 }}>
                                                <img src={aug.icon} alt={aug.title} draggable={false} />
                                            </div>
                                        </AugmentTooltip>
                                    ))}
                                </div>
                            )}

                            <div className="augment-tree-inner">
                                <img src={augmentTreeUrl} alt="Augment Tree" draggable={false} />
                            </div>
                        </div>
                    )}

                </>
            ) : (
                <>
                    {/* PLAYER VIEW: Board + Bench */}
                    {/* Game Info Icons - Ionia Path & Void Mods - Display on Player's board */}
                    {ioniaPath && voidMods.length > 0 && (
                        <GameInfoIcons ioniaPath={ioniaPath} voidMods={voidMods} />
                    )}
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
                            {units
                                .filter(u => u.row !== undefined && u.col !== undefined)
                                .sort((a, b) => (a.row! - b.row!) || (a.col! - b.col!))
                                .map(u => (
                                    <BoardUnit key={u.id} unit={u as UnitData & { row: number; col: number }} hexConfig={BOARD_CONFIG.HEX} />
                                ))}
                        </div>
                    </div>

                    <BenchArea units={benchUnits} isMirrored={false} config={BOARD_CONFIG.BENCH} />

                    {/* Augment Tree - STATIC POSITION on Player Board */}
                    {playerAugmentTreeUrl && (
                        <div
                            className="augment-tree player-side"
                            style={{
                                left: '27.98cqw',
                                top: '17.21cqw',
                                cursor: 'default'
                            }}
                        >
                            {playerAugments.some(aug => aug) && (
                                <div className="augment-tree-popups">
                                    {playerAugments.filter(aug => aug).map((aug, index) => (
                                        <AugmentTooltip
                                            key={index}
                                            title={aug.title}
                                            description={aug.description || ''}
                                            tier={aug.tier || 2}
                                            position="bottom"
                                        >
                                            <div className="augment-tree-icon" style={{ opacity: 1 }}>
                                                <img src={aug.icon} alt={aug.title} draggable={false} />
                                            </div>
                                        </AugmentTooltip>
                                    ))}
                                </div>
                            )}

                            <div className="augment-tree-inner">
                                <img src={playerAugmentTreeUrl} alt="Augment Tree" draggable={false} />
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export { GoldPillarHexes, GoldPillarHexesPlayer } from './BoardComponents/GoldPillars';
