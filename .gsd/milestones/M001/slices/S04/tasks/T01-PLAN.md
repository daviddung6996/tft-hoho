---
estimated_steps: 5
estimated_files: 4
---

# T01: Audit and lock the S04 loop seam

**Slice:** S04 - Premium desire, exhaustion states, and final loop integration
**Milestone:** M001

## Description

Lock the exact runtime seam between playable, locked, exhausted, and completed states before changing premium framing. This task should make the loop routing legible and stable in `App.tsx` and `usePuzzleGame.ts`, not reopen S02 startup cleanup.

## Steps

1. Review the current branch points for next puzzle, completion, and lock handling in `src/App.tsx` and `src/hooks/usePuzzleGame.ts`.
2. Identify the existing source-of-truth signals: `allPuzzlesCompleted`, `currentPuzzleAccess`, `isResolvingNextPuzzle`, and the completion dismissal state.
3. Remove or simplify any overlapping shell decisions so one clear branch wins at each seam.
4. Extend focused tests around the integrated loop seam without reopening unrelated startup work.
5. Confirm the resulting routing is still puzzle-first and ready for S04 framing work.

## Must-Haves

- [ ] One stable source of truth drives next / lock / completion routing.
- [ ] No S04 work reintroduces boot-time modal churn or S02 regressions.
- [ ] The seam is covered well enough that later copy work can land without re-debugging state flow.

## Verification

- `npm run test -- src/App.mobile-overlay.test.tsx src/hooks/usePuzzleGame.test.ts`
- Browser check: complete a puzzle, hit a locked puzzle, and confirm the shell chooses one clear outcome each time.

## Observability Impact

- Signals added/changed: routing priority among `allPuzzlesCompleted`, `currentPuzzleAccess`, and next-puzzle resolution.
- How a future agent inspects this: `App.mobile-overlay` tests, `usePuzzleGame` tests, and the branching order in `App.tsx`.
- Failure state exposed: duplicate endings, lock overlays racing completion UI, or ambiguous next-step behavior.

## Inputs

- `src/App.tsx` - shell orchestration for review, lock, and completion surfaces.
- `src/hooks/usePuzzleGame.ts` - source of truth for completion/access state.
- `src/App.mobile-overlay.test.tsx` - current shell-flow coverage.
- `src/hooks/usePuzzleGame.test.ts` - current hook contract.

## Expected Output

- `src/App.tsx` - cleaned loop-routing order if overlap still exists.
- `src/hooks/usePuzzleGame.ts` - only the seam adjustments needed to keep routing coherent.
- `src/App.mobile-overlay.test.tsx` and `src/hooks/usePuzzleGame.test.ts` - stronger coverage for the S04 loop seam.
