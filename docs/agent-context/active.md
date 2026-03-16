# Active Work

Current goal:

- Reduce NotebookLM latency in the existing coach transport by narrowing source context and enabling real subprocess streaming without breaking the JSON-first public contract.
- Keep the UI one-click coach flow working locally without Docker by routing `visian-chat` through a local Node adapter that calls the local bridge.

Status:

- Source-group hints now flow from `visian-chat` to the bridge.
- The bridge now supports `source_ids` / `source_groups` and exposes `POST /ask-stream`.
- `services/notebooklm_bridge/.env` now contains real `coach:<id>` source groups pulled from NotebookLM CLI.
- Python bridge tests pass locally; TS typecheck passes locally.
- The frontend now honors `VITE_VISIAN_CHAT_URL` so only `visian-chat` can be overridden to a local adapter while Supabase stays remote.
- `scripts/local_visian_chat_server.ts` now exposes a local `/functions/v1/visian-chat` route that mirrors the Edge Function contract and calls the bridge directly.
- Local adapter smoke tests passed for `/live`, request validation, and an end-to-end one-shot request through the bridge.
- Local adapter override has been moved out of `.env` into `.env.local`, and production builds now fail fast if `VITE_VISIAN_CHAT_URL` still points at localhost.
- Added a production deployment playbook at `docs/deployment/visian-chat-production-ec2.md`.
- `npm run dev` now starts the local bridge, local adapter, and Vite together; `npm run dev:vite` remains available for frontend-only work.
- Coach select prompt/answer contract now targets exactly two labels: `Pick:` and `Giai thich:`. Frontend normalization still accepts legacy `Tai sao:` while caches and old responses age out.

In scope now:

- Add source-scoped NotebookLM queries in the bridge.
- Add an internal streaming endpoint from the bridge.
- Forward source-group hints from `visian-chat`.
- Leave durable notes for follow-up MCP/parser integration.
- Support local development of `visian-chat` without `supabase functions serve`.

Open follow-up:

- Parser GEM orchestration is not in this repo yet; full `asyncio` fan-out across parser sampling and NotebookLM calls will need a separate integration pass.
- Cross-worker dedupe still needs shared state if multi-instance traffic becomes relevant.
- If the local bridge is not running, the adapter will surface `fetch failed`; restart `python app.py` under `services/notebooklm_bridge/` before testing the UI.
- `npm run build` is expected to fail on a dev machine while `.env.local` still points at `127.0.0.1`; unset the override on the build machine before making a production bundle.

High-value files:

- `services/notebooklm_bridge/bridge.py`
- `services/notebooklm_bridge/app.py`
- `services/notebooklm_bridge/tests/test_bridge.py`
- `services/notebooklm_bridge/tests/test_app.py`
- `supabase/functions/visian-chat/index.ts`
- `supabase/functions/visian-chat/prompt.ts`
- `scripts/local_visian_chat_server.ts`
- `src/lib/visianChat.ts`
- `src/features/visian-coach/visianCoach.service.ts`
- `vite.config.ts`
- `docs/deployment/visian-chat-production-ec2.md`
