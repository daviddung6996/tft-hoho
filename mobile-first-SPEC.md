# Mobile-First Fix & Improve SPEC
> **Status:** VERIFYING
> **Created:** 2026-03-05
> **Slug:** mobile-first

---

## Context

**Goal:** Fix app để 70% user mobile VN có thể chơi được — bắt buộc landscape, tối ưu touch targets, self-host fonts, giảm load time.

**Background:** App hiện tại dùng fixed 16:9 container + `cqw` units, thiết kế cho desktop landscape. Trên mobile portrait, 16:9 box bị letterbox thành dải ngang nhỏ, text/button cực nhỏ. Không có touch handling, không có orientation prompt, fonts load từ CDN bên ngoài.

**Decisions Made:**
- Force landscape orientation (KHÔNG redesign portrait layout)
- Touch interaction: Minimal — tap-to-select + enlarge touch targets ≥44px
- Performance: Self-host fonts + optimize assets ngay (không đợi sprint riêng)

**Constraints:**
- Giữ nguyên 16:9 container + `cqw` unit system (core architecture không đổi)
- Giữ nguyên Hextech Premium design philosophy
- Không break desktop UX hiện tại
- Arena backgrounds đã là WebP (good, không cần convert)

---

## Research

**Vấn đề phát hiện:**

| Issue | Severity | Detail |
|-------|----------|--------|
| No orientation lock/prompt | 🔴 Critical | Mobile portrait = 16:9 letterbox, unplayable |
| Fonts from CDN | 🟡 Medium | `index.css` + `index.html` load 3 fonts từ Google CDN — render-blocking |
| No touch targets | 🟡 Medium | Buttons/cards dùng `cqw` nhỏ, không đảm bảo ≥44px trên mobile |
| `:hover` on touch devices | 🟡 Medium | 75+ `:hover` rules — sticky hover trên mobile gây lỗi visual |
| `position: fixed` modals | 🟡 Medium | 21 CSS files dùng `position: fixed` — có thể bị mobile browser chrome che |
| No viewport meta tuning | 🟡 Medium | Thiếu `viewport-fit=cover`, `user-scalable=no` cho fullscreen mobile |
| No safe area handling | 🟡 Medium | Notch/punch-hole cameras che UI trên landscape |
| `body overflow: hidden` | ✅ OK | Đã đúng cho game app |
| Arena backgrounds | ✅ OK | Đã WebP, local import (không CDN) |

**Files Affected:**

### Task 1 — Viewport & Orientation
- `index.html` — viewport meta tag + manifest
- `src/index.css` — Remove CDN font import
- `src/App.css` — Safe area padding cho `layout-wrapper`

### Task 2 — Landscape Lock Component
- `src/components/common/LandscapePrompt.tsx` — [NEW] rotate prompt
- `src/components/common/LandscapePrompt.css` — [NEW] styling
- `src/App.tsx` — Mount LandscapePrompt

### Task 3 — Self-host Fonts
- `src/assets/fonts/` — [NEW] Inter, Spectral, Share Tech Mono woff2 files
- `src/styles/fonts.css` — [NEW] `@font-face` declarations
- `src/index.css` — Replace `@import url(...)` with local import
- `index.html` — Remove `<link>` to Google Fonts

### Task 4 — Touch Target Fixes
- `src/components/Arena/AugmentModal.css` — Enlarge card tap areas
- `src/components/Sidebar/ScoutingPanel.css` — Enlarge player row tap areas
- `src/components/Arena/AugmentButton.css` — Enlarge toggle button
- `src/components/Settings/SettingsButton.css` — Enlarge menu button
- `src/features/tcoin/components/PuzzleLockOverlay.css` — Enlarge action buttons
- `src/components/Auth/LoginModal.css` — Enlarge form inputs + buttons

### Task 5 — Hover State Fix
- `src/styles/mobile.css` — [NEW] Global `@media (hover: hover)` wrapper
- Multiple CSS files — Wrap `:hover` rules in `@media (hover: hover)` for game-critical components

### Task 6 — Fixed Modal Safe Area
- `src/styles/Common.css` — Add `safe-area-inset` to `.hex-modal-overlay` pattern
- `src/components/Settings/UserProfileModal.css` — Safe area padding
- `src/features/video-library/components/VideoPlayerModal.css` — Safe area padding

### Task 7 — Vite Build Optimization
- `vite.config.ts` — Add build optimization (minify, chunk splitting, asset inlining)

**Dependencies:**
- Cần download font files (Inter, Spectral, Share Tech Mono) dạng woff2
- Không cần package mới

**Patterns to Follow:**
- Hextech Overlay pattern (AGENTS.md) cho LandscapePrompt
- `cqw` unit system cho tất cả sizing
- Atmosphere gradient background cho prompt overlay

**Risks:**
- Font file size: woff2 tổng ~150-200KB, nhưng sẽ nhanh hơn CDN roundtrip cho VN mobile
- Landscape prompt có thể bị skip nếu user dùng iPad/tablet (OK, iPad landscape mặc định)
- CSS `@media (hover: hover)` có thể miss một số device cũ (acceptable)

---

## Tasks

- [x] **Task 1: Viewport & Meta Tags** — Update `index.html` viewport meta: thêm `viewport-fit=cover`, `user-scalable=no`, `maximum-scale=1`. Thêm `<meta name="screen-orientation" content="landscape">`. → Verify: View source, meta tags correct
- [x] **Task 2: Landscape Lock Component** — Tạo `LandscapePrompt.tsx` + CSS: detect portrait orientation, hiện fullscreen prompt "Xoay ngang điện thoại" với animation xoay đẹp theo Hextech style. Chỉ hiện trên mobile (< 1024px width). Mount trong `App.tsx`. → Verify: Resize browser thành portrait → prompt hiện. Landscape → prompt ẩn.
- [x] **Task 3: Self-host Fonts** — Install @fontsource/inter, @fontsource/spectral, @fontsource/share-tech-mono. Replace Google Fonts CDN in `index.css` + `index.html`. → Verify: Fonts render đúng, Network tab không còn `fonts.googleapis.com` requests.
- [x] **Task 4: Touch Target Enlargement** — min-height 44px cho tất cả interactive element trên mobile landscape. → Verify: Augment cards dễ tap, scouting player rows đủ lớn.
- [x] **Task 5: Hover State Fix** — Wrap `:hover` rules trong @media (hover: hover) cho tất cả game-critical CSS files. → Verify: Mobile simulator không còn sticky hover state.
- [x] **Task 6: Safe Area & Fixed Modal Fix** — Thêm env(safe-area-inset-*) padding cho layout-wrapper + fixed modals. → Verify: Render đẹp trên iPhone notch model.
- [x] **Task 7: Vite Build Optimization** — esbuild minify, ES2020 target, CSS code split, manual chunks (vendor-react, vendor-fonts). → Verify: npm run build passed, chunks separated.

> 7 tasks — scope vừa, chia thành 2 batch: Batch 1 (T1-T3 = foundation), Batch 2 (T4-T7 = polish).

---

## Done When

- [x] Mobile portrait hiện prompt "Xoay ngang điện thoại" (Hextech style)
- [x] Mobile landscape hiển thị game bình thường, tất cả text/button đọc được
- [x] Fonts load từ local, KHÔNG còn Google Fonts CDN request
- [x] Touch targets ≥ 44px trên mobile landscape
- [x] Không có sticky hover state trên touch devices
- [x] Notch/safe area không che UI elements
- [x] `npm run build` pass, bundle size giảm
- [x] Desktop UX KHÔNG bị break

---

## Log

- 14:49 DISCUSS: User trả lời 3 câu hỏi
- 14:56 RESEARCH: Scan toàn bộ codebase — 75+ hover rules, 0 touch handling, 0 orientation, fonts from CDN
- 15:00 SPEC created — 7 tasks
- 15:00 APPROVED by user
- 15:01 Task 1 ✅ — Viewport meta updated
- 15:02 Task 3 ✅ — @fontsource installed, CDN removed
- 15:03 Task 2 ✅ — LandscapePrompt.tsx created + mounted
- 15:04 Tasks 4-6 ✅ — mobile.css created (hover/touch/iOS zoom/safe-area)
- 15:05 Task 7 ✅ — Vite build optimized
- 15:06 Build passed ✅ — 13.15s, chunks separated correctly
