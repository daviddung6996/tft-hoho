---
estimated_steps: 5
estimated_files: 4
---

# T01: Baseline and expose coach transport diagnostics

**Slice:** S01 — Coach speed and NotebookLM deep-dive handoff
**Milestone:** M001

## Description

Instrument the existing browser → `visian-chat` → NotebookLM bridge path so slow or failed coach requests can be localized quickly. This task should not change the product promise yet; it should make the current path inspectable enough that later speed work can prove where the delay is coming from.

## Steps

1. Review the current request/response surfaces in `coachSelect.service.ts`, `src/lib/visianChat.ts`, and `supabase/functions/visian-chat/index.ts`.
2. Preserve or expose a request correlation ID and transport timing/cache metadata end-to-end where the browser or local adapter can inspect it.
3. Improve structured logging for slow and failed coach requests without leaking secrets or noisy payloads.
4. Update focused tests around transport diagnostics or logging behavior.
5. Confirm the local adapter/browser path shows enough information to diagnose a slow request.

## Must-Haves

- [ ] Slow or failed coach requests expose request correlation plus timing/cache context that a future agent can inspect.
- [ ] Transport diagnostics do not leak secrets, notebook credentials, or auth keys.
- [ ] Focused automated tests cover the new diagnostics or logging behavior.

## Verification

- `npm run test -- src/features/coach-select/coachSelect.service.test.ts scripts/local_visian_chat_logging.test.ts`
- Run the local coach path and confirm request ID plus timing/cache context is visible in logs or browser inspection surfaces.

## Observability Impact

- Signals added/changed: request IDs, client elapsed time, bridge cache/timing fields, structured slow/failure logs.
- How a future agent inspects this: browser console/network, local visian-chat logs, edge/bridge logs.
- Failure state exposed: transport-level error detail and correlated request ID for slow/failed coach requests.

## Inputs

- `src/features/coach-select/coachSelect.service.ts` — current browser-side coach request handling and slow-response warnings.
- `src/lib/visianChat.ts` — shared request URL and headers for the edge function.
- `supabase/functions/visian-chat/index.ts` — current request forwarding, bridge timing headers, and error handling.
- `scripts/local_visian_chat_logging.ts` — existing logging helper used by the local adapter.

## Expected Output

- `src/features/coach-select/coachSelect.service.ts` — improved request diagnostics and inspection hooks.
- `supabase/functions/visian-chat/index.ts` — preserved or exposed transport timing/request metadata.
- `scripts/local_visian_chat_logging.ts` — structured logging that reflects the new diagnostic contract.
