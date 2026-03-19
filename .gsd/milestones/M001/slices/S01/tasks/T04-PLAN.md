---
estimated_steps: 5
estimated_files: 4
---

# T04: Prove the live coach flow end-to-end and lock the slice boundary

**Slice:** S01 — Coach speed and NotebookLM deep-dive handoff
**Milestone:** M001

## Description

Close the slice by proving the live browser → edge → bridge path still works after the speed and handoff changes. This task makes the slice dependable for S04 instead of leaving “it seemed faster locally” as an unrepeatable claim.

## Steps

1. Review the slice must-haves and boundary map outputs from `S01-PLAN.md`.
2. Add or tighten any remaining tests needed for live-path behavior, fallback states, and the external CTA.
3. Run the local stack and verify a real coach request from the browser through the local edge/bridge path.
4. Confirm request IDs, bridge timing/cache data, and failure states remain inspectable after the new changes.
5. Record the exact verification outcome in the task summary when execution reaches this step.

## Must-Haves

- [ ] The slice has repeatable automated checks for the transport path and Coach Select surface.
- [ ] The live browser → edge → bridge request path is exercised after the speed changes.
- [ ] The external NotebookLM handoff remains available in the real Coach Select flow.

## Verification

- `npm run test -- src/features/coach-select/coachSelect.service.test.ts src/features/coach-select/hooks/useCoachSelect.test.tsx src/features/coach-select/components/CoachSelectOverlay.test.tsx src/features/coach-select/components/CoachSelectOverlay.bugfix.test.tsx scripts/local_visian_chat_logging.test.ts && npm run build`
- Run the local stack, open the browser, ask coach from a real puzzle, and confirm the external deep-dive CTA plus transport diagnostics on the real path.

## Observability Impact

- Signals added/changed: final validated request/timing/failure inspection path for the slice.
- How a future agent inspects this: test suite, local stack logs, browser flow, request IDs.
- Failure state exposed: enough diagnostics to tell whether a slow/failing coach request broke in browser code, edge forwarding, or the bridge.

## Inputs

- `S01-PLAN.md` — slice must-haves, verification targets, and boundary contracts.
- T01–T03 outputs — diagnostics, faster request path, and external handoff CTA.
- `scripts/local_visian_chat_server.ts` — local end-to-end verification surface for the live path.

## Expected Output

- `src/features/coach-select/hooks/useCoachSelect.test.tsx` — coverage for the final orchestrated coach flow.
- `src/features/coach-select/components/CoachSelectOverlay.test.tsx` — coverage for real rendered Coach Select states and CTA presence.
- `scripts/local_visian_chat_server.ts` and related logging/tests — a stable verification path for browser → edge → bridge behavior.
