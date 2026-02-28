import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { userStatsService } from './userStatsService';
import { supabase } from '../lib/supabase';

// Mock Supabase
vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
  },
}));

describe('userStatsService - Bug Condition Exploration', () => {
  const mockUserId = 'test-user-123';

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock authenticated user
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: { id: mockUserId } as any },
      error: null,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Property 1: Fault Condition - Replayed Puzzles Show Wrong IQ Values
   * 
   * **Validates: Requirements 2.1, 2.2, 2.3**
   * 
   * CRITICAL: This test MUST FAIL on unfixed code - failure confirms the bug exists
   * 
   * Bug Condition: User completes same puzzle multiple times with different outcomes
   * Expected Behavior:
   * - Each attempt shows the actual IQ change that occurred at that specific time
   * - Correct answers (✓) show positive IQ changes
   * - Incorrect answers (✗) show negative IQ changes
   * 
   * Actual Buggy Behavior:
   * - All attempts of the same puzzle show the MOST RECENT IQ value
   * - Correct answers may show negative IQ if most recent attempt was incorrect
   * 
   * EXPECTED OUTCOME: Test FAILS on unfixed code (proves bug exists)
   * Likely counterexamples:
   * - First attempt shows -15 IQ even though it was correct (+25 IQ at the time)
   * - Both attempts show the same IQ value (the most recent one)
   */
  it('Property 1: When user replays same puzzle, each attempt shows its actual IQ change', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate puzzle ID
        fc.string({ minLength: 5, maxLength: 20 }),
        // Generate two different outcomes (correct/incorrect)
        fc.boolean(),
        fc.boolean(),
        async (puzzleId, firstAttemptCorrect, secondAttemptCorrect) => {
          // Skip if both attempts have same outcome (no interesting bug case)
          fc.pre(firstAttemptCorrect !== secondAttemptCorrect);

          // Calculate expected IQ changes based on correctness
          const firstIqChange = firstAttemptCorrect ? 25 : -15;
          const secondIqChange = secondAttemptCorrect ? 25 : -15;

          // Setup: Two attempts of the same puzzle at different times
          const baseTime = new Date('2024-01-01T10:00:00Z');
          const firstAttemptTime = baseTime.toISOString();
          const secondAttemptTime = new Date(baseTime.getTime() + 3600000).toISOString(); // 1 hour later

          const mockAttempts = [
            {
              id: 'attempt-2',
              puzzle_id: puzzleId,
              user_pick_name: 'Test Augment 2',
              is_correct: secondAttemptCorrect,
              reroll_count: 0,
              time_to_decide_ms: 5000,
              puzzle_stage: '2-1',
              created_at: secondAttemptTime,
            },
            {
              id: 'attempt-1',
              puzzle_id: puzzleId,
              user_pick_name: 'Test Augment 1',
              is_correct: firstAttemptCorrect,
              reroll_count: 0,
              time_to_decide_ms: 5000,
              puzzle_stage: '2-1',
              created_at: firstAttemptTime,
            },
          ];

          // Setup: Two IQ history entries (ordered by created_at DESC)
          const mockIqHistory = [
            {
              puzzle_id: puzzleId,
              change_amount: secondIqChange,
              created_at: secondAttemptTime,
            },
            {
              puzzle_id: puzzleId,
              change_amount: firstIqChange,
              created_at: firstAttemptTime,
            },
          ];

          // Mock Supabase queries
          vi.mocked(supabase.from).mockImplementation((table: string) => {
            if (table === 'user_puzzle_attempts') {
              return {
                select: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    order: vi.fn().mockReturnValue({
                      limit: vi.fn().mockResolvedValue({
                        data: mockAttempts,
                        error: null,
                      }),
                    }),
                  }),
                }),
              } as any;
            } else if (table === 'user_iq_history') {
              return {
                select: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    in: vi.fn().mockReturnValue({
                      order: vi.fn().mockResolvedValue({
                        data: mockIqHistory,
                        error: null,
                      }),
                    }),
                  }),
                }),
              } as any;
            }
            return {} as any;
          });

          // Execute
          const result = await userStatsService.getRecentAttempts(mockUserId, 10);

          // Verify we got 2 attempts back
          expect(result).toHaveLength(2);

          // Find each attempt in the result
          const firstAttemptResult = result.find(r => r.id === 'attempt-1');
          const secondAttemptResult = result.find(r => r.id === 'attempt-2');

          expect(firstAttemptResult).toBeDefined();
          expect(secondAttemptResult).toBeDefined();

          // CRITICAL ASSERTION: Each attempt should show its ACTUAL IQ change
          // This will FAIL on unfixed code because both will show the most recent IQ value
          expect(firstAttemptResult!.iqChangeAmount).toBe(firstIqChange);
          expect(secondAttemptResult!.iqChangeAmount).toBe(secondIqChange);

          // Additional verification: Correct answers should show positive IQ
          if (firstAttemptCorrect) {
            expect(firstAttemptResult!.iqChangeAmount).toBeGreaterThan(0);
          } else {
            expect(firstAttemptResult!.iqChangeAmount).toBeLessThan(0);
          }

          if (secondAttemptCorrect) {
            expect(secondAttemptResult!.iqChangeAmount).toBeGreaterThan(0);
          } else {
            expect(secondAttemptResult!.iqChangeAmount).toBeLessThan(0);
          }
        }
      ),
      { numRuns: 20 } // Run 20 test cases to find counterexamples
    );
  });

  /**
   * Concrete example: Correct then Incorrect
   * 
   * This demonstrates the bug with a specific example that's easy to understand
   */
  it('Concrete example: User completes puzzle correctly (+25 IQ), then incorrectly (-15 IQ)', async () => {
    const puzzleId = 'puzzle-abc-123';
    
    // Setup: Two attempts at different times
    const firstAttemptTime = '2024-01-01T10:00:00Z';
    const secondAttemptTime = '2024-01-01T11:00:00Z';

    const mockAttempts = [
      {
        id: 'attempt-2',
        puzzle_id: puzzleId,
        user_pick_name: 'Wrong Augment',
        is_correct: false,
        reroll_count: 0,
        time_to_decide_ms: 5000,
        puzzle_stage: '2-1',
        created_at: secondAttemptTime,
      },
      {
        id: 'attempt-1',
        puzzle_id: puzzleId,
        user_pick_name: 'Correct Augment',
        is_correct: true,
        reroll_count: 0,
        time_to_decide_ms: 5000,
        puzzle_stage: '2-1',
        created_at: firstAttemptTime,
      },
    ];

    const mockIqHistory = [
      {
        puzzle_id: puzzleId,
        change_amount: -15, // Second attempt (incorrect)
        created_at: secondAttemptTime,
      },
      {
        puzzle_id: puzzleId,
        change_amount: 25, // First attempt (correct)
        created_at: firstAttemptTime,
      },
    ];

    // Mock Supabase queries
    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === 'user_puzzle_attempts') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue({
                  data: mockAttempts,
                  error: null,
                }),
              }),
            }),
          }),
        } as any;
      } else if (table === 'user_iq_history') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              in: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({
                  data: mockIqHistory,
                  error: null,
                }),
              }),
            }),
          }),
        } as any;
      }
      return {} as any;
    });

    // Execute
    const result = await userStatsService.getRecentAttempts(mockUserId, 10);

    // Verify
    expect(result).toHaveLength(2);

    const firstAttempt = result.find(r => r.id === 'attempt-1');
    const secondAttempt = result.find(r => r.id === 'attempt-2');

    // EXPECTED: First attempt shows +25 IQ (correct)
    // ACTUAL (BUGGY): First attempt shows -15 IQ (most recent value)
    expect(firstAttempt!.iqChangeAmount).toBe(25);
    expect(firstAttempt!.isCorrect).toBe(true);

    // EXPECTED: Second attempt shows -15 IQ (incorrect)
    // ACTUAL (BUGGY): Second attempt shows -15 IQ (happens to be correct)
    expect(secondAttempt!.iqChangeAmount).toBe(-15);
    expect(secondAttempt!.isCorrect).toBe(false);
  });

  /**
   * Concrete example: Three replays with varying outcomes
   * 
   * Tests the bug with multiple replays to show all attempts display the most recent value
   */
  it('Concrete example: Three attempts show three different IQ values', async () => {
    const puzzleId = 'puzzle-xyz-789';
    
    const mockAttempts = [
      {
        id: 'attempt-3',
        puzzle_id: puzzleId,
        user_pick_name: 'Augment 3',
        is_correct: true,
        reroll_count: 0,
        time_to_decide_ms: 3000, // Fast = speed bonus
        puzzle_stage: '2-1',
        created_at: '2024-01-01T14:00:00Z',
      },
      {
        id: 'attempt-2',
        puzzle_id: puzzleId,
        user_pick_name: 'Augment 2',
        is_correct: false,
        reroll_count: 0,
        time_to_decide_ms: 5000,
        puzzle_stage: '2-1',
        created_at: '2024-01-01T13:00:00Z',
      },
      {
        id: 'attempt-1',
        puzzle_id: puzzleId,
        user_pick_name: 'Augment 1',
        is_correct: true,
        reroll_count: 0,
        time_to_decide_ms: 5000,
        puzzle_stage: '2-1',
        created_at: '2024-01-01T12:00:00Z',
      },
    ];

    const mockIqHistory = [
      {
        puzzle_id: puzzleId,
        change_amount: 30, // Third attempt (correct + speed bonus)
        created_at: '2024-01-01T14:00:00Z',
      },
      {
        puzzle_id: puzzleId,
        change_amount: -15, // Second attempt (incorrect)
        created_at: '2024-01-01T13:00:00Z',
      },
      {
        puzzle_id: puzzleId,
        change_amount: 25, // First attempt (correct)
        created_at: '2024-01-01T12:00:00Z',
      },
    ];

    // Mock Supabase queries
    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === 'user_puzzle_attempts') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue({
                  data: mockAttempts,
                  error: null,
                }),
              }),
            }),
          }),
        } as any;
      } else if (table === 'user_iq_history') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              in: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({
                  data: mockIqHistory,
                  error: null,
                }),
              }),
            }),
          }),
        } as any;
      }
      return {} as any;
    });

    // Execute
    const result = await userStatsService.getRecentAttempts(mockUserId, 10);

    // Verify
    expect(result).toHaveLength(3);

    const attempt1 = result.find(r => r.id === 'attempt-1');
    const attempt2 = result.find(r => r.id === 'attempt-2');
    const attempt3 = result.find(r => r.id === 'attempt-3');

    // EXPECTED: Each attempt shows its actual IQ change
    // ACTUAL (BUGGY): All three show +30 (the most recent value)
    expect(attempt1!.iqChangeAmount).toBe(25);
    expect(attempt2!.iqChangeAmount).toBe(-15);
    expect(attempt3!.iqChangeAmount).toBe(30);
  });
});

describe('userStatsService - Preservation Property Tests', () => {
  const mockUserId = 'test-user-preservation';

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock authenticated user
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: { id: mockUserId } as any },
      error: null,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Property 2: Preservation - Single-Attempt Puzzles Show Correct IQ
   * 
   * **Validates: Requirements 3.1, 3.2, 3.4**
   * 
   * IMPORTANT: This test should PASS on unfixed code
   * 
   * Preservation Requirement:
   * - When a puzzle is completed only once (no replays), the IQ value should display correctly
   * - This behavior should NOT change after the fix
   * 
   * EXPECTED OUTCOME: Test PASSES on unfixed code (confirms baseline behavior)
   */
  it('Property 2.1: Single-attempt puzzles show correct IQ value (unchanged behavior)', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random puzzle data
        fc.string({ minLength: 5, maxLength: 20 }), // puzzleId
        fc.boolean(), // isCorrect
        fc.integer({ min: 0, max: 5 }), // rerollCount
        fc.integer({ min: 1000, max: 30000 }), // timeToDecideMs
        async (puzzleId, isCorrect, rerollCount, timeToDecideMs) => {
          const expectedIqChange = isCorrect ? 25 : -15;
          const attemptTime = new Date('2024-01-01T10:00:00Z').toISOString();

          // Setup: Single attempt for this puzzle
          const mockAttempts = [
            {
              id: 'attempt-single',
              puzzle_id: puzzleId,
              user_pick_name: 'Test Augment',
              is_correct: isCorrect,
              reroll_count: rerollCount,
              time_to_decide_ms: timeToDecideMs,
              puzzle_stage: '2-1',
              created_at: attemptTime,
            },
          ];

          // Setup: Single IQ history entry
          const mockIqHistory = [
            {
              puzzle_id: puzzleId,
              change_amount: expectedIqChange,
              created_at: attemptTime,
            },
          ];

          // Mock Supabase queries
          vi.mocked(supabase.from).mockImplementation((table: string) => {
            if (table === 'user_puzzle_attempts') {
              return {
                select: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    order: vi.fn().mockReturnValue({
                      limit: vi.fn().mockResolvedValue({
                        data: mockAttempts,
                        error: null,
                      }),
                    }),
                  }),
                }),
              } as any;
            } else if (table === 'user_iq_history') {
              return {
                select: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    in: vi.fn().mockReturnValue({
                      order: vi.fn().mockResolvedValue({
                        data: mockIqHistory,
                        error: null,
                      }),
                    }),
                  }),
                }),
              } as any;
            }
            return {} as any;
          });

          // Execute
          const result = await userStatsService.getRecentAttempts(mockUserId, 10);

          // Verify: Single-attempt puzzles should show correct IQ (this works on unfixed code)
          expect(result).toHaveLength(1);
          expect(result[0].iqChangeAmount).toBe(expectedIqChange);
          
          // Verify correctness matches IQ sign
          if (isCorrect) {
            expect(result[0].iqChangeAmount).toBeGreaterThan(0);
          } else {
            expect(result[0].iqChangeAmount).toBeLessThan(0);
          }
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property 2.2: getUserStats() returns consistent overall statistics
   * 
   * **Validates: Requirements 3.1, 3.2, 3.3**
   * 
   * IMPORTANT: This test should PASS on unfixed code
   * 
   * Preservation Requirement:
   * - Overall stats (total attempts, accuracy, avg time, avg rerolls) should remain unchanged
   * - The fix only affects IQ display in activity history, not aggregated stats
   * 
   * EXPECTED OUTCOME: Test PASSES on unfixed code (confirms baseline behavior)
   */
  it('Property 2.2: getUserStats() returns consistent statistics (unchanged behavior)', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random attempt data
        fc.array(
          fc.record({
            isCorrect: fc.boolean(),
            timeToDecideMs: fc.integer({ min: 1000, max: 30000 }),
            rerollCount: fc.integer({ min: 0, max: 5 }),
          }),
          { minLength: 1, maxLength: 20 }
        ),
        async (attempts) => {
          // Mock Supabase query
          vi.mocked(supabase.from).mockImplementation((table: string) => {
            if (table === 'user_puzzle_attempts') {
              return {
                select: vi.fn().mockReturnValue({
                  eq: vi.fn().mockResolvedValue({
                    data: attempts.map(a => ({
                      is_correct: a.isCorrect,
                      time_to_decide_ms: a.timeToDecideMs,
                      reroll_count: a.rerollCount,
                    })),
                    error: null,
                  }),
                }),
              } as any;
            }
            return {} as any;
          });

          // Execute
          const result = await userStatsService.getUserStats(mockUserId);

          // Calculate expected values
          const totalAttempts = attempts.length;
          const correctCount = attempts.filter(a => a.isCorrect).length;
          const expectedAccuracy = Math.round((correctCount / totalAttempts) * 100);
          const totalTime = attempts.reduce((sum, a) => sum + a.timeToDecideMs, 0);
          const expectedAvgTime = Math.round(totalTime / totalAttempts);
          const totalRerolls = attempts.reduce((sum, a) => sum + a.rerollCount, 0);
          const expectedAvgRerolls = Math.round((totalRerolls / totalAttempts) * 10) / 10;

          // Verify: Stats should match expected calculations
          expect(result.totalAttempts).toBe(totalAttempts);
          expect(result.correctCount).toBe(correctCount);
          expect(result.accuracyPercent).toBe(expectedAccuracy);
          expect(result.avgTimeMs).toBe(expectedAvgTime);
          expect(result.avgRerolls).toBe(expectedAvgRerolls);
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property 2.3: getStageBreakdown() returns consistent stage statistics
   * 
   * **Validates: Requirements 3.3**
   * 
   * IMPORTANT: This test should PASS on unfixed code
   * 
   * Preservation Requirement:
   * - Stage breakdown (accuracy by stage) should remain unchanged
   * - The fix only affects IQ display in activity history, not stage stats
   * 
   * EXPECTED OUTCOME: Test PASSES on unfixed code (confirms baseline behavior)
   */
  it('Property 2.3: getStageBreakdown() returns consistent stage statistics (unchanged behavior)', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random stage data
        fc.array(
          fc.record({
            stage: fc.constantFrom('2-1', '3-2', '4-1', '4-2', '5-1'),
            isCorrect: fc.boolean(),
          }),
          { minLength: 1, maxLength: 30 }
        ),
        async (attempts) => {
          // Mock Supabase query
          vi.mocked(supabase.from).mockImplementation((table: string) => {
            if (table === 'user_puzzle_attempts') {
              return {
                select: vi.fn().mockReturnValue({
                  eq: vi.fn().mockResolvedValue({
                    data: attempts.map(a => ({
                      puzzle_stage: a.stage,
                      is_correct: a.isCorrect,
                    })),
                    error: null,
                  }),
                }),
              } as any;
            }
            return {} as any;
          });

          // Execute
          const result = await userStatsService.getStageBreakdown(mockUserId);

          // Calculate expected stage stats
          const stageMap = new Map<string, { total: number; correct: number }>();
          for (const attempt of attempts) {
            const current = stageMap.get(attempt.stage) || { total: 0, correct: 0 };
            current.total++;
            if (attempt.isCorrect) current.correct++;
            stageMap.set(attempt.stage, current);
          }

          // Verify: Each stage should have correct stats
          expect(result.length).toBe(stageMap.size);
          
          for (const stageResult of result) {
            const expected = stageMap.get(stageResult.stage);
            expect(expected).toBeDefined();
            expect(stageResult.total).toBe(expected!.total);
            expect(stageResult.correct).toBe(expected!.correct);
            expect(stageResult.accuracyPercent).toBe(
              Math.round((expected!.correct / expected!.total) * 100)
            );
          }
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property 2.4: getAccuracyTrend() returns consistent accuracy trend data
   * 
   * **Validates: Requirements 3.3**
   * 
   * IMPORTANT: This test should PASS on unfixed code
   * 
   * Preservation Requirement:
   * - Accuracy trend chart data should remain unchanged
   * - The fix only affects IQ display in activity history, not trend calculations
   * 
   * EXPECTED OUTCOME: Test PASSES on unfixed code (confirms baseline behavior)
   */
  it('Property 2.4: getAccuracyTrend() returns consistent accuracy trend (unchanged behavior)', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random attempt sequence
        fc.array(
          fc.record({
            isCorrect: fc.boolean(),
            createdAt: fc.integer({ min: 1704067200000, max: 1735689599000 }), // 2024-01-01 to 2024-12-31 in ms
          }),
          { minLength: 1, maxLength: 20 }
        ),
        async (attempts) => {
          // Sort by timestamp to ensure chronological order
          const sortedAttempts = [...attempts].sort(
            (a, b) => a.createdAt - b.createdAt
          ).map(a => ({
            isCorrect: a.isCorrect,
            createdAt: new Date(a.createdAt),
          }));

          // Mock Supabase query
          vi.mocked(supabase.from).mockImplementation((table: string) => {
            if (table === 'user_puzzle_attempts') {
              return {
                select: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    order: vi.fn().mockResolvedValue({
                      data: sortedAttempts.map(a => ({
                        is_correct: a.isCorrect,
                        created_at: a.createdAt.toISOString(),
                      })),
                      error: null,
                    }),
                  }),
                }),
              } as any;
            }
            return {} as any;
          });

          // Execute
          const result = await userStatsService.getAccuracyTrend(mockUserId, 20);

          // Calculate expected rolling accuracy
          let correctSoFar = 0;
          const expectedTrends = sortedAttempts.map((attempt, index) => {
            if (attempt.isCorrect) correctSoFar++;
            return {
              attemptNumber: index + 1,
              isCorrect: attempt.isCorrect,
              rollingAccuracy: Math.round((correctSoFar / (index + 1)) * 100),
              createdAt: attempt.createdAt.toISOString(),
            };
          });

          // Verify: Trend data should match expected calculations
          expect(result.length).toBe(expectedTrends.length);
          
          for (let i = 0; i < result.length; i++) {
            expect(result[i].attemptNumber).toBe(expectedTrends[i].attemptNumber);
            expect(result[i].isCorrect).toBe(expectedTrends[i].isCorrect);
            expect(result[i].rollingAccuracy).toBe(expectedTrends[i].rollingAccuracy);
          }
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Concrete example: Single attempt shows correct IQ
   * 
   * This demonstrates that single-attempt puzzles work correctly on unfixed code
   */
  it('Concrete example: Single-attempt puzzle shows correct IQ value', async () => {
    const puzzleId = 'puzzle-single-123';
    const attemptTime = '2024-01-01T10:00:00Z';

    const mockAttempts = [
      {
        id: 'attempt-1',
        puzzle_id: puzzleId,
        user_pick_name: 'Correct Augment',
        is_correct: true,
        reroll_count: 0,
        time_to_decide_ms: 5000,
        puzzle_stage: '2-1',
        created_at: attemptTime,
      },
    ];

    const mockIqHistory = [
      {
        puzzle_id: puzzleId,
        change_amount: 25,
        created_at: attemptTime,
      },
    ];

    // Mock Supabase queries
    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === 'user_puzzle_attempts') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue({
                  data: mockAttempts,
                  error: null,
                }),
              }),
            }),
          }),
        } as any;
      } else if (table === 'user_iq_history') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              in: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({
                  data: mockIqHistory,
                  error: null,
                }),
              }),
            }),
          }),
        } as any;
      }
      return {} as any;
    });

    // Execute
    const result = await userStatsService.getRecentAttempts(mockUserId, 10);

    // Verify: Single attempt should show correct IQ (this works on unfixed code)
    expect(result).toHaveLength(1);
    expect(result[0].iqChangeAmount).toBe(25);
    expect(result[0].isCorrect).toBe(true);
  });
});
