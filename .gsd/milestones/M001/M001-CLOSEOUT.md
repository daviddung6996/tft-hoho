# M001 Closeout

**Milestone:** M001 - Ship-readiness core loop
**Status:** Closed
**Closed on:** 2026-03-19

## Overview

`M001` shipped the core loop cleanup needed to make TFTISEASY feel usable as a real desktop-first beta product. The milestone focused on getting the player into a puzzle faster, making coach help feel more viable, upgrading representative puzzles to a higher teaching standard, and keeping the end-of-run flow from collapsing into annoying login, paywall, or completion interruptions.

## Delivered Scope

### S01 - Coach speed and NotebookLM deep-dive handoff
- Improved Coach Select responsiveness and loading-state behavior.
- Added a stable external NotebookLM handoff from the coach surface.
- Hardened the `visian-chat` transport so frontend coach answers arrive in the expected format.

### S02 - Fast puzzle entry and interruption cleanup
- Removed low-value startup login interruption from the default desktop path.
- Preserved guest-first puzzle entry and cleaned the completion/lock state handoff.
- Consolidated end-of-run state so the shell does not fight itself over completion UI.

### S03 - Worth-learning puzzle standard and flagship puzzle upgrades
- Expanded representative puzzle metadata and authoring support.
- Kept review concise and explanation-led instead of forcing redundant synthesized lesson copy.
- Upgraded seeded representative puzzles so the higher-value teaching standard is visible in the real catalog.

### S04 - Premium desire, exhaustion states, and final loop integration
- Prevented review and completion surfaces from stacking on top of each other.
- Simplified the beta completion ending to a light "go practice in game" message.
- Removed the accidental support/donation route from the beta completion path.
- Confirmed the integrated browser loop felt smooth end to end.

## Verification Evidence

Automated checks completed during `M001` execution included:

- `npm run test -- src/features/coach-select/coachSelect.service.test.ts src/features/coach-select/hooks/useCoachSelect.test.tsx src/features/coach-select/components/CoachSelectOverlay.test.tsx src/features/coach-select/components/CoachSelectOverlay.bugfix.test.tsx scripts/local_visian_chat_logging.test.ts`
- `npm run test -- src/App.mobile-overlay.test.tsx`
- `npm run test -- src/hooks/usePuzzleGame.test.ts`
- `npm run test -- src/hooks/usePuzzleToPlayers.test.ts`
- `npm run test -- src/components/Arena/DecisionReview.test.tsx`
- `npm run test -- src/config/monetization.test.ts`
- `npm run build`

Human acceptance recorded during milestone execution:

- `S01` browser/local-stack verification passed before the slice was closed.
- `S03` was simplified after user feedback and then closed by user override after code plus automated verification.
- `S04` was closed after the user confirmed the integrated browser/UAT loop felt smooth.

## Accepted Historical Notes

- `S02` advanced to the next slice by explicit user request before its separate browser/runtime verification pass was recorded as standalone evidence.
- `S03` also advanced by explicit user override after code plus automation were accepted as sufficient for milestone routing.
- `M001` closeout treats those as accepted historical decisions rather than open blockers because the final integrated loop was later accepted by the user.

## Deferred Forward Items

- Full-catalog puzzle uplift beyond the representative puzzles completed in `M001`.
- Mobile-first performance as the primary optimization bar.
- Broader progression and history surfaces beyond the current ship-readiness pass.

## Archive Map

- Roadmap archive: `.gsd/milestones/M001/M001-ROADMAP.md`
- Requirements archive: `.gsd/milestones/M001/M001-REQUIREMENTS.md`
- Audit record: `.gsd/milestones/M001/M001-MILESTONE-AUDIT.md`
- Context archive: `.gsd/milestones/M001/M001-CONTEXT.md`

For the next active planning surface, use `.gsd/PROJECT.md`, `.gsd/REQUIREMENTS.md`, and `.gsd/STATE.md`.
