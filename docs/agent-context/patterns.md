# Patterns

NotebookLM bridge commands:

- `notebooklm ask --help`
- `python -m pytest services/notebooklm_bridge/tests/test_bridge.py services/notebooklm_bridge/tests/test_app.py`
- `npm test -- --run supabase/functions/visian-chat/prompt.test.ts src/features/coach-select/coachSelect.service.test.ts`
- `python services/notebooklm_bridge/app.py`
- `npm run visian-chat:local`
- `npm run build`
- `npm run dev`
- `npm run dev:vite`

Useful facts:

- `notebooklm ask` supports `-s/--source` to constrain retrieval to specific source IDs.
- The CLI help exposed no dedicated streaming flag, so true incremental transport has to come from text-mode subprocess stdout rather than `--json`.
- The current repo still has a JSON-first coach contract; streaming is a secondary/internal path.
- If Docker/Deno are unavailable locally, use the Node adapter at `scripts/local_visian_chat_server.ts` and point `VITE_VISIAN_CHAT_URL` at `http://127.0.0.1:54321/functions/v1/visian-chat` instead of trying `supabase functions serve`.
- Keep `VITE_VISIAN_CHAT_URL` in `.env.local`, not `.env`; `vite.config.ts` now blocks production builds if that value still points at localhost.
- `npm run dev` is now the one-command local stack launcher. It starts the Python bridge, then the local `visian-chat` adapter, then Vite; if bridge or adapter is already running on their default ports, it reuses them instead of failing with `EADDRINUSE`.
- Coach responses for the select flow should be constrained to two lines only: `Pick: ...` and `Giai thich: ...`. Do not let prompts drift back to open-ended prose or "Ban co muon..." style endings.
