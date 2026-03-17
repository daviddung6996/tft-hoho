# Supabase Context

## Purpose

Document the real backend surface of the app: auth, tables, RLS, migrations, and the edge-function subtree.

## Read This When

- You are changing schema, RLS, storage, or Supabase-backed behavior.
- You need the backend reality of the product today.

## Key Entry Points

- `supabase/migrations/`
- `supabase/functions/`
- `supabase/config.toml`
- `src/lib/supabase.ts`
- `src/types/supabase.ts`

## Inbound / Outbound Dependencies

- Inbound: frontend services, feature modules, admin tools, and edge functions.
- Outbound: hosted Supabase project state, auth, and persistence.

## Relevant Skills

- `supabase-postgres-best-practices`
- `problem-solving-pro`
- `repo-memory`

## Rules and Invariants

- Supabase is the real backend today.
- Keep schema, migrations, and TypeScript types in sync.
- Treat RLS as authoritative for write success, not just frontend role checks.
- Tighten puzzle references carefully when tables store raw `puzzle_id` values.

## Known Gotchas

- Remote schema and committed migrations can drift from each other.
- Puzzle resets can orphan history, vote, unlock, or analytics rows if referential guardrails are missing.
- Supabase updates blocked by RLS can appear as empty success-like responses instead of obvious authorization errors.

## How to Verify

- `rg --files supabase src/lib/supabase.ts src/types/supabase.ts`
- `rg -n "puzzle_id|RLS|policy|user_unlocked_puzzles" supabase src`

## Related Contexts

- `functions/CONTEXT.md`
- `functions/visian-chat/CONTEXT.md`
- `../src/services/CONTEXT.md`
