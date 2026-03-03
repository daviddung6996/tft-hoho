# SPEC File Template

Use this as the structure for every `{task-slug}-SPEC.md` file.

---

```markdown
# [Task Name] SPEC
> **Status:** DISCUSS | PLANNING | APPROVED | BUILDING | VERIFYING | DONE
> **Created:** [date]
> **Slug:** [task-slug]

---

## Context

**Goal:** [One sentence: what are we building/fixing?]

**Background:** [Why this is needed — 1-2 sentences max]

**Decisions Made:**
- [Decision 1 from DISCUSS phase]
- [Decision 2 from DISCUSS phase]

**Constraints:**
- [Technical constraints, time limits, etc.]

---

## Research

**Files Affected:**
- `path/to/file1.tsx` — [what changes]
- `path/to/file2.css` — [what changes]

**Dependencies:**
- [New packages needed, if any]

**Patterns to Follow:**
- [Existing patterns in codebase to match]

**Risks:**
- [Potential issues to watch for]

---

## Tasks

- [ ] **Task 1:** [Specific action] → Verify: [How to check]
- [ ] **Task 2:** [Specific action] → Verify: [How to check]
- [ ] **Task 3:** [Specific action] → Verify: [How to check]

> Keep to 3-8 tasks. If more, split into multiple SPECs.

---

## Done When

- [ ] [Primary success criteria]
- [ ] [Secondary success criteria]
- [ ] Build passes without errors

---

## Log

- [HH:MM] SPEC created
- [HH:MM] Approved by user
```

---

## Naming Convention

| Task Description | Slug | File Name |
|---|---|---|
| Add dark mode toggle | `dark-mode` | `dark-mode-SPEC.md` |
| Fix login redirect bug | `fix-login-redirect` | `fix-login-redirect-SPEC.md` |
| Refactor API layer | `refactor-api` | `refactor-api-SPEC.md` |
| Profile page redesign | `profile-redesign` | `profile-redesign-SPEC.md` |

## Examples

### Minimal SPEC (simple feature)

```markdown
# Dark Mode Toggle SPEC
> **Status:** APPROVED
> **Created:** 2026-03-03

## Context
**Goal:** Add dark mode toggle to settings page.
**Decisions:** Use CSS variables, persist in localStorage.

## Research
**Files Affected:**
- `src/App.css` — add CSS variables for dark theme
- `src/components/Settings.tsx` — add toggle switch

## Tasks
- [ ] Add CSS variables for dark/light themes in `App.css` → Verify: variables defined
- [ ] Create toggle component in Settings → Verify: toggle renders
- [ ] Wire localStorage persistence → Verify: refreshing keeps theme

## Done When
- [ ] Toggle switches between light/dark
- [ ] Choice persists across refresh
- [ ] Build passes
```

### Full SPEC (complex feature)

```markdown
# Auth System SPEC
> **Status:** PLANNING
> **Created:** 2026-03-03

## Context
**Goal:** Add email/password authentication with JWT.
**Background:** App currently has no auth. Need user accounts for personalization.
**Decisions:**
- Use Supabase Auth (already have Supabase project)
- Email + password only (no OAuth for v1)
- Redirect to /login when unauthenticated

**Constraints:**
- Must work with existing RLS policies
- No breaking changes to current anonymous usage

## Research
**Files Affected:**
- `src/lib/supabase.ts` — add auth helper functions
- `src/components/LoginForm.tsx` — [NEW] login/register form
- `src/components/AuthGuard.tsx` — [NEW] route protection
- `src/App.tsx` — add auth routing

**Dependencies:**
- `@supabase/supabase-js` (already installed)

**Patterns to Follow:**
- Existing Supabase client pattern in `src/lib/supabase.ts`

**Risks:**
- RLS policies may need updating for authenticated users

## Tasks
- [ ] Create auth helpers in supabase.ts → Verify: functions exported
- [ ] Create LoginForm component → Verify: renders login/register
- [ ] Create AuthGuard wrapper → Verify: redirects unauthenticated
- [ ] Wire auth routing in App.tsx → Verify: /login accessible
- [ ] Add Supabase migration for auth schema → Verify: migration runs
- [ ] Test full flow → Verify: register → login → access protected route

## Done When
- [ ] Can register new account
- [ ] Can login with registered account
- [ ] Protected routes redirect to /login
- [ ] Build passes without errors

## Log
- 10:30 SPEC created
```
