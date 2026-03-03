---
name: spec-driven-dev
description: >
  Spec-driven development pipeline that enforces DISCUSS → PLAN → EXECUTE → VERIFY
  before any code is written. Use when building features, creating new projects,
  refactoring, or any complex multi-step work. Triggers on: /spec, /build, /check,
  /quick, "plan this", "spec this", "let's plan", "tạo spec", "lên plan".
  This skill ensures the AI always asks questions first, creates a thorough plan,
  gets user approval, and only then executes. Inspired by get-shit-done but simpler
  (3 commands vs 15+).
---

# Spec-Driven Development

> **Core Rule:** NEVER write code for complex tasks without an approved SPEC.
> Pipeline: `/spec` → `/build` → `/check`

## Pipeline Overview

```
/spec   → DISCUSS (ask) → RESEARCH (scan) → PLAN (create SPEC) → USER APPROVE
/build  → Load SPEC → Execute tasks → Track progress
/check  → Verify results → Walk user through → Mark DONE or fix
/quick  → Lightweight: ask 1-2 questions → execute → done (for small tasks)
```

---

## Command: `/spec`

Create a SPEC for a feature/task. This is the most critical step.

### Phase 1: DISCUSS (Mandatory)

Apply `brainstorming` skill principles. Ask **3-5 targeted questions** before anything else.

**Question selection priority:**
1. **P0 - Blocking:** Questions that change architecture (must ask)
2. **P1 - High-leverage:** Questions that affect multiple files (should ask)
3. **P2 - Nice-to-have:** Questions about preferences (ask if time allows)

**Domain-specific question routing:** See `references/question-bank.md`

**Rules:**
- Ask questions in BATCHES of 2-3 max (don't overwhelm)
- Each question must include WHY it matters and a DEFAULT if user skips
- After answers, confirm understanding before moving on
- If user says "bạn quyết định" / "you decide" → use sensible defaults, state them

### Phase 2: RESEARCH (Auto)

After DISCUSS, silently analyze:
1. Scan relevant files in codebase (grep, list_dir, view_file)
2. Identify affected files and dependencies
3. Check for existing patterns to follow
4. Note potential risks or conflicts

### Phase 3: PLAN + APPROVE

Create `{task-slug}-SPEC.md` in project root. Use template from `references/spec-template.md`.

**SPEC file rules:**
- One file per task, saved in PROJECT ROOT
- Name format: `{task-slug}-SPEC.md` (e.g., `dark-mode-SPEC.md`)
- Status tracking inside the file
- Must include verification criteria for EVERY task

**After creating SPEC:**
1. Present summary to user
2. Ask for approval: "SPEC ready. Approve để tôi bắt đầu build?"
3. **HARD BLOCK:** Do NOT proceed to `/build` until user explicitly approves

---

## Command: `/build`

Execute an approved SPEC. **Requires an approved SPEC file.**

### Pre-flight Check

1. Find the SPEC file (search for `*-SPEC.md` in project root)
2. Verify status is `APPROVED` — if not, STOP and tell user to run `/spec` first
3. Load all context from SPEC (Context, Research, Tasks)

### Execution Rules

1. Execute tasks **one by one** in order
2. After each task: update SPEC file progress (`[ ]` → `[x]`)
3. Apply `clean-code` skill standards — no over-engineering
4. Apply appropriate agent knowledge (frontend-specialist, backend-specialist, etc.)
5. If a task is unclear mid-execution → STOP, ask user, update SPEC

### Progress Tracking

Update SPEC file `## Log` section after each significant milestone:
```
- [HH:MM] Task 1 complete ✅
- [HH:MM] Task 2 complete ✅ — note: changed approach because [reason]
```

### On Completion

Update SPEC status to `VERIFYING`. Inform user: "Build complete. Chạy `/check` để verify."

---

## Command: `/check`

Verify completed work against SPEC criteria.

### Verification Steps

1. **Automated checks:**
   - Run build (`npm run build` or equivalent) — must pass
   - Run tests if they exist
   - Run relevant scripts from `.agent/skills/` (lint, security, etc.)

2. **SPEC criteria walk-through:**
   - Go through each "Done When" item
   - For UI changes: describe what to verify visually
   - For API changes: provide curl/test commands

3. **User confirmation:**
   - Present results: "✅ Build passed. ✅ 3/3 criteria verified."
   - Ask: "Bạn đã kiểm tra chưa? OK để mark done?"

4. **Resolution:**
   - All good → Update SPEC status to `DONE`
   - Issues found → Create fix tasks in SPEC, status back to `BUILDING`
   - Run `/build` again for fix tasks

---

## Command: `/quick`

Lightweight mode for small tasks (bug fixes, config changes, single-file edits).

### When to Use
- Task affects ≤ 2 files
- No architectural decisions needed
- User explicitly says "nhanh" / "quick" / "fix" / "just do it"

### Flow
1. Ask 1-2 clarifying questions (or 0 if crystal clear)
2. State what you'll do in 1-2 sentences
3. Execute immediately
4. Report what was done

**No SPEC file created.** Progress tracked in conversation only.

---

## Pipeline Enforcement

### HARD RULES (Never Break)

| Rule | Enforcement |
|------|-------------|
| No code without SPEC for complex tasks | Check if SPEC exists before `/build` |
| No `/build` without APPROVED status | Read SPEC status field |
| No skipping DISCUSS phase | Must ask ≥ 3 questions in `/spec` |
| SPEC has verification criteria | Every task needs a "Verify" step |

### SOFT RULES (Warn, Don't Block)

| Rule | Warning |
|------|---------|
| SPEC older than 3 days | "SPEC cũ rồi, cần update không?" |
| Multiple SPEC files active | "Có {n} SPEC đang mở. Focus vào cái nào?" |

### Complexity Detection

Auto-detect when `/quick` should be upgraded to `/spec`:

| Signal | Action |
|--------|--------|
| Task mentions 3+ files | Suggest `/spec` instead |
| Words: "refactor", "redesign", "migrate" | Suggest `/spec` instead |
| User uncertain about approach | Suggest `/spec` instead |

---

## Integration with Existing Skills

| Phase | Skills to Apply |
|-------|----------------|
| DISCUSS | `brainstorming` (question protocol) |
| PLAN | `plan-writing` (task breakdown) |
| BUILD | `clean-code`, agent-specific skills |
| CHECK | `testing-patterns`, relevant audit scripts |

---

## State Management

All state lives in the `{task-slug}-SPEC.md` file. Possible statuses:

```
DISCUSS   → Questions being asked
PLANNING  → SPEC being created
APPROVED  → User approved, ready for /build
BUILDING  → Tasks being executed
VERIFYING → Build done, checking results
DONE      → All verified and complete
BLOCKED   → Waiting for user input mid-build
```
