---
estimated_steps: 6
estimated_files: 5
---

# T02: Keep review concise and explanation-led

**Slice:** S03 - Worth-learning puzzle standard and flagship puzzle upgrades
**Milestone:** M001

## Description

Trim the review surface so it teaches without adding redundant wrappers. `DecisionReview` already has comparison, `IntentFeedback`, `PlanFeedback`, and authored explanation/video; this task keeps that flow concise instead of layering on synthesized lesson text that the authoring path cannot configure directly.

## Steps

1. Review the current `DecisionReview`, `PuzzleInfo`, `IntentFeedback`, and `PlanFeedback` content order.
2. Keep the comparison section first, then fall through to the existing explanation/video surface without an extra synthesized lesson block.
3. Keep existing VOD/library and premium CTA surfaces additive rather than letting them replace the review content.
4. Use the metadata contract from T03 where needed by `IntentFeedback` / `PlanFeedback`, but do not invent unconfigurable lesson copy around only `explanation`.
5. Update desktop and mobile review layouts so the concise flow stays readable in both shells.
6. Add or update focused tests for the simplified review structure.

## Must-Haves

- [ ] Review stays comparison-first and falls through cleanly into the authored explanation/video flow.
- [ ] Existing `IntentFeedback` / `PlanFeedback` still work without being wrapped in extra synthesized lesson copy.
- [ ] Premium CTA remains additive and does not interrupt the teaching surface.

## Verification

- `npm run test -- src/components/Arena/DecisionReview.test.tsx`
- Browser check: finish a representative puzzle and confirm the review goes from comparison into explanation/video without the removed lesson wrapper.

## Observability Impact

- Signals added/changed: review section structure, comparison-to-explanation flow, desktop/mobile parity.
- How a future agent inspects this: `DecisionReview` tests plus the rendered desktop/mobile review shells.
- Failure state exposed: review still feels bloated, or the simplified comparison/explanation flow regresses on one layout.

## Inputs

- `src/components/Arena/DecisionReview.tsx` - current review orchestration and layout.
- `src/components/Arena/DecisionReviewComponents/PuzzleInfo.tsx` - current metadata header.
- `src/features/augment-trainer/components/IntentFeedback.tsx` - 3-2 reasoning surface.
- `src/features/augment-trainer/components/PlanFeedback.tsx` - 4-2 reasoning surface.
- `src/components/Arena/DecisionReview.test.tsx` - current test surface.

## Expected Output

- `src/components/Arena/DecisionReview.tsx` - review kept concise and explanation-led.
- `src/components/Arena/DecisionReviewComponents/PuzzleInfo.tsx` - richer puzzle metadata framing if needed.
- `src/features/augment-trainer/components/IntentFeedback.tsx` and `src/features/augment-trainer/components/PlanFeedback.tsx` - only the adjustments needed to match the simplified review flow.
- `src/components/Arena/DecisionReview.test.tsx` - coverage for the concise comparison/explanation review structure.
