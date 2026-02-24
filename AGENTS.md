# Agent Knowledge Base (AGENTS.md)

Welcome, Agent. This file is a living document intended to capture common mistakes, confusion points, and "surprises" encountered while working on the **TFTISEASY** project. 

**If you find something that surprises you, update this file immediately to help future agents.**

---

## 1. Reusable Patterns

### Anti Over-engineering Backend
```typescript
// Chỉ cần 3 tầng: Controller -> Service -> Repo
class UserController {
  constructor(private readonly authService: AuthService) {} // Tiêm Service trực tiếp, KHÔNG cần IAuthService.
}
class AuthService {
  constructor(private readonly userRepo: UserRepo) {} // Tiêm Repo trực tiếp
}
class UserRepo {
  // Query Supabase thẳng trực tiếp 
}
```
**Used in:** Tất cả các module Backend thuộc `backend/features/`

---

## 2. Gotchas

<!-- ### [Short description]
- **Symptom:** ...
- **Cause:** ...
- **Avoid:** ... -->

---

## 3. Applied Fixes

<!-- ### [Bug description]
- **Date:** YYYY-MM-DD
- **File:** ...
- **Problem:** ...
- **Fix:**
```lang
// fix code
``` -->
