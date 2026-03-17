# Client Services Context

## Purpose

Document the legacy client-side Supabase CRUD modules in `src/services/`.

## Read This When

- You are touching `src/services/*`.
- You need to understand how the client still talks directly to Supabase for shared CRUD.
- You are deciding whether a service should stay here or move into a feature-local service file.

## Key Entry Points

- `src/services/puzzleService.ts`
- `src/services/championService.ts`
- `src/services/itemService.ts`
- `src/services/traitService.ts`
- `src/services/userService.ts`
- `src/services/userStatsService.ts`
- `src/services/voteService.ts`

## Inbound / Outbound Dependencies

- Inbound: admin screens, gameplay hooks, and feature modules.
- Outbound: `src/lib/supabase.ts`, shared schema types, and Supabase tables.

## Relevant Skills

- `supabase-postgres-best-practices`
- `problem-solving-pro`

## Rules and Invariants

- These services are still active production code, not dead legacy.
- Keep direct client-to-Supabase behavior explicit.
- When data must be sanitized before persistence, do it here or in the canonical feature helper before this layer writes.
- Do not claim the repo already uses a single clean feature-service architecture everywhere.

## Known Gotchas

- Client-side admin role checks here can drift from the actual RLS rules in the database.
- Shared CRUD services can silently hide architecture drift if docs ignore them.

## How to Verify

- `rg --files src/services`
- `rg -n "supabase" src/services`
- Run the relevant UI flow that exercises the changed service.

## Related Contexts

- `../CONTEXT.md`
- `../pages/Admin/CONTEXT.md`
- `../../supabase/CONTEXT.md`
