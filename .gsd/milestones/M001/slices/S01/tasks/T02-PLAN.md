---
estimated_steps: 6
estimated_files: 4
---

# T02: Make the Coach Select response path feel faster

**Slice:** S01 — Coach speed and NotebookLM deep-dive handoff
**Milestone:** M001

## Description

Change the in-app Coach Select experience so it feels materially faster to the user while keeping the curated two-line coach answer contract intact. This is the task that should make the user stop feeling that the app is slower than raw NotebookLM.

## Steps

1. Compare the current `askCoach` path with the existing stream-capable transport and decide the fastest-feeling path that still preserves the current coach contract.
2. Wire that path into `useCoachSelect` so the overlay provides visible progress quickly instead of waiting for a silent full response.
3. Preserve prefetch, cache hits, stale-request protection, and minimize/reopen session behavior.
4. Keep JSON fallback and unavailable-state behavior correct when the live transport does not stream cleanly.
5. Update the response/loading UI so it reflects the new faster-feeling path without becoming noisy.
6. Extend hook/service/overlay tests to cover the new request path and state transitions.

## Must-Haves

- [ ] Coach Select gives the user visible progress quickly and still resolves to the existing curated answer contract.
- [ ] Cache hits, coach switching, minimize/reopen, aborts, and stale requests remain correct.
- [ ] Fallback and unavailable states still work when the live transport fails or returns non-stream JSON.

## Verification

- `npm run test -- src/features/coach-select/coachSelect.service.test.ts src/features/coach-select/hooks/useCoachSelect.test.tsx src/features/coach-select/components/CoachSelectOverlay.test.tsx src/features/coach-select/components/CoachSelectOverlay.bugfix.test.tsx`
- In the browser, open Coach Select on a real puzzle, ask coach through the live path, and confirm the loading/response experience feels faster and still completes correctly.

## Observability Impact

- Signals added/changed: faster-path state transitions, loading progress events, fallback-path diagnostics.
- How a future agent inspects this: Coach Select UI state, browser logs, service-level tests.
- Failure state exposed: explicit unavailable/fallback state instead of silent stalls.

## Inputs

- `src/features/coach-select/hooks/useCoachSelect.ts` — current coach session lifecycle and prefetch logic.
- `src/features/coach-select/coachSelect.service.ts` — current JSON and stream-capable transport helpers.
- `src/features/coach-select/components/CoachSelectOverlay.tsx` — current loading and response shell.
- T01 diagnostics output — transport visibility needed to judge the chosen faster-feeling path.

## Expected Output

- `src/features/coach-select/hooks/useCoachSelect.ts` — updated live request orchestration for the faster-feeling coach path.
- `src/features/coach-select/coachSelect.service.ts` — client transport handling that supports the chosen UX path cleanly.
- `src/features/coach-select/components/CoachSelectOverlay.tsx` — loading/response UX aligned with the faster path.
