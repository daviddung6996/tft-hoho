# Gold Display SPEC
> **Status:** VERIFYING
> **Created:** 2026-03-05
> **Slug:** gold-display

---

## Context

**Goal:** Hiển thị đúng số tiền hiện có của Player trên board, áp dụng cho round 3-2 và 4-2.

**Background:** Hiện tại gold data đã có trong puzzle state (`playerState.gold`) và được truyền qua `usePuzzleToPlayers` → `PlayerData.gold` → `myPlayer.gold`. Tuy nhiên chưa có UI nào hiển thị số gold trực quan trên board. Người chơi cần thấy số gold thật để đánh giá tình hình econ khi chọn augment.

**Decisions Made:**
- Vị trí: Trên nút AugmentButton, dưới bench. Không chạm vào bench.
- Chỉ hiển thị khi: `puzzlePhase !== 'reviewing'` (cùng lúc với AugmentButton)
- Style: Theo Hextech theme — coin icon + số gold, giống TFT in-game

**Constraints:**
- AugmentButton: `bottom: 4cqw`, height `3.5cqw` → top edge tại ~7.5cqw
- BenchArea: `bottom: 12.5cqw`
- Gold display nên ở khoảng `bottom: 8.5-9cqw` để nằm giữa, không chạm bench

---

## Research

**Files Affected:**
- `src/components/Arena/GoldDisplay.tsx` — [NEW] Component hiển thị gold
- `src/components/Arena/GoldDisplay.css` — [NEW] Styling cho gold display  
- `src/App.tsx` — Import + render GoldDisplay cạnh AugmentButton
- `src/styles/mobile.css` — Mobile touch target cho gold display (nếu cần)

**Dependencies:**
- Không có package mới

**Patterns to Follow:**
- Absolute positioning với `cqw` units (giống AugmentButton, BenchArea)
- Hextech theme colors: `#c8aa6e` (gold), `#F0E6D2` (text), `#0A1628` (bg)
- z-index tương tự AugmentButton (`z-index: 300`)

**Data Flow (đã có sẵn):**
```
puzzle.playerState.gold → usePuzzleToPlayers → myPlayer.gold → App.tsx
```

**Risks:**
- Gold display có thể chồng lên bench units nếu vị trí không chính xác
- Cần test trên mobile landscape để đảm bảo không bị overlap

---

## Tasks

- [x] **Task 1:** Tạo `GoldDisplay.tsx` component — icon coin + số gold → ✅
- [x] **Task 2:** Tạo `GoldDisplay.css` — Hextech teal gradient, z-index:50, bottom: 7.8cqw → ✅
- [x] **Task 3:** Wire GoldDisplay vào `App.tsx` — ẩn khi scout, ẩn khi options mở → ✅
- [ ] **Task 4:** Visual verification — user kiểm tra trực quan → Pending

---

## Done When

- [ ] Gold display hiển thị số gold chính xác từ puzzle data
- [ ] Vị trí: trên AugmentButton, dưới bench, centered
- [ ] Chỉ hiển thị ở round 3-2 và 4-2 (cùng điều kiện AugmentButton)
- [ ] Ẩn khi phase reviewing
- [ ] Build passes (`npm run build`)

---

## Log

- 22:04 SPEC created
