# Phase S02: Coach Select mobile layout and session continuity - Context

**Gathered:** 2026-03-19
**Status:** Completed

<domain>
## Phase Boundary

Define the mobile Coach Select rescue so a phone user gets a readable, intentional coach overlay instead of a squeezed desktop panel. This slice owns the mobile coach overlay information architecture, the mobile rail interaction model, and the session continuity contract for minimize/reopen. It does not reopen the S01 shell contract.

</domain>

<decisions>
## Implementation Decisions

### Mobile coach overlay composition
- Use a full-width Hextech Command top bar on mobile coach overlay.
- Make the main body hero-first, with a split card that gives identity and action hierarchy room.
- Keep the selector as a bottom horizontal rail, not a compressed 5-up grid.
- Keep NotebookLM visible as a secondary dossier card, not a peer to the main ask CTA.

### Information hierarchy
- The first read should be coach identity and role, then the primary ask action, then the secondary deep-dive path, then the selector rail.
- Avoid dense desktop slabs that try to show all context at once on short landscape screens.
- Preserve the current coach naming, session semantics, and text copy quality; the UI should reframe the content, not rewrite the product voice.

### Session semantics
- Switching coaches remains preview-only until the user confirms.
- Loading close returns the user to the board instead of trapping them in the overlay.
- Context accuracy stays tied to the live puzzle decision state, path/plan/augment, and must not drift to stale content.
- External NotebookLM deep-dive remains a first-class handoff, but secondary to the ask CTA on mobile.

### Claude's Discretion
- Exact card proportions, avatar treatment, glow treatment, stat-bar layout, and rail affordances within the locked hierarchy.
- Whether the selector rail scrolls, snaps, or partially peeks as long as it stays usable on narrow short-landscape screens.
- Motion timing and micro-interactions for overlay entry, rail focus, and CTA emphasis.

</decisions>

<specifics>
## Specific Ideas

- Think "command bar + hero card + bottom rail", not "desktop modal squeezed to fit".
- The mobile layout should feel intentional in `667x375` and tighter short-landscape windows, not merely technically visible.
- Keep the deep-dive path obvious but subordinate to the main ask action.

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Milestone contract
- `AGENTS.md` - repo identity, mobile-first product reality, and global rules.
- `.gsd/PROJECT.md` - active milestone framing for `M002`.
- `.gsd/REQUIREMENTS.md` - active requirements `R018-R026`.
- `.gsd/milestones/M002/M002-ROADMAP.md` - slice boundary and dependency map for `S02`.

### Frontend runtime and shell rules
- `src/CONTEXT.md` - runtime reality and the warning that mobile HUD behavior must be verified in runtime markup, not only CSS.
- `src/components/Game/CONTEXT.md` - viewport HUD invariants, mobile fullscreen constraints, and layering gotchas.
- `src/components/Settings/CONTEXT.md` - `viewport-hud-layer` pointer-events gotcha for modals rendered from settings controls.
- `src/features/coach-select/CONTEXT.md` - coach entry expectations, session constraints, and NotebookLM handoff behavior.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/features/coach-select/components/CoachSelectOverlay.tsx`: current overlay composition and section boundaries.
- `src/features/coach-select/components/CoachResponseCard.tsx`: response-state container that should remain the answer surface.
- `src/features/coach-select/hooks/useCoachSelect.ts`: source of truth for coach session state, previewing, and confirm flows.
- `src/features/coach-select/coachSelect.handoff.ts`: NotebookLM deep-dive target resolution and copy source.

### Established Patterns
- The current overlay already separates hero presentation from response rendering and can be reorganized without inventing a new product model.
- Session continuity is preserved through explicit state, not through arbitrary remounting.
- The mobile rescue must keep the coach surface trustworthy even when the user minimizes and returns.

### Integration Points
- `src/App.tsx`: source of truth for overlay gating and viewport-level entry points.
- `src/features/coach-select/components/CoachSelectOverlay.tsx`: the main mobile layout target.
- `src/features/coach-select/components/CoachResponseCard.tsx`: response-state rendering target.
- `src/features/coach-select/coachSelect.handoff.ts`: NotebookLM secondary handoff contract.

</code_context>

<deferred>
## Deferred Ideas

- Coach context correctness and truthful failure handling - `S03`.
- Mobile interaction performance hardening across coach transitions - `S04`.
- Any attempt to redesign the broader mobile shell beyond the already-locked S01 contract.

</deferred>

---

*Phase: S02-coach-select-mobile-layout-and-session-continuity*
*Context gathered: 2026-03-19*
