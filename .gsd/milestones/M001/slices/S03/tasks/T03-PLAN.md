---
estimated_steps: 6
estimated_files: 4
---

# T03: Expand the authoring contract and upgrade flagship puzzles

**Slice:** S03 - Worth-learning puzzle standard and flagship puzzle upgrades
**Milestone:** M001

## Description

Make the new standard authorable and reproducible. Today `MetaTab` exposes only part of the metadata contract, while `seedCompletePuzzles.ts` still stops at 2-1 and 3-2 examples. This task should close the authoring gap and upgrade a selected representative set so the standard exists in real content, not just UI code.

## Steps

1. Review which metadata fields already round-trip through `puzzleService` but are missing from `MetaTab`.
2. Add authoring controls for the missing worth-learning fields needed by S03, especially the 4-2 state fields and any prior-augment context required for the review surfaces.
3. Preserve the save/load round-trip through `puzzleService` and avoid schema invention unless a hard blocker is proven.
4. Upgrade a selected representative puzzle set across the shipped stages, including at least one 4-2 flagship example.
5. Use the repo-managed seed path and/or admin builder workflow so future runs can reproduce the upgraded flagship set.
6. Confirm the representative set actually contains the metadata that T02 expects to render.

## Must-Haves

- [ ] `MetaTab` can author the fields S03 needs instead of leaving them hidden in the data layer.
- [ ] The representative flagship set spans the real shipped stages, not only 2-1/3-2.
- [ ] The upgraded puzzle content is reproducible through the repo's existing admin/seed path.

## Verification

- `npm run test -- src/hooks/usePuzzleToPlayers.test.ts`
- Authoring check: save or seed a representative puzzle and confirm the new metadata fields survive a round-trip through `puzzleService`.

## Observability Impact

- Signals added/changed: admin metadata controls, save/load round-trip for 4-2 fields, representative flagship puzzle coverage.
- How a future agent inspects this: `MetaTab`, `puzzleService`, and the checked-in representative seed flow.
- Failure state exposed: the UI expects metadata that the authoring path still cannot create, or the representative set never includes 4-2 examples.

## Inputs

- `src/pages/Admin/PuzzleBuilder/tabs/MetaTab.tsx` - current authoring surface.
- `src/services/puzzleService.ts` - metadata persistence contract.
- `src/data/puzzleScenarios.ts` - canonical field list and types.
- `src/utils/seedCompletePuzzles.ts` - current reproducible representative puzzle flow.

## Expected Output

- `src/pages/Admin/PuzzleBuilder/tabs/MetaTab.tsx` - authoring controls for the worth-learning metadata contract.
- `src/services/puzzleService.ts` - only the persistence adjustments needed to keep the new fields round-tripping cleanly.
- `src/utils/seedCompletePuzzles.ts` - upgraded representative puzzle set that actually exercises the S03 standard.
