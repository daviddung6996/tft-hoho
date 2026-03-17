# Backend Context

## Purpose

Describe the local backend skeleton under `backend/`. This is a future-facing server-side structure, not the current production request path.

## Read This When

- You are touching `backend/features/*`.
- You need to understand the intended controller/service/repo layering.
- You are deciding whether work belongs in the skeleton backend or in Supabase instead.

## Key Entry Points

- `backend/features/auth/auth.controller.ts`
- `backend/features/auth/auth.service.ts`
- `backend/features/auth/auth.repo.ts`
- `backend/features/auth/auth.types.ts`

## Inbound / Outbound Dependencies

- Inbound: exploratory backend work and future server extraction efforts.
- Outbound: may reuse Supabase-backed data access patterns, but is currently separate from the live frontend runtime.

## Relevant Skills

- `problem-solving-pro`
- `repo-memory`

## Rules and Invariants

- Keep the backend shape simple: controller -> service -> repo.
- Do not introduce interface-heavy abstraction for its own sake.
- If the feature is already safely handled by direct Supabase access, do not pretend this folder is mandatory.
- Any documentation here must clearly say this is not the main production backend today.

## Known Gotchas

- This folder exists in the repo, but the app runtime still talks to Supabase directly.
- It is easy to over-document this area as if it were live infrastructure. Do not do that.

## How to Verify

- `rg --files backend`
- Open the auth files and confirm the direct controller/service/repo chain still exists.

## Related Contexts

- `../AGENTS.md`
- `../supabase/CONTEXT.md`
