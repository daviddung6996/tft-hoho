# GameData Stale-While-Revalidate Cache

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate blocking network requests on repeat app loads by caching game data (traits, items, champions, augments) in sessionStorage with stale-while-revalidate pattern.

**Architecture:** A thin cache utility reads/writes JSON to sessionStorage keyed per table. GameDataContext reads cache synchronously on mount — if cache exists, state is set instantly and `isLoading` becomes `false` immediately. Background revalidation always runs; if fresh data differs from cache, state updates silently.

**Tech Stack:** React Context, sessionStorage, TypeScript

---

## File Structure

| Action | File | Responsibility |
|--------|------|----------------|
| Create | `src/utils/gameDataCache.ts` | Generic sessionStorage read/write with JSON serialization |
| Modify | `src/contexts/GameDataContext.tsx` | Use cache for instant hydration, background revalidation |

---

## Chunk 1: Cache Utility + Context Integration

### Task 1: Create gameDataCache utility

**Files:**
- Create: `src/utils/gameDataCache.ts`

- [ ] **Step 1: Create the cache utility**

```ts
// src/utils/gameDataCache.ts

const CACHE_PREFIX = 'tft_cache_';

export function readCache<T>(key: string): T[] | null {
    try {
        const raw = sessionStorage.getItem(CACHE_PREFIX + key);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : null;
    } catch {
        return null;
    }
}

export function writeCache<T>(key: string, data: T[]): void {
    try {
        sessionStorage.setItem(CACHE_PREFIX + key, JSON.stringify(data));
    } catch {
        // sessionStorage full or unavailable — silently ignore
    }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/utils/gameDataCache.ts
git commit -m "feat: add sessionStorage cache utility for game data"
```

---

### Task 2: Integrate cache into GameDataContext

**Files:**
- Modify: `src/contexts/GameDataContext.tsx`

The key change: initialize state from cache synchronously in `useState` initializers. If all 4 caches hit, `isLoading` starts as `false` — the app renders instantly. Background revalidation always runs to keep data fresh.

- [ ] **Step 1: Add cache imports and cached initializers**

Add import at top of `GameDataContext.tsx`:

```ts
import { readCache, writeCache } from '../utils/gameDataCache';
```

Replace the 4 `useState` calls and `isLoading` with cache-aware initializers:

```ts
// Current code:
const [traits, setTraits] = useState<Trait[]>([]);
const [items, setItems] = useState<Item[]>([]);
const [champions, setChampions] = useState<Champion[]>([]);
const [augments, setAugments] = useState<AugmentData[]>([]);
const [isLoading, setIsLoading] = useState(true);

// New code:
const cachedTraits = readCache<Trait>('traits');
const cachedItems = readCache<Item>('items');
const cachedChampions = readCache<Champion>('champions');
const cachedAugments = readCache<AugmentData>('augments');
const hasCachedData = !!(cachedTraits && cachedItems && cachedChampions && cachedAugments);

const [traits, setTraits] = useState<Trait[]>(cachedTraits ?? []);
const [items, setItems] = useState<Item[]>(cachedItems ?? []);
const [champions, setChampions] = useState<Champion[]>(cachedChampions ?? []);
const [augments, setAugments] = useState<AugmentData[]>(cachedAugments ?? []);
const [isLoading, setIsLoading] = useState(!hasCachedData);
```

- [ ] **Step 2: Update useEffect to write cache after fetch**

Replace the existing `useEffect` `loadData` function body:

```ts
// Current code (inside useEffect):
try {
    const [traitsData, itemsData, championsData, augmentsData] = await Promise.all([
        traitService.getAll(),
        itemService.getAll(),
        championService.getAll(),
        augmentService.getAll()
    ]);
    setTraits(traitsData);
    setItems(itemsData);
    setChampions(championsData);
    setAugments(augmentsData);
} catch (error) {
    console.error('Error loading game data:', error);
} finally {
    setIsLoading(false);
}

// New code (inside useEffect):
try {
    const [traitsData, itemsData, championsData, augmentsData] = await Promise.all([
        traitService.getAll(),
        itemService.getAll(),
        championService.getAll(),
        augmentService.getAll()
    ]);
    setTraits(traitsData);
    setItems(itemsData);
    setChampions(championsData);
    setAugments(augmentsData);

    // Update cache for next session
    writeCache('traits', traitsData);
    writeCache('items', itemsData);
    writeCache('champions', championsData);
    writeCache('augments', augmentsData);
} catch (error) {
    console.error('Error loading game data:', error);
} finally {
    setIsLoading(false);
}
```

- [ ] **Step 3: Run dev server and verify**

```bash
cd D:/TFT-hoho && npm run dev
```

Manual verification:
1. Open app → first load fetches from Supabase (normal speed)
2. Open DevTools → Application → Session Storage → verify `tft_cache_*` keys exist
3. Refresh page → app should render instantly from cache (isLoading=false immediately)
4. Background revalidation should still update state if data changed

- [ ] **Step 4: Commit**

```bash
git add src/contexts/GameDataContext.tsx
git commit -m "feat: add stale-while-revalidate cache to GameDataContext

Cache game data (traits, items, champions, augments) in sessionStorage.
On repeat loads, state hydrates instantly from cache while background
revalidation keeps data fresh. First load unchanged."
```
