# Implementation Plan

- [x] 1. Write bug condition exploration test
  - **Property 1: Fault Condition** - Replayed Puzzles Show Wrong IQ Values
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug exists
  - **Scoped PBT Approach**: Test concrete failing cases where user completes same puzzle multiple times
  - Test that when a user completes the same puzzle multiple times (e.g., Puzzle A at 10:00 AM correctly +25 IQ, then at 11:00 AM incorrectly -15 IQ), the activity history shows the actual IQ change for each attempt (first shows +25, second shows -15)
  - The test assertions should verify each attempt displays its timestamp-matched IQ value
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the bug exists, showing all attempts display the most recent IQ value instead)
  - Document counterexamples found (e.g., "Both attempts show -15 IQ instead of +25 and -15 respectively")
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - IQ Calculation and Other Stats Unchanged
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for non-buggy inputs (single-attempt puzzles, overall stats, stage breakdown, accuracy trend)
  - Write property-based tests capturing observed behavior patterns:
    - Single-attempt puzzles show correct IQ value
    - `getUserStats()` returns consistent overall stats
    - `getStageBreakdown()` returns consistent stage statistics
    - `getAccuracyTrend()` returns consistent accuracy data
    - IQ calculation logic in `userIq.service.ts` continues to work identically
  - Property-based testing generates many test cases for stronger guarantees
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 3. Fix for IQ calculation display in activity history

  - [x] 3.1 Implement timestamp proximity matching in getRecentAttempts()
    - Replace Map-based grouping (`iqByPuzzle`) with timestamp matching algorithm
    - Fetch all IQ history entries for relevant puzzle_ids (not just latest per puzzle)
    - For each attempt, find the closest IQ history entry by timestamp (±5 second tolerance)
    - Prefer exact puzzle_id matches within tolerance window
    - Handle edge case where no matching IQ entry exists (set to null)
    - Maintain performance by avoiding N+1 query patterns
    - _Bug_Condition: isBugCondition(input) where user has multiple attempts for same puzzle_id AND views activity history_
    - _Expected_Behavior: Each attempt displays the IQ change_amount from the IQ history entry with closest created_at timestamp_
    - _Preservation: IQ calculation logic in userIq.service.ts, database writes, overall stats, stage breakdown, and accuracy trend remain unchanged_
    - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 3.4_

  - [x] 3.2 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Replayed Puzzles Show Correct IQ Values
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 1
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed - each attempt now shows its actual IQ value)
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 3.3 Verify preservation tests still pass
    - **Property 2: Preservation** - IQ Calculation and Other Stats Unchanged
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions - single attempts, overall stats, stage breakdown, accuracy trend, and IQ calculation all work identically)
    - Confirm all tests still pass after fix (no regressions)

- [x] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
