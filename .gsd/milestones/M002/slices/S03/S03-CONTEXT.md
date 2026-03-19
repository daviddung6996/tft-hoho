# Phase S03: Coach context correctness and truthful mobile failure handling - Context

**Gathered:** 2026-03-19
**Status:** Completed

<domain>
## Phase Boundary

Lock the correctness contract for coach answers so the overlay never reuses stale analysis across live puzzle changes, and make transport failures land as an honest unavailable state instead of fake certainty or broken loading chrome. This slice owns cache and invalidation rules, session reset semantics for minimize/reopen under context drift, and the unavailable rendering contract. It does not reopen the S02 layout rescue or the S04 performance pass.

</domain>

<decisions>
## Implementation Decisions

### Coach context signature and invalidation
- Treat the coach answer as valid only for one full live decision context, not just one puzzle ID and coach ID.
- Build the signature from the full live coaching question: puzzle ID, decision type, stage, economy snapshot, current options, chosen augments, and the board-state inputs that can change meaning even when the `comp` label looks the same (`synergies`, `boardChampions`, `items`).
- Invalidate prefetched, loading, and completed answers whenever that signature changes; prefer clearing stale work over trying to salvage a partially correct answer.

### Session continuity under context drift
- Minimize/reopen continuity only applies while the live context stays stable.
- If the context changes while the coach is minimized, loading, or already showing a response, the old session must not reopen as if it still belongs to the current spot.
- Preserve the selected coach when it helps the user re-ask quickly, but drop any stale answer, error, or loading state that would misrepresent the current board.

### Failure truthfulness
- Stream, JSON fallback, empty-answer, timeout, and bridge-error paths must all converge on the same honest unavailable contract: no fabricated reasoning, no stale prior answer left on screen, and no loading shell that implies success.
- Keep the user on a recoverable surface with clear retry/back behavior instead of silently closing or inventing a plausible answer.
- Preserve the existing desktop-only NotebookLM handoff contract; do not reintroduce NotebookLM into the mobile response surface just to mask failures.

### Claude's Discretion
- Whether the invalidation boundary lives entirely in `buildCoachContextSignature`, partly in `App.tsx` shaping, or partly in hook-level session bookkeeping.
- Whether unavailable copy remains one generic coach-specific message or surfaces slightly more context as long as it stays truthful and non-fabricated.
- Exact test split between hook, service, overlay, and edge-function coverage.

</decisions>

<specifics>
## Specific Ideas

- Treat "board changed but comp label stayed similar" as a new coaching question, not as a cache hit.
- Prefer resetting to select/unavailable over preserving a stale response after path -> plan -> augment transitions.
- Keep mobile failure UI content-first: the error state should not spend more space on chrome than on the actual unavailable message.

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Milestone contract
- `AGENTS.md` - repo identity, mobile-first product reality, and global rules.
- `.gsd/PROJECT.md` - active milestone framing for `M002`.
- `.gsd/REQUIREMENTS.md` - active requirements `R018-R026`.
- `.gsd/milestones/M002/M002-ROADMAP.md` - slice boundary and dependency map for `S03`.

### Frontend and coach runtime rules
- `src/CONTEXT.md` - current runtime reality and orchestration ownership in `App.tsx`.
- `src/features/coach-select/CONTEXT.md` - coach session invariants, stale-answer risk, and mobile overlay contract after `S02`.
- `src/components/Game/CONTEXT.md` - mobile HUD and overlay invariants that coach reopening must respect.
- `supabase/functions/visian-chat/CONTEXT.md` - transport and failure-handling rules for the edge adapter.
- `services/notebooklm_bridge/CONTEXT.md` - bridge contract and why failures should stay transport-truthful instead of being papered over in the UI.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/features/coach-select/hooks/useCoachSelect.ts`: current source of truth for overlay session state, cache reuse, prefetch, and minimize/reopen behavior.
- `src/features/coach-select/coachSelect.utils.ts`: current `buildCoachContextSignature()` and cache-key helpers.
- `src/features/coach-select/coachSelect.service.ts`: JSON/SSE transport handling and unavailable error mapping.
- `src/features/coach-select/components/CoachResponseCard.tsx`: loading, response, and error rendering contract.
- `src/App.tsx`: builds `coachGameContext` from live puzzle state and owns coach overlay entry/reopen gating.
- `supabase/functions/visian-chat/index.ts`: edge-level timeout/error handling and coach-select transport normalization.

### Established Patterns
- The hook already clears state on `puzzleId` and `contextSignature` changes; `S03` should tighten that boundary rather than invent a parallel cache model.
- Transport failures already normalize toward coach-unavailable errors; the remaining work is to make every frontend state transition honor that truthfulness contract.
- `S02` already locked the mobile overlay hierarchy and the desktop/mobile split; `S03` should preserve that UI contract while changing state semantics underneath it.

### Integration Points
- `App.tsx` coach context shaping feeds the signature boundary.
- `useCoachSelect.ts` owns stale-session invalidation, minimize/reopen semantics, and response/error state transitions.
- `coachSelect.service.ts` plus `visian-chat/index.ts` own the transport truthfulness boundary.
- `CoachResponseCard.tsx` and `CoachSelectOverlay.tsx` own the visible unavailable/loading/retry surface.

</code_context>

<deferred>
## Deferred Ideas

- Mobile interaction performance hardening across open/swap/minimize/reopen - `S04`.
- Broader end-to-end loop responsiveness and browser/UAT acceptance - `S04`.
- Any redesign of the locked `S02` mobile layout hierarchy or the desktop/mobile NotebookLM split.

</deferred>

---

*Phase: S03-coach-context-correctness-and-truthful-mobile-failure-handling*
*Context gathered: 2026-03-19*
