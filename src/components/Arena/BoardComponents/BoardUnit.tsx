import React from 'react';
import { UnitData } from '../../../data/types';
import { UnitVisual } from './UnitVisual';

/**
 * HELPER: Calculates the absolute X, Y position for a hex cell in cqw.
 */
export const calculatePosition = (row: number, col: number, config: { WIDTH: number; HEIGHT: number; GAP: number }) => {
    const { WIDTH, HEIGHT, GAP } = config;
    const offsetX = row % 2 === 0 ? 0 : (WIDTH + GAP) * 0.5;
    return {
        left: col * (WIDTH + GAP) + offsetX,
        top: row * (HEIGHT * 0.75 + GAP * 0.5)
    };
};

export const BoardUnit: React.FC<{ unit: UnitData, hexConfig: { WIDTH: number; HEIGHT: number; GAP: number } }> = ({ unit, hexConfig }) => {
    const { left, top } = calculatePosition(unit.row || 0, unit.col || 0, hexConfig);
    const { WIDTH, HEIGHT } = hexConfig;

    return (
        <div
            className="board-unit-wrapper"
            style={{
                left: `${left}cqw`,
                top: `${top}cqw`,
                width: `${WIDTH}cqw`,
                height: `${HEIGHT}cqw`,
            }}
        >
            <UnitVisual unit={unit} />
        </div>
    );
};
