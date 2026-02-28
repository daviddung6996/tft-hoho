# IQ Calculation Fix Bugfix Design

## Overview

The bug occurs in the activity history display where all attempts of the same puzzle show the most recent IQ change value instead of the actual IQ change that occurred at the time of each attempt. This happens because `getRecentAttempts()` in `userStatsService.ts` groups IQ history by `puzzle_id` only, keeping the latest `change_amount` for all attempts of that puzzle.

The fix requires matching each puzzle attempt with its corresponding IQ history entry based on timestamp proximity, since there is no direct foreign key relationship between the two tables. The solution must preserve all existing IQ calculation logic and only modify the data retrieval layer.

## Glossary

- **Bug_Condition (C)**: The condition that triggers the bug - when a user has multiple attempts for the same puzzle and views the activity history
- **Property (P)**: The desired behavior - each attempt should display the IQ change that occurred at that specific attempt's timestamp
- **Preservation**: Existing IQ calculation logic, database writes, and all other stats display functionality must remain unchanged
- **getRecentAttempts()**: The function in `src/services/userStatsService.ts` that fetches activity history data
- **user_puzzle_attempts**: Table storing each puzzle attempt with metadata (correctness, time, rerolls, created_at)
- **user_iq_history**: Table storing IQ changes with puzzle_id, change_amount, is_correct, and created_at
- **Timestamp Proximity Matching**: Technique to match attempts with IQ history entries by finding the closest timestamp

## Bug Details

### Fault Condition

The bug manifests when a user has completed the same puzzle multiple times and views their activity history. The `getRecentAttempts()` function groups IQ history by `puzzle_id` and keeps only the latest `change_amount`, causing all historical attempts of that puzzle to display the same (most recent) IQ value.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type { userId: string, activityHistoryRequest: boolean }
  OUTPUT: boolean
  
  RETURN activityHistoryRequest = true
         AND EXISTS puzzle_id WHERE COUNT(user_puzzle_attempts WHERE puzzle_id = puzzle_id) > 1
         AND user views activity history
END FUNCTION
```

### Examples

- **Example 1**: User completes Puzzle A correctly at 10:00 AM (+25 IQ), then incorrectly at 11:00 AM (-15 IQ)
  - Expected: First attempt shows "+25 IQ", second shows "-15 IQ"
  - Actual: Both attempts show "-15 IQ" (the most recent value)

- **Example 2**: User completes Puzzle B incorrectly at 2:00 PM (-15 IQ), then correctly at 3:00 PM (+25 IQ)
  - Expected: First attempt shows "-15 IQ", second shows "+25 IQ"
  - Actual: Both attempts show "+25 IQ" (the most recent value)

- **Example 3**: User completes Puzzle C three times: correct (+25), incorrect (-15), correct (+30 with speed bonus)
  - Expected: Shows "+25 IQ", "-15 IQ", "+30 IQ" respectively
  - Actual: All three show "+30 IQ" (the most recent value)

- **Edge Case**: User completes Puzzle D once
  - Expected: Shows the correct IQ change for that single attempt
  - Actual: Works correctly (no bug when only one attempt exists)

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- IQ calculation logic in `userIq.service.ts` must continue to work exactly as before
- Database writes to `user_iq_history` and `user_puzzle_attempts` must remain unchanged
- Overall stats display (total attempts, accuracy, avg time, avg rerolls) must remain unchanged
- Stage breakdown statistics must remain unchanged
- Accuracy trend chart must remain unchanged
- The `users` table updates (iq_score, iq_rank, total_puzzles_solved) must remain unchanged

**Scope:**
All functionality that does NOT involve displaying IQ changes in the activity history should be completely unaffected by this fix. This includes:
- IQ calculation when completing puzzles
- Database record creation
- User profile stats aggregation
- Stage-based statistics
- Accuracy trend calculations
- All other service methods in `userStatsService.ts`

## Hypothesized Root Cause

Based on the bug description and code analysis, the root cause is clear:

1. **Incorrect Data Grouping**: The `getRecentAttempts()` function uses this logic:
   ```typescript
   // Keep only the latest IQ entry per puzzle_id
   const iqByPuzzle = new Map<string, number>();
   if (!iqError && iqData) {
       for (const row of iqData) {
           if (!iqByPuzzle.has(row.puzzle_id)) {
               iqByPuzzle.set(row.puzzle_id, row.change_amount);
           }
       }
   }
   ```
   This creates a Map keyed by `puzzle_id` only, storing just one IQ value per puzzle.

2. **Missing Timestamp Correlation**: The function fetches IQ history ordered by `created_at DESC` but doesn't use timestamps to match specific attempts with their corresponding IQ entries.

3. **No Foreign Key Relationship**: The database schema has no `attempt_id` foreign key in `user_iq_history`, so we cannot directly join the tables. We must rely on timestamp proximity matching.

4. **Timing Assumption**: Both records (`user_puzzle_attempts` and `user_iq_history`) are created in the same transaction flow when a puzzle is completed, so their timestamps should be within milliseconds of each other.

## Correctness Properties

Property 1: Fault Condition - Correct IQ Display for Replayed Puzzles

_For any_ puzzle attempt where the user has completed the same puzzle multiple times, the activity history SHALL display the actual IQ change that occurred at the time of that specific attempt, matched by timestamp proximity between `user_puzzle_attempts.created_at` and `user_iq_history.created_at`.

**Validates: Requirements 2.1, 2.2, 2.3**

Property 2: Preservation - IQ Calculation and Storage Logic

_For any_ puzzle completion event, the system SHALL continue to calculate and store IQ changes using the existing logic in `userIq.service.ts`, ensuring that all database writes, score updates, and rank calculations remain unchanged.

**Validates: Requirements 3.1, 3.2, 3.4**

Property 3: Preservation - Other Stats Display

_For any_ stats query that does NOT involve activity history IQ display (overall stats, stage breakdown, accuracy trend), the system SHALL produce exactly the same results as before the fix.

**Validates: Requirements 3.3**

## Fix Implementation

### Changes Required

Assuming our root cause analysis is correct:

**File**: `src/services/userStatsService.ts`

**Function**: `getRecentAttempts()`

**Specific Changes**:

1. **Replace Map-based grouping with timestamp matching**:
   - Remove the `iqByPuzzle` Map that groups by `puzzle_id` only
   - Implement a matching algorithm that finds the closest IQ history entry for each attempt based on timestamp proximity

2. **Fetch all relevant IQ history entries**:
   - Instead of keeping only the latest entry per puzzle, fetch all IQ history entries for the relevant puzzles
   - Keep the `order('created_at', { ascending: false })` to maintain chronological order

3. **Implement timestamp proximity matching**:
   - For each attempt, find the IQ history entry with the closest `created_at` timestamp
   - Use a tolerance window (e.g., ±5 seconds) to account for minor timing differences
   - Prefer exact puzzle_id matches within the tolerance window

4. **Handle edge cases**:
   - If no matching IQ entry is found within tolerance, set `iqChangeAmount` to `null`
   - Ensure the algorithm handles attempts with no corresponding IQ history gracefully

5. **Maintain performance**:
   - Keep the query efficient by limiting IQ history fetch to only the puzzle_ids in the attempts result
   - Avoid N+1 query patterns

**Pseudocode for the fix**:
```typescript
// Fetch all IQ history entries (not just latest per puzzle)
const { data: iqData } = await supabase
    .from('user_iq_history')
    .select('puzzle_id, change_amount, created_at')
    .eq('user_id', uid)
    .in('puzzle_id', puzzleIds)
    .order('created_at', { ascending: false });

// Match each attempt with closest IQ entry by timestamp
return attemptsData.map((attempt) => {
    const attemptTime = new Date(attempt.created_at).getTime();
    
    // Find IQ entry with closest timestamp for this puzzle
    let closestIqEntry = null;
    let minTimeDiff = Infinity;
    
    for (const iqEntry of iqData) {
        if (iqEntry.puzzle_id === attempt.puzzle_id) {
            const iqTime = new Date(iqEntry.created_at).getTime();
            const timeDiff = Math.abs(attemptTime - iqTime);
            
            // Match within 5 second tolerance
            if (timeDiff < 5000 && timeDiff < minTimeDiff) {
                minTimeDiff = timeDiff;
                closestIqEntry = iqEntry;
            }
        }
    }
    
    return {
        ...attempt,
        iqChangeAmount: closestIqEntry?.change_amount ?? null
    };
});
```

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bug on unfixed code, then verify the fix works correctly and preserves existing behavior.

### Exploratory Fault Condition Checking

**Goal**: Surface counterexamples that demonstrate the bug BEFORE implementing the fix. Confirm that the root cause is indeed the Map-based grouping by `puzzle_id`.

**Test Plan**: Create test scenarios where a user completes the same puzzle multiple times with different outcomes. Query the activity history on UNFIXED code and observe that all attempts show the same (most recent) IQ value.

**Test Cases**:
1. **Correct Then Incorrect Test**: Complete puzzle correctly (+25), then incorrectly (-15) - observe both show -15 on unfixed code
2. **Incorrect Then Correct Test**: Complete puzzle incorrectly (-15), then correctly (+25) - observe both show +25 on unfixed code
3. **Multiple Replays Test**: Complete puzzle 3+ times with varying results - observe all show the most recent IQ value on unfixed code
4. **Single Attempt Test**: Complete puzzle once - observe it shows correct IQ value (no bug for single attempts)

**Expected Counterexamples**:
- All attempts of the same puzzle display the most recent `change_amount` value
- Correct answers (✓) show negative IQ when the most recent attempt was incorrect
- The `iqByPuzzle` Map contains only one entry per `puzzle_id`

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds (multiple attempts of same puzzle), the fixed function produces the expected behavior (correct IQ for each attempt).

**Pseudocode:**
```
FOR ALL attempt WHERE isBugCondition(attempt) DO
  result := getRecentAttempts_fixed(userId)
  attemptRecord := result.find(r => r.id === attempt.id)
  ASSERT attemptRecord.iqChangeAmount = getExpectedIqForAttempt(attempt)
END FOR
```

**Test Cases**:
1. **Timestamp Matching Accuracy**: Verify IQ entries are matched within 5-second tolerance
2. **Correct IQ Display**: Verify each attempt shows its actual IQ change from the time it occurred
3. **Chronological Order**: Verify attempts are still ordered by created_at DESC
4. **Null Handling**: Verify attempts without matching IQ entries show null gracefully

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold (single attempts, other stats queries), the fixed function produces the same result as the original function.

**Pseudocode:**
```
FOR ALL input WHERE NOT isBugCondition(input) DO
  ASSERT getRecentAttempts_original(input) = getRecentAttempts_fixed(input)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across the input domain
- It catches edge cases that manual unit tests might miss
- It provides strong guarantees that behavior is unchanged for all non-buggy inputs

**Test Plan**: Observe behavior on UNFIXED code first for single-attempt puzzles and other stats, then write property-based tests capturing that behavior.

**Test Cases**:
1. **Single Attempt Preservation**: Observe that puzzles completed once show correct IQ on unfixed code, verify this continues after fix
2. **Overall Stats Preservation**: Verify `getUserStats()` returns identical results before and after fix
3. **Stage Breakdown Preservation**: Verify `getStageBreakdown()` returns identical results before and after fix
4. **Accuracy Trend Preservation**: Verify `getAccuracyTrend()` returns identical results before and after fix
5. **IQ Calculation Preservation**: Verify `updateUserIq()` in `userIq.service.ts` continues to work identically

### Unit Tests

- Test timestamp matching algorithm with various time differences (0ms, 100ms, 1s, 5s, 10s)
- Test edge case where no IQ entry exists within tolerance window
- Test edge case where multiple IQ entries exist for same puzzle_id
- Test that single-attempt puzzles continue to work correctly
- Test that empty results (no attempts) are handled gracefully

### Property-Based Tests

- Generate random sequences of puzzle attempts (same puzzle, different puzzles, mixed) and verify each attempt gets correct IQ value
- Generate random timestamp offsets between attempts and IQ history entries, verify matching works within tolerance
- Generate random user activity patterns and verify overall stats remain unchanged
- Test that for any user with N attempts, the activity history returns N records with correct IQ values

### Integration Tests

- Test full flow: complete puzzle → verify IQ history created → query activity history → verify correct IQ displayed
- Test replay flow: complete puzzle twice → verify both attempts show different IQ values in activity history
- Test that UserProfileModal displays correct IQ changes in activity feed after fix
- Test that stats aggregation (total attempts, accuracy) remains consistent with activity history data
