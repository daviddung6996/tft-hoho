# Patterns

First-load performance verification commands:

- `npm run build`
- `npx vitest run --exclude ".worktrees/**" --exclude ".claude/worktrees/**" src/components/Arena/Board.test.tsx src/hooks/usePuzzleToPlayers.test.ts`
- serve `dist/` with any static server, then measure cold-load with a headless browser or DevTools while distinguishing `OPTIONS` preflight from real `GET` requests.

Useful first-load facts:

- `src/App.tsx` should not block the whole app with `if (!currentPuzzle) return ...`; keep the shell mounted and show an in-canvas loading shell instead.
- When `src/App.tsx` is showing the in-canvas loading shell, gameplay-only HUD chrome must stay hidden too; do not let coach FABs, scout/augment CTAs, or preserved gameplay sessions leak through that shell.
- `src/components/Settings/SettingsButton.tsx` is on the first screen, so menu-only data (`video library`, wallet copy inside the menu, IQ summary in the menu) should not fetch until the menu is actually opened.
- Local arena thumbnails live under `src/assets/arenas/thumbs/`; regenerate them from full backgrounds if a new arena is added.
- For bootstrap network audits against Supabase, count `GET` calls separately from CORS preflight `OPTIONS` or you'll misdiagnose healthy fetches as duplicates.
- If localhost dev still logs duplicate bootstrap requests, check `src/main.tsx` for `React.StrictMode` before treating it as a production bug; use shared in-flight loaders/caches to reduce the cost instead of removing StrictMode.
- The browser console line `Unchecked runtime.lastError: Could not establish connection. Receiving end does not exist.` is extension noise, not an app network regression.
- For scouting smoothness, preserve the original arena background composition in `src/App.tsx`; fix switching by preloading the target arena before commit and only prefetching likely next scout targets, not by rebuilding the whole scene stack.

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
