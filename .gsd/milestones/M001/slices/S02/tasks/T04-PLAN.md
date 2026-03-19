---
estimated_steps: 5
estimated_files: 2
---

# T04: Prove the cleaned desktop opening loop and freeze the S04 boundary

**Slice:** S02 - Fast puzzle entry and interruption cleanup
**Milestone:** M001

## Description

Close S02 by proving the live desktop opening loop actually feels clean after the startup, auth, and completion changes. This task is the slice boundary lock: R001 and R002 are proven here, while R008 stays limited to non-dead-end guardrails.

## Steps

1. Review the slice must-haves in `S02-PLAN.md` and the M001 boundary map for `S02 -> S04`.
2. Add any last App or hook tests needed for the cleaned entry and interruption contract.
3. Run the targeted tests and `npm run build`.
4. Exercise the desktop browser flow for a fresh session, a persisted guest session, a completion end, and a local lock simulation.
5. Record the exact outcomes and boundary notes so S03 and S04 do not reopen startup/login cleanup.

## Must-Haves

- [ ] Automated checks cover startup shell, guest-safe entry, completion resolution, and lock escape hatches.
- [ ] The real desktop browser flow is exercised after the code changes.
- [ ] The task leaves a clear note that persuasive Pro-desire and final exhaustion treatment remain S04 work.

## Verification

- `npm run test -- src/App.mobile-overlay.test.tsx src/hooks/usePuzzleGame.test.ts && npm run build`
- Browser check: run the app on desktop, verify a clean puzzle-first load, repeat with `tft_guest_mode=true`, and if using local post-beta simulation confirm the lock flow and then revert the config before completing the task.

## Observability Impact

- Signals added/changed: final validated inspection path across App DOM, `localStorage`, monetization mode, and test coverage.
- How a future agent inspects this: targeted tests, the browser flow, and the slice summary recorded after execution.
- Failure state exposed: any remaining modal interruption that still derails the opening loop or relies on S04 to fix an S02 regression.

## Inputs

- `S02-PLAN.md` - slice must-haves, verification targets, and the R008 boundary.
- T01-T03 outputs - startup shell guardrails, guest-safe login gating, and cleaned completion/lock transitions.
- `src/config/CONTEXT.md` - beta-window warning for safe lock verification.

## Expected Output

- `src/App.mobile-overlay.test.tsx` and `src/hooks/usePuzzleGame.test.ts` - final coverage for the cleaned opening loop.
- Repeatable browser verification notes captured in the task execution summary, including the explicit S04 boundary around premium-desire work.
