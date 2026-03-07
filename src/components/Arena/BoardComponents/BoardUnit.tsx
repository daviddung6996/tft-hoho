import React, { useRef } from 'react';
import { UnitData } from '../../../data/types';
import { UnitVisual } from './UnitVisual';
import { calculateHexPosition, type HexConfig, type DragItem } from '../../../utils/hexGrid';

// Re-export calculatePosition for backward compatibility
export const calculatePosition = calculateHexPosition;

interface BoardUnitProps {
    unit: UnitData & { row: number; col: number };
    hexConfig: HexConfig;
    isDraggable?: boolean;
    isDragging?: boolean;
    onPointerDragStart?: (e: React.PointerEvent, item: DragItem, sourceEl: HTMLElement) => void;
}

export const BoardUnit: React.FC<BoardUnitProps> = ({ unit, hexConfig, isDraggable = false, isDragging = false, onPointerDragStart }) => {
    const { left, top } = calculateHexPosition(unit.row, unit.col, hexConfig);
    const { WIDTH, HEIGHT } = hexConfig;
    const wrapperRef = useRef<HTMLDivElement>(null);

    const handlePointerDown = (e: React.PointerEvent) => {
        if (!isDraggable || !onPointerDragStart || !wrapperRef.current) return;
        const dragItem: DragItem = {
            unitId: unit.id,
            source: 'board',
            sourceRow: unit.row,
            sourceCol: unit.col,
        };
        onPointerDragStart(e, dragItem, wrapperRef.current);
    };

    return (
        <div
            ref={wrapperRef}
            className={`board-unit-wrapper ${isDragging ? 'dragging' : ''}`}
            style={{
                left: `${left}cqw`,
                top: `${top}cqw`,
                width: `${WIDTH}cqw`,
                height: `${HEIGHT}cqw`,
                touchAction: isDraggable ? 'none' : undefined,
            }}
            onPointerDown={isDraggable ? handlePointerDown : undefined}
        >
            <UnitVisual unit={unit} />
        </div>
    );
};
