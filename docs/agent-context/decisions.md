# Decisions

## 2026-03-20 - Treat production `visian-chat` `502` as a downstream NotebookLM bridge failure first, and recover by refreshing bridge auth state

- Why: the browser showed repeated `502` from `functions/v1/visian-chat`, while the Edge Function code only maps bridge/downstream failures to `502`; missing bridge secrets would have shown up as `500` instead.
- Evidence: Supabase edge-function logs showed `OPTIONS 200` and repeated `POST 502`; EC2 `curl http://127.0.0.1:8080/health` returned `cli_failed` with `Authentication expired or invalid`; replacing `~/notebooklm-bridge/secrets/storage_state.json` with a fresh copy from `C:\Users\Administrator\.notebooklm\storage_state.json` and restarting `docker compose` restored `/health` and a direct POST to `visian-chat`.
- Consequence: when production coach requests start returning `502`, debug the bridge before touching Cloudflare/frontend code. Verify `/live`, then `/health`, refresh `storage_state.json` if auth expired, restart the bridge, and only then retest the Supabase function.

## 2026-03-20 - Keep test files aligned with live component props because `npm run build` typechecks tests too

- Why: Cloudflare Pages runs `npm run build`, and this repo's TypeScript build includes `.test.tsx` files.
- Evidence: `PuzzleCompletionModal.test.tsx` and `PuzzleLockOverlay.test.tsx` still passed a removed `layoutMode` prop and asserted deleted mobile-layout classes, which broke the build even though the runtime components compiled conceptually.
- Consequence: when component props/layout contracts change, update colocated tests in the same pass; stale tests are enough to block production deploys.

## 2026-03-20 - Remove the unused GitHub Supabase deploy workflow and treat Cloudflare as the active app deploy path

- Why: the repo emitted failing GitHub Actions notifications from `.github/workflows/supabase-deploy.yml`, but the team deploys the app through Cloudflare rather than that workflow.
- Evidence: the failing job was a separate Supabase CI runner that was missing required non-interactive migration configuration, while the user explicitly confirmed they do not use GitHub Actions for deployment.
- Consequence: keep `.github/workflows/` empty unless the team intentionally reintroduces CI, and do not treat GitHub Actions emails as part of the normal Cloudflare deploy path.

## 2026-03-19 - Scout arena switching must reuse the shared decode-aware preload helper

- Why: `src/App.tsx` drifted back to an inline arena preload helper that treated `img.complete` as ready immediately, so the first revisit to a scouted arena could still flicker even though `src/utils/arenaBackgroundPreload.ts` already guarded cached images until decode finished.
- Evidence: the first scout revisit flashed only once per arena, then stabilized after cache warm-up; `App.tsx` still had its own preload state while the shared utility and its regression tests handled the cached-image path correctly.
- Consequence: keep arena readiness logic centralized in `src/utils/arenaBackgroundPreload.ts` and import that utility from `App.tsx` instead of re-implementing preload state inline.

## 2026-03-17 - Gameplay HUD CTAs must stay hidden while the in-canvas loading shell is visible

- Why: showing coach or augment CTA on top of the shell makes the app look broken, because the user sees gameplay actions before the puzzle itself exists.
- Evidence: after the shell-first render change, the user caught `Hỏi Coach` leaking into a `Đang tải...` state, which reads like a stale HUD rather than an intentional preload state.
- Consequence: `src/App.tsx` should gate gameplay-only HUD chrome behind puzzle readiness and dismiss any lingering coach session while the shell is showing.

## 2026-03-17 - Scout arena switching should preserve the original arena-scene composition

- Why: fixing scout flicker by restructuring the root arena composition changed the look of the product and exposed a board-floor-only visual that did not match the intended scene.
- Evidence: the app's arena identity depends on the existing `app-container` background composition; changing that composition caused a visible regression even if it reduced some flash risk.
- Consequence: keep the original `app-container` background rendering model, preload the target arena before committing the switch, and keep prefetch lightweight instead of decoding the whole lobby at once.

## 2026-03-17 - Duplicate localhost bootstrap fetches should be deduped with shared promises, not by disabling StrictMode

- Why: `src/main.tsx` intentionally keeps `React.StrictMode` in development, so mount effects can fire twice and make Supabase logs look worse than production.
- Evidence: user logs showed repeated `puzzles`, `traits`, `items`, `champions`, `augments`, plus repeated `auth/user_wallets`; there were also multiple concurrent `useTCoin()` consumers on the first screen.
- Consequence: bootstrap loaders now share in-flight promises (`GameDataContext`, `usePuzzleGame`) and wallet reads are cached in `tcoin.service.ts`, while `StrictMode` stays enabled for dev diagnostics.

## 2026-03-17 - Arena selection assets must separate thumbnail preview from gameplay background

- Why: using the same full-size `.webp` for both selector cards and active board background front-loads all arena images when the selector mounts or backgrounds are preloaded eagerly.
- Evidence: local first-load audit showed arena preload dominating startup image bytes before the change; generated selector thumbnails are now only about `2-4KB` each while full backgrounds remain about `135-236KB`.
- Consequence: `ArenaSkin` now carries both `thumbnailUrl` and `backgroundUrl`; selector UI should use thumbnails and only preload backgrounds on interaction or when an arena becomes active.

## 2026-03-17 - Treat Supabase `OPTIONS + GET` as one logical bootstrap fetch when auditing duplicates

- Why: cross-origin Supabase REST requests in this repo send custom auth headers, so browser devtools/CDP shows a preflight `OPTIONS` immediately before the real `GET`.
- Evidence: post-change cold-load tracing on built `dist/` showed exactly one `GET` per core endpoint, with the apparent "duplicates" coming from matching `OPTIONS` requests to the same URL.
- Consequence: duplicate-fetch audits for bootstrap should key on HTTP method as well as URL; `GET` count is the signal for app logic, not raw URL count alone.

## 2026-03-16 - Keep JSON as the public default, add streaming as an internal latency path

- Why: current app and repo guidance already treat one-shot JSON as the stable contract, but the transport still needs a chunked path for downstream pipelines and future MCP consumers.
- Evidence: `src/features/coach-select/hooks/useCoachSelect.ts` uses `askCoach()` as the real path; `supabase/functions/visian-chat/index.ts` was fake-streaming after waiting for full bridge completion.
- Consequence: `POST /ask` stays the stable bridge API, while streaming is added as an opt-in bridge/edge path.

## 2026-03-16 - Source sharding must be transport-driven, not hardcoded in prompts

- Why: NotebookLM CLI supports `-s/--source`, so the best latency win is to route the query to a narrow source set before the model reads the notebook.
- Evidence: local CLI help shows `notebooklm ask -s src_001 -s src_002 "question"`.
- Consequence: bridge accepts source IDs/groups and resolves them before spawning the CLI; prompt text stays compact instead of carrying source-selection instructions.

## 2026-03-31 - Move Set 17 skill knowledge into official Claude skill directory

- Decision: The Set 17 skill must live under `C:/Users/Administrator/.claude/skills/tft-set17-reference/`, not in the repo temporary folder.
- Why: the repo folder `D:/TFT-hoho/tftset17/` is temporary and will be deleted after migration.
- Evidence: approved design spec at `D:/TFT-hoho/docs/superpowers/specs/2026-03-31-tft-set17-reference-design.md`.
- Consequence: the official skill must bundle all required references and must not depend on the repo folder at runtime.

## 2026-03-31 - Set 17 champion seeding must require a service-role key and preserve the documented stats contract

- Why: `champions` writes are protected by RLS (`supabase/migrations/002_add_rls_to_existing_tables.sql`), so anon-key fallback makes the seed path look valid while failing in normal environments; also the documented Set 17 `champions.stats` JSONB contract expects nested fields (`hp[]`, `ad[]`, `as`, `mr`, `mana.{min,max}`, `dps[]`) rather than the temporary flat compatibility shape.
- Evidence: focused tests now cover the seed helper in `src/utils/set17ChampionSeed.test.ts`, the script requires `SUPABASE_SERVICE_ROLE_KEY` in `src/utils/seedChampions.ts`, and the schema docs/migration comment in `tftset17/supabase-schema.md` plus `supabase/migrations/add_champion_stats.sql` both define the nested stats contract.
- Consequence: do not run real Set 17 champion seeds without `SUPABASE_SERVICE_ROLE_KEY`, and do not treat the current flat generated artifact as the final DB contract; the generator still needs a follow-up pass to emit true nested Set 17 stats before end-to-end seeding is considered complete.

## 2026-03-31 - Runtime Set 17 cleanup must replace live Set 16 game-info surfaces, not just seed data

- Why: the repo already had a working Set 17 parser/generator path, but the app still looked like Set 16 because visible runtime-facing modules were still hardcoded to Set 16 concepts (`SET 16` login hero copy plus the live `gameInfoData.ts` Ionia/Void model used by gameplay and the admin puzzle builder).
- Evidence: focused RED/GREEN tests now cover `src/components/Auth/LoginModal.test.tsx` and `src/data/gameInfoData.test.ts`; the runtime/admin consumers are `src/components/Game/GameScene.tsx` and `src/pages/Admin/PuzzleBuilder/components/GameInfoSelector.tsx`; `npm run build` passes again after the runtime copy swap plus unrelated parser/test cleanup.
- Consequence: future Set migrations must audit live UI modules and gameplay metadata providers, not just DB seeds/artifacts; stale sample files can remain, but any module consumed by `GameScene` or puzzle-builder flows must be updated in the same pass.
