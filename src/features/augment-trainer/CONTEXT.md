# Augment Trainer Context

## Purpose

Document the stage-driven augment training flows for path declaration, plan declaration, and feedback components.

## Read This When

- You are changing intent or plan declaration flows.
- You are touching `PathSelector`, `PlanSelector`, or augment-training feedback.
- You need the round-specific rules for training phases.

## Key Entry Points

- `src/features/augment-trainer/components/PathSelector.tsx`
- `src/features/augment-trainer/components/PlanSelector.tsx`
- `src/features/augment-trainer/components/IntentFeedback.tsx`
- `src/features/augment-trainer/components/PlanFeedback.tsx`
- `src/hooks/useGameFlow.ts`

## Inbound / Outbound Dependencies

- Inbound: puzzle stage metadata from `useGameFlow` and puzzle data.
- Outbound: arena overlays, review screens, and puzzle feedback logic.

## Relevant Skills

- `frontend-design`
- `problem-solving-pro`

## Rules and Invariants

- Intent declaration is stage-driven. The current rule is that `3-2` enters the intent step.
- `2-1` should go directly to augment selection instead of being gated by `proPickPath`.
- Keep path and plan selectors aligned with the current `puzzlePhase` contract in `useGameFlow`.
- Feedback components should reflect the real pro metadata rather than inferred heuristics.

## Known Gotchas

- Gating the intent step by `proPickPath` alone can accidentally skip the intended flow.
- Training docs that blur `2-1`, `3-2`, and `4-2` behavior become misleading quickly because the UI phases are stage-specific.

## How to Verify

- `rg -n "declaring_intent|declaring_plan|INTENT_DECLARATION_STAGES|proPickPath" src/hooks/useGameFlow.ts src/features/augment-trainer`
- Run the app with a `2-1`, `3-2`, and `4-2` puzzle and confirm the expected phase order.

## Related Contexts

- `../../components/Arena/CONTEXT.md`
- `../coach-select/CONTEXT.md`
- `../../pages/Admin/PuzzleBuilder/CONTEXT.md`
