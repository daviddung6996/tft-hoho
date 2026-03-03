---
description: Verify completed work against SPEC criteria. Runs automated checks and walks user through manual verification.
---

// turbo-all

## Steps

1. **Load the `spec-driven-dev` skill.** Read `.agent/skills/spec-driven-dev/SKILL.md` for verification protocol.

2. **Find SPEC.**
   - Search for `*-SPEC.md` in project root with status `VERIFYING` or `BUILDING`
   - If not found: inform user no completed build to verify

3. **Automated Checks.**
   - Run build command (`npm run build` or equivalent) — report pass/fail
   - Run tests if they exist (`npm test` or equivalent)
   - Run relevant audit scripts if applicable (lint, security, etc.)

4. **SPEC Criteria Walk-through.**
   - Go through each "Done When" item in the SPEC
   - For UI changes: describe what user should see and verify
   - For API changes: provide curl commands or test steps
   - Present results clearly with ✅/❌ per criterion

5. **Resolution.**
   - If all pass: ask user to confirm → update SPEC status to `DONE`
   - If issues found: create fix tasks in SPEC → set status to `BUILDING` → tell user to run `/build` again
