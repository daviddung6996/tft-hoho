# M002 Requirements Archive

This file captures the final requirement outcome for milestone `M002 - Mobile-first support with coach select rescue`.

## Validated

### R018 - User can open the live puzzle flow on a phone-sized screen and immediately reach a stable playable viewport
- Final status: validated
- Primary owner: `M002/S01`
- Outcome: Phone portrait now routes to a rotate prompt, while `phone-landscape` consistently enters a stable playable shell without clipped primary actions or viewport breakage.

### R019 - User can reach core mobile HUD actions without losing board context
- Final status: validated
- Primary owner: `M002/S01`
- Supporting slices: `M002/S04`
- Outcome: Coach entry, augment entry, board return, fullscreen, and settings are now explicitly gated through the viewport shell instead of fighting overlay stacking.

### R020 - User can move through puzzle, coach, review, and exhaustion states on mobile without stacked modal collisions or dead-end transitions
- Final status: validated
- Primary owner: `M002/S04`
- Supporting slices: `M002/S01`, `M002/S02`, `M002/S03`
- Outcome: The assembled `puzzle -> coach -> review -> completion/lock` loop now follows one mobile shell contract and no longer relies on drifting overlay heuristics.

### R021 - User can open Coach Select on mobile in a layout that keeps coach identity, current decision context, and the primary action readable
- Final status: validated
- Primary owner: `M002/S02`
- Outcome: Coach Select now uses a readable mobile-first command bar, hero-first surface, and horizontally scrollable rail instead of a compressed desktop slab.

### R022 - User can switch coaches, ask for help, minimize, and reopen Coach Select on mobile without losing the active session
- Final status: validated
- Primary owner: `M002/S02`
- Supporting slices: `M002/S03`
- Outcome: Mobile coach flows preserve the active session when context is still valid and reset safely when the live question changes.

### R023 - User never receives stale coach analysis when the puzzle phase, decision type, or option context changes
- Final status: validated
- Primary owner: `M002/S03`
- Outcome: Coach cache keys and hidden session reuse now follow the real live question instead of reusing shallow puzzle/coach identity hits.

### R025 - User sees an honest unavailable state when coach transport fails on mobile
- Final status: validated
- Primary owner: `M002/S03`
- Supporting slices: `M002/S02`
- Outcome: Empty/error/timeout/partial stream failure paths now land on one truthful unavailable contract instead of fabricating or preserving fake success state.

### R026 - User can use the mobile coach flow without obvious lag during open, swap, ask, minimize, and reopen transitions
- Final status: validated
- Primary owner: `M002/S04`
- Outcome: Coach overlay prop churn was reduced, the overlay boundary was memoized meaningfully, and the short-landscape assembled loop was verified in automation plus browser emulation.

## Adjusted

### R024 - User can launch the external NotebookLM deep-dive from the mobile coach surface without the CTA becoming hidden or awkward to tap
- Final status: adjusted
- Primary owner: `M002/S02`
- Supporting slices: `M002/S03`
- Outcome: The final accepted product contract keeps NotebookLM handoff available on desktop, but removes it from `phone-landscape` so the mobile coach surface stays focused on the in-app ask/read flow and truthful unavailable handling.

## Deferred

### C001 - Upgrade the full puzzle catalog to the worth-learning standard
- Final status: deferred beyond `M002`

### C002 - Make mobile the primary speed optimization bar
- Final status: deferred beyond `M002`

### C003 - Expand progression and history beyond the current ship pass
- Final status: deferred beyond `M002`

## Out of Scope

### O001 - Rebuild the app around NotebookLM as the primary in-app UI
- Final status: out of scope for `M002`

### O002 - Upgrade the full puzzle catalog during the same mobile rescue pass
- Final status: out of scope for `M002`

### O003 - Build progression/history expansion into the mobile rescue milestone
- Final status: out of scope for `M002`

## Final Traceability

| ID | Final status | Primary owner | Supporting | Outcome |
|---|---|---|---|---|
| R018 | validated | M002/S01 | none | shipped |
| R019 | validated | M002/S01 | M002/S04 | shipped |
| R020 | validated | M002/S04 | M002/S01, M002/S02, M002/S03 | shipped |
| R021 | validated | M002/S02 | none | shipped |
| R022 | validated | M002/S02 | M002/S03 | shipped |
| R023 | validated | M002/S03 | none | shipped |
| R024 | adjusted | M002/S02 | M002/S03 | accepted product adjustment |
| R025 | validated | M002/S03 | M002/S02 | shipped |
| R026 | validated | M002/S04 | none | shipped |
| C001 | deferred | none | none | not in M002 |
| C002 | deferred | none | none | not in M002 |
| C003 | deferred | none | none | not in M002 |
| O001 | out of scope | none | none | intentionally excluded |
| O002 | out of scope | none | none | intentionally excluded |
| O003 | out of scope | none | none | intentionally excluded |
