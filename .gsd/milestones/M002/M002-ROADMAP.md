# M002: Mobile-first support with coach select rescue

**Vision:** Make TFTISEASY feel usable in the real mobile TFT VN context by turning the phone experience from fragile overlay clutter into a stable puzzle -> optional coach -> review loop, with Coach Select rescued as the highest-value mobile surface.

## Success Criteria

- A phone user can open the live app, reach a real puzzle, and stay inside a stable playable viewport without clipped primary actions or layout breakage.
- The mobile HUD keeps the right controls reachable at the right time so the user does not lose board context just to ask coach or continue the loop.
- Coach Select on mobile becomes readable and tappable enough that a stuck player will actually use it instead of abandoning the surface.
- The mobile coach session survives real usage patterns such as minimize, reopen, and coach swapping without stale or misleading answers.
- Mobile coach failures remain truthful and the external NotebookLM deep-dive handoff stays accessible.
- The full mobile loop feels responsive enough to trust during real decision-making, especially around coach transitions.

## Key Risks / Unknowns

- The mobile breakage may come from shell layering and viewport contracts in `src/App.tsx`, not just from the Coach Select component subtree.
- Coach rescue can look visually improved while still reusing stale responses if context invalidation is not tightened across mobile flows.
- Mobile lag may be dominated by rerenders in the carousel, portrait, and stat-bar subtrees rather than by network transport alone.
- The NotebookLM handoff can silently regress on mobile if the CTA remains present in code but becomes hidden, crowded, or hard to tap.

## Proof Strategy

- Mobile shell risk -> retire in `S01` by proving the phone viewport, HUD actions, and overlay entry points remain stable in the live puzzle shell.
- Coach layout risk -> retire in `S02` by proving Coach Select is usable on small screens and preserves session continuity through minimize/reopen flows.
- Stale-answer and failure-truthfulness risk -> retire in `S03` by proving the mobile coach flow respects live decision context and shows honest unavailable handling when transport fails.
- Responsiveness and assembled-loop risk -> retire in `S04` by proving the real mobile loop feels smooth across puzzle -> coach -> review -> exhaustion transitions.

## Verification Classes

- Contract verification: targeted tests around mobile viewport behavior, coach session continuity, invalidation, and unavailable states.
- Integration verification: real browser/mobile emulation exercise of puzzle -> coach -> review flow plus mobile NotebookLM handoff behavior.
- Operational verification: performance-focused checks on mobile interaction feel, including open/swap/minimize/reopen transitions in the coach surface.
- UAT / human verification: confirm the rescued mobile coach flow feels worth using when the player is stuck instead of feeling like a broken desktop screen squeezed onto a phone.

## Milestone Definition of Done

This milestone is complete only when all are true:

- The live phone-sized puzzle shell remains usable without hidden or clipped primary controls.
- Coach Select is meaningfully rescued on mobile, not just visually compressed.
- Mobile coach answers remain tied to the live decision context and do not leak stale sessions across puzzle phases.
- Honest failure handling and the NotebookLM deep-dive handoff both work from the mobile coach surface.
- The assembled mobile loop is accepted through real browser/UAT behavior, not only static layout inspection.

## Requirement Coverage

- Covers: R018, R019, R020, R021, R022, R023, R024, R025, R026
- Partially covers: none
- Leaves for later: C001, C003
- Orphan risks: none

## Slices

- [x] **S01: Mobile viewport contract and HUD entry** `risk:high` `depends:[]`
  > After this: a phone user can open the live puzzle shell and still reach a stable board, core HUD actions, and overlay entry points without immediate layout failure.

- [x] **S02: Coach Select mobile layout and session continuity** `risk:high` `depends:[S01]`
  > After this: Coach Select is readable on small screens, keeps the important context visible, and survives minimize/reopen usage without dropping the active session.

- [x] **S03: Coach context correctness and truthful mobile failure handling** `risk:high` `depends:[S02]`
  > After this: mobile coach answers stay aligned to the live decision context, stale reuse is blocked, and failure states remain honest while the deep-dive handoff still works.

- [x] **S04: Mobile interaction performance and full-loop hardening** `risk:medium` `depends:[S01,S02,S03]`
  > After this: the mobile puzzle -> coach -> review -> exhaustion loop feels responsive enough to trust and is verified end to end in a real browser session.

## Boundary Map

### S01 -> S02

Produces:
- A mobile viewport/HUD contract in the live shell that downstream coach work can rely on.
- Stable overlay entry points for coach, review, and related puzzle actions.
- A verified baseline for what "usable on phone" means in the current runtime.

Consumes:
- Existing `src/App.tsx` shell orchestration and current viewport utility controls.

### S02 -> S03

Produces:
- A mobile-readable Coach Select composition with usable hierarchy, CTA placement, and context density.
- Session continuity rules for minimize/reopen and coach switching on phone-sized screens.
- A preserved mobile NotebookLM handoff entry point from the coach surface.

Consumes from S01:
- The stabilized mobile shell and HUD entry contract.

### S03 -> S04

Produces:
- Tightened invalidation and cache rules so mobile coach answers cannot leak across puzzle phases or decision contexts.
- A truthful unavailable path that does not fabricate coach advice when transport fails.
- A coach surface contract that downstream performance hardening can optimize without changing product meaning.

Consumes from S02:
- The rescued mobile coach layout and session behavior.

### S01 + S02 + S03 -> S04

Produces:
- A complete mobile loop standard for TFTISEASY: playable viewport, usable coach, truthful state handling, and acceptable interaction feel.

Consumes from S01:
- Mobile shell stability and HUD reachability.

Consumes from S02:
- Usable Coach Select layout and session continuity.

Consumes from S03:
- Context-correct answers and honest failure handling.
