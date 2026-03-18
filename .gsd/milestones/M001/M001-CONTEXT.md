# M001: Ship-readiness core loop

**Gathered:** 2026-03-18
**Status:** Ready for planning

## Project Description

This milestone is a ship-readiness pass for the existing TFTISEASY product. The app already has puzzle gameplay, coach help, review surfaces, IQ/progression, Pro packaging, and puzzle authoring. What is missing is the feeling that the core loop is truly ready to ship for serious TFT VN players: load in fast, solve a real spot, ask coach when stuck, understand what the Pro saw, then move on with sharper judgment and a stronger desire to join Pro.

The user’s framing is not “make the app prettier.” The framing is: help serious Gold+ players gain “kiến thức” and “free LP”, make coach stop feeling slower than raw NotebookLM, stop low-value popup interruptions, and make puzzles feel like more than “chỉ chọn lõi suông”.

## Why This Milestone

The product is already near ship, so the biggest remaining risk is not missing surface area — it is whether the current experience actually feels worth using and worth paying for. Right now startup latency, coach slowness, dead-end popup states, and thin puzzle teaching density all weaken the core promise. This milestone exists to make the live loop feel tight enough that users can trust the product and start wanting Pro for deeper understanding instead of feeling gated for no reason.

## User-Visible Outcome

### When this milestone is complete, the user can:

- Open the app on desktop, hit a playable puzzle quickly, ask coach only when they get stuck, finish the spot, read a short but sharp Pro explanation, and move straight to the next puzzle.
- Hit the Coach Select screen, get an answer fast enough to feel usable, and hand off to “Hỏi sâu hơn với NotebookLM đã tổng hợp hàng trăm tài liệu + góc nhìn Pro.” when they want a deeper dive.
- Reach a free or Pro exhaustion state without the app killing the mood: free gets a tasteful Pro tease, Pro gets a light “vào game luyện tập” finish.

### Entry point / environment

- Entry point: `training.tftiseasy.com` puzzle screen / main web app
- Environment: browser, with desktop as the primary speed bar for this ship pass
- Live dependencies involved: Supabase auth/data, Supabase Edge Functions, NotebookLM bridge, external NotebookLM handoff

## Completion Class

- Contract complete means: requirements are mapped to real slices, startup/coach/review/exhaustion surfaces exist in code, and relevant tests/build checks pass.
- Integration complete means: the browser puzzle loop, coach transport path, and external NotebookLM handoff all work together across live frontend, edge function, and bridge boundaries.
- Operational complete means: the desktop build shows materially better startup behavior and the coach flow remains usable under real request latency, not just mocked fixtures.

## Final Integrated Acceptance

To call this milestone complete, we must prove:

- A serious Gold+ TFT VN player can open the desktop app, reach a real puzzle quickly, complete the loop through review, and move to the next puzzle without low-value popup derailments.
- The same player can open Coach Select when stuck, receive a coach answer through the live browser → edge function → bridge path, and choose the external NotebookLM deep-dive handoff from the coach screen.
- A free user who runs out of puzzle access sees a Pro tease that increases desire, while a Pro user who runs out of puzzles gets a light “lý thuyết đủ rồi, vào game thực hành đi” ending.

## Risks and Unknowns

- Coach latency may be dominated by transport and UI orchestration overhead rather than NotebookLM itself — if this is not retired early, the highest-value learning surface still feels broken.
- Puzzle metadata is richer than the live UX but may not be authored consistently enough across the catalog — if the upgraded puzzles still feel thin, Pro value will not land.
- Popup cleanup could accidentally remove monetization pressure instead of converting it into desire — if endings go flat, Pro feels less compelling rather than more.
- Startup optimization can improve metrics without improving feel — if the puzzle-ready state still feels visually incomplete or noisy, the work will miss the real user complaint.

## Existing Codebase / Prior Art

- `src/App.tsx` — main runtime shell, modal gating, puzzle view/library view, coach FAB entry, lock overlays, and completion modal orchestration.
- `src/features/coach-select/*` — Coach Select overlay, response flow, caching, and request orchestration.
- `supabase/functions/visian-chat/index.ts` — edge adapter between the browser contract and the NotebookLM bridge.
- `services/notebooklm_bridge/*` — hosted NotebookLM transport that already exposes one-shot and streaming paths.
- `src/components/Arena/DecisionReview.tsx` — existing review surface, explanation area, and video/library actions.
- `src/services/puzzleService.ts` — puzzle metadata mapping; already exposes fields such as `proLpRank`, `tournamentName`, `lobbyHealth`, `difficulty`, `boardStrength`, `hpPressure`, `rollState`, `proReasoningIntent`, and `planReasoning`.
- `src/pages/Admin/PuzzleBuilder/tabs/MetaTab.tsx` — current authoring surface for puzzle metadata that this milestone can elevate into a stronger content standard.
- `src/components/Auth/LoginModal.tsx`, `src/features/tcoin/components/PuzzleLockOverlay.tsx`, `src/components/Arena/PuzzleCompletionModal.tsx` — the current popup/exhaustion surfaces the user called out.

> See `.gsd/DECISIONS.md` for all architectural and pattern decisions — it is an append-only register; read it during planning, append to it during execution.

## Relevant Requirements

- R001 — Improve desktop-first puzzle entry speed.
- R002 — Keep the core loop free from low-value popup interruptions.
- R003 — Make coach feel fast enough to use when stuck.
- R004 — Add the external NotebookLM deep-dive handoff in Coach Select.
- R005 — Show what state the Pro is in before the choice.
- R006 — Show what matters in the spot before the choice.
- R007 — Make post-choice review short, sharp, and transferable.
- R008 — Turn free exhaustion into Pro desire.
- R009 — Make Pro exhaustion feel light and practice-oriented.
- R010 — Upgrade representative puzzles to the new worth-learning standard.
- R011 — Communicate premium value through learning depth, not generic gating.

## Scope

### In Scope

- Desktop startup feel and Pagespeed-oriented puzzle entry improvements.
- Coach speed work across the current transport path and coach UI states.
- External NotebookLM deep-dive handoff from the Coach Select screen.
- Popup cleanup for the most annoying login/completion/exhaustion interruptions.
- A stronger worth-learning puzzle presentation standard built on existing metadata.
- Short, sharp, transferable review framing.
- Upgrading a selected set of representative puzzles before ship.
- Free/Pro exhaustion-state UX that sells learning value instead of causing irritation.

### Out of Scope / Non-Goals

- Rebuilding the product around raw NotebookLM inside the app.
- Rewriting the full monetization or entitlement model before ship.
- Upgrading the entire existing puzzle catalog in this milestone.
- Making mobile the primary performance bar for this ship pass.
- Broad progression/history expansion beyond what already exists.

## Technical Constraints

- Keep the current browser → `visian-chat` → NotebookLM bridge contract intact; improve it instead of inventing a parallel coach stack.
- Preserve the product identity as a curated puzzle trainer; NotebookLM is a deep-dive escalation path, not the app’s replacement UI.
- Prefer surfacing existing puzzle metadata before adding new schema or building a new content system.
- The user’s speed bar for this milestone is desktop, so verification should prioritize desktop browser behavior and Pagespeed posture.
- Popup cleanup must preserve the moments that increase desire for Pro instead of flattening all monetization pressure.

## Integration Points

- Browser runtime in `src/App.tsx` — startup, modal gating, puzzle loop transitions, and coach entry.
- `src/features/coach-select/*` — coach UI, handoff CTA, request states, and cache behavior.
- `src/lib/visianChat.ts` — shared request URL/headers for coach traffic.
- `supabase/functions/visian-chat/` — edge-layer request handling and bridge forwarding.
- `services/notebooklm_bridge/` — live NotebookLM transport, timeout handling, and request instrumentation.
- `src/components/Arena/DecisionReview.tsx` and related subcomponents — review teaching density, puzzle context, and premium cues.
- `src/pages/Admin/PuzzleBuilder/*` — representative puzzle upgrades and authoring standard enforcement.

## Open Questions

- How many representative puzzles should be upgraded before ship — current thinking: decide during slice planning based on authoring cost, QA time, and how many examples are needed to make the new standard visible.
- What coach latency budget is realistic end-to-end after cleanup — current thinking: anything that still feels slower than raw NotebookLM is a failure, and ~10s remains clearly unacceptable.
- Which existing metadata fields deserve top billing in the pre-choice puzzle context — current thinking: prioritize “Pro đang ở thế nào” and “điều gì đang nhìn trong spot này” over decorative metadata.
