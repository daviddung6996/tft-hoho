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

### Hextech Admin Modal Theme
```css
/* Container/Overlay: Blur backdrop */
.hex-modal-overlay {
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(2px);
}

/* Modal Body: Green Hextech Background + Gold Glow */
.hex-modal-content {
    background: linear-gradient(180deg, #153a3e 0%, #051c1e 100%);
    border: 1px solid #c8aa6e;
    box-shadow: 0 0 20px rgba(200, 170, 110, 0.3);
}

/* Inputs within Modal: Dark, matching Hextech panel */
.hex-modal-input {
    background: rgba(0, 0, 0, 0.4);
    border: 1px solid rgba(200, 170, 110, 0.3);
    color: #F0E6D2;
}
.hex-modal-input:focus {
    border-color: #c8aa6e;
    box-shadow: 0 0 10px rgba(200, 170, 110, 0.2);
}
```
**Used in:** Tất cả các modal popup (Add/Edit/Delete/Config) trong Control Panel (Profile, ProIqManager, AdminEditModal...). Dùng đúng chuẩn xanh gradient (#153a3e -> #051c1e) và viền vàng blur, **không dùng màu xanh Blue phẳng / Slate**.
---

## 2. Gotchas

<!-- ### [Short description]
- **Symptom:** ...
- **Cause:** ...
- **Avoid:** ... -->

---

## 3. Applied Fixes

### Modal Form
```typescript
// Chỉ cần 3 tầng: Controller -> Service -> Repo
```
**Used in:** Tất cả các module Backend thuộc `backend/features/`

<!-- ### [Bug description]
- **Date:** YYYY-MM-DD
- **File:** ...
- **Problem:** ...
- **Fix:**
```lang
// fix code
``` -->
