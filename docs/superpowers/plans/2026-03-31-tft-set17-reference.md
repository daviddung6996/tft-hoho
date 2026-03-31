# TFT Set 17 Reference Skill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create an official Claude Code skill named `tft-set17-reference` under `C:/Users/Administrator/.claude/skills/`, migrate the useful Set 17 knowledge from `D:/TFT-hoho/tftset17/`, and ensure the skill remains usable after that temporary repo folder is deleted.

**Architecture:** Keep the skill lightweight in `SKILL.md` and move detailed operational knowledge into bundled reference files. The skill should route Claude to the correct reference based on the task, prioritize a future official API over temporary parsing flows, and avoid any Set 16 scrape trigger surface.

**Tech Stack:** Claude Code skills (`SKILL.md` + bundled references), Markdown, local filesystem

---

## File Structure

### Create
- `C:/Users/Administrator/.claude/skills/tft-set17-reference/SKILL.md` — official skill metadata, trigger description, routing rules, source priority, and migration note
- `C:/Users/Administrator/.claude/skills/tft-set17-reference/references/supabase-schema.md` — bundled schema reference for normalized output and upsert behavior
- `C:/Users/Administrator/.claude/skills/tft-set17-reference/references/parse-cdragon.md` — bundled post-PBE/full-data reference
- `C:/Users/Administrator/.claude/skills/tft-set17-reference/references/parse-tactics-tools.md` — bundled pre-PBE/partial-data reference

### Modify
- `D:/TFT-hoho/docs/agent-context/active.md` — record the official skill migration and follow-up state if the work is completed in this session
- `D:/TFT-hoho/docs/agent-context/decisions.md` — record the durable decision to move Set 17 skill knowledge out of the temporary repo folder into the official Claude skill directory

### Reference Only
- `D:/TFT-hoho/tftset17/SKILL.md`
- `D:/TFT-hoho/tftset17/supabase-schema.md`
- `D:/TFT-hoho/tftset17/parse-cdragon.md`
- `D:/TFT-hoho/tftset17/parse-tactics-tools.md`
- `D:/TFT-hoho/docs/superpowers/specs/2026-03-31-tft-set17-reference-design.md`

---

### Task 1: Create the official skill folder and bundled references

**Files:**
- Create: `C:/Users/Administrator/.claude/skills/tft-set17-reference/SKILL.md`
- Create: `C:/Users/Administrator/.claude/skills/tft-set17-reference/references/supabase-schema.md`
- Create: `C:/Users/Administrator/.claude/skills/tft-set17-reference/references/parse-cdragon.md`
- Create: `C:/Users/Administrator/.claude/skills/tft-set17-reference/references/parse-tactics-tools.md`

- [ ] **Step 1: Create the skill directory structure**

Run:
```bash
mkdir -p "C:/Users/Administrator/.claude/skills/tft-set17-reference/references"
```
Expected: directory tree exists with no error output

- [ ] **Step 2: Write the new `SKILL.md` draft**

Write this file content:
```md
---
name: tft-set17-reference
description: Use when working with TFT Set 17 data sources, Set 17 parsing constraints, Set 17 Supabase import/update tasks, or questions about how current temporary Set 17 data workflows should operate before an official API exists.
---

# TFT Set 17 Reference

## Overview
This skill is the current reference guide for TFT Set 17 data work while no official API exists. Use it for two kinds of work: answering questions about Set 17 data sources and constraints, and guiding Set 17 imports or updates into Supabase.

This is not a general TFT scraping skill. Treat the current parsing workflow as a temporary bridge. If an official API exists, prefer that source first and use this skill to migrate away from temporary parsing paths.

## Source Priority
Use sources in this order:
1. Official API, if available
2. `references/parse-cdragon.md` for full post-PBE data
3. `references/parse-tactics-tools.md` for pre-PBE or partial extraction
4. `references/supabase-schema.md` for the normalized target contract

The schema file defines the target shape. The source files define how to collect or interpret current temporary data.

## Reference Routing
- Read `references/parse-cdragon.md` when the task needs exact numbers, full variables, apiNames, or post-PBE completeness.
- Read `references/parse-tactics-tools.md` when the task needs the temporary pre-PBE extraction path from `tactics.tools/info/set-update`.
- Read `references/supabase-schema.md` when the task needs the target table contract, JSONB structure, or upsert rules.

## Operating Rules
- Keep the scope on Set 17.
- Do not describe this workflow as the long-term architecture.
- Do not reintroduce Set 16 scrape framing or generic all-set scrape triggers.
- When answering reference questions, read only the bundled reference file needed for that question.
- When planning or performing a Set 17 import/update, identify the best available source first, then map the result to the bundled Supabase schema reference.

## Migration Rule
When an official API becomes available, replace or reprioritize the temporary source layer instead of extending the temporary scraping workflow.
```

- [ ] **Step 3: Write the bundled schema reference**

Copy the validated schema guidance from:
```text
D:/TFT-hoho/tftset17/supabase-schema.md
```
into:
```text
C:/Users/Administrator/.claude/skills/tft-set17-reference/references/supabase-schema.md
```
Expected: the new bundled file contains the current champions, traits, augments, items, JSONB, upsert, and soft-delete guidance needed by the skill

- [ ] **Step 4: Write the bundled CDragon reference**

Copy the validated guide from:
```text
D:/TFT-hoho/tftset17/parse-cdragon.md
```
into:
```text
C:/Users/Administrator/.claude/skills/tft-set17-reference/references/parse-cdragon.md
```
Expected: the bundled file preserves the post-PBE/full-data mapping guidance without referencing the temporary repo folder as a runtime dependency

- [ ] **Step 5: Write the bundled tactics.tools reference**

Copy the validated guide from:
```text
D:/TFT-hoho/tftset17/parse-tactics-tools.md
```
into:
```text
C:/Users/Administrator/.claude/skills/tft-set17-reference/references/parse-tactics-tools.md
```
Expected: the bundled file preserves the pre-PBE/partial extraction guide without making the skill depend on the repo folder

- [ ] **Step 6: Verify the created files exist**

Run:
```bash
ls "C:/Users/Administrator/.claude/skills/tft-set17-reference" && ls "C:/Users/Administrator/.claude/skills/tft-set17-reference/references"
```
Expected: `SKILL.md` plus the three reference files are listed

### Task 2: Audit the new skill for scope, trigger, and dependency leaks

**Files:**
- Modify: `C:/Users/Administrator/.claude/skills/tft-set17-reference/SKILL.md`
- Test: `C:/Users/Administrator/.claude/skills/tft-set17-reference/SKILL.md`

- [ ] **Step 1: Read the new `SKILL.md` and check the frontmatter**

Verify these exact properties:
```yaml
name: tft-set17-reference
description: Use when working with TFT Set 17 data sources, Set 17 parsing constraints, Set 17 Supabase import/update tasks, or questions about how current temporary Set 17 data workflows should operate before an official API exists.
```
Expected: `description:` is on one line and the skill name uses only lowercase letters and hyphens

- [ ] **Step 2: Check for banned framing in the new skill**

Search for these patterns in `SKILL.md`:
```text
Set 16
set16
scraper
all sets
generic TFT scraping
```
Expected: no Set 16 trigger surface; if `scraper` appears, it appears only in a negated warning such as “This is not a general TFT scraping skill.”

- [ ] **Step 3: Check for repo-folder runtime dependency leaks**

Search all created skill files for:
```text
D:/TFT-hoho/tftset17
```
Expected: zero matches in the official skill directory

- [ ] **Step 4: Tighten wording if the skill still over-triggers**

If the draft still reads too broadly, replace the overview block with:
```md
## Overview
This skill is the current reference guide for TFT Set 17 only. Use it when the task is about Set 17 source data, Set 17 parsing constraints, Set 17 schema mapping, or Set 17 Supabase import/update work during the period before an official API exists.

It is not a reusable scraper framework for arbitrary TFT sets. Prefer an official API immediately when one becomes available.
```
Expected: trigger surface stays broad enough for Set 17 work but narrow enough to avoid becoming a generic TFT skill

- [ ] **Step 5: Verify the official skill can stand alone**

Manual check:
```text
Can the user delete D:/TFT-hoho/tftset17/ without losing any file that the official skill needs at runtime?
```
Expected: yes

### Task 3: Capture the durable repo memory updates

**Files:**
- Modify: `D:/TFT-hoho/docs/agent-context/active.md`
- Modify: `D:/TFT-hoho/docs/agent-context/decisions.md`

- [ ] **Step 1: Read the current repo memory files before editing**

Read:
```text
D:/TFT-hoho/docs/agent-context/active.md
D:/TFT-hoho/docs/agent-context/decisions.md
```
Expected: understand current structure and append/update the relevant section rather than creating conflicting notes

- [ ] **Step 2: Update `active.md` with the migration status**

Add a concise note covering:
```md
- Current task: migrate Set 17 skill knowledge from `D:/TFT-hoho/tftset17/` into the official Claude Code skill directory.
- Official destination: `C:/Users/Administrator/.claude/skills/tft-set17-reference/`
- Follow-up: user plans to delete `D:/TFT-hoho/tftset17/` after the official skill is created.
```
Expected: future agents can see where the authoritative skill now lives

- [ ] **Step 3: Update `decisions.md` with the durable decision**

Add a decision entry with this content pattern:
```md
## 2026-03-31 — Move Set 17 skill knowledge into official Claude skill directory
- Decision: The Set 17 skill must live under `C:/Users/Administrator/.claude/skills/tft-set17-reference/`, not in the repo temporary folder.
- Why: the repo folder `D:/TFT-hoho/tftset17/` is temporary and will be deleted after migration.
- Evidence: approved design spec at `D:/TFT-hoho/docs/superpowers/specs/2026-03-31-tft-set17-reference-design.md`.
- Consequences: the official skill must bundle all required references and must not depend on the repo folder at runtime.
```
Expected: the decision is durable and points future work to the official skill location

- [ ] **Step 4: Re-read both files after editing**

Expected: the new notes are concise, non-duplicative, and consistent with the implemented skill location

### Task 4: Final verification and handoff

**Files:**
- Test: `C:/Users/Administrator/.claude/skills/tft-set17-reference/SKILL.md`
- Test: `C:/Users/Administrator/.claude/skills/tft-set17-reference/references/*.md`
- Test: `D:/TFT-hoho/docs/agent-context/active.md`
- Test: `D:/TFT-hoho/docs/agent-context/decisions.md`

- [ ] **Step 1: Run a final content verification search**

Search the official skill directory for all of these terms:
```text
D:/TFT-hoho/tftset17
Set 16
set16
tft-data-scraper
```
Expected: zero matches

- [ ] **Step 2: Confirm the required files are present**

Checklist:
```text
C:/Users/Administrator/.claude/skills/tft-set17-reference/SKILL.md
C:/Users/Administrator/.claude/skills/tft-set17-reference/references/supabase-schema.md
C:/Users/Administrator/.claude/skills/tft-set17-reference/references/parse-cdragon.md
C:/Users/Administrator/.claude/skills/tft-set17-reference/references/parse-tactics-tools.md
```
Expected: all four files exist

- [ ] **Step 3: Confirm acceptance criteria against the spec**

Manual verification:
```text
- official skill exists in ~/.claude/skills
- skill works after deleting repo temp folder
- triggers for Set 17 reference and Set 17 import/update work
- uses bundled references
- prefers official API when available
- carries no Set 16 scrape trigger surface
```
Expected: all criteria satisfied

- [ ] **Step 4: Report the created files and next safe action**

Return a concise status update listing:
```text
- created official skill files
- updated repo memory files
- user may now delete D:/TFT-hoho/tftset17/ if desired
```
Expected: the handoff is clear and low-risk
