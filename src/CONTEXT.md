# Frontend Runtime Context

## Purpose

Describe the active application runtime in `src/`, including the main shell, contexts, hooks, and the hybrid frontend organization that mixes legacy and feature-oriented folders.

## Read This When

- You are changing app behavior in `src/`.
- You need the current runtime architecture, not an idealized target architecture.
- You are deciding whether work belongs in `components`, `features`, `services`, or `hooks`.

## Key Entry Points

- `src/main.tsx`
- `src/App.tsx`
- `src/contexts/AuthContext.tsx`
- `src/contexts/GameDataContext.tsx`
- `src/hooks/usePuzzleGame.ts`
- `src/hooks/useGameFlow.ts`
- `src/hooks/usePuzzleToPlayers.ts`

## Inbound / Outbound Dependencies

- Inbound: browser entry, auth state, shared game data.
- Outbound: `src/components/*`, `src/features/*`, `src/services/*`, `src/lib/*`, `supabase/*`.

## Relevant Skills

- `frontend-design`
- `problem-solving-pro`
- `repo-memory`

## Rules and Invariants

- `src/` is the real app core.
- The frontend is hybrid: `src/features`, `src/components`, and `src/services` are all active.
- Extend existing runtime patterns instead of forcing a large architectural rewrite as part of unrelated work.
- `App.tsx` is orchestration-heavy by design today; document that reality instead of hiding it.
- Normalize DB-driven strings through safe helpers instead of assuming TypeScript-required strings are always present in data.

## Known Gotchas

- Documentation that claims everything already lives cleanly under `src/features/*` is wrong.
- Production data can still violate TypeScript assumptions, especially for string normalization and puzzle metadata.

## How to Verify

- `rg --files src`
- `npm run test`
- `npm run build`

## Related Contexts

- `components/CONTEXT.md`
- `features/CONTEXT.md`
- `services/CONTEXT.md`
- `../supabase/CONTEXT.md`
