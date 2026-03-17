# Admin Context

## Purpose

Document the admin console surface, modal patterns, and role-gated data management flows under `src/pages/Admin/`.

## Read This When

- You are changing admin-only screens or modals.
- You are tracing how admin UI talks to client-side services and Supabase.

## Key Entry Points

- `src/pages/Admin/AdminDataModal.tsx`
- `src/pages/Admin/UserManagement/`
- `src/pages/Admin/ProIqManager/`
- `src/pages/Admin/MemeManager/`
- `src/pages/Admin/PuzzleBuilder/`

## Inbound / Outbound Dependencies

- Inbound: `src/App.tsx`, auth role state, and admin entry controls.
- Outbound: `src/services/*`, feature services, and Supabase RLS-backed tables.

## Relevant Skills

- `problem-solving-pro`
- `supabase-postgres-best-practices`
- `repo-memory`

## Rules and Invariants

- Admin modals should follow the same fixed-overlay visual language as the rest of the app.
- Client-side admin access checks are not enough; Supabase RLS remains authoritative.
- Route puzzle-authoring changes to the Puzzle Builder subtree docs before editing that area.

## Known Gotchas

- Admin UI can show apparent success while the backend refuses the mutation if RLS is wrong.
- Role checks are duplicated across multiple client services, so UI-only fixes are often incomplete.

## How to Verify

- `rg --files src/pages/Admin src/services`
- Open the admin modal and exercise at least one read and one write path against the intended role.

## Related Contexts

- `PuzzleBuilder/CONTEXT.md`
- `../../services/CONTEXT.md`
- `../../../supabase/CONTEXT.md`
