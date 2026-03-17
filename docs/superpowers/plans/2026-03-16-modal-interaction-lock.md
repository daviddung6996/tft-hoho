# Modal Interaction Lock Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Block board drag interactions whenever any blocking modal is open, and immediately cancel any in-progress drag when a blocking modal appears.

**Architecture:** Add a single app-level interaction lock derived from an explicit list of blocking modal/overlay visibility flags, pass it down to gameplay components, and make the board drag system respect it both at drag start and during active drags. Cover the regression with focused tests so future modals cannot reintroduce the issue, and verify that unlocking restores normal board interaction.

**Blocking lock sources in scope:** `showSupportModal`, `showLoginModal`, `showAdminModal`, `showProfileModal`, `showCompletionModal`, and `isSettingsOpen` only. Exclude decorative effects and unrelated UI such as `RightClickEffect` unless a failing test proves they participate in gameplay input.

**Tech Stack:** React, TypeScript, Vitest, Testing Library

---

## File Structure

- **Modify:** `src/App.tsx`
  - Derive a single `isInteractionLocked` boolean from blocking modal state.
  - Pass that flag into `GameScene`.
- **Modify:** `src/components/Game/GameScene.tsx`
  - Thread the interaction lock into `Board`.
- **Modify:** `src/components/Arena/Board.tsx`
  - Prevent new drags while locked.
  - Cancel active drag when lock turns on.
- **Create:** `src/components/Arena/Board.test.tsx`
  - Regression tests for drag blocking and drag cancellation.
- **Optional modify (only if needed by test ergonomics):** `src/components/Arena/BoardComponents/BoardUnit.tsx`, `src/components/Arena/BoardComponents/BenchComponents.tsx`
  - Only if test selectors or accessibility hooks are needed for stable event targeting.

---

## Chunk 1: Wire a global interaction lock

### Task 1: Derive app-level lock state

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Add a single derived boolean for blocking modals**

Create a value near the existing modal state in `App.tsx`:

```ts
const isInteractionLocked = showSupportModal
    || showLoginModal
    || showAdminModal
    || showProfileModal
    || showCompletionModal
    || isSettingsOpen;
```

Only include modals/overlays that should freeze gameplay interaction. Do not include purely decorative state.

- [ ] **Step 2: Pass the lock into `GameScene`**

Update the `GameScene` usage to include:

```tsx
<GameScene
  ...
  isInteractionLocked={isInteractionLocked}
/>
```

- [ ] **Step 3: Run typecheck for the first compile error**

Run: `npm test -- --run src/components/Arena/Board.test.tsx`

Expected: FAIL because `GameScene` does not yet accept `isInteractionLocked`.

- [ ] **Step 4: Commit chunk 1 wiring start**

```bash
git add src/App.tsx
git commit -m "refactor: derive gameplay interaction lock"
```

### Task 2: Thread lock through `GameScene`

**Files:**
- Modify: `src/components/Game/GameScene.tsx`

- [ ] **Step 1: Extend props**

Add:

```ts
isInteractionLocked?: boolean;
```

Default to `false` in usage if desired, but keep behavior explicit.

- [ ] **Step 2: Pass the lock into `Board`**

Update the player-side board render:

```tsx
<Board
  ...
  isInteractionLocked={isInteractionLocked}
/>
```

- [ ] **Step 3: Run the focused test command again**

Run: `npm test -- --run src/components/Arena/Board.test.tsx`

Expected: FAIL because `Board` does not yet accept `isInteractionLocked` and/or test file does not exist yet.

- [ ] **Step 4: Commit chunk 1 completion**

```bash
git add src/App.tsx src/components/Game/GameScene.tsx
git commit -m "refactor: thread gameplay interaction lock to board"
```

---

## Chunk 2: Reproduce the bug with tests first

### Task 3: Write the failing regression tests

**Files:**
- Create: `src/components/Arena/Board.test.tsx`
- Test: `src/components/Arena/Board.test.tsx`

- [ ] **Step 1: Write a test that proves drag start is blocked while locked**

Use a small `Board` render with one draggable unit and a spy `onUnitsChange`. The test should:
- render `Board` with `isInteractionLocked={true}`
- pointer-down on a unit
- pointer-move beyond threshold
- pointer-up on a valid board/bench target
- assert `onUnitsChange` was **not** called

Suggested test name:

```ts
test('does not start drag when interaction is locked', () => {
```

- [ ] **Step 2: Write a test that proves an active drag is canceled when lock turns on**

The test should:
- render unlocked board
- start a drag
- rerender with `isInteractionLocked={true}` before pointer-up
- pointer-up over a valid target
- assert `onUnitsChange` was **not** called
- assert no unintended board/bench move side effects occur
- assert drag cleanup side effects are removed (for example no `is-dragging` class on `document.body`)

- [ ] **Step 3: Write a test that proves unlocking restores normal drag behavior**

The test should:
- render locked board and prove drag is blocked
- rerender with `isInteractionLocked={false}`
- perform the same drag gesture again
- assert `onUnitsChange` is called with updated placement

Suggested test name:

```ts
test('allows drag again after interaction lock turns off', () => {
```

- [ ] **Step 4: Run the test file and verify RED**

Run: `npm test -- --run src/components/Arena/Board.test.tsx`

Expected: FAIL because the board currently ignores the lock.

- [ ] **Step 5: Commit the failing regression tests**

```bash
git add src/components/Arena/Board.test.tsx
git commit -m "test: add modal interaction lock regressions"
```

Suggested test name:

```ts
test('cancels active drag when interaction lock turns on', () => {
```


---

## Chunk 3: Minimal board fix

### Task 4: Prevent drag start while locked

**Files:**
- Modify: `src/components/Arena/Board.tsx`

- [ ] **Step 1: Add the prop to `BoardProps`**

Add:

```ts
isInteractionLocked?: boolean;
```

- [ ] **Step 2: Include it in the component signature**

Default it to false:

```ts
isInteractionLocked = false,
```

- [ ] **Step 3: Update interactive gating**

Replace the existing interactive condition with one that also requires the board not be locked:

```ts
const isInteractive = !isMirrored && !!onUnitsChange && !isInteractionLocked;
```

- [ ] **Step 4: Run the targeted tests**

Run: `npm test -- --run src/components/Arena/Board.test.tsx`

Expected: first test PASS, second test still FAIL.

- [ ] **Step 5: Commit drag-start guard**

```bash
git add src/components/Arena/Board.tsx
git commit -m "fix: block board drag start while modal is open"
```

### Task 5: Cancel in-progress drag when the lock turns on

**Files:**
- Modify: `src/components/Arena/Board.tsx`

- [ ] **Step 1: Add an effect that watches `isInteractionLocked`**

If the board becomes locked while `dragRef.current` exists or `isDragActive.current` is true, call the existing `cleanup()`.

Implementation shape:

```ts
useEffect(() => {
  if (!isInteractionLocked) return;
  if (!dragRef.current && !isDragActive.current) return;
  cleanup();
}, [isInteractionLocked, cleanup]);
```

- [ ] **Step 2: Ensure cleanup remains safe when called redundantly**

Do not add new abstractions. Only keep `cleanup()` idempotent if the new test reveals a real issue.

- [ ] **Step 3: Run the targeted tests and verify GREEN**

Run: `npm test -- --run src/components/Arena/Board.test.tsx`

Expected: PASS

- [ ] **Step 4: Commit the cancellation fix**

```bash
git add src/components/Arena/Board.tsx
git commit -m "fix: cancel active board drag when modal opens"
```

---

## Chunk 4: Verify no regression in normal play

### Task 6: Verify unlocked drag still works

**Files:**
- Modify: `src/components/Arena/Board.test.tsx`

- [ ] **Step 1: Add one positive-path test**

Add a control test proving drag still works when unlocked:

```ts
test('allows drag and drop when interaction is unlocked', () => {
```

Assert `onUnitsChange` is called with updated placement.

- [ ] **Step 2: Run the focused test file**

Run: `npm test -- --run src/components/Arena/Board.test.tsx`

Expected: PASS

- [ ] **Step 3: Run any nearby related tests if they exist**

Run one of:
- `npm test -- --run src/components/Game/GameHUD.test.tsx`
- or another closest existing gameplay test file if available

If no nearby tests exist, skip this step without creating unrelated tests.

- [ ] **Step 4: Commit the verification test**

```bash
git add src/components/Arena/Board.test.tsx
git commit -m "test: cover unlocked board drag behavior"
```

### Task 6.5: Decide keyboard behavior during blocking modals

**Files:**
- Modify: `src/App.tsx` (only if existing global key handlers can affect gameplay while a blocking modal is open)
- Test: nearest relevant app-level test file if one already exists

- [ ] **Step 1: Inspect existing global keyboard handlers**

Review whether any `window` or `document` keyboard listeners in `App.tsx` can trigger gameplay actions while a blocking modal is open.

- [ ] **Step 2: If needed, guard keyboard gameplay actions behind the same lock**

If a handler can still mutate gameplay state while a blocking modal is open, add a minimal early return:

```ts
if (isInteractionLocked) return;
```

Apply only to gameplay actions, not modal-close behavior.

- [ ] **Step 3: Verify behavior**

If a guard was needed, run the nearest relevant focused test or perform manual verification that gameplay hotkeys do nothing while a blocking modal is open and still work after the modal closes.

- [ ] **Step 4: Keep scope tight**

Do not add new keyboard abstractions or unrelated shortcut cleanup.

### Task 7: Final verification

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/Game/GameScene.tsx`
- Modify: `src/components/Arena/Board.tsx`
- Test: `src/components/Arena/Board.test.tsx`

- [ ] **Step 1: Run the focused regression suite**

Run: `npm test -- --run src/components/Arena/Board.test.tsx`

Expected: PASS

- [ ] **Step 2: Manually verify the original bug path**

Manual checklist:
- Open donate modal
- Try dragging a unit from board and bench
- Confirm no drag starts
- Start dragging a unit, then open a blocking modal if possible
- Confirm drag is canceled immediately
- Close modal and confirm normal drag works again
- Sanity-check one other blocking modal (for example login or profile) to confirm the same behavior

- [ ] **Step 3: Inspect diff for scope control**

Run: `git diff -- src/App.tsx src/components/Game/GameScene.tsx src/components/Arena/Board.tsx src/components/Arena/Board.test.tsx`

Expected: only interaction-lock wiring and tests

- [ ] **Step 4: Final commit**

```bash
git add src/App.tsx src/components/Game/GameScene.tsx src/components/Arena/Board.tsx src/components/Arena/Board.test.tsx
git commit -m "fix: freeze board interactions while blocking modals are open"
```
