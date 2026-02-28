# Implementation Plan

- [x] 1. Write bug condition exploration test
  - **Property 1: Fault Condition** - All Puzzles Completed Detection
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug exists
  - **Scoped PBT Approach**: Scope the property to concrete failing cases: all puzzles completed (unplayedPuzzles.length === 0) with any puzzle pool size
  - Test that when all puzzles are completed, `allPuzzlesCompleted` flag is true and `handleNextPuzzle` does not select any puzzle
  - Test implementation details from Fault Condition: `puzzles.length > 0 AND unplayedPuzzles.length === 0`
  - The test assertions should match Expected Behavior: system detects completion, exposes `allPuzzlesCompleted` state, prevents puzzle selection
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the bug exists)
  - Document counterexamples found: likely `allPuzzlesCompleted` flag missing or false, puzzle still selected from pool
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Normal Puzzle Navigation
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for non-buggy inputs (when unplayed puzzles exist)
  - Write property-based tests capturing observed behavior patterns from Preservation Requirements:
    - Puzzle selection from unplayed pool when unplayedPuzzles.length > 0
    - Completion tracking via `puzzleService.markPuzzleCompleted` remains unchanged
    - URL deep linking to specific puzzles continues to work
    - Custom scenario loading via URL parameters remains functional
  - Property-based testing generates many test cases for stronger guarantees
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 3. Fix for puzzle completion logic

  - [x] 3.1 Implement the fix in usePuzzleGame.ts
    - Add computed state `allPuzzlesCompleted` using `React.useMemo` to check if `unplayedPuzzles.length === 0` (excluding current puzzle)
    - Modify `handleNextPuzzle` to detect completion state and prevent puzzle selection when all completed
    - Remove fallback pattern `const pool = unplayedPuzzles.length > 0 ? unplayedPuzzles : puzzles;`
    - Add early return or no-op in `handleNextPuzzle` when `allPuzzlesCompleted` is true
    - Expose `allPuzzlesCompleted` boolean in hook's return value for UI consumption
    - Ensure URL clearing behavior is preserved (clean URL when all completed)
    - Handle edge cases: custom scenarios and deep linking should not interfere with completion detection
    - _Bug_Condition: isBugCondition(input) where puzzles.length > 0 AND unplayedPuzzles.length === 0 AND user attempts next puzzle_
    - _Expected_Behavior: System detects completion, exposes allPuzzlesCompleted flag, prevents puzzle selection, enables UI to display completion message_
    - _Preservation: Normal puzzle navigation when unplayed puzzles exist, completion tracking, deep linking, custom scenarios_
    - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 3.4_

  - [x] 3.2 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - All Puzzles Completed Detection
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 1
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 3.3 Verify preservation tests still pass
    - **Property 2: Preservation** - Normal Puzzle Navigation
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all tests still pass after fix (no regressions in normal navigation, completion tracking, deep linking, custom scenarios)
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
