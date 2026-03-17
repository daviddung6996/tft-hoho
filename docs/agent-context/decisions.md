# Decisions

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
