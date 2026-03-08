import { describe, it, expect } from 'vitest';
import { getChosenAugments, getPuzzleStateLevel, getPuzzleStateXp } from './usePuzzleToPlayers';
import type { PuzzleScenario } from '../data/puzzleScenarios';
import type { AugmentData } from '../services/augmentService';

// Helper to create a minimal AugmentData for testing
const makeAugment = (id: string, title: string): AugmentData => ({
  id,
  title,
  description: `${title} description`,
  tier: 2,
  icon: `https://example.com/${id}.png`,
});

// Helper to create a minimal PuzzleScenario with overrides
const makePuzzle = (overrides: Partial<PuzzleScenario>): PuzzleScenario => ({
  id: 'test-puzzle',
  proPlayer: 'TestPlayer',
  rank: 'Challenger',
  stage: '2-1',
  augments: [],
  proFirstRoll: [],
  proSecondRoll: [],
  proFinalPick: null,
  proPickRound: 0,
  ...overrides,
});

describe('getChosenAugments', () => {
  // ── Round 2-1: No augments chosen yet ──────────────────────
  describe('Round 2-1 (no prior choices)', () => {
    it('should return empty array for stage 2-1', () => {
      const puzzle = makePuzzle({
        stage: '2-1',
        augments: [
          makeAugment('aug-1', 'Cơn Mưa Vàng'),
          makeAugment('aug-2', 'Chiến Tướng Khải Hoàn'),
          makeAugment('aug-3', 'Lò Rèn Thần Thoại'),
        ],
      });

      const result = getChosenAugments(puzzle);
      expect(result).toEqual([]);
    });

    it('should return empty even if augment21 is accidentally set on 2-1', () => {
      const puzzle = makePuzzle({
        stage: '2-1',
        augment21: makeAugment('aug-1', 'Gold Rush'),
      });

      const result = getChosenAugments(puzzle);
      expect(result).toEqual([]);
    });
  });

  // ── Round 3-2: 1 prior choice (augment21) ──────────────────
  describe('Round 3-2 (1 prior choice)', () => {
    it('should return only augment21 when set', () => {
      const chosenAug = makeAugment('aug-21', 'First Core');
      const puzzle = makePuzzle({
        stage: '3-2',
        augment21: chosenAug,
        augments: [
          makeAugment('opt-1', 'Option A'),
          makeAugment('opt-2', 'Option B'),
          makeAugment('opt-3', 'Option C'),
        ],
      });

      const result = getChosenAugments(puzzle);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('aug-21');
      expect(result[0].title).toBe('First Core');
    });

    it('should return empty when augment21 is null on 3-2', () => {
      const puzzle = makePuzzle({
        stage: '3-2',
        augment21: null,
      });

      const result = getChosenAugments(puzzle);
      expect(result).toEqual([]);
    });

    it('should return empty when augment21 is undefined on 3-2', () => {
      const puzzle = makePuzzle({
        stage: '3-2',
        // augment21 not set
      });

      const result = getChosenAugments(puzzle);
      expect(result).toEqual([]);
    });
  });

  // ── Round 4-2: 2 prior choices (previousAugments) ─────────
  describe('Round 4-2 (2 prior choices)', () => {
    it('should return previousAugments when set', () => {
      const prev1 = makeAugment('prev-1', 'Core 1');
      const prev2 = makeAugment('prev-2', 'Core 2');
      const puzzle = makePuzzle({
        stage: '4-2',
        previousAugments: [prev1, prev2],
        augments: [
          makeAugment('opt-1', 'Option A'),
          makeAugment('opt-2', 'Option B'),
          makeAugment('opt-3', 'Option C'),
        ],
      });

      const result = getChosenAugments(puzzle);
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('prev-1');
      expect(result[1].id).toBe('prev-2');
    });

    it('should filter out null entries in previousAugments', () => {
      const prev1 = makeAugment('prev-1', 'Core 1');
      const puzzle = makePuzzle({
        stage: '4-2',
        previousAugments: [prev1, null],
      });

      const result = getChosenAugments(puzzle);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('prev-1');
    });

    it('should return empty when previousAugments is undefined on 4-2', () => {
      const puzzle = makePuzzle({
        stage: '4-2',
        // previousAugments not set
      });

      const result = getChosenAugments(puzzle);
      expect(result).toEqual([]);
    });
  });

  // ── Edge cases ─────────────────────────────────────────────
  describe('Edge cases', () => {
    it('should return empty for unknown stages', () => {
      const puzzle = makePuzzle({ stage: '5-1' });
      const result = getChosenAugments(puzzle);
      expect(result).toEqual([]);
    });

    it('should return empty when stage is empty string', () => {
      const puzzle = makePuzzle({ stage: '' });
      const result = getChosenAugments(puzzle);
      expect(result).toEqual([]);
    });
  });
});

describe('player state normalization', () => {
  it('sanitizes legacy missing levels by stage', () => {
    expect(getPuzzleStateLevel('2-1', undefined)).toBe(4);
    expect(getPuzzleStateLevel('3-2', undefined)).toBe(6);
    expect(getPuzzleStateLevel('4-2', undefined)).toBe(8);
    expect(getPuzzleStateLevel('5-1', undefined)).toBe(10);
  });

  it('preserves valid levels and clamps xp to the current threshold', () => {
    expect(getPuzzleStateLevel('3-2', { level: 7 })).toBe(7);
    expect(getPuzzleStateXp('3-2', { level: 3, xp: 2 })).toBe(2);
    expect(getPuzzleStateXp('3-2', { level: 3, xp: 99 })).toBe(6);
    expect(getPuzzleStateXp('3-2', { level: 10, xp: 99 })).toBe(0);
  });
});
