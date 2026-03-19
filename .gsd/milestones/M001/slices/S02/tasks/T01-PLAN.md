---
estimated_steps: 5
estimated_files: 2
---

# T01: Lock the puzzle-ready desktop entry contract

**Slice:** S02 - Fast puzzle entry and interruption cleanup
**Milestone:** M001

## Description

Finish the existing startup cleanup pass by locking a clear puzzle-ready contract in `App.tsx`. This task should not reopen broad performance profiling; it should make sure the current in-canvas loading shell, lazy modal splits, and HUD gating actually deliver a clean first playable frame.

## Steps

1. Review the current startup shell and lazy modal boundaries in `src/App.tsx`.
2. Keep the in-canvas loading shell as the only pre-puzzle blocker until `currentPuzzle` exists.
3. Preserve the lazy-loaded modal boundaries so startup budget does not regress while cleanup lands.
4. Extend `src/App.mobile-overlay.test.tsx` to cover the initial puzzle-ready handoff and guard against optional UI stealing focus before gameplay is ready.
5. Confirm the updated startup contract still passes targeted tests and is usable in the browser.

## Must-Haves

- [ ] No optional workspace modal steals focus before the puzzle-ready state is reached.
- [ ] The existing loading-shell and HUD gating behavior is covered by automated tests.
- [ ] The task builds on the current startup optimizations instead of replacing them with a parallel approach.

## Verification

- `npm run test -- src/App.mobile-overlay.test.tsx`
- In the browser, hard-refresh the desktop app and confirm `Dang tai...` clears into a playable puzzle instead of a modal takeover.

## Observability Impact

- Signals added/changed: `app-loading-shell` visibility, puzzle-ready HUD visibility, pre-puzzle modal presence.
- How a future agent inspects this: `App.mobile-overlay` tests plus the browser DOM during a hard refresh.
- Failure state exposed: startup regressions where the shell disappears too early or a modal interrupts before gameplay is ready.

## Inputs

- `src/App.tsx` - current startup shell, lazy imports, and workspace-modal gating.
- `src/App.mobile-overlay.test.tsx` - existing app-shell coverage that already asserts loading-shell and HUD behavior.
- D001 in `.gsd/DECISIONS.md` - desktop is the speed bar for this ship pass.

## Expected Output

- `src/App.tsx` - tightened startup gating only if the current shell still allows pre-puzzle interruptions.
- `src/App.mobile-overlay.test.tsx` - startup contract coverage for the cleaned puzzle-ready entry path.
