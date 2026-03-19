# M002 Closeout

**Milestone:** M002 - Mobile-first support with coach select rescue
**Status:** Closed
**Closed on:** 2026-03-19

## Overview

`M002` moved TFTISEASY from a fragile desktop-squeezed phone experience to a real mobile loop contract. The milestone focused on stabilizing the `phone-landscape` shell, rescuing Coach Select as the highest-value mobile surface, preventing stale or fabricated coach answers, and proving that the assembled `puzzle -> coach -> review -> completion/lock` path felt trustworthy on short landscape screens.

## Delivered Scope

### S01 - Mobile viewport contract and HUD entry
- Established `phone-portrait` as a rotate prompt and `phone-landscape` as the only supported mobile gameplay shell.
- Moved mobile HUD ownership into the viewport layer with explicit coach/augment/menu/return gating.
- Kept fullscreen/settings reachable on mobile without letting viewport chrome fight filtered app-container overlays.

### S02 - Coach Select mobile layout and session continuity
- Rebuilt Coach Select into a mobile command surface with a hero-first layout and horizontally scrollable bottom rail.
- Preserved preview-only coach switching and minimize/reopen session continuity on mobile.
- Kept the mobile coach hierarchy focused on the in-app ask/read flow instead of a crowded secondary CTA stack.

### S03 - Coach context correctness and truthful mobile failure handling
- Widened coach cache and context signatures to the real live question: options, chosen augments, synergies, board champions, items, and authoritative pro choice.
- Cleared stale hidden sessions when context drifted across phase, board, or option changes.
- Normalized empty/error/timeout/partial stream outcomes into one truthful unavailable state across client and edge layers.

### S04 - Mobile interaction performance and full-loop hardening
- Reduced avoidable mobile coach rerenders by stabilizing shell props and memoizing the overlay boundary.
- Pushed review/completion/lock surfaces back onto the shell-provided `layoutMode` contract and hardened short-landscape layouts.
- Closed the assembled mobile loop with focused automation, build proof, and real browser/mobile emulation.

## Verification Evidence

Automated checks completed during `M002` execution included:

- `npm run test -- src/App.mobile-overlay.test.tsx src/components/Game/GameHUD.test.tsx src/components/Settings/SettingsButton.test.tsx`
- `npm run test -- src/features/coach-select/components/CoachSelectOverlay.test.tsx src/features/coach-select/hooks/useCoachSelect.test.tsx`
- `npm run test -- src/features/coach-select/coachSelect.utils.test.ts src/features/coach-select/hooks/useCoachSelect.test.tsx src/features/coach-select/coachSelect.service.test.ts supabase/functions/visian-chat/prompt.test.ts supabase/functions/visian-chat/answer.test.ts`
- `npm run test -- src/features/coach-select/components/CoachSelectOverlay.test.tsx src/components/Arena/DecisionReview.test.tsx src/components/Arena/PuzzleCompletionModal.test.tsx src/features/tcoin/components/PuzzleLockOverlay.test.tsx src/App.mobile-overlay.test.tsx`
- `npm run test -- src/components/Game/GameHUD.test.tsx src/features/coach-select/hooks/useCoachSelect.test.tsx src/hooks/usePuzzleGame.test.ts`
- `npm run build`

Browser/mobile proof recorded during milestone execution included:

- `375x667`: portrait rotate prompt confirmed, with no stray gameplay HUD controls.
- `667x375`: stable `phone-landscape` shell, coach overlay open/swap/minimize/reopen flow confirmed, and no horizontal-scroll dependency.
- `568x320`: short-landscape coach/read/review/lock states remained usable.
- `820x420`: mobile Coach Select rail hierarchy and preview-only switching behavior confirmed.

## Accepted Historical Notes

- `S02` and `S03` advanced by explicit user request before separate browser/runtime verification was written as standalone evidence.
- Final closeout accepts `R024` as an adjusted requirement: the shipped mobile contract removes NotebookLM from `phone-landscape` so the in-app coach flow stays clear and primary, while the deep-dive handoff remains available through the desktop path.
- Post-slice cleanup kept mobile right-rail collisions out of the arena by moving in-arena Ionia/Void indicators to the left rail on `phone-landscape`.

## Deferred Forward Items

- Full-catalog puzzle uplift beyond the current flagship and representative spots.
- Broader mobile speed and interaction polish outside the core coach/mobile loop.
- Progression and history continuity beyond the current ship pass.

## Archive Map

- Roadmap archive: `.gsd/milestones/M002/M002-ROADMAP.md`
- Requirements archive: `.gsd/milestones/M002/M002-REQUIREMENTS.md`
- Audit record: `.gsd/milestones/M002/M002-MILESTONE-AUDIT.md`
- Slice archive: `.gsd/milestones/M002/slices/`

For the next active planning surface, use `.gsd/PROJECT.md`, `.gsd/REQUIREMENTS.md`, and `.gsd/STATE.md`.
