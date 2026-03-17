# Arena Components Context

## Purpose

Document the gameplay board, review flow, overlays, and in-arena presentation logic under `src/components/Arena/`.

## Read This When

- You are changing board rendering, augment selection, review screens, or gameplay overlays.
- You are debugging stacking context, modal layering, or interaction locking inside the arena shell.

## Key Entry Points

- `src/components/Arena/Board.tsx`
- `src/components/Arena/AugmentModal.tsx`
- `src/components/Arena/DecisionReview.tsx`
- `src/components/Arena/TopStatusBar.tsx`
- `src/components/Arena/PuzzleCompletionModal.tsx`
- `src/components/Arena/Board.test.tsx`

## Inbound / Outbound Dependencies

- Inbound: `src/App.tsx`, gameplay hooks, puzzle state, and feature modules such as `augment-trainer`.
- Outbound: shared CSS, `src/components/Game/*`, `src/features/tcoin/*`, and puzzle feedback flows.

## Relevant Skills

- `frontend-design`
- `problem-solving-pro`
- `repo-memory`

## Rules and Invariants

- Use the Hextech overlay atmosphere pattern for gameplay overlays instead of flat black backdrops.
- For in-game overlays inside the filtered app container, do not use `backdrop-filter`.
- Do not wrap gameplay content in a toggled blur container to fake modal focus.
- Keep Decision Review mobile styling sourced from the component CSS, not from duplicated mobile overrides elsewhere.
- Arena interaction locks should be explicit when modals or overlays are meant to freeze gameplay input.

## Known Gotchas

- `app-container` filtering creates stacking-context traps that can shift absolute panels if overlay blur is implemented incorrectly.
- Viewport-level HUD controls can visually beat in-arena modals unless the app explicitly gates them.
- Mobile review behavior drifts if styles are split between multiple sources of truth.

## How to Verify

- `npm run test -- Board`
- `rg -n "hex-overlay-in|backdrop-filter|DecisionReview" src/components/Arena src/styles`
- Run the app and manually open augment, review, and completion overlays.

## Related Contexts

- `../Game/CONTEXT.md`
- `../Settings/CONTEXT.md`
- `../../features/augment-trainer/CONTEXT.md`
- `../../features/tcoin/CONTEXT.md`
