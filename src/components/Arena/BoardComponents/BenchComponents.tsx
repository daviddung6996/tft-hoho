import React, { useRef } from 'react';
import { UnitData } from '../../../data/types';
import { UnitVisual } from './UnitVisual';
import { type DragItem } from '../../../utils/hexGrid';

const BENCH_SLOTS = 9;

interface BenchProps {
    units?: UnitData[];
    isMirrored?: boolean;
    config: { WIDTH: number; HEIGHT: number };
    isDraggable?: boolean;
    draggingUnitId?: string | null;
    onPointerDragStart?: (e: React.PointerEvent, item: DragItem, sourceEl: HTMLElement) => void;
}

const BenchUnit: React.FC<{
    unit: UnitData;
    benchIndex: number;
    isDraggable: boolean;
    isDragging: boolean;
    onPointerDragStart?: (e: React.PointerEvent, item: DragItem, sourceEl: HTMLElement) => void;
}> = ({ unit, benchIndex, isDraggable, isDragging, onPointerDragStart }) => {
    const wrapperRef = useRef<HTMLDivElement>(null);

    const handlePointerDown = (e: React.PointerEvent) => {
        if (!isDraggable || !onPointerDragStart || !wrapperRef.current) return;
        const dragItem: DragItem = {
            unitId: unit.id,
            source: 'bench',
            sourceBenchIndex: benchIndex,
        };
        onPointerDragStart(e, dragItem, wrapperRef.current);
    };

    return (
        <div
            ref={wrapperRef}
            className={`bench-unit-wrapper ${isDragging ? 'dragging' : ''}`}
            style={{ width: '100%', height: '100%', position: 'relative', zIndex: 5, touchAction: isDraggable ? 'none' : undefined }}
            onPointerDown={isDraggable ? handlePointerDown : undefined}
        >
            <UnitVisual unit={unit} />
        </div>
    );
};

export const BenchArea: React.FC<BenchProps> = ({
    units = [],
    isMirrored = false,
    config,
    isDraggable = false,
    draggingUnitId,
    onPointerDragStart,
}) => {
    return (
        <div className={`bench-container ${isMirrored ? 'mirrored' : ''}`}>
            {Array.from({ length: BENCH_SLOTS }).map((_, i) => {
                const unit = units.find(u => u.col === i);
                const isUnitDragging = unit && draggingUnitId === unit.id;

                return (
                    <div
                        key={i}
                        className="bench-slot"
                        style={{
                            width: `${config.WIDTH}cqw`,
                            height: `${config.HEIGHT}cqw`,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            position: 'relative'
                        }}
                    >
                        {/* Background Hex - Has Clip Path */}
                        <div
                            className={!isMirrored ? 'hex-cell' : ''}
                            style={{
                                position: 'absolute',
                                inset: 0,
                                width: '100%',
                                height: '100%'
                            }}
                        />

                        {/* Unit Container */}
                        {unit && (
                            <BenchUnit
                                unit={unit}
                                benchIndex={i}
                                isDraggable={isDraggable}
                                isDragging={!!isUnitDragging}
                                onPointerDragStart={onPointerDragStart}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export const OpponentBenchArea: React.FC<{ units?: UnitData[], config: { WIDTH: number; HEIGHT: number } }> = ({ units = [], config }) => {
    return (
        <div className="opponent-bench-container">
            {Array.from({ length: BENCH_SLOTS }).map((_, i) => {
                const unit = units.find(u => u.col === i);
                return (
                    <div
                        key={i}
                        className="bench-slot"
                        style={{
                            width: `${config.WIDTH}cqw`,
                            height: `${config.HEIGHT}cqw`,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            position: 'relative'
                        }}
                    >
                        {/* Background Hex */}
                        <div
                            className="hex-cell"
                            style={{
                                position: 'absolute',
                                inset: 0,
                                width: '100%',
                                height: '100%'
                            }}
                        />

                        {/* Unit Container */}
                        {unit && (
                            <div className="bench-unit-wrapper" style={{ width: '100%', height: '100%', position: 'relative', zIndex: 5 }}>
                                <UnitVisual unit={unit} />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};
