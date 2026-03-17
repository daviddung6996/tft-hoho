# Coach Select Context

## Purpose

Document the overlay flow that lets the user choose a coach and request decision analysis for the current puzzle context.

## Read This When

- You are changing coach selection UI, caching, request orchestration, or coach response rendering.
- You are debugging how puzzle context becomes a coach request.

## Key Entry Points

- `src/features/coach-select/hooks/useCoachSelect.ts`
- `src/features/coach-select/coachSelect.service.ts`
- `src/features/coach-select/coachSelect.types.ts`
- `src/features/coach-select/components/CoachSelectOverlay.tsx`
- `src/features/coach-select/components/CoachResponseCard.tsx`

## Inbound / Outbound Dependencies

- Inbound: `src/App.tsx`, puzzle state, decision type, option sets, and viewport overlay controls.
- Outbound: `src/lib/visianChat.ts`, `supabase/functions/visian-chat/`, and NotebookLM bridge behavior.

## Relevant Skills

- `notebooklm`
- `frontend-design`
- `problem-solving-pro`
- `repo-memory`

## Rules and Invariants

- The primary contract is JSON one-shot coach analysis, even if streaming support exists below it.
- Cache keys must include the live decision context, not just puzzle ID and coach ID.
- Do not fabricate local coach analysis when the backend fails; show an unavailable state instead.
- Treat coach overlay state as a real UI session that can be preserved across minimization when the feature expects it.
- **Prefetch (trick lỏ):** `useCoachSelect` fires a background request (`prefetchCoach`) as soon as a coach is selected or the overlay opens — before the user clicks "Hỏi Coach". The prefetch uses a separate `AbortController` (`prefetchRef`) and stores results in `cachedAnswersRef`. When `askCoach()` is called: (1) cache hit → instant, (2) prefetch still in-flight for same coach+context → adopt the promise and show loading, (3) otherwise → fire fresh request. Switching coach or closing the overlay aborts the prefetch.

## Known Gotchas

- Reusing a response across different decision contexts creates stale and misleading coaching.
- If streaming fails after early status events, the fallback path must still preserve the JSON contract.
- Frontend callers expecting SSE must detect JSON fallback responses instead of assuming the stream is broken.
- **Prefetch and test mocks:** Since `openSelect()` and `selectCoach()` auto-fire `prefetchCoach()`, test mocks for `coachSelectService.askCoach` must have a default resolved value in `beforeEach` (e.g. `mockResolvedValue({ answer: '' })`), otherwise the unhandled prefetch promise can crash the hook during render.

## How to Verify

- `npm run test -- useCoachSelect`
- `rg -n "askCoach|streamCoachExplanation|cache key|decisionType" src/features/coach-select src/lib/visianChat.ts`
- Run the app, open coach select, switch coaches, and confirm context changes do not reuse stale answers.

## Related Contexts

- `../visian-coach/CONTEXT.md`
- `../../../supabase/functions/visian-chat/CONTEXT.md`
- `../../../services/notebooklm_bridge/CONTEXT.md`
- `../../components/Game/CONTEXT.md`
