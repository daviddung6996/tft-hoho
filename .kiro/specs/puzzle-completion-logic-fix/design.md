# Puzzle Completion Logic Fix - Bugfix Design

## Overview

The puzzle system currently allows indefinite replay of completed puzzles when all available puzzles are finished, providing no closure or guidance to users. This fix will detect the all-puzzles-completed state, prevent replay, display an encouraging completion message ("Lý thuyết đủ rồi, hãy vào rank mà chiến"), and guide users toward ranked mode gameplay. The fix targets the fallback logic in `usePuzzleGame.ts` that currently allows replaying completed puzzles.

## Glossary

- **Bug_Condition (C)**: The condition that triggers the bug - when all available puzzles are completed but the system allows replay instead of showing completion
- **Property (P)**: The desired behavior when all puzzles are completed - show completion message, prevent replay, guide to ranked mode
- **Preservation**: Existing puzzle selection, completion tracking, and state management that must remain unchanged for normal gameplay
- **usePuzzleGame**: The React hook in `src/hooks/usePuzzleGame.ts` that manages puzzle state, selection, and navigation
- **puzzleService**: The service in `src/services/puzzleService.ts` that handles Supabase interactions for puzzle data and completion tracking
- **completedPuzzleIds**: State array tracking which puzzle IDs the current user has completed
- **unplayedPuzzles**: Filtered array of puzzles excluding those in completedPuzzleIds
- **handleNextPuzzle**: Function that selects the next puzzle, currently using fallback logic `const pool = unplayedPuzzles.length > 0 ? unplayedPuzzles : puzzles;`

## Bug Details

### Fault Condition

The bug manifests when a user has completed all available puzzles and attempts to continue playing. The `handleNextPuzzle` function in `usePuzzleGame.ts` falls back to selecting from the entire puzzle pool (including completed puzzles) instead of detecting the completion state and preventing further play.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type { puzzles: PuzzleScenario[], completedPuzzleIds: string[], currentPuzzleId: string }
  OUTPUT: boolean
  
  LET unplayedPuzzles = puzzles.filter(p => !completedPuzzleIds.includes(p.id) AND p.id !== currentPuzzleId)
  
  RETURN puzzles.length > 0
         AND unplayedPuzzles.length === 0
         AND (user clicks "Next Puzzle" OR system attempts to select next puzzle)
END FUNCTION
```

### Examples

- **Example 1**: User completes puzzle "pro-dishsoap-1" which is the last unplayed puzzle. Total puzzles: 5, Completed: 5. User clicks "Next Puzzle". System selects a random puzzle from all 5 (including completed ones) instead of showing completion message.

- **Example 2**: User completes all 10 available puzzles. URL shows clean `http://localhost:5173/` with no puzzle ID. User can still replay any puzzle from the pool. Expected: Show "Lý thuyết đủ rồi, hãy vào rank mà chiến" message and prevent replay.

- **Example 3**: User has completed 8 out of 10 puzzles. User clicks "Next Puzzle". System correctly selects from the 2 remaining unplayed puzzles (this is correct behavior, not a bug).

- **Edge Case**: User completes the last puzzle while a custom scenario is loaded via URL parameter. System should still detect completion state and show message.

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Puzzle selection from unplayed pool when unplayed puzzles remain must continue to work
- Completion tracking via `puzzleService.markPuzzleCompleted` and `user_puzzle_history` table must remain unchanged
- Active puzzle gameplay and state management through `usePuzzleGame.ts` must function normally
- URL deep linking to specific puzzles must continue to work
- Custom scenario loading via URL parameters must remain functional

**Scope:**
All inputs that do NOT involve the all-puzzles-completed state should be completely unaffected by this fix. This includes:
- Normal puzzle navigation when unplayed puzzles exist
- Puzzle completion marking in the database
- Initial puzzle loading and random selection
- Deep linking to specific puzzle IDs
- Custom scenario handling

## Hypothesized Root Cause

Based on the bug description and code analysis, the root cause is:

1. **Missing Completion State Detection**: The `handleNextPuzzle` function uses a fallback pattern `const pool = unplayedPuzzles.length > 0 ? unplayedPuzzles : puzzles;` that was designed for graceful degradation but inadvertently allows replay when all puzzles are completed. There is no explicit check for the all-completed state.

2. **No UI State for Completion**: The hook does not expose a completion state (e.g., `allPuzzlesCompleted`) that the UI can use to render a completion message instead of the puzzle interface.

3. **URL Clearing Logic**: When `handleNextPuzzle` is called, it clears the puzzle URL parameter, resulting in a clean URL with no indication of completion status.

4. **Lack of Completion Message Component**: There is no UI component or state to display the encouraging message "Lý thuyết đủ rồi, hãy vào rank mà chiến" when all puzzles are completed.

## Correctness Properties

Property 1: Fault Condition - All Puzzles Completed Detection

_For any_ state where all available puzzles have been completed (unplayedPuzzles.length === 0 excluding current puzzle), the fixed system SHALL detect this condition, expose an `allPuzzlesCompleted` state flag, prevent selection of any puzzle from the pool, and enable the UI to display a completion message encouraging ranked mode play.

**Validates: Requirements 2.1, 2.2, 2.3**

Property 2: Preservation - Normal Puzzle Navigation

_For any_ state where unplayed puzzles remain (unplayedPuzzles.length > 0), the fixed code SHALL produce exactly the same behavior as the original code, preserving puzzle selection from the unplayed pool, completion tracking, and all existing navigation functionality.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4**

## Fix Implementation

### Changes Required

Assuming our root cause analysis is correct:

**File**: `src/hooks/usePuzzleGame.ts`

**Function**: `usePuzzleGame` hook and `handleNextPuzzle` function

**Specific Changes**:

1. **Add Completion State Detection**: Add a computed state `allPuzzlesCompleted` that checks if `unplayedPuzzles.length === 0` (excluding current puzzle).
   - Use `React.useMemo` to compute this derived state efficiently
   - Expose this state in the hook's return value for UI consumption

2. **Modify handleNextPuzzle Logic**: Replace the fallback pattern with explicit completion detection.
   - Remove: `const pool = unplayedPuzzles.length > 0 ? unplayedPuzzles : puzzles;`
   - Add: Early return or no-op when `allPuzzlesCompleted` is true
   - Prevent puzzle selection when all puzzles are completed

3. **Update URL Handling**: When all puzzles are completed, clear the puzzle URL parameter to show clean URL.
   - This behavior already exists but should be preserved
   - Ensure URL reflects completion state (no puzzle ID)

4. **Expose Completion State**: Return `allPuzzlesCompleted` boolean from the hook.
   - UI components can use this to conditionally render completion message
   - Message should convey: "Lý thuyết đủ rồi, hãy vào rank mà chiến" (Theory is enough, go play ranked)

5. **Handle Edge Cases**: Ensure custom scenarios and deep linking don't interfere with completion detection.
   - Custom scenarios should not affect completion state calculation
   - Deep linking to a specific puzzle should still work even if all puzzles are completed

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bug on unfixed code, then verify the fix works correctly and preserves existing behavior.

### Exploratory Fault Condition Checking

**Goal**: Surface counterexamples that demonstrate the bug BEFORE implementing the fix. Confirm or refute the root cause analysis. If we refute, we will need to re-hypothesize.

**Test Plan**: Write tests that simulate completing all puzzles and then calling `handleNextPuzzle`. Run these tests on the UNFIXED code to observe failures and understand the root cause. Mock the puzzle data and completion state to create the all-completed scenario.

**Test Cases**:
1. **All Puzzles Completed Test**: Set up state with 5 puzzles, all 5 in completedPuzzleIds. Call handleNextPuzzle. Observe that a puzzle is selected from the pool (will fail on unfixed code - should not select any puzzle).

2. **Completion State Flag Test**: Set up all-completed state. Check if `allPuzzlesCompleted` flag is exposed and true. Observe that flag does not exist or is false (will fail on unfixed code).

3. **URL State After Completion Test**: Complete all puzzles and trigger next puzzle. Observe URL state. Current behavior shows clean URL but still allows replay (will fail on unfixed code - should show completion state).

4. **Edge Case - Custom Scenario**: Load a custom scenario via URL, complete all regular puzzles. Observe if completion detection works correctly (may fail on unfixed code if custom scenarios interfere).

**Expected Counterexamples**:
- `handleNextPuzzle` selects a puzzle from the completed pool when all puzzles are done
- No `allPuzzlesCompleted` state is exposed by the hook
- Possible causes: missing completion detection logic, fallback pattern allows replay, no UI state for completion

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed function produces the expected behavior.

**Pseudocode:**
```
FOR ALL input WHERE isBugCondition(input) DO
  result := usePuzzleGame_fixed(input)
  ASSERT result.allPuzzlesCompleted === true
  ASSERT handleNextPuzzle does not select any puzzle
  ASSERT UI can display completion message
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold, the fixed function produces the same result as the original function.

**Pseudocode:**
```
FOR ALL input WHERE NOT isBugCondition(input) DO
  ASSERT usePuzzleGame_original(input).currentPuzzle = usePuzzleGame_fixed(input).currentPuzzle
  ASSERT usePuzzleGame_original(input).completedPuzzleIds = usePuzzleGame_fixed(input).completedPuzzleIds
  ASSERT puzzle selection behavior is identical
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across the input domain
- It catches edge cases that manual unit tests might miss
- It provides strong guarantees that behavior is unchanged for all non-buggy inputs

**Test Plan**: Observe behavior on UNFIXED code first for normal puzzle navigation (when unplayed puzzles exist), then write property-based tests capturing that behavior.

**Test Cases**:
1. **Normal Navigation Preservation**: Observe that puzzle selection from unplayed pool works correctly on unfixed code when unplayed puzzles exist. Write test to verify this continues after fix.

2. **Completion Tracking Preservation**: Observe that `markPuzzleCompleted` and database tracking work correctly on unfixed code. Write test to verify this continues after fix.

3. **Deep Linking Preservation**: Observe that URL-based puzzle loading works correctly on unfixed code. Write test to verify this continues after fix.

4. **Custom Scenario Preservation**: Observe that custom scenario loading via URL parameters works correctly on unfixed code. Write test to verify this continues after fix.

### Unit Tests

- Test `allPuzzlesCompleted` state calculation with various puzzle/completion combinations
- Test `handleNextPuzzle` behavior when all puzzles are completed (should not select puzzle)
- Test `handleNextPuzzle` behavior when unplayed puzzles exist (should select from unplayed pool)
- Test edge case: completing last puzzle while custom scenario is loaded
- Test URL state management for completion scenario

### Property-Based Tests

- Generate random puzzle pools and completion states, verify correct completion detection
- Generate random navigation sequences, verify preservation of normal behavior when unplayed puzzles exist
- Test that completion tracking continues to work across many scenarios
- Test that deep linking works correctly regardless of completion state

### Integration Tests

- Test full user flow: complete all puzzles one by one, verify completion message appears
- Test that clicking "Next Puzzle" when all completed does not navigate to a puzzle
- Test that UI can render completion message based on `allPuzzlesCompleted` flag
- Test that users can still access specific puzzles via deep linking even after completing all
