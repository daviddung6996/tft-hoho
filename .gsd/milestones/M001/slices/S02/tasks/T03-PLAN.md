---
estimated_steps: 6
estimated_files: 5
---

# T03: Clean completion and lock transitions without stealing S04

**Slice:** S02 - Fast puzzle entry and interruption cleanup
**Milestone:** M001

## Description

Clean the interruption states around completion and locked puzzles using the state already exposed by `usePuzzleGame`. This task should make the current runtime choose between next puzzle, lightweight completion, or skip/login/unlock escape hatches without drifting into S04's premium-desire rewrite.

## Steps

1. Review the current dual completion triggers in `src/App.tsx` and the `handleNextPuzzle`, `allPuzzlesCompleted`, `isResolvingNextPuzzle`, and access-state behavior in `src/hooks/usePuzzleGame.ts`.
2. Consolidate completion display rules so stale or duplicate completion modals do not interrupt a resolvable next-puzzle flow.
3. Reuse `currentPuzzleAccess`, `handleSkipToFreePuzzle`, and `applyPuzzleAccessPreset` to keep locked-puzzle states escapable.
4. Keep beta and default copy branches intact; verify post-beta branches through tests or temporary local simulation rather than shipping a permanent config change.
5. Extend hook and/or app tests around all-completed, no-next-puzzle, and skip-to-free/login-required cases.
6. Confirm the task stops at interruption cleanup and leaves persuasive Pro-desire / final exhaustion narrative to S04.

## Must-Haves

- [ ] Completion modal display comes from one clear resolved state, not competing triggers.
- [ ] Locked puzzle states have working explicit actions (login/unlock or skip to free) instead of dead ends.
- [ ] No committed change leaves the monetization beta window permanently altered.

## Verification

- `npm run test -- src/hooks/usePuzzleGame.test.ts`
- Browser check: finish a puzzle and confirm next-puzzle reset or clean completion behavior. When locally simulating post-beta, hit a paid puzzle, confirm the lock overlay shows login and/or skip routes, then revert the beta window before closing the task.

## Observability Impact

- Signals added/changed: `allPuzzlesCompleted`, `isResolvingNextPuzzle`, `currentPuzzleAccess`, `lockMessageVariant`, `hasFreePuzzlesAvailable`.
- How a future agent inspects this: `usePuzzleGame` tests, App behavior after clicking next puzzle, and browser lock-overlay states.
- Failure state exposed: duplicate completion popups, lock overlays with no forward path, or a committed beta-window mutation.

## Inputs

- `src/App.tsx` - current completion modal effect, next-puzzle wrapper, and lock-overlay wiring.
- `src/hooks/usePuzzleGame.ts` - existing completion and access-state seams (`handleSkipToFreePuzzle`, `applyPuzzleAccessPreset`, `currentPuzzleAccess`).
- `src/components/Arena/PuzzleCompletionModal.tsx` - current lightweight end-state copy and close behavior.
- `src/features/tcoin/components/PuzzleLockOverlay.tsx` - current login/unlock/skip action surface.
- `src/config/monetization.ts` plus `src/config/CONTEXT.md` - beta-window constraint for safe verification.

## Expected Output

- `src/App.tsx` - cleaned popup resolution between next puzzle, completion, and lock states.
- `src/hooks/usePuzzleGame.ts` - state/API behavior aligned with the app guardrails.
- `src/components/Arena/PuzzleCompletionModal.tsx` and/or `src/features/tcoin/components/PuzzleLockOverlay.tsx` - only the adjustments needed to remove dead ends.
- `src/hooks/usePuzzleGame.test.ts` - coverage for completion detection, no-next-puzzle, and skip/login lock behavior.
