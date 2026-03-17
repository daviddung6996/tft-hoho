# Legacy And Shared Components Context

## Purpose

Describe the legacy and shared UI folders in `src/components/`. This subtree still contains first-class gameplay and modal UI, not just trivial presentational components.

## Read This When

- You are touching `src/components/*`.
- You need to know whether a UI concern still lives in `components` instead of `features`.
- You are splitting work between shared UI shells and feature-specific modules.

## Key Entry Points

- `src/components/Arena/`
- `src/components/Game/`
- `src/components/Settings/`
- `src/components/common/`
- `src/components/Auth/`
- `src/components/Sidebar/`

## Inbound / Outbound Dependencies

- Inbound: `src/App.tsx` and gameplay hooks.
- Outbound: shared CSS, feature services, and specialized feature modules such as `augment-trainer`, `tcoin`, and `video-library`.

## Relevant Skills

- `frontend-design`
- `problem-solving-pro`

## Rules and Invariants

- Do not assume `components/` means dumb-only UI in this repo.
- Route gameplay board work to `Arena` or `Game` before inventing new homes.
- Route modal/profile/settings work to `Settings` when those flows still live there.
- Use subtree-specific contexts for Arena, Game, and Settings before making UI changes.

## Known Gotchas

- A large amount of active gameplay UI still lives here, so architecture docs that ignore `components/` become misleading quickly.

## How to Verify

- `rg --files src/components`
- Open the relevant subtree `CONTEXT.md` before editing a specific area.

## Related Contexts

- `Arena/CONTEXT.md`
- `Game/CONTEXT.md`
- `Settings/CONTEXT.md`
- `../features/CONTEXT.md`
