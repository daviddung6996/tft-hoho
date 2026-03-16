# Decisions

## 2026-03-16 - Keep JSON as the public default, add streaming as an internal latency path

- Why: current app and repo guidance already treat one-shot JSON as the stable contract, but the transport still needs a chunked path for downstream pipelines and future MCP consumers.
- Evidence: `src/features/coach-select/hooks/useCoachSelect.ts` uses `askCoach()` as the real path; `supabase/functions/visian-chat/index.ts` was fake-streaming after waiting for full bridge completion.
- Consequence: `POST /ask` stays the stable bridge API, while streaming is added as an opt-in bridge/edge path.

## 2026-03-16 - Source sharding must be transport-driven, not hardcoded in prompts

- Why: NotebookLM CLI supports `-s/--source`, so the best latency win is to route the query to a narrow source set before the model reads the notebook.
- Evidence: local CLI help shows `notebooklm ask -s src_001 -s src_002 "question"`.
- Consequence: bridge accepts source IDs/groups and resolves them before spawning the CLI; prompt text stays compact instead of carrying source-selection instructions.
