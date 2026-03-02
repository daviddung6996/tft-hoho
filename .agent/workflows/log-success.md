---
description: Log an agentic coding success/win. Captures what went right, why it worked, and suggests next steps aligned with the project vision. Run this whenever something works unusually fast, cleanly, or on the first try.
---

# /log-success [brief description of the win]

$ARGUMENTS

---

## Purpose

Most people only log failures. Understanding WHY things work is just as important. When something clicks — first-try success, unusually clean output, elegant solution, minimal intervention — capture it and use the momentum to figure out what to tackle next.

---

## Step 1: Read Project Vision

Read `d:\TFT-hoho\SHIP-PLAN.md` to understand:
- Current sprint and priorities (P0 / P1 / P2)
- What's done vs. what's not started
- Kill metrics and core philosophy

---

## Step 2: Read Metadata

Read `d:\TFT-hoho\agentic-logs\metadata.json` to get the next success ID.
If the file doesn't exist, create it with `{"last_error_id": 0, "last_success_id": 0}` and use ID 001.

---

## Step 3: Analyze the Win (No Interview — AI-Driven)

Review the recent conversation context and auto-extract:
- **What was accomplished** — describe in 2–3 sentences
- **Category** — pick all that apply from the template below
- **Triggering prompt** — quote the exact prompt that produced the win
- **What made it work** — your own analysis of the prompt quality, context state, approach used
- **Key ingredient** — the one thing that mattered most
- **Reproducibility** — should this become a standard pattern?

Do NOT ask the user questions. Produce the analysis yourself from evidence in the conversation.

---

## Step 4: Write the Log File

Create the file at: `d:\TFT-hoho\agentic-logs\successes\success-[ID].md`

Use this template:

```markdown
# Success #[ID]: [Short Descriptive Name]

**Date:** [YYYY-MM-DD]
**Project/Context:** [What were you working on]

## What Went Well

[2–3 sentences — what succeeded specifically, why it was notable]

## Success Category

- [ ] **First-try success** — No corrections needed
- [ ] **Unusually fast** — Completed well under expected time
- [ ] **Elegant solution** — Cleaner or smarter than anticipated
- [ ] **Minimal intervention** — Little to no back-and-forth
- [ ] **Effective parallel execution** — Multiple tasks ran cleanly
- [ ] **Good context management** — Right info available at right time
- [ ] **Prompt structure** — The way it was phrased produced great output
- [ ] **Tool/skill use** — Used a skill, /command, or workflow particularly effectively

## The Triggering Prompt

```
[Exact prompt — verbatim]
```

## What Made It Work

[Specific analysis: what in the prompt, context, or approach caused this result?]

## Key Ingredient

[The single most important thing that made the difference]

## Reproducibility

- **Repeatable?** [Yes/No/Partially]
- **Should become standard practice?** [Yes/No]
- **If yes:**
  - [ ] Add pattern to GEMINI.md
  - [ ] Create a new /command
  - [ ] Update a skill
  - [ ] Just remember it

## One-Line Lesson

[Actionable prompting/context insight — not "Claude was good", but "I did X and it worked because Y"]

---
*Logged: [timestamp]*
```

---

## Step 5: Generate Next Steps (Based on Win + Vision)

After logging, output a **"What to do next"** block:

```markdown
## 🚀 Momentum — What to Do Next

**Based on this win + SHIP-PLAN.md priorities:**

### Immediate (P0 — unblocked right now)
1. [Task from SHIP-PLAN that is most relevant to build on this win]
2. [Another P0 task that fits the current momentum]

### Suggested Prompt to Start
> [Ready-to-paste prompt the user can send right now to continue with max context clarity]

### Habit to Keep
> [One thing from this win that should be repeated — e.g., "Keep providing SHIP-PLAN.md at session start"]
```

When generating next steps:
- Cross-reference the win type with `SHIP-PLAN.md` priorities
- Prefer tasks that **build on the same domain** as the win (e.g., won on a workflow → suggest next workflow task)
- Prefer **P0 tasks** first, then P1
- The suggested prompt should be immediately actionable — no vague instructions

---

## Step 6: Update Metadata

Update `d:\TFT-hoho\agentic-logs\metadata.json`:
```json
{
  "last_error_id": [unchanged],
  "last_success_id": [new ID],
  "last_updated": "[YYYY-MM-DD]"
}
```

---

## Examples

```
/log-success refactored the entire metrics module in one shot
/log-success Hextech CSS unified perfectly on first try
/log-success parallel subagents built 4 components simultaneously without conflicts
/log-success built agentic-coding-patterns skill from raw document in one pass
```
