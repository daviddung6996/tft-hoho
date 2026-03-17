# Beta -> Free/Pro puzzle monetization design

## Goal
Ship a monetization path that matches the current product reality: puzzle-first retention, `Review Decision` as the learning payoff, and premium puzzle content as the first paid surface.

## Product thesis
TFTISEASY should optimize for:

- 1 month of free beta to seed users and learn retention behavior
- a post-beta split into `Free` and `Pro`
- a core loop of `Puzzle -> Review Decision -> IQ/progress -> return`
- a first paywall around premium puzzle access, not coach access

This direction fits the current repo state because the app already has the puzzle, `Review Decision`, IQ, and coach surfaces in place. The next leverage is packaging and funnel clarity, not a broader feature set.

## Target user
Initial audience: broad TFT players, especially users reached through community distribution and SEO entry points.

Primary acquisition channels:

- Discord / Facebook TFT communities
- SEO / organic pages around playable puzzle content

## Phase 1: free beta
Duration: 30 days.

### Purpose
Use beta to:

- maximize low-friction adoption
- observe whether puzzle/IQ loops create repeat usage
- learn which puzzle tags and difficulty bands create the best return behavior
- gather monetization intent before charging

### Beta experience
During beta, users should get near-full access to the existing core loop:

- enter puzzles quickly
- solve
- see `Review Decision`
- receive IQ/progress feedback
- continue into more puzzle activity

### Beta framing
Beta must still prepare users for monetization:

- clearly label the experience as `Beta`
- state that the product will move to `Free` and `Pro` after beta
- expose premium surfaces such as:
  - `Hard`
  - `Pro`
  - `Full Library`
  - curated puzzle packs marked as coming soon

Beta policy: premium puzzle lanes are visible during beta but temporarily free to play. The product should frame them as beta-access surfaces that will move under `Pro` after the beta window ends.

This avoids the common failure mode where users normalize unrestricted access without understanding that packaging will tighten later.

## Phase 2: Free + Pro
### Free tier
Free should remain useful enough to support daily return behavior.

Free includes:

- 1 daily featured puzzle plus access to the last 7 daily puzzles
- `Review Decision` after solving
- basic IQ/rank/progress visibility
- enough recent history and daily structure to preserve habit

Guardrail: free users must always be able to complete one full meaningful loop — start a puzzle, finish it, see `Review Decision`, and receive IQ/progress reinforcement — without hitting a paywall mid-flow.

### Pro tier
Pro should unlock clearly better puzzle value, not vague analysis upsells.

Pro includes:

- full puzzle library
- hard/pro puzzle lane
- curated puzzle packs by rank-climb decision type
- early access to new puzzle drops

Post-launch expansion candidates, not required for the first monetization release:

- weekly high-value packs
- broader content programming layers if content supply supports them

## Beta exit policy
At the end of the 30-day beta:

- all users move automatically onto the `Free` tier by default
- all existing progress, IQ, and history carry over unchanged
- premium puzzle lanes remain visible but switch from beta-free access to `Pro` access
- users should see in-product messaging before the cutoff so the transition does not feel sudden

Recommended launch sweetener:

- offer beta users a limited-time intro discount or short Pro trial at the moment the beta ends

## Launch offer
The first commercial offer should stay simple.

Recommended launch shape:

- monthly `Pro` subscription only at launch
- no annual plan in v1
- no coach-based upsell in the first offer

Pricing should be tested with a lightweight hypothesis range rather than treated as final in this spec. The main CTA should appear on locked premium puzzle surfaces such as `Hard`, `Pro`, and `Full Library`, plus after strong engagement moments where the user has already completed meaningful puzzle sessions.

A free trial is optional. If implemented, keep it short and tied to the beta-exit moment rather than making it a permanent layer of complexity in v1.

Recommended initial paid positioning:

- sell access to better and broader puzzle content
- do not lead monetization with coach features
- do not make the first offer depend on NotebookLM latency quality

## Core loop
The intended loop is:

1. User enters from community link or SEO page
2. User starts a puzzle quickly
3. User solves and sees `Review Decision`
4. User receives IQ/progress reinforcement
5. User returns for the next puzzle/day
6. User develops demand for harder or broader puzzle content
7. User upgrades into `Pro`

`Review Decision` is the key reinforcement surface. It should function as the moment where the user sees:

- where they were right or wrong
- why the decision mattered
- enough correction to feel sharper
- enough emotional impact to trigger ego and replay behavior

The product does not need a separate “puzzle result” abstraction. `Review Decision` already fills that role and should remain the focal post-solve experience.

## Shipping priorities
Because the main product surfaces already exist, the next work should focus on packaging, framing, and monetization readiness.

Priority order:

1. make the puzzle entry funnel clearer
2. make beta framing explicit in-product
3. make the future `Free` / `Pro` structure legible
4. make premium puzzle lanes feel desirable
5. track retention and conversion intent
6. increase puzzle content density and pacing

## Metrics to watch
During beta, the team should track:

- DAU / WAU
- puzzles solved per user
- D1 / D7 retention
- repeat use of daily puzzle surfaces
- return rate after viewing `Review Decision`
- views and clicks on locked premium surfaces
- which puzzle tags or difficulty bands correlate with replay or return
- paywall view rate
- upgrade click-through rate
- checkout start rate
- purchase conversion rate
- conversion by acquisition source
- conversion by puzzle type and difficulty exposure

These metrics should drive the final Pro packaging more than intuition.

## Explicit non-priorities
Do not prioritize these before validating the puzzle monetization path:

- coach-first monetization
- deep personalization systems
- complex social features
- heavy automation for content operations
- broad user analytics dashboards

These may matter later, but they are not the shortest path to shipped monetization.

## Recommended decision
Proceed with:

- 30-day free beta
- explicit in-product framing that `Free` and `Pro` are coming
- post-beta `Free` + `Pro` split
- `Pro` positioned around premium puzzle access: hard/pro/full-library/curated packs

## One-sentence spec
Run a 30-day free beta to seed users and validate retention around the existing `Puzzle -> Review Decision -> IQ/progress` loop, then convert the product into `Free` and `Pro`, with `Pro` unlocking premium puzzle lanes as the first monetized offer.
