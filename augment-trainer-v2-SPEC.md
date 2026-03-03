# 3-2 Augment Trainer V2 SPEC

> **Status:** APPROVED
> **Created:** 2026-03-03
> **Slug:** augment-trainer-v2

---

## Context

**Goal:** Mở rộng puzzle V1 để thêm bước **đoán intent** (chọn loại augment trước khi thấy augment) + **StreakBar UI** cho puzzle stage 3-2, biến thành công cụ training "think like a Pro".

**Background:** V1 chỉ cho user chọn augment. V2 thêm 1 bước trước: user phải declare intent (Econ/Item/Combat/Emblem) trước khi thấy augment options. Sau đó flow tiếp tục giống V1. Thêm Streak UI vì chuỗi thắng/thua là yếu tố #1 quyết định intent.

**Decisions Made (from DISCUSS):**

- ✅ **Không phá V1** — V2 logic chỉ activate khi puzzle có `stage === '3-2'` và có `pro_pick_path` data. Puzzle 2-1 hoạt động bình thường.
- ✅ **Tích hợp Admin PuzzleBuilder** — Thêm tab/fields mới vào PuzzleBuilder hiện tại, không tạo builder riêng.
- ✅ **Giữ Lobby context** — Hệt V1 (opponents[] đã có sẵn). Thêm StreakBar UI component mới.
- ✅ **V2 = V1 + intent declaration + streak UI** — Không redesign, chỉ extend.

**Constraints:**

- Feature-based folder structure (`src/features/augment-trainer/` cho logic mới)
- Hextech design system mandatory (gold/teal palette, overlay patterns)
- Không tạo global components, chỉ feature-scoped
- `supabase/migrations/` là source of truth cho DB schema

---

## Research

**Existing Flow (V1):**
```
PuzzlePhase: 'selecting' → user picks augment → 'reviewing' (DecisionReview)
```

**New Flow (V2 — khi puzzle.stage === '3-2' && puzzle.pro_pick_path):**
```
PuzzlePhase: 'declaring_intent' → user chọn path → 'selecting' → user pick augment → 'reviewing'
```

**Files Affected:**

| File | What Changes |
|------|-------------|
| `src/data/puzzleScenarios.ts` | Thêm fields: `streak_history`, `streak_count`, `augment_2_1`, `pro_pick_path`, `difficulty` vào `PuzzleScenario` |
| `src/hooks/useGameFlow.ts` | Thêm phase `'declaring_intent'`, state `declaredPath`, logic transition intent → selecting |
| `src/features/augment-trainer/` | **[NEW]** Feature folder: StreakBar, PathSelector, IntentFeedback components |
| `src/components/Arena/AugmentModal.tsx` | Conditional render: show PathSelector overlay trước khi reveal augments (khi isV2Puzzle) |
| `src/components/Arena/DecisionReview.tsx` | Thêm IntentFeedback section (path match + reasoning) |
| `src/pages/Admin/PuzzleBuilder/tabs/MetaTab.tsx` | Thêm fields: streak history, augment 2-1, pro pick path, difficulty |
| `src/services/puzzleService.ts` | Map new fields khi save/load puzzles |
| `supabase/migrations/` | **[NEW]** Migration: thêm columns vào `puzzles` table, thêm `augment_trainer_attempts` table |
| `src/services/userStatsService.ts` | Extend `recordAttempt` cho intent data |

**Dependencies:**
- Không cần thêm packages mới

**Patterns to Follow:**
- Hextech Overlay pattern (từ `AGENTS.md`) cho PathSelector
- GameInfoIcons pattern cho StreakBar styling
- `AugmentChoiceBuilder` pattern cho admin UI extensions
- `useGameFlow` phase management pattern

**Risks:**
- ⚠️ `useGameFlow` thay đổi phase system → phải test kỹ V1 puzzles vẫn hoạt động bình thường
- ⚠️ `puzzleService.save()` cần handle new fields khi save puzzle 3-2 → check backward compat
- ⚠️ `DecisionReview.tsx` đã phức tạp (16KB) → thêm IntentFeedback cần cẩn thận tách component

---

## Tasks

### Task 1: Extend Data Model
- [ ] **1a.** Thêm fields vào `PuzzleScenario` interface trong `puzzleScenarios.ts`:
  - `streak_history?: boolean[]` — Array 5 W/L (true = win, false = loss)
  - `streak_count?: number` — Positive = win streak, negative = loss streak
  - `streak_gold_bonus?: number` — Gold bonus from streak (0-3)
  - `augment_2_1?: AugmentData | null` — Augment đã chọn ở 2-1
  - `pro_pick_path?: 'econ' | 'item' | 'combat' | 'emblem'` — Path mà Pro chọn
  - `augment_paths?: Record<string, 'econ' | 'item' | 'combat' | 'emblem'>` — Map augment ID → path (cho cả 3 options)
  - `pro_reasoning_intent?: string` — Giải thích tại sao Pro chọn path này (2-3 câu)
  - `difficulty?: 'straightforward' | 'close_call' | 'counter_intuitive'`
- [ ] **1b.** Supabase migration: thêm columns vào bảng `puzzles` cho các fields mới
- [ ] **1c.** Update `puzzleService.ts` — map new fields khi `save()` và `getAll()`
- [ ] **1d.** Update `supabase.ts` type definitions cho puzzles table

→ **Verify:** Build passes, existing puzzles load bình thường (new fields optional)

---

### Task 2: Extend Game Flow — Intent Declaration Phase
- [ ] **2a.** Thêm `'declaring_intent'` vào `PuzzlePhase` type trong `useGameFlow.ts`
- [ ] **2b.** Thêm state: `declaredPath`, `intentStartTime`, `isV2Puzzle` (computed)
- [ ] **2c.** Logic: Nếu puzzle có `pro_pick_path` → start ở phase `'declaring_intent'` thay vì `'selecting'`
- [ ] **2d.** Thêm handler `handlePathDeclare(path)` — set declaredPath, transition sang `'selecting'`, record `intentTime`
- [ ] **2e.** V1 backward compat: Nếu puzzle KHÔNG có `pro_pick_path` → flow giữ nguyên ('selecting' → 'reviewing')

→ **Verify:** V1 puzzles (stage 2-1) vẫn hoạt động bình thường. V2 puzzles start ở declaring_intent phase.

---

### Task 3: Create StreakBar UI Component
- [ ] **3a.** Tạo `src/features/augment-trainer/components/StreakBar.tsx` + `.css`
- [ ] **3b.** UI: Horizontal bar 5 segments (round 1-1 đến 2-5), mỗi segment green (W) hoặc red (L)
- [ ] **3c.** Streak count + gold bonus display (e.g., "W4 +2g")
- [ ] **3d.** Background gradient matching streak type (green tint / red tint / neutral gray)
- [ ] **3e.** Tích hợp vào game state area (hiện ở top khi puzzle có `streak_history`)

→ **Verify:** StreakBar render đúng khi puzzle có streak data. Không hiện khi puzzle V1 không có streak.

---

### Task 4: Create PathSelector UI Component
- [ ] **4a.** Tạo `src/features/augment-trainer/components/PathSelector.tsx` + `.css`
- [ ] **4b.** 4 large buttons: **Econ** / **Item** / **Combat** / **Emblem** với icons và descriptions
- [ ] **4c.** Hextech styling: gold borders, teal backgrounds, hover glow effects
- [ ] **4d.** Animation: buttons slide in khi entering declaring_intent phase
- [ ] **4e.** onClick → gọi `handlePathDeclare(path)` từ useGameFlow

→ **Verify:** PathSelector hiện khi puzzle ở phase 'declaring_intent'. Click chọn path → transition sang 'selecting' (augments reveal).

---

### Task 5: Create IntentFeedback in DecisionReview
- [ ] **5a.** Tạo `src/features/augment-trainer/components/IntentFeedback.tsx` + `.css`
- [ ] **5b.** Hiển thị: "Your intent: [path] vs Pro intent: [pro_path]" với visual match/mismatch
- [ ] **5c.** Intent Score display: ✅ 10 pts (match) hoặc ❌ 0 pts (mismatch)
- [ ] **5d.** Pro reasoning text (2-3 câu giải thích tại sao Pro chọn path đó)
- [ ] **5e.** Tích hợp vào `DecisionReview.tsx` — hiện phía trên phần pro pick khi puzzle có intent data

→ **Verify:** DecisionReview hiển thị intent feedback cho V2 puzzles. V1 puzzles không hiện intent section.

---

### Task 6: Extend Admin PuzzleBuilder
- [ ] **6a.** Thêm StreakBuilder vào MetaTab hoặc tạo tab riêng — UI cho nhập streak_history (5 toggle W/L), streak_count auto-calculated
- [ ] **6b.** Thêm Augment 2-1 selector — dropdown chọn augment đã pick ở 2-1
- [ ] **6c.** Thêm Pro Pick Path selector — 4 radio buttons (econ/item/combat/emblem)
- [ ] **6d.** Thêm Augment Path Tagging — cho mỗi augment trong puzzle gán path
- [ ] **6e.** Thêm Difficulty selector — radio buttons (straightforward/close_call/counter_intuitive)
- [ ] **6f.** Thêm Pro Reasoning Intent textarea — 2-3 câu giải thích intent

→ **Verify:** Admin có thể tạo puzzle 3-2 đầy đủ với streak, path, reasoning. Save thành công vào Supabase.

---

### Task 7: Extend Scoring — Intent + Pick
- [ ] **7a.** Extend `useGameFlow.handleAugmentSelect` — compute `intentScore` (path match = 10, mismatch = 0)
- [ ] **7b.** Compute `pickScore` (exact match = 10, same path different augment = 5, different path = 0)
- [ ] **7c.** Record attempt với intent data (`declared_path`, `intent_score`, `pick_score`, `time_to_path`)
- [ ] **7d.** Supabase migration: thêm columns vào `user_puzzle_attempts` hoặc tạo bảng `augment_trainer_attempts`

→ **Verify:** Scores tính đúng. Attempt data lưu vào DB.

---

### Task 8: Integration + Verification
- [ ] **8a.** Seed 1-2 puzzle 3-2 test data (hardcoded hoặc qua admin)
- [ ] **8b.** Test full flow: Game state + StreakBar → PathSelector → Augment selection → DecisionReview with intent feedback
- [ ] **8c.** Test V1 backward compat: Puzzle 2-1 vẫn chạy bình thường, không hiện PathSelector/StreakBar
- [ ] **8d.** Build check: `npm run build` passes without errors

→ **Verify:** Build passes. V1 works. V2 full flow works end-to-end.

---

## Done When

- [ ] V2 puzzle flow hoạt động: StreakBar → PathSelector → Augment pick → DecisionReview with IntentFeedback
- [ ] V1 puzzles không bị ảnh hưởng (backward compatible)
- [ ] Admin PuzzleBuilder có thể tạo puzzle 3-2 với streak + path fields
- [ ] Scoring tính đúng: intent match + pick match
- [ ] Build passes without errors (`npm run build`)

---

## Log

- [11:10] SPEC created
