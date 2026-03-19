# M001 Requirements Archive

This file captures the final requirement outcome for milestone `M001 - Ship-readiness core loop`.

## Validated

### R001 - Fast desktop-first puzzle entry
- Final status: validated
- Primary owner: `M001/S02`
- Outcome: Desktop startup stays puzzle-first and avoids the low-value auth interruption that previously blocked entry.

### R002 - Core puzzle loop stays uninterrupted by low-value popups
- Final status: validated
- Primary owner: `M001/S02`
- Supporting slices: `M001/S04`
- Outcome: The live loop now favors `puzzle -> optional coach -> review -> next / end state` instead of colliding login/completion surfaces.

### R003 - Coach help feels fast enough to use when stuck
- Final status: validated
- Primary owner: `M001/S01`
- Outcome: Coach Select now has a faster-feeling help path with better loading and transport behavior.

### R004 - Coach screen offers external deep-dive handoff to NotebookLM
- Final status: validated
- Primary owner: `M001/S01`
- Outcome: The external NotebookLM handoff is available from the coach surface as part of the shipped learning flow.

### R005 - Puzzles show what state the Pro is in through the learning flow
- Final status: validated
- Primary owner: `M001/S03`
- Outcome: Representative puzzles now expose the pro-state context through metadata and review-adjacent teaching without a left-side pre-choice panel.

### R006 - Puzzles show what matters in the spot through the learning flow
- Final status: validated
- Primary owner: `M001/S03`
- Outcome: Representative puzzles and review surfaces now clarify the important spot signals through authored data and explanation-led review.

### R007 - Post-choice review teaches short, sharp, transferable lessons
- Final status: validated
- Primary owner: `M001/S03`
- Supporting slices: `M001/S04`
- Outcome: Review stays concise, comparison-first, and explanation-led instead of expanding into redundant lesson wrappers.

### R008 - Free exhaustion state increases desire for Pro instead of creating a dead-end
- Final status: validated
- Primary owner: `M001/S04`
- Supporting slices: `M001/S02`
- Outcome: The loop no longer dead-ends into awkward interruption surfaces, and the end-state framing stays lighter and more intentional.

### R009 - Pro exhaustion state ends lightly and points the player back to real-game practice
- Final status: validated
- Primary owner: `M001/S04`
- Outcome: The ending now closes with a short practice-forward message instead of a heavy modal wall.

### R010 - Selected representative puzzles are upgraded to the new worth-learning standard before ship
- Final status: validated
- Primary owner: `M001/S03`
- Outcome: Representative seeded/authored puzzles now show the richer learning standard in the live catalog.

### R011 - Premium value is communicated through learning depth rather than generic gating
- Final status: validated
- Primary owner: `M001/S04`
- Supporting slices: `M001/S03`
- Outcome: Premium/desire framing was kept tied to learning value, and the beta completion path no longer routes users into unrelated donation behavior.

## Deferred

### R012 - Upgrade the full puzzle catalog to the new standard
- Final status: deferred beyond `M001`

### R013 - Make mobile the primary speed optimization bar
- Final status: deferred beyond `M001`

### R014 - Expand progression and history beyond the current ship pass
- Final status: deferred beyond `M001`

## Out of Scope

### R015 - Rebuild the app around raw NotebookLM as the primary in-app experience
- Final status: out of scope for `M001`

### R016 - Rewrite the full monetization model before ship
- Final status: out of scope for `M001`

### R017 - Enrich every existing puzzle before shipping this milestone
- Final status: out of scope for `M001`

## Final Traceability

| ID | Final status | Primary owner | Supporting | Outcome |
|---|---|---|---|---|
| R001 | validated | M001/S02 | none | shipped |
| R002 | validated | M001/S02 | M001/S04 | shipped |
| R003 | validated | M001/S01 | none | shipped |
| R004 | validated | M001/S01 | none | shipped |
| R005 | validated | M001/S03 | none | shipped |
| R006 | validated | M001/S03 | none | shipped |
| R007 | validated | M001/S03 | M001/S04 | shipped |
| R008 | validated | M001/S04 | M001/S02 | shipped |
| R009 | validated | M001/S04 | none | shipped |
| R010 | validated | M001/S03 | none | shipped |
| R011 | validated | M001/S04 | M001/S03 | shipped |
| R012 | deferred | none | none | not in M001 |
| R013 | deferred | none | none | not in M001 |
| R014 | deferred | none | none | not in M001 |
| R015 | out of scope | none | none | intentionally excluded |
| R016 | out of scope | none | none | intentionally excluded |
| R017 | out of scope | none | none | intentionally excluded |
