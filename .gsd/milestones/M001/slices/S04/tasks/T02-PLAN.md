---
estimated_steps: 6
estimated_files: 6
---

# T02: Upgrade free and Pro ending framing without reopening monetization policy

**Slice:** S04 - Premium desire, exhaustion states, and final loop integration
**Milestone:** M001

## Description

Use the existing lock, completion, and premium surfaces to make free endings more desire-inducing and Pro endings lighter. This task is about framing and packaging first, not a new entitlement model.

## Steps

1. Review current free/pro ending copy and CTA hierarchy in the lock overlay, completion modal, and premium lane callout.
2. Normalize any mojibake in the touched Vietnamese strings before refining the copy.
3. Strengthen the free-user upgrade invitation without turning the surface into a flat paywall.
4. Lighten Pro/supporter endings so they point users back to real-game practice instead of hard stopping them.
5. Keep the active monetization mode and policy toggles intact unless the current runtime proves insufficient.
6. Extend monetization-focused tests only where the new framing changes observable behavior.

## Must-Haves

- [ ] Free-user ending states feel invitational and specific to the loop value already built in S01-S03.
- [ ] Pro/supporter endings feel light and practice-oriented.
- [ ] The task does not invent a parallel entitlement system or reopen deferred monetization policy work.

## Verification

- `npm run test -- src/config/monetization.test.ts`
- Browser check: hit free lock/exhaustion and Pro/supporter endings and confirm the framing matches the new contract.

## Observability Impact

- Signals added/changed: CTA hierarchy, ending-state copy, and monetization-mode dependent presentation.
- How a future agent inspects this: touched UI surfaces plus monetization config/tests.
- Failure state exposed: generic paywall copy, heavy-handed Pro endings, or framing inconsistent with current mode.

## Inputs

- `src/features/tcoin/components/PuzzleLockOverlay.tsx`
- `src/components/Arena/PuzzleCompletionModal.tsx`
- `src/features/monetization/components/PremiumLaneCallout.tsx`
- `src/config/monetization.ts`
- `src/features/monetization/monetizationConfig.ts`
- `src/config/monetization.test.ts`

## Expected Output

- The touched ending surfaces use clearer, correctly encoded copy and better CTA hierarchy.
- Monetization config/tests stay aligned with the current mode and the new framing contract.
