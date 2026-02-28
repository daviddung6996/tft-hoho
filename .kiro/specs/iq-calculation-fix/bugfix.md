# Bugfix Requirements Document

## Introduction

The IQ calculation system currently displays incorrect IQ changes in the activity history when users replay the same puzzle multiple times. The activity feed shows the most recent IQ change for all historical attempts of the same puzzle, rather than showing the actual IQ change that occurred at the time of each attempt. This creates a confusing user experience where correct answers (marked with ✓) show negative IQ changes, and vice versa.

This bug undermines the core TILT → VALIDATION → SHARE loop by showing users incorrect feedback about their performance, breaking the validation mechanism that is central to the product's value proposition.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN a user completes the same puzzle multiple times THEN the activity history displays the most recent IQ change for all attempts of that puzzle, regardless of the actual IQ change that occurred at each attempt

1.2 WHEN a user views their activity history after replaying a puzzle THEN correct answers (marked with ✓) may show negative IQ changes if the most recent attempt was incorrect

1.3 WHEN the `getRecentAttempts()` function fetches IQ history data THEN it groups by `puzzle_id` and keeps only the latest `change_amount`, causing all attempts of the same puzzle to display the same IQ value

### Expected Behavior (Correct)

2.1 WHEN a user completes the same puzzle multiple times THEN the activity history SHALL display the actual IQ change that occurred at the time of each specific attempt

2.2 WHEN a user views their activity history THEN correct answers (marked with ✓) SHALL always show positive IQ changes, and incorrect answers (marked with ✗) SHALL always show negative IQ changes

2.3 WHEN the `getRecentAttempts()` function fetches IQ history data THEN it SHALL match each puzzle attempt with its corresponding IQ history entry based on both `puzzle_id` AND timestamp proximity or a direct foreign key relationship

### Unchanged Behavior (Regression Prevention)

3.1 WHEN a user completes a puzzle for the first time THEN the system SHALL CONTINUE TO calculate and store the IQ change correctly in the `user_iq_history` table

3.2 WHEN a user's IQ score is updated THEN the system SHALL CONTINUE TO update the `users` table with the new `iq_score` and `iq_rank` values correctly

3.3 WHEN the activity history displays attempt metadata (augment name, stage, reroll count, time) THEN the system SHALL CONTINUE TO show this information accurately

3.4 WHEN the IQ calculation logic determines points based on correctness and speed THEN the system SHALL CONTINUE TO use the existing formula (correct: 25 base + speed bonus, incorrect: -15)
