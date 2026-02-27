# 🚀 TFTISEASY - SHIP PLAN v2: Flex & Drama Edition

> **Triết lý cốt lõi:** Sản phẩm tốt chưa đủ. Phải tạo **Flex** và tạo **Drama nhẹ**.
> Game thủ VN không chỉ muốn giỏi — họ muốn **người khác biết họ giỏi**.
>
> **Ngày tạo:** 2026-02-26 | **Cập nhật:** 2026-02-27
> **Mục tiêu:** Ship Augment Pick Puzzle v1 (Free) — Tối ưu cho thị trường VN, 0 budget

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

### ❌ CHƯA CÓ (What's Missing — v2 FLEX & DRAMA focus)

| Tính năng | Mức ưu tiên | Vai trò |
|-----------|-------------|---------|
| **Meme Feedback System** | 🟡 P0 — 90% Done | Phản hồi bằng meme sau mỗi lựa chọn (Galaxy Brain / Hardstuck) |
| **TFT IQ Score** | 🔴 P0 — Core Metric | Hệ thống Elo-like — nguồn flex chính |
| **Premium Puzzle Tiers** | 🔴 P0 — Content Gate | Free/Advanced/Rare — Advanced & Rare mở khóa bằng T-Coin |
| **Share Image Generator** | 🔴 P0 — Viral Engine | Auto-gen ảnh đẹp (có bg, rank, theme) — KHÔNG chỉ emoji text |
| **Public Profile + Badge System** | 🔴 P0 — Social Proof | Link profile share được, badge hệ thống, rank border |
| **Daily Challenge** | 🟡 P1 — Habit Loop | 1 puzzle/ngày kiểu Wordle — tạo drama cộng đồng |
| **Leaderboard** | 🟡 P1 — Competition | Bảng xếp hạng TFT IQ (tuần/mùa) + Seasonal Reset |
| **Cosmetic Shop (T-Coin)** | 🟡 P1 — Monetization | Avatar frame, rank border animation, badge — vanity items |
| **Streamer Mode** | 🟡 P1 — Distribution | Challenge mode, custom puzzle cho KOL, creator leaderboard |
| **Landing Page** | 🟢 P2 — Conversion | SEO + hook bằng ego challenge |

---

## 🧠 TƯ DUY CHIẾN LƯỢC: TẠI SAO FLEX & DRAMA?

### Sự thật về thị trường VN

```
❌ VN player KHÔNG chi tiền cho:
   - Tool logic (dù hay đến đâu)
   - "Pay-to-access-faster" → ghét paywall dù "không P2W"
   - Microtransaction nhỏ lẻ cho app lạ
   ARPU VN: $5-28/năm. 90%+ không chi tiền trừ "pay for power/vanity"

✅ VN player SẼ CHI TIỀN cho:
   - Flex rank → Rank border vàng chói trên ảnh share
   - Cạnh tranh → Seasonal race to top
   - Support streamer → Đụng đến creator loyalty
```

### Công thức lan truyền

```
Tool hay × 0 distribution = 0 users
Tool hay × Flex + Drama = Viral organic

Flex: "Nhìn IQ tao này" → Chia sẻ → Người khác muốn thử
Drama: "80% Diamond pick sai cái này" → Ego hurt → Click ngay
```

---

## 💰 T-COIN ECONOMY v2 (Đã pivot cho VN market)

### ⚠️ THAY ĐỔI LỚN so với v1

> **V1 (cũ):** T-Coin earn quá nhiều (120-160/ngày), bán coin $2.99-$19.99 → VN player không mua
>
> **V2 (mới):** T-Coin mở khóa **puzzle tiers (core)** + **cosmetics (flex)**.
>
> **Puzzles cơ bản FREE.** Puzzles Advanced/Rare cần T-Coin để mở khóa.
> T-Coin vừa dùng để **tiếp cận nội dung chuyên sâu** (giá trị thật), vừa dùng để **flex** (cosmetics).
> → Người chơi luôn cần T-Coin → earn loop có ý nghĩa → scarcity tự nhiên.

### Tại sao Puzzle IS KING:

```
T-Coin chỉ mua cosmetics? → VN player farm free, không bao giờ mua → economy chết.
T-Coin mở khóa puzzle + cosmetics? → Puzzle = core value → luôn cần T-Coin → economy sống.

Advanced Puzzle = tình huống Thách Đấu khó hơn → player MUỐN chơi để chứng minh skill
Rare Puzzle = tình huống 1-in-100 game, pro giải thích kỹ → player MUỐN học
→ Cả hai đều là "pay for knowledge" — VN player sẵn sàng grind cho kiến thức thật.
```

### Thu nhập T-Coin (Earning) — Giảm free rate để tạo scarcity

| Hành động | T-Coin | Ghi chú |
|-----------|--------|---------|
| **Trả lời đúng** (Free puzzle) | +5 🪙 | Base reward |
| **Trả lời đúng + Không reroll** | +8 🪙 | +3 bonus |
| **Trả lời đúng + Tốc độ < 10s** | +10 🪙 | +2 speed bonus |
| **Trả lời sai** | +1 🪙 | Vẫn thưởng — vì đã học |
| **Daily Challenge hoàn thành** | +15 🪙 | Nguồn ổn định hàng ngày |
| **Daily Challenge đúng** | +30 🪙 | Double reward |
| **Đúng 3 câu liên tiếp** | +10 🪙 bonus | Streak nhẹ |
| **Đúng 5 câu liên tiếp** | +25 🪙 bonus | |
| **Đúng 10 câu liên tiếp** | +80 🪙 bonus | Hiếm, giá trị |
| **Chia sẻ kết quả (lần đầu/ngày)** | +5 🪙 | Viral incentive |
| **Mời bạn đăng ký (referral)** | +50 🪙 | Growth hacking |
| **Puzzle đầu tiên** | +30 🪙 | Welcome bonus |

**Free player trung bình:** ~60-80 🪙/ngày

```
Chi tiêu mẫu:
  - 1 Advanced Puzzle/ngày → 30 🪙
  - 1 Deep Analysis/ngày → 20 🪙
  = ~50 🪙/ngày → Dư 10-30 🪙 tích lũy cho Rare hoặc cosmetics

→ Cảm giác: "Tôi kiếm đủ để chơi, nhưng muốn nhiều hơn để flex"
→ Player giỏi (accuracy cao, streak nhiều) earn nhanh hơn → reward skill
```

### Chi tiêu T-Coin (Spending) — PUZZLE CONTENT + COSMETIC FLEX

#### 🧩 Puzzle Content (Core — Giá trị thật)

| Nội dung | Giá T-Coin | Mô tả |
|----------|-----------|-------|
| **Advanced Puzzle** (mở khóa 1 lần) | 30 🪙 | Puzzle khó hơn — tình huống từ Thách Đấu |
| **Rare Puzzle** (mở khóa 1 lần) | 100 🪙 | Puzzle hiếm — tình huống cực kỳ đặc biệt, pro player giải thích kỹ |
| **Deep Analysis** (per puzzle) | 20 🪙 | Winrate breakdown, board context, common mistakes |
| **Hint** (gợi ý trước khi chọn) | 10 🪙 | "Augment này có winrate >55% trên board này" |

#### 🎨 Cosmetic Flex (Vanity — Flex value)

| Vật phẩm | Giá T-Coin | Mô tả |
|----------|-----------|-------|
| **Avatar Frame** (basic) | 200 🪙 | Khung avatar Hextech border |
| **Avatar Frame** (animated) | 500 🪙 | Có hiệu ứng glow/pulse |
| **Rank Border Effect** | 300 🪙 | Viền rank trên ảnh share |
| **Badge Animation** | 150 🪙 | Effect khi badge xuất hiện |
| **Profile Background** | 400 🪙 | Custom background cho profile card |
| **Share Image Theme** | 250 🪙 | Theme riêng (neon, retro, galaxy...) |
| **Title/Danh hiệu** | 350 🪙 | Custom title ("Galaxy Brain"...) |
| **Meme Pack** (bonus roast) | 100 🪙 | Pool meme feedback mới |

### Monetization Phase 2 (Tương lai — KHÔNG phải ngay)

> **KHÔNG bán T-Coin trực tiếp.** VN player không mua coin ảo của app lạ.

**Thay vào đó, monetize qua:**
1. **Exclusive cosmetic bundles** — Mua trực tiếp bằng tiền thật (29k-99k VND)
   - Seasonal rank frame (chỉ bán trong season)
   - Streamer collab cosmetics
   - Limited edition badges
2. **Donation/Support button** — "Ủng hộ dev" (tương tự Ko-fi/Buy me a coffee)
3. **Sponsor integration** — Brand deal nếu có DAU đủ lớn (Phase 3+)

---

## 🎖️ SOCIAL PROOF & FLEX SYSTEM (MỚI — Cực kỳ quan trọng)

### Tại sao đây là P0?

> Cờ thủ VN không chỉ muốn giỏi. **Họ muốn người khác biết họ giỏi.** Thậm chí họ muốn **Giỏi hơn cả Pro player.**
> Leaderboard + IQ score = cần thiết nhưng CHƯA ĐỦ.
> Cần: **Share image đẹp + Badge flex + Profile link + Seasonal race**
> Tạo thêm tính năng để người chơi flex họ giỏi hơn Pro như kiểu: cho một nút phản biện ở phần Review Decision họ sẽ phản biện và khoe nó lên trên GROUP FB DTCL Việt Nam để câu fame. Họ sẽ khoe lên đó để câu like, câu view, câu tương tác. 

### 1. Public Profile (Share link)

**URL:** `tftiseasy.com/player/{username}`

**Hiển thị:**
- Avatar + Frame (cosmetic)
- TFT IQ Score + Rank badge
- Danh hiệu/Title
- Badge collection (hiển thị nổi bật)
- Stats tổng quan (accuracy, puzzles solved, streak record)
- Recent activity

**Quan trọng:** Profile phải **đẹp khi preview trên Facebook/Discord** (Open Graph image auto-generated). Dùng model mới nhất của google là Nano Banana 2 để render ảnh. 

### 2. Badge System (Achievement)

| Badge | Điều kiện | Hiếm? |
|-------|----------|-------|
| 🧠 Galaxy Brain | Đúng 20 câu liên tiếp | ⭐ Rare |
| 🎯 Augment Master | Top 1% accuracy (90%+) | ⭐ Rare |
| 🔥 Streak King | 10 ngày chơi liên tiếp | 🟡 Uncommon |
| 💎 Diamond Mind | Đạt Diamond IQ (1400+) | 🟡 Uncommon |
| 👑 Challenger | Đạt Challenger IQ (2000+) | 🔴 Legendary |
| 🏆 Season Champion | Top 10 leaderboard cuối mùa | 🔴 Legendary |
| 🎪 Founding Player | Tham gia Closed Beta | 🔴 Legendary (vĩnh viễn) |
| ⚡ Speed Demon | 10 câu đúng under 5s | ⭐ Rare |
| 📊 Analyst | Mua 50 Deep Analysis | 🟡 Uncommon |
| 🎥 Stream Star | Puzzle featured bởi streamer | 🔴 Legendary |

**Badge hiển thị ở:** Profile, ảnh share, leaderboard, chat (nếu có)

### 3. Seasonal Rank Reset

**Tại sao:** Đánh vào tâm lý "climb lại" — giữ player hoạt động mỗi season.

**Cơ chế:**
- Season = 4 tháng (theo season của TFT)
- Soft reset: IQ giảm 30% về median (ví dụ: 1600 → 1120) hoặc giảm hơn tuỳ TFT IQ Score mùa trước của họ. Ví dụ: Challenger mùa trước thì giảm 40%, Master giảm 30%, Gold giảm 20%.
- Seasonal leaderboard riêng + Badge cho top performers
- End-of-season reward: cosmetic exclusive cho rank tier

### 4. Profile Flex Card (CARD DUY NHẤT CẦN BUILD)

> **Chỉ Profile Card.** Streak card, achievement card, daily result card = vô nghĩa ở VN.
> VN flex = khoe identity + rank, không khoe thành tích lẻ tẻ.

**Card = marketing 0 đồng duy nhất.** Share lên Facebook group, Discord, stream chat.
Người ta share IDENTITY ("TFT IQ 1820, Top 1% VN"), không share STATS ("20 streak").

**Card hiển thị (tối đa 5 items — nghiêm ngặt):**
1. **TFT IQ Score** — hero number cực lớn (instant read 1 giây)
2. **Rank Icon** — Diamond/Master/Challenger
3. **"Top X% VN"** — local social proof
4. **Avatar + cosmetic frame** — player identity
5. **2-3 top badges** — flex rare achievements

**Anti-patterns (học từ DAK.GG):** Không stats dump, không WR%, không bar chart, không brand lớn.

**Chi tiết design + kỹ thuật → xem Sprint 1 Task 1.3.**

---

## 🎥 STREAMER INTEGRATION (MỚI — Distribution Engine)

### Tại sao?

> VN game sống bằng streamer. Không gắn vào streamer = rất khó lan truyền organic.
> Nếu chat spam "IQ thấp vl" → tool tự lan.

### Tính năng Streamer Mode

| Feature | Mô tả |
|---------|-------|
| **Custom Puzzle cho Streamer** | Admin tạo puzzle dành riêng cho stream → Streamer chơi live |
| **Pro-Play Challenge** | Streamer giải lại tình huống thực tế từ giải đấu (Wasianiverson...) → "Check var" xem lựa chọn của mình so với Pro |
| **Creator Leaderboard** | Bảng xếp hạng riêng cho fan mỗi streamer ("Trâu Army IQ Ranking") |
| **Streamer Badge** | Badge đặc biệt cho streamer partner + fan code |

### Target Streamer (Phase 2 - Soft Launch)

**KHÔNG target big name trước.** Target:
- 1-3 streamer 20-100 viewer
- Rank Master trở lên
- Chăm tương tác chat
- Cho họ: Custom puzzle + Creator leaderboard riêng cho fan

---

## 🗺️ LỘ TRÌNH SHIP (Shipping Roadmap) — Tối ưu cho tốc độ

> ⚡ **Opportunity cost cao.** Deploy sớm nhất có thể. Đừng polish quá lâu trước khi có users thật.

### 🔥 SPRINT 1: CORE FLEX (1-2 tuần) — DIFFERENTIATORS
> *"Biến tool thành thứ người ta MUỐN share"*

#### Task 1.1: Meme Feedback Engine
**Mục tiêu:** Sau mỗi lựa chọn Augment, phản hồi bằng meme — tạo drama reaction.

**Vị trí code (theo ARCHITECTURE.md):**
```
src/features/puzzle/feedback/
├── memeFeedback.data.ts     # Meme database (correct/incorrect pools)
├── meme.types.ts            # Type definitions
├── MemeFeedback.tsx         # Component hiển thị meme
└── MemeFeedback.css         # Animation (slide-in, bounce, glow)
```

**Meme Categories:**
| Kết quả | Meme Pool | Ví dụ (VN tone) |
|---------|-----------|-----------------|
| **Đúng** | Celebration | "Galaxy Brain 🧠", "200 IQ play", "Certified Challenger" |
| **Sai** | Roast nhẹ | "This is why you're hardstuck 🤡", "Uninstall TFT", "Iron detected 🪨" |
| **Đúng + Không reroll** | God-tier | "Built different 💎", "First instinct = Challenger instinct" |
| **Sai + Reroll sai** | Double roast | "Rerolled... and still wrong 💀", "The audacity..." |

**Tone giọng:** Hài hước châm biếm nhưng KHÔNG toxic — giống anh bạn Challenger hay trêu.
**Tối thiểu:** 15 meme đúng + 15 meme sai + 5 god-tier + 5 double-roast.

**Integration:** Sửa `DecisionReview.tsx` — thêm `<MemeFeedback>` ngay trên `ResultBanner`.

---

#### Task 1.2: TFT IQ Score Engine
**Mục tiêu:** Hệ thống Elo-like — nguồn flex chính, core identity của sản phẩm.

**Backend (Supabase Migration):**
```sql
-- Migration: add_tft_iq.sql
CREATE TABLE user_tft_iq (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
    iq_score INTEGER DEFAULT 1000,
    iq_rank TEXT DEFAULT 'Iron',
    season INTEGER DEFAULT 1,
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
Base: ±25 points per puzzle (Elo-style)
Modifiers:
  + Đúng = +25, Sai = -15 (asymmetric — khuyến khích chơi tiếp)
  + Speed <10s = +5, <20s = +3, <30s = +1
  + No-reroll bonus = +10
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

**Frontend:**
```
src/features/tft-iq/
├── tft-iq.service.ts
├── tft-iq.types.ts
└── components/
    ├── IqBadge.tsx + IqBadge.css
    └── IqProgressBar.tsx + IqProgressBar.css
```

---

#### Task 1.3: Profile Flex Card Generator (THE share card)
**Mục tiêu:** Auto-generate 1 ảnh profile flex đẹp — marketing 0 đồng duy nhất cho VN.

> ⚠️ **Chỉ Profile Card. KHÔNG làm streak card, achievement card, daily result card.**
> VN chỉ flex profile ("nhìn rank tao nè") — streak/achievement card không ai care.
> Học từ DAK.GG fail: stats dump, achievement cards = 0 share rate.

**Tại sao Profile Card là card DUY NHẤT cần build:**
```
Spotify Wrapped: 1 card identity ("đây là vibe năm của bạn") → viral
LoL Recap: 1 card rank + highlight → viral
DAK.GG: 1 card stats dump + achievement → chết

Quy luật: Người ta share IDENTITY, không share STATS hay ACHIEVEMENT.
"Tao IQ 1820, Top 1% VN" = identity → share
"Tao 20 streak" = stat → skip
"Tao mở badge Galaxy Brain" = achievement → ai care?
```

**PROFILE FLEX CARD — Thiết kế chi tiết:**

**Kích thước:** 1080×1080 (1:1, tối ưu Facebook/Discord) + 1080×1350 (4:5, story)

**Layout (top → bottom):**
```
┌─────────────────────────────────────┐
│  [Hextech gradient background]       │
│  [Subtle pattern + vignette]         │
│                                      │
│     [Avatar + Cosmetic Frame]        │  ← Identity
│        (large, center)               │
│                                      │
│    ──── TFT IQ: 1,547 ────          │  ← HERO NUMBER (64-96px)
│         💎 DIAMOND 💎                │  ← Rank icon nổi bật
│      "Top 3% Việt Nam"              │  ← Social proof (đậm)
│                                      │
│  🧠 Galaxy Brain  🎯 94% Accuracy   │  ← 2-3 badges (tối đa)
│                                      │
│  "Bạn IQ bao nhiêu? → tftiseasy"    │  ← CTA challenge
│              tftiseasy.com (8% opacity) │  ← Micro-brand
└─────────────────────────────────────┘
```

**Hierarchy thông tin (NGHIÊM NGẶT — tối đa 5 items):**
1. **TFT IQ Score** — hero number, lớn nhất (64-96px bold)
2. **Rank Icon** — Diamond/Master/Challenger visual
3. **"Top X% VN"** — local social proof, instant flex
4. **2-3 badges** (chỉ hiện đẹp nhất, KHÔNG dump hết)
5. **CTA + micro-brand** — nhỏ, muted

**Thiết kế visual:**
- **Background:** Dark hextech gradient (near-black → teal #00D1C1), subtle grain
- **Hero number:** Soft glow behind, 2px white stroke cho readability
- **Avatar frame:** Cosmetic frame từ shop (có = premium feel, không = default)
- **Palette:** Gold accent (#E6B84B), teal highlights (#00D1C1), dark base
- **Font:** Inter/Roboto Bold cho số, Regular cho text
- **Branding:** Logo 8% opacity ở corner — player-first, KHÔNG brand-first

**Ego trigger tích hợp:**
- "Top X% VN" → người xem: "tao rank mấy vậy ta?" → click
- CTA: "Bạn IQ bao nhiêu?" → thách thức → viral
- Badge rare → "sao nó có Galaxy Brain mà tao không?" → FOMO

**Caption copy sẵn (auto clipboard):**
```
TFT IQ 1547 — Top 3% VN 💎 Thử bắt kịp? #TFTISEASY #TFTVN
```

**Kỹ thuật:** Client-side Canvas API → export PNG (≤1.5MB)
- Draw at `devicePixelRatio` for sharpness
- Layer: bg → vignette → avatar mask → frame → hero text → badges → brand
- `canvas.toDataURL('image/png', 0.92)` → blob → download
- Cache rendered card, reuse khi data không đổi
- Preload webfonts (Inter/Roboto), fallback cho mobile

**Vị trí code:**
```
src/features/share/
├── share.service.ts           # Canvas render logic
├── share.types.ts
├── profileCard.renderer.ts    # Profile flex card renderer (Canvas API)
├── share.assets.ts            # Badge SVGs, rank icons, frame assets
└── components/
    ├── ShareButton.tsx + css   # Button + preview modal
    └── SharePreview.tsx + css  # Preview ảnh trước khi download
```

**Share targets:**
1. **Download PNG** (ưu tiên #1 — paste vào Facebook/Discord)
2. **Copy caption** (auto clipboard kèm download)

**Checklist "Card có ĐÁNG SHARE không?":**
- [ ] Instant-read metric trong 1 giây? (TFT IQ lớn)
- [ ] Social proof local? (Top X% VN)
- [ ] Ego trigger / challenge? (CTA thách thức)
- [ ] Visual premium + player-first? (avatar > brand)
- [ ] Tối đa 3-5 thông tin chính? (low cognitive load)
- [ ] Share friction thấp? (1:1, ≤1.5MB, caption sẵn)
- [ ] Branding muted? (logo nhỏ, không chiếm hero)

---

### ⭐ SPRINT 2: ECONOMY + PUZZLE TIERS + SOCIAL (1-2 tuần) — RETENTION
> *"T-Coin cho puzzle (core) + flex (cosmetics) + habit loop"*

#### Task 2.1: T-Coin Economy Backend (Puzzle + Cosmetic dual-purpose)
**Mục tiêu:** Nền tảng T-Coin — mở khóa puzzle tiers (core value) + mua cosmetics (flex value).

**Backend (Supabase Migration):**
```sql
-- Migration: add_tcoin_economy_v2.sql

-- Ví T-Coin
CREATE TABLE user_wallets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
    balance INTEGER DEFAULT 30,
    total_earned INTEGER DEFAULT 30,
    total_spent INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Lịch sử giao dịch
CREATE TABLE tcoin_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    amount INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,
    type TEXT NOT NULL,                -- 'earn' | 'spend'
    reason TEXT NOT NULL,              -- 'puzzle_correct', 'daily_challenge', 'unlock_advanced', 'unlock_rare', 'buy_frame'...
    reference_id TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Nội dung puzzle đã mở khóa (vĩnh viễn)
CREATE TABLE user_unlocked_content (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    content_type TEXT NOT NULL,        -- 'advanced_puzzle', 'rare_puzzle', 'deep_analysis', 'hint'
    content_id TEXT NOT NULL,
    unlocked_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, content_type, content_id)
);

-- Cosmetic items owned
CREATE TABLE user_cosmetics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    cosmetic_type TEXT NOT NULL,       -- 'avatar_frame', 'rank_border', 'badge_animation', 'profile_bg', 'share_theme', 'title', 'meme_pack'
    cosmetic_id TEXT NOT NULL,
    equipped BOOLEAN DEFAULT false,
    purchased_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, cosmetic_type, cosmetic_id)
);

-- Badge achievements
CREATE TABLE user_badges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    badge_id TEXT NOT NULL,
    earned_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, badge_id)
);

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

ALTER TABLE user_cosmetics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own cosmetics" ON user_cosmetics FOR ALL USING (auth.uid() = user_id);

ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read badges" ON user_badges FOR SELECT TO authenticated USING (true);
CREATE POLICY "System grants badges" ON user_badges FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_transactions_user_date ON tcoin_transactions(user_id, created_at DESC);
CREATE INDEX idx_unlocked_user ON user_unlocked_content(user_id, content_type);
CREATE INDEX idx_cosmetics_user ON user_cosmetics(user_id, cosmetic_type);
CREATE INDEX idx_badges_user ON user_badges(user_id);
```

**Frontend:**
```
src/features/tcoin/
├── tcoin.service.ts           # Wallet CRUD, earn/spend, unlock check
├── tcoin.types.ts             # UserWallet, TCoinTransaction, CosmeticItem, UnlockedContent
├── hooks/
│   └── useTCoin.ts            # Hook quản lý state
└── components/
    ├── TCoinBalance.tsx + css  # Widget header
    ├── TCoinEarnAnimation.tsx + css
    ├── TCoinHistory.tsx + css
    ├── PuzzleLockOverlay.tsx + css   # Overlay "🔒 30 🪙" trên Advanced/Rare
    └── UnlockConfirmModal.tsx + css  # Modal xác nhận mở khóa
```

---

#### Task 2.2: Puzzle Tier System (Free / Advanced / Rare)
**Mục tiêu:** Phân loại puzzles thành 3 tier — Advanced & Rare mở khóa bằng T-Coin.

**Puzzle Tiers:**
| Tier | Icon | Giá T-Coin | Mô tả |
|------|------|-----------|-------|
| **Free** | 🟢 | 0 🪙 | Puzzle cơ bản, ai cũng chơi. Nguồn kiếm T-Coin chính |
| **Advanced** | 🟡 | 30 🪙 | Puzzle khó hơn từ Thách Đấu. Tình huống phức tạp |
| **Rare** | 🔴 | 100 🪙 | Puzzle hiếm — tình huống 1-in-100, giải thích kỹ bởi pro player |

**UI Behavior:**
- **Free puzzles:** Chơi ngay, không cần gì
- **Advanced:** Hiện trên list với khóa 🔒 + "30 🪙" → Click → Confirm → Mở vĩnh viễn
- **Rare:** Border vàng đặc biệt + "100 🪙" → Mở vĩnh viễn + Deep Analysis kèm theo

**Thay đổi cần thiết:**
- Thêm field `tier: 'free' | 'advanced' | 'rare'` vào puzzle schema
- `PuzzleBuilder/MetaTab.tsx` — dropdown chọn tier
- Thêm field `detailed_explanation` (Advanced & Rare)

---

#### Task 2.3: Cosmetic Shop
**Mục tiêu:** Nơi tiêu T-Coin cho vanity — flex trên profile + ảnh share.

```
src/features/shop/
├── shop.service.ts            # List items, purchase logic
├── shop.types.ts
├── shop.data.ts               # Catalog cosmetic items
└── components/
    ├── CosmeticShop.tsx + css  # Shop page
    ├── ShopItem.tsx + css      # Item card (preview + buy)
    └── EquipModal.tsx + css    # Equip/unequip
```

**Categories:** Avatar Frames, Rank Borders, Badge Animations, Profile Backgrounds, Share Themes, Titles

---

#### Task 2.4: Daily Challenge + Leaderboard
**Mục tiêu:** Habit loop + cạnh tranh — 2 pillars giữ player quay lại.

**Daily Challenge:**
- 1 puzzle FREE mỗi ngày, tất cả users chơi cùng 1 puzzle
- T-Coin reward: +15 (hoàn thành) / +30 (đúng)
- Kết quả → Share image (KHÔNG chỉ emoji text)
- Tạo drama cộng đồng ("puzzle hôm nay dễ vl mà sao 60% sai?")

**Leaderboard:**
- Tabs: `Tuần này` | `Mùa này` | `All-time`
- Hiển thị: Avatar + Frame, Tên, TFT IQ, Rank, Badges
- **Seasonal reset:** Soft reset IQ mỗi mùa → tạo climb race

**Backend schema:** (tương tự v1, thêm `season` field)

---

### 🎯 SPRINT 3: PROFILE + STREAMER (1-2 tuần) — DISTRIBUTION
> *"Social proof hoàn chỉnh + bắt đầu distribute"*

#### Task 3.1: Public Profile Page
**Mục tiêu:** `tftiseasy.com/player/{username}` — link profile share được.

**Hiển thị:**
- Avatar + cosmetic frame
- TFT IQ + Rank (animate)
- Title/Danh hiệu
- Badge collection grid
- Stats dashboard (accuracy, puzzles solved, streak record, favorite augments)
- Season rank history
- Open Graph meta tags → preview đẹp khi paste link trên Facebook/Discord

#### Task 3.2: Streamer Mode (MVP)
**Mục tiêu:** Tính năng cơ bản để streamers dùng tool trên stream.

**MVP features:**
- Custom puzzle assignment (admin gắn puzzle cho streamer event)
- Creator leaderboard (filter by streamer code)
- OBS-friendly view (clean layout, dark theme, no distracting elements)

```
src/features/streamer/
├── streamer.service.ts
├── streamer.types.ts
└── components/
    ├── StreamerChallenge.tsx + css
    └── CreatorLeaderboard.tsx + css
```

---

### 🏗️ SPRINT 4: POLISH + LAUNCH PREP (1 tuần)
> *"Chuẩn bị cho go-to-market"*

#### Task 4.1: Landing Page (Ego Hook)
- Hero: "80% Diamond pick sai augment này. Bạn có nằm trong số đó?"
- CTA: "Thử ngay" — KHÔNG phải "Đăng ký"
- Social proof: Live leaderboard, recent IQ scores
- SEO: Target "TFT IQ", "TFT quiz", "TFT augment quiz"

#### Task 4.2: Deep Analysis (giá rẻ, T-Coin unlock)
- 20 🪙 per puzzle — giá rẻ, không phải paywall
- Nội dung: Giải thích chi tiết tại sao đáp án đúng, winrate breakdown, common mistakes

#### Task 4.3: Final Polish
- ≥ 30 puzzles thật (Challenger data)
- Mobile responsive (VN nhiều người dùng điện thoại browse)
- Performance optimization
- Bug fixes

---

## 🚀 GO-TO-MARKET: VN Strategy (0 Budget)

> **Solo dev. Không ads. Không tiền. Chỉ có: Drama, Meme, Streamer, Community post thông minh.**
> **Mục tiêu:** Marketing fun hơn cả Anh Hổ tiger1, anh trâu (Trâu TV).

### 🎯 Phase 1: Closed Beta (7-10 ngày)

**ĐỪNG launch thẳng.** Tạo FOMO + founding member psychology.

**Tuyển:**
- 20-30 người từ group TFT VN (Facebook, Discord)
- Ưu tiên Diamond+
- Có Discord
- Chăm tương tác trong community

**Cho họ:**
- Role "Founding Player" (Discord)
- Badge 🎪 **Founding Player** vĩnh viễn (KHÔNG BAO GIỜ có lại)
- Exclusive cosmetic (beta tester frame)
- Quyền feedback trực tiếp

**Tâm lý VN:** Rất thích "early member", "OG", "founding member" → flex được suốt đời.

**Metric cần đo:** DAU, session time, share rate, bug reports.

### 🎯 Phase 2: Soft Launch qua Streamer nhỏ (2 tuần)

**ĐỪNG target big name trước.** Tìm:
- 1-3 streamer 20-100 viewer
- Rank Master trở lên
- Chăm tương tác chat (không chỉ gameplay)

**Cho họ:**
- Custom puzzle riêng cho stream
- Creator leaderboard: "Tham gia team [Tên Streamer]" → Fan compete với nhau
- Streamer badge đặc biệt

**Tại sao streamer nhỏ:**
- Dễ approach hơn
- Loyalty cao hơn (họ quý tool giúp content của họ)
- Chat tương tác = tool tự lan ("IQ tao cao hơn mày kìa")
- Nếu thành công → big name sẽ tự tìm đến

### 🎯 Phase 3: Facebook Group Strategy (Ongoing)

**ĐỪNG post kiểu:** "Mình làm web TFT quiz..."

**HÃY post kiểu:**
```
🧠 80% Diamond pick sai augment này. Bạn có nằm trong số đó?
→ [Link quiz]

💎 Chỉ 3% player đạt IQ Challenger trên TFTISEASY. Bạn rank mấy?
→ [Link]

🔥 Puzzle hôm nay: 70% player sai câu này. Dễ vãi mà sao???
→ [Link Daily Challenge]

🤡 Tưởng giỏi TFT? Test IQ đi rồi flex.
→ [Share image đẹp]
```

**Nguyên tắc:**
- Hook bằng **challenge/ego** — không quảng cáo
- Đánh vào tâm lý: "tao chắc đúng" → click → sai → "wtf" → share
- Dùng ảnh share image đẹp từ tool → organic reach
- Post timing: 20h-23h (peak gaming VN)

### 🎯 Phase 4: Scale Organic (Khi có traction)

- Drama content: "Top 10 augment 90% player pick sai"
- Short-form video (TikTok/Shorts): Screen record chơi puzzle + reaction
- Meme page collab (TFT meme groups)
- Big streamer approach (khi có data + social proof từ Phase 2-3)

---

## 📋 TỔNG KẾT ƯU TIÊN — Ship Checklist

| # | Task | Sprint | Ưu tiên | Trạng thái |
|---|------|--------|---------|------------|
| 1 | Meme Feedback Engine | Sprint 1 | � P0 | 🟡 ~90% Done |
| 2 | TFT IQ Score Engine | Sprint 1 | 🔴 P0 | ⬜ Chưa bắt đầu |
| 3 | Profile Flex Card Generator (THE share card) | Sprint 1 | 🔴 P0 | ⬜ Chưa bắt đầu |
| 4 | T-Coin Economy Backend (puzzle + cosmetic) | Sprint 2 | 🔴 P0 | ⬜ Chưa bắt đầu |
| 5 | Puzzle Tier System (Free/Advanced/Rare + Lock UI) | Sprint 2 | � P0 | ⬜ Chưa bắt đầu |
| 6 | Cosmetic Shop (avatar frame, rank border...) | Sprint 2 | 🟡 P1 | ⬜ Chưa bắt đầu |
| 7 | Daily Challenge + Leaderboard (seasonal) | Sprint 2 | 🟡 P1 | ⬜ Chưa bắt đầu |
| 8 | Badge Achievement System | Sprint 2 | 🟡 P1 | ⬜ Chưa bắt đầu |
| 9 | Public Profile Page (shareable link) | Sprint 3 | 🟡 P1 | ⬜ Chưa bắt đầu |
| 10 | Streamer Mode MVP | Sprint 3 | 🟡 P1 | ⬜ Chưa bắt đầu |
| 11 | Landing Page (ego hook) | Sprint 4 | 🟢 P2 | ⬜ Chưa bắt đầu |
| 12 | Deep Analysis (20 🪙 per puzzle) | Sprint 4 | 🟢 P2 | ⬜ Chưa bắt đầu |
| 13 | ≥ 30 Puzzles thật (Challenger data) | Ongoing | 🔴 P0 | ⬜ Chưa bắt đầu |
| 14 | Go-to-Market: Closed Beta + Streamer Outreach | Pre-Launch | 🔴 P0 | ⬜ Chưa bắt đầu |

### Metrics to Track Post-Launch

| Metric | Mục tiêu | Tại sao quan trọng |
|--------|----------|---------------------|
| **Share Rate** | >15% users share ảnh/ngày | Marketing 0 đồng — nếu share thấp, ảnh chưa đủ đẹp/flex |
| **DAU / MAU** | Track growth | Sản phẩm có người dùng hay không |
| **Daily Challenge Return** | >40% quay lại ngày hôm sau | Habit loop hoạt động không |
| **T-Coin Velocity** | Earn/Spend ratio | Nếu earn quá cao = lạm phát, không ai cần mua |
| **Cosmetic Purchase Rate** | >5% users mua ≥1 item | Vanity appeal đủ mạnh không |
| **Streamer referral traffic** | Track per creator | Streamer nào drive traffic thật |
| **IQ Distribution** | Normal curve | Formula cân bằng không |
| **Avg Session** | >5 min | Sticky hay boring |

---

## 🎨 NGUYÊN TẮC THIẾT KẾ (theo Hextech Design System)

Tất cả UI mới phải tuân theo Hextech Core design system đã có trong dự án:
- **Colors:** Sử dụng bảng màu hiện tại (hextech gold, gradient backgrounds)
- **T-Coin Icon:** 🪙 hoặc custom SVG coin với chữ "T" — màu gold (#FFD700) với viền hextech
- **Share Images:** Premium quality — đẹp hơn bất kỳ thứ gì TFT VN community đang dùng
- **Animation:** Micro-interactions cho meme (bounce, slide-in) và T-Coin earn (+X bay lên)
- **Typography:** Giữ nhất quán với font system hiện tại
- **Responsive:** Desktop-first nhưng mobile-friendly (VN browse Facebook trên điện thoại)
- **Tone:** "Learn TFT, but make it fun + flex-worthy"

---

## ⚡ QUICK START — Bắt đầu từ đâu?

**Sprint 1 ngay vì:**
1. **Meme Feedback** = differentiator #1, tạo drama reaction → share organic
2. **TFT IQ Score** = core identity, nguồn flex chính → "IQ tao bao nhiêu?"
3. **Share Image** = marketing 0 đồng → ảnh đẹp = người ta muốn share = viral
4. Cả 3 task modify component đã build xong (DecisionReview, useGameFlow)
5. Impact cao nhất, effort thấp nhất, deploy sớm nhất

**Câu lệnh bắt đầu:** "Implement Sprint 1: Meme Feedback + TFT IQ + Share Image Generator"

---

> *"Learn TFT, but make it fun."* — TFTISEASY Brand Philosophy
> *"Không ai share tool hay. Người ta share thứ khiến họ trông cool."* — VN Market Truth
> *"Flex or Die."* — TFTISEASY v2 Motto
