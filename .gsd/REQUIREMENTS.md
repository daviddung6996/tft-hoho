# Requirements

This file is the explicit capability and coverage contract for the project.

Use it to track what is actively in scope, what has been validated by completed work, what is intentionally deferred, and what is explicitly out of scope.

Guidelines:
- Keep requirements capability-oriented, not a giant feature wishlist.
- Requirements should be atomic, testable, and stated in plain language.
- Every **Active** requirement should be mapped to a slice, deferred, blocked with reason, or moved out of scope.
- Each requirement should have one accountable primary owner and may have supporting slices.
- Research may suggest requirements, but research does not silently make them binding.
- Validation means the requirement was actually proven by completed work and verification, not just discussed.

## Active

### R001 — Fast desktop-first puzzle entry
- Class: quality-attribute
- Status: active
- Description: On desktop, the app reaches a playable puzzle quickly and maintains a strong startup/pagespeed posture.
- Why it matters: First impression is part of product quality here; if entry feels slow, the user loses trust before learning starts.
- Source: user
- Primary owning slice: M001/S02
- Supporting slices: none
- Validation: mapped
- Notes: Desktop is the primary speed bar for this ship pass; mobile optimization can follow later.

### R002 — Core puzzle loop stays uninterrupted by low-value popups
- Class: primary-user-loop
- Status: active
- Description: The core loop stays clean: open app → puzzle → optional coach → review → next puzzle, without dead-end login/completion interruptions.
- Why it matters: The product promise depends on momentum; popup friction makes the app feel annoying instead of useful.
- Source: user
- Primary owning slice: M001/S02
- Supporting slices: M001/S04
- Validation: mapped
- Notes: The user explicitly called out the login and exhaustion popup states as current pain points.

### R003 — Coach help feels fast enough to use when stuck
- Class: quality-attribute
- Status: active
- Description: Coach answers feel fast enough that a serious player will actually use coach help mid-session when they are stuck.
- Why it matters: Coach is one of the highest-value learning surfaces; if it feels slow, the feature loses credibility.
- Source: user
- Primary owning slice: M001/S01
- Supporting slices: none
- Validation: mapped
- Notes: Anything that still feels like the app is slower than raw NotebookLM undermines this requirement.

### R004 — Coach screen offers external deep-dive handoff to NotebookLM
- Class: differentiator
- Status: active
- Description: The Coach Select screen includes a handoff to “Hỏi sâu hơn với NotebookLM đã tổng hợp hàng trăm tài liệu + góc nhìn Pro.”
- Why it matters: This gives users a deeper learning path and doubles as marketing for the product’s knowledge depth.
- Source: user
- Primary owning slice: M001/S01
- Supporting slices: none
- Validation: mapped
- Notes: This is an external handoff, not a product rewrite around raw NotebookLM inside the app.

### R005 — Puzzles show what state the Pro is in before the choice
- Class: core-capability
- Status: active
- Description: Before the player chooses, a worth-learning puzzle shows what state the Pro is in so the spot has real context.
- Why it matters: Without this, the puzzle feels like “chỉ chọn lõi suông” instead of decision training.
- Source: user
- Primary owning slice: M001/S03
- Supporting slices: none
- Validation: mapped
- Notes: Existing puzzle metadata already contains more of this than the live UX currently surfaces.

### R006 — Puzzles show what matters in the spot before the choice
- Class: core-capability
- Status: active
- Description: Before the player chooses, the puzzle makes clear what signals matter in this spot.
- Why it matters: The user is paying for decision understanding, not trivia about a one-off answer.
- Source: user
- Primary owning slice: M001/S03
- Supporting slices: none
- Validation: mapped
- Notes: The important teaching frame is “điều gì đang nhìn trong spot này”.

### R007 — Post-choice review teaches short, sharp, transferable lessons
- Class: primary-user-loop
- Status: active
- Description: After the choice, the review stays short but sharp and teaches something the player can apply in future games.
- Why it matters: The product promise is situational knowledge plus transferable knowledge, not long essays.
- Source: user
- Primary owning slice: M001/S03
- Supporting slices: M001/S04
- Validation: mapped
- Notes: The review should answer why this pick made sense and what to notice in similar spots later.

### R008 — Free exhaustion state increases desire for Pro instead of creating a dead-end
- Class: launchability
- Status: active
- Description: When a free user runs out of puzzle access, the app teases Pro in a way that increases desire instead of feeling like a hard stop.
- Why it matters: The monetization moment should convert interest, not create annoyance.
- Source: user
- Primary owning slice: M001/S04
- Supporting slices: M001/S02
- Validation: mapped
- Notes: Acceptable interruption is the one that makes the user want Pro more.

### R009 — Pro exhaustion state ends lightly and points the player back to real-game practice
- Class: continuity
- Status: active
- Description: When a Pro user runs out of puzzles, the app ends lightly and nudges them back into real ranked practice instead of feeling empty or punitive.
- Why it matters: The user should leave with momentum, not with the feeling that the app just ran out of content.
- Source: user
- Primary owning slice: M001/S04
- Supporting slices: none
- Validation: mapped
- Notes: The target tone is “hết puzzle rồi, vào game luyện tập” rather than a heavy modal wall.

### R010 — Selected representative puzzles are upgraded to the new worth-learning standard before ship
- Class: admin/support
- Status: active
- Description: A selected set of representative puzzles is upgraded before ship so the new learning standard is visible in the real catalog.
- Why it matters: The milestone only counts if users can actually encounter the improved experience, not just the framework for it.
- Source: user
- Primary owning slice: M001/S03
- Supporting slices: none
- Validation: mapped
- Notes: This is intentionally not a full-catalog pass.

### R011 — Premium value is communicated through learning depth rather than generic gating
- Class: differentiator
- Status: active
- Description: The product communicates Pro value through sharper understanding and better learning density, not by randomly blocking the user.
- Why it matters: The user wants people to want Pro because it feels useful for climbing, not because the app is annoying.
- Source: inferred
- Primary owning slice: M001/S04
- Supporting slices: M001/S03
- Validation: mapped
- Notes: This is where “kiến thức” and “free LP” should become a visible product promise.

## Validated

None yet.

## Deferred

### R012 — Upgrade the full puzzle catalog to the new standard
- Class: admin/support
- Status: deferred
- Description: Bring the entire existing puzzle catalog up to the richer worth-learning standard.
- Why it matters: Long term, the premium promise needs consistency across the full catalog.
- Source: user
- Primary owning slice: none
- Supporting slices: none
- Validation: unmapped
- Notes: Deferred because the current ship pass should upgrade selected representative puzzles first.

### R013 — Make mobile the primary speed optimization bar
- Class: quality-attribute
- Status: deferred
- Description: Treat mobile web as the primary performance and feel target instead of desktop.
- Why it matters: The wider TFT VN market is mobile-heavy even if this ship pass is desktop-first.
- Source: user
- Primary owning slice: none
- Supporting slices: none
- Validation: unmapped
- Notes: Deferred because the user chose desktop as the current ship bar.

### R014 — Expand progression and history beyond the current ship pass
- Class: continuity
- Status: deferred
- Description: Add broader progress continuity features beyond the current IQ/review/library surfaces.
- Why it matters: Longer-term retention may need deeper continuity than this milestone covers.
- Source: inferred
- Primary owning slice: none
- Supporting slices: none
- Validation: unmapped
- Notes: Useful later, but outside the immediate ship-readiness pass.

## Out of Scope

### R015 — Rebuild the app around raw NotebookLM as the primary in-app experience
- Class: anti-feature
- Status: out-of-scope
- Description: Turn the product into a thin wrapper around raw NotebookLM instead of a curated puzzle-training app.
- Why it matters: This prevents the deep-dive handoff from eroding the core product identity.
- Source: user
- Primary owning slice: none
- Supporting slices: none
- Validation: n/a
- Notes: NotebookLM remains a handoff and coach backend, not the product itself.

### R016 — Rewrite the full monetization model before ship
- Class: constraint
- Status: out-of-scope
- Description: Redesign the whole monetization system, entitlement model, or economy before this launch pass.
- Why it matters: Keeps the milestone focused on making the current Pro desire understandable and useful.
- Source: inferred
- Primary owning slice: none
- Supporting slices: none
- Validation: n/a
- Notes: This milestone is about value communication and endings, not a full business-model redesign.

### R017 — Enrich every existing puzzle before shipping this milestone
- Class: constraint
- Status: out-of-scope
- Description: Require a full-catalog content uplift before the milestone can ship.
- Why it matters: Prevents the project from turning a ship pass into an open-ended content marathon.
- Source: user
- Primary owning slice: none
- Supporting slices: none
- Validation: n/a
- Notes: Selected representative puzzles are enough for this milestone.

## Traceability

| ID | Class | Status | Primary owner | Supporting | Proof |
|---|---|---|---|---|---|
| R001 | quality-attribute | active | M001/S02 | none | mapped |
| R002 | primary-user-loop | active | M001/S02 | M001/S04 | mapped |
| R003 | quality-attribute | active | M001/S01 | none | mapped |
| R004 | differentiator | active | M001/S01 | none | mapped |
| R005 | core-capability | active | M001/S03 | none | mapped |
| R006 | core-capability | active | M001/S03 | none | mapped |
| R007 | primary-user-loop | active | M001/S03 | M001/S04 | mapped |
| R008 | launchability | active | M001/S04 | M001/S02 | mapped |
| R009 | continuity | active | M001/S04 | none | mapped |
| R010 | admin/support | active | M001/S03 | none | mapped |
| R011 | differentiator | active | M001/S04 | M001/S03 | mapped |
| R012 | admin/support | deferred | none | none | unmapped |
| R013 | quality-attribute | deferred | none | none | unmapped |
| R014 | continuity | deferred | none | none | unmapped |
| R015 | anti-feature | out-of-scope | none | none | n/a |
| R016 | constraint | out-of-scope | none | none | n/a |
| R017 | constraint | out-of-scope | none | none | n/a |

## Coverage Summary

- Active requirements: 11
- Mapped to slices: 11
- Validated: 0
- Unmapped active requirements: 0
