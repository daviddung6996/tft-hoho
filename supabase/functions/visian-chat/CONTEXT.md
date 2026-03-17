# Visian Chat Edge Function Context

## Purpose

Document the `visian-chat` Supabase Edge Function that adapts frontend coach requests to the hosted NotebookLM bridge.

## Read This When

- You are changing `supabase/functions/visian-chat/*`.
- You are debugging coach transport, request IDs, or bridge integration.
- You need the real prompt and response contract for coach analysis.

## Key Entry Points

- `supabase/functions/visian-chat/index.ts`
- `supabase/functions/visian-chat/prompt.ts`
- `supabase/functions/visian-chat/answer.ts`
- `supabase/functions/visian-chat/prompt.test.ts`

## Inbound / Outbound Dependencies

- Inbound: `src/features/coach-select/*`, `src/features/visian-coach/*`, and local adapter scripts.
- Outbound: `services/notebooklm_bridge/`, bridge env vars, and Supabase Edge runtime behavior.

## Relevant Skills

- `notebooklm`
- `problem-solving-pro`
- `repo-memory`

## Rules and Invariants

- Keep this function as a thin adapter to the hosted bridge.
- Preserve `x-request-id` across the frontend, local adapter, edge function, and bridge when tracing requests.
- Strip NotebookLM citations before surfacing answers to the UI.
- Coach prompts should stay fully accented Vietnamese end-to-end.
- If the backend fails or returns empty output, do not fabricate a plausible local answer.

## Known Gotchas

- Browser-side CORS errors can mask missing bridge secrets or real downstream 500s.
- Streaming mode may still need to handle JSON fallback responses if the backend path is not serving SSE.
- A local tunnel or workstation proxy is not a durable replacement for the hosted bridge contract.

## How to Verify

- `rg -n "NOTEBOOKLM_BRIDGE|x-request-id|stripNotebookLmCitations|coach_select" supabase/functions/visian-chat src/features/coach-select src/features/visian-coach`
- Run the function locally or via the adapter and confirm both success and failure paths preserve the real backend response contract.

## Related Contexts

- `../../../services/notebooklm_bridge/CONTEXT.md`
- `../../../scripts/CONTEXT.md`
- `../../../src/features/coach-select/CONTEXT.md`
- `../../../src/features/visian-coach/CONTEXT.md`
