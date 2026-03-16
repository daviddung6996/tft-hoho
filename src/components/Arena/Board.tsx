import React, { useState, useCallback, useRef, useEffect } from 'react';
import './Board.css';

import { UnitData } from '../../data/types';
import { AugmentData } from '../../services/augmentService';
import { IoniaPath, VoidMod } from '../../data/gameInfoData';
import { BOARD_CONFIG } from './BoardComponents/BoardConfig';
import { BoardUnit } from './BoardComponents/BoardUnit';
import { BoardHalf } from './BoardComponents/BoardHalf';
import { OpponentBenchArea, BenchArea } from './BoardComponents/BenchComponents';
import { AugmentTooltip } from '../common/HextechTooltip';
import { GameInfoIcons } from './GameInfoIcons';
import { swapOrMoveToBoard, swapOrMoveToBench, type DragItem } from '../../utils/hexGrid';
import { calculateHexPosition } from '../../utils/hexGrid';
import { MAX_PLAYER_LEVEL, countBoardUnits, shouldBlockBoardPlacementAtLevelCap } from '../../features/puzzle/playerLevel';


interface BoardProps {
    units?: UnitData[];
    benchUnits?: UnitData[];
    isMirrored?: boolean;
    opponentUnits?: UnitData[];
    opponentBenchUnits?: UnitData[];
    augmentTreeUrl?: string;
    opponentAugments?: AugmentData[];
    playerAugmentTreeUrl?: string;
    playerAugments?: AugmentData[];
    ioniaPath?: IoniaPath;
    voidMods?: VoidMod[];
    streakCount?: number;
    onUnitsChange?: (units: UnitData[]) => void;
    playerLevel?: number;
    onLevelCapHit?: () => void;
    isInteractionLocked?: boolean;
}

/**
 * MAIN COMPONENT: TFT Game Board & Bench
 * Renders 7x4 board + bench. Shows opponent bench when scouting (isMirrored).
 * Uses pointer events for drag-and-drop (not HTML5 Drag API) to keep custom cursor.
 */
export const Board: React.FC<BoardProps> = ({
    units = [],
    benchUnits = [],
    isMirrored = false,
    opponentUnits = [],
    opponentBenchUnits = [],
    augmentTreeUrl,
    opponentAugments = [],
    playerAugmentTreeUrl,
    playerAugments = [],
    ioniaPath,
    voidMods = [],
    streakCount,
    onUnitsChange,
    playerLevel = MAX_PLAYER_LEVEL,
    onLevelCapHit,
    isInteractionLocked = false,
}) => {
    const boardContainerRef = useRef<HTMLDivElement>(null);
    const [draggingUnitId, setDraggingUnitId] = useState<string | null>(null);

    const allPlayerUnits = React.useMemo(() => {
        const bench = benchUnits.map((u, i) => ({ ...u, benchIndex: u.benchIndex ?? i }));
        return [...units, ...bench];
    }, [units, benchUnits]);

    const isInteractive = !isMirrored && !!onUnitsChange && !isInteractionLocked;

    // Refs for latest values — avoids stale closures in pointer listeners
    const allUnitsRef = useRef(allPlayerUnits);
    const onUnitsChangeRef = useRef(onUnitsChange);
    allUnitsRef.current = allPlayerUnits;
    onUnitsChangeRef.current = onUnitsChange;

    // ========================================================================
    // POINTER-BASED DRAG-AND-DROP (perf-optimized)
    // ========================================================================

    const dragRef = useRef<DragItem | null>(null);
    const ghostRef = useRef<HTMLDivElement | null>(null);
    const dragStartPos = useRef({ x: 0, y: 0 });
    const isDragActive = useRef(false);
    const lastHighlightRef = useRef<Element | null>(null);

    const DRAG_THRESHOLD = 2;

    const clearHighlight = useCallback(() => {
        if (lastHighlightRef.current) {
            lastHighlightRef.current.classList.remove('drag-over', 'drag-over--swap');
            lastHighlightRef.current = null;
        }
    }, []);

    const applyDrop = useCallback((clientX: number, clientY: number) => {
        // elementsFromPoint sees through pointer-events:none ghost — no display toggle needed
        const els = document.elementsFromPoint(clientX, clientY);
        if (!dragRef.current) return;

        const drag = dragRef.current;
        const unitId = drag.unitId;
        const units = allUnitsRef.current;
        const onChange = onUnitsChangeRef.current;
        if (!onChange) return;

        const source = {
            sourceRow: drag.sourceRow,
            sourceCol: drag.sourceCol,
            sourceBenchIndex: drag.sourceBenchIndex,
        };

        // Board hex — search through all elements at point to find hex-cell under unit
        const hex = els.map(e => e.closest('.hex-cell[data-row]')).find(Boolean) as HTMLElement | null;
        if (hex) {
            const targetRow = +hex.dataset.row!;
            const targetCol = +hex.dataset.col!;
            const targetOccupied = units.some(u => u.row === targetRow && u.col === targetCol && u.id !== unitId);
            const shouldBlock = shouldBlockBoardPlacementAtLevelCap({
                source: drag.source,
                boardCount: countBoardUnits(units),
                level: playerLevel,
                targetOccupied,
            });

            if (shouldBlock) {
                onLevelCapHit?.();
                return;
            }

            const result = swapOrMoveToBoard(units, unitId, targetRow, targetCol, source);
            onChange([
                ...result.filter(u => u.row !== undefined && u.row >= 0 && u.col !== undefined),
                ...result.filter(u => u.benchIndex !== undefined),
            ]);
            return;
        }

        // Bench slot — search through all elements at point
        const slot = els.map(e => e.closest('.bench-slot')).find(Boolean) as HTMLElement | null;
        if (slot) {
            const container = slot.closest('.bench-container');
            if (container) {
                const idx = Array.from(container.querySelectorAll('.bench-slot')).indexOf(slot);
                if (idx >= 0) {
                    const result = swapOrMoveToBench(units, unitId, idx, source);
                    onChange([
                        ...result.filter(u => u.row !== undefined && u.row >= 0 && u.col !== undefined),
                        ...result.filter(u => u.benchIndex !== undefined),
                    ]);
                }
            }
        }
    }, [onLevelCapHit, playerLevel]);

    const sourceElRef = useRef<HTMLElement | null>(null);

    const cleanup = useCallback(() => {
        clearHighlight();
        if (ghostRef.current) { ghostRef.current.remove(); ghostRef.current = null; }
        // Restore source unit inline styles set during drag start
        if (sourceElRef.current) {
            sourceElRef.current.style.opacity = '';
            sourceElRef.current.style.pointerEvents = '';
            sourceElRef.current = null;
        }
        setDraggingUnitId(null);
        document.body.classList.remove('is-dragging');
        dragRef.current = null;
        isDragActive.current = false;
    }, [clearHighlight]);

    const handlePointerDown = useCallback((e: React.PointerEvent, item: DragItem, sourceEl: HTMLElement) => {
        if (!isInteractive || e.button !== 0) return;
        e.preventDefault();

        dragRef.current = item;
        dragStartPos.current = { x: e.clientX, y: e.clientY };
        isDragActive.current = false;

        // Cache source dimensions + grab offset (exact click position within unit)
        const rect = sourceEl.getBoundingClientRect();
        const sourceHTML = sourceEl.innerHTML;
        const grabX = e.clientX - rect.left;
        const grabY = e.clientY - rect.top;

        let rafId: number | null = null;
        let lastMouseX = 0;
        let lastMouseY = 0;

        const onMove = (me: PointerEvent) => {
            if (!dragRef.current) return;

            if (!isDragActive.current) {
                const dx = me.clientX - dragStartPos.current.x;
                const dy = me.clientY - dragStartPos.current.y;
                if (dx * dx + dy * dy < DRAG_THRESHOLD * DRAG_THRESHOLD) return;

                isDragActive.current = true;
                sourceEl.style.opacity = '0';
                sourceEl.style.pointerEvents = 'none';
                sourceElRef.current = sourceEl;
                setDraggingUnitId(dragRef.current.unitId);
                document.body.classList.add('is-dragging');

                // Ghost: fixed at 0,0 — moved via transform3d (GPU, no layout thrash)
                const ghost = document.createElement('div');
                ghost.className = 'pointer-drag-ghost';
                ghost.style.cssText = `position:fixed;top:0;left:0;pointer-events:none;z-index:99999;width:${rect.width}px;height:${rect.height}px;will-change:transform;transform:translate3d(${me.clientX - grabX}px,${me.clientY - grabY}px,0);`;
                ghost.innerHTML = sourceHTML;
                document.body.appendChild(ghost);
                ghostRef.current = ghost;
            }

            // Move ghost via transform3d — GPU compositing, zero layout thrash
            ghostRef.current!.style.transform =
                `translate3d(${me.clientX - grabX}px,${me.clientY - grabY}px,0)`;

            // Throttle hit-test to one per animation frame
            lastMouseX = me.clientX;
            lastMouseY = me.clientY;
            if (rafId) return;
            rafId = requestAnimationFrame(() => {
                rafId = null;
                if (!dragRef.current) return;

                // pointer-events:none on ghost → elementFromPoint sees through it directly
                const target = document.elementFromPoint(lastMouseX, lastMouseY);
                const newHighlight = (
                    target?.closest('.hex-cell[data-row]') ||
                    target?.closest('.bench-slot') ||
                    null
                ) as Element | null;

                if (newHighlight !== lastHighlightRef.current) {
                    clearHighlight();
                    if (newHighlight) {
                        const units = allUnitsRef.current;
                        const dragUnitId = dragRef.current?.unitId;
                        let isOccupied = false;

                        if (newHighlight.classList.contains('hex-cell')) {
                            const hexEl = newHighlight as HTMLElement;
                            const r = +hexEl.dataset.row!;
                            const c = +hexEl.dataset.col!;
                            isOccupied = units.some(u => u.row === r && u.col === c && u.id !== dragUnitId);
                        } else if (newHighlight.classList.contains('bench-slot')) {
                            const container = newHighlight.closest('.bench-container');
                            if (container) {
                                const idx = Array.from(container.querySelectorAll('.bench-slot')).indexOf(newHighlight);
                                isOccupied = units.some(u => u.benchIndex === idx && u.id !== dragUnitId);
                            }
                        }

                        newHighlight.classList.add(isOccupied ? 'drag-over--swap' : 'drag-over');
                        lastHighlightRef.current = newHighlight;
                    }
                }
            });
        };

        const onUp = (ue: PointerEvent) => {
            if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
            document.removeEventListener('pointermove', onMove);
            document.removeEventListener('pointerup', onUp);

            if (isDragActive.current && dragRef.current) {
                applyDrop(ue.clientX, ue.clientY);
            }
            cleanup();
        };

        document.addEventListener('pointermove', onMove);
        document.addEventListener('pointerup', onUp);
    }, [isInteractive, clearHighlight, applyDrop, cleanup]);

    useEffect(() => {
        if (!isInteractionLocked) return;
        if (!dragRef.current && !isDragActive.current) return;
        cleanup();
    }, [isInteractionLocked, cleanup]);

    // Cleanup on unmount
    useEffect(() => cleanup, [cleanup]);

    return (
        <div
            ref={boardContainerRef}
            className={`game-board-container ${isMirrored ? 'rotated-view' : ''}`}
        >
            {isMirrored ? (
                <>
                    <OpponentBenchArea units={opponentBenchUnits} config={BOARD_CONFIG.OPPONENT_BENCH} />
                    <BoardHalf
                        isOpponent={true}
                        units={opponentUnits}
                        hideHexes={false}
                        hexConfig={BOARD_CONFIG.OPPONENT_HEX}
                    />

                    {augmentTreeUrl && (
                        <div
                            className="augment-tree"
                            style={{
                                left: '69.12cqw',
                                top: '17.77cqw',
                                cursor: 'default'
                            }}
                        >
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
                    {ioniaPath && voidMods.length > 0 && (
                        <GameInfoIcons ioniaPath={ioniaPath} voidMods={voidMods} streakCount={streakCount} />
                    )}
                    <div className="board-half player-side">
                        <div className="board-grid">
                            {Array.from({ length: BOARD_CONFIG.ROWS }).map((_, r) => (
                                Array.from({ length: BOARD_CONFIG.COLS }).map((_, c) => {
                                    const { left, top } = calculateHexPosition(r, c, BOARD_CONFIG.HEX);
                                    return (
                                        <div
                                            key={`${r}-${c}`}
                                            className="hex-cell"
                                            data-row={r}
                                            data-col={c}
                                            style={{
                                                left: `${left}cqw`,
                                                top: `${top}cqw`,
                                                width: `${BOARD_CONFIG.HEX.WIDTH}cqw`,
                                                height: `${BOARD_CONFIG.HEX.HEIGHT}cqw`,
                                            }}
                                        />
                                    );
                                })
                            ))}

                            {units
                                .filter(u => u.row !== undefined && u.row >= 0 && u.col !== undefined)
                                .sort((a, b) => (a.row! - b.row!) || (a.col! - b.col!))
                                .map(u => (
                                    <BoardUnit
                                        key={u.id}
                                        unit={u as UnitData & { row: number; col: number }}
                                        hexConfig={BOARD_CONFIG.HEX}
                                        isDraggable={isInteractive}
                                        isDragging={draggingUnitId === u.id}
                                        onPointerDragStart={handlePointerDown}
                                    />
                                ))}
                        </div>
                    </div>

                    <BenchArea
                        units={benchUnits}
                        isMirrored={false}
                        config={BOARD_CONFIG.BENCH}
                        isDraggable={isInteractive}
                        draggingUnitId={draggingUnitId}
                        onPointerDragStart={handlePointerDown}
                    />

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
