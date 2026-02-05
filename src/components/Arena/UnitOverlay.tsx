import React from 'react';
import { BoardUnit } from '../../data/types';
import './UnitOverlay.css';

interface UnitOverlayProps {
    units: BoardUnit[];
    isScouting?: boolean;
}

// Hex grid positioning constants - adjusted to fit the arena background
const HEX_WIDTH = 72;
const HEX_HEIGHT = 83;
const BOARD_OFFSET_X = 260; // Left offset to center on arena
const BOARD_OFFSET_Y = 120;  // Top offset

// Calculate pixel position from hex grid position
const getHexPosition = (row: number, col: number) => {
    const x = BOARD_OFFSET_X + col * HEX_WIDTH + (row % 2 === 1 ? HEX_WIDTH / 2 : 0);
    const y = BOARD_OFFSET_Y + row * (HEX_HEIGHT * 0.78);
    return { x, y };
};

// Get cost-based border color
const getCostColor = (cost: number): string => {
    switch (cost) {
        case 1: return '#808080';
        case 2: return '#11b288';
        case 3: return '#207ac7';
        case 4: return '#c440da';
        case 5: return '#ffb93b';
        default: return '#808080';
    }
};

export const UnitOverlay: React.FC<UnitOverlayProps> = ({ units, isScouting }) => {
    return (
        <div className={`unit-overlay ${isScouting ? 'scouting' : ''}`}>
            {units.map((unit) => {
                const pos = getHexPosition(unit.position.row, unit.position.col);
                const costColor = getCostColor(unit.champion.cost);

                return (
                    <div
                        key={unit.champion.id}
                        className={`unit-hex cost-${unit.champion.cost}`}
                        style={{
                            left: `${pos.x}px`,
                            top: `${pos.y}px`,
                            borderColor: costColor,
                        }}
                        title={`${unit.champion.name} (${unit.champion.traits.join(', ')})`}
                    >
                        <div className="unit-portrait">
                            {unit.champion.icon}
                        </div>
                        {unit.champion.stars > 1 && (
                            <div className={`unit-stars stars-${unit.champion.stars}`}>
                                {Array.from({ length: unit.champion.stars }).map((_, i) => (
                                    <span key={i} className="star">★</span>
                                ))}
                            </div>
                        )}
                        {unit.champion.items && unit.champion.items.length > 0 && (
                            <div className="unit-items">
                                {unit.champion.items.map((item, i) => (
                                    <span key={i} className="item">{item}</span>
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};
