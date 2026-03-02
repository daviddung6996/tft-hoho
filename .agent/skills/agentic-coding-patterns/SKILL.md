---
name: agentic-coding-patterns
description: >
  Advanced agentic coding patterns for mastering LLM-assisted development.
  Apply when the user encounters persistent errors, wants to improve their 
  prompt quality, manages context rot, orchestrates subagents, or logs 
  success/failure sessions. This is the meta-skill for improving how we work 
  with AI, not what we build with it.
triggers:
  - context is getting large / slow
  - hallucination or wrong output observed
  - subagent orchestration needed
  - user wants to log an error or success
  - prompt quality needs improvement
  - session handoff needed
---

# Agentic Coding Patterns

Master the discipline of LLM-assisted coding by controlling context, prompting precisely, and building deterministic safety rails.

> **Core Philosophy:** Any error in LLM-generated code is traceable to USER error — either bad prompting or bad context management. The model is the constant. The user input is the variable. Focus on the variable.

---

## Pattern 1: Error Logging System

**Purpose:** Reconstruct the input→output feedback loop that agentic coding normally hides.

**What to log:**
- Hallucinations
- Ignored instructions
- Anti-patterns
- Context loss
- Loops / runaway behavior
- Anything built that wasn't asked for

**Workflow:**
1. Something goes wrong → invoke `/log-error`
2. The command forks the conversation and interviews the user
3. Capture: exact triggering prompt (verbatim), failure category, root cause, prevention strategy
4. Log to `/agentic-logs/errors/error-XXX.md`
5. Double-escape → rewind main conversation → continue cleanly

**The Interview Questions (be specific, not generic):**
- "Your prompt was X words. What were the 3 most important requirements?"
- "Did you specify what NOT to do, or only what to do?"
- "When did you last /clear? How full was context?"
- "What constraints were in your head but not in the prompt?"

**Also log successes** via `/log-success` — understanding why things work is as important as why they fail.

---

## Pattern 2: /Commands as Lightweight Local Apps

**Mental model:** Think of slash commands as CLI tools you build for yourself. They:
- Take arguments and adapt at runtime
- Launch and orchestrate parallel subagents
- Have access to the file system, repos, browser
- Are the **deterministic trigger** for any workflow (including skills)

**Why /commands beat skills for execution:**
Skills cannot be invoked deterministically. A skill contains knowledge; a `/command` is the guaranteed trigger.

```
Skill = Knowledge Source
/Command = Deterministic Launcher that reads the Skill
```

**Architecture pattern for complex commands:**
```
Phase 1: [Parallel independent tasks] - e.g., transcription + refactor
Phase 2: [Sequential dependent tasks] - e.g., pick moments from transcript
Phase 3: [Parallel independent tasks] - e.g., multiple agents build components
Error Gate: Playwright/deterministic check → fail = retry
Phase 4: [Sequential for resource-constrained tasks] - e.g., GPU rendering
```

**Model routing:**
- **Opus** → creative decisions, complex reasoning, architecture
- **Sonnet** → focused execution tasks, targeted rewrites
- **Haiku** → simple extraction, formatting, low-stakes tasks
- **Python/FFmpeg/scripts** → deterministic work (transcription, video cutting) — NOT LLM calls

---

## Pattern 3: Hooks for Deterministic Safety

**Setup:** `dangerously-skip-permissions` + hooks that block dangerous actions = flow state without fear.

**What hooks prevent:**
- `rm -rf` variants
- Force-pushes to protected branches
- Database drops in non-test environments
- Any destructive operation you define

**Philosophy:** Knowing when to force determinism into your workflows is one of the top meta-skills in agentic coding. Let the AI be creative; make safety deterministic.

---

## Pattern 4: Context Hygiene

**Context rot is real.** Performance degrades 50%+ at just 50k tokens. This happens BEFORE your first prompt due to:
- CLAUDE.md / GEMINI.md bloat
- Unused MCP servers loaded
- Unnecessary skills injected
- Long repo reads

### GEMINI.md / Agent File Discipline

**Signs your rule file is too bloated:**
- [ ] Content about multiple unrelated projects
- [ ] Instructions you don't remember adding
- [ ] Not reviewed in over a week
- [ ] Longer than ~50 lines (global)

**Action:** Do a weekly review. Every token must earn its place. Move project-specific rules to project-level files.

### Compaction Strategy

**Preferred order (best to worst):**

| Method | When | Trade-off |
|--------|------|-----------|
| `/clear` + repo GEMINI.md | Clean breakpoints | Best quality, requires re-stating context |
| `/handoff {NOTES}` | Session transitions | High quality, takes 2 min to prepare |
| Manual `/compact` | Mid-flow quick fix | Moderate quality, fast |
| Sonnet[1m] as "break glass" | Context full, non-critical tasks | Low quality, unblocks you |

**Disable autocompact** and add a context status indicator to stay aware.

### Double-Escape Time Travel

The most underutilized feature. Two modes:

**Bug Fix Pattern:**
```
1. Claude builds feature
2. Bug introduced
3. Debug 5-10 turns → bug fixed
4. Double-escape → restore CONVERSATION only (keep code changes)
5. Bug history gone from context, working code retained
```

**Runaway Recovery:**
```
1. Claude looping / going off rails
2. Double-escape → restore BOTH code and conversation
3. Back to known good state
4. Try a different approach
```

> Treat conversation history as context, not as sacred record. Stale context is harmful context.

---

## Pattern 5: Subagent Control

**Add to your GEMINI.md:** `"Always launch opus subagents unless specified otherwise"`

### Philosophy

- **Give subagents specific, isolated tasks** — not abstract roles
- **Parallelize aggressively** — if tasks have isolated context, run them simultaneously
- **More subagents > more tasks per subagent** — focused beats overloaded
- **Guard against hallucination chains** — if Agent B depends on Agent A's output, a single hallucination poisons the entire result

### Validation Pattern

```
Agent A → completes task → Agent B validates Agent A's output → proceed
```

Use deterministic checks (scripts, schemas, type validators) where possible. Use agent-validates-agent only when deterministic checks cannot cover the domain.

---

## Pattern 6: Lean Tool Stack

**Principle:** Every MCP loaded = tokens consumed before your first prompt.

**Essential MCPs only:**
- **Context7** — up-to-date documentation for any framework/library
- **Playwright / Dev Browser** — browser automation for UI debugging, screenshot multimodality, console error capture

**Evaluation criteria for adding any MCP:**
1. Is it used in >50% of sessions?
2. Does it provide info unavailable in context?
3. Is its token overhead justified by its value?

---

## Pattern 7: Prompt Engineering on Steroids

### The Reprompter System

**Flow:** Voice dictation → AI asks clarifying questions → structured prompt generated with XML tags + role assignment.

**Goal:** High-quality prompts at typing speed without the friction of remembering XML structure and best practices manually.

### Minimum Viable Improvement

If you won't build a reprompter, at least do this:

> **Have the model interview you before implementation.** Ask it to ask you 5-8 questions before writing any code. Make them specific to your domain.

### Prompt Quality Checklist

Before submitting a complex prompt, verify:
- [ ] Key requirements are in the first 100 words
- [ ] You specified what NOT to do (negative constraints)
- [ ] Success criteria is explicit ("done means X")
- [ ] Context from your head is written out, not assumed
- [ ] Abstraction level matches the task (not too high, not too specific)
- [ ] XML tags used for structured sections (`<context>`, `<task>`, `<constraints>`, `<output_format>`)

---

## Quick Reference Table

| Situation | Action |
|-----------|--------|
| Claude does something wrong | `/log-error` → fork → interview → capture verbatim prompt → rewind |
| Something worked unusually well | `/log-success` → capture what made it click |
| Need reliable workflow execution | `/command` (deterministic) wrapping skill (knowledge) |
| Want complex workflow on your file system | `/command` with parallel subagents + sequential dependencies |
| Context filling up too fast | Disable autocompact, add `[Model] XX%` status, manual compact |
| Bug fixed but context is polluted | Double-escape → restore conversation only (keep code) |
| Claude is looping / runaway | Double-escape → restore both code and conversation |
| GEMINI.md feels bloated | Weekly review, repo-specific files, ruthlessly trim |
| Need clean handoff between sessions | `/handoff {NOTES}` |
| Clear breakpoint reached | `/clear` + repo-specific GEMINI.md |
| Subagents using wrong model | Add `"Always launch opus subagents"` to GEMINI.md |
| Hallucination poisoning subagent chain | Isolated tasks, deterministic checks, Agent X validates Agent Y |
| Typing prompts is slow | Reprompter: voice → clarifying questions → structured prompt |

---

## Log Directories

```
/agentic-logs/
  errors/
    error-001.md
    error-002.md
  successes/
    success-001.md
  metadata.json
```

`metadata.json` format:
```json
{
  "last_error_id": 0,
  "last_success_id": 0,
  "last_updated": "2026-03-02"
}
```
