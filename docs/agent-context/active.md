# Active Work

Latest completed work (2026-03-29):

- Preserved background Coach Select sessions on desktop instead of resetting them on re-entry. `src/features/coach-select/hooks/useCoachSelect.ts` now treats `openSelect()` as a reopen action whenever a coach session is already in `loading` or `response`, so minimizing to inspect the board no longer forces the flow back to `select` if the user re-enters through the coach CTA. `src/App.tsx` also changed the loading return FAB copy to an explicit action (`Tiếp tục với <coach>`) and removed the dimmed look for that in-flight re-entry state. Verified with focused Vitest coverage in `src/features/coach-select/hooks/useCoachSelect.test.tsx` and `src/App.mobile-overlay.test.tsx`.
- Fixed the `Coach Select` CTA becoming effectively untappable on `phone-landscape`. The root cause was layout, not `visian-chat`: the overlay still behaved like a cropped in-canvas layer, while the phone-landscape header/context/carousel kept desktop-sized height and squeezed `.coach-select-content` down to about `43px`, pushing `Hỏi Visian` outside the visible hit area. `src/features/coach-select/components/CoachSelectOverlay.css` now uses a fixed overlay with explicit pointer events plus a compact `phone-landscape` variant for the header, context chips, info panel, CTA, and carousel so the CTA stays inside the viewport and a real tap reaches `askCoach()`. Verified with a Playwright mobile emulation run (`915x412`) and focused overlay Vitest suites.

Latest completed work (2026-03-20):

- Restored production `visian-chat` after repeated `502` responses were traced to expired NotebookLM auth on the EC2 bridge. `curl http://127.0.0.1:8080/health` returned `cli_failed` with `Authentication expired or invalid`, and the service recovered after copying a fresh Windows `C:\Users\Administrator\.notebooklm\storage_state.json` to `~/notebooklm-bridge/secrets/storage_state.json`, restarting `docker compose`, and rechecking `/health` plus the Supabase function POST.
- Fixed the Cloudflare production build by updating stale tests in `src/components/Arena/PuzzleCompletionModal.test.tsx` and `src/features/tcoin/components/PuzzleLockOverlay.test.tsx`. Those tests still passed a removed `layoutMode` prop and asserted deleted `--phone-landscape` classes, so TypeScript failed in `npm run build` even though runtime components were fine.
- Removed the unused GitHub Actions workflow `.github/workflows/supabase-deploy.yml` after confirming the product deploy path is Cloudflare, not GitHub Actions. This prevents irrelevant Supabase CI failure emails from a workflow the team does not use.

Latest completed work (2026-03-19):

- Fixed the first-pass scout revisit flicker by removing the stale inline arena preload helper from `src/App.tsx` and routing scout arena readiness through `src/utils/arenaBackgroundPreload.ts`, so cached backgrounds are not committed until decode finishes.

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

- Finish the Set 17 migration without leaving split-brain data paths between generated artifacts and Supabase seed scripts.
- Keep the champion parser/generator path stable while tightening the seed contract to match the documented `champions` schema.
- Continue the remaining runtime cleanup and end-to-end migration verification after the local seed-path fixes.

Recent Set 17 migration progress (2026-03-31):

- Added `src/utils/tacticsToolsSet17Parser.ts` plus focused Vitest coverage in `src/utils/tacticsToolsSet17Parser.test.ts` for simplified markup, multi-card parsing, live SSR snippets, and trailing page-chrome cleanup.
- Added `scripts/generateSet17Champions.ts` and `npm run generate:set17-champions`; regenerated `src/data/set17_champions.json` with 62 champions and verified `Ability Traits` noise count dropped to `0`.
- Added `src/utils/set17ChampionSeed.ts` plus `src/utils/set17ChampionSeed.test.ts` to isolate artifact→DB mapping, sanitize ability descriptions, and require `SUPABASE_SERVICE_ROLE_KEY` for real seed writes.
- Updated `src/utils/seedChampions.ts` to consume the tested mapper, seed by stable champion ID first, and keep a name fallback only for migration reconciliation.
- Review found a stats-shape regression risk: the temporary artifact is still Set-16-compatible/flat, while the documented Set 17 DB contract expects nested stats. The mapper now accepts both shapes, but the generator has not yet been upgraded to emit the fully nested Set 17 stats object.
- Cleared the remaining live Set 16-facing runtime surfaces: `src/components/Auth/LoginModal.tsx` now shows `SET 17`, `src/data/gameInfoData.ts` now serves Set 17-themed featured path/modifier data instead of Ionia/Void Set 16 content, and `src/pages/Admin/PuzzleBuilder/components/GameInfoSelector.tsx` copy now matches the Set 17 framing. Focused tests were added in `src/components/Auth/LoginModal.test.tsx` and `src/data/gameInfoData.test.ts`.
- Finished the Set 17-only DB and asset cleanup. `scripts/normalizeSet17AssetRefs.ts` now audits and removes legacy rows/votes/attempts plus stray legacy asset files, `scripts/download_tft_assets.ts` now prunes recursively while respecting local nested asset refs, and `scripts/populateChampionStats.ts` re-imported all 62 champion stats/ability payloads from the generated Set 17 artifact.
- Applied `supabase/migrations/20260331153000_set17_only_cleanup.sql` to the linked remote database after repairing the coarse local migration history and temporarily hiding the duplicate-prefix local migration files that collide in `schema_migrations`. Post-cleanup audit now reports zero legacy champion/trait/item/augment IDs, zero legacy puzzle votes/attempts/payloads, zero legacy asset files, `hasFeaturedPuzzleColumns: true`, and `hasLegacyPuzzleColumns: false`.
- Fixed the admin puzzle create/save crash caused by stale runtime schema compatibility code. `src/services/puzzleService.ts` was still selecting and writing `ionia_path_id` / `void_mod_ids`; it now uses only `featured_path_id` / `featured_mod_ids`, and bulk import was updated the same way. Verified with a direct DB insert/delete smoke test plus `npm run build`.
- Completed the real Set 17 game-info migration. `src/data/gameInfoData.ts` now uses the official 7 Stargazer Constellations and 9 Realm Gods from the repo Set 17 reference, `src/pages/Admin/PuzzleBuilder/components/GameInfoSelector.tsx` now lets admins pick 1 constellation plus 2 gods, and runtime gameplay resolves puzzle ids into real tooltips/rendered state instead of rolling the old placeholder gods/modifiers.

Immediate next step:

- Next verification focus: do a browser QA pass in both the admin puzzle builder and gameplay board to confirm existing puzzles with saved `featured_*` ids render the intended constellation/gods and that empty puzzles still get the random fallback roll.

High-value files:

- `src/utils/tacticsToolsSet17Parser.ts`
- `src/utils/tacticsToolsSet17Parser.test.ts`
- `src/utils/set17ChampionSeed.ts`
- `src/utils/set17ChampionSeed.test.ts`
- `src/utils/seedChampions.ts`
- `scripts/generateSet17Champions.ts`
- `src/data/set17_champions.json`
- `tftset17/supabase-schema.md`
- `supabase/migrations/add_champion_stats.sql`
- `supabase/migrations/002_add_rls_to_existing_tables.sql`

Open follow-up:

- The script now correctly requires `SUPABASE_SERVICE_ROLE_KEY`; anon-key fallback was removed because RLS only allows admin writes on `champions`.
- Grep for `Set16|set16|TFT16|tft16` now returns documentation/memory files only, not active runtime, seed, parser, or migration paths.

In scope now:

- Promote the generator from compatibility mode to true Set 17 stats output.
- Verify the remaining runtime cleanup and migration end-to-end after the generator/schema alignment lands.
- Keep the local parser and seed tests green while tightening the final DB contract.

Current performance baseline after these changes:

- `npx vitest run src/utils/tacticsToolsSet17Parser.test.ts src/utils/set17ChampionSeed.test.ts` passes.
- `npm run generate:set17-champions` writes `62` Set 17 champions.
- Generated artifact check confirms trailing page noise count is `0`.

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
- GitHub Actions no longer handle Supabase deploys in this repo; `.github/workflows/supabase-deploy.yml` was removed because the active deploy path is Cloudflare for the app, with Supabase managed outside that unused workflow.

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

## 2026-03-31 - Coach select click must acknowledge in-flight prefetch immediately

Context:

- `useCoachSelect` already prefetches coach answers in the background after `openSelect()` / `selectCoach()` to hide NotebookLM latency.
- Users reported that clicking `Hỏi Visian` could feel dead when the matching prefetch was still running.

What changed:

- `src/features/coach-select/hooks/useCoachSelect.ts` now flips the hook into `loading` as soon as `askCoach()` adopts an in-flight prefetch for the same coach/context.
- `src/features/coach-select/hooks/useCoachSelect.test.tsx` now covers the regression: while prefetch is pending, a user click must immediately move the UI to `loading`, then reuse the prefetched response without spawning a second request.

Why it matters:

- Background prefetch should keep the CTA clickable before the user clicks.
- Once the user clicks, the UI must acknowledge ownership of that request immediately; otherwise the CTA looks broken even though the background promise is still working.

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
- GitHub Actions no longer handle Supabase deploys in this repo; `.github/workflows/supabase-deploy.yml` was removed because the active deploy path is Cloudflare for the app, with Supabase managed outside that unused workflow.

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
