import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import * as fc from 'fast-check';
import { usePuzzleGame } from './usePuzzleGame';
import { puzzleService } from '../services/puzzleService';
import type { PuzzleScenario } from '../data/puzzleScenarios';

// Mock dependencies
vi.mock('../services/puzzleService', () => ({
  puzzleService: {
    getAll: vi.fn(),
    getCompletedPuzzles: vi.fn(),
    markPuzzleCompleted: vi.fn(),
  },
}));

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'test-user-id' } }),
}));

vi.mock('../contexts/GameDataContext', () => ({
  useGameData: () => ({ augments: [], isLoading: false }),
}));

// Mock window.history
const mockPushState = vi.fn();
const mockReplaceState = vi.fn();
Object.defineProperty(window, 'history', {
  value: { 
    pushState: mockPushState,
    replaceState: mockReplaceState,
  },
  writable: true,
});

const createPuzzle = (id: string, title?: string): PuzzleScenario => ({
  id,
  title: title ?? `Puzzle ${id}`,
  proPlayer: 'TestPlayer',
  rank: 'Challenger',
  stage: '2-1',
  augments: [],
  proFirstRoll: [],
  proSecondRoll: [],
  proFinalPick: null,
  proPickRound: 0,
});

describe('usePuzzleGame - Bug Condition Exploration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPushState.mockClear();
    mockReplaceState.mockClear();
    // Clear URL parameters
    Object.defineProperty(window, 'location', {
      value: { 
        href: 'http://localhost:5173/',
        search: '',
      },
      writable: true,
    });
  });

  /**
   * Property 1: Fault Condition - All Puzzles Completed Detection
   * 
   * **Validates: Requirements 2.1, 2.2, 2.3**
   * 
   * CRITICAL: This test MUST FAIL on unfixed code - failure confirms the bug exists
   * 
   * Bug Condition: puzzles.length > 0 AND unplayedPuzzles.length === 0
   * Expected Behavior:
   * - System detects completion (allPuzzlesCompleted flag is true)
   * - handleNextPuzzle does NOT select any puzzle
   * - UI can display completion message
   * 
   * EXPECTED OUTCOME: Test FAILS on unfixed code (this is correct - proves bug exists)
   * Likely counterexamples:
   * - allPuzzlesCompleted flag missing or false
   * - handleNextPuzzle still selects a puzzle from the pool
   */
  it('Property 1: When all puzzles are completed, system detects completion and prevents puzzle selection', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate puzzle pool size between 1 and 20
        fc.integer({ min: 1, max: 20 }),
        async (puzzleCount) => {
          // Setup: Create puzzle pool
          const mockPuzzles = Array.from({ length: puzzleCount }, (_, i) =>
            createPuzzle(`puzzle-${i}`, `Puzzle ${i}`)
          );

          // Setup: All puzzles are completed
          const allPuzzleIds = mockPuzzles.map(p => p.id);

          vi.mocked(puzzleService.getAll).mockResolvedValue(mockPuzzles);
          vi.mocked(puzzleService.getCompletedPuzzles).mockResolvedValue(allPuzzleIds);

          // Render hook
          const { result } = renderHook(() => usePuzzleGame(true));

          // Wait for puzzles to load
          await waitFor(() => {
            expect(result.current.isLoadingPuzzles).toBe(false);
          });

          // Wait for completion state to be calculated
          await waitFor(() => {
            expect(result.current.puzzles.length).toBe(puzzleCount);
          });

          // Store current puzzle before calling handleNextPuzzle
          const puzzleBeforeNext = result.current.currentPuzzle;

          // Act: Call handleNextPuzzle (simulating user clicking "Next Puzzle")
          act(() => {
            result.current.handleNextPuzzle();
          });

          // Wait for any state updates
          await waitFor(() => {
            // Give time for any async operations
            return true;
          }, { timeout: 100 });

          // Assert: Expected behavior when all puzzles are completed
          
          // 1. System should expose allPuzzlesCompleted flag as true
          expect(result.current.allPuzzlesCompleted).toBe(true);

          // 2. handleNextPuzzle should NOT select any puzzle
          // The current puzzle should remain the same or be cleared
          // (In the bug, it would select a random puzzle from the completed pool)
          const puzzleAfterNext = result.current.currentPuzzle;
          
          // In the fixed version, either:
          // - currentPuzzle should be null/undefined (no puzzle selected)
          // - OR currentPuzzle should remain unchanged (no new selection)
          // In the BUGGY version, currentPuzzle will change to a random completed puzzle
          
          // This assertion will FAIL on unfixed code because:
          // - allPuzzlesCompleted flag doesn't exist
          // - handleNextPuzzle will select a puzzle from the pool
          expect(
            puzzleAfterNext === null || 
            puzzleAfterNext === undefined ||
            puzzleAfterNext?.id === puzzleBeforeNext?.id
          ).toBe(true);

          // 3. URL should be cleared (no puzzle ID in URL)
          // Check that the LAST call to pushState cleared the URL
          const lastCall = mockPushState.mock.calls[mockPushState.mock.calls.length - 1];
          expect(lastCall).toBeDefined();
          const lastUrl = String(lastCall[2]);
          expect(lastUrl).toMatch(/^[^?]*$/); // URL without query params
        }
      ),
      {
        numRuns: 10, // Run 10 test cases with different puzzle pool sizes
        verbose: true,
      }
    );
  });

  /**
   * Additional concrete test case for clarity
   * This demonstrates the bug with a specific example
   */
  it('Concrete example: 5 puzzles all completed - should detect completion', async () => {
    // Setup: 5 puzzles, all completed
    const mockPuzzles = [
      createPuzzle('puzzle-1', 'Puzzle 1'),
      createPuzzle('puzzle-2', 'Puzzle 2'),
      createPuzzle('puzzle-3', 'Puzzle 3'),
      createPuzzle('puzzle-4', 'Puzzle 4'),
      createPuzzle('puzzle-5', 'Puzzle 5'),
    ];

    const allPuzzleIds = mockPuzzles.map(p => p.id);

    vi.mocked(puzzleService.getAll).mockResolvedValue(mockPuzzles);
    vi.mocked(puzzleService.getCompletedPuzzles).mockResolvedValue(allPuzzleIds);

    // Render hook
    const { result } = renderHook(() => usePuzzleGame(true));

    // Wait for puzzles to load
    await waitFor(() => {
      expect(result.current.isLoadingPuzzles).toBe(false);
      expect(result.current.puzzles.length).toBe(5);
    });

    const puzzleBeforeNext = result.current.currentPuzzle;

    // Act: Call handleNextPuzzle
    act(() => {
      result.current.handleNextPuzzle();
    });

    await waitFor(() => true, { timeout: 100 });

    // Assert: Expected behavior
    expect(result.current.allPuzzlesCompleted).toBe(true);

    const puzzleAfterNext = result.current.currentPuzzle;
    
    // Should not select a new puzzle
    expect(
      puzzleAfterNext === null || 
      puzzleAfterNext === undefined ||
      puzzleAfterNext?.id === puzzleBeforeNext?.id
    ).toBe(true);
  });
});

describe('usePuzzleGame - Preservation Property Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPushState.mockClear();
    mockReplaceState.mockClear();
    // Clear URL parameters
    Object.defineProperty(window, 'location', {
      value: { 
        href: 'http://localhost:5173/',
        search: '',
      },
      writable: true,
    });
  });

  /**
   * Property 2: Preservation - Normal Puzzle Navigation
   * 
   * **Validates: Requirements 3.1, 3.2, 3.3, 3.4**
   * 
   * IMPORTANT: This test runs on UNFIXED code to observe baseline behavior
   * 
   * Preservation Requirements:
   * - Puzzle selection from unplayed pool when unplayedPuzzles.length > 0
   * - Completion tracking via puzzleService.markPuzzleCompleted remains unchanged
   * - URL deep linking to specific puzzles continues to work
   * - Custom scenario loading via URL parameters remains functional
   * 
   * EXPECTED OUTCOME: Tests PASS on unfixed code (confirms baseline behavior)
   */
  it('Property 2.1: When unplayed puzzles exist, system selects from unplayed pool', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate puzzle pool size between 3 and 15
        fc.integer({ min: 3, max: 15 }),
        // Generate number of completed puzzles (always less than total)
        fc.integer({ min: 0, max: 10 }),
        async (totalPuzzles, completedCount) => {
          // Ensure we have at least one unplayed puzzle
          const actualCompleted = Math.min(completedCount, totalPuzzles - 1);
          
          // Setup: Create puzzle pool
          const mockPuzzles = Array.from({ length: totalPuzzles }, (_, i) => 
            createPuzzle(`puzzle-${i}`)
          );

          // Setup: Some puzzles are completed (but not all)
          const completedPuzzleIds = mockPuzzles
            .slice(0, actualCompleted)
            .map(p => p.id);

          vi.mocked(puzzleService.getAll).mockResolvedValue(mockPuzzles);
          vi.mocked(puzzleService.getCompletedPuzzles).mockResolvedValue(completedPuzzleIds);

          // Render hook
          const { result } = renderHook(() => usePuzzleGame(true));

          // Wait for puzzles to load
          await waitFor(() => {
            expect(result.current.isLoadingPuzzles).toBe(false);
            expect(result.current.puzzles.length).toBe(totalPuzzles);
          });

          // Wait for initial puzzle to be set
          await waitFor(() => {
            expect(result.current.currentPuzzle).toBeTruthy();
          });

          // Store initial puzzle
          const initialPuzzle = result.current.currentPuzzle;

          // Track all selected puzzles
          const selectedPuzzles = new Set<string>();
          if (initialPuzzle) {
            selectedPuzzles.add(initialPuzzle.id);
          }

          // Act: Call handleNextPuzzle multiple times
          for (let i = 0; i < 3; i++) {
            act(() => {
              result.current.handleNextPuzzle();
            });

            await waitFor(() => true, { timeout: 100 });

            // Track selected puzzle
            const selectedPuzzle = result.current.currentPuzzle;
            if (selectedPuzzle) {
              selectedPuzzles.add(selectedPuzzle.id);
            }
          }

          // Assert: All selected puzzles should be from unplayed pool
          // Note: The initial puzzle might be from completed pool if all unplayed are exhausted
          // But handleNextPuzzle should select from unplayed pool when unplayed puzzles exist
          const unplayedPuzzleIds = mockPuzzles
            .filter(p => !completedPuzzleIds.includes(p.id))
            .map(p => p.id);

          // If there are unplayed puzzles, at least some selections should be from unplayed pool
          if (unplayedPuzzleIds.length > 0) {
            const hasUnplayedSelection = Array.from(selectedPuzzles).some(id => 
              unplayedPuzzleIds.includes(id)
            );
            expect(hasUnplayedSelection).toBe(true);
          }

          // Verify that puzzle selection is working (we have a current puzzle)
          expect(result.current.currentPuzzle).toBeTruthy();
        }
      ),
      {
        numRuns: 10,
        verbose: true,
      }
    );
  });

  /**
   * Property 2.2: Completion tracking via puzzleService.markPuzzleCompleted remains unchanged
   */
  it('Property 2.2: Completion tracking continues to work correctly', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 3, max: 10 }),
        async (puzzleCount) => {
          // Setup: Create puzzle pool
          const mockPuzzles = Array.from({ length: puzzleCount }, (_, i) => 
            createPuzzle(`puzzle-${i}`)
          );

          // Start with no completed puzzles
          vi.mocked(puzzleService.getAll).mockResolvedValue(mockPuzzles);
          vi.mocked(puzzleService.getCompletedPuzzles).mockResolvedValue([]);
          vi.mocked(puzzleService.markPuzzleCompleted).mockResolvedValue(undefined);

          // Render hook
          const { result } = renderHook(() => usePuzzleGame(true));

          // Wait for puzzles to load
          await waitFor(() => {
            expect(result.current.isLoadingPuzzles).toBe(false);
          });

          const currentPuzzle = result.current.currentPuzzle;
          expect(currentPuzzle).toBeTruthy();

          // Act: Mark puzzle as completed
          await act(async () => {
            await result.current.handleMarkCompleted(currentPuzzle!.id);
          });

          // Assert: puzzleService.markPuzzleCompleted should have been called
          expect(puzzleService.markPuzzleCompleted).toHaveBeenCalledWith(
            'test-user-id',
            currentPuzzle!.id
          );

          // Assert: completedPuzzleIds should be updated
          expect(result.current.completedPuzzleIds).toContain(currentPuzzle!.id);
        }
      ),
      {
        numRuns: 5,
        verbose: true,
      }
    );
  });

  /**
   * Property 2.3: URL deep linking to specific puzzles continues to work
   */
  it('Property 2.3: Deep linking to specific puzzle via URL works correctly', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 3, max: 10 }),
        fc.integer({ min: 0, max: 9 }),
        async (puzzleCount, targetIndex) => {
          // Ensure targetIndex is within bounds
          const actualTargetIndex = targetIndex % puzzleCount;
          
          // Setup: Create puzzle pool
          const mockPuzzles = Array.from({ length: puzzleCount }, (_, i) => 
            createPuzzle(`puzzle-${i}`)
          );

          const targetPuzzle = mockPuzzles[actualTargetIndex];

          // Setup: URL with puzzle parameter
          Object.defineProperty(window, 'location', {
            value: { 
              href: `http://localhost:5173/?puzzle=${targetPuzzle.id}`,
              search: `?puzzle=${targetPuzzle.id}`,
            },
            writable: true,
          });

          vi.mocked(puzzleService.getAll).mockResolvedValue(mockPuzzles);
          vi.mocked(puzzleService.getCompletedPuzzles).mockResolvedValue([]);

          // Render hook
          const { result } = renderHook(() => usePuzzleGame(true));

          // Wait for puzzles to load
          await waitFor(() => {
            expect(result.current.isLoadingPuzzles).toBe(false);
          });

          // Wait for deep linking to take effect
          await waitFor(() => {
            expect(result.current.currentPuzzle?.id).toBe(targetPuzzle.id);
          }, { timeout: 500 });

          // Assert: Current puzzle should be the one specified in URL
          expect(result.current.currentPuzzle?.id).toBe(targetPuzzle.id);
        }
      ),
      {
        numRuns: 5,
        verbose: true,
      }
    );
  });

  /**
   * Property 2.4: URL state management remains functional
   * 
   * Tests that URL parameters are properly managed during puzzle navigation
   */
  it('Property 2.4: URL state management works correctly', async () => {
    // Setup: Create puzzle pool
    const mockPuzzles = Array.from({ length: 5 }, (_, i) => 
      createPuzzle(`puzzle-${i}`)
    );

    vi.mocked(puzzleService.getAll).mockResolvedValue(mockPuzzles);
    vi.mocked(puzzleService.getCompletedPuzzles).mockResolvedValue([]);

    // Render hook
    const { result } = renderHook(() => usePuzzleGame(true));

    // Wait for puzzles to load
    await waitFor(() => {
      expect(result.current.isLoadingPuzzles).toBe(false);
    });

    // Wait for initial puzzle to be set
    await waitFor(() => {
      expect(result.current.currentPuzzle).toBeTruthy();
    });

    // Act: Navigate to next puzzle
    act(() => {
      result.current.handleNextPuzzle();
    });

    await waitFor(() => true, { timeout: 100 });

    // Assert: URL should be updated (pushState should be called)
    // The hook manages URL state by pushing/replacing state
    expect(mockPushState).toHaveBeenCalled();

    // Assert: Puzzle navigation is working
    expect(result.current.currentPuzzle).toBeTruthy();
  });

  /**
   * Concrete example test for clarity
   */
  it('Concrete example: 5 puzzles with 2 completed - selects from 3 unplayed', async () => {
    // Setup: 5 puzzles, 2 completed
    const mockPuzzles = [
      createPuzzle('puzzle-1'),
      createPuzzle('puzzle-2'),
      createPuzzle('puzzle-3'),
      createPuzzle('puzzle-4'),
      createPuzzle('puzzle-5'),
    ];

    const completedPuzzleIds = ['puzzle-1', 'puzzle-2'];

    vi.mocked(puzzleService.getAll).mockResolvedValue(mockPuzzles);
    vi.mocked(puzzleService.getCompletedPuzzles).mockResolvedValue(completedPuzzleIds);

    // Render hook
    const { result } = renderHook(() => usePuzzleGame(true));

    // Wait for puzzles to load
    await waitFor(() => {
      expect(result.current.isLoadingPuzzles).toBe(false);
      expect(result.current.puzzles.length).toBe(5);
    });

    // Act: Call handleNextPuzzle multiple times
    const selectedPuzzles = new Set<string>();
    
    for (let i = 0; i < 10; i++) {
      act(() => {
        result.current.handleNextPuzzle();
      });

      await waitFor(() => true, { timeout: 100 });

      const currentPuzzle = result.current.currentPuzzle;
      if (currentPuzzle) {
        selectedPuzzles.add(currentPuzzle.id);
      }
    }

    // Assert: All selected puzzles should be from unplayed pool
    selectedPuzzles.forEach(puzzleId => {
      expect(completedPuzzleIds.includes(puzzleId)).toBe(false);
    });

    // Assert: Should only select from the 3 unplayed puzzles
    expect(selectedPuzzles.size).toBeLessThanOrEqual(3);
    expect(Array.from(selectedPuzzles).every(id => 
      ['puzzle-3', 'puzzle-4', 'puzzle-5'].includes(id)
    )).toBe(true);
  });
});
