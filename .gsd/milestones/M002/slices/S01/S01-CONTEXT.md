# Phase S01: Mobile viewport contract and HUD entry - Context

**Gathered:** 2026-03-19
**Status:** Completed

<domain>
## Phase Boundary

Define the live mobile shell contract for TFTISEASY so a phone user can reach a stable playable puzzle viewport, keep core HUD actions reachable, and enter/exit overlay surfaces predictably. This slice does not redesign Coach Select itself, solve coach correctness, or optimize full interaction performance beyond what is required to make the shell contract coherent.

</domain>

<decisions>
## Implementation Decisions

### Mobile gameplay baseline
- Treat active puzzle gameplay as phone-landscape-first, not full portrait gameplay.
- Portrait remains a rotate-to-play prompt state rather than a parallel gameplay layout target for this slice.
- "Stable viewport" means no clipped primary actions, no horizontal-scroll dependency for shell controls, and no forced loss of board context just to reach the main mobile entry points.

### HUD priority on phone
- Keep the always-visible mobile HUD intentionally minimal.
- Highest-priority persistent entry is coach access when the current puzzle phase supports it.
- Keep the augment toggle and board-return behavior reachable when relevant to the current puzzle state.
- Secondary utilities and lower-priority actions can live behind menu or existing overflow patterns instead of competing for persistent space.

### Viewport HUD and overlay visibility contract
- Continue using a single `viewport-hud-layer` outside the filtered `app-container` as the owner for viewport-anchored controls.
- Coordinate HUD visibility through explicit shell state and `mobileOverlayMode`, not through z-index escalation.
- When selector or modal overlays are active, conflicting HUD chrome may hide, but the return path back to board and back into coach must stay predictable.
- Do not attach viewport controls to containers that risk crop, filter, or pointer-event inheritance bugs.

### Overlay entry-point priority
- S01 only guarantees stable overlay entry points, not permanent visibility of every CTA.
- If mobile space forces tradeoffs, coach entry outranks other optional overlay actions because coach rescue is the flagship value surface of `M002`.
- Review remains phase-owned behavior instead of becoming a new persistent mobile HUD object in this slice.

### Claude's Discretion
- Exact spacing, icon treatment, safe-area tuning, and animation timing within the chosen shell contract.
- Whether the minimal mobile HUD uses chips, FABs, or existing button treatments as long as hierarchy and reachability stay clear.

</decisions>

<specifics>
## Specific Ideas

- Use the current mobile shell as a contract-hardening pass, not a redesign excuse.
- Prefer "one reliable path to the thing I need" over trying to show every control at once on mobile.
- If the user is stuck, coach should be the persistent thing they can still reach without fighting the layout.

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Milestone contract
- `AGENTS.md` - Product reality, mobile-heavy VN TFT constraint, and global repo rules.
- `.gsd/PROJECT.md` - Active milestone framing for `M002`.
- `.gsd/REQUIREMENTS.md` - Active requirements `R018-R026` that this slice must support.
- `.gsd/milestones/M002/M002-ROADMAP.md` - Slice boundary, success criteria, and dependency map for `S01`.

### Frontend runtime and shell rules
- `src/CONTEXT.md` - Runtime reality and the warning that mobile HUD behavior must be verified in runtime markup, not only CSS.
- `src/components/Game/CONTEXT.md` - Viewport HUD invariants, mobile fullscreen constraints, and layering gotchas.
- `src/components/Settings/CONTEXT.md` - `viewport-hud-layer` pointer-events gotcha for modals rendered from settings controls.
- `src/features/coach-select/CONTEXT.md` - Coach entry expectations and session constraints that inform HUD priority.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/Game/mobileLayout.ts`: current `phone-landscape` detection and `mobileOverlayMode` state model.
- `src/components/Game/GameHUD.tsx`: existing mobile rails plus compact items dock pattern that can anchor the shell contract.
- `src/hooks/useMobileAutoFullscreen.ts`: gesture-armed fullscreen helper already designed for mobile constraints.
- `src/components/Settings/SettingsButton.tsx`: existing viewport-level menu entry and mobile sheet pattern.

### Established Patterns
- `src/App.tsx` already computes `shouldRenderViewportMenu`, `shouldRenderMobileAugmentButton`, `shouldRenderCoachEntryFab`, and `shouldRenderCoachReturnFab` from explicit shell state.
- Mobile HUD suppression already keys off `mobileOverlayMode === 'none'` rather than ad hoc CSS hiding.
- Workspace and coach overlays are treated as blocking surfaces through explicit booleans such as `hasBlockingWorkspaceModal` and `showCoachOverlay`.

### Integration Points
- `src/App.tsx`: source of truth for layout mode, overlay gating, coach entry/return FAB visibility, and puzzle-view orchestration.
- `src/components/Game/GameHUD.tsx`: mobile side rails and bottom utility dock that must align with the shell contract.
- `src/components/Settings/SettingsButton.tsx` and CSS: viewport menu placement, fullscreen entry, and pointer-event-sensitive modal behavior.
- `src/components/common/LandscapePrompt.tsx`: portrait fallback behavior when the active gameplay contract stays landscape-first.

</code_context>

<deferred>
## Deferred Ideas

- Coach Select visual rescue, density, and session continuity details - `S02`.
- Stale-response invalidation and truthful unavailable handling - `S03`.
- Full mobile interaction feel hardening across coach transitions - `S04`.
- Full portrait gameplay support as a separate capability if the product later decides to support playable portrait mode.

</deferred>

---

*Phase: S01-mobile-viewport-contract-and-hud-entry*
*Context gathered: 2026-03-19*
