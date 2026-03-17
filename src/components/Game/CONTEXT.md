# Game Shell Context

## Purpose

Document the viewport shell, HUD, layout mode logic, and mobile gameplay framing under `src/components/Game/`.

## Read This When

- You are changing HUD visibility, fullscreen behavior, viewport layout, or mobile gameplay chrome.
- You are debugging controls that should anchor to the viewport rather than to the game container.

## Key Entry Points

- `src/components/Game/GameScene.tsx`
- `src/components/Game/GameHUD.tsx`
- `src/components/Game/GameHUD.css`
- `src/components/Game/mobileLayout.ts`
- `src/hooks/useMobileAutoFullscreen.ts`

## Inbound / Outbound Dependencies

- Inbound: `src/App.tsx`, layout mode state, and arena gameplay flow.
- Outbound: viewport HUD rendering, fullscreen helpers, and mobile overlay rules.

## Relevant Skills

- `frontend-design`
- `problem-solving-pro`

## Rules and Invariants

- Viewport-anchored utility controls belong in a viewport layer, not inside a filtered game container.
- Gate HUD visibility through explicit app state instead of trying to out-z-index modal layers.
- Do not hide the entire menu container on mobile if it also owns unrelated viewport controls.
- Treat mobile auto-fullscreen as gesture-armed behavior, not something guaranteed from `useEffect`.

## Known Gotchas

- `position: fixed` inside a filtered app container behaves like it is fixed to that container, not the real viewport.
- A sibling viewport HUD layer can sit above every fixed modal inside the app container if visibility is not explicitly coordinated.
- Browser fullscreen APIs often reject calls that are not tied to a trusted user gesture.

## How to Verify

- `rg -n "viewport-hud-layer|fullscreen|mobile overlay|menu-container" src/App.tsx src/components/Game src/hooks/useMobileAutoFullscreen.ts`
- Run the app on desktop and mobile-sized viewports and confirm menu/fullscreen visibility around overlays.

## Related Contexts

- `../Arena/CONTEXT.md`
- `../Settings/CONTEXT.md`
- `../../CONTEXT.md`
