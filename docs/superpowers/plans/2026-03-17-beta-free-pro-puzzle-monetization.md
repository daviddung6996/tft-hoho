# Beta Free/Pro Puzzle Monetization Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the approved monetization packaging: a 30-day beta framing layer, a post-beta Free/Pro structure centered on premium puzzle access, and the supporting UI/logic hooks without breaking the existing `Puzzle -> Review Decision -> IQ/progress -> return` loop.

**Architecture:** Reuse the existing puzzle runtime in `src/App.tsx`, `usePuzzleGame`, `DecisionReview`, and settings/profile surfaces instead of inventing a new monetization subsystem. Add a small packaging layer that controls beta messaging, Free-vs-Pro presentation, and premium lane CTA surfaces at the exact touchpoints users already hit: puzzle entry, lock overlays, Review Decision follow-through, and the settings menu.

**Tech Stack:** React, TypeScript, Vitest, Testing Library, existing puzzle/tcoin/pro-supporter feature modules

---

## File Structure

- **Modify:** `src/config/monetization.ts`
  - Replace the single boolean flag with explicit packaging config for beta window, monetization mode, and product-label mapping.
- **Create:** `src/config/monetization.test.ts`
  - Cover packaging-mode helpers and tier-to-product-label mapping.
- **Modify:** `src/hooks/usePuzzleGame.ts`
  - Add packaging-aware puzzle access only if the current puzzle data already exposes a real source of truth for featured-daily / recent-daily ordering.
  - Preserve the guarantee that one playable puzzle session can complete end-to-end.
- **Create:** `src/hooks/usePuzzleGame.test.tsx`
  - Regression tests for beta access and, if supported by existing data, Free entitlement boundaries.
- **Modify:** `src/App.tsx`
  - Mount beta banner / packaging messaging and thread packaging state to existing overlays and review surfaces.
- **Create:** `src/features/monetization/CONTEXT.md`
  - Stable subtree guidance for packaging state and Free/Pro UI rules.
- **Create:** `src/features/monetization/monetization.types.ts`
  - Keep packaging-specific types out of unrelated puzzle/tcoin files.
- **Create:** `src/features/monetization/monetizationConfig.ts`
  - Parse and expose active packaging state and label mapping for app use.
- **Create:** `src/features/monetization/components/BetaStatusBanner.tsx`
  - Show beta framing and post-beta Free/Pro messaging.
- **Create:** `src/features/monetization/components/PremiumLaneCallout.tsx`
  - Reusable UI for premium lane / Pro CTA surfaces.
- **Create:** `src/features/monetization/components/BetaStatusBanner.test.tsx`
- **Create:** `src/features/monetization/components/PremiumLaneCallout.test.tsx`
- **Modify:** `src/features/tcoin/components/PuzzleLockOverlay.tsx`
  - Make copy packaging-aware while preserving current unlock mechanics.
- **Modify:** `src/components/Arena/DecisionReview.tsx`
  - Add the post-solve premium lane CTA without interrupting the current review/IQ loop.
- **Create:** `src/components/Arena/DecisionReview.test.tsx`
  - Verify the CTA appears only in the right packaging states and never blocks the full loop.
- **Modify:** `src/components/Settings/SettingsButton.tsx` (`MenuButton` export)
  - Surface current packaging state and upgrade entry point from the existing menu/profile affordance.
- **Create:** `src/components/Settings/SettingsButton.test.tsx`
  - Regression tests for beta/pro/free messaging and menu CTA rendering.
- **Optional modify:** `src/features/tcoin/tcoin.types.ts`
  - Only if the implementation needs a canonical mapping from current tiers (`free` / `advanced` / `rare`) to product labels such as `Hard` / `Pro`.

### Product label mapping to lock before implementation

- `free` -> existing free puzzle lane
- `advanced` -> `Hard`
- `rare` -> `Pro`
- `Full Library` -> only ship if there is an existing real puzzle-library surface in the repo; otherwise remove that label from v1 copy and keep the plan to premium lane messaging only

### Hard gate before entitlement enforcement

Before implementing `1 featured daily + last 7 daily puzzles`, confirm the current puzzle data/service already has a stable source of truth for:

- featured daily identity
- publish order or recency order
- enough metadata to derive the last 7 daily puzzles safely

If those fields do not already exist, do **not** invent them inside this plan. In that case, ship beta/free-pro framing and premium lane surfacing first, and move entitlement enforcement to a follow-up plan once puzzle metadata is defined.

### Existing test reality in this repo

The plan should only rely on test files created in this plan plus test files confirmed to exist today:

- `src/features/coach-select/hooks/useCoachSelect.test.tsx`
- any new test files created below

Do not rely on deleted or absent historical test files.

### Commit policy for this plan

Commit at natural checkpoints during implementation, not after every task.

---

## Chunk 1: Confirm data reality and create an explicit packaging model

### Task 1: Confirm whether daily entitlement is implementable from existing data

**Files:**
- Inspect: `src/hooks/usePuzzleGame.ts`
- Inspect: `src/services/puzzleService.ts`
- Inspect: existing puzzle types / scenario data used by the hook

- [ ] **Step 1: Identify the actual puzzle fields available for ordering and daily designation**

Confirm whether the current data model already exposes all of these:

- one stable featured-daily identifier or derivation rule
- one stable publish/recency ordering field
- enough metadata to derive the last 7 daily puzzles

- [ ] **Step 2: Stop and choose the correct execution path**

Use this rule:
- if the data already exists, continue with entitlement enforcement in Chunk 2
- if the data does not exist, explicitly skip entitlement enforcement in this plan and continue with packaging/framing-only work

- [ ] **Step 3: Record the decision in implementation notes inside the execution log**

Expected outcome: one unambiguous yes/no decision before any entitlement code is written.

### Task 2: Define monetization packaging types

**Files:**
- Create: `src/features/monetization/monetization.types.ts`

- [ ] **Step 1: Add the core packaging types**

Create types for the concepts already approved in the spec:

```ts
export type MonetizationMode = 'beta' | 'free-pro';

export interface BetaWindow {
  startsAt: string;
  endsAt: string;
}

export interface FreeEntitlement {
  featuredDailyCount: number;
  recentDailyWindow: number;
}

export interface MonetizationPackaging {
  mode: MonetizationMode;
  betaWindow: BetaWindow;
  freeEntitlement: FreeEntitlement;
  premiumLaneLabels: string[];
}
```

Keep the file focused on types only.

- [ ] **Step 2: Add a typed mapping for current puzzle tiers to product labels if needed**

Keep the mapping grounded in the existing repo tiers: `free`, `advanced`, `rare`.

- [ ] **Step 3: Run typecheck on the new file**

Run: `npm test -- --run src/config/monetization.test.ts`

Expected: FAIL because the config/helper file and tests do not exist yet.

### Task 3: Replace the single monetization flag with explicit config

**Files:**
- Modify: `src/config/monetization.ts`
- Create: `src/config/monetization.test.ts`
- Create: `src/features/monetization/monetizationConfig.ts`

- [ ] **Step 1: Write the failing config tests first**

Cover the approved behavior:

```ts
test('returns beta mode while current date is inside the beta window', () => {

test('returns free-pro mode after the beta window ends', () => {

test('maps advanced and rare puzzle tiers to the approved product labels', () => {
```

Keep these pure and deterministic by injecting `now` instead of reading `Date.now()` directly in the tests.

- [ ] **Step 2: Run the new test file and verify RED**

Run: `npm test -- --run src/config/monetization.test.ts`

Expected: FAIL because helpers/config do not exist yet.

- [ ] **Step 3: Implement `monetizationConfig.ts` minimally**

Create helpers like:

```ts
export function resolveMonetizationMode(now: Date, config: MonetizationPackaging): MonetizationMode
export function isBetaActive(now: Date, config: MonetizationPackaging): boolean
export function getTierProductLabel(tier: PuzzleTier): string
```

Avoid runtime side effects.

- [ ] **Step 4: Update `src/config/monetization.ts` to export the active packaging config**

Replace the boolean-only export with an explicit object and keep a compatibility export only if it is still required by existing callers:

```ts
export const MONETIZATION_PACKAGING = { ... }
export const MONETIZATION_ENABLED = true
```

Do not delete compatibility flags until all callers are migrated.

- [ ] **Step 5: Run the config tests and verify GREEN**

Run: `npm test -- --run src/config/monetization.test.ts`

Expected: PASS

### Task 4: Document the new packaging subtree

**Files:**
- Create: `src/features/monetization/CONTEXT.md`

- [ ] **Step 1: Write stable subtree guidance**

Document:
- purpose of the packaging layer
- entry points (`monetizationConfig.ts`, UI components)
- rules: do not break the full free loop, do not gate `Review Decision` mid-session, keep beta framing explicit
- verification commands

---

## Chunk 2: Add packaging-aware puzzle access rules only if the data model supports it

### Task 5: Write failing entitlement tests for `usePuzzleGame` only if Task 1 passed

**Files:**
- Create: `src/hooks/usePuzzleGame.test.tsx`
- Test: `src/hooks/usePuzzleGame.test.tsx`

- [ ] **Step 1: If Task 1 found real daily metadata, write a beta test that proves premium puzzles stay playable during beta**

Suggested test name:

```ts
test('treats premium puzzle lanes as playable during beta', () => {
```

Mock the packaging config into `beta` mode and verify a non-free tier puzzle resolves to playable.

- [ ] **Step 2: If Task 1 found real daily metadata, write a Free-tier entitlement boundary test**

Suggested test name:

```ts
test('allows only the featured daily plus the last 7 daily puzzles for free users after beta', () => {
```

Do not rely on production puzzle IDs. Use a small mock puzzle list with explicit ordering.

- [ ] **Step 3: Write a loop-preservation test**

Suggested test name:

```ts
test('never blocks completion of an already-playable puzzle mid-session', () => {
```

The point is to preserve the approved loop guarantee.

- [ ] **Step 4: Run the test file and verify RED**

Run: `npm test -- --run src/hooks/usePuzzleGame.test.tsx`

Expected: FAIL because `usePuzzleGame` does not yet understand packaging states.

### Task 6: Implement packaging-aware access in `usePuzzleGame` only if Task 1 passed

**Files:**
- Modify: `src/hooks/usePuzzleGame.ts`
- Test: `src/hooks/usePuzzleGame.test.tsx`

- [ ] **Step 1: Import the packaging helpers instead of duplicating date logic inside the hook**

- [ ] **Step 2: Add a helper that classifies whether the current puzzle is inside Free entitlement**

Implementation shape:

```ts
function isPuzzleInsideFreeEntitlement(currentPuzzle: PuzzleLike, orderedPuzzles: PuzzleLike[], config: MonetizationPackaging): boolean
```

Keep it local to the hook unless another caller immediately needs it.

- [ ] **Step 3: Apply the new policy in the access check**

Rules to encode:
- in `beta` mode, premium lanes remain playable
- in `free-pro` mode, Free users get the featured daily plus the last 7 daily puzzles
- once a puzzle is already playable, the session can complete without mid-flow relocking

- [ ] **Step 4: Preserve existing Pro Supporter / T-Coin flows unless a test proves they conflict**

- [ ] **Step 5: Run the focused hook tests and verify GREEN**

Run: `npm test -- --run src/hooks/usePuzzleGame.test.tsx`

Expected: PASS

### Task 7: If Task 1 failed, explicitly skip entitlement enforcement in v1

**Files:**
- Modify: `src/config/monetization.ts`
- Modify: `src/features/monetization/CONTEXT.md`

- [ ] **Step 1: Encode packaging/framing without false entitlement claims**

Keep beta/free-pro messaging active, but do not pretend the app can enforce `1 + 7` daily access if the source data does not exist.

- [ ] **Step 2: Add a clear follow-up note in `src/features/monetization/CONTEXT.md`**

State that exact daily entitlement enforcement depends on future puzzle metadata support.

---

## Chunk 3: Ship beta framing and premium lane surfaces

### Task 8: Add a failing banner test first

**Files:**
- Create: `src/features/monetization/components/BetaStatusBanner.test.tsx`
- Create: `src/features/monetization/components/BetaStatusBanner.tsx`

- [ ] **Step 1: Write tests for both packaging states**

Suggested tests:

```ts
test('renders beta framing while beta is active', () => {

test('renders free/pro transition messaging after beta ends', () => {
```

Assert only on approved messaging themes, not fragile full-copy paragraphs.

- [ ] **Step 2: Run the test file and verify RED**

Run: `npm test -- --run src/features/monetization/components/BetaStatusBanner.test.tsx`

Expected: FAIL because component does not exist yet.

- [ ] **Step 3: Implement the minimal banner**

Props should be narrow, e.g.:

```ts
interface BetaStatusBannerProps {
  mode: MonetizationMode;
  betaEndsAt: string;
}
```

- [ ] **Step 4: Run the banner tests and verify GREEN**

Run: `npm test -- --run src/features/monetization/components/BetaStatusBanner.test.tsx`

Expected: PASS

### Task 9: Add a premium lane callout component with tests

**Files:**
- Create: `src/features/monetization/components/PremiumLaneCallout.tsx`
- Create: `src/features/monetization/components/PremiumLaneCallout.test.tsx`

- [ ] **Step 1: Write a failing test for premium lane presentation**

Suggested test:

```ts
test('shows premium lane CTA only in free-pro mode for non-pro users', () => {
```

- [ ] **Step 2: Run the test and verify RED**

Run: `npm test -- --run src/features/monetization/components/PremiumLaneCallout.test.tsx`

Expected: FAIL because the component does not exist.

- [ ] **Step 3: Implement `PremiumLaneCallout` minimally**

It should:
- show labels grounded in actual repo/product mapping
- explain beta-free access vs post-beta Pro access
- call a supplied CTA handler

- [ ] **Step 4: Run the premium lane test and verify GREEN**

Run: `npm test -- --run src/features/monetization/components/PremiumLaneCallout.test.tsx`

Expected: PASS

### Task 10: Mount beta framing into `App.tsx`

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Mount `BetaStatusBanner` at an existing top-level puzzle shell location**

Choose a surface that does not block gameplay. Good candidates are near `TopStatusBar` or inside the fixed HUD/menu region.

- [ ] **Step 2: Thread packaging state into any new CTA handlers**

Keep `App.tsx` orchestration-heavy as the repo expects today. Do not spin up a separate global store just for monetization.

- [ ] **Step 3: Run focused tests for the newly mounted components**

Run: `npm test -- --run src/features/monetization/components/BetaStatusBanner.test.tsx src/features/monetization/components/PremiumLaneCallout.test.tsx`

Expected: PASS

---

## Chunk 4: Preserve the Review Decision -> IQ loop while adding monetization CTA

### Task 11: Write failing `DecisionReview` tests first

**Files:**
- Create: `src/components/Arena/DecisionReview.test.tsx`
- Test: `src/components/Arena/DecisionReview.test.tsx`

- [ ] **Step 1: Write a test that proves the monetization CTA does not replace Review Decision**

Suggested test name:

```ts
test('keeps Review Decision and IQ summary visible before any premium CTA', () => {
```

Assert that review content and IQ feedback remain rendered even when a premium lane CTA is present.

- [ ] **Step 2: Write a test for packaging-aware CTA visibility**

Suggested test names:

```ts
test('does not show premium CTA during beta for free users', () => {

test('shows premium CTA after review in free-pro mode for free users', () => {
```

- [ ] **Step 3: Run the test file and verify RED**

Run: `npm test -- --run src/components/Arena/DecisionReview.test.tsx`

Expected: FAIL because the CTA logic is not implemented yet.

### Task 12: Add the CTA after the existing review loop

**Files:**
- Modify: `src/components/Arena/DecisionReview.tsx`
- Test: `src/components/Arena/DecisionReview.test.tsx`

- [ ] **Step 1: Extend `DecisionReviewProps` with only the packaging inputs it needs**

Prefer narrow props such as:

```ts
monetizationMode?: MonetizationMode;
showPremiumLaneCta?: boolean;
onUpgradeClick?: () => void;
```

Do not make `DecisionReview` parse config directly.

- [ ] **Step 2: Render the CTA after the existing review/IQ sections**

The CTA must be additive, not a replacement. Keep the approved loop intact:
- solve
- see `Review Decision`
- receive IQ/progress
- then optionally see the premium lane nudge

- [ ] **Step 3: Reuse `PremiumLaneCallout` instead of duplicating copy**

Keep all premium lane messaging in one reusable component.

- [ ] **Step 4: Run the DecisionReview tests and verify GREEN**

Run: `npm test -- --run src/components/Arena/DecisionReview.test.tsx`

Expected: PASS

### Task 13: Pass packaging state into `DecisionReview` from `App.tsx`

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Derive whether the current user should see a premium nudge**

Rules:
- never break the review loop
- hide CTA for fully entitled users
- keep beta mode focused on framing, not post-review upsell pressure

- [ ] **Step 2: Pass the new props into `DecisionReview`**

Keep the change local to the existing render call in `App.tsx`.

- [ ] **Step 3: Run the focused review tests again**

Run: `npm test -- --run src/components/Arena/DecisionReview.test.tsx`

Expected: PASS

---

## Chunk 5: Expose the upgrade path in existing menu/lock surfaces

### Task 14: Write `SettingsButton` tests for packaging CTA visibility

**Files:**
- Create: `src/components/Settings/SettingsButton.test.tsx`
- Test: `src/components/Settings/SettingsButton.test.tsx`

- [ ] **Step 1: Write a test for beta-state messaging**

Suggested test:

```ts
test('shows beta access framing instead of upgrade CTA during beta', () => {
```

- [ ] **Step 2: Write a test for post-beta upgrade entry**

Suggested test:

```ts
test('shows Pro upgrade entry in free-pro mode for non-pro users', () => {
```

- [ ] **Step 3: Run the test file and verify RED**

Run: `npm test -- --run src/components/Settings/SettingsButton.test.tsx`

Expected: FAIL because the packaging UI is not wired into the menu yet.

### Task 15: Add packaging state to `SettingsButton.tsx` (`MenuButton` export)

**Files:**
- Modify: `src/components/Settings/SettingsButton.tsx`
- Test: `src/components/Settings/SettingsButton.test.tsx`

- [ ] **Step 1: Add the narrowest new props needed**

Prefer something like:

```ts
monetizationMode?: MonetizationMode;
isProEntitled?: boolean;
onUpgradeClick?: () => void;
```

- [ ] **Step 2: Render one small packaging surface in the menu/profile entry area**

In beta:
- show `Beta` / `Free & Pro coming` framing

After beta:
- show the `Pro` upgrade entry for non-pro users

Do not turn the whole menu into a billing screen.

- [ ] **Step 3: Run the settings tests and verify GREEN**

Run: `npm test -- --run src/components/Settings/SettingsButton.test.tsx`

Expected: PASS

### Task 16: Make `PuzzleLockOverlay` packaging-aware without rewriting unlock economics

**Files:**
- Modify: `src/features/tcoin/components/PuzzleLockOverlay.tsx`
- Test: `src/features/monetization/components/PremiumLaneCallout.test.tsx`

- [ ] **Step 1: Add the smallest packaging props needed for copy/CTA branching**

Example:

```ts
monetizationMode?: MonetizationMode;
showProUpgrade?: boolean;
```

- [ ] **Step 2: Update copy to match the approved spec**

Rules:
- beta mode: premium lane visible, temporarily free framing
- free-pro mode: Pro-only framing on premium lane
- do not remove the skip-to-free guardrail

- [ ] **Step 3: Keep the existing unlock actions alive unless product code is explicitly deleting them in the same implementation**

- [ ] **Step 4: Run the focused monetization tests**

Run: `npm test -- --run src/features/monetization/components/PremiumLaneCallout.test.tsx src/components/Settings/SettingsButton.test.tsx src/features/coach-select/hooks/useCoachSelect.test.tsx`

Expected: PASS

---

## Chunk 6: Final verification and documentation pass

### Task 17: Final verification and documentation pass

**Files:**
- Modify: `src/features/monetization/CONTEXT.md`
- Modify: any touched `CONTEXT.md` file only if the implementation changed stable subtree knowledge

- [ ] **Step 1: Run the focused monetization test suite**

Run:

```bash
npm test -- --run src/config/monetization.test.ts src/hooks/usePuzzleGame.test.tsx src/features/monetization/components/BetaStatusBanner.test.tsx src/features/monetization/components/PremiumLaneCallout.test.tsx src/components/Arena/DecisionReview.test.tsx src/components/Settings/SettingsButton.test.tsx
```

Expected: PASS, except `src/hooks/usePuzzleGame.test.tsx` may be omitted if Task 1 determined entitlement enforcement is out of scope for v1.

- [ ] **Step 2: Run one confirmed-existing nearby regression suite**

Run:

```bash
npm test -- --run src/features/coach-select/hooks/useCoachSelect.test.tsx
```

Expected: PASS

- [ ] **Step 3: Run a production-minded compile check**

Run: `npm run build`

Expected: PASS

- [ ] **Step 4: Review and update colocated context docs**

At minimum, confirm whether these need updates based on what actually changed:
- `src/features/monetization/CONTEXT.md`
- `src/components/Arena/CONTEXT.md`
- `src/components/Settings/CONTEXT.md`

Only change docs where the implementation added stable new rules.

---

## Follow-up explicitly out of scope for v1

- building a new billing system or checkout flow
- replacing T-Coin / Pro Supporter economics wholesale
- adding a standalone analytics vendor integration
- inventing daily puzzle metadata if the current puzzle model does not already support it
- shipping `Full Library` as a concrete product surface unless the repo already has that surface implemented

## Notes for the implementing agent

- Keep the current `Review Decision -> IQ` payoff intact. The monetization work is packaging and surfacing, not a rewrite of the learning loop.
- Do not introduce a new global state library.
- Keep `App.tsx` orchestration-heavy if that is the smallest change.
- Do not delete T-Coin / Pro Supporter mechanics unless a later approved plan explicitly replaces them.
- Preserve the approved free-user guardrail: one full meaningful puzzle session must complete without a mid-flow paywall.
- Pricing is intentionally not hardcoded here beyond structural guidance. If implementation needs placeholder copy, keep it clearly provisional.
- Optional analytics can be added in a later plan after the packaging surfaces are working.

Plan complete and saved to `docs/superpowers/plans/2026-03-17-beta-free-pro-puzzle-monetization.md`. Ready to execute?