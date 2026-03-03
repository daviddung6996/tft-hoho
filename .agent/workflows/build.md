---
description: Execute an approved SPEC. Only works when a SPEC file exists with APPROVED status. Implements tasks one-by-one with progress tracking.
---

// turbo-all

## Steps

1. **Load the `spec-driven-dev` skill.** Read `.agent/skills/spec-driven-dev/SKILL.md` for execution rules.

2. **Pre-flight Check.**
   - Search for `*-SPEC.md` files in project root
   - If no SPEC found: STOP → Tell user to run `/spec` first
   - If SPEC status is not `APPROVED`: STOP → Tell user to approve the SPEC first
   - Load all context from SPEC (Context, Research, Tasks)

3. **Execute Tasks.**
   - Work through tasks one-by-one in order
   - Apply `clean-code` skill standards
   - Apply appropriate agent knowledge (frontend-specialist, backend-specialist, etc.)
   - After each task: update SPEC file (`[ ]` → `[x]`)
   - Add log entry with timestamp

4. **Handle Blockers.**
   - If a task is unclear mid-execution: STOP, ask user, update SPEC
   - Set SPEC status to `BLOCKED` until resolved

5. **On Completion.**
   - Update SPEC status to `VERIFYING`
   - Inform user: "Build complete. Chạy `/check` để verify kết quả."
