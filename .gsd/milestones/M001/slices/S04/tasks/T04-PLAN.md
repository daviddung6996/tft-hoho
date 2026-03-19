---
estimated_steps: 5
estimated_files: 7
---

# T04: Prove the integrated loop and freeze milestone boundary

**Slice:** S04 - Premium desire, exhaustion states, and final loop integration
**Milestone:** M001

## Description

Close the milestone by proving the full desktop loop works in automation and real browser behavior. This task freezes the M001 boundary: S04 owns final integration and ending-state framing, not deeper platform or puzzle-system redesign.

## Steps

1. Review the S04 must-haves and the M001 definition of done.
2. Run the full targeted verification stack for the integrated loop.
3. Exercise the browser/UAT recipe across free and Pro-like states.
4. Record the exact pass/fail outcome and leave the milestone boundary explicit in `.gsd` handoff files.
5. Prepare roadmap/state updates needed for milestone closeout if the checks pass.

## Must-Haves

- [ ] Automation covers the integrated loop seam plus ending-state framing surfaces.
- [ ] Real browser/UAT is exercised for free and Pro-like endings.
- [ ] The milestone boundary is explicit: no reopening S01-S03 architecture under S04.

## Verification

- `npm run test -- src/App.mobile-overlay.test.tsx src/hooks/usePuzzleGame.test.ts src/config/monetization.test.ts src/components/Arena/DecisionReview.test.tsx && npm run build`
- Browser/UAT:
  - free/beta user reaches a locked or exhausted state and still sees a usable login/skip/upgrade path
  - free user after beta sees a stronger invitation into Pro instead of generic blocking
  - Pro/supporter ending stays light and points back to real-game practice
  - integrated desktop loop works: puzzle -> optional coach -> review -> next / exhaustion

## Observability Impact

- Signals added/changed: final validated behavior across loop routing, review, coach, and monetization surfaces.
- How a future agent inspects this: targeted tests, browser recipe, and final state/roadmap notes.
- Failure state exposed: M001 appears complete in code but still fails as a live desktop loop.

## Inputs

- `S04-PLAN.md`
- `src/App.mobile-overlay.test.tsx`
- `src/hooks/usePuzzleGame.test.ts`
- `src/config/monetization.test.ts`
- `src/components/Arena/DecisionReview.test.tsx`
- `.gsd/STATE.md`
- `.gsd/milestones/M001/M001-ROADMAP.md`
- `docs/agent-context/active.md`

## Expected Output

- Final S04 automation coverage and browser/UAT recipe.
- State and roadmap notes that are ready to close the milestone once verification passes.
