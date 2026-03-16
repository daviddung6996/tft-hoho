// @vitest-environment jsdom
import { fireEvent, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { Board } from './Board';
import type { UnitData } from '../../data/types';

// Mock child components that require GameDataContext
vi.mock('./BoardComponents/BoardUnit', () => ({
  BoardUnit: ({ unit, isDraggable, isDragging, onPointerDragStart }: any) => {
    const handlePointerDown = (e: React.PointerEvent) => {
      if (!isDraggable || !onPointerDragStart) return;
      const wrapperRef = { current: e.currentTarget as HTMLElement };
      onPointerDragStart(e, {
        unitId: unit.id,
        source: 'board',
        sourceRow: unit.row,
        sourceCol: unit.col,
      }, wrapperRef.current);
    };
    return (
      <div
        className={`board-unit-wrapper ${isDragging ? 'dragging' : ''}`}
        onPointerDown={isDraggable ? handlePointerDown : undefined}
        data-testid={`unit-${unit.id}`}
      >
        {unit.name}
      </div>
    );
  },
}));

vi.mock('./BoardComponents/BenchComponents', () => ({
  BenchArea: () => <div className="bench-container" />,
  OpponentBenchArea: () => <div className="opponent-bench-container" />,
}));

const makeUnit = (overrides: Partial<UnitData> = {}): UnitData => ({
  id: 'unit-1',
  name: 'Test Unit',
  row: 0,
  col: 0,
  cost: 1,
  stars: 1,
  image: '/unit.png',
  ...overrides,
});

describe('Board interaction lock regressions', () => {
  let currentPointerTarget: Element | null;

  beforeEach(() => {
    currentPointerTarget = null;

    // Stub hit-testing and animation timing so pointer-driven drag logic is deterministic in jsdom.
    Object.defineProperty(document, 'elementFromPoint', {
      configurable: true,
      value: vi.fn(() => currentPointerTarget),
    });

    Object.defineProperty(document, 'elementsFromPoint', {
      configurable: true,
      value: vi.fn(() => (currentPointerTarget ? [currentPointerTarget] : [])),
    });

    vi.stubGlobal('requestAnimationFrame', ((cb: FrameRequestCallback) => {
      cb(0);
      return 1;
    }) as typeof requestAnimationFrame);

    vi.stubGlobal('cancelAnimationFrame', vi.fn());
  });

  afterEach(() => {
    document.body.classList.remove('is-dragging');
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  const renderBoard = (options: { isInteractionLocked: boolean; onUnitsChange?: ReturnType<typeof vi.fn> }) => {
    const onUnitsChange = options.onUnitsChange ?? vi.fn();
    const utils = render(
      <Board
        units={[makeUnit()]}
        benchUnits={[]}
        onUnitsChange={onUnitsChange}
        isInteractionLocked={options.isInteractionLocked}
      />,
    );

    const sourceUnit = utils.container.querySelector('.board-unit-wrapper');
    const dropHex = utils.container.querySelector('.hex-cell[data-row="0"][data-col="1"]');

    if (!sourceUnit || !dropHex) {
      throw new Error('Expected board unit and target hex to exist');
    }

    return {
      ...utils,
      onUnitsChange,
      sourceUnit,
      dropHex,
    };
  };

  const startDrag = (sourceUnit: Element) => {
    fireEvent.pointerDown(sourceUnit, { button: 0, clientX: 10, clientY: 10 });
  };

  const movePointerTo = (target: Element, point = { x: 30, y: 30 }) => {
    currentPointerTarget = target;
    fireEvent.pointerMove(document, { clientX: point.x, clientY: point.y });
  };

  const releasePointerOn = (target: Element, point = { x: 30, y: 30 }) => {
    currentPointerTarget = target;
    fireEvent.pointerUp(document, { clientX: point.x, clientY: point.y });
  };

  test('does not start drag when interaction is locked', () => {
    const { sourceUnit, dropHex, onUnitsChange } = renderBoard({ isInteractionLocked: true });

    startDrag(sourceUnit);
    movePointerTo(dropHex);
    releasePointerOn(dropHex);

    expect(onUnitsChange).not.toHaveBeenCalled();
  });

  test('cancels active drag when interaction lock turns on', () => {
    const onUnitsChange = vi.fn();
    const { sourceUnit, dropHex, rerender } = renderBoard({
      isInteractionLocked: false,
      onUnitsChange,
    });

    startDrag(sourceUnit);
    movePointerTo(dropHex);

    expect(document.body.classList.contains('is-dragging')).toBe(true);

    rerender(
      <Board
        units={[makeUnit()]}
        benchUnits={[]}
        onUnitsChange={onUnitsChange}
        isInteractionLocked={true}
      />,
    );

    releasePointerOn(dropHex);

    expect(onUnitsChange).not.toHaveBeenCalled();
    expect(document.body.classList.contains('is-dragging')).toBe(false);
  });

  test('allows drag again after interaction lock turns off', () => {
    const onUnitsChange = vi.fn();
    const { sourceUnit, dropHex, rerender } = renderBoard({
      isInteractionLocked: true,
      onUnitsChange,
    });

    startDrag(sourceUnit);
    movePointerTo(dropHex);
    releasePointerOn(dropHex);

    expect(onUnitsChange).not.toHaveBeenCalled();

    rerender(
      <Board
        units={[makeUnit()]}
        benchUnits={[]}
        onUnitsChange={onUnitsChange}
        isInteractionLocked={false}
      />,
    );

    startDrag(sourceUnit);
    movePointerTo(dropHex, { x: 40, y: 40 });
    releasePointerOn(dropHex, { x: 40, y: 40 });

    expect(onUnitsChange).toHaveBeenCalledWith([
      expect.objectContaining({
        id: 'unit-1',
        row: 0,
        col: 1,
      }),
    ]);
  });
});
