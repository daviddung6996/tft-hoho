# Agent Knowledge Base (AGENTS.md)

Welcome, Agent. This file is a living document intended to capture common mistakes, confusion points, and "surprises" encountered while working on the **TFTISEASY** project. 

**If you find something that surprises you, update this file immediately to help future agents.**

---

## 0. Core Business Identity (CRITICAL — Read First)

> **Every agent MUST understand this before building any feature.**

### What TFTISEASY actually is:

| Layer | Identity |
|-------|----------|
| **External (marketing)** | "Pro Training Tool" — learn to pick augments like Challenger players |
| **Internal (real product)** | **Tilt Validation & Flex Entertainment Machine** |

### The Real User Psychology Loop:

```
Tilt (lost in-game) → Play puzzle → "I picked the same as Pro!" 
→ Validation ("I'm actually good, just unlucky") → Share flex card 
→ Come back for more validation
```

### Why this matters for development:

1. **Every feature must serve the TILT → VALIDATION → SHARE loop.** If a feature doesn't reduce tilt or provide validation, it's noise — cut it.
2. **The "Pro Training Tool" branding exists to make users psychologically comfortable.** Nobody wants to admit they play a tool "to feel better about losing." They want to say "I'm training to get better" — even if the real dopamine hit is validation.
3. **Motto: "Addictive first, flex second."** Don't build vanity features (cosmetics, badges, seasonal resets) until DAU > 500. Focus on making the core puzzle → validation → share loop irresistible.
4. **VN TFT market reality:** 70% mobile casual, tilt-and-rage cycle. They flex in-game rank and meme roast, NOT third-party tool IQ scores. Distribution = FB group ego-challenge posts + small streamer Kahoot-style quiz.
5. **Kill metric:** If < 200 DAU after 14 days of launch → pivot or kill. No vanity features can save a product nobody uses.
6. **Monetization truth: Users don't buy puzzles or virtual coins. They buy PROXIMITY TO A REAL PRO (tftiseasy#00000).** The Pro Supporter Pass (49k VND/month) works because it's "support the dev who is a real Challenger" — NOT an IAP from a random tool. T-Coin is a free engagement layer, NOT monetization. Stop thinking T-Coin grind is core; the core is the pro player brand.

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

### Hextech Modal Brightness Standard

> ⚠️ Rule tuyệt đối: Modal không được để nền **pitch black**. Nền phải là **teal đậm nhưng sáng** — giống màn hình Review Decision.

Cấu trúc 3 lớp background cho **Profile/Stats Modal** (modal lớn có scroll):

```css
/* Modal Shell — base teal (không phải #000) */
.modal-shell {
    background:
        radial-gradient(ellipse at 50% 0%, rgba(200, 170, 110, 0.12) 0%, transparent 55%),
        radial-gradient(ellipse at 50% 100%, rgba(21, 58, 62, 0.6) 0%, transparent 60%),
        linear-gradient(180deg, #0d2e30 0%, #081e20 100%);
    border: 0.06cqw solid rgba(200, 170, 110, 0.45); /* Outer gold border — REQUIRED */
}

/* Hero Section (top focal area) */
.hero-section {
    background:
        radial-gradient(ellipse at 50% 0%, rgba(200, 170, 110, 0.18) 0%, transparent 60%),
        linear-gradient(180deg, rgba(21, 58, 62, 0.95), rgba(13, 46, 48, 0.98));
    border-bottom: 0.06cqw solid rgba(200, 170, 110, 0.30);
}

/* Metric/Stats Section */
.metrics-section {
    background: rgba(16, 52, 56, 0.95);
    border-bottom: 0.06cqw solid rgba(200, 170, 110, 0.30);
}

/* Chart/Content Sections */
.charts-section {
    background: rgba(11, 40, 43, 0.97);
    border-bottom: 0.06cqw solid rgba(200, 170, 110, 0.30);
}

/* Activity/Footer Sections */
.activity-section {
    background: rgba(13, 46, 48, 0.97);
}
```

**Border opacity rules:**
| Context | Opacity |
|---|---|
| Outer modal border | `0.45` (visible, prominent) |
| Section dividers | `0.30` (clear but not harsh) |
| Inner subtle dividers (vertical lines inside stat cards) | `0.30` |
| Decorative subtle hints | `0.15` |

**Text brightness rules:**
| Role | Value |
|---|---|
| Stat values (numbers) | `#FFFFFF` pure white |
| Headings / hero title | `#c8aa6e` gold |
| Stat labels | `rgba(200, 170, 110, 0.75)` |
| Body / meta text | `#94A3B8` |
| Muted / disabled | `rgba(200, 170, 110, 0.45)` |

**Used in:** `UserProfileModal.css` — là reference chuẩn cho mọi stats/profile panel tương lai.

---

### IQ Rank Color System

Mỗi rank có màu riêng được dùng làm `--rank-color` CSS variable. **KHÔNG thay đổi bảng màu này.**

```typescript
// src/features/user-iq/userIqCalculator.ts — getUserIqRankColor()
Challenger  → '#00D1C1'  // Cyan teal
Grandmaster → '#FF6B35'  // Orange
Master      → '#8B5CF6'  // Purple (ngoại lệ duy nhất — thương hiệu rank)
Diamond     → '#4F46E5'  // Indigo
Platinum    → '#0EA5E9'  // Sky blue
Gold        → '#EAB308'  // Yellow gold
Silver      → '#94A3B8'  // Steel
Bronze      → '#B45309'  // Amber
Iron        → '#4B5563'  // Gray
Unranked    → '#4B5563'  // Same as Iron (muted)
```

Dùng trong Hero Section của `UserProfileModal.tsx` để set `--rank-color` và `--hero-atmosphere` CSS vars.

**Used in:** `UserProfileModal.tsx`, `UserIqBadge.tsx`, `SettingsButton.tsx`
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
