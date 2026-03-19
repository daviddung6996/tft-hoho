---
estimated_steps: 5
estimated_files: 4
---

# T03: Integrate coach, review, and premium surfaces into one loop

**Slice:** S04 - Premium desire, exhaustion states, and final loop integration
**Milestone:** M001

## Description

Package the already-completed S01 and S03 value into the final live loop. This task keeps coach and review additive while making premium framing feel like part of the same product story.

## Steps

1. Review the current coach-entry, review, and premium CTA surfaces in the live shell.
2. Preserve the optional coach deep-dive handoff and concise review flow as fixed upstream wins.
3. Make premium framing appear as part of the loop rather than an interruption bolted onto the end.
4. Update the shell only where sequencing, CTA placement, or copy context still feels disjointed.
5. Add or adjust focused tests where the integrated loop behavior becomes observable.

## Must-Haves

- [ ] Coach remains optional and accessible from the live loop.
- [ ] Review remains concise and explanation-led.
- [ ] Premium framing feels integrated, not disruptive.

## Verification

- `npm run test -- src/components/Arena/DecisionReview.test.tsx src/App.mobile-overlay.test.tsx`
- Browser check: play a puzzle, optionally open coach, finish review, and confirm the next premium/ending surface feels like part of one flow.

## Observability Impact

- Signals added/changed: sequencing among coach, review, and premium surfaces.
- How a future agent inspects this: `App.tsx`, review tests, and live browser flow.
- Failure state exposed: coach/review value gets buried or premium framing feels detached from the loop.

## Inputs

- `src/App.tsx`
- `src/components/Arena/DecisionReview.tsx`
- `src/features/coach-select/coachSelect.handoff.ts`
- `src/features/monetization/components/PremiumLaneCallout.tsx`

## Expected Output

- A tighter integrated loop that preserves S01/S03 wins while making monetization framing feel native to the runtime.
