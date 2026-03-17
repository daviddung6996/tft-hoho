# Services Context

## Purpose

Describe repo-local service processes that are not part of the browser bundle. Right now this mainly means the hosted NotebookLM bridge.

## Read This When

- You are working on service processes under `services/`.
- You need to understand where the hosted NotebookLM bridge lives.
- You are tracing a request path that leaves the frontend and hits a repo-owned helper service.

## Key Entry Points

- `services/notebooklm_bridge/`

## Inbound / Outbound Dependencies

- Inbound: local tooling and Supabase Edge Functions call into service processes here.
- Outbound: external CLIs and hosted infrastructure.

## Relevant Skills

- `notebooklm`
- `problem-solving-pro`
- `repo-memory`

## Rules and Invariants

- Keep runtime-specific operational docs close to the service subtree.
- Do not treat `services/` as a replacement for `src/services/`; they serve different purposes.
- Service process contracts should remain explicit and narrow.

## Known Gotchas

- `services/` in repo naming does not mean browser-side service modules.
- The only significant service process here today is `services/notebooklm_bridge/`.

## How to Verify

- `rg --files services`
- Open `services/notebooklm_bridge/README.md` and `services/notebooklm_bridge/CONTEXT.md` together when changing bridge behavior.

## Related Contexts

- `../scripts/CONTEXT.md`
- `../src/services/CONTEXT.md`
- `notebooklm_bridge/CONTEXT.md`
