# Monetization feature context

## Purpose
- Defines the app's monetization packaging layer for the beta-to-Free/Pro transition.
- Keeps framing rules separate from current puzzle runtime and T-Coin unlock mechanics.
- v1 is packaging-only: it does not enforce exact daily free entitlements because the repo does not yet expose stable featured-daily or last-7 daily metadata.

## Entry points
- `src/config/monetization.ts`
  - Exports the active packaging config and compatibility boolean.
- `src/features/monetization/monetization.types.ts`
  - Declares packaging, premium-lane label, and tier-label types.
- `src/features/monetization/monetizationConfig.ts`
  - Resolves beta/free-pro mode and maps current puzzle tiers to user-facing labels.

## Stable rules
- Keep the mapping grounded in existing repo tiers only:
  - `free` -> `free`
  - `advanced` -> `Hard`
  - `rare` -> `Pro`
- Do not encode `Full Library` as an active v1 surface unless a real repo surface is added later.
- Keep beta framing explicit: premium lanes can be presented, but existing callers should still be able to rely on the compatibility boolean during migration.
- Do not gate `Review Decision` or interrupt a puzzle session mid-flow.
- Do not add analytics from this subtree.

## Follow-up note
- Exact enforcement of `1 featured daily + last 7 daily puzzles` is intentionally deferred until puzzle data includes a stable featured-daily identifier plus reliable recency ordering metadata.

## Verification
- `npm test -- src/config/monetization.test.ts`
