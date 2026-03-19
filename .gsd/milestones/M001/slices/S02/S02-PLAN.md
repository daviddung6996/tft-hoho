# S02: Fast puzzle entry and interruption cleanup

**Goal:** Finish the live desktop puzzle-ready entry path, remove the automatic opening login interruption, and make completion/lock outcomes resolve without trapping the user in dead-end popups.
**Demo:** From a fresh desktop session, the user lands on a playable puzzle behind the existing in-canvas loading shell, stays in the loop as guest until they explicitly choose login or unlock, and either advances to another puzzle or exits/skips cleanly when completion or lock states appear.

## Must-Haves

- This slice directly retires R001 by finishing the existing puzzle-ready shell path in `src/App.tsx` instead of reopening a broad startup rewrite.
- This slice directly retires R002 by making login, completion, and lock popups intent-driven and non-derailing in the live puzzle loop.
- `AuthContext.isGuest` is treated as the source of truth for repeat guest entry; first auth resolution must not auto-cover the puzzle view just because `user` is null.
- Completion and lock handling reuse the existing `usePuzzleGame` seams (`allPuzzlesCompleted`, `isResolvingNextPuzzle`, `currentPuzzleAccess`, `handleSkipToFreePuzzle`, `applyPuzzleAccessPreset`) so S02 cleans the runtime instead of inventing a parallel state machine.
- S02 only sets the boundary for R008: free exhaustion and locked-puzzle states must avoid dead ends, but persuasive Pro-desire framing and final exhaustion polish stay in S04.

## Proof Level

- This slice proves: integration
- Real runtime required: yes
- Human/UAT required: no

## Verification

- `npm run test -- src/App.mobile-overlay.test.tsx src/hooks/usePuzzleGame.test.ts`
- `npm run build`
- Run the desktop app twice in the browser: once with a clean session and once with persisted `tft_guest_mode=true`; verify the puzzle loads before any optional auth prompt, explicit login entry still works, and completion / lock paths no longer create dead-end popups. For lock-state browser checks, use tests or a temporary local post-beta simulation and revert it before closing the slice.

## Observability / Diagnostics

- Runtime signals: `app-loading-shell` visibility, `showLoginModal`, `allPuzzlesCompleted`, `isResolvingNextPuzzle`, `currentPuzzleAccess.reason`, `currentPuzzleAccess.tier`, `MONETIZATION_MODE`, `tft_guest_mode`, guest completed-puzzle localStorage.
- Inspection surfaces: browser DOM, localStorage, console, `App.mobile-overlay` tests, `usePuzzleGame` tests.
- Failure visibility: opening login modal on boot, completion modal appearing while another puzzle is still resolvable, lock overlay without a skip/free route or explicit login trigger.
- Redaction constraints: never log Supabase tokens, wallet secrets, or auth credentials.

## Integration Closure

- Upstream surfaces consumed: `src/App.tsx`, `src/hooks/usePuzzleGame.ts`, `src/contexts/AuthContext.tsx`, `src/components/Auth/LoginModal.tsx`, `src/components/Arena/PuzzleCompletionModal.tsx`, `src/features/tcoin/components/PuzzleLockOverlay.tsx`, `src/config/monetization.ts`.
- New wiring introduced in this slice: puzzle-ready desktop entry contract, intent-driven login gating, cleaned completion/lock guardrails, beta-safe verification coverage for interruption states.
- What remains before the milestone is truly usable end-to-end: richer review/metadata puzzle teaching in S03, then persuasive free/pro endings and premium-desire framing in S04.

## Tasks

- [ ] **T01: Lock the puzzle-ready desktop entry contract** `est:45m`
  - Why: Prior startup optimization work already shipped shared puzzle bootstrap and lazy modal boundaries, so S02 should finish the live entry contract and guard it against regression rather than reopen broad startup research.
  - Files: `src/App.tsx`, `src/App.mobile-overlay.test.tsx`
  - Do: Keep the existing in-canvas loading shell as the only startup blocker until `currentPuzzle` is ready, preserve lazy-loaded modal boundaries, and tighten app-shell tests around the initial puzzle-ready handoff so non-essential UI does not steal focus before the puzzle appears.
  - Verify: `npm run test -- src/App.mobile-overlay.test.tsx`
  - Done when: A future agent can refresh the app and rely on a stable puzzle-ready shell contract instead of chasing startup regressions across modal state.

- [ ] **T02: Make login entry intent-driven and guest-safe** `est:1h`
  - Why: `App.tsx` currently auto-opens `showLoginModal` on first auth resolution whenever `!user`, which ignores persistent guest mode and creates the exact opening interruption R002 calls out.
  - Files: `src/App.tsx`, `src/contexts/AuthContext.tsx`, `src/components/Auth/LoginModal.tsx`, `src/App.mobile-overlay.test.tsx`
  - Do: Use `isGuest` plus explicit user actions as the real login gate, keep `LoginModal` reachable from the menu and locked-puzzle unlock flows, and preserve guest continuation plus authenticated close behavior without reintroducing boot-time modal takeovers.
  - Verify: `npm run test -- src/App.mobile-overlay.test.tsx`
  - Done when: Fresh and repeat guest sessions land in the puzzle loop without an automatic login modal, while explicit auth entry still works on demand.

- [ ] **T03: Clean completion and lock transitions without stealing S04** `est:1h`
  - Why: `App.tsx` currently opens `PuzzleCompletionModal` both from `allPuzzlesCompleted && !isResolvingNextPuzzle` and when `handleNextPuzzle` cannot find another puzzle; lock states already have `handleSkipToFreePuzzle`, `currentPuzzleAccess`, and `applyPuzzleAccessPreset`, so S02 should consolidate those flows instead of rewriting premium messaging.
  - Files: `src/App.tsx`, `src/hooks/usePuzzleGame.ts`, `src/components/Arena/PuzzleCompletionModal.tsx`, `src/features/tcoin/components/PuzzleLockOverlay.tsx`, `src/hooks/usePuzzleGame.test.ts`
  - Do: Make completion state resolve from one clear runtime decision, preserve next-puzzle refresh behavior, keep skip-to-free and unlock/login branches usable, and use beta-safe tests or temporary local simulation for post-beta branches. Stop at interruption cleanup: do not invent new Pro-desire copy or final exhaustion messaging reserved for S04.
  - Verify: `npm run test -- src/hooks/usePuzzleGame.test.ts`
  - Done when: The user either gets the next puzzle, a clean lightweight end, or a usable lock-state escape hatch without dead-end modal churn.

- [ ] **T04: Prove the cleaned desktop opening loop and freeze the S04 boundary** `est:30m`
  - Why: This slice only counts if the real App shell demonstrates faster-feeling entry plus interruption cleanup, and downstream slices can depend on it without re-litigating login or exhaustion behavior.
  - Files: `src/App.mobile-overlay.test.tsx`, `src/hooks/usePuzzleGame.test.ts`
  - Do: Close remaining coverage gaps, run build, verify the real browser flow for clean session / persisted guest / completion path / local lock simulation, and capture the exact results that S03/S04 can assume. Document that S04 still owns persuasive Pro desire and final free/pro exhaustion tone.
  - Verify: `npm run test -- src/App.mobile-overlay.test.tsx src/hooks/usePuzzleGame.test.ts && npm run build`
  - Done when: S02 has repeatable automation plus a browser recipe that proves R001/R002 directly and leaves only premium-desire polish for S04.

## Files Likely Touched

- `src/App.tsx`
- `src/hooks/usePuzzleGame.ts`
- `src/contexts/AuthContext.tsx`
- `src/components/Auth/LoginModal.tsx`
- `src/components/Arena/PuzzleCompletionModal.tsx`
- `src/features/tcoin/components/PuzzleLockOverlay.tsx`
- `src/App.mobile-overlay.test.tsx`
- `src/hooks/usePuzzleGame.test.ts`
- `src/config/monetization.ts`
