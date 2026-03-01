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

### Hextech Overlay — Unified Pattern (CRITICAL)

> ⚠️ **Rule tuyệt đối:** Mọi overlay/modal backdrop trong app **BẮT BUỘC** dùng đúng pattern dưới đây. **KHÔNG ĐƯỢC** dùng `background: rgba(0,0,0,0.7)` phẳng.

**Shared keyframe** đã định nghĩa trong `src/styles/Common.css`:
```css
@keyframes hex-overlay-in {
    from { opacity: 0; }
    to   { opacity: 1; }
}
```

#### Loại 1: Fixed Overlay (modal nằm ngoài game container, `position: fixed`)
Dùng cho: UserProfileModal, SupportModal, PuzzleCompletionModal, VideoExplanationModal, ConfirmModal, Admin modals.
```css
.my-modal-overlay {
    position: fixed;
    inset: 0;
    background:
        radial-gradient(ellipse at 50% 30%, rgba(200, 170, 110, 0.06) 0%, transparent 50%),
        radial-gradient(ellipse at 50% 80%, rgba(21, 58, 62, 0.25) 0%, transparent 50%),
        rgba(0, 0, 0, 0.78);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    animation: hex-overlay-in 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
```

#### Loại 2: In-game Overlay (nằm trong `app-container`, `position: absolute`)
Dùng cho: AugmentModal, DecisionReview, ArenaSelectorModal, PuzzleLockOverlay.
```css
.my-game-overlay {
    position: absolute;
    top: 0; left: 0;
    width: 100%; height: 100%;
    background:
        radial-gradient(ellipse at 50% 30%, rgba(200, 170, 110, 0.06) 0%, transparent 50%),
        radial-gradient(ellipse at 50% 80%, rgba(21, 58, 62, 0.25) 0%, transparent 50%),
        rgba(0, 0, 0, 0.78);
    /* ⛔ KHÔNG dùng backdrop-filter ở đây — gây conflict stacking context */
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 200;
    animation: hex-overlay-in 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
```

#### ⛔ Tuyệt đối KHÔNG làm:
1. **KHÔNG dùng `backdrop-filter` trên overlay `position: absolute` bên trong `app-container`** — `app-container` có `filter: contrast(...)` tạo stacking context, `backdrop-filter` sẽ gây layout shift cho ScoutingPanel, ItemPanel, SynergyPanel.
2. **KHÔNG wrap game content trong div có `filter: blur()` toggle** — toggle `filter: none` ↔ `filter: blur(8px)` tạo/huỷ stacking context, làm các panel absolute bị trượt/giật.
3. **KHÔNG animate `backdrop-filter` trong keyframe** — GPU-expensive, gây giật. Chỉ animate `opacity`.
4. **KHÔNG dùng `background: rgba(0,0,0,0.7)` phẳng** — phải có atmosphere gradient (gold glow + teal depth).

#### Modal Body (bên trong overlay):
```css
.hex-modal-content {
    background: linear-gradient(180deg, #153a3e 0%, #051c1e 100%);
    border: 1px solid #c8aa6e;
    box-shadow: 0 0 20px rgba(200, 170, 110, 0.3);
}
```

**Used in:** Tất cả overlay/modal trong app. Xem `Common.css` cho keyframe gốc.

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

### T-Coin Icon — Mandatory Usage Pattern

> ⚠️ **Rule tuyệt đối:** Mọi nơi hiển thị T-Coin (balance, cost, reward, lock overlay...) **BẮT BUỘC** dùng `<TCoinIcon />` component. **KHÔNG ĐƯỢC** dùng emoji 🪙, text "T-Coin", hoặc ký tự □.

#### Component Location
```
src/features/tcoin/components/TCoinIcon.tsx
```

#### Usage
```tsx
import { TCoinIcon } from '../../features/tcoin/components/TCoinIcon';

// Balance display
<TCoinIcon size={22} />
<span>{balance}</span>

// Cost display (trong dropdown, lock overlay...)
<TCoinIcon size={12} />
<span>{cost}</span>

// Reward popup animation
<TCoinIcon size={16} />
```

#### Size Guidelines
| Context | Size |
|---------|------|
| Header balance widget | `22` |
| Puzzle lock overlay cost | `20` |
| Tier select dropdown cost badge | `11–12` |
| Floating earn spark animation | `16` |

#### Files đã tuân thủ chuẩn này
- `TCoinBalance.tsx` ✅
- `TCoinEarnAnimation.tsx` ✅
- `PuzzleLockOverlay.tsx` ✅ (fixed 2026-03-01, was using 🪙 emoji)
- `TierSelect.tsx` ✅ (fixed 2026-03-01, was using "50 T-Coin" text string)

#### Kiểm tra vi phạm
Chạy lệnh này để tìm chỗ vi phạm chuẩn:
```powershell
# Tìm emoji 🪙 đang được render trong JSX
Get-ChildItem -Path src -Recurse -Include "*.tsx" | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    if ($content -match '🪙') { Write-Host $_.FullName }
}
```

---

## 2. Gotchas

<!-- ### [Short description]
- **Symptom:** ...
- **Cause:** ...
- **Avoid:** ... -->

### `filter` / `backdrop-filter` gây layout shift trong game container
- **Symptom:** ScoutingPanel, ItemPanel, SynergyPanel bị trượt lên/xuống khi overlay xuất hiện hoặc biến mất.
- **Cause:** `app-container` có `filter: contrast(1.05) saturate(1.08) brightness(1.02)` tạo stacking context. Nếu wrap game content trong div có `filter: blur()` toggle (`none` ↔ `blur(8px)`), việc tạo/huỷ stacking context sẽ làm các panel `position: absolute` bị reflow.
- **Avoid:** KHÔNG BAO GIỜ wrap game content trong div toggle `filter`. Overlay đã có background atmosphere đủ tối (`rgba(0,0,0,0.78)`), không cần blur content bên dưới. Xem pattern "Hextech Overlay" ở Section 1.

### Supabase schema source-of-truth mismatch
- **Symptom:** Type definitions trong `src/lib/supabase.ts` đã có bảng `user_wallets`, `tcoin_transactions`, `user_unlocked_puzzles`, `pro_supporters`, `donations`, nhưng thư mục `supabase/migrations/` chưa có SQL migration tương ứng.
- **Cause:** Schema có thể đã tạo trực tiếp trên remote Supabase hoặc local type file được cập nhật trước khi commit migration.
- **Avoid:** Trước khi ship môi trường mới, bắt buộc backfill migration SQL cho toàn bộ bảng đang được app sử dụng để tránh "works on one database only".

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



