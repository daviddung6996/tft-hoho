# Supabase Edge Functions Context

## Purpose

Document the server-side helper functions under `supabase/functions/`.

## Read This When

- You are changing an edge function.
- You need to decide whether a server-side helper belongs here instead of in browser code.
- You are debugging edge-function deployment or runtime behavior.

## Key Entry Points

- `supabase/functions/visian-chat/`
- `supabase/functions/generate-caption/index.ts`
- `supabase/config.toml`

## Inbound / Outbound Dependencies

- Inbound: frontend clients, local adapters, and hosted service helpers.
- Outbound: Supabase function runtime, secrets, and downstream services such as NotebookLM bridge.

## Relevant Skills

- `notebooklm`
- `supabase-postgres-best-practices`
- `problem-solving-pro`

## Rules and Invariants

- Keep edge functions thin when they are primarily adapters to other systems.
- Secret-bearing or security-sensitive operations belong here instead of in the browser.
- Check `supabase/config.toml` and the actual function folders together before documenting function architecture.

## Known Gotchas

- Browser console output can misreport an internal 500 as a CORS problem.
- Config can reference functions that are not present locally if repo state and remote state drift.
- A function can look healthy at `OPTIONS` while `POST` still fails because required secrets are missing.

## How to Verify

- `rg --files supabase/functions`
- `rg -n "NOTEBOOKLM|CORS|Access-Control-Allow|config.toml" supabase/functions supabase/config.toml`
- Use direct requests to reproduce failures instead of relying only on browser console output.

## Related Contexts

- `../CONTEXT.md`
- `visian-chat/CONTEXT.md`
- `../../services/notebooklm_bridge/CONTEXT.md`
