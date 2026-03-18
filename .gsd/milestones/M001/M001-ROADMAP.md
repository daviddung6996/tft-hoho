# M001: Ship-readiness core loop

**Vision:** Make the existing TFTISEASY loop feel shippable for serious Gold+ TFT VN players: fast desktop puzzle entry, faster coach help, richer puzzle context, short sharp Pro review, and a stronger desire to join Pro.

## Success Criteria

- A desktop user reaches a playable puzzle quickly and can move through puzzle → optional coach → review → next puzzle without low-value modal interruptions.
- Coach Select returns an answer fast enough to feel usable when the user is stuck and exposes the external NotebookLM deep-dive handoff from the coach screen.
- Selected representative puzzles clearly show what state the Pro is in, what matters in the spot, and end with a short, sharp, transferable lesson instead of feeling like “chỉ chọn lõi suông”.
- Free exhaustion states increase desire for Pro, while Pro exhaustion states end lightly and point the player back to real-game practice.

## Key Risks / Unknowns

- Coach latency may be dominated by browser/edge/bridge overhead rather than NotebookLM itself — if this is not retired early, the flagship help surface still feels broken.
- Existing puzzle metadata is richer than the live UX but may still be inconsistently authored or surfaced — if selected puzzles remain thin, premium value will not land.
- Popup cleanup could remove friction without increasing desire — if exhaustion/login states become flat rather than persuasive, Pro feels weaker.
- Startup optimization can improve metrics without improving feel — if the puzzle-ready state still feels noisy or incomplete, the user complaint remains.

## Proof Strategy

- Coach latency and handoff risk → retire in S01 by proving the live Coach Select screen can ask coach, surface a faster-feeling response path, and hand off to the external NotebookLM deep dive.
- Startup and popup friction risk → retire in S02 by proving the desktop build reaches a playable puzzle faster and no longer gets derailed by the low-value login/completion interruption states.
- Thin puzzle value risk → retire in S03 by proving selected real puzzles now show Pro state, what matters in the spot, and a short transferable review using real authored metadata.
- Assembled-loop risk → retire in S04 by proving the full desktop loop, coach handoff, upgraded puzzle value, and free/Pro exhaustion states work together end-to-end in a real browser session.

## Verification Classes

- Contract verification: targeted tests, build checks, artifact checks on coach/review/exhaustion surfaces, and boundary-map wiring inspection.
- Integration verification: real browser exercise of browser → edge function → NotebookLM bridge coaching, plus puzzle → review → next and free/Pro exhaustion paths.
- Operational verification: production-like desktop build verification for startup feel / Pagespeed posture and coach response timing under real requests.
- UAT / human verification: confirm the upgraded puzzles feel worth learning, the coach handoff promise lands, and the Pro tease increases desire instead of annoyance.

## Milestone Definition of Done

This milestone is complete only when all are true:

- All slice deliverables are complete and grounded in the existing runtime rather than parallel prototype paths.
- Startup, coach, review, and exhaustion-state surfaces are actually wired together in the live desktop loop.
- The real entrypoint exists and is exercised: open app → puzzle → optional coach → review → next / exhaustion.
- Success criteria are re-checked against live browser behavior, not just code artifacts or mocked tests.
- Final integrated acceptance scenarios pass, including the external NotebookLM handoff from Coach Select.

## Requirement Coverage

- Covers: R001, R002, R003, R004, R005, R006, R007, R008, R009, R010, R011
- Partially covers: none
- Leaves for later: R012, R013, R014
- Orphan risks: none

## Slices

- [ ] **S01: Coach speed and NotebookLM deep-dive handoff** `risk:high` `depends:[]`
  > After this: from the live Coach Select screen, the user can ask coach, get a materially faster-feeling response path, and jump out to the external NotebookLM deep dive.

- [ ] **S02: Fast puzzle entry and interruption cleanup** `risk:high` `depends:[]`
  > After this: desktop users reach a playable puzzle faster and the opening loop no longer gets derailed by the low-value login/completion popup states.

- [ ] **S03: Worth-learning puzzle standard and flagship puzzle upgrades** `risk:medium` `depends:[S02]`
  > After this: a selected set of real puzzles surfaces Pro state, what matters in the spot, and a short, sharp, transferable review instead of feeling like “chọn lõi suông”.

- [ ] **S04: Premium desire, exhaustion states, and final loop integration** `risk:medium` `depends:[S01,S03]`
  > After this: the full desktop loop is exercised end-to-end with correct free/pro endings, stronger desire to join Pro, and the coach + review stack working together in one shippable experience.

## Boundary Map

### S01 → S04

Produces:
- Coach Select CTA and copy for the external deep-dive handoff: `Hỏi sâu hơn với NotebookLM đã tổng hợp hàng trăm tài liệu + góc nhìn Pro.`
- Stable coach session states in `useCoachSelect` / `coachSelect.service`: ask, loading, unavailable, complete, and external handoff.
- A measured live request path across browser → `visian-chat` → NotebookLM bridge that downstream slices can rely on for help-on-demand coaching.

Consumes:
- Existing `visian-chat` edge contract and NotebookLM bridge `/ask` / `/ask-stream` behavior.

### S02 → S03

Produces:
- Desktop startup budget and puzzle-ready loading behavior in `src/App.tsx`.
- Modal and popup rules for login, lock, and completion states that preserve the puzzle-first flow.
- A cleaned first-session and repeat-session entry path into the live puzzle view.

Consumes:
- nothing (runs independently of S01)

### S03 → S04

Produces:
- A “worth-learning puzzle” presentation standard built from existing puzzle metadata such as `proLpRank`, `tournamentName`, `lobbyHealth`, `difficulty`, `boardStrength`, `hpPressure`, `rollState`, `proReasoningIntent`, and `planReasoning`.
- An upgraded review surface that states what the Pro was in, what matters in the spot, and a short transferable lesson.
- A selected set of representative puzzles authored to the new standard.

Consumes from S02:
- The cleaned puzzle entry flow and reduced popup friction that make the richer puzzle surfaces feel worth reaching.

### S01 + S03 → S04

Produces:
- An integrated coach + review premium value proposition that can be used in free/pro exhaustion states without feeling generic.

Consumes from S01:
- Coach speed improvements and the external NotebookLM handoff entry.

Consumes from S03:
- Richer puzzle context and sharper post-choice lessons.
