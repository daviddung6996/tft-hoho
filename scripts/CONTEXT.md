# Scripts Context

## Purpose

Document the local tooling scripts used for seeding, data loading, local NotebookLM adapter flow, and development orchestration.

## Read This When

- You are touching anything under `scripts/`.
- You are debugging the local `visian-chat` adapter or `npm run dev`.
- You need to seed data or run repo-local maintenance tooling.

## Key Entry Points

- `scripts/dev_local_stack.ts`
- `scripts/local_visian_chat_server.ts`
- `scripts/download_tft_assets.ts`
- `scripts/db/*`

## Inbound / Outbound Dependencies

- Inbound: local developer workflows and operator tooling.
- Outbound: `services/notebooklm_bridge/`, `supabase/functions/visian-chat/`, and frontend overrides such as `src/lib/visianChat.ts`.

## Relevant Skills

- `notebooklm`
- `problem-solving-pro`
- `repo-memory`

## Rules and Invariants

- Scripts are tooling, not app runtime.
- The local `visian-chat` adapter must mirror the Supabase Edge Function contract closely.
- Local override behavior belongs in `.env.local`, not in production env files.
- Prefer explicit script entrypoints over ad-hoc one-off commands when the workflow already exists here.

## Known Gotchas

- `npm run dev` depends on the local adapter plus the bridge, not just Vite.
- If `VITE_VISIAN_CHAT_URL` still points to localhost, production builds should fail fast rather than silently shipping a broken override.
- If the local bridge is down, the adapter surfaces fetch failures that can look like app bugs.

## How to Verify

- `npm run dev`
- `npm run visian-chat:local`
- `rg --files scripts`

## Related Contexts

- `../services/CONTEXT.md`
- `../services/notebooklm_bridge/CONTEXT.md`
- `../supabase/functions/visian-chat/CONTEXT.md`
