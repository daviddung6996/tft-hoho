---
description: Log an agentic coding error/failure with root cause analysis. Forks the conversation, interviews the user, captures the exact triggering prompt, and writes a structured log. Use whenever Claude hallucinates, ignores instructions, builds the wrong thing, or gets stuck.
---

# /log-error [brief description of what went wrong]

$ARGUMENTS

---

## Purpose

You are helping the user log a failure in their agentic coding session. The PRIMARY goal is to identify what the USER did wrong — in their prompting, context management, or harness configuration. This is about building USER skill, not cataloging model failures.

> The model is the constant. The user's input is the variable. Focus on the variable.

---

## Step 1: Read the Recent Context

Review the last several turns to understand:
- What task was being attempted
- What went wrong specifically
- What prompt(s) triggered the failure

---

## Step 2: Read Metadata

Read `d:\TFT-hoho\agentic-logs\metadata.json` to get the next error ID.
If the file doesn't exist, create it with `{"last_error_id": 0, "last_success_id": 0}` and use ID 001.

---

## Step 3: Interview the User (5–8 Questions)

Ask pointed, SPECIFIC questions about what happened — NOT generic ones. Tailor them to the actual failure. Examples of the right kind:

- "Your prompt was [X] words long. What were the 3 most critical requirements buried in there?"
- "Did you tell me what NOT to do, or only what to do?"
- "When did you last `/clear`? Estimate how full context was when this happened."
- "Did you verify the subagents received the critical context they needed?"
- "Was this reference material you gave me, or explicit requirements?"
- "What constraints were in your head but never written in the prompt?"
- "I [did X wrong thing]. Was this something you inferred from context or something explicitly stated?"

Be CRITICAL. The user asked for this feedback. Do not soften it.

Wait for user answers before proceeding to Step 4.

---

## Step 4: Trace the Exact Triggering Prompt

Identify and quote the EXACT prompt (verbatim) that led to the failure.
Ask the user to confirm or paste it if you can't locate it in context.

---

## Step 5: Write the Log File

Create the file at: `d:\TFT-hoho\agentic-logs\errors\error-[ID].md`

Use this template:

```markdown
# Error #[ID]: [Short Descriptive Name]

**Date:** [YYYY-MM-DD]
**Project/Context:** [What were you working on]

## What Happened

[2–3 sentences — what went wrong specifically, not generically]

## User Error Category

**Primary cause:** [Pick ONE from below]

### Prompt Errors
- [ ] **Ambiguous instruction** — Could be interpreted multiple ways
- [ ] **Missing constraints** — Didn't specify what NOT to do
- [ ] **Too verbose** — Buried key requirements in walls of text
- [ ] **Reference vs requirements** — Gave reference material, expected extracted requirements
- [ ] **Implicit expectations** — Had requirements in head, not in prompt
- [ ] **No success criteria** — Didn't define what "done" looks like
- [ ] **Wrong abstraction level** — Too high-level or too detailed for the task

### Context Errors
- [ ] **Context rot** — Conversation too long, should have /cleared
- [ ] **Stale context** — Old information polluting new responses
- [ ] **Context overflow** — Too much info degraded performance
- [ ] **Missing context** — Assumed Claude remembered something it didn't
- [ ] **Wrong context** — Irrelevant information drowning the signal

### Harness Errors
- [ ] **Subagent context loss** — Critical info didn't reach subagents
- [ ] **Wrong agent type** — Used wrong specialized agent for task
- [ ] **No guardrails** — Didn't constrain agent behavior appropriately
- [ ] **Parallel when sequential needed** — Launched agents that had dependencies
- [ ] **Sequential when parallel possible** — Slow execution, unnecessary serialization
- [ ] **Missing validation** — No check that agent output was correct
- [ ] **Trusted without verification** — Accepted agent output without review

### Meta Errors
- [ ] **Didn't ask clarifying questions** — Could have caught this earlier
- [ ] **Rushed to implementation** — Skipped planning/verification
- [ ] **Assumed competence** — Expected Claude to infer too much

## The Triggering Prompt

```
[Exact prompt — verbatim]
```

## What Was Wrong With This Prompt

[Be specific and critical. What should have been different?]

## What the User Should Have Said Instead

```
[Rewritten prompt that would have prevented this error]
```

## The Gap

- **Expected:** [What user expected]
- **Got:** [What actually happened]
- **Why:** [Direct connection to user error above]

## Impact

- **Time wasted:** [~X minutes]
- **Rework required:** [What needs to be redone]

## Prevention — User Action Items

1. [Specific action to take next time]
2. [Another specific action]
3. [Consider adding to GEMINI.md or workflow]

## Pattern Check

- **Seen this before?** [Yes/No — if yes, this is a habit to break]
- **Predictable?** [Should user have anticipated this?]

## One-Line Lesson

[Actionable takeaway about prompting/context/harnessing — NOT about model behavior]

---
*Logged: [timestamp]*
```

---

## Step 6: Update Metadata

Update `d:\TFT-hoho\agentic-logs\metadata.json`:
```json
{
  "last_error_id": [new ID],
  "last_success_id": [unchanged],
  "last_updated": "[YYYY-MM-DD]"
}
```

---

## Step 7: Confirm & Rewind

Tell the user:
- Log saved at `agentic-logs/errors/error-[ID].md`
- Remind them to **double-escape → restore conversation only** (keep code) to rewind back to before the error debugging started, so their context is clean for the next prompt.

---

## Examples

```
/log-error Claude built the wrong component entirely
/log-error Hallucinated a function that doesn't exist
/log-error Got stuck in a loop adding tests
/log-error Ignored my TypeScript constraint and used JS
```
