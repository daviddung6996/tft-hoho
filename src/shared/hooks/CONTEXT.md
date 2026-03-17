# Shared Hooks Context

## Purpose

Document the generic reusable hooks under `src/shared/hooks/`.

## Read This When

- You are adding or editing a generic hook intended for broad reuse.
- You need to decide whether a hook is truly shared or belongs to a feature.

## Key Entry Points

- `src/shared/hooks/*`

## Inbound / Outbound Dependencies

- Inbound: frontend modules that need generic hook behavior.
- Outbound: browser APIs or generic utility helpers.

## Relevant Skills

- `problem-solving-pro`

## Rules and Invariants

- Keep hooks here generic across the application.
- Do not move feature-specific hooks here just to reduce import depth.
- If a hook depends on a specific domain contract, keep it with that domain.

## Known Gotchas

- A hook that depends on auth, matches, puzzle state, or a specific business workflow is not truly shared.

## How to Verify

- `rg --files src/shared/hooks`
- Confirm the hook does not depend on feature-only types or services.

## Related Contexts

- `../../CONTEXT.md`
- `../../features/CONTEXT.md`
