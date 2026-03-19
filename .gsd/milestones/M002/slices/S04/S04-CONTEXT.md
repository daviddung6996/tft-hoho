# Phase S04: Mobile interaction performance and full-loop hardening - Context

**Gathered:** 2026-03-19
**Status:** Completed

<domain>
## Phase Boundary

Harden the assembled mobile loop so `phone-landscape` feels responsive and trustworthy across `puzzle -> coach -> review -> exhaustion/lock` instead of merely being individually correct. This slice owns render-churn reduction on the mobile coach path, alignment of review/completion/lock surfaces to the same mobile layout contract, and end-to-end runtime proof. It does not reopen the `S02` coach information architecture or the `S03` correctness/truthfulness contract.

</domain>

<decisions>
## Implementation Decisions

### Mobile loop performance boundary
- Optimize the real churn path first: `App.tsx` coach prop shaping, overlay handler identity, and the `CoachSelectOverlay` subtree.
- Prefer stabilizing props and reducing avoidable rerenders over introducing a new state model or speculative caching layer.
- Keep coach swap preview-first and response reading-mode behavior intact while reducing unnecessary work around open, swap, minimize, and reopen.

### Shared mobile layout contract
- Review, completion, and lock surfaces must follow the same `phone-landscape` contract already established by `App.tsx`, not infer mobile mode through their own drifting breakpoint logic.
- `App.tsx` remains the source of truth for mobile layout mode; downstream overlays should accept layout context from the shell instead of recomputing it independently when the loop is assembled.
- On short `phone-landscape` screens, completion and lock overlays should compress and wrap their copy/CTA layout instead of preserving desktop-width assumptions that create dead-end feeling.

### Full-loop hardening
- `S04` proves the assembled mobile loop, not isolated subtrees: opening coach, returning to board, entering review, hitting completion/lock states, and coming back to the next playable surface must not collide or feel visually broken.
- Preserve the locked desktop/mobile split: desktop keeps its legacy coach/review/completion behavior unless the change is explicitly mobile-scoped.
- Preserve `S03` truthfulness: performance work must not reintroduce stale reuse, hidden fake success states, or alternate failure handling.

### Claude's Discretion
- Exact memoization boundaries between `App.tsx`, `CoachSelectOverlay.tsx`, and leaf coach components as long as behavior stays unchanged.
- Whether the mobile full-loop hardening uses modifier classes, explicit `layoutMode` props, or both.
- Exact split of regression coverage between focused component tests and app-level mobile shell tests.

</decisions>

<specifics>
## Specific Ideas

- Treat `layoutMode` as a shell contract that review/completion/lock surfaces consume directly.
- If a surface is only slow because `App.tsx` rebuilds large coach props every render, fix prop stability there before reaching for deeper refactors.
- On mobile exhaustion/lock overlays, prefer shorter stacks and wrapping buttons over desktop-sized wide cards with `nowrap` copy.

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Milestone contract
- `AGENTS.md` - repo identity, mobile-first product reality, and global rules.
- `.gsd/PROJECT.md` - active milestone framing for `M002`.
- `.gsd/REQUIREMENTS.md` - active requirements `R018-R026`.
- `.gsd/milestones/M002/M002-ROADMAP.md` - slice boundary and dependency map for `S04`.

### Frontend runtime and mobile shell rules
- `src/CONTEXT.md` - orchestration ownership in `App.tsx` and runtime reality.
- `src/components/Game/CONTEXT.md` - viewport/HUD/mobile overlay invariants.
- `src/components/Arena/CONTEXT.md` - review/completion overlay stacking and mobile review rules.
- `src/features/coach-select/CONTEXT.md` - mobile coach hierarchy, session semantics, and rerender gotchas.
- `src/features/tcoin/CONTEXT.md` - lock overlay contract and T-Coin runtime context.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/App.tsx`: owns `layoutMode`, coach prop shaping, overlay gating, completion gating, and full-loop assembly.
- `src/features/coach-select/components/CoachSelectOverlay.tsx`: the heaviest mobile coach subtree and the main open/swap/minimize/reopen surface.
- `src/components/Arena/DecisionReview.tsx`: currently infers its own mobile mode instead of consuming shell layout state directly.
- `src/components/Arena/PuzzleCompletionModal.tsx`: current exhaustion overlay with desktop-oriented sizing assumptions.
- `src/features/tcoin/components/PuzzleLockOverlay.tsx`: current lock surface with copy/button layout that can over-assume wider viewports.

### Established Patterns
- `S01` already made `App.tsx` the source of truth for `layoutMode`; downstream surfaces should align to that instead of branching independently.
- `S02` and `S03` already separate mobile layout rescue from state correctness; `S04` should keep that split and harden the assembled experience instead of changing meaning again.
- The codebase already uses `startTransition` for coach switching; `S04` can continue that performance-first style rather than adding broad new infrastructure.

### Integration Points
- `App.tsx` passes state into `DecisionReview`, `CoachSelectOverlay`, `PuzzleCompletionModal`, and `PuzzleLockOverlay`.
- `CoachSelectOverlay.tsx` depends on stable `gameContext`, callbacks, and selected coach identity to avoid extra mobile churn.
- `DecisionReview.tsx`, `PuzzleCompletionModal.tsx`, and `PuzzleLockOverlay.tsx` are the downstream full-loop overlays that must respect the same mobile contract.

</code_context>

<deferred>
## Deferred Ideas

- Any new coach capability, new monetization feature, or NotebookLM surface expansion.
- Reopening `S02` visual hierarchy or `S03` truthfulness semantics.
- General desktop performance cleanup unrelated to the mobile loop.

</deferred>

---

*Phase: S04-mobile-interaction-performance-and-full-loop-hardening*
*Context gathered: 2026-03-19*
