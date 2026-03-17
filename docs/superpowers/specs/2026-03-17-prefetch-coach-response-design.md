# Prefetch Coach Response — Design Spec

## Problem

When a user selects a coach and confirms, the NotebookLM API call takes 5-30s. The user stares at a loading state the entire time. Most of this wait is avoidable because the user spends several seconds browsing the coach carousel before confirming.

## Solution

Prefetch the NotebookLM response while the user is browsing the carousel. When they confirm a coach, use the cached response if available — reducing perceived latency to near-zero.

## Flow

```
Click "Hỏi Coach" → Carousel opens (click-to-select grid)
    ↓
User clicks coach X → prefetch(coachX) fires immediately
    ↓
User clicks coach Y within 500ms → debounce resets → prefetch(coachY) fires
(previous coach X prefetch is aborted)
    ↓
User confirms coach Y:
    ├→ prefetch Y done + contextSignature matches → use cached response (instant)
    ├→ prefetch Y running + contextSignature matches → await existing request
    └→ contextSignature changed OR no prefetch → send new request as normal

User dismisses overlay (dismissSession) → AbortController.abort() all pending requests
```

## Components

### 1. `usePrefetchCoach` hook

New hook managing prefetch state and lifecycle. Only one prefetch is in-flight at a time — selecting a new coach aborts the previous one.

**State:**
```typescript
import type { CoachId, CoachAskResponse } from '../coachSelect.types';

type PrefetchEntry = {
  coachId: CoachId;
  response: CoachAskResponse | null;
  contextSignature: string;          // from buildCoachContextSignature()
  abortController: AbortController;
  promise: Promise<CoachAskResponse>; // to await if still pending
  status: 'pending' | 'done' | 'error' | 'aborted';
};

// Single active prefetch entry (not a Map — only 1 in-flight at a time)
```

**API:**
- `prefetch(coachId: CoachId)` — debounced 500ms. Aborts any existing in-flight prefetch. Captures current `contextSignature` via `buildCoachContextSignature()`, creates AbortController, calls `askCoach()` with its signal. Stores result as active entry.
- `consumePrefetch(coachId: CoachId, currentSignature: string): PrefetchResult` — checks if active entry matches coachId AND contextSignature. Returns `{ hit: true, response }` if done+match, `{ hit: 'pending', promise }` if still running+match, `{ hit: false }` otherwise.
- `abortAll()` — aborts active prefetch if any. Clears entry.
- Cleanup on unmount — calls `abortAll()`.

**Design dependency:** `coachSelectService.askCoach()` already accepts an `AbortSignal` parameter, which makes prefetch cancellation possible without any service-level changes.

### 2. Context validation via `buildCoachContextSignature()`

Reuses the existing `buildCoachContextSignature()` function (already in `useCoachSelect`) as the single source of truth for context comparison:

- At prefetch time: capture `buildCoachContextSignature(coachGameContext)` as string
- At confirm time: compare stored signature against `buildCoachContextSignature(currentContext)`
- If strings differ → discard cached response, send fresh request

This avoids maintaining a separate field-comparison list and stays consistent with the existing cache-key logic used elsewhere in the hook.

### 3. Integration into `useCoachSelect`

- **Coach selection (`selectCoach`)**: when user clicks a coach in the carousel, trigger `prefetch(coachId)`. Debounce handles rapid clicking.
- **`askCoach()` modification**: before sending a new request, call `consumePrefetch(coachId, currentSignature)`. If `hit: true` → write response into existing `cachedAnswersRef` and use it. If `hit: 'pending'` → await the existing promise. If `hit: false` → send new request as normal.
- **`cachedAnswersRef` integration**: successful prefetch writes into the existing `cachedAnswersRef` Map (keyed by `buildCoachAnswerCacheKey`), so the existing cache-hit path in `askCoach()` works transparently.
- **`dismissSession()`**: call `abortAll()` to cancel any in-flight prefetch.
- **Initial coach**: trigger prefetch for the initially selected/default coach when carousel opens (after 500ms debounce).

## What does NOT change

- **Backend**: No changes to Supabase Edge Function, NotebookLM Bridge, or Python service
- **UI/UX**: User sees no indication of prefetch. Same carousel, same flow. Only difference is faster response.
- **`askCoach()` service function**: Interface stays the same. Only the hook-level caller adds prefetch-check logic before calling it.
- **Coach data/selection logic**: No changes to coach carousel, coach data, or selection mechanics.

## Edge cases

| Scenario | Behavior |
|----------|----------|
| User confirms before debounce fires (< 500ms) | No prefetch exists → normal request |
| User clicks rapidly through all 5 coaches | Debounce prevents any request until user stops for ≥500ms. Each new click aborts previous prefetch. |
| Network error on prefetch | Silently stored as `error` status; confirm triggers fresh request |
| Prefetch aborted (user dismissed overlay) | AbortController signal cancels fetch; entry cleared |
| Game context changes while overlay is open | Detected at confirm time via contextSignature comparison; fresh request sent |
| User re-opens overlay after dismissing | Fresh prefetch cycle starts; previous entry was cleared by abortAll |
| `onObserveBoard` (minimize to board) | Does NOT abort prefetch — user may return to overlay. Only `dismissSession` aborts. |

## Risk assessment

- **Resource usage**: At most 1 in-flight prefetch at a time. Previous prefetch is aborted when user selects a different coach. Bridge-side deduplication handles any edge overlap.
- **Correctness**: `buildCoachContextSignature()` comparison guarantees response matches current game state. Prefetch writes into existing `cachedAnswersRef` for transparent integration.
- **Failure mode**: If prefetch fails for any reason, falls back to existing behavior (send request on confirm). No degradation.
