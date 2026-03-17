# Active Work

Latest completed work (2026-03-17):

- Smoothed scouting interactions after the first-load optimization pass by keeping `layout-wrapper` on lightweight arena thumbnails, preloading only the current lobby's arena backgrounds in idle time, and swapping `app-container` to the full background only after it is cached.
- Reduced scouting black-flash risk without changing the arena scene composition: keep the original `app-container` background path, preload the target arena before commit, and avoid full-lobby background decode storms that can make interactions feel sluggish.
- Deduped startup data work that was still noisy in localhost dev: `src/contexts/GameDataContext.tsx` now shares one bootstrap promise for traits/items/champions/augments, `src/hooks/usePuzzleGame.ts` shares the initial puzzle load, and `src/features/tcoin/tcoin.service.ts` now caches in-flight wallet/session reads so multiple `useTCoin()` consumers do not hammer `auth/user_wallets`.
- Reduced first-load transfer on the puzzle screen by removing the eager all-arena preload path from `src/App.tsx` and splitting arena selector thumbnails from full-size gameplay backgrounds in `src/data/arenas.ts`.
- Refactored `src/hooks/usePuzzleToPlayers.ts` to consume `useGameData()` instead of refetching champions/traits/items/augments on mount.
- Changed `src/hooks/useGameFlow.ts` so `puzzle_votes` reload depends on `currentPuzzle?.id`, while `src/hooks/usePuzzleGame.ts` now keeps raw puzzles in state and derives augment enrichment instead of rewriting the puzzle array during bootstrap.
- Lazy-loaded non-critical startup UI in `src/App.tsx` / `src/components/Settings/SettingsButton.tsx` (`DecisionReview`, `ArenaSelectorModal`, `PuzzleCompletionModal`, `SupportModal`) and replaced the full-app `if (!currentPuzzle) return ...` gate with an in-canvas loading shell.
- Tightened the loading-shell contract in `src/App.tsx`: gameplay HUD CTAs (mobile augment toggle, coach FABs) only render once the puzzle is actually ready, and any lingering coach session is dismissed while the in-canvas loading shell is showing.
- Localized above-the-fold game info trait icons and switched Void mod tooltip icons to a bundled local emblem so first load no longer depends on third-party icon hosts.
- Trimmed startup fonts to `Inter 400/600` + `Spectral 600` with only `latin` + `vietnamese` subsets.

Current performance baseline after these changes:

- `npm run build` passes.
- Targeted tests pass: `npx vitest run --exclude ".worktrees/**" --exclude ".claude/worktrees/**" src/components/Arena/Board.test.tsx src/hooks/usePuzzleToPlayers.test.ts`
- Cold-load local desktop on built `dist/`: about `1344KB` total transfer, about `359KB` image bytes, `FCP ~280ms`, `LCP ~1348ms`, `CLS ~0.039`.
- Cold-load local mobile landscape with `4G + CPU x4`: about `1284KB` total transfer, about `299KB` image bytes, `FCP ~4496ms`, `LCP ~6476ms`, `CLS ~0.035`.
- Latest re-measure on built `dist/` (2026-03-17) with local static serve:
  - Desktop Lighthouse: `FCP ~1002ms`, `LCP ~1184ms`, `CLS ~0.044`, `totalByteWeight ~1692KB`, performance score `95`.
  - Desktop browser nav timing: `DOMContentLoaded ~59ms`, `load ~59ms`, `networkidle ~4196ms`, `resource transfer ~1451KB`.
  - Mobile landscape browser audit with `4G + CPU x4`: `FCP ~4368ms`, `LCP ~6420ms`, `CLS ~0.026`, `DOMContentLoaded/load ~4080ms`, `networkidle ~9741ms`, `resource transfer ~1413KB`.
- Core data endpoints now show one real `GET` each for `puzzles`, `traits`, `items`, `champions`, `augments`, and `puzzle_votes`; the second line in raw network logs is Supabase CORS preflight (`OPTIONS`), not duplicated app logic.
- Localhost dev logs can still show duplicate mount/effect behavior because `src/main.tsx` keeps `React.StrictMode`; the shared loaders above make those duplicates much lighter, but dev console traces are still not a production-equivalent latency signal.

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
