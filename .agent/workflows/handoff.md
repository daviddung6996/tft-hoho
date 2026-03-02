---
description: Clean session handoff when context is full. Compacts the current session into a structured briefing so the next session starts fresh with all critical context. Better quality than /compact, more controlled than autocompact.
---

# /handoff [optional notes about what to focus on]

$ARGUMENTS

---

## Purpose

When context is full and you need a clean break, `/handoff` creates a structured briefing document that the next session can consume to get fully up to speed — without inheriting the accumulated rot of the current context.

This is the highest-quality method for context transition. Use it at natural stopping points or when you feel performance degrading.

---

## Step 1: Assess Current State

Quickly survey the current session:
- What was the main objective?
- What has been completed?
- What is currently in progress (and at what step)?
- What remains to be done?
- Any blockers, decisions, or open questions?
- Any recent gotchas or patterns discovered?

---

## Step 2: Generate the Handoff Document

Write the briefing to `d:\TFT-hoho\agentic-logs\handoffs\handoff-[YYYYMMDD-HHMM].md`:

```markdown
# Session Handoff — [YYYY-MM-DD HH:MM]

## Project State

**Context:** [What project/feature is being worked on]
**Objective:** [The main goal of this session and remaining work]

## What's Done ✅

- [Completed item 1]
- [Completed item 2]
- [Completed item 3]

## In Progress 🔄

**Current task:** [Exactly what was being done when context filled]
**Status:** [What step in the process]
**Next immediate action:** [Exactly what to do first when resuming]

## Still To Do 📋

1. [Next task]
2. [Task after that]
3. [Further tasks]

## Key Decisions Made

- [Decision 1 and why]
- [Decision 2 and why]

## Gotchas & Discoveries

- [Pattern or issue discovered this session]
- [Known bug or edge case to be aware of]
- [Any deviation from the original plan and why]

## Files Modified This Session

- `[filepath]` — [what changed]
- `[filepath]` — [what changed]

## Open Questions / Blockers

- [Unresolved decision or question]
- [Anything waiting on user input]

## Active Context to Preserve

[Paste any critical snippets, IDs, config values, or data that must carry over]

## Recommended First Prompt for New Session

```
[A ready-to-paste prompt the user can send at session start to get back up to speed.
Should reference this handoff file and summarize the immediate next step.]
```

---
*Handoff generated: [timestamp]*
*Context level at handoff: [~XX%]*
```

---

## Step 3: Instruct User

Tell the user:

1. Handoff saved at `agentic-logs/handoffs/handoff-[timestamp].md`
2. To start the next session, use the "Recommended First Prompt" at the bottom of the handoff file
3. They can now safely `/clear` or start a fresh conversation

---

## Examples

```
/handoff
/handoff focus on the incomplete TierList refactor
/handoff context is at 80%, need to continue the CSS audit tomorrow
/handoff all tests passing except auth flow, pick up there next
```
