# Prefetch Coach Response — Design Spec

## Problem

When a user selects a coach and confirms, the NotebookLM API call takes 5-30s. The user stares at a loading state the entire time. Most of this wait is avoidable because the user spends several seconds browsing the coach carousel before confirming.

## Solution

Prefetch the NotebookLM response while the user is browsing the carousel. When they confirm a coach, use the cached response if available — reducing perceived latency to near-zero.

## Flow

```
Click "Hỏi Coach" → Carousel opens
    ↓
User pauses on coach X ≥500ms → prefetch(coachX, contextSnapshot)
    ↓
User swipes to coach Y → debounce resets → pauses ≥500ms → prefetch(coachY, contextSnapshot)
    ↓
User confirms coach Y:
    ├→ prefetch Y done + context matches → use cached response (instant)
    ├→ prefetch Y running + context matches → await existing request
    └→ context changed OR no prefetch → send new request as normal

User clicks X to close overlay → AbortController.abort() all pending requests
```

## Components

### 1. `usePrefetchCoach` hook

New hook managing all prefetch state and lifecycle.

**State:**
```typescript
type PrefetchEntry = {
  coachId: string;
  response: CoachResponse | null;
  contextSnapshot: CoachGameContext;
  abortController: AbortController;
  status: 'pending' | 'done' | 'error' | 'aborted';
};

// Map<coachId, PrefetchEntry>
```

**API:**
- `prefetch(coachId: string)` — debounced 500ms. Captures current `coachGameContext` snapshot, creates AbortController, calls `askCoach()`. Stores result in map keyed by coachId.
- `getPrefetchedResponse(coachId: string, currentContext: CoachGameContext): PrefetchResult` — looks up cache entry for coachId. If found, shallow-compares stored contextSnapshot against currentContext. Returns `{ hit: true, response }` if match, `{ hit: false }` if mismatch or missing.
- `abortAll()` — iterates all entries, calls `abort()` on each AbortController. Clears the map.
- Cleanup on unmount — calls `abortAll()`.

### 2. Context snapshot & comparison

- At prefetch time: deep-copy `coachGameContext` as snapshot
- At confirm time: shallow compare snapshot fields against current context
- Fields to compare: `stage`, `comp`, `gold`, `level`, `hp`, `decisionType`, `currentAugmentOptions`, `chosenAugments`, `synergies`, `boardChampions`, `items`
- If any field differs → discard cached response, send fresh request

### 3. Integration into `useCoachSelect`

- **Carousel `onSlideChange`**: trigger `prefetch(highlightedCoachId)` on each slide change (debounce handles rapid swiping)
- **`askCoach()` modification**: before sending a new request, call `getPrefetchedResponse(coachId, currentContext)`. If hit → use cached response. If pending → await existing promise. If miss → send new request.
- **`close()` / click X**: call `abortAll()` to cancel all in-flight prefetch requests
- **Initial slide**: trigger prefetch for the first visible coach when carousel opens (after 500ms debounce)

## What does NOT change

- **Backend**: No changes to Supabase Edge Function, NotebookLM Bridge, or Python service
- **UI/UX**: User sees no indication of prefetch. Same carousel, same flow. Only difference is faster response.
- **`askCoach()` service function**: Interface stays the same. Only the hook-level caller adds cache-check logic before calling it.
- **Coach data/selection logic**: No changes to coach carousel, coach data, or selection mechanics.

## Edge cases

| Scenario | Behavior |
|----------|----------|
| User confirms before debounce fires (< 500ms) | No prefetch exists → normal request |
| User swipes rapidly through all 5 coaches | Debounce prevents any request until user pauses ≥500ms |
| Network error on prefetch | Silently ignored; confirm triggers fresh request |
| Prefetch aborted (user closed overlay) | AbortController signal cancels fetch; no response stored |
| Game context changes while overlay is open | Detected at confirm time via snapshot comparison; fresh request sent |
| User re-opens overlay after closing | Fresh prefetch cycle starts; previous cache was cleared by abortAll |

## Risk assessment

- **Resource usage**: At most 1 in-flight prefetch at a time (debounce ensures this). Bridge-side deduplication handles any overlap.
- **Correctness**: Context snapshot comparison guarantees response matches current game state.
- **Failure mode**: If prefetch fails for any reason, falls back to existing behavior (send request on confirm). No degradation.
