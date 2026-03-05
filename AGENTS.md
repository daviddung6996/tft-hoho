# Agent Knowledge Base (AGENTS.md)

Welcome, Agent. This file is a living document intended to capture common mistakes, confusion points, and "surprises" encountered while working on the **TFTISEASY** project. 

**If you find something that surprises you, update this file immediately to help future agents.**

---

## -1. Critical Agent Operation Rules (MANDATORY)

> **⚠️ DO NOT AUTO-COMMIT AND PUSH:**
> Never run `git commit` or `git push` unless the user EXPLICITLY asks you to (e.g., "commit and push", "lưu code lên git"). Auto-committing disrupts the user's workflow and version control history. If you finish a task, just tell the user the code is ready for review.

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

### Video library thumbnail blank when `video_thumbnail_url` is invalid
- **Symptom:** Card trong kho video hiện nền trống (không có preview) dù `video_url` YouTube hợp lệ.
- **Cause:** `VideoCard` chỉ hiển thị `<img>` khi có thumbnail URL nhưng lại chờ `onLoad` để bật opacity; nếu URL thumbnail lỗi thì không có `onError` fallback, ảnh giữ `opacity: 0` và placeholder cũng không render.
- **Avoid:** Luôn tạo fallback thumbnail từ `video_url` (YouTube ID) và implement fallback chain `maxresdefault -> hqdefault -> mqdefault` trong `onError`.

### YouTube playback error can come from inconsistent URL normalization across screens
- **Symptom:** Cùng một `video_url` nhưng màn Review/Player báo lỗi YouTube kiểu `Playback ID`, trong khi thumbnail/library vẫn nhận diện được video.
- **Cause:** Trước đây parser URL YouTube bị copy ở nhiều file (`DecisionReview`, `VideoPlayerModal`, `VideoExplanationModal`, `VideoCard`, `videoLibrary.service`) với rule khác nhau; một số format như `shorts/live/embed` không được normalize nhất quán.
- **Avoid:** Dùng chung helper `src/utils/youtube.ts` (`extractYouTubeVideoId`, `buildYouTubeEmbedUrl`) cho mọi nơi render iframe/thumbnail để tránh mismatch parser.

### T-Coin earn-rate table vs runtime trigger mismatch
- **Symptom:** Team nghĩ app da co full economy event (daily challenge, streak, first share, first puzzle, video milestone rewards), nhung user chi thay coin tang theo ket qua puzzle.
- **Cause:** `TCOIN_EARN_RATES` co nhieu reason (`daily_*`, `streak_*`, `first_*`, `video_milestone_*`) trong `src/features/tcoin/tcoin.types.ts`, nhung runtime hien tai chi goi `tcoinService.earnCoins(...)` tai `src/hooks/useGameFlow.ts` voi 4 case: `puzzle_correct_fast`, `puzzle_correct_no_reroll`, `puzzle_correct`, `puzzle_incorrect`. Video milestone hien tai chi check threshold (`checkMilestone`) va render UI marker, chua co call earn coin.
- **Avoid:** Khi can tinh "farm formula", uu tien source runtime call-site (`earnCoins` usage) thay vi chi doc bang rate constant. Neu muon mo milestone reward that su, phai wire them den `tcoinService.earnCoins(milestone.earnReason, ...)`.

### Intent declaration flow wrongly gated by `proPickPath` only
- **Symptom:** Round `3-2` co man chon 4 intent, nhung round `2-1` co the nhay thang vao `AugmentModal` ma khong qua `PathSelector`.
- **Cause:** `useGameFlow` dung dieu kien `!!currentPuzzle.proPickPath` de bat `puzzlePhase = 'declaring_intent'`. Neu puzzle `2-1` thieu `proPickPath` metadata, step intent bi skip.
- **Avoid:** Rule hien tai: chi stage `3-2` moi vao intent step. `2-1` phai vao thang augment select, khong duoc gate theo `proPickPath`.

---

## 3. Applied Fixes

### Modal Form
```typescript
// Chỉ cần 3 tầng: Controller -> Service -> Repo
```
**Used in:** Tất cả các module Backend thuộc `backend/features/`

### Video library thumbnail + incorrect text copy
- **Date:** 2026-03-03
- **File:** `src/features/video-library/videoLibrary.service.ts`
- **Problem:** Nhiều puzzle có `video_url` nhưng thiếu/hỏng `video_thumbnail_url`, dẫn đến card không có preview.
- **Fix:** Thêm helper extract YouTube ID và tự sinh thumbnail fallback (`hqdefault`) từ `video_url`.

- **Date:** 2026-03-03
- **File:** `src/features/video-library/components/VideoCard.tsx`, `src/features/video-library/components/VideoPlayerModal.tsx`
- **Problem:** Thumbnail lỗi không có fallback runtime; text trạng thái sai hiển thị ngắn là "Sai".
- **Fix:** Thêm fallback chain thumbnail khi `img` lỗi và đổi text sai thành `Bạn đã trả lời sai câu này.` ở cả card + player modal.

<!-- ### [Bug description]
- **Date:** YYYY-MM-DD
- **File:** ...
- **Problem:** ...
- **Fix:**
```lang
// fix code
``` -->

### IQ + T-Coin formula update (2026-03-03)
- **Date:** 2026-03-03
- **File:** src/features/user-iq/userIqCalculator.ts
- **Problem:** IQ formula cu de leo rank qua de (-15, base +25, speed bonus nhe).
- **Fix:** Doi sang formula moi: sai -18; dung base +22; speed bonus <8s:+8, <15s:+5, <25s:+2, con lai +0.

- **Date:** 2026-03-03
- **File:** src/hooks/useGameFlow.ts, src/features/tcoin/tcoin.types.ts, src/features/tcoin/tcoin.service.ts
- **Problem:** T-Coin runtime chua theo cong thuc don gian moi va chua co hard cap ngay theo UTC+7.
- **Fix:** Runtime earn ly theo if/else moi:
  - Sai: 0
  - Dung + co reroll: +2
  - Dung + khong reroll + <8s: +5
  - Dung + khong reroll + <15s: +3
  - Dung + khong reroll + con lai: +1
  - Daily cap puzzle earn: 15/ngay theo UTC+7 (partial award neu gan cham cap).
  - Welcome bonus giu nguyen 30 T-Coin.

### Intent declaration stage gating fix (2026-03-03)
- **Date:** 2026-03-03
- **File:** `src/hooks/useGameFlow.ts`
- **Problem:** Logic gate sai requirement round: `2-1` khong duoc co man intent, chi `3-2` moi co.
- **Fix:** Chuyen sang stage-gate ro rang: `shouldShowIntentDeclaration()` chi tra ve true cho stage `3-2`; bo fallback `proPickPath` de tranh bat intent sai o `2-1`.

### YouTube embed normalization unification (2026-03-03)
- **Date:** 2026-03-03
- **File:** `src/utils/youtube.ts`, `src/components/Arena/DecisionReview.tsx`, `src/features/video-library/components/VideoPlayerModal.tsx`, `src/components/common/VideoExplanationModal.tsx`, `src/features/video-library/components/VideoCard.tsx`, `src/features/video-library/videoLibrary.service.ts`
- **Problem:** Logic parse/build URL YouTube bị duplicate và lệch nhau giữa các màn, dễ gây lỗi phát video khi URL ở dạng `shorts/live/embed` hoặc có timestamp query.
- **Fix:** Tạo utility dùng chung (`extractYouTubeVideoId`, `buildYouTubeEmbedUrl`) và thay toàn bộ call-site iframe/thumbnail sang helper này.

### Puzzle completion can loop forever for guests when DB query fallback is triggered
- **Symptom:** User plays puzzles repeatedly and never reaches completion modal, even when DB seems to have very few puzzles.
- **Cause:** Two issues can combine:
  1) usePuzzleGame.handleMarkCompleted only persisted for user?.id and did not update local completion list for guest sessions.
  2) puzzleService.getAll() queried .is('deleted_at', null); if a DB is missing deleted_at, query fails and hook falls back to local PUZZLE_SCENARIOS, increasing puzzle pool silently.
- **Avoid:** Always update completedPuzzleIds locally for both guest and authenticated sessions; persist to DB only when user?.id exists. In getAll(), retry without deleted_at filter when missing-column error is detected.

### TrashView load failure & Supabase RLS silent UPDATE failure (2026-03-04)
- **Date:** 2026-03-04
- **File:** `src/pages/Admin/components/TrashView.tsx`, `src/services/championService.ts` (and other services)
- **Problem 1 (Trash View):** `TrashView` used `Promise.all` to fetch deleted items from 7 different tables. If even ONE service call failed (e.g., due to insufficient permissions), the entire trash view failed to load and appeared empty.
- **Fix 1:** Changed `Promise.all` to `Promise.allSettled` so that successful API calls still render their data gracefully.
- **Problem 2 (RLS Silent Failure):** When calling `.update({ deleted_at: ... }).eq('id', id)` on Supabase, if the user role does not satisfy the RLS policy for `UPDATE`, Supabase fails silently. It returns `data: []` and no error instead of an unauthorized exception. Thus the UI shows success, but the database isn't updated.
- **Fix 2:** Ensure backend services allow `mod` roles in JS `checkAdminAccess()`, and critically, ensure the PostgreSQL RLS Policy for `UPDATE` is explicitly configured to allow the `mod` role. (Supabase requires both `UPDATE` and identifying rows via `SELECT` permissions to fully succeed).

### Cloudflare Pages MIME Type text/html Error on Subdomain Deployment (2026-03-05)
- **Date:** 2026-03-05
- **File:** `vite.config.ts`, `public/_redirects`, `public/_headers`
- **Problem:** When setting up a subdomain like `training.tftiseasy.com` on Cloudflare Pages, configuring Vite with `base: '/training/'` causes the React Router to fetch JS/CSS files from `training.tftiseasy.com/training/assets/...` which do not exist at that path when deployed to the root of a subdomain. Cloudflare throws a fallback SPA `index.html` file, leading to multiple "MIME type text/html is not supported" errors in the browser console.
- **Fix:** If deployed directly to the root of a subdomain (i.e. `training.tftiseasy.com/...`), treat it as a root domain deployment. Remove the `base: '/training/'` config from `vite.config.ts` (leave empty so it defaults to `/`). Set `public/_redirects` to `/* /index.html 200` to correctly handle SPA routing for the root domain.

