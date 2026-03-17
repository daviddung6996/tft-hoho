# Shared UI Context

## Purpose

Document the strictly presentational shared UI components under `src/shared/ui/`.

## Read This When

- You are adding or editing a generic presentational component.
- You need a neutral UI primitive that should not own business logic.

## Key Entry Points

- `src/shared/ui/*`

## Inbound / Outbound Dependencies

- Inbound: any frontend subtree that needs generic UI primitives.
- Outbound: none beyond styling and composition.

## Relevant Skills

- `frontend-design`

## Rules and Invariants

- Keep this directory presentational.
- Do not place business logic, API calls, or feature-specific state here.
- If a component becomes feature-aware, move it to the owning feature or component subtree.

## Known Gotchas

- A shared primitive that starts depending on auth, puzzle state, or service calls no longer belongs here.

## How to Verify

- `rg --files src/shared/ui`
- Confirm the component has no feature-specific data fetching or business logic.

## Related Contexts

- `../../components/CONTEXT.md`
- `../../features/CONTEXT.md`
