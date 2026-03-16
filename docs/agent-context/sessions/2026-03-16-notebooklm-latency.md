# Session 2026-03-16

What changed:

- Investigated the current bridge and edge transport.
- Confirmed the repo has a hosted CLI bridge, not a real MCP client.
- Confirmed local `notebooklm ask` supports source scoping with `-s` and does not expose an explicit streaming flag.
- Added source-group routing and explicit source IDs to the bridge request contract.
- Added `POST /ask-stream` in the bridge and rewired `coach_select_stream` to consume bridge SSE instead of fake chunking after full completion.
- Added durable context under `docs/agent-context/`.
- Filled `services/notebooklm_bridge/.env` with real NotebookLM source IDs for all 5 coach notebooks via CLI `source list`.
- Added a local Node adapter at `scripts/local_visian_chat_server.ts` so the UI can call `visian-chat` locally without Docker/Deno.
- Added `src/lib/visianChat.ts` and switched frontend callers to respect `VITE_VISIAN_CHAT_URL`.
- Verified end-to-end locally by starting the Python bridge and Node adapter, then posting a real `coach_select` request through `http://127.0.0.1:54321/functions/v1/visian-chat`.
- Split the local adapter override out of `.env` into `.env.local`.
- Added a production build guard in `vite.config.ts` that blocks localhost `VITE_VISIAN_CHAT_URL`.
- Added `docs/deployment/visian-chat-production-ec2.md` with the recommended EC2 + Supabase production flow.
- Added `scripts/dev_local_stack.ts` and rewired `npm run dev` to bring up bridge + adapter + Vite in one command.
- Reworked the coach response prompt contract to `Pick:` plus `Giai thich:` and updated frontend normalization to parse the new label while staying backward-compatible with old `Tai sao:` strings.

What remains:

- Parser GEM / real MCP orchestration is still out of repo scope.
- If this grows beyond one bridge worker, add shared cache/lock infra instead of relying on in-memory dedupe only.
- Decide whether to keep the local adapter as a permanent dev path or replace it later with real local Edge Function serving once Docker is available.
- Optionally automate the EC2 bridge deploy and Supabase secret update into one release script if this becomes a frequent path.

Next step:

- Run the Vite app with `VITE_VISIAN_CHAT_URL` enabled, click `Hoi Visian`, and confirm the modal answer matches the local adapter logs and bridge cache headers.
- On the production build machine, make sure `.env.local` is absent or `VITE_VISIAN_CHAT_URL` is unset before running `npm run build`.
