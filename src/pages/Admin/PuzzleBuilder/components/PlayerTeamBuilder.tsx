import React, { useState, useRef, useEffect } from 'react';
import { UnitData, Champion, Synergy } from '../../../../data/types';
import { AugmentData } from '../../../../services/augmentService';
import { Item } from '../../../../services/itemService';
import ChampionPool from './ChampionPool';
import HexBoard, { DragItem } from './HexBoard';
import AugmentSelector from './AugmentSelector';
import GameInfoSelector from './GameInfoSelector';
import ItemChoiceBuilder from './ItemChoiceBuilder';
import './PlayerTeamBuilder.css';

interface PlayerTeamBuilderProps {
    champions: Champion[];
    units: UnitData[];
    onUnitsChange: (units: UnitData[]) => void;
    augments: AugmentData[];
    onAugmentsChange: (augments: AugmentData[]) => void;
    items: (Item | null)[];
    onItemsChange: (items: (Item | null)[]) => void;
    synergies: Synergy[];
    ioniaPathId?: string;
    voidModIds?: string[];
    onIoniaPathChange?: (pathId: string) => void;
    onVoidModsChange?: (modIds: string[]) => void;
}

const PlayerTeamBuilder: React.FC<PlayerTeamBuilderProps> = ({
    champions,
    units,
    onUnitsChange,
    augments,
    onAugmentsChange,
    items,
    onItemsChange,
    synergies,
    ioniaPathId,
    voidModIds,
    onIoniaPathChange,
    onVoidModsChange
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [costFilter, setCostFilter] = useState<number | null>(null);
    const [dragItem, setDragItem] = useState<DragItem | null>(null);

    const dropSuccessRef = useRef(false);
    const safeDropRef = useRef(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Handle drag start from champion pool
    const handlePoolDragStart = (champion: Champion) => {
        if (window.getSelection) { window.getSelection()?.removeAllRanges(); }
        dropSuccessRef.current = false;
        safeDropRef.current = false;
        setDragItem({
            type: 'champion',
            data: champion,
            source: 'pool'
        });
    };

    // Handle drag start from board unit
    const handleBoardUnitDragStart = (unit: UnitData, row: number, col: number) => {
        if (window.getSelection) { window.getSelection()?.removeAllRanges(); }
        dropSuccessRef.current = false;
        safeDropRef.current = false;
        setDragItem({
            type: 'unit',
            data: unit,
            source: 'board',
            sourceIndex: row * 7 + col // encode position
        });
    };

    // Handle drag start from bench unit
    const handleBenchUnitDragStart = (unit: UnitData, benchIndex: number) => {
        if (window.getSelection) { window.getSelection()?.removeAllRanges(); }
        dropSuccessRef.current = false;
        safeDropRef.current = false;
        setDragItem({
            type: 'unit',
            data: unit,
            source: 'bench',
            sourceIndex: benchIndex
        });
    };



    // Handle drop success - called by HexBoard when dropped on valid slot
    const handleDropSuccess = () => {
        dropSuccessRef.current = true;
    };

    // Handle safe drop - called by HexBoard when dropped on board area (even if not in slot)
    const handleSafeDrop = () => {
        safeDropRef.current = true;
    };

    // Handle drag end - check if dragged outside board area
    const handleDragEnd = (_e?: DragEvent | React.DragEvent) => {
        // If dropped successfully on a slot, or safely on the board/bench area (gap), do nothing.
        // If NEITHER (dropped outside), remove the unit.
        if (!dropSuccessRef.current && !safeDropRef.current && dragItem && (dragItem.source === 'board' || dragItem.source === 'bench')) {
            const unit = dragItem.data as UnitData;
            const filtered = units.filter(u => u.id !== unit.id);
            if (filtered.length !== units.length) {
                onUnitsChange(filtered);
            }
        }
        setDragItem(null);
    };

    // Global drag event handlers for board/bench units
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleGlobalDragStart = (e: DragEvent) => {
            const target = e.target as HTMLElement;



            // Check if dragging from board
            const boardUnit = target.closest('.hb-unit');
            if (boardUnit) {
                const unitId = findUnitIdFromElement(boardUnit, units, 'board');
                if (unitId) {
                    const unit = units.find(u => u.id === unitId);
                    if (unit && unit.row !== undefined && unit.col !== undefined) {
                        handleBoardUnitDragStart(unit, unit.row, unit.col);
                    }
                }
                return;
            }

            // Check if dragging from bench
            const benchUnit = target.closest('.hb-bench-unit');
            if (benchUnit) {
                const slot = target.closest('.hb-bench-slot');
                if (slot) {
                    const slots = container.querySelectorAll('.hb-bench-slot');
                    const index = Array.from(slots).indexOf(slot);
                    const unit = units.find(u => u.benchIndex === index);
                    if (unit) {
                        handleBenchUnitDragStart(unit, index);
                    }
                }
            }
        };

        const handleGlobalDragEnd = (e: DragEvent) => {
            handleDragEnd(e);
        };

        container.addEventListener('dragstart', handleGlobalDragStart);
        container.addEventListener('dragend', handleGlobalDragEnd);

        return () => {
            container.removeEventListener('dragstart', handleGlobalDragStart);
            container.removeEventListener('dragend', handleGlobalDragEnd);
        };
    }, [units, dragItem]);

    // Helper to find unit ID from DOM element
    const findUnitIdFromElement = (element: Element, units: UnitData[], _type: 'board' | 'bench'): string | null => {
        // Use data-unit-id attribute if present
        const unitId = element.getAttribute('data-unit-id');
        if (unitId) return unitId;

        // Fallback: find by matching the unit name from the DOM
        const nameEl = element.querySelector('.hb-unit-name');
        if (nameEl) {
            const name = nameEl.textContent?.trim();
            // Find a unit with this name that's on the board
            const matchingUnit = units.find(u =>
                u.name === name && u.row !== undefined && u.col !== undefined
            );
            if (matchingUnit) return matchingUnit.id;
        }

        return null;
    };

    // Handle champion click (add to first available slot)
    const handleChampionSelect = (champion: Champion) => {
        // 1. Try to find empty board slot
        for (let row = 3; row >= 0; row--) { // Fill from backline
            for (let col = 0; col < 7; col++) {
                const isOccupied = units.some(u => u.row === row && u.col === col);
                if (!isOccupied) {
                    const newUnit: UnitData = {
                        id: crypto.randomUUID(),
                        name: champion.name,
                        cost: champion.cost,
                        stars: 1,
                        image: champion.icon,
                        row,
                        col,
                        items: []
                    };
                    onUnitsChange([...units, newUnit]);
                    return;
                }
            }
        }

        // 2. Try to find empty bench slot
        for (let i = 0; i < 9; i++) {
            const isOccupied = units.some(u => u.benchIndex === i);
            if (!isOccupied) {
                const newUnit: UnitData = {
                    id: crypto.randomUUID(),
                    name: champion.name,
                    cost: champion.cost,
                    stars: 1,
                    image: champion.icon,
                    benchIndex: i,
                    items: []
                };
                onUnitsChange([...units, newUnit]);
                return;
            }
        }

        // Board and bench full
        // Board and bench full - silently ignored
    };

    return (
        <div className="ptb-container" ref={containerRef}>
            <ChampionPool
                champions={champions}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                costFilter={costFilter}
                onCostFilterChange={setCostFilter}
                onDragStart={handlePoolDragStart}
                onDragEnd={handleDragEnd}
                onSelect={handleChampionSelect}
            />
            <HexBoard
                units={units}
                onUnitsChange={onUnitsChange}
                dragItem={dragItem}
                onDropSuccess={handleDropSuccess}
                onSafeDrop={handleSafeDrop}
                synergies={synergies}
            />
            <div className="ptb-augments-panel">
                <div style={{ padding: '1cqw', borderBottom: '0.1cqw solid var(--border-subtle)', color: 'var(--text-label)', fontSize: '0.9cqw', fontWeight: 600 }}>
                    AUGMENTS
                </div>
                <AugmentSelector
                    selectedAugments={augments}
                    onAugmentsChange={onAugmentsChange}
                />

                <div style={{ padding: '1cqw', borderBottom: '0.1cqw solid var(--border-subtle)', borderTop: '0.1cqw solid var(--border-subtle)', color: 'var(--text-label)', fontSize: '0.9cqw', fontWeight: 600, marginTop: '2cqw' }}>
                    GAME INFO
                </div>
                <GameInfoSelector
                    selectedIoniaPathId={ioniaPathId}
                    selectedVoidModIds={voidModIds}
                    onIoniaPathChange={onIoniaPathChange || (() => { })}
                    onVoidModsChange={onVoidModsChange || (() => { })}
                />

                <div style={{ padding: '1cqw', borderBottom: '0.1cqw solid var(--border-subtle)', borderTop: '0.1cqw solid var(--border-subtle)', color: 'var(--text-label)', fontSize: '0.9cqw', fontWeight: 600, marginTop: '2cqw' }}>
                    TRANG BỊ
                </div>
                <div style={{ padding: '0.5cqw' }}>
                    <ItemChoiceBuilder
                        items={items || []}
                        onUpdate={onItemsChange}
                    />
                </div>
            </div>
        </div>
    );
};

export default PlayerTeamBuilder;
