# S04: Premium desire, exhaustion states, and final loop integration

**Goal:** Turn the completed S01-S03 surfaces into one shippable desktop loop with stronger free-to-Pro desire, lighter Pro endings, and clean exhaustion-state routing.
**Demo:** A desktop user can open the app, play a puzzle, optionally ask coach, finish review, and then land in either the next puzzle, a persuasive free lock/end state, or a light Pro ending without the flow feeling stitched together.

## Must-Haves

- This slice directly retires R008 by turning free lock and exhaustion states into persuasive Pro-desire framing instead of generic dead-end gating.
- This slice directly retires R009 and R011 by proving the assembled desktop loop works end to end: puzzle -> optional coach -> review -> next / exhaustion.
- Keep S01's coach handoff intact; S04 packages that value into the loop but does not reopen transport, bridge latency, or NotebookLM internals.
- Keep S02's startup/login/completion cleanup intact; `usePuzzleGame` remains the source of truth for puzzle completion and access routing.
- Keep S03's concise review architecture intact; S04 can package and frame that value, but should not reopen teaching-density or metadata-surface architecture.
- Prefer copy/package and flow integration over new entitlement systems. Daily-window enforcement and deeper monetization policy changes remain out of scope unless proven necessary by the current runtime.

## Proof Level

- This slice proves: integration
- Real runtime required: yes
- Human/UAT required: yes

## Verification

- `npm run test -- src/App.mobile-overlay.test.tsx src/hooks/usePuzzleGame.test.ts src/config/monetization.test.ts src/components/Arena/DecisionReview.test.tsx`
- `npm run build`
- In the browser, exercise the full desktop loop for free and Pro-like states: playable puzzle -> optional coach -> review -> next puzzle / lock overlay / completion ending. Confirm free users feel invited into Pro rather than flatly blocked, and Pro endings stay light and practice-oriented.

## Observability / Diagnostics

- Runtime signals: `currentPuzzleAccess.reason`, `currentPuzzleAccess.tier`, `allPuzzlesCompleted`, `isResolvingNextPuzzle`, `MONETIZATION_MODE`, `showLoginModal`, `showCompletionModal`, lock overlay CTA selection, coach overlay visibility, review CTA visibility.
- Inspection surfaces: `App.tsx`, `usePuzzleGame.ts`, `PuzzleLockOverlay`, `PuzzleCompletionModal`, `DecisionReview`, monetization config/tests, browser DOM, localStorage.
- Failure visibility: free users hit flat dead ends, Pro users get heavy-handed endings, coach/review surfaces disappear behind monetization states, or the loop breaks at next-puzzle / lock transitions.
- Redaction constraints: do not log auth secrets, wallet data, private VOD URLs, or unpublished admin credentials while validating lock and premium flows.

## Integration Closure

- Upstream surfaces consumed: `src/App.tsx`, `src/hooks/usePuzzleGame.ts`, `src/features/tcoin/components/PuzzleLockOverlay.tsx`, `src/components/Arena/PuzzleCompletionModal.tsx`, `src/components/Arena/DecisionReview.tsx`, `src/features/monetization/components/PremiumLaneCallout.tsx`, `src/config/monetization.ts`, `src/features/monetization/monetizationConfig.ts`, `src/features/coach-select/coachSelect.handoff.ts`.
- New wiring introduced in this slice: integrated free/Pro endings, stronger premium-desire framing inside the live loop, and a final acceptance recipe that exercises coach + review + exhaustion together.
- What remains before the milestone is truly usable end to end: milestone closeout / audit only; S04 is the final runtime integration slice for M001.

## Tasks

- [ ] **T01: Audit and lock the S04 loop seam** `est:45m`
  - Why: the runtime already has completion, lock, and next-puzzle seams in `App.tsx` and `usePuzzleGame`; S04 should lock those branch points before changing monetization framing.
  - Files: `src/App.tsx`, `src/hooks/usePuzzleGame.ts`, `src/App.mobile-overlay.test.tsx`, `src/hooks/usePuzzleGame.test.ts`
  - Do: map the exact branch points between playable, locked, exhausted, and completion states; tighten the shell contract so one clear runtime decision wins at each seam; preserve S02's puzzle-first startup contract.
  - Verify: `npm run test -- src/App.mobile-overlay.test.tsx src/hooks/usePuzzleGame.test.ts`
  - Done when: a future agent can follow one stable source of truth for next / lock / completion routing instead of re-debugging overlapping state branches.

- [ ] **T02: Upgrade free and Pro ending framing without reopening monetization policy** `est:1h`
  - Why: the lock and completion surfaces exist, but free endings still risk feeling like flat gating while Pro endings can feel heavier than needed.
  - Files: `src/features/tcoin/components/PuzzleLockOverlay.tsx`, `src/components/Arena/PuzzleCompletionModal.tsx`, `src/features/monetization/components/PremiumLaneCallout.tsx`, `src/config/monetization.ts`, `src/features/monetization/monetizationConfig.ts`, `src/config/monetization.test.ts`
  - Do: strengthen free-user Pro desire and lighten Pro/supporter endings using copy/package and CTA hierarchy first; normalize any mojibake in touched strings; do not invent a new entitlement system unless the current runtime proves insufficient.
  - Verify: `npm run test -- src/config/monetization.test.ts`
  - Done when: free endings feel invitational instead of generic, Pro endings feel light and practice-oriented, and the touched monetization surfaces remain policy-consistent.

- [ ] **T03: Integrate coach, review, and premium surfaces into one loop** `est:1h`
  - Why: S01 and S03 already deliver coach and review value, but S04 is where those surfaces must feel like one coherent loop rather than isolated wins.
  - Files: `src/App.tsx`, `src/components/Arena/DecisionReview.tsx`, `src/features/coach-select/coachSelect.handoff.ts`, `src/features/monetization/components/PremiumLaneCallout.tsx`
  - Do: preserve the optional coach deep-dive and concise review flow while making premium framing additive inside the live loop instead of disruptive or detached.
  - Verify: `npm run test -- src/components/Arena/DecisionReview.test.tsx src/App.mobile-overlay.test.tsx`
  - Done when: the user can move through puzzle, optional coach, review, and premium/framing surfaces without the shell feeling stitched together.

- [ ] **T04: Prove the integrated loop and freeze milestone boundary** `est:45m`
  - Why: this milestone only counts if the final assembled loop works in real browser behavior, not just as passing unit tests.
  - Files: `src/App.mobile-overlay.test.tsx`, `src/hooks/usePuzzleGame.test.ts`, `src/config/monetization.test.ts`, `src/components/Arena/DecisionReview.test.tsx`, `.gsd/STATE.md`, `.gsd/milestones/M001/M001-ROADMAP.md`, `docs/agent-context/active.md`
  - Do: close remaining coverage gaps, run build, exercise the integrated desktop loop in the browser for free and Pro-like states, and record the exact acceptance result needed to close M001.
  - Verify: `npm run test -- src/App.mobile-overlay.test.tsx src/hooks/usePuzzleGame.test.ts src/config/monetization.test.ts src/components/Arena/DecisionReview.test.tsx && npm run build`
  - Done when: S04 has repeatable automation plus a browser/UAT recipe that proves the full loop and leaves only milestone closeout.

## Files Likely Touched

- `src/App.tsx`
- `src/hooks/usePuzzleGame.ts`
- `src/App.mobile-overlay.test.tsx`
- `src/hooks/usePuzzleGame.test.ts`
- `src/features/tcoin/components/PuzzleLockOverlay.tsx`
- `src/components/Arena/PuzzleCompletionModal.tsx`
- `src/components/Arena/DecisionReview.tsx`
- `src/components/Arena/DecisionReview.test.tsx`
- `src/features/monetization/components/PremiumLaneCallout.tsx`
- `src/config/monetization.ts`
- `src/config/monetization.test.ts`
- `src/features/monetization/monetizationConfig.ts`
- `src/features/coach-select/coachSelect.handoff.ts`
