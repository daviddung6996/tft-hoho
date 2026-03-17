# Puzzle Builder Context

## Purpose

Document the admin puzzle authoring flow, including board state editing, metadata editing, JSON import, and save sanitization.

## Read This When

- You are changing the Puzzle Builder UI or save contract.
- You are debugging player state level and XP sanitization.
- You are working with puzzle metadata such as VOD links, stage, or augment trainer fields.

## Key Entry Points

- `src/pages/Admin/PuzzleBuilder/PuzzleBuilder.tsx`
- `src/pages/Admin/PuzzleBuilder/hooks/usePuzzleBuilderState.ts`
- `src/pages/Admin/PuzzleBuilder/tabs/MetaTab.tsx`
- `src/pages/Admin/PuzzleBuilder/components/*`
- `src/services/puzzleService.ts`

## Inbound / Outbound Dependencies

- Inbound: admin modal routing and current puzzle data.
- Outbound: `src/features/puzzle/playerState.ts`, `src/features/puzzle/playerLevel.ts`, and Supabase puzzle persistence.

## Relevant Skills

- `problem-solving-pro`
- `supabase-postgres-best-practices`
- `repo-memory`

## Rules and Invariants

- `playerState.level` is a hard board-cap value and must be sanitized by stage.
- Always sanitize level and XP before save or import.
- Treat VOD metadata here as puzzle metadata, not as evidence of a separate OCR pipeline module in this repo.
- Keep builder state transformations routed through the existing builder hook and puzzle-state sanitizers.

## Known Gotchas

- JSON import can silently preserve invalid shape unless it is normalized before becoming builder state.
- Stage-specific training fields such as `proPickPath` or `proPlan` must match the real phase rules enforced elsewhere.

## How to Verify

- `rg -n "sanitizePuzzleStateLevels|sanitizePlayerLevel|sanitizePlayerXp|proPickPath|vodTimestamp" src/pages/Admin/PuzzleBuilder src/features/puzzle src/services/puzzleService.ts`
- Open the builder, change stage and level values, then confirm save payloads are sanitized as expected.

## Related Contexts

- `../CONTEXT.md`
- `../../../features/augment-trainer/CONTEXT.md`
- `../../../../supabase/CONTEXT.md`
