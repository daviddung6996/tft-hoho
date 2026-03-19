---
estimated_steps: 5
estimated_files: 4
---

# T04: Prove flagship puzzles end-to-end and freeze the S04 boundary

**Slice:** S03 - Worth-learning puzzle standard and flagship puzzle upgrades
**Milestone:** M001

## Description

Close S03 by proving the upgraded flagship puzzles actually deliver the new standard in the live app after the left-side pre-choice panel and synthesized lesson wrapper have been removed. This task locks the slice boundary: S03 owns puzzle teaching density and representative content quality, while S04 still owns coach + review packaging, premium desire, and final endings.

## Steps

1. Review the S03 must-haves and the `S03 -> S04` boundary in the roadmap.
2. Add any remaining tests needed for the panel removal, concise review flow, and chosen-augment stage handling.
3. Run the targeted tests and `npm run build`.
4. Exercise the upgraded flagship puzzles in the browser and through the authoring/seed flow.
5. Record the exact results and leave a boundary note that S04 still owns premium-desire framing and final free/pro exhaustion treatment.

## Must-Haves

- [ ] Automation covers the panel removal, the concise comparison/explanation review flow, and representative chosen-augment behavior.
- [ ] The real browser flow is exercised on upgraded flagship puzzles across the shipped stages.
- [ ] The slice summary explicitly leaves S04 ownership intact for premium-desire framing and endings.

## Verification

- `npm run test -- src/components/Arena/DecisionReview.test.tsx src/hooks/usePuzzleToPlayers.test.ts src/App.mobile-overlay.test.tsx && npm run build`
- Browser/content check: open the upgraded flagship puzzle set, verify the removed left-side panel stays absent, the review flows from comparison into explanation/video, and the representative data can still be reproduced through the chosen admin/seed path.

## Observability Impact

- Signals added/changed: final validated path across metadata, panel removal, concise review flow, and representative flagship content.
- How a future agent inspects this: targeted tests, browser flow, and the upgraded seed/admin path.
- Failure state exposed: the side panel returns, a flagship puzzle still feels thin, or S04 would need to reopen core teaching-density work instead of just integrating it.

## Inputs

- `S03-PLAN.md` - slice must-haves and the S04 boundary.
- T02-T03 outputs - panel removal, concise review flow, and representative flagship content.
- `src/components/Arena/DecisionReview.test.tsx`, `src/App.mobile-overlay.test.tsx`, `src/hooks/usePuzzleToPlayers.test.ts`, `src/utils/seedCompletePuzzles.ts` - concrete verification surfaces.

## Expected Output

- `src/components/Arena/DecisionReview.test.tsx`, `src/App.mobile-overlay.test.tsx`, and `src/hooks/usePuzzleToPlayers.test.ts` - final coverage for the S03 contract.
- A repeatable browser/content verification recipe proving the worth-learning standard on flagship puzzles and keeping S04 scoped to integration/premium framing.
