# S01: Mobile viewport contract and HUD entry

**Goal:** Define and prove the live mobile shell contract so a phone user can enter the puzzle flow in phone-landscape, keep a stable playable viewport, and reach the core HUD entry points without clipped controls or layout collisions.
**Demo:** In a phone-sized viewport, the app either shows the rotate-to-play prompt in portrait or a stable puzzle shell in landscape where board context stays visible and the user can reliably reach coach, augment, menu, and board-return entry points according to the current overlay state.

## Must-Haves

- `R018`: active puzzle gameplay is phone-landscape-first; portrait is a rotate prompt, not a degraded playable layout.
- `R018`: the shell exposes a stable viewport contract with no clipped primary actions, no horizontal-scroll dependency, and no viewport-fixed controls trapped inside the filtered app container.
- `R019`: the always-visible mobile HUD stays intentionally minimal, with coach entry prioritized when the current puzzle phase supports it.
- `R019`: augment entry, board return, and shell utilities remain reachable through explicit state-driven HUD visibility instead of z-index escalation or ad hoc CSS hiding.
- Overlay gating is explicit through `mobileOverlayMode` and shell booleans; when selector/modal surfaces are active, conflicting HUD chrome hides while the return path back to board and back into coach remains predictable.
- Settings/menu surfaces rendered from `viewport-hud-layer` preserve clickability by honoring the known `pointer-events` constraint.

## Proof Level

- This slice proves: integration
- Real runtime required: yes
- Human/UAT required: yes

## Verification

- `npm run test -- src/App.mobile-overlay.test.tsx src/components/Game/GameHUD.test.tsx src/components/Settings/SettingsButton.test.tsx`
- `npm run build`
- Run `npm run dev`, open the live app in mobile emulation around `667x375`, and verify:
  - portrait shows the rotate prompt instead of a broken puzzle shell
  - landscape shows board + minimal HUD without clipped CTAs or horizontal scrolling
  - coach/augment/menu visibility changes only with the expected overlay state
  - menu/settings surfaces opened from the viewport layer remain tappable and do not pass clicks through to gameplay

## Observability / Diagnostics

- Runtime signals: `data-layout-mode`, `data-mobile-overlay-mode`, `data-menu-visible` on `.viewport-hud-layer` and `.app-container`; presence/absence of coach, augment, return, menu, and fullscreen controls.
- Inspection surfaces: `src/App.mobile-overlay.test.tsx`, `src/components/Game/GameHUD.test.tsx`, `src/components/Settings/SettingsButton.test.tsx`, browser mobile emulation, DOM inspection of `viewport-hud-layer`.
- Failure visibility: clipped controls, horizontal scroll, missing return path, HUD chrome visible during blocking overlays, pass-through clicks from `pointer-events: none`, noisy fullscreen rejection behavior.

## Integration Closure

- Upstream surfaces consumed: `src/App.tsx`, `src/components/Game/mobileLayout.ts`, `src/components/Game/GameHUD.tsx`, `src/components/Settings/SettingsButton.tsx`, `src/components/common/LandscapePrompt.tsx`, `src/hooks/useMobileAutoFullscreen.ts`.
- New wiring introduced in this slice: explicit phone-landscape viewport contract, viewport-layer HUD ownership, and state-driven entry-point gating for coach/augment/menu/return flows.
- What remains outside this slice: Coach Select mobile layout/session rescue (`S02`), stale-answer and unavailable handling (`S03`), and interaction performance hardening (`S04`).

## Tasks

- [x] **T01: Lock the phone-landscape gameplay contract** `est:45m`
  - Why: `R018` fails first at the shell boundary, so the layout mode and portrait fallback need to become an explicit contract before any deeper mobile rescue work.
  - Files: `src/App.tsx`, `src/components/Game/mobileLayout.ts`, `src/components/common/LandscapePrompt.tsx`, `src/hooks/useMobileAutoFullscreen.ts`, `src/App.mobile-overlay.test.tsx`
  - Do: codify the phone-landscape baseline in shell state, keep portrait as a rotate-to-play prompt, and preserve trusted-gesture fullscreen behavior without treating fullscreen as guaranteed.
  - Verify: `npm run test -- src/App.mobile-overlay.test.tsx`
  - Done when: phone portrait never drops the user into a broken gameplay shell, and phone landscape consistently enters the playable shell with the expected layout/overlay data attributes.

- [x] **T02: Harden viewport HUD ownership and minimal mobile entry points** `est:1h`
  - Why: `R019` depends on the HUD living in the correct layer and showing only the controls that matter on a phone-sized board.
  - Files: `src/App.tsx`, `src/components/Game/GameHUD.tsx`, `src/components/Game/GameHUD.css`, `src/components/Game/GameHUD.test.tsx`, `src/App.mobile-overlay.test.tsx`
  - Do: keep viewport-anchored controls in `viewport-hud-layer`, drive coach/augment/return/menu visibility from explicit shell booleans plus `mobileOverlayMode`, and preserve coach as the highest-priority persistent mobile entry when relevant.
  - Verify: `npm run test -- src/App.mobile-overlay.test.tsx src/components/Game/GameHUD.test.tsx`
  - Done when: the phone HUD is minimal but sufficient, no primary mobile entry point depends on horizontal scrolling, and blocking overlays suppress conflicting chrome without breaking the board return path.

- [x] **T03: Stabilize menu/settings entry inside the viewport layer** `est:45m`
  - Why: shell controls only count as reachable if the viewport-layer menu and related modals remain tappable under the known pointer-events constraint.
  - Files: `src/components/Settings/SettingsButton.tsx`, `src/components/Settings/SettingsButton.css`, `src/components/Settings/SettingsButton.test.tsx`, `src/App.mobile-overlay.test.tsx`
  - Do: keep menu/fullscreen/settings entry aligned to the mobile HUD contract, avoid hiding unrelated viewport controls by collapsing the wrong container, and ensure any modal/sheet rendered from `viewport-hud-layer` explicitly restores pointer events.
  - Verify: `npm run test -- src/components/Settings/SettingsButton.test.tsx src/App.mobile-overlay.test.tsx`
  - Done when: menu/settings entry remains reachable from the mobile shell, opens a tappable surface, and does not introduce click-through or crop bugs.

- [x] **T04: Prove the S01 shell contract in runtime and close the slice boundary** `est:30m`
  - Why: this slice is only useful if downstream work can trust a real mobile shell baseline instead of a CSS-only approximation.
  - Files: `src/App.mobile-overlay.test.tsx`, `src/components/Game/GameHUD.test.tsx`, `src/components/Settings/SettingsButton.test.tsx`
  - Do: close remaining test gaps around mobile overlay mode transitions, run targeted automation plus build validation, and confirm the phone-landscape shell manually in browser emulation.
  - Verify: `npm run test -- src/App.mobile-overlay.test.tsx src/components/Game/GameHUD.test.tsx src/components/Settings/SettingsButton.test.tsx && npm run build`
  - Done when: automated checks cover the viewport/HUD/menu contract and a real mobile-emulated browser run confirms the slice boundary for `R018-R019` without relying on S02-S04 behavior.

## Files Likely Touched

- `src/App.tsx`
- `src/App.mobile-overlay.test.tsx`
- `src/components/Game/mobileLayout.ts`
- `src/components/Game/GameHUD.tsx`
- `src/components/Game/GameHUD.css`
- `src/components/Game/GameHUD.test.tsx`
- `src/components/Settings/SettingsButton.tsx`
- `src/components/Settings/SettingsButton.css`
- `src/components/Settings/SettingsButton.test.tsx`
- `src/components/common/LandscapePrompt.tsx`
- `src/hooks/useMobileAutoFullscreen.ts`
