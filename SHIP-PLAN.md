# 🚀 TFTISEASY - SHIP PLAN v3: Tilt & Flex Entertainment Machine

> **Triết lý cốt lõi:** "Addictive first, flex second."
> Bên ngoài = Training tool chính danh. Bên trong = **Xả tilt + Validation machine.**
> "Tao chọn đúng như Pro hết rồi, IQ cao gần bằng Pro — nhưng vô game cứ top 8, DO ĐEN THÔI!"
>
> **Ngày tạo:** 2026-02-26 | **Cập nhật:** 2026-03-02 (v3.2 — Sprint 2 Complete Edition)
> **Mục tiêu:** Ship Augment Pick Puzzle v1 (Free) — Tối ưu cho thị trường VN, 0 budget

---

## 🚨 V3 REALITY CHECK — TẠI SAO PHẢI VIẾT LẠI?

### Ảo tưởng cũ (v2) vs Thực tế VN

| Ảo tưởng v2 | Thực tế thị trường |
|---|---|
| "Họ muốn giỏi hơn cả Pro, grind IQ để flex" | 80%+ post FB/X là casual tilt hoặc tìm duo/validation. KHÔNG ai khoe "tool IQ". Flex = in-game rank hoặc meme roast |
| "Vanity cosmetics sẽ bán được" | Avatar frame trên tool lạ = 0 giá trị khi DAU < 10k. Họ flex border Riot làm sẵn, không third-party |
| "Daily Challenge + seasonal reset = habit loop" | 60% user là kiểu tilt → quit 3 ngày → quay lại khi patch mới. Puzzle hàng ngày bị ignore khi tilt |
| "Streamer mode + creator leaderboard" | Streamer nhỏ VN care content dễ viral (reaction, drama). Tool phức tạp → thử 1-2 lần → bỏ nếu không tăng viewer |
| "Cosmetic shop Phase 2 = monetization" | Dự trù monetization dựa trên hype, không data. 0 user = 0 revenue từ vanity |

### Thay đổi tư duy

```
❌ CŨ: "Flex or Die" — build vanity rồi pray for users
✅ MỚI: "Addictive first, flex second" — tạo thói quen trước, flex layer sau

Hỏi mỗi ngày: "Feature này giải quyết TILT thật hay chỉ làm tao cảm thấy sản phẩm cool?"

Kill metric: Nếu không có 200 DAU active sau 14 ngày → PIVOT hoặc KILL project.
```

---

## 📊 ĐÁNH GIÁ HIỆN TRẠNG (Current State)

### ✅ ĐÃ HOÀN THÀNH (Sprint 1 — Done)

| Module | Trạng thái | Ghi chú |
|--------|-----------|---------|
| **Puzzle Engine** | ✅ Core hoàn thiện | `usePuzzleGame.ts`, `useGameFlow.ts`, `puzzleService.ts` |
| **Puzzle Type System** | ✅ Đầy đủ | `types/Puzzle.ts` |
| **Arena / Board UI** | ✅ Đã build | `Board.tsx`, `UnitOverlay.tsx`, `ArenaEffects.tsx` |
| **Augment Selection Flow** | ✅ Hoạt động | `AugmentButton.tsx`, `AugmentModal.tsx` |
| **Decision Review** | ✅ Có meme + IQ | `DecisionReview.tsx`, `ReviewCard.tsx` |
| **Meme Feedback System** | ✅ Hoàn thành | Phản hồi meme sau mỗi lựa chọn — tạo drama reaction |
| **TFT IQ Score Engine** | ✅ Hoàn thành | Hệ thống IQ cho cả Pro và User — nguồn validation |
| **Flex Card (Video/Image)** | ✅ Hoàn thành | Auto-gen ảnh/video flex đẹp — viral engine |
| **User Stats Tracking** | ✅ Ghi nhận | `userStatsService.ts` |
| **Community Voting** | ✅ Hoạt động | `voteService.ts` |
| **Admin Puzzle Builder** | ✅ Đầy đủ | `PuzzleBuilder/` |
| **Authentication** | ✅ Supabase Auth | `AuthContext.tsx` |
| **Game Data Context** | ✅ Champions + Traits + Items | `GameDataContext.tsx` |
| **Supabase DB** | ✅ Migrations | users, RLS, puzzle_votes, user_puzzle_attempts, champion_stats |

### ✅ ĐÃ HOÀN THÀNH (Sprint 2 — DONE)

| Module | Trạng thái | Ghi chú |
|--------|-----------|---------|
| **Pro Supporter System** | ✅ Hoàn thành | `features/pro-supporter/` — service, hooks, components, ProBadge, ProSupporterBanner |
| **Pro Supporter Bypass** | ✅ Hoạt động | Bypass lock screen + redirect cho Pro user |
| **T-Coin Economy** | ✅ Hoàn thành | `features/tcoin/` — service, hooks, TCoinBalance, TCoinEarnAnimation, TCoinIcon |
| **Puzzle Lock Overlay** | ✅ Hoàn thành | `PuzzleLockOverlay.tsx/css` — Free/Advanced/Rare tier gate |
| **Admin: ProIQ Manager** | ✅ Hoàn thành | `pages/Admin/ProIqManager/` |
| **Admin: Race Condition Fix** | ✅ Fixed | Menu/content mismatch khi navigate nhanh |
| **CSS Unification (hextech-vars)** | ✅ Done | Tất cả component dùng design tokens từ `hextech-vars.css` |
| **Page Transitions** | ✅ Done | Smooth transitions áp dụng toàn menu |
| **Preloader Animation** | ✅ Restored | Pure HTML/CSS, không ảnh hưởng LCP/PageSpeed |
| **CompList Styling** | ✅ Done | Hextech gold border, glow, delete button UX |
| **Tier List UX (Accordion)** | ✅ Done | Inline CompDetail expand, 1 row at a time |
| **Infographic Export** | ✅ Done | 16:9 TFT patch note style, S/A/Trap tiers |
| **Localization (VN)** | ✅ Done | Toàn bộ UI/text dịch sang tiếng Việt |

### ❌ CẦN LÀM TIẾP (v3 — Lean & Mean)

| Tính năng | Ưu tiên | Vai trò |
|-----------|---------|---------|
| **30 Puzzles thật (Challenger data)** | 🔴 P0 | Không có content chất = chết. Đây là #1 |
| **T-Coin Economy (đơn giản)** | 🔴 P0 | Chỉ earn/spend cơ bản — mở khóa puzzle tier |
| **Puzzle Tier System (Free/Advanced/Rare)** | 🔴 P0 | Tạo lý do grind T-Coin — "puzzle khó hơn = validation mạnh hơn" |
| **Daily Challenge (đơn giản)** | 🟡 P1 | 1 puzzle/ngày — nguồn drama FB group | đây là GLOBAL PUZZLE như WORDLE!
| **Leaderboard (đơn giản)** | 🟡 P1 | Top IQ tuần — chỉ cần bảng xếp hạng, không seasonal reset |
| **Landing Page (ego hook)** | 🟢 P2 | SEO + hook bằng ego challenge |

### 🗑️ ĐÃ CẮT (v2 → v3)

| Feature bị cắt | Lý do |
|-----------------|-------|
| ~~Cosmetic Shop~~ | 0 user = 0 revenue. Chỉ hấp dẫn khi DAU > 10k |
| ~~Animated Badge Collection~~ | Top 5% feature — không đủ user để nuôi |
| ~~Public Profile Page (full)~~ | Quá sớm. Chỉ cần share card là đủ |
| ~~Seasonal Rank Reset~~ | Giả định user quay lại mỗi season — ảo tưởng khi chưa có traction |
| ~~Deep Analysis (paid)~~ | Không ai trả T-Coin cho phân tích khi chưa nghiện tool |
| ~~Streamer Mode (complex)~~ | Đơn giản hóa: chỉ cần Kahoot-style quiz cho viewer |
| ~~Badge Animation System~~ | Vanity layer — kill khi chưa có DAU |
| ~~Profile Background Custom~~ | Vanity layer — kill |
| ~~Share Image Theme Shop~~ | Vanity layer — kill |
| ~~Title/Danh hiệu Shop~~ | Vanity layer — kill |
| ~~Meme Pack Shop~~ | Vanity layer — kill |
| ~~Monetization Phase 2 ($29k-99k VND bundles)~~ | Hype-based planning — chưa có data |

---

## 🧠 TƯ DUY CHIẾN LƯỢC v3: TILT & FLEX ENTERTAINMENT

### Sự thật về game thủ TFT VN

```
70% = mobile casual, tilt-and-rage cycle
80%+ post FB = tilt rant, tìm duo, validation xã hội
Họ KHÔNG grind third-party puzzle để "chứng minh"
Họ flex IN-GAME rank hoặc meme roast

Cycle thật:
  Tilt → Quit 3 ngày → Patch mới → Quay lại → Tilt lại
  
Cơ hội của TFTISEASY:
  Tilt → Chơi puzzle → "Tao chọn đúng như Pro!" → Validation → Share → Quay lại
```

### Sản phẩm thật sự là gì?

```
Bề ngoài: "Training tool giúp bạn pick augment đúng như Pro"
Bên trong: "Máy xả tilt + Validation machine"

Tâm lý người dùng:
  "Tao top 8 hoài nhưng IQ tao cao hơn Pro lận → do đen thôi!"
  "73% Diamond chọn sai mà tao đúng → tao giỏi thật chứ không phải lỗi tao"
  → Validation = thuốc giảm đau cho tilt
  → Share ảnh flex = chứng minh cho bản thân + bạn bè
```

### Công thức lan truyền (v3 — thực tế)

```
Tool hay × 0 distribution = 0 users         (vẫn đúng)
Tool hay × Ego challenge post = Organic      (FB group strategy)

KHÔNG phải: "Nhìn IQ tao này" (quá direct, cringe)
MÀ LÀ:     "73% Diamond chọn sai cái này, haha... cùi bắp VL. Tao đúng 10/10, mày sao?"
            → Thách thức gián tiếp → Ego hurt → Click → Nghiện
```

---

## 💰 MONETIZATION v3.1: Pro Supporter Edition

### 🚨 Điểm mù đã sửa

```
❌ CŨ: "T-Coin grind + tier unlock = cốt lõi monetization"
   → 95% player VN không thèm grind coin để mở "Rare puzzle 1/100"
   → Tilt → cần validation NGAY, không grind

❌ CŨ: "Cosmetic shop sẽ bán khi DAU cao"
   → Vẫn 0 giá trị. Avatar frame trên tool lạ = ai care?

✅ MỚI: Cốt lõi thật =  TÊN tftiseasy#00000 CỦA BẠN.
   → Người ta không mua puzzle. Họ mua "gần Pro thật hơn".
   → "Pro training tool có Challenger thật review" = sẵn sàng chi 50-100k.
   → Đây là "support dev pro" chứ không phải IAP tool lạ.
```

### Giai đoạn 1: Donate + Reward Tier (Bắt đầu ngay)

| Tier | Giá | Quyền lợi |
|------|-----|-----------|
| **Cảm ơn** | 20k VND | Shoutout công khai + tên trên Flex Card "Supported by..." |
| **Fan cứng** | 50k VND | 1 coaching note siêu chi tiết (tftiseasy#00000 review game của bạn) |

**Implementation:**
- Nút **"☕ Ủng hộ tftiseasy"** ở header + sau mỗi `ResultBanner`
- Dùng Ko-fi / BuyMeACoffee / chuyển khoản QR VN (MoMo/ZaloPay)
- **KHÔNG làm:** Rewarded ads (làm tool kém premium), bán T-Coin trực tiếp

### Giai đoạn 2: Pro Supporter Pass (Ưu tiên #1 — scale được)

> **Tại sao match VN:** Player Diamond+ sẵn sàng chi 50-100k cho "gần pro thật".
> Họ thấy tên tftiseasy#00000 là mua NGAY. Không phải nạp coin lẻ tẻ, không paywall cứng.
> Đây là "support dev pro" chứ không phải IAP tool lạ.

| Gói | Giá | Quyền lợi chính |
|-----|-----|-----------------|
| **Pro Supporter Monthly** | 49k VND/tháng | Unlimited Advanced/Rare puzzles + explanation từ tftiseasy#00000 |
| **Pro Supporter Lifetime** | 299k VND | Như trên + badge "Pro Supporter Verified" trên Flex Card + 1 custom puzzle request |
| **Sponsored Pack** | FREE | Có tag sponsor, vẫn tính T-Coin earn bình thường |

**Pro Supporter quyền lợi chi tiết:**
- ✅ Bypass toàn bộ T-Coin lock trên Advanced + Rare puzzles
- ✅ Deep explanation + positioning note curated by tftiseasy#00000 (viết ngắn 30-60s mỗi puzzle)
- ✅ Early access 3 puzzle mới/tuần
- ✅ Badge "Pro Supporter – tftiseasy#00000 ✓" trên Flex Card
- ✅ Hint miễn phí (không tốn T-Coin)

**Backend (Supabase Migration):**
```sql
-- Migration: add_pro_supporter_v3_1.sql

-- Pro Supporter subscriptions
CREATE TABLE pro_supporters (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
    plan TEXT NOT NULL,              -- 'monthly' | 'lifetime'
    status TEXT NOT NULL DEFAULT 'active',  -- 'active' | 'expired' | 'cancelled'
    started_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ,         -- NULL for lifetime
    payment_ref TEXT,               -- Payment gateway reference
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE pro_supporters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own sub" ON pro_supporters FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Public check supporter status" ON pro_supporters FOR SELECT TO authenticated
    USING (status = 'active');

CREATE INDEX idx_supporters_user ON pro_supporters(user_id);
CREATE INDEX idx_supporters_status ON pro_supporters(status);

-- Donations tracking
CREATE TABLE donations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),  -- nullable for anonymous
    amount INTEGER NOT NULL,          -- VND
    tier TEXT NOT NULL,                -- 'thanks' | 'superfan'
    message TEXT,
    payment_ref TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read donations" ON donations FOR SELECT TO authenticated USING (true);
```

### T-Coin vẫn giữ (Free engagement layer)

> T-Coin = **gamification miễn phí**, KHÔNG phải monetization.
> Free player vẫn grind T-Coin để mở khóa puzzle từ từ.
> Pro Supporter = bypass tất cả → cảm giác "VIP instant access".

**Earning (giữ nguyên):**

| Hành động | T-Coin | Ghi chú |
|-----------|--------|---------|
| **Trả lời đúng** (Free puzzle) | +5 🪙 | Base reward |
| **Trả lời đúng + Không reroll** | +8 🪙 | +3 bonus |
| **Trả lời đúng + Tốc độ < 10s** | +10 🪙 | +2 speed bonus |
| **Trả lời sai** | +1 🪙 | Vẫn thưởng — vì đã chơi |
| **Daily Challenge hoàn thành** | +15 🪙 | Nguồn ổn định |
| **Daily Challenge đúng** | +30 🪙 | Double reward |
| **Đúng 3 câu liên tiếp** | +10 🪙 bonus | Streak nhẹ |
| **Đúng 5 câu liên tiếp** | +25 🪙 bonus | |
| **Chia sẻ kết quả (lần đầu/ngày)** | +5 🪙 | Viral incentive |
| **Puzzle đầu tiên** | +30 🪙 | Welcome bonus |

**Spending (cho free player):**

| Nội dung | Giá T-Coin | Pro Supporter |
|----------|-----------|---------------|
| **Advanced Puzzle** (mở khóa vĩnh viễn) | 30 🪙 | ✅ FREE (bypass) |
| **Rare Puzzle** (mở khóa vĩnh viễn) | 100 🪙 | ✅ FREE (bypass) |
| **Hint** | 10 🪙 | ✅ FREE |

**Backend T-Coin (Supabase Migration):**
```sql
-- Migration: add_tcoin_economy_v3_1.sql

CREATE TABLE user_wallets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
    balance INTEGER DEFAULT 30,
    total_earned INTEGER DEFAULT 30,
    total_spent INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE tcoin_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    amount INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,
    type TEXT NOT NULL,           -- 'earn' | 'spend'
    reason TEXT NOT NULL,         -- 'puzzle_correct', 'daily_challenge', 'unlock_advanced', 'hint'
    reference_id TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE user_unlocked_puzzles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    puzzle_id TEXT NOT NULL,
    tier TEXT NOT NULL,           -- 'advanced' | 'rare'
    unlocked_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, puzzle_id)
);

-- RLS
ALTER TABLE user_wallets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own wallet" ON user_wallets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users manage own wallet" ON user_wallets FOR ALL USING (auth.uid() = user_id);

ALTER TABLE tcoin_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own tx" ON tcoin_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own tx" ON tcoin_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

ALTER TABLE user_unlocked_puzzles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own unlocks" ON user_unlocked_puzzles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own unlocks" ON user_unlocked_puzzles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_tx_user_date ON tcoin_transactions(user_id, created_at DESC);
CREATE INDEX idx_unlocked_user ON user_unlocked_puzzles(user_id);
```

**Frontend:**
```
src/features/tcoin/
├── tcoin.service.ts           # Wallet CRUD, earn/spend, check Pro Supporter bypass
├── tcoin.types.ts             # UserWallet, TCoinTransaction
├── hooks/
│   └── useTCoin.ts            # Hook quản lý state
└── components/
    ├── TCoinBalance.tsx + css  # Widget header
    ├── TCoinEarnAnimation.tsx  # +X bay lên khi earn
    └── PuzzleLockOverlay.tsx   # "🔒 30 🪙" hoặc "⭐ Pro Supporter" badge

src/features/pro-supporter/
├── proSupporter.service.ts    # Check status, validate payment
├── proSupporter.types.ts
└── components/
    ├── ProSupporterBanner.tsx  # CTA sau ResultBanner
    ├── DonateButton.tsx        # "☕ Ủng hộ" ở header
    └── ProBadge.tsx            # Badge trên Flex Card
```

---

## 🗺️ LỘ TRÌNH SHIP v3.1 (Lean Roadmap)

> ⚡ **Nguyên tắc:** Ship nhanh nhất có thể. Kill metric: 200 DAU sau 14 ngày.

### 🔥 SPRINT 2: CONTENT + ECONOMY + MONETIZE (1-2 tuần)
> *"Content = sản phẩm. Pro Supporter = monetization. T-Coin = engagement layer."*

#### Task 2.1: 30 Puzzles Thật (Challenger Data) — 🔴 P0 #1
**Mục tiêu:** Tối thiểu 30 puzzles chất lượng từ game Challenger thật.

**Tại sao đây là P0 #1:**
```
0 puzzles chất = 0 giá trị = 0 retention
Meme + IQ + Flex Card đã có → nhưng chỉ là wrapper
Content IS the product. Wrapper chỉ làm content hấp dẫn hơn.
```

**Yêu cầu:**
- 20 Free puzzles (cơ bản, ai cũng chơi)
- 7 Advanced puzzles (tình huống phức tạp hơn)
- 3 Rare puzzles (tình huống hiếm, có giải thích kỹ)
- Mỗi puzzle: Board state thật, 3 augment options, pro explanation ngắn
- **5 puzzle đầu tiên có explanation ký tên tftiseasy#00000** (dùng uy tín pro thật)

---

#### Task 2.2: Pro Supporter Pass + Donate (Monetization) — 🔴 P0
**Mục tiêu:** Implement Pro Supporter Pass — monetization match VN market.

**Implementation:**
1. Supabase tables: `pro_supporters` + `donations`
2. Payment integration: MoMo QR / ZaloPay / chuyển khoản VN (đơn giản nhất)
3. Nút **"☕ Ủng hộ tftiseasy"** ở header + sau mỗi `ResultBanner`
4. Pro Supporter check trong puzzle unlock logic (bypass T-Coin)
5. Badge "Pro Supporter ✓" trên Flex Card

---

#### Task 2.3: T-Coin Economy + Puzzle Tiers — 🔴 P0
**Mục tiêu:** T-Coin earn/spend (free engagement) + Puzzle tier system.

**Puzzle Tiers:**

| Tier | Icon | Free Player | Pro Supporter |
|------|------|-------------|---------------|
| **Free** | 🟢 | Chơi ngay | Chơi ngay |
| **Advanced** | 🟡 | 30 🪙 mở khóa | ✅ FREE bypass |
| **Rare** | 🔴 | 100 🪙 mở khóa | ✅ FREE bypass + explanation từ tftiseasy#00000 |

**Validation message theo tier:**
- Free: "Bạn chọn đúng như Pro!"
- Advanced: "Chỉ 30% Challenger pick đúng — bạn nằm trong top!"
- Rare: "Tình huống hiếm 1/100 game — bạn có tư duy Pro thật sự"

**Thay đổi cần thiết:**
- Thêm field `tier: 'free' | 'advanced' | 'rare'` vào puzzle schema
- `PuzzleBuilder/MetaTab.tsx` — dropdown chọn tier
- `PuzzleLockOverlay.tsx` — "🔒 30 🪙" hoặc "⭐ Pro Supporter unlock tất cả"
- Unlock logic: check `pro_supporters` status TRƯỚC, fallback to T-Coin

---

### ⭐ SPRINT 3: HABIT LOOP + DISTRIBUTION PREP (1 tuần)
> *"Tạo lý do quay lại mỗi ngày + chuẩn bị vũ khí distribution"*

#### Task 3.1: Daily Challenge (Đơn giản) — 🟡 P1
**Mục tiêu:** 1 puzzle FREE mỗi ngày, tất cả users chơi cùng 1 puzzle.

**Tại sao giữ (dù user cycle tilt):**
```
Tilt → quit 3 ngày: OK. Daily Challenge vẫn đợi.
Quay lại: "Ơ puzzle hôm nay dễ vl mà 60% sai?" → chơi → hook lại.
Không bắt buộc streak liên tục — chỉ cần FOMO nhẹ.
```

**Cơ chế:**
- Admin chọn puzzle of the day (hoặc auto-rotate từ pool)
- Reward: +15 🪙 (hoàn thành) / +30 🪙 (đúng)
- Kết quả → auto Flex Card → share
- **Drama hook:** Hiển thị % người chơi sai hôm nay → ego trigger

**KHÔNG làm:** Streak calendar, miss penalty, seasonal quest.

---

#### Task 3.2: Leaderboard (Đơn giản) — 🟡 P1
**Mục tiêu:** Bảng xếp hạng TFT IQ — chỉ top tuần.

**Cơ chế:**
- Tab duy nhất: `Top tuần này`
- Hiển thị: Avatar, Tên, TFT IQ, Rank icon
- Reset mỗi thứ Hai 00:00
- **KHÔNG làm:** Seasonal leaderboard, all-time, complex filters

**Tại sao đơn giản:**
```
Seasonal reset giả định user quay lại mỗi season → ảo tưởng khi 0 traction.
Weekly reset = vừa đủ competition mà không cần user commitment dài.
```

---

### 🎯 SPRINT 4: GO-TO-MARKET (1-2 tuần)
> *"Distribution là sống còn. Không có users thì feature đẹp mấy cũng = 0"*

#### Task 4.1: Landing Page (Ego Hook)
- Hero: "73% Diamond pick sai augment này. Bạn có nằm trong số đó?"
- CTA: "Thử ngay" — KHÔNG phải "Đăng ký"
- Social proof: Live stats (X người đang chơi, Y% sai hôm nay)
- SEO: Target "TFT IQ", "TFT quiz", "TFT augment quiz VN"

#### Task 4.2: Mobile Responsive Polish
- VN: 70%+ browse Facebook trên điện thoại
- Puzzle phải chơi được mượt trên mobile
- Flex Card phải đẹp khi share từ mobile

---

## 🚀 GO-TO-MARKET v3: VN Strategy (0 Budget — Thực tế)

> **Solo dev. 0 budget. Chỉ có: Ego challenge post + Streamer nhỏ interactive.**
> **KHÔNG quảng cáo tool. Chỉ khoe flex + thách thức.**

### 🎯 Phase 1: Closed Beta (7-10 ngày)

**Tuyển 20-30 người từ group TFT VN:**
- Ưu tiên Diamond+ có Discord
- Cho badge 🎪 **Founding Player** vĩnh viễn
- Lấy feedback thật, đo: DAU, session time, share rate, bug reports

### 🎯 Phase 2: FB Group Ego Challenge + Pro Supporter Promotion (Ongoing)

**ĐỪNG post kiểu:** "Mình làm web TFT quiz..."

**HÃY post kiểu:**
```
🧠 "Hôm nay 73% Diamond chọn sai cái này, haha... cùi bắp VL. Tao đúng 10/10, mày sao?"
   → [Ảnh Flex Card] + [Link]

💎 "Chỉ 3% player đạt IQ Challenger. Mày rank mấy?"
   → [Link]

🔥 "Puzzle hôm nay easy vãi mà 70% sai??? Mày thử đi"
   → [Link Daily Challenge]

🤡 "Tưởng giỏi TFT? Test IQ đi rồi flex"
   → [Ảnh Flex Card đẹp]
```

**Pro Supporter promotion (lồng vào tự nhiên):**
```
🎯 "Pro tftiseasy#00000 review: 73% Diamond sai cái này.
    Muốn nghe giải thích thật từ Challenger?
    Pro Supporter Pass chỉ 49k/tháng → [link]"

🎥 "tftiseasy#00000 chơi puzzle live với viewer hôm nay!
    Ai donate 20k được shoutout từ pro thật → [stream link]"
```

**Nguyên tắc:**
- Hook bằng **challenge/ego** — không quảng cáo
- "Tao chắc đúng" → click → sai → "wtf" → share → viral
- Dùng Flex Card từ tool → organic reach
- Post timing: 20h-23h (peak gaming VN)
- **Mục tiêu:** 1-2 post/ngày, mỗi post > 50 engagement
- **Pro Supporter push:** 1 post/tuần lồng CTA Pro Pass tự nhiên

### 🎯 Phase 3: Streamer Nhỏ Interactive (Kahoot-style)

**Target:** 5-10 streamer nhỏ (20-80 viewer), Rank Master+

**Concept: "Puzzle Quiz với Viewer" (kiểu Kahoot)**
```
Flow:
1. Streamer mở puzzle trên stream
2. Viewer vote chọn augment qua chat/poll
3. Streamer reveal đáp án → drama reaction
4. So sánh viewer vote vs Pro pick → "Chat IQ thấp vl 😂"

Tại sao hay:
- Tương tác chat tăng → viewer tăng → streamer happy → dùng tiếp
- Drama tự nhiên → clip → viral
- KHÔNG cần feature phức tạp — chỉ cần màn hình puzzle + poll
```

**Cho streamer:**
- Link puzzle riêng cho stream
- Simple poll integration (hoặc dùng Twitch/YouTube poll có sẵn)
- **KHÔNG làm:** Creator leaderboard, custom puzzle builder, streamer badge system

### 🎯 Phase 4: Scale (CHỈ khi có traction)

Chỉ xem xét KHI đạt 200+ DAU:
- Short-form video (TikTok/Shorts): Screen record chơi puzzle + reaction
- Meme page collab
- Big streamer approach (khi có social proof)
- Monetization planning (chỉ khi có data thật)

---

## 📋 TỔNG KẾT ƯU TIÊN v3 — Ship Checklist

| # | Task | Sprint | Ưu tiên | Trạng thái |
|---|------|--------|---------|------------|
| 1 | Meme Feedback Engine | Sprint 1 | 🔴 P0 | ✅ Hoàn thành |
| 2 | TFT IQ Score Engine | Sprint 1 | 🔴 P0 | ✅ Hoàn thành |
| 3 | Profile Flex Card (Video/Image) | Sprint 1 | 🔴 P0 | ✅ Hoàn thành |
| 4 | **Pro Supporter Pass + Donate** | Sprint 2 | 🔴 P0 | ✅ Hoàn thành |
| 5 | **T-Coin Economy + Puzzle Tiers** | Sprint 2 | 🔴 P0 | ✅ Hoàn thành |
| 6 | **30 Puzzles thật (Challenger data)** | Sprint 2 | 🔴 P0 | 🔄 Cần tạo content (engine ✅, data ❌) |
| 7 | **Daily Challenge** (global — kiểu Wordle) | Sprint 3 | 🟡 P1 | ⬜ **BẮT ĐẦU TIẾP THEO** |
| 8 | Leaderboard (top tuần — đơn giản) | Sprint 3 | 🟡 P1 | ⬜ Chưa bắt đầu |
| 9 | Landing Page (ego hook) | Sprint 4 | 🟢 P2 | ⬜ Chưa bắt đầu |
| 10 | Mobile Responsive Polish | Sprint 4 | 🟢 P2 | ⬜ Chưa bắt đầu |
| 11 | Go-to-Market: Closed Beta | Pre-Launch | 🔴 P0 | ⬜ Chưa bắt đầu |
| 12 | FB Group Ego Challenge + Pro Supporter Promotion | Ongoing | 🔴 P0 | ⬜ Chưa bắt đầu |
| 13 | Streamer Kahoot-style Integration | Phase 3 | 🟡 P1 | ⬜ Chưa bắt đầu |

### Kill Metrics

| Metric | Ngưỡng sống | Ngưỡng chết | Hành động |
|--------|------------|-------------|-----------|
| **DAU sau 14 ngày** | > 200 | < 50 | < 50 → kill/pivot |
| **Share Rate** | > 10% | < 3% | < 3% → Flex Card chưa đủ đẹp/ego |
| **Return Rate D1** | > 30% | < 15% | < 15% → product không addictive |
| **Daily Challenge Play** | > 20% DAU | < 5% DAU | < 5% → habit loop thất bại |
| **Avg Session** | > 3 min | < 1 min | < 1 min → boring |
| **Pro Supporter Conversion** | > 3% DAU | < 0.5% | < 0.5% → pricing/value sai |
| **Donate Rate** | > 1% DAU | 0 | 0 → chưa đủ trust/love |

### Decisions Deferred (Chỉ xem xét khi có traction)

| Feature | Điều kiện kích hoạt |
|---------|-------------------|
| Cosmetic Shop | DAU > 1000 + Pro Supporter > 50 paying users |
| Seasonal Reset | DAU > 1000 + retention D7 > 40% |
| Badge Collection | DAU > 500 |
| Public Profile Page | DAU > 1000 |
| Sponsored Packs (gaming cafes) | Có ≥ 3 sponsor leads |
| Creator Leaderboard | Có ≥ 3 streamer dùng regular |

---

## 🎨 NGUYÊN TẮC THIẾT KẾ (Hextech Design System)

- **Colors:** Bảng màu hextech gold + gradient backgrounds
- **T-Coin Icon:** 🪙 hoặc custom SVG coin — màu gold (#FFD700)
- **Flex Card:** Premium quality — đẹp hơn bất kỳ thứ gì TFT VN community đang dùng
- **Animation:** Micro-interactions cho meme (bounce, slide-in) và T-Coin earn (+X bay lên)
- **Responsive:** Desktop-first nhưng mobile-friendly (VN browse Facebook trên điện thoại)
- **Tone:** "Learn TFT, but make it fun + validate your tilt"

---

## ⚡ QUICK START — Bước tiếp theo?

**Sprint 2 ngay — thứ tự ưu tiên (không thương lượng):**

### ✅ Sprint 2 — ĐÃ XONG
- Pro Supporter Pass (service, hooks, bypass logic, ProBadge)
- T-Coin Economy (earn/spend, TCoinBalance, PuzzleLockOverlay, TCoinEarnAnimation)
- Puzzle Tier gating (Free / Advanced / Rare)
- Toàn bộ CSS/UX polish (Hextech design system thống nhất)
- Preloader, page transitions, localization VN

---

### 🎯 Sprint 3 — BẮT ĐẦU NGAY (Tuần này)

**Priority #1 — Daily Challenge (Wordle-style):**
1. **Admin chọn puzzle-of-the-day** — field `is_daily` + `daily_date` trong puzzle schema
2. **Daily Challenge page** — route `/daily`, hiển thị puzzle hôm nay
3. **Reward:** +15 🪙 (hoàn thành) / +30 🪙 (đúng) — 1 lần/ngày/user
4. **Drama hook:** Hiển thị `X% người chơi hôm nay sai` → ego trigger → share
5. **Auto Flex Card** sau khi giải daily → share button

**Priority #2 — 30 Puzzles thật (Content):**
- Dùng PuzzleBuilder Admin đã có
- 20 Free + 7 Advanced + 3 Rare + tier label
- 5 puzzle đầu có pro explanation ký tên tftiseasy#00000

**Priority #3 — Leaderboard (sau daily):**
- Top TFT IQ tuần này — reset mỗi thứ Hai
- Chỉ 1 tab, không filter phức tạp

**Câu lệnh bắt đầu:** `"Implement Daily Challenge feature (Wordle-style)"`

---

> *"Learn TFT, but make it fun."* — TFTISEASY Brand Philosophy
> *"Addictive first, flex second."* — TFTISEASY v3.1 Motto
> *"Người ta không mua puzzle. Họ mua gần Pro thật hơn."* — Monetization truth
> *"Dừng nghĩ T-Coin grind là cốt lõi. Cốt lõi thật là tên tftiseasy#00000 của bạn."* — Reality check
