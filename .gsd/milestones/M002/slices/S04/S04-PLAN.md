# S04: Mobile interaction performance and full-loop hardening

**Goal:** Make the assembled `phone-landscape` loop feel responsive and coherent across `puzzle -> coach -> review -> exhaustion/lock`, without reopening the correctness contract already locked in `S03`.
**Demo:** On a phone-landscape viewport, opening coach, swapping coaches, minimizing back to board, reopening, entering review, and hitting completion/lock states all stay readable, non-colliding, and materially smoother than the current churn-heavy path.

## Must-Haves

- `R020`: User can move through puzzle, coach, review, and exhaustion states on mobile without stacked modal collisions or dead-end transitions.
- `R026`: User can use the mobile coach flow without obvious lag during open, swap, ask, minimize, and reopen transitions.
- Preserve the locked desktop/mobile split and the `S03` truthfulness contract.
- Keep `App.tsx` as the source of truth for `layoutMode`; do not let downstream overlays drift to their own raw breakpoint heuristics.
- Prove the assembled loop with both focused automation and a real browser/mobile emulation recipe.

## Proof Level

- This slice proves: integration
- Real runtime required: yes
- Human/UAT required: yes

## Verification

- `npm run test -- src/features/coach-select/components/CoachSelectOverlay.test.tsx src/components/Arena/DecisionReview.test.tsx src/App.mobile-overlay.test.tsx`
- `npm run test -- src/components/Game/GameHUD.test.tsx src/features/coach-select/hooks/useCoachSelect.test.tsx src/hooks/usePuzzleGame.test.ts`
- `npm run build`
- Run the built or dev app in mobile emulation and verify:
  - `667x375` and `568x320`: coach open/swap/minimize/reopen stays smooth and the board remains recoverable while loading
  - review uses the same `phone-landscape` contract as the shell, not a separate breakpoint guess
  - completion and lock overlays stay readable and tappable on short landscape screens instead of forcing desktop-width copy/buttons
  - the loop from puzzle -> coach -> review -> completion/next playable state has no overlapping HUD/overlay chrome

## Observability / Diagnostics

- Runtime signals: `layoutMode`, `mobileOverlayMode`, `showCoachOverlay`, `showReturnFab`, `uiState`, `completionNoticeToken`, `allPuzzlesCompleted`, `currentPuzzleAccess`, `isResolvingNextPuzzle`.
- Inspection surfaces: `src/App.tsx`, `src/features/coach-select/components/CoachSelectOverlay.tsx`, `src/components/Arena/DecisionReview.tsx`, `src/components/Arena/PuzzleCompletionModal.tsx`, `src/features/tcoin/components/PuzzleLockOverlay.tsx`.
- Failure visibility: coach overlay rerenders or remounts on unrelated shell changes, review flips to the wrong surface, completion/lock overlays overflow short landscape, or the assembled loop reintroduces modal/HUD collisions.

## Integration Closure

- Upstream surfaces consumed: `S01` shell layout contract, `S02` mobile coach rescue, `S03` truthfulness and invalidation rules.
- New wiring introduced in this slice: stable coach prop plumbing, shared shell-to-overlay `layoutMode` alignment, and explicit short-landscape hardening for downstream overlays.
- What remains outside this slice: future milestone work beyond `M002`.

## Tasks

- [x] **T01: Reduce coach render churn on the mobile open/swap/minimize/reopen path** `est:1h`
  - Why: `App.tsx` currently rebuilds coach context arrays/objects and handler props inline, which creates avoidable work for the heaviest mobile overlay subtree.
  - Files: `src/App.tsx`, `src/features/coach-select/components/CoachSelectOverlay.tsx`
  - Do: stabilize coach-derived props and handlers, memoize the overlay boundary where it materially reduces rerender churn, and preserve the locked coach behavior.
  - Verify: `npm run test -- src/features/coach-select/components/CoachSelectOverlay.test.tsx src/App.mobile-overlay.test.tsx`
  - Done when: unrelated shell changes no longer force needless mobile coach subtree churn and the open/swap/reopen path remains behaviorally identical.

- [x] **T02: Align review, completion, and lock overlays to the shared phone-landscape contract** `est:1h`
  - Why: the assembled mobile loop breaks trust if downstream overlays infer their own mobile state or keep desktop-width sizing/copy assumptions.
  - Files: `src/App.tsx`, `src/components/Arena/DecisionReview.tsx`, `src/components/Arena/PuzzleCompletionModal.tsx`, `src/features/tcoin/components/PuzzleLockOverlay.tsx`
  - Do: pass shell layout context into downstream overlays, remove drifting local mobile inference where appropriate, and add short-landscape classes/layout adjustments for completion and lock surfaces.
  - Verify: `npm run test -- src/components/Arena/DecisionReview.test.tsx src/App.mobile-overlay.test.tsx`
  - Done when: review/completion/lock surfaces all follow the same mobile shell contract and stay readable/tappable on short landscape screens.

- [x] **T03: Lock regression coverage for the assembled mobile loop** `est:45m`
  - Why: `S04` is only done if the smoothness/full-loop contract is repeatable and protected from future regressions.
  - Files: `src/App.mobile-overlay.test.tsx`, `src/components/Arena/DecisionReview.test.tsx`, `src/features/coach-select/components/CoachSelectOverlay.test.tsx`
  - Do: add targeted assertions for shell-aligned review mode, short-landscape completion/lock states, and any render-sensitive coach-flow contract introduced in `T01`.
  - Verify: `npm run test -- src/features/coach-select/components/CoachSelectOverlay.test.tsx src/components/Arena/DecisionReview.test.tsx src/App.mobile-overlay.test.tsx`
  - Done when: the main assembled mobile loop transitions are frozen in automation.

- [x] **T04: Run build and browser/mobile emulation proof for S04** `est:45m`
  - Why: interaction performance and full-loop acceptance cannot be closed out from code review alone.
  - Files: `docs/agent-context/active.md`, `docs/agent-context/sessions/2026-03-19-m002-s04-execution.md`, `.gsd/STATE.md`, `.gsd/milestones/M002/M002-ROADMAP.md`
  - Do: run the focused suites plus build, record the browser/mobile emulation recipe and outcomes, and update roadmap/state continuity if the slice is complete.
  - Verify: `npm run test -- src/features/coach-select/components/CoachSelectOverlay.test.tsx src/components/Arena/DecisionReview.test.tsx src/App.mobile-overlay.test.tsx && npm run build`
  - Done when: `S04` has repeatable proof and the milestone continuity docs reflect its real status.

## Files Likely Touched

- `src/App.tsx`
- `src/features/coach-select/components/CoachSelectOverlay.tsx`
- `src/features/coach-select/components/CoachSelectOverlay.test.tsx`
- `src/components/Arena/DecisionReview.tsx`
- `src/components/Arena/DecisionReview.test.tsx`
- `src/components/Arena/PuzzleCompletionModal.tsx`
- `src/components/Arena/PuzzleCompletionModal.css`
- `src/features/tcoin/components/PuzzleLockOverlay.tsx`
- `src/features/tcoin/components/PuzzleLockOverlay.css`
- `src/App.mobile-overlay.test.tsx`
