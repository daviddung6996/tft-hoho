# 🚀 TFTISEASY - SHIP PLAN: Training Tool Phase 1

> **Tài liệu này dựa trên Brand Strategy từ NotebookLM notebook "tftiseasy branding notes" và đối chiếu với trạng thái hiện tại của dự án `TFT-hoho`.**
>
> **Ngày tạo:** 2026-02-26 | **Cập nhật:** 2026-02-26
> **Mục tiêu:** Ship Augment Pick Puzzle v1 (Free) — Giai đoạn 1 theo lộ trình brand

---

## 📊 ĐÁNH GIÁ HIỆN TRẠNG (Current State Audit)

### ✅ ĐÃ HOÀN THÀNH (What We Have)

| Module | Trạng thái | Files chính |
|--------|-----------|-------------|
| **Puzzle Engine** | ✅ Core hoàn thiện | `usePuzzleGame.ts`, `useGameFlow.ts`, `puzzleService.ts` |
| **Puzzle Type System** | ✅ Đầy đủ interface | `types/Puzzle.ts` (PuzzleState, PuzzleAugment, ProAction...) |
| **Arena / Board UI** | ✅ Đã build | `Board.tsx`, `Board.css`, `UnitOverlay.tsx`, `ArenaEffects.tsx` |
| **Augment Selection Flow** | ✅ Hoạt động | `AugmentButton.tsx`, `AugmentModal.tsx`, Reroll logic trong `useGameFlow.ts` |
| **Decision Review** | ✅ Cơ bản | `DecisionReview.tsx`, `ReviewCard.tsx`, `PuzzleInfo.tsx`, `ResultBanner.tsx` |
| **User Stats Tracking** | ✅ Ghi nhận | `userStatsService.ts` (recordAttempt, getUserStats, getStageBreakdown, getAccuracyTrend) |
| **Community Voting** | ✅ Hoạt động | `voteService.ts`, `puzzle_votes` table |
| **Admin Puzzle Builder** | ✅ Đầy đủ | `PuzzleBuilder/`, tabs (MetaTab, BoardTab), toolbar, hooks |
| **Authentication** | ✅ Supabase Auth | `AuthContext.tsx`, `LoginModal.tsx` |
| **Game Data Context** | ✅ Champions + Traits + Items | `GameDataContext.tsx`, JSON data files |
| **Scouting/Synergy Panels** | ✅ Build xong | `SynergyPanel.tsx`, `ScoutingPanel.tsx`, `ItemPanel.tsx` |
| **Supabase DB** | ✅ 5 migrations | users, RLS, puzzle_votes, user_puzzle_attempts, champion_stats |

### ❌ CHƯA CÓ (What's Missing — theo Brand Guidelines + T-Coin Economy)

| Tính năng | Mức ưu tiên | Vai trò |
|-----------|-------------|---------|
| **Meme Feedback System** | 🔴 P0 — Differentiator | Phản hồi bằng meme sau mỗi lựa chọn (Galaxy Brain / Hardstuck) |
| **T-Coin Economy** | 🔴 P0 — Core Economy | Hệ thống tiền tệ ảo — thưởng, tích lũy, và sử dụng để mở khóa nội dung |
| **TFT IQ Score** | 🔴 P0 — Core Metric | Hệ thống chấm điểm Elo-like cho người chơi |
| **Premium Puzzle Tiers** | 🔴 P0 — Content Gate | Phân loại puzzle Free/Advanced/Rare — Advanced & Rare mở khóa bằng T-Coin |
| **Daily Challenge** | 🟡 P1 — Habit Loop | 1 puzzle/ngày kiểu Wordle (nguồn kiếm T-Coin hàng ngày) |
| **Leaderboard** | 🟡 P1 — Competition | Bảng xếp hạng TFT IQ (tuần/tháng/all-time) |
| **Share Results** | 🟡 P1 — Virality | Chia sẻ kết quả puzzle/TFT IQ lên Discord/Twitter |
| **T-Coin Shop** | 🟡 P1 — Monetization Path | Mua T-Coin bằng tiền thật (Phase 2 monetization) |
| **Landing Page** | 🟢 P2 — Conversion | Trang giới thiệu cho người mới |
| **Decision Simulator (v2)** | 🟢 P2 — Expansion | Mô phỏng eco, ghép đồ, xếp đội hình |

---

## 💰 T-COIN ECONOMY DESIGN (Chi tiết)

### Triết lý thiết kế
> **T-Coin không phải badge hay streak.** T-Coin là tài sản thực có giá trị sử dụng thực trong hệ sinh thái TFTISEASY.
> Người dùng tích lũy T-Coin vì nó **mở khóa kiến thức giá trị** — không phải vì một thanh progress bar rỗng.

### Tại sao T-Coin > Badge/Streak:
| | Badge/Streak ❌ | T-Coin ✅ |
|---|---|---|
| **Động lực** | Nghĩa vụ giả (sợ mất chuỗi) | Tích lũy tài sản thực (muốn kiếm thêm) |
| **Giá trị** | Cosmetic, vô nghĩa | Mở khóa nội dung premium, kiến thức sâu |
| **Kinh doanh** | Dead-end, không monetize được | Con đường tự nhiên đến monetization (bán T-Coin) |
| **Tâm lý** | Guilt loop → burn out → churn | Reward loop → curiosity → retention |
| **Mở rộng** | Giới hạn (hết badge = hết hứng) | Vô hạn (thêm nội dung = thêm nhu cầu T-Coin) |

### Thu nhập T-Coin (Earning)

| Hành động | T-Coin thưởng | Ghi chú |
|-----------|--------------|---------|
| **Trả lời đúng** (Free puzzle) | +10 🪙 | Base reward |
| **Trả lời đúng + Không reroll** | +15 🪙 | +5 bonus cho "first instinct" play |
| **Trả lời đúng + Tốc độ < 10s** | +18 🪙 | +3 speed bonus |
| **Trả lời sai** (nhưng hoàn thành) | +3 🪙 | Vẫn thưởng vì đã học — không phạt |
| **Hoàn thành Daily Challenge** | +25 🪙 | Nguồn thu nhập ổn định hàng ngày |
| **Daily Challenge đúng** | +50 🪙 | Double reward cho daily |
| **Đúng 3 câu liên tiếp** | +20 🪙 bonus | Hot streak bonus (không bắt buộc duy trì) |
| **Đúng 5 câu liên tiếp** | +50 🪙 bonus | Big bonus — nhưng mất chuỗi không bị phạt |
| **Đúng 10 câu liên tiếp** | +150 🪙 bonus | Mega bonus — hiếm gặp, rất giá trị |
| **Chia sẻ kết quả (lần đầu/ngày)** | +10 🪙 | Khuyến khích viral nhưng giới hạn spam |
| **Mời bạn đăng ký (referral)** | +100 🪙 | Growth hacking tự nhiên |
| **Puzzle đầu tiên hoàn thành** | +50 🪙 | Welcome bonus — onboarding hook |

### Chi tiêu T-Coin (Spending)

| Nội dung | Giá T-Coin | Mô tả |
|----------|-----------|-------|
| **Advanced Puzzle** (mở khóa 1 lần) | 50 🪙 | Puzzle khó hơn, tình huống từ Thách Đấu |
| **Rare Puzzle** (mở khóa 1 lần) | 150 🪙 | Puzzle hiếm — tình huống cực kỳ đặc biệt, được giải thích kỹ lưỡng bởi pro player |
| **Deep Analysis** (cho bất kỳ puzzle) | 30 🪙 | Mở khóa giải thích chi tiết: tại sao đáp án đúng, winrate breakdown, board context |
| **Hint** (gợi ý trước khi chọn) | 15 🪙 | Gợi ý nhẹ: "Augment này có winrate >55% trên board này" |

### Cân bằng kinh tế (Economy Balance)

**Nguyên tắc:** Người chơi Free phải cảm thấy tiến bộ đều đặn, KHÔNG bị paywall cứng.

```
Người chơi Free trung bình:
  - Chơi 5 puzzle/ngày → ~60 🪙/ngày (base)
  - Daily Challenge → +25-50 🪙/ngày
  - Occasional streaks → +20-50 🪙/ngày
  = ~120-160 🪙/ngày

Chi tiêu trung bình:
  - 1 Advanced Puzzle/ngày → 50 🪙
  - 1 Deep Analysis/ngày → 30 🪙
  = ~80 🪙/ngày

→ Dư thừa ~50-80 🪙/ngày để tích lũy mở Rare Puzzles (cứ 2-3 ngày = 1 Rare)
→ Cảm giác: "Tôi kiếm được nhiều hơn tôi tiêu, nhưng vẫn muốn kiếm thêm để mở nhanh hơn"
```

**Phase 2 Monetization (tương lai):**
- Gói T-Coin: 500 🪙 = $2.99, 1500 🪙 = $6.99, 5000 🪙 = $19.99
- **Không bao giờ là pay-to-win** — chỉ là pay-to-access-faster
- Người chơi Free vẫn có thể mở khóa TẤT CẢ nội dung — chỉ chậm hơn

---

## � CẤU TRÚC THƯ MỤC BẮT BUỘC (theo ARCHITECTURE.md)

> 🔴 **GOLDEN RULES — KHÔNG CÓ NGOẠI LỆ:**
> 1. **Feature Grouping:** Mọi code PHẢI nằm trong `src/features/[name]/`
> 2. **No Global Pollution:** KHÔNG tạo `components/`, `services/` ở root `src/`
> 3. **shared/** chỉ chứa utilities generic (ui dumb components, hooks generic) — KHÔNG có business logic
>
> ⚠️ **Lưu ý:** Code hiện có trong `src/components/`, `src/services/`, `src/hooks/` là code legacy (pre-refactor). Code MỚI KHÔNG ĐƯỢC đặt ở đó.

### Cấu trúc các Feature mới:
```
src/features/
├── tcoin/                          # 💰 T-Coin Economy
│   ├── tcoin.service.ts            # Wallet CRUD, earn/spend logic
│   ├── tcoin.types.ts              # UserWallet, TCoinTransaction, EarnBreakdown
│   ├── hooks/
│   │   └── useTCoin.ts             # Hook quản lý state T-Coin
│   └── components/
│       ├── TCoinBalance.tsx         # Widget hiển thị số dư
│       ├── TCoinBalance.css
│       ├── TCoinEarnAnimation.tsx   # "+10 🪙" bay lên animation
│       ├── TCoinEarnAnimation.css
│       ├── TCoinHistory.tsx         # Lịch sử giao dịch
│       ├── TCoinHistory.css
│       ├── PuzzleLockOverlay.tsx    # Overlay "🔒 50 🪙"
│       ├── PuzzleLockOverlay.css
│       ├── UnlockConfirmModal.tsx   # Modal xác nhận mua
│       └── UnlockConfirmModal.css
│
├── tft-iq/                         # ⭐ TFT IQ Score
│   ├── tft-iq.service.ts           # Calculate & update IQ
│   ├── tft-iq.types.ts             # IqRank, IqScore
│   └── components/
│       ├── IqBadge.tsx              # Rank icon + score
│       ├── IqBadge.css
│       ├── IqProgressBar.tsx        # Progress bar
│       └── IqProgressBar.css
│
├── leaderboard/                    # 🏆 Leaderboard
│   ├── leaderboard.service.ts
│   └── components/
│       ├── Leaderboard.tsx
│       ├── Leaderboard.css
│       └── LeaderboardEntry.tsx
│
├── daily-challenge/                # 🎯 Daily Challenge
│   ├── daily-challenge.service.ts
│   ├── daily-challenge.types.ts
│   └── components/
│       ├── DailyChallengeCard.tsx
│       ├── DailyChallengeCard.css
│       ├── DailyResult.tsx
│       └── DailyResult.css
│
├── puzzle/                         # 🧩 Puzzle enhancements (meme, deep analysis, tiers)
│   ├── feedback/
│   │   ├── memeFeedback.data.ts     # Meme database
│   │   ├── meme.types.ts
│   │   ├── MemeFeedback.tsx
│   │   └── MemeFeedback.css
│   └── deep-analysis/
│       ├── DeepAnalysis.tsx
│       ├── DeepAnalysis.css
│       ├── WinrateBreakdown.tsx
│       └── BoardContextNote.tsx
│
└── (existing)
    ├── auth/
    ├── dashboard/
    └── match/
        └── hud/

src/shared/                         # ⚙️ Generic utilities ONLY
├── ui/
│   └── ShareButton.tsx             # Generic share (dumb component, no business logic)
├── hooks/
│   └── (useDebounce, useLocalStorage...)
└── api/

supabase/migrations/                # 🗄️ Database schema source of truth
├── (existing 5 migrations)
├── 00X_add_tcoin_economy.sql
├── 00X_add_tft_iq.sql
└── 00X_add_daily_challenge.sql
```

---

## �🗺️ LỘ TRÌNH SHIP (Shipping Roadmap)

### 🔥 SPRINT 1: MEME FEEDBACK + T-COIN FOUNDATION (1-2 tuần)
> *"Đây là thứ biến một training tool bình thường thành TFTISEASY"*

#### Task 1.1: Xây dựng Meme Feedback Engine
**Mục tiêu:** Sau mỗi lựa chọn Augment, hiển thị phản hồi bằng meme thay vì text khô khan.

**Vị trí code (theo ARCHITECTURE.md):**
```
src/features/puzzle/feedback/
├── memeFeedback.data.ts     # Meme database (correct/incorrect pools)
├── meme.types.ts            # Type definitions
├── MemeFeedback.tsx         # Component hiển thị meme
└── MemeFeedback.css         # Animation (slide-in, bounce, glow)
```

**Meme Categories:**
| Kết quả | Meme Pool | Ví dụ |
|---------|-----------|-------|
| **Đúng** (Correct) | Celebration memes | "Galaxy Brain move 🧠", "200 IQ play", "Certified Challenger" |
| **Sai** (Incorrect) | Roast memes (nhẹ nhàng, hài hước) | "This is why you're hardstuck 🤡", "Uninstall TFT", "My Gold player could never..." |
| **Đúng + Không reroll** | God-tier meme | "Built different 💎", "First time? No. First pick." |
| **Sai + Reroll sai** | Double roast | "Rerolled... and still wrong 💀", "The audacity..." |

**Integration Point:** Sửa `DecisionReview.tsx` — thêm `<MemeFeedback>` component ngay trên `ResultBanner`.

**Lưu ý quan trọng:**
- Mỗi phản hồi phải có **cả meme VÀ giải thích kèm data** (ví dụ: "This augment has 52.3% winrate on this board")
- Tone giọng: **Hài hước châm biếm nhưng không toxic** — giống anh bạn Challenger hay trêu chứ không phải bully
- Meme phải đa dạng: ít nhất **15 meme đúng + 15 meme sai** để tránh lặp lại

---

#### Task 1.2: T-Coin Economy — Backend Foundation
**Mục tiêu:** Xây dựng nền tảng backend cho hệ thống T-Coin.

**Backend (Supabase Migration):**
```sql
-- Migration: add_tcoin_economy.sql

-- Ví T-Coin của mỗi user
CREATE TABLE user_wallets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
    balance INTEGER DEFAULT 50,              -- Welcome bonus: 50 T-Coin
    total_earned INTEGER DEFAULT 50,         -- Tổng đã kiếm (all-time)
    total_spent INTEGER DEFAULT 0,           -- Tổng đã tiêu (all-time)
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Lịch sử giao dịch T-Coin (audit trail)
CREATE TABLE tcoin_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    amount INTEGER NOT NULL,                 -- Dương = kiếm, Âm = tiêu
    balance_after INTEGER NOT NULL,          -- Số dư sau giao dịch
    type TEXT NOT NULL,                      -- 'earn' | 'spend'
    reason TEXT NOT NULL,                    -- 'puzzle_correct', 'daily_challenge', 'unlock_advanced', 'deep_analysis'...
    reference_id TEXT,                       -- puzzle_id hoặc content_id liên quan
    metadata JSONB DEFAULT '{}',             -- Dữ liệu bổ sung (speed_bonus, streak_bonus...)
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Nội dung đã mở khóa bởi user (vĩnh viễn)
CREATE TABLE user_unlocked_content (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    content_type TEXT NOT NULL,              -- 'advanced_puzzle', 'rare_puzzle', 'deep_analysis', 'pro_replay'
    content_id TEXT NOT NULL,                -- ID của puzzle hoặc nội dung
    unlocked_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, content_type, content_id)
);

-- Thêm field puzzle_tier vào puzzles (hoặc column mới)
-- Sẽ xử lý qua puzzleService, thêm field 'tier' vào puzzle data
-- tier: 'free' | 'advanced' | 'rare'

-- RLS Policies
ALTER TABLE user_wallets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own wallet" ON user_wallets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System manages wallets" ON user_wallets FOR ALL USING (auth.uid() = user_id);

ALTER TABLE tcoin_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own transactions" ON tcoin_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System inserts transactions" ON tcoin_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

ALTER TABLE user_unlocked_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own unlocks" ON user_unlocked_content FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own unlocks" ON user_unlocked_content FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Index cho performance
CREATE INDEX idx_transactions_user_date ON tcoin_transactions(user_id, created_at DESC);
CREATE INDEX idx_unlocked_user ON user_unlocked_content(user_id, content_type);
```

**Frontend (theo ARCHITECTURE.md → `src/features/tcoin/`):**
```
src/features/tcoin/
├── tcoin.service.ts                # Wallet CRUD, earn/spend logic, transaction history
├── tcoin.types.ts                  # UserWallet, TCoinTransaction, EarnBreakdown
├── hooks/
│   └── useTCoin.ts                 # Hook quản lý state T-Coin (balance, earn, spend)
└── components/
    ├── TCoinBalance.tsx             # Widget hiển thị số dư (dùng ở header/sidebar)
    ├── TCoinBalance.css
    ├── TCoinEarnAnimation.tsx       # "+10 🪙" bay lên khi kiếm được
    ├── TCoinEarnAnimation.css
    ├── TCoinHistory.tsx             # Lịch sử giao dịch trong profile
    └── TCoinHistory.css
```

**Service API (`tcoinService.ts`):**
```typescript
interface TCoinService {
    // Wallet
    getBalance(): Promise<number>;
    getWallet(): Promise<UserWallet>;

    // Earning
    earnFromPuzzle(params: {
        puzzleId: string;
        isCorrect: boolean;
        rerollCount: number;
        timeToDecideMs: number;
        consecutiveCorrect: number;   // Để tính streak bonus
    }): Promise<{ earned: number; newBalance: number; breakdown: EarnBreakdown }>;

    earnFromDaily(params: {
        isCorrect: boolean;
    }): Promise<{ earned: number; newBalance: number }>;

    earnFromShare(): Promise<{ earned: number; newBalance: number }>;
    earnFromReferral(referredUserId: string): Promise<{ earned: number; newBalance: number }>;

    // Spending
    unlockContent(params: {
        contentType: 'advanced_puzzle' | 'rare_puzzle' | 'deep_analysis' | 'pro_replay' | 'hint' | 'extra_reroll';
        contentId: string;
        cost: number;
    }): Promise<{ success: boolean; newBalance: number; error?: string }>;

    isContentUnlocked(contentType: string, contentId: string): Promise<boolean>;

    // History
    getTransactionHistory(limit?: number): Promise<TCoinTransaction[]>;
}

interface EarnBreakdown {
    base: number;           // +10 hoặc +3
    noRerollBonus: number;  // +5
    speedBonus: number;     // +3
    streakBonus: number;    // +20/+50/+150
    total: number;
}
```

**Integration vào `useGameFlow.ts`:**
- Sau `handleAugmentSelect` → gọi `tcoinService.earnFromPuzzle()`
- Kết quả `EarnBreakdown` truyền xuống `DecisionReview` → hiển thị "+X 🪙" animation

---

#### Task 1.3: T-Coin UI — Balance Widget + Earn Animation
**Mục tiêu:** Người dùng luôn thấy số dư T-Coin và cảm thấy phấn khích khi kiếm được.

**TCoinBalance Widget (Header/Sidebar):**
- Icon 🪙 + Số dư (ví dụ: "🪙 247")
- Click → mở Transaction History modal
- Pulse animation khi vừa kiếm được coin

**TCoinEarnAnimation (trong DecisionReview):**
- Khi trả lời đúng: "+10 🪙" bay lên với breakdown nhỏ
  ```
  +15 🪙
  ├── Base:     +10
  ├── No reroll: +5
  └── Speed:     +0
  ```
- Khi streak bonus: "+50 🪙 STREAK BONUS!" với hiệu ứng vàng rực rỡ
- Khi trả lời sai: "+3 🪙" (nhỏ, subtle — vẫn thưởng nhưng không ăn mừng)

---

### ⭐ SPRINT 2: TFT IQ + PUZZLE TIERS (1-2 tuần)
> *"Điểm số để cạnh tranh + Nội dung để chi tiêu T-Coin"*

#### Task 2.1: TFT IQ Calculation Engine
**Mục tiêu:** Tính điểm TFT IQ dựa trên performance tổng hợp.

**Backend (Supabase):**
```sql
-- Migration: add_tft_iq.sql
CREATE TABLE user_tft_iq (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
    iq_score INTEGER DEFAULT 1000,
    iq_rank TEXT DEFAULT 'Iron',
    total_puzzles_solved INTEGER DEFAULT 0,
    accuracy_weight DECIMAL DEFAULT 0,
    speed_weight DECIMAL DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE user_tft_iq ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON user_tft_iq FOR SELECT TO authenticated USING (true);
CREATE POLICY "Own update" ON user_tft_iq FOR ALL USING (auth.uid() = user_id);
```

**IQ Calculation Formula:**
```
Base: ±25 points per puzzle (như Elo)
Modifiers:
  + Accuracy bonus:     đúng = +25, sai = -15 (asymmetric để khuyến khích)
  + Speed bonus:        < 10s = +5, < 20s = +3, < 30s = +1
  + No-reroll bonus:    đúng mà không reroll = +10
  + Difficulty weight:  Rare puzzle = x2.0, Advanced = x1.5, Free = x1.0
```

**IQ Rank Mapping:**
| IQ Score | Rank | Icon |
|----------|------|------|
| 0-499 | Iron | 🪨 |
| 500-799 | Bronze | 🥉 |
| 800-999 | Silver | 🥈 |
| 1000-1199 | Gold | 🥇 |
| 1200-1399 | Platinum | 💠 |
| 1400-1599 | Diamond | 💎 |
| 1600-1799 | Master | ⚔️ |
| 1800-1999 | Grandmaster | 🔮 |
| 2000+ | Challenger | 👑 |

**Frontend (theo ARCHITECTURE.md → `src/features/tft-iq/`):**
```
src/features/tft-iq/
├── tft-iq.service.ts
├── tft-iq.types.ts
└── components/
    ├── IqBadge.tsx
    ├── IqBadge.css
    ├── IqProgressBar.tsx
    └── IqProgressBar.css
```

**Integration Points:**
- `UserProfileModal.tsx` — Hiển thị IQ Score + Rank prominently
- `DecisionReview.tsx` — Hiển thị "+25 IQ" hoặc "-15 IQ" sau mỗi puzzle
- Header/Sidebar — Badge nhỏ hiển thị current IQ rank

---

#### Task 2.2: Puzzle Tier System (Free / Advanced / Rare)
**Mục tiêu:** Phân loại puzzles thành 3 tier, Advanced & Rare yêu cầu T-Coin để mở khóa.

**Puzzle Tier Definitions:**
| Tier | Icon | Giá T-Coin | Mô tả |
|------|------|-----------|-------|
| **Free** | 🟢 | 0 🪙 | Puzzle cơ bản, ai cũng chơi được. Nguồn kiếm T-Coin chính |
| **Advanced** | 🟡 | 50 🪙 | Puzzle khó hơn từ trận đấu Thách Đấu. Tình huống phức tạp hơn |
| **Rare** | 🔴 | 150 🪙 | Puzzle hiếm — tình huống 1-in-100 game. Giải thích cực kỳ chi tiết bởi pro player, kèm VOD timestamp, board context đầy đủ, phân tích tất cả lựa chọn |

**Thay đổi trong Puzzle Schema:**
- Thêm field `tier: 'free' | 'advanced' | 'rare'` vào puzzle data trong Supabase
- `PuzzleBuilder/MetaTab.tsx` — thêm dropdown chọn tier
- Thêm field `detailed_explanation: string` (chỉ cho Advanced & Rare)
- Thêm field `pro_vod_timestamp: number` (chỉ cho Rare)

**UI Behavior:**
- **Free puzzles:** Chơi ngay, không cần gì
- **Advanced puzzles:** Hiển thị trên list nhưng có khóa 🔒. Click → "Mở khóa với 50 🪙?" → Confirmation → Mở vĩnh viễn
- **Rare puzzles:** Hiển thị với border vàng đặc biệt + icon hiếm. Click → "Mở khóa với 150 🪙?" → Mở vĩnh viễn + Deep analysis tự động kèm theo

**Lock Screen Component (theo ARCHITECTURE.md → `src/features/tcoin/`):**
```
src/features/tcoin/components/
├── PuzzleLockOverlay.tsx    # Overlay "🔒 50 🪙 để mở khóa"
├── PuzzleLockOverlay.css
├── UnlockConfirmModal.tsx   # Modal xác nhận mua
└── UnlockConfirmModal.css
```

---

#### Task 2.3: Leaderboard
**Mục tiêu:** Bảng xếp hạng để kích thích cạnh tranh.

**Frontend (theo ARCHITECTURE.md → `src/features/leaderboard/`):**
```
src/features/leaderboard/
├── leaderboard.service.ts
└── components/
    ├── Leaderboard.tsx
    ├── Leaderboard.css
    └── LeaderboardEntry.tsx
```

**Tabs:** `Tuần này` | `Tháng này` | `Mọi thời đại`
**Hiển thị mỗi hàng:** Avatar, Tên, TFT IQ, Rank Icon, T-Coin earned (tuần)

---

### 🎯 SPRINT 3: DAILY CHALLENGE + SHARE (1-2 tuần)
> *"Vòng lặp thói quen + Marketing 0 đồng — nguồn kiếm T-Coin hàng ngày"*

#### Task 3.1: Daily Challenge System
**Mục tiêu:** 1 puzzle mỗi ngày. Nguồn T-Coin ổn định nhất — tạo lý do quay lại mỗi ngày.

**Khác biệt với puzzle thường:**
- Daily Challenge luôn **FREE** — không tốn T-Coin
- Thưởng T-Coin cao hơn: +25 🪙 (hoàn thành) / +50 🪙 (đúng)
- Tất cả user chơi cùng 1 puzzle → tạo thảo luận cộng đồng
- Kết quả dạng emoji grid (Wordle-style) để share

**Backend:**
```sql
-- Migration: add_daily_challenge.sql
CREATE TABLE daily_challenges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    puzzle_id TEXT NOT NULL,
    challenge_date DATE NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE daily_challenge_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    challenge_date DATE NOT NULL,
    is_correct BOOLEAN NOT NULL,
    reroll_count INTEGER DEFAULT 0,
    time_to_decide_ms INTEGER,
    tcoin_earned INTEGER DEFAULT 0,
    completed_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, challenge_date)
);

ALTER TABLE daily_challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON daily_challenges FOR SELECT TO authenticated USING (true);
ALTER TABLE daily_challenge_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own results" ON daily_challenge_results FOR ALL USING (auth.uid() = user_id);
```

**Frontend (theo ARCHITECTURE.md → `src/features/daily-challenge/`):**
```
src/features/daily-challenge/
├── daily-challenge.service.ts
├── daily-challenge.types.ts
└── components/
    ├── DailyChallengeCard.tsx
    ├── DailyChallengeCard.css
    ├── DailyResult.tsx
    └── DailyResult.css
```

**Emoji Grid Result (Wordle-style):**
```
🧩 TFTISEASY Daily #42
🟩 Chọn đúng | ⏱️ 8.2s | 🔄 0 rerolls
💰 +50 🪙 earned
TFT IQ: 1,342 (Diamond 💎)

#TFTISEASY #TFTDaily
```

---

#### Task 3.2: Share Results
**Mục tiêu:** Nút chia sẻ kết quả lên Discord/Twitter/Clipboard. Kiếm +10 🪙 mỗi lần share đầu tiên/ngày.

**Frontend:**
- `src/shared/ui/ShareButton.tsx` — Generic share button (dumb component, không có business logic)
- `src/shared/ui/ShareButton.css`
- Share formatting logic nằm trong feature sử dụng nó:
  - `src/features/puzzle/feedback/shareFormatter.ts` — Format kết quả puzzle
  - `src/features/daily-challenge/shareFormatter.ts` — Format kết quả daily

**Share Targets:**
1. **Copy to Clipboard** (Ưu tiên — dùng cho Discord paste)
2. **Twitter/X** (Web Intent URL)
3. **Facebook** (Share dialog)

**Integration Points:**
- `DecisionReview.tsx` → Nút Share sau mỗi puzzle + "+10 🪙" nếu chưa share hôm nay
- `DailyResult.tsx` → Nút Share kết quả daily
- `UserProfileModal.tsx` → Nút Share TFT IQ card

---

### 🏗️ SPRINT 4: T-COIN SHOP + DEEP ANALYSIS + POLISH (1-2 tuần)
> *"Hoàn thiện vòng lặp kinh tế — người dùng có lý do rõ ràng để chi tiêu T-Coin"*

#### Task 4.1: Deep Analysis (T-Coin unlockable)
**Mục tiêu:** Giải thích sâu cho mỗi puzzle — mở khóa bằng 30 🪙.

**Nội dung Deep Analysis bao gồm:**
- **Tại sao đáp án đúng:** Giải thích chi tiết tại sao pro player chọn augment này
- **Winrate Breakdown:** So sánh winrate của tất cả lựa chọn trên board này
- **Board Context:** Phân tích tại sao board hiện tại synergize với augment được chọn
- **Common Mistakes:** Tại sao các lựa chọn khác sai — lỗi tư duy phổ biến
- **Pro VOD Link:** (Rare puzzles) — Timestamp chính xác để xem pro player ra quyết định

**Frontend (theo ARCHITECTURE.md → `src/features/puzzle/deep-analysis/`):**
```
src/features/puzzle/deep-analysis/
├── DeepAnalysis.tsx       # Panel giải thích chi tiết
├── DeepAnalysis.css
├── WinrateBreakdown.tsx   # Chart so sánh winrate
└── BoardContextNote.tsx   # Ghi chú về board context
```

**Integration:** Nút "🔍 Phân tích sâu — 30 🪙" trong `DecisionReview.tsx`
- Nếu chưa mở khóa → Hiện modal xác nhận
- Nếu đã mở khóa → Hiển thị panel trượt xuống

---

#### Task 4.2: T-Coin Transaction History + Wallet Page
**Mục tiêu:** Người dùng có thể xem lịch sử kiếm/tiêu T-Coin chi tiết.

**Trong `UserProfileModal.tsx` thêm tab "Ví T-Coin":**
- Số dư hiện tại (lớn, prominent)
- Tổng đã kiếm / Tổng đã tiêu
- Lịch sử giao dịch (scroll, nhóm theo ngày)
- Nội dung đã mở khóa (list puzzles đã unlock)

#### Task 4.3: Difficulty Tags (thu gọn từ plan cũ)
- Thêm field `difficulty: 'easy' | 'medium' | 'hard'` vào puzzle data
- Filter UI: Pills Easy/Medium/Hard trên puzzle list
- IQ calculation sử dụng difficulty weight

---

## 📋 TỔNG KẾT ƯU TIÊN

### Ship Checklist — Phase 1 Minimum Viable Ship (4-6 tuần)

| # | Task | Sprint | Ưu tiên | Trạng thái |
|---|------|--------|---------|------------|
| 1 | Meme Feedback Engine | Sprint 1 | 🔴 P0 | ⬜ Chưa bắt đầu |
| 2 | T-Coin Economy Backend (wallet, transactions, unlocks) | Sprint 1 | 🔴 P0 | ⬜ Chưa bắt đầu |
| 3 | T-Coin UI (Balance Widget + Earn Animation) | Sprint 1 | 🔴 P0 | ⬜ Chưa bắt đầu |
| 4 | TFT IQ Score Engine | Sprint 2 | 🔴 P0 | ⬜ Chưa bắt đầu |
| 5 | Puzzle Tier System (Free/Advanced/Rare + Lock UI) | Sprint 2 | 🔴 P0 | ⬜ Chưa bắt đầu |
| 6 | Leaderboard | Sprint 2 | 🟡 P1 | ⬜ Chưa bắt đầu |
| 7 | Daily Challenge System (+ T-Coin integration) | Sprint 3 | 🟡 P1 | ⬜ Chưa bắt đầu |
| 8 | Share Results (+ T-Coin reward) | Sprint 3 | 🟡 P1 | ⬜ Chưa bắt đầu |
| 9 | Deep Analysis (T-Coin unlockable content) | Sprint 4 | 🟡 P1 | ⬜ Chưa bắt đầu |
| 10 | T-Coin Wallet Page + Transaction History | Sprint 4 | 🟡 P1 | ⬜ Chưa bắt đầu |
| 11 | Difficulty Tags | Sprint 4 | 🟢 P2 | ⬜ Chưa bắt đầu |
| 12 | Thêm ≥ 30 Puzzles thật (Challenger data, đa tier) | Ongoing | 🔴 P0 | ⬜ Chưa bắt đầu |
| 13 | Landing Page + SEO | Pre-Launch | 🟢 P2 | ⬜ Chưa bắt đầu |

### T-Coin Economy Metrics to Track Post-Launch
- **T-Coin Velocity:** Tỷ lệ kiếm/tiêu trung bình — nếu kiếm quá nhiều → lạm phát, nếu quá ít → frustration
- **Unlock Rate:** % users mở khóa ≥ 1 Advanced/Rare puzzle/tuần
- **Daily Challenge Return Rate:** % users quay lại mỗi ngày (do T-Coin incentive)
- **Conversion Funnel (Phase 2):** % Free users chuyển sang mua T-Coin
- **DAU/MAU** — Daily/Monthly Active Users
- **Share Rate** — % users chia sẻ kết quả (boosted bởi T-Coin reward)
- **TFT IQ Distribution** — Phân bổ điểm để cân bằng formula

---

## 🎨 NGUYÊN TẮC THIẾT KẾ (theo Hextech Design System)

Tất cả UI mới phải tuân theo Hextech Core design system đã có trong dự án:
- **Colors:** Sử dụng bảng màu hiện tại (hextech gold, gradient backgrounds)
- **T-Coin Icon:** 🪙 hoặc custom SVG coin với chữ "T" — màu gold (#FFD700) với viền hextech
- **Animation:** Micro-interactions cho meme feedback (bounce, slide-in, pulse) và T-Coin earn (+X bay lên)
- **Typography:** Giữ nhất quán với font system hiện tại
- **Responsive:** Desktop-first (target audience chơi TFT trên PC)
- **Tone:** "Learn TFT, but make it fun" — Hài hước nhưng vẫn chuyên nghiệp

---

## ⚡ QUICK START — Bắt đầu từ đâu?

**Khuyến nghị:** Bắt đầu Sprint 1 ngay vì:
1. **Meme Feedback** là differentiator #1 — không có đối thủ nào làm điều này
2. **T-Coin Foundation** là nền tảng cho MỌI tính năng sau này — build sớm = integrate dễ
3. Cả 2 task này đều modify các component đã build xong (DecisionReview, useGameFlow)
4. Impact cao nhất với effort thấp nhất

**Câu lệnh bắt đầu:** "Implement Sprint 1: Meme Feedback + T-Coin Economy"

---

> *"Learn TFT, but make it fun."* — TFTISEASY Brand Philosophy
> *"T-Coin: Earn knowledge, spend wisely."* — TFTISEASY Economy Philosophy
