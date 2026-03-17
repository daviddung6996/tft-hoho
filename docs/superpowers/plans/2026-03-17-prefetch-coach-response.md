# Prefetch Coach Response Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prefetch NotebookLM responses while the user browses the coach carousel, reducing perceived latency from 5-30s to near-zero.

**Architecture:** Add prefetch logic directly into `useCoachSelect` hook (tightly coupled to existing state: `cachedAnswersRef`, `contextSignatureRef`, `gameContext`). This is a spec deviation — the spec proposed a separate `usePrefetchCoach` hook, but inlining avoids extracting shared refs and complex coordination for what is ~40 lines of logic. Extract cache/answer utility functions to `coachSelect.utils.ts` for reuse and testability. The prefetch fires on `selectCoach()` with 500ms debounce, writes **normalized** results into the existing `cachedAnswersRef` cache, and is aborted on `dismissSession()`.

**Tech Stack:** React hooks, AbortController, vitest + @testing-library/react

**Spec:** `docs/superpowers/specs/2026-03-17-prefetch-coach-response-design.md`

---

## Chunk 1: Extract cache utilities

### Task 1: Move utility functions to `coachSelect.utils.ts`

The functions `normalizeCachePart`, `normalizeCoachAnswerText`, `buildCoachContextSignature`, and `buildCoachAnswerCacheKey` are currently module-level functions inside `useCoachSelect.ts` (lines 28-93). Move them to `coachSelect.utils.ts` (which already exists with `deriveCoachCompLabel`) so they can be imported by both the hook and the prefetch logic.

**Critical:** `normalizeCoachAnswerText` (lines 32-57) MUST be extracted — the prefetch writes into `cachedAnswersRef` and must normalize answers the same way `markAnswerCompleted` does, otherwise the UI would display raw `Pick: ...\nGiai thich: ...` format.

**Files:**
- Modify: `src/features/coach-select/coachSelect.utils.ts` (add 4 exported functions)
- Modify: `src/features/coach-select/hooks/useCoachSelect.ts:28-93` (remove functions, add imports)
- Modify: `src/features/coach-select/coachSelect.utils.test.ts` (add tests for extracted functions)

- [ ] **Step 1: Add the 4 functions to `coachSelect.utils.ts`**

Add these exports and the required type import at the top of the file:

```typescript
import type { CoachGameContext, CoachId } from './coachSelect.types';

export function normalizeCachePart(value: unknown): string {
    return typeof value === 'string' ? value.trim() : '';
}

export function normalizeCoachAnswerText(answer: string): string {
    const trimmedAnswer = answer.trim();
    if (!trimmedAnswer) {
        return '';
    }

    const pickMatch = trimmedAnswer.match(/(?:^|\n)\s*Pick:\s*(.+)$/im);
    const reasoningMatch = trimmedAnswer.match(/(?:^|\n)\s*(?:Giai thich|Giải thích|Tai sao):\s*([\s\S]+)$/im);
    const pick = pickMatch?.[1]?.trim() ?? '';
    const reasoning = reasoningMatch?.[1]?.trim()
        ?? trimmedAnswer
            .replace(/(?:^|\n)\s*Pick:\s*.+$/im, '')
            .replace(/(?:^|\n)\s*(?:Giai thich|Giải thích|Tai sao):\s*/im, '')
            .trim();

    if (pick && reasoning) {
        return `${pick}. ${reasoning}`.replace(/\s+/g, ' ').trim();
    }

    return trimmedAnswer
        .replace(/(?:^|\n)\s*Pick:\s*/im, '')
        .replace(/(?:^|\n)\s*(?:Giai thich|Giải thích|Tai sao):\s*/im, '')
        .replace(/\s*\n+\s*/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

export function buildCoachContextSignature(gameContext: CoachGameContext | null): string {
    if (!gameContext) {
        return 'no-context';
    }

    const decisionType = gameContext.decisionType ?? 'augment';
    const optionParts = decisionType === 'augment'
        ? (gameContext.currentAugmentOptions?.length
            ? gameContext.currentAugmentOptions.map(option => normalizeCachePart(option.id) || normalizeCachePart(option.title))
            : gameContext.currentAugments)
        : (gameContext.currentDecisionOptions ?? []).map(option => normalizeCachePart(option.id) || normalizeCachePart(option.title));

    return [
        `stage=${normalizeCachePart(gameContext.stage)}`,
        `decision=${decisionType}`,
        `gold=${gameContext.gold}`,
        `level=${gameContext.level}`,
        `hp=${gameContext.hp}`,
        `comp=${normalizeCachePart(gameContext.comp)}`,
        `options=${optionParts.map(normalizeCachePart).filter(Boolean).join('|')}`,
        `chosen=${gameContext.chosenAugments.map(normalizeCachePart).filter(Boolean).join('|')}`,
    ].join('::');
}

export function buildCoachAnswerCacheKey(
    puzzleId: string | null,
    coachId: CoachId,
    contextSignature: string,
): string | null {
    if (!puzzleId) {
        return null;
    }

    return `${puzzleId}:${coachId}:${contextSignature}`;
}
```

- [ ] **Step 2: Update `useCoachSelect.ts` — remove functions, add imports**

Remove lines 28-93 (the 4 functions: `normalizeCachePart`, `normalizeCoachAnswerText`, `buildCoachContextSignature`, `buildCoachAnswerCacheKey`) from `useCoachSelect.ts`. Keep `createEmptyAnswerState` (lines 20-26) — it is only used locally in the hook.

Add this import:

```typescript
import {
    buildCoachAnswerCacheKey,
    buildCoachContextSignature,
    normalizeCoachAnswerText,
} from '../coachSelect.utils';
```

Note: `normalizeCachePart` is NOT imported — it is only used internally by `buildCoachContextSignature`. `normalizeCoachAnswerText` IS imported because `markAnswerCompleted` in the hook calls it directly.

- [ ] **Step 3: Add tests for extracted functions**

Add to `coachSelect.utils.test.ts`:

```typescript
import { buildCoachAnswerCacheKey, buildCoachContextSignature } from './coachSelect.utils';
import type { CoachGameContext } from './coachSelect.types';

const baseContext: CoachGameContext = {
    stage: '3-2',
    comp: 'Faerie / Mage',
    gold: 24,
    level: 6,
    hp: 72,
    decisionType: 'augment',
    currentAugments: ['Featherweights III'],
    currentAugmentOptions: [
        { id: 'featherweights-3', title: 'Featherweights III', icon: '/fw.png', tier: 2 as const },
    ],
    chosenAugments: ['Starter Kit'],
    synergies: ['Faerie', 'Mage'],
    boardChampions: ['Lux'],
    items: ['Jeweled Gauntlet'],
};

describe('buildCoachContextSignature', () => {
    it('returns no-context for null', () => {
        expect(buildCoachContextSignature(null)).toBe('no-context');
    });

    it('produces a deterministic signature from game context', () => {
        const sig1 = buildCoachContextSignature(baseContext);
        const sig2 = buildCoachContextSignature({ ...baseContext });
        expect(sig1).toBe(sig2);
    });

    it('changes when gold changes', () => {
        const sig1 = buildCoachContextSignature(baseContext);
        const sig2 = buildCoachContextSignature({ ...baseContext, gold: 30 });
        expect(sig1).not.toBe(sig2);
    });
});

describe('buildCoachAnswerCacheKey', () => {
    it('returns null when puzzleId is null', () => {
        expect(buildCoachAnswerCacheKey(null, 'visian', 'sig')).toBeNull();
    });

    it('builds key from puzzleId, coachId, and signature', () => {
        expect(buildCoachAnswerCacheKey('p1', 'visian', 'sig')).toBe('p1:visian:sig');
    });
});
```

- [ ] **Step 4: Run tests**

Run: `npx vitest run src/features/coach-select/coachSelect.utils.test.ts src/features/coach-select/hooks/useCoachSelect.test.tsx`

Expected: ALL PASS — existing behavior unchanged, new util tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/features/coach-select/coachSelect.utils.ts src/features/coach-select/coachSelect.utils.test.ts src/features/coach-select/hooks/useCoachSelect.ts
git commit -m "refactor: extract cache utility functions to coachSelect.utils.ts"
```

---

## Chunk 2: Add prefetch logic to `useCoachSelect`

### Task 2: Add prefetch refs and `triggerPrefetch` function

**Files:**
- Modify: `src/features/coach-select/hooks/useCoachSelect.ts`

- [ ] **Step 1: Add prefetch refs after existing refs (~line 108 area)**

Add these refs after `cachedAnswersRef`:

```typescript
// ── Prefetch state ──
const prefetchAbortRef = useRef<AbortController | null>(null);
const prefetchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
const prefetchCoachIdRef = useRef<CoachId | null>(null);
const prefetchPromiseRef = useRef<Promise<CoachAskResponse | null> | null>(null);
const prefetchSignatureRef = useRef<string | null>(null);
```

Add `CoachAskResponse` to the existing type import from `../coachSelect.types`.

- [ ] **Step 2: Add `abortPrefetch` helper function**

Add after the existing `abortInflight` function:

```typescript
const abortPrefetch = useCallback(() => {
    if (prefetchTimerRef.current) {
        clearTimeout(prefetchTimerRef.current);
        prefetchTimerRef.current = null;
    }
    if (prefetchAbortRef.current) {
        prefetchAbortRef.current.abort();
        prefetchAbortRef.current = null;
    }
    prefetchCoachIdRef.current = null;
    prefetchPromiseRef.current = null;
    prefetchSignatureRef.current = null;
}, []);
```

- [ ] **Step 3: Add `triggerPrefetch` function**

Add after `abortPrefetch`:

```typescript
const triggerPrefetch = useCallback((coachId: CoachId) => {
    // Clear any pending debounce timer
    if (prefetchTimerRef.current) {
        clearTimeout(prefetchTimerRef.current);
    }

    prefetchTimerRef.current = setTimeout(() => {
        prefetchTimerRef.current = null;

        // Abort previous in-flight prefetch
        if (prefetchAbortRef.current) {
            prefetchAbortRef.current.abort();
        }

        const signature = contextSignatureRef.current;
        const controller = new AbortController();

        prefetchAbortRef.current = controller;
        prefetchCoachIdRef.current = coachId;
        prefetchSignatureRef.current = signature;

        const promise = coachSelectService.askCoach(
            coachId,
            getCoachQuestionForDecisionType(gameContext?.decisionType),
            gameContext,
            controller.signal,
        ).then(response => {
            // Normalize answer the same way markAnswerCompleted does
            const normalizedAnswer = normalizeCoachAnswerText(response.answer);
            // Write into existing cache for transparent integration
            const cacheKey = buildCoachAnswerCacheKey(puzzleId, coachId, signature);
            if (cacheKey && !controller.signal.aborted) {
                cachedAnswersRef.current.set(cacheKey, {
                    answer: normalizedAnswer,
                    isLoading: false,
                    isComplete: true,
                });
            }
            return response;
        }).catch(() => {
            // Silently ignore prefetch errors — askCoach will send fresh request
            return null;
        });

        prefetchPromiseRef.current = promise;
    }, 500);
}, [gameContext, puzzleId]);
```

- [ ] **Step 4: Run existing tests to verify no breakage**

Run: `npx vitest run src/features/coach-select/hooks/useCoachSelect.test.tsx`

Expected: ALL PASS — prefetch logic is added but not wired up yet.

- [ ] **Step 5: Commit**

```bash
git add src/features/coach-select/hooks/useCoachSelect.ts
git commit -m "feat: add prefetch refs and triggerPrefetch function to useCoachSelect"
```

---

### Task 3: Wire prefetch into `selectCoach`, `askCoach`, `dismissSession`, and cleanup

**Files:**
- Modify: `src/features/coach-select/hooks/useCoachSelect.ts`

- [ ] **Step 1: Wire `selectCoach` to trigger prefetch**

In `selectCoach` callback (~line 243), add `triggerPrefetch(coachId)` call after the `startTransition` block:

```typescript
const selectCoach = useCallback((coachId: CoachId) => {
    if (coachId === selectedCoachIdRef.current) return;

    abortInflight();
    startTransition(() => {
        interactionVersionRef.current += 1;
        setSelectedCoachId(coachId);
        resetAnswerState();
        setError(null);
        setHasUnreadResult(false);

        if (uiStateRef.current !== 'closed') {
            setUiState('select');
            setIsOverlayVisible(true);
            setIsMinimizedForBoard(false);
        }
    });

    // Prefetch response for newly selected coach
    triggerPrefetch(coachId);
}, [abortInflight, resetAnswerState, triggerPrefetch]);
```

- [ ] **Step 2: Wire `dismissSession` to abort prefetch**

In `dismissSession` callback (~line 164), add `abortPrefetch()` call:

```typescript
const dismissSession = useCallback(() => {
    abortInflight();
    abortPrefetch();
    interactionVersionRef.current += 1;
    setSelectedCoachId(DEFAULT_COACH_ID);
    resetAnswerState();
    setError(null);
    setUiState('closed');
    setIsOverlayVisible(false);
    setIsMinimizedForBoard(false);
    setHasUnreadResult(false);
}, [abortInflight, abortPrefetch, resetAnswerState]);
```

- [ ] **Step 3: Wire `askCoach` to consume prefetch**

The existing `askCoach` already checks `cachedAnswersRef` (lines 296-305). Since `triggerPrefetch` writes successful responses into `cachedAnswersRef`, the cache-hit path works transparently — **no changes needed to `askCoach`**.

However, we need to handle the case where prefetch is still in-flight (pending). Add this logic before the `abortInflight()` call in `askCoach` (~line 308):

```typescript
// If prefetch is in-flight for this coach+context, await it instead of sending a new request
if (
    prefetchCoachIdRef.current === requestCoachId
    && prefetchSignatureRef.current === requestContextSignature
    && prefetchPromiseRef.current
) {
    const prefetchResult = await prefetchPromiseRef.current;
    // Re-check staleness after await
    if (isStaleRequest()) return;
    // Check if prefetch succeeded and wrote to cache
    const reCachedAnswer = cacheKey ? cachedAnswersRef.current.get(cacheKey) : null;
    if (reCachedAnswer) {
        setError(null);
        setHasUnreadResult(false);
        setAnswerState({
            ...reCachedAnswer,
            isLoading: false,
            isComplete: true,
        });
        setUiState('response');
        return;
    }
    // Prefetch failed — fall through to send fresh request
}
```

Insert this block **after** the existing `cachedAnswer` check (line ~305) and **before** `abortInflight()` (line ~308).

- [ ] **Step 4: Wire `openSelect` to trigger initial prefetch**

In `openSelect` callback (~line 213), add prefetch for the initial/default coach:

```typescript
const openSelect = useCallback((coachId: CoachId = DEFAULT_COACH_ID) => {
    interactionVersionRef.current += 1;
    setSelectedCoachId(coachId);
    resetAnswerState();
    setError(null);
    setUiState('select');
    setIsOverlayVisible(true);
    setIsMinimizedForBoard(false);
    setHasUnreadResult(false);

    // Prefetch for the initial coach
    triggerPrefetch(coachId);
}, [resetAnswerState, triggerPrefetch]);
```

- [ ] **Step 5: Add cleanup on unmount**

Add a useEffect for cleanup:

```typescript
useEffect(() => {
    return () => {
        abortPrefetch();
    };
}, [abortPrefetch]);
```

- [ ] **Step 6: Run existing tests**

Run: `npx vitest run src/features/coach-select/hooks/useCoachSelect.test.tsx`

Expected: ALL PASS — existing behavior preserved. The prefetch fires in background but doesn't affect the existing flow.

- [ ] **Step 7: Commit**

```bash
git add src/features/coach-select/hooks/useCoachSelect.ts
git commit -m "feat: wire prefetch into selectCoach, askCoach, dismissSession, openSelect"
```

---

## Chunk 3: Tests

### Task 4: Add prefetch-specific tests

**Files:**
- Modify: `src/features/coach-select/hooks/useCoachSelect.test.tsx`

- [ ] **Step 1: Add prefetch tests in a separate describe block**

Add a **nested** `describe('prefetch', ...)` block inside the existing `describe('useCoachSelect')`, with its own `beforeEach`/`afterEach` for fake timers. This avoids affecting existing tests that rely on real timer behavior.

```typescript
describe('prefetch', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('prefetches on openSelect and uses cached result on askCoach', async () => {
    askCoachMock.mockResolvedValue({
        answer: 'Pick: Featherweights III\nGiai thich: Prefetched answer.',
    });

    const { result } = renderHook(() => useCoachSelect(gameContext, 'puzzle-1'));

    act(() => {
        result.current.openSelect();
    });

    // Wait for debounce (500ms) + async resolution
    await act(async () => {
        await vi.advanceTimersByTimeAsync(600);
    });

    // askCoach should have been called once (by prefetch)
    expect(askCoachMock).toHaveBeenCalledTimes(1);

    // Now user confirms — should use cached result, no second call
    await act(async () => {
        await result.current.askCoach();
    });

    expect(askCoachMock).toHaveBeenCalledTimes(1);
    expect(result.current.answer).toBe('Featherweights III. Prefetched answer.');
    expect(result.current.uiState).toBe('response');
});

it('aborts prefetch when overlay is dismissed', async () => {
    let resolveAsk: ((value: { answer: string }) => void) | null = null;
    askCoachMock.mockImplementation(() => new Promise(resolve => {
        resolveAsk = resolve;
    }));

    const { result } = renderHook(() => useCoachSelect(gameContext, 'puzzle-1'));

    act(() => {
        result.current.openSelect();
    });

    // Wait for debounce to fire
    await act(async () => {
        await vi.advanceTimersByTimeAsync(600);
    });

    // Dismiss overlay — should abort prefetch
    act(() => {
        result.current.dismissSession();
    });

    // Resolve the aborted request — should not affect state
    await act(async () => {
        resolveAsk?.({ answer: 'Should be ignored.' });
    });

    expect(result.current.uiState).toBe('closed');
    expect(result.current.answer).toBe('');
});

it('debounces rapid coach switches and only prefetches the last one', async () => {
    askCoachMock.mockResolvedValue({ answer: 'Pick: answer\nOK' });

    const { result } = renderHook(() => useCoachSelect(gameContext, 'puzzle-1'));

    act(() => {
        result.current.openSelect();
    });

    // Rapidly switch coaches — each within 500ms
    act(() => { result.current.selectCoach('dit_sap'); });
    await act(async () => { await vi.advanceTimersByTimeAsync(200); });
    act(() => { result.current.selectCoach('buffalow'); });
    await act(async () => { await vi.advanceTimersByTimeAsync(200); });
    act(() => { result.current.selectCoach('tftiseasy'); });

    // Wait for debounce to fire
    await act(async () => { await vi.advanceTimersByTimeAsync(600); });

    // Only one prefetch call should have been made (for 'tftiseasy')
    // openSelect fires one for default coach, but it gets debounce-cancelled by selectCoach calls
    expect(askCoachMock).toHaveBeenCalledTimes(1);
    expect(askCoachMock.mock.calls[0][0]).toBe('tftiseasy');
});

    it('does not abort prefetch when minimizing to board', async () => {
        askCoachMock.mockResolvedValue({
            answer: 'Pick: Featherweights III\nGiai thich: Still valid.',
        });

        const { result } = renderHook(() => useCoachSelect(gameContext, 'puzzle-1'));

        act(() => {
            result.current.openSelect();
        });

        // Wait for debounce to fire
        await act(async () => {
            await vi.advanceTimersByTimeAsync(600);
        });

        // Minimize to board — should NOT abort prefetch
        act(() => {
            result.current.minimizeToBoard();
        });

        // Re-open overlay and confirm — prefetch result should be available
        act(() => {
            result.current.reopenOverlay();
        });

        await act(async () => {
            await result.current.askCoach();
        });

        // Should use prefetched result, no second call
        expect(askCoachMock).toHaveBeenCalledTimes(1);
        expect(result.current.answer).toBe('Featherweights III. Still valid.');
    });
}); // end describe('prefetch')
```

- [ ] **Step 2: Verify existing tests still pass**

The fake timers are scoped to the nested `describe('prefetch')` block, so existing tests should be unaffected. However, existing tests now trigger `openSelect()` which queues a 500ms prefetch timer. Since the outer `beforeEach` only does `askCoachMock.mockReset()` (no fake timers), these timers fire asynchronously after the test ends. Verify no interference by running all tests together.

- [ ] **Step 3: Run all tests**

Run: `npx vitest run src/features/coach-select/`

Expected: ALL PASS.

- [ ] **Step 4: Commit**

```bash
git add src/features/coach-select/hooks/useCoachSelect.test.tsx
git commit -m "test: add prefetch coach response tests"
```

---

## Chunk 4: Verify and polish

### Task 5: End-to-end verification

- [ ] **Step 1: Run full test suite**

Run: `npx vitest run`

Expected: ALL PASS.

- [ ] **Step 2: Run type check**

Run: `npx tsc --noEmit`

Expected: No type errors.

- [ ] **Step 3: Manual smoke test**

1. `npm run dev`
2. Open app, start a game/puzzle
3. Click "Hỏi Coach" — carousel opens
4. Observe Network tab: after 500ms, a request fires to `/visian-chat`
5. Click a different coach — previous request is cancelled (red in Network tab), new request fires after 500ms
6. Click "Hỏi [Coach]" button — if prefetch completed, response appears instantly
7. Click X to close overlay — any pending request is cancelled
8. Re-open overlay — fresh prefetch cycle starts

- [ ] **Step 4: Final commit if any polish needed**

```bash
git add -u
git commit -m "fix: polish prefetch coach response implementation"
```
