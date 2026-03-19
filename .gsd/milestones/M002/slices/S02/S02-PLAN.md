# S02: Coach Select mobile layout and session continuity

**Goal:** Rebuild Coach Select into a usable mobile surface that feels intentional on short landscape screens, keeps session continuity intact, and preserves the NotebookLM deep-dive handoff as a secondary path.
**Demo:** In a phone-sized landscape viewport, the coach overlay reads as a full-width Hextech command surface with a hero-first split card, a usable bottom rail, a clear primary ask CTA, and a secondary NotebookLM dossier path that remains reachable without crowding the main action.

## Must-Haves

- `R021`: Coach Select becomes readable on small screens instead of collapsing into a compressed desktop overlay.
- `R022`: Coach session survives minimize and reopen without losing the active context or forcing a stale reset.
- `R024`: The mobile NotebookLM handoff remains visible, tappable, and clearly secondary to the main ask CTA.
- The mobile composition prioritizes command bar -> hero identity -> ask CTA -> secondary dossier -> selector rail.
- Preview-only coach switching remains preview-only until the user confirms, even on the mobile rail.
- Loading close returns to the board, not to a broken or dead-end overlay state.

## Proof Level

- This slice proves: integration
- Real runtime required: yes
- Human/UAT required: yes

## Verification

- `npm run test -- src/features/coach-select/components/CoachSelectOverlay.test.tsx src/features/coach-select/hooks/useCoachSelect.test.tsx`
- `npm run test -- src/App.mobile-overlay.test.tsx src/components/Game/GameHUD.test.tsx src/components/Settings/SettingsButton.test.tsx`
- `npm run build`
- Run `npm run dev`, open Coach Select in mobile emulation around `820px`, `667x375`, and a tighter short-landscape size, then verify:
  - the overlay reads as command bar + hero card + bottom rail, not a crushed desktop panel
  - the selector remains usable as a rail and does not require 5-up compression
  - preview-only switching does not auto-ask
  - loading close returns to observe-board behavior
  - NotebookLM remains visible as a secondary dossier path, not the primary action
  - the interaction order is command bar -> hero identity -> ask CTA -> secondary dossier -> selector rail

## Observability / Diagnostics

- Runtime signals: coach overlay state, selected coach, preview vs confirmed status, loading/response state, and NotebookLM handoff visibility.
- Inspection surfaces: `src/features/coach-select/components/CoachSelectOverlay.tsx`, `src/features/coach-select/components/CoachResponseCard.tsx`, `src/features/coach-select/hooks/useCoachSelect.ts`, `src/features/coach-select/coachSelect.handoff.ts`.
- Failure visibility: selector rail feels unusable, the layout collapses into a dense slab, NotebookLM competes with the primary ask CTA, minimize/reopen loses session state, or loading close traps the user.

## Integration Closure

- Upstream surfaces consumed: the stabilized shell contract from `S01`, the current coach session model, and the NotebookLM handoff resolver.
- New wiring introduced in this slice: mobile coach overlay information architecture, bottom rail interaction model, and the continuity rules for reopen/minimize behavior.
- What remains outside this slice: coach context correctness and truthful failure handling (`S03`), and full interaction performance hardening (`S04`).

## Tasks

- [x] **T01: Refactor overlay IA from header slab to command bar plus hero card plus bottom rail** `est:1h`
  - Why: the current mobile coach surface reads like a compressed desktop overlay, which is the core usability failure this slice is meant to retire.
  - Files: `src/features/coach-select/components/CoachSelectOverlay.tsx`, `src/features/coach-select/components/CoachResponseCard.tsx`, `src/features/coach-select/components/CoachSelectOverlay.css`
  - Do: restructure the overlay into a full-width command bar, a hero-first split card, and a bottom selector rail while preserving the existing session and copy primitives.
  - Verify: `npm run test -- src/features/coach-select/components/CoachSelectOverlay.test.tsx`
  - Done when: the mobile layout hierarchy is visibly different from the desktop overlay and the main ask action is not lost in a dense context slab.

- [x] **T02: Redesign mobile layout and CSS for short landscape screens** `est:1h`
  - Why: the overlay has to remain readable in short landscape windows such as `667x375` and tighter variants, not only in idealized tablet widths.
  - Files: `src/features/coach-select/components/CoachSelectOverlay.css`
  - Do: tune spacing, card proportions, rail height, and text truncation so the surface stays intentional without fixed-height compression.
  - Verify: `npm run test -- src/features/coach-select/components/CoachSelectOverlay.test.tsx src/features/coach-select/hooks/useCoachSelect.test.tsx`
  - Done when: the mobile coach overlay remains legible and tappable across the target short-landscape sizes without requiring a separate portrait layout.

- [x] **T03: Convert the carousel into a usable mobile rail while preserving preview-only switching** `est:45m`
  - Why: the selector must feel like an actual mobile interaction surface, not a squeezed row of cards that accidentally confirms the wrong coach.
  - Files: `src/features/coach-select/components/CoachSelectOverlay.tsx`, `src/features/coach-select/hooks/useCoachSelect.ts`, `src/features/coach-select/components/CoachSelectOverlay.test.tsx`
  - Do: adapt the selector interaction so browsing remains preview-only until confirmation, and the rail stays usable without crowding the main action.
  - Verify: `npm run test -- src/features/coach-select/hooks/useCoachSelect.test.tsx src/features/coach-select/components/CoachSelectOverlay.test.tsx`
  - Done when: coach browsing on mobile stays preview-only, the rail remains usable on narrow screens, and the primary ask CTA still wins the hierarchy.

- [x] **T04: Align select/loading/response states and lock the verification boundary** `est:45m`
  - Why: the visual hierarchy has to hold across all coach states, not only the default preview state.
  - Files: `src/features/coach-select/components/CoachSelectOverlay.tsx`, `src/features/coach-select/components/CoachResponseCard.tsx`, `src/features/coach-select/components/CoachSelectOverlay.test.tsx`, `src/features/coach-select/hooks/useCoachSelect.test.tsx`
  - Do: align select, loading, and response states under the same mobile hierarchy, keep NotebookLM secondary in all states, and close the verification gap around reopen/minimize behavior.
  - Verify: `npm run test -- src/features/coach-select/components/CoachSelectOverlay.test.tsx src/features/coach-select/hooks/useCoachSelect.test.tsx && npm run build`
  - Done when: mobile coach state transitions preserve the hierarchy, the NotebookLM path stays subordinate, and the slice boundary is locked for `S03`.

## Files Likely Touched

- `src/features/coach-select/components/CoachSelectOverlay.tsx`
- `src/features/coach-select/components/CoachSelectOverlay.css`
- `src/features/coach-select/components/CoachResponseCard.tsx`
- `src/features/coach-select/components/CoachSelectOverlay.test.tsx`
- `src/features/coach-select/hooks/useCoachSelect.ts`
- `src/features/coach-select/hooks/useCoachSelect.test.tsx`
