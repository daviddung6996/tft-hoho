# Bugfix Requirements Document

## Introduction

The puzzle system currently allows users to replay completed puzzles indefinitely when all available puzzles are finished, with no indication that they've completed all content. This creates a poor user experience where users don't receive closure or guidance on what to do next. The fix will prevent replay of completed puzzles, show an encouraging completion message, and guide users toward ranked mode gameplay.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN all available puzzles are completed THEN the system displays a clean URL (http://localhost:5173/) with no puzzle ID and no completion indication

1.2 WHEN all available puzzles are completed THEN the system allows users to replay already-completed puzzles from the pool

1.3 WHEN the user clicks "Next Puzzle" after completing all puzzles THEN the system falls back to selecting from completed puzzles using the logic `const pool = unplayedPuzzles.length > 0 ? unplayedPuzzles : puzzles;`

### Expected Behavior (Correct)

2.1 WHEN all available puzzles are completed THEN the system SHALL display a message encouraging the user to play ranked mode with text conveying "Lý thuyết đủ rồi, hãy vào rank mà chiến" (Theory is enough, go play ranked)

2.2 WHEN all available puzzles are completed THEN the system SHALL NOT allow replaying of already-completed puzzles

2.3 WHEN the user has completed all puzzles THEN the system SHALL suggest the user return later when new puzzles are added

### Unchanged Behavior (Regression Prevention)

3.1 WHEN there are unplayed puzzles remaining THEN the system SHALL CONTINUE TO select the next puzzle from the unplayed pool

3.2 WHEN a user completes a puzzle THEN the system SHALL CONTINUE TO track completion in the `user_puzzle_history` table via Supabase

3.3 WHEN a user is actively playing a puzzle THEN the system SHALL CONTINUE TO function normally with puzzle state management through `usePuzzleGame.ts`

3.4 WHEN puzzle completion is marked THEN the system SHALL CONTINUE TO use `puzzleService.ts` to handle the completion logic
