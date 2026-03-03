---
description: Create a SPEC for a feature or task. Triggers the brainstorming → planning → approval pipeline. Always asks questions before creating a plan.
---

// turbo-all

## Steps

1. **Load the `spec-driven-dev` skill.** Read `.agent/skills/spec-driven-dev/SKILL.md` for the full pipeline protocol.

2. **DISCUSS Phase.** Ask the user 3-5 targeted questions about their request:
   - Check `references/question-bank.md` for domain-specific questions
   - Apply `brainstorming` skill principles
   - Batch questions (2-3 max per message)
   - Include WHY each question matters and a sensible default

3. **RESEARCH Phase.** After user answers, silently:
   - Scan relevant files in codebase
   - Identify affected files and dependencies
   - Check for existing patterns to follow
   - Note potential risks

4. **PLAN Phase.** Create `{task-slug}-SPEC.md` in project root:
   - Use template from `references/spec-template.md`
   - Set status to `PLANNING`
   - Include all context from DISCUSS phase
   - Include research findings
   - Break work into 3-8 tasks with verification criteria

5. **Present and Request Approval.**
   - Show SPEC summary to user
   - Ask: "SPEC ready. Approve để tôi bắt đầu `/build`?"
   - Update status to `APPROVED` only when user confirms
   - **HARD BLOCK:** Do NOT proceed to build without explicit approval
