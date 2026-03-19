# S03: Coach context correctness and truthful mobile failure handling

**Goal:** Tighten coach context invalidation and failure semantics so the mobile and desktop coach surfaces never replay stale analysis and always surface honest unavailability.
**Demo:** On mobile or desktop, if the live decision context changes after a coach answer or while loading, the old response disappears and the session returns to a truthful current state; if transport fails, the overlay shows an unavailable state with no fabricated reasoning and the desktop deep-dive path remains intact.

## Must-Haves

- `R023`: User never receives stale coach analysis when the puzzle phase, decision type, option context, or meaningful board-state inputs change.
- `R025`: User sees an honest unavailable state when stream, JSON, timeout, empty-answer, or bridge-error paths fail.
- Preserve the locked `S02` mobile coach layout and do not reopen the desktop/mobile NotebookLM split while fixing correctness.
- Minimize/reopen only preserves an active answer when the same context signature still applies.
- Cache and prefetch reuse must be keyed by the full live coach question, not shallow puzzle or coach identity alone.
- Keep the desktop deep-dive handoff available where it already exists, but do not add new mobile escape hatches to hide a broken failure state.

## Proof Level

- This slice proves: integration
- Real runtime required: yes
- Human/UAT required: yes

## Verification

- `npm run test -- src/features/coach-select/hooks/useCoachSelect.test.tsx src/features/coach-select/coachSelect.service.test.ts src/features/coach-select/components/CoachSelectOverlay.test.tsx src/App.mobile-overlay.test.tsx`
- `npm run build`
- Run `npm run dev`, then verify in browser/mobile emulation that:
  - an answered coach session does not survive a shift from augment -> path -> plan or a new puzzle as if it still belonged to the old spot
  - minimizing during loading or after a response does not produce a stale unread-result comeback once the live context changes
  - forced `visian-chat` failure shows unavailable copy with no leftover reasoning/answer body
  - desktop still keeps its external deep-dive path while `phone-landscape` stays on the clean in-app unavailable surface

## Observability / Diagnostics

- Runtime signals: `contextSignature`, `selectedCoachId`, `uiState`, `isMinimizedForBoard`, `hasUnreadResult`, `decisionType`, `currentDecisionOptions`, `synergies`, `boardChampions`, `items`, `x-request-id`, `x-bridge-request-id`, `x-bridge-cache`.
- Inspection surfaces: `src/features/coach-select/hooks/useCoachSelect.ts`, `src/features/coach-select/coachSelect.utils.ts`, `src/features/coach-select/coachSelect.service.ts`, `src/features/coach-select/components/CoachResponseCard.tsx`, `src/App.tsx`, `supabase/functions/visian-chat/index.ts`.
- Failure visibility: old answer remains after phase/board change, minimized result pops for the wrong context, fallback returns empty yet UI looks successful, or unavailable rendering reuses prior answer text.

## Integration Closure

- Upstream surfaces consumed: the locked `S02` overlay contract, `App.tsx` coach-context shaping, and the current transport diagnostics path.
- New wiring introduced in this slice: richer context signature, explicit stale-session reset rules, and one truthful unavailable state across stream/JSON paths.
- What remains outside this slice: mobile interaction performance and the full-loop hardening owned by `S04`.

## Tasks

- [x] **T01: Expand the coach context signature to match the real live question** `est:1h`
  - Why: the current signature already uses stage, decision, economy, options, and chosen augments, but can still miss board-state drift when the derived `comp` label stays similar.
  - Files: `src/features/coach-select/coachSelect.utils.ts`, `src/App.tsx`, `src/features/coach-select/coachSelect.types.ts`, `src/features/coach-select/hooks/useCoachSelect.ts`
  - Do: include the exact board-state inputs needed for correctness, normalize them consistently, and make sure cache keys/prefetch reuse only hit when the live question is truly the same.
  - Verify: `npm run test -- src/features/coach-select/hooks/useCoachSelect.test.tsx`
  - Done when: answer reuse breaks correctly across phase, option, or meaningful board changes instead of only across puzzle-ID swaps.

- [x] **T02: Reset stale loading and response sessions truthfully across minimize, reopen, and context drift** `est:1h`
  - Why: the hook already resets on signature change, but `S03` must prove that minimized, loading, and response flows never reopen as if an old answer still applies.
  - Files: `src/features/coach-select/hooks/useCoachSelect.ts`, `src/App.tsx`, `src/features/coach-select/components/CoachSelectOverlay.tsx`
  - Do: tighten session bookkeeping so context drift clears unread-result/loading/response state, preserves only what helps a fast re-ask, and never leaves a stale response available through reopen flows.
  - Verify: `npm run test -- src/features/coach-select/hooks/useCoachSelect.test.tsx src/features/coach-select/components/CoachSelectOverlay.test.tsx`
  - Done when: reopen/minimize behavior stays convenient on stable context and becomes safely invalidated on changed context.

- [x] **T03: Unify the unavailable contract across stream, fallback, and edge errors** `est:1h`
  - Why: coach truthfulness breaks if one transport path leaves a fake success shell, stale answer text, or an empty completed response.
  - Files: `src/features/coach-select/coachSelect.service.ts`, `src/features/coach-select/hooks/useCoachSelect.ts`, `src/features/coach-select/components/CoachResponseCard.tsx`, `supabase/functions/visian-chat/index.ts`, `src/features/coach-select/coachSelect.service.test.ts`
  - Do: normalize transport failures and empty outputs so every failure path exits loading cleanly, lands on the same unavailable state, and preserves retry/back/observe-board behavior without fabricating analysis.
  - Verify: `npm run test -- src/features/coach-select/coachSelect.service.test.ts src/features/coach-select/hooks/useCoachSelect.test.tsx`
  - Done when: timeout, stream error, fallback error, and empty-answer cases all surface the same truthful unavailable contract.

- [x] **T04: Lock regression coverage and runtime proof for S03** `est:45m`
  - Why: this slice only counts if correctness and truthfulness are repeatable in both automation and browser behavior, not just inferred from one code path.
  - Files: `src/features/coach-select/hooks/useCoachSelect.test.tsx`, `src/features/coach-select/components/CoachSelectOverlay.test.tsx`, `src/features/coach-select/coachSelect.service.test.ts`, `src/App.mobile-overlay.test.tsx`
  - Do: add the missing regression cases for context shifts, stale reopen, and unavailable rendering; run build; exercise the live mobile/desktop coach flow under context change and forced failure to freeze the `S04` boundary.
  - Verify: `npm run test -- src/features/coach-select/hooks/useCoachSelect.test.tsx src/features/coach-select/coachSelect.service.test.ts src/features/coach-select/components/CoachSelectOverlay.test.tsx src/App.mobile-overlay.test.tsx && npm run build`
  - Done when: `S03` has repeatable automation plus a browser recipe that proves correctness/truthfulness and leaves only `S04` performance/full-loop hardening.

## Files Likely Touched

- `src/App.tsx`
- `src/features/coach-select/hooks/useCoachSelect.ts`
- `src/features/coach-select/hooks/useCoachSelect.test.tsx`
- `src/features/coach-select/coachSelect.utils.ts`
- `src/features/coach-select/coachSelect.types.ts`
- `src/features/coach-select/coachSelect.service.ts`
- `src/features/coach-select/coachSelect.service.test.ts`
- `src/features/coach-select/components/CoachResponseCard.tsx`
- `src/features/coach-select/components/CoachSelectOverlay.tsx`
- `src/features/coach-select/components/CoachSelectOverlay.test.tsx`
- `src/App.mobile-overlay.test.tsx`
- `supabase/functions/visian-chat/index.ts`
