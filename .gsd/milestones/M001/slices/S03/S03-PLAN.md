# S03: Worth-learning puzzle standard and flagship puzzle upgrades

**Goal:** Turn the existing puzzle metadata contract into a worth-learning standard carried by concise post-choice review and representative flagship puzzles, then apply that standard to a selected representative puzzle set.
**Demo:** On selected real 2-1, 3-2, and 4-2 puzzles, the player does not see a left-side pre-choice context panel; instead they land on a concise review that moves from comparison into the authored explanation/video flow without extra synthesized lesson copy.

## Must-Haves

- This slice retires R005 and R006 through review and authored metadata surfaces, not through a left-side pre-choice context panel in the live arena shell.
- This slice directly retires R007 by restructuring `DecisionReview` into a concise comparison-first review flow that still teaches through authored explanation and metadata instead of relying on one raw `explanation` field alone.
- This slice directly retires R010 by upgrading a selected representative puzzle set to the new standard, including at least one 4-2 example so `boardStrength`, `hpPressure`, `rollState`, and `previousAugments` stop being theoretical fields.
- Reuse the existing metadata contract in `src/data/puzzleScenarios.ts` and `src/services/puzzleService.ts` before adding schema or inventing a parallel content system.
- Keep S03 scoped to teaching density and representative puzzle quality; premium-desire framing, free/pro endings, and the final coach + review packaging stay in S04.
- Do not ship the removed left-side `PuzzleContextPanel` again unless product direction changes explicitly.

## Proof Level

- This slice proves: integration
- Real runtime required: yes
- Human/UAT required: yes

## Verification

- `npm run test -- src/components/Arena/DecisionReview.test.tsx src/hooks/usePuzzleToPlayers.test.ts src/App.mobile-overlay.test.tsx`
- `npm run build`
- In the browser, open selected representative puzzles across 2-1, 3-2, and 4-2; verify the removed left-side context panel does not appear before the pick, the review flows straight from comparison into explanation/video, and the upgraded metadata survives the save/load or seed path used for those flagship puzzles.

## Observability / Diagnostics

- Runtime signals: `proLpRank`, `tournamentName`, `lobbyHealth`, `difficulty`, `boardStrength`, `hpPressure`, `rollState`, `previousAugments`, `proReasoningIntent`, `planReasoning`, `video_url`.
- Inspection surfaces: `DecisionReview`, `IntentFeedback`, `PlanFeedback`, `MetaTab`, `seedCompletePuzzles`, and the live arena shell for absence of the removed panel.
- Failure visibility: metadata is present in `puzzleService` but absent in the live UI, the removed panel reappears, upgraded puzzles still feel thin, or the review surface regresses into long generic explanation copy.
- Redaction constraints: do not leak private VOD URLs, Supabase keys, or unpublished admin credentials while validating representative puzzles.

## Integration Closure

- Upstream surfaces consumed: `src/App.tsx`, `src/components/Arena/DecisionReview.tsx`, `src/components/Arena/DecisionReviewComponents/PuzzleInfo.tsx`, `src/features/augment-trainer/components/IntentFeedback.tsx`, `src/features/augment-trainer/components/PlanFeedback.tsx`, `src/services/puzzleService.ts`, `src/pages/Admin/PuzzleBuilder/tabs/MetaTab.tsx`, `src/utils/seedCompletePuzzles.ts`.
- New wiring introduced in this slice: a cleaner comparison-first review flow, explicit removal of the left-side pre-choice context panel, and a representative flagship puzzle set authored to the worth-learning standard.
- What remains before the milestone is truly usable end-to-end: S04 still needs to turn the upgraded review/coach value into persuasive free/pro endings and the final integrated loop.

## Tasks

- [ ] **T02: Turn review into a concise, explanation-led teaching surface** `est:1h`
  - Why: `DecisionReview` already has `IntentFeedback`, `PlanFeedback`, and `PuzzleInfo`, but the final teaching surface should stay concise instead of adding a redundant lesson wrapper around the explanation block.
  - Files: `src/components/Arena/DecisionReview.tsx`, `src/components/Arena/DecisionReviewComponents/PuzzleInfo.tsx`, `src/features/augment-trainer/components/IntentFeedback.tsx`, `src/features/augment-trainer/components/PlanFeedback.tsx`, `src/components/Arena/DecisionReview.test.tsx`
  - Do: Restructure the review so it stays comparison-first and falls through to the authored explanation/video surfaces, while keeping VOD/library actions and premium CTA additive instead of replacing the teaching flow.
  - Verify: `npm run test -- src/components/Arena/DecisionReview.test.tsx`
  - Done when: the review feels concise and explanation-led rather than bloated by either generic explanation copy or extra synthesized lesson wrappers.

- [ ] **T03: Expand the authoring contract and upgrade flagship puzzles** `est:1h`
  - Why: `MetaTab` only exposes part of the metadata contract today, and `seedCompletePuzzles.ts` currently tops out at 2-1/3-2 examples, so the repo still lacks a reproducible flagship set for the S03 standard.
  - Files: `src/pages/Admin/PuzzleBuilder/tabs/MetaTab.tsx`, `src/services/puzzleService.ts`, `src/utils/seedCompletePuzzles.ts`, `src/data/puzzleScenarios.ts`
  - Do: Expose the missing worth-learning metadata fields needed for 4-2 and richer review/lesson teaching, preserve their save/load round-trip, and upgrade a selected representative set of flagship puzzles across the shipped stages so the new standard is visible in real content.
  - Verify: `npm run test -- src/hooks/usePuzzleToPlayers.test.ts`
  - Done when: the repo has a reproducible representative puzzle set with populated worth-learning metadata, including at least one 4-2 example, and the admin/seed path can carry that data end-to-end.

- [ ] **T04: Prove flagship puzzles end-to-end and freeze the S04 boundary** `est:45m`
  - Why: this slice only counts if the upgraded puzzles actually feel worth reaching in the live browser and later slices can trust the metadata/review contract without reopening it.
  - Files: `src/components/Arena/DecisionReview.test.tsx`, `src/App.mobile-overlay.test.tsx`, `src/hooks/usePuzzleToPlayers.test.ts`, `src/utils/seedCompletePuzzles.ts`
  - Do: Close the remaining coverage gaps, run build, exercise the flagship puzzle set in the browser/admin or seed path, and record the exact boundary note that S04 still owns premium-desire framing and final endings.
  - Verify: `npm run test -- src/components/Arena/DecisionReview.test.tsx src/hooks/usePuzzleToPlayers.test.ts src/App.mobile-overlay.test.tsx && npm run build`
  - Done when: S03 has repeatable automation plus a browser/content recipe that proves the worth-learning standard on representative puzzles and leaves only S04 integration/premium framing work.

## Files Likely Touched

- `src/App.tsx`
- `src/App.mobile-overlay.test.tsx`
- `src/components/Arena/DecisionReview.tsx`
- `src/components/Arena/DecisionReviewComponents/PuzzleInfo.tsx`
- `src/components/Arena/DecisionReview.test.tsx`
- `src/features/augment-trainer/components/IntentFeedback.tsx`
- `src/features/augment-trainer/components/PlanFeedback.tsx`
- `src/hooks/usePuzzleToPlayers.ts`
- `src/hooks/usePuzzleToPlayers.test.ts`
- `src/pages/Admin/PuzzleBuilder/tabs/MetaTab.tsx`
- `src/services/puzzleService.ts`
- `src/utils/seedCompletePuzzles.ts`
