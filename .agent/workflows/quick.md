---
description: Quick execution for small tasks (bug fixes, config changes, single-file edits). Lightweight alternative to /spec that skips full planning. Use for tasks affecting ≤ 2 files.
---

// turbo-all

## Steps

1. **Load the `spec-driven-dev` skill.** Read the `/quick` section in `.agent/skills/spec-driven-dev/SKILL.md`.

2. **Complexity Check.**
   - If task mentions 3+ files → suggest `/spec` instead
   - If keywords: "refactor", "redesign", "migrate" → suggest `/spec` instead
   - If user is uncertain about approach → suggest `/spec` instead
   - Otherwise, proceed with quick mode

3. **Quick Clarify.** Ask 0-2 clarifying questions (only if genuinely unclear).

4. **State Intent.** Tell user in 1-2 sentences what you'll do.

5. **Execute.** Implement the change immediately. Apply `clean-code` skill standards.

6. **Report.** Summarize what was done. No SPEC file created.
