import React from 'react';
import { UnitData } from '../../../data/types';
import { calculatePosition, BoardUnit } from './BoardUnit';

// Config needs to be passed or imported. Importing from a central config would be better, 
// but for now we'll match the structure used in Board.tsx
const BOARD_CONFIG = {
    ROWS: 4,
    COLS: 7,
};

interface BoardHalfProps {
    isOpponent: boolean;
    units?: UnitData[];
    hideHexes?: boolean;
    hexConfig: {
        WIDTH: number;
        HEIGHT: number;
        GAP: number;
    };
}

export const BoardHalf: React.FC<BoardHalfProps> = ({ isOpponent, units = [], hideHexes = false, hexConfig }) => {
    // Generate hex grid background cells
    const renderGridCells = () => {
        const cells = [];
        for (let r = 0; r < BOARD_CONFIG.ROWS; r++) {
            for (let c = 0; c < BOARD_CONFIG.COLS; c++) {
                const { left, top } = calculatePosition(r, c, hexConfig);
                cells.push(
                    <div
                        key={`${r}-${c}`}
                        className="hex-cell"
                        style={{
                            left: `${left}cqw`,
                            top: `${top}cqw`,
                            width: `${hexConfig.WIDTH}cqw`,
                            height: `${hexConfig.HEIGHT}cqw`,
                        }}
                    />
                );
            }
        }
        return cells;
    };

    return (
        <div className={`board-half ${isOpponent ? 'opponent-side' : 'player-side'}`}>
            {/* BOARD GRID */}
            <div className="board-grid">
                {!hideHexes && renderGridCells()}
                {!hideHexes && renderGridCells()}
                {units.filter(u => u.row !== undefined && u.col !== undefined).map(u => {
                    // [TRANSFORMATION] Removed inversion to match Builder view (Top-Left stays Top-Left)
                    const displayRow = u.row!;
                    const displayCol = u.col!;

                    // Create visual-only unit with transformed coordinates
                    const visualUnit = { ...u, row: displayRow, col: displayCol };

                    return (
                        <BoardUnit key={u.id} unit={visualUnit} hexConfig={hexConfig} />
                    );
                })}
            </div>
        </div>
    );
};
