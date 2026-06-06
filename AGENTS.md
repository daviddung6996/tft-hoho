# Agent Knowledge Base (AGENTS.md)

Welcome, Agent. This file is a living document intended to capture common mistakes, confusion points, and "surprises" encountered while working on the **TFTISEASY** project. 

**If you find something that surprises you, update this file immediately to help future agents.**

---

## -1. Critical Agent Operation Rules (MANDATORY)

> **⚠️ DO NOT AUTO-COMMIT AND PUSH:**
> Never run `git commit` or `git push` unless the user EXPLICITLY asks you to (e.g., "commit and push", "lưu code lên git"). Auto-committing disrupts the user's workflow and version control history. If you finish a task, just tell the user the code is ready for review.

> **ALWAYS REFRESH REPO CONTEXT AFTER COMPLETED TASKS:**
> This repo does not use one root `context.md` file. Durable context lives under `docs/agent-context/` (`active.md`, `decisions.md`, `patterns.md`). After every completed non-trivial task, update the relevant file(s) there so future agents inherit the latest state.
> **ALWAYS CLEAN UP WORKTREES AFTER COMPLETING WORK:**
> After finishing any task that used git worktrees, **immediately** remove all worktrees (`git worktree remove <path> --force`) and delete their associated branches (`git branch -D <branch>`). Stale worktrees accumulate rapidly and clutter the repo. Run `git worktree list` and `git branch | Select-String 'worktree-agent'` to verify cleanup is complete before ending the session.

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

### PowerShell console can misrender UTF-8 markdown in `.agent/`
- **Symptom:** `Get-Content` shows sequences like `a†'` or broken Vietnamese text even after a clean save.
- **Cause:** PowerShell console/code-page rendering can differ from the file's actual UTF-8 bytes, so terminal output is not always source-of-truth.
- **Avoid:** Verify suspicious `.md` files with the IDE or `Format-Hex` before assuming the file is corrupted. Rewrite/save as UTF-8 only when the bytes are actually wrong.

### Skill file parser can reject multiline `description: >` frontmatter
- **Symptom:** VS Code/skill validator reports `Unexpected indentation` and treats a wrapped description line as an unsupported attribute in `SKILL.md`.
- **Cause:** Some skill-file tooling appears stricter than generic YAML parsing and expects `description:` to stay on one line in frontmatter.
- **Avoid:** Prefer single-line `description:` in `.agent/skills/*/SKILL.md` even if folded YAML would normally be valid.

### `filter` / `backdrop-filter` gây layout shift trong game container
- **Symptom:** ScoutingPanel, ItemPanel, SynergyPanel bị trượt lên/xuống khi overlay xuất hiện hoặc biến mất.
- **Cause:** `app-container` có `filter: contrast(1.05) saturate(1.08) brightness(1.02)` tạo stacking context. Nếu wrap game content trong div có `filter: blur()` toggle (`none` ↔ `blur(8px)`), việc tạo/huỷ stacking context sẽ làm các panel `position: absolute` bị reflow.
- **Avoid:** KHÔNG BAO GIỜ wrap game content trong div toggle `filter`. Overlay đã có background atmosphere đủ tối (`rgba(0,0,0,0.78)`), không cần blur content bên dưới. Xem pattern "Hextech Overlay" ở Section 1.

### Overlay/modal inside `.app-container` must use `position: fixed; inset: 0; pointer-events: auto`
- **Symptom:** Modal không phủ full viewport (bị cắt trên/dưới), hoặc click xuyên qua modal xuống game UI bên dưới.
- **Cause:** `.app-container` có `filter` tạo stacking context mới nên `position: absolute` + `100cqh` chỉ bám container, không bám viewport. Nếu modal render qua component nằm trong `viewport-hud-layer` (có `pointer-events: none`), click cũng bị xuyên.
- **Avoid:** Mọi full-screen overlay/modal phải dùng `position: fixed; inset: 0; pointer-events: auto`. Không dùng `position: absolute` + `width: 100cqw; height: 100cqh` cho overlay cần phủ viewport.

### `position: fixed` bên trong `.app-container` đang có `filter` sẽ bám theo canvas bị crop, không bám viewport thật
- **Symptom:** `TopStatusBar`, menu hamburger, nút fullscreen, T-Coin badge nhìn như bị browser che ở mép trên/phải khi cửa sổ không đúng tỷ lệ 16:9.
- **Cause:** `.app-container` dùng `filter`, nên descendant `position: fixed` lấy chính `.app-container` làm containing block. Trong default layout, canvas 16:9 kiểu `cover` có thể bị crop trên/dưới hoặc trái/phải, nên HUD bám mép canvas sẽ bị trôi vào vùng bị cắt.
- **Avoid:** Với HUD neo mép màn hình, cộng thêm crop offset (`--app-visible-top-offset`, `--app-visible-side-offset`) vào `top/left/right`, hoặc render HUD ở layer viewport riêng nằm ngoài node có `filter`.

### Viewport HUD sibling sẽ đè mọi fixed modal nằm trong `.app-container` nếu không có visibility contract
- **Symptom:** Nút `Fullscreen` / `Menu` vẫn nổi trên Admin modal, Arena selector, review screen hoặc các màn "làm việc" khác dù modal tự đặt `z-index` rất cao.
- **Cause:** `.viewport-hud-layer` là sibling ở root stacking context, còn hầu hết modal gameplay/admin render bên trong `.app-container` đang có `filter`, nên `z-index` nội bộ của modal không thể thắng layer HUD ở root.
- **Avoid:** Đừng cố tăng `z-index` modal vô hạn. Phải gate render/visibility của HUD từ `App.tsx` bằng state rõ ràng (`currentView`, modal open state, reviewing/mobile overlay state, transition state).

### Viewport HUD controls must not be blanket-hidden through `.menu-container` on mobile
- **Symptom:** Trên `phone-landscape`, cả hamburger lẫn fullscreen cùng biến mất trước cả khi vào fullscreen hoặc mở review.
- **Cause:** `SettingsButton.css` từng `display: none` toàn bộ `.menu-container` ở mobile, trong khi chính container này chứa cả menu lẫn fullscreen. Đồng thời các nút neo mép viewport mà đặt trong `.app-container` có `filter` sẽ còn bị drift/crop như gotcha phía trên.
- **Avoid:** Với utility controls neo mép viewport (`menu`, `fullscreen`, mobile augment CTA), render chúng trong `.viewport-hud-layer` là sibling của `.app-container`. Nếu cần ẩn một control trên mobile, scope rule vào đúng button hoặc state cụ thể, KHÔNG hide blanket `.menu-container`.

### Mobile auto-fullscreen cannot rely on `useEffect` alone; it needs a trusted user gesture
- **Symptom:** Agent wires `requestFullscreen()` inside mount/rotate effect, nhưng trên mobile browser fullscreen không vào và có thể reject promise.
- **Cause:** Fullscreen API thường yêu cầu `user activation` thật (`pointerdown`, `touchend`, click...). Rotate/orientation change và `useEffect` thuần không được tính là trusted gesture.
- **Avoid:** Với mobile auto-fullscreen, chỉ "arm" logic trong effect rồi request fullscreen ở gesture đầu tiên của user. Luôn `try/catch` hoặc helper safe để swallow reject, và đừng biến nó thành console noise.

### `supabase/config.toml` can reference Edge Functions that do not exist in repo
- **Symptom:** Agent reads `supabase/config.toml`, expects a function like `generate-flex-card`, then wastes time searching under `supabase/functions/` and assumes files are missing locally.
- **Cause:** Supabase function config can drift from the committed filesystem. Current repo only contains `supabase/functions/generate-caption/`, while `supabase/config.toml` still declares `functions.generate-flex-card`.
- **Avoid:** Verify both `supabase/config.toml` and actual `supabase/functions/` contents before documenting Edge Function architecture or trying to edit/deploy a function by name.

### Mobile browser swipe can come from puzzle URL history, not a custom touch handler
- **Symptom:** On phone, swipe back/forward appears to move between old puzzles, so agent starts hunting for `touchstart`/`swipe` gesture code in gameplay UI.
- **Cause:** Puzzle navigation previously wrote `?puzzle=...` entries into browser history. Mobile edge-swipe/back gestures can replay those history states even if there is no dedicated swipe handler in React.
- **Avoid:** Before deleting touch code, inspect `usePuzzleGame` for puzzle URL/history writes (`pushState`, `replaceState`, `?puzzle=`) and treat browser history as the likely root cause.

### Production puzzle/game data can contain null-ish strings despite TypeScript types saying `string`
- **Symptom:** App crashes with `Cannot read properties of undefined (reading 'toLowerCase')`, often only on production data first, then locally after the same bad record is loaded.
- **Cause:** Supabase/admin data can contain missing `name`, `title`, or trait fields even though local TS interfaces mark them as required. Direct `.toLowerCase()` inside puzzle/item/augment/synergy normalization is not safe against real DB drift.
- **Avoid:** When matching DB-driven strings, always normalize through a safe helper (e.g. `normalizeLookupValue`) instead of calling `.toLowerCase()` directly on puzzle/item/augment/unit fields.

### Puzzle table resets can silently orphan history/unlock/vote rows if there is no referential guard
- **Symptom:** `user_puzzle_history`, `user_iq_history`, `puzzle_votes`, or `user_unlocked_puzzles` keep lots of rows for puzzle IDs that no longer exist, making analytics and unlock state inconsistent.
- **Cause:** `puzzles.id` changed over time while dependent tables stored raw puzzle IDs without a FK or trigger-based existence check, so old rows survived after puzzle replacement/deletion.
- **Avoid:** Before tightening constraints, archive + delete orphan rows. After that, enforce puzzle references with FK or trigger checks on every table that stores `puzzle_id`.

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

### `useArenaPreloader` must use `preloadArenaBackground()`, not raw `new Image()`
- **Symptom:** Black flash (flicker đen) khi lần đầu chuyển sang scouting nhà người chơi khác.
- **Cause:** `useArenaPreloader` dùng `new Image(); img.src = url` chỉ download image vào browser cache, nhưng không gọi `decode()` và không register vào `loadedImageAssets`. Khi user click scout, `isArenaBackgroundReady()` trả `false`, forcing async preload+decode+rAF path → 1-2 frame gap → `layout-wrapper` background `#000` lộ ra.
- **Avoid:** `useArenaPreloader` phải dùng `preloadArenaBackground()` từ `arenaBackgroundPreload.ts` (cùng helper mà scouting effect dùng). Scouting effect trong `App.tsx` phải check `isArenaBackgroundReady()` trước — nếu warm thì swap `visibleArenaId` đồng bộ, không đi qua async path.

### Puzzle `playerState.level` is a hard board cap, not decorative metadata
- **Symptom:** Builder/gameplay cho phep dat them tuong len board du da full slot theo cap, hoac puzzle cu bi load voi level sai / missing.
- **Cause:** `playerState.level` da ton tai trong schema JSON puzzle tu truoc, nhung runtime khong enforce va admin co luc cho input > `10`.
- **Avoid:** Luon sanitize `level` theo fallback stage `2-1 -> 4`, `3-2 -> 6`, `4-2 -> 8`, con lai `10`, clamp `1..10`, va sanitize `xp` theo level hien tai. Swap tren o dang co tuong o muc cap la hop le vi board count khong tang.

---

### Gemini caption chain can get slower if it starts with preview or deprecated models
- **Symptom:** Flex caption gen lau hon mong doi du task rat ngan, co luc fallback qua nhieu model.
- **Cause:** Chain cu uu tien preview model va `gemini-2.0-flash*`; preview latency co the dao dong, con `2.0 Flash` / `2.0 Flash-Lite` da bi Gemini docs danh dau deprecated. Them nua, `2.5` models co thinking mode va task caption ngan khong can bat.
- **Avoid:** Cho social copy/caption, uu tien `gemini-2.5-flash-lite`, fallback `gemini-2.5-flash`, dat `thinkingBudget: 0`, va prompt ngan theo checklist/output format ro rang thay vi prompt dai + lap y.

### `GameHUD` mobile CSS can be ahead of `GameHUD.tsx` rendering
- **Symptom:** Agent sees mobile dock/sheet selectors in gameplay styles and assumes mobile HUD is already migrated, but runtime still renders desktop sidebars only.
- **Cause:** `src/components/Game/GameHUD.css` (or equivalent mobile HUD styles) can exist before `src/components/Game/GameHUD.tsx` is updated to actually render `mobile-hud-dock` / `mobile-hud-sheet`, leaving gameplay in a half-migrated state.
- **Avoid:** Verify both the CSS and the `GameHUD.tsx` render tree before documenting or extending mobile HUD behavior.

### `coachGameContext.currentAugments` text-only is not enough for augment icon UI
- **Symptom:** Coach/overlay context bar can only show generic placeholders or numeric badges for current puzzle augments, even though the puzzle already has correct augment icons in runtime.
- **Cause:** `App.tsx` historically mapped `currentAugments` to `string[]` titles only before passing them into `CoachGameContext`, so downstream UI had no access to `augment.icon`.
- **Avoid:** Keep `currentAugments` text for prompt/backward compatibility if needed, but pass a separate rich field like `currentAugmentOptions[]` with `id/title/icon/tier` whenever the UI must render real augment visuals.

### Coach Select must not fabricate augment analysis when `visian-chat` / NotebookLM backend fails
- **Symptom:** User still sees a full `Pick / Why / When not / Backup` block even though the backend request actually failed, so NotebookLM/proxy outages look like valid coaching output.
- **Cause:** `coachSelectService` once generated a local heuristic fallback answer whenever `supabase.functions.invoke('visian-chat')` errored or returned an empty payload, masking the real backend failure.
- **Avoid:** Coach Select must only show analysis returned by `visian-chat`. If invoke fails or the answer is empty, switch to an explicit unavailable state/message (for example `Coach dang ban train...`) and keep raw error details in logs/network so backend issues stay debuggable.

### Supabase Edge Function runtime 500 can look like a fake CORS bug in browser console
- **Symptom:** Browser says `blocked by CORS policy` / `preflight request doesn't pass access control check`, but direct requests to the same function can still show `OPTIONS 200` and `POST 500`.
- **Cause:** For `functions/v1/*`, the browser often surfaces any non-2xx preflight/follow-up path as a CORS-looking error. In this project, `visian-chat` was actually failing inside the function with `{"error":"Visian proxy not configured"}` because secrets like `VISIAN_PROXY_URL` / `VISIAN_API_KEY` were missing on the remote project.
- **Avoid:** Do not debug frontend CORS first. Reproduce with a direct `OPTIONS` + `POST` request to the Edge Function and inspect the JSON body. Treat missing function secrets/config as the primary suspect when `OPTIONS` is 200 but `POST` is 500.

### NotebookLM coach integration should use a hosted CLI bridge, not a temporary local tunnel
- **Symptom:** `visian-chat` works only on one dev machine, then remote requests fail with `500`, `404`, or fake-CORS noise once the local proxy/tunnel dies.
- **Cause:** A temporary bridge based on local proxy scripts plus tunnel URLs makes Supabase depend on a fragile workstation process instead of a stable service. It also hides the real NotebookLM CLI contract (`--storage`, fixed notebook, mounted auth state).
- **Avoid:** Keep `visian-chat` as a thin adapter that calls a hosted bridge service. The bridge must shell out to `notebooklm` CLI with a mounted `storage_state.json`, a fixed `NOTEBOOKLM_NOTEBOOK_ID`, sanitized Python env, and an explicit shared API key.

### NotebookLM can keep forcing `[1]`, `[2]`, `[1-3]` citations even when the prompt asks for plain prose
- **Symptom:** Coach/chat answers doc rat tu nhien nhung van dinh citation inline, lam UX nhin nhu raw RAG output.
- **Cause:** Citation formatting den tu NotebookLM generation/runtime; prompt-only instructions khong on dinh enough de suppress hoan toan.
- **Avoid:** Strip citation tokens bang regex nhe ngay sau khi nhan raw answer. Dat o bridge (`services/notebooklm_bridge/bridge.py`) va/hoac Edge Function (`supabase/functions/visian-chat/answer.ts`) de khong can them model pass hay retry, latency gan nhu khong doi.

### NotebookLM CLI can target source shards with `-s`, but it does not expose a dedicated stream flag
- **Symptom:** Agent assumes every NotebookLM ask must read the whole notebook, hoac ky vong `--json` se co token stream san.
- **Cause:** Local CLI help cho thay `notebooklm ask` ho tro `-s/--source` de gioi han theo source ID, nhung khong co flag stream rieng cho answer.
- **Avoid:** Toi uu latency retrieval bang source sharding + `-s` truoc. Neu can stream that su, phai dung text-mode subprocess stdout/SSE bridge thay vi tiep tuc `--json` va cho full blob.

### Coach cache must follow the live decision context, not just `puzzleId + coachId`
- **Symptom:** User hoi coach o phase `path`, sau do vao phase `augment` that su nhung app van mo lai / reuse answer cu nhu the chua nhin 3 augment hien tai.
- **Cause:** Cache key neu chi gom `puzzleId + coachId` se khong phan biet `path`, `plan`, va `augment` contexts trong cung 1 puzzle; them nua response cu co the ve muon sau khi context da doi.
- **Avoid:** Cache key phai include context signature hien tai (`decisionType`, option titles/ids, stage...); dong thoi bo qua response in-flight neu coach context da doi truoc khi request hoan tat. Xem `src/features/coach-select/hooks/useCoachSelect.ts`.

### Coach stream error after early `pick/status` can bypass JSON fallback if hook only retries on transport throw
- **Symptom:** UI hien `Coach dang ban train...` ngay ca khi SSE da bat dau bang `pick`/`status`, du JSON `coach_select` path van co the tra loi duoc.
- **Cause:** `visian-chat` stream mode gui `pick` som truoc khi goi bridge. Neu bridge fail sau do, frontend nhan `error` event thay vi thrown transport error; fallback logic chi retry khi stream promise reject truoc event dau tien se bo lo truong hop nay.
- **Avoid:** Trong `useCoachSelect`, neu stream ket thuc voi `error` ma chua co reasoning meaningful, phai tu dong thu `coachSelectService.askCoach(...)` truoc khi chot unavailable state.

### Remote `coach_select_stream` can still return `200 application/json` while frontend expects SSE
- **Symptom:** Direct POST den `functions/v1/visian-chat` voi `mode=coach_select_stream` van tra `answer` JSON that, nhung UI lai hien unavailable nhu the stream fail.
- **Cause:** Frontend reader parse response nhu SSE bat ke `Content-Type`. Neu backend deploy chua cap nhat sang `text/event-stream`, no se tra `application/json`; client parse khong ra block/event nao, roi ket luan khong co answer.
- **Avoid:** `coachSelectService.streamCoachExplanation` phai detect `Content-Type`. Neu khong phai `text/event-stream`, parse JSON body compat va emit `complete` event thay vi coi la stream loi.

### Coach Select da chuyen sang full NotebookLM answer; dung dung lai flow `Pick -> Tai sao`
- **Symptom:** UI coach hien nhac bi tach roi: loading show `Pick` som, sau do moi co `Tai sao`, nhin nhu giat nhiep va khong dong bo voi answer that tu NotebookLM.
- **Cause:** Flow cu toi uu perceived speed bang optimistic pick/stream chunk, nhung notebook backend cold path rat cham va production stream contract khong on dinh. Ket qua la UX xau hon va code nhanh le branch.
- **Avoid:** Coach Select frontend phai dung JSON one-shot `coach_select` lam duong chinh, loading chi show state cho, va response card chi render mot block `Phan tich` tu full answer. Neu can compat stream cu, de o service layer thoi, khong dua lai vao hook/UI contract.

### `DecisionReview` mobile UI can drift if styles are split between component CSS and `src/styles/mobile.css`
- **Symptom:** Review screen behaves inconsistently on mobile: one stylesheet expects full-screen fixed modal/header DOM, while component markup or another stylesheet expects an in-game scroll shell.
- **Cause:** `DecisionReview` historically had mobile overrides in both `src/components/Arena/DecisionReview.css` and `src/styles/mobile.css`, so old rules could keep forcing stale layout assumptions like `position: fixed`.
- **Avoid:** Treat `src/components/Arena/DecisionReview.css` as the source of truth for DecisionReview mobile styling and remove/neutralize duplicate overrides from `src/styles/mobile.css`.

### Coach Select CTA can become untappable on `phone-landscape` if the overlay keeps desktop height budgets
- **Symptom:** The user can open Coach Select and even see `Hỏi Visian`, but tapping it does nothing or the CTA only becomes reachable after browser/programmatic scroll.
- **Cause:** `CoachSelectOverlay` can still act like a cropped in-canvas layer while `phone-landscape` keeps desktop-sized header/context/carousel rows. That combination can squeeze `.coach-select-content` to a tiny height, push the CTA outside the real visible hit area, and leave touch input fighting clipped layout instead of reaching `askCoach()`.
- **Avoid:** Keep `src/features/coach-select/components/CoachSelectOverlay.css` on the fixed-overlay contract (`position: fixed; inset: 0; pointer-events: auto`) and maintain a dedicated compact `phone-landscape` layout for the header, context chips, panel copy, CTA, and carousel so the CTA stays inside the viewport before any scroll.

### Teemo extra reroll is per augment slot, not a shared global pool
- **Symptom:** After using two rerolls on one augment during Teemo encounter, other augments lose their `2` badge, look clickable but do nothing, or get disabled incorrectly.
- **Cause:** Runtime modeled `hasExtraReroll` as two global charges shared by the whole screen instead of `2 rerolls per slot`.
- **Avoid:** Derive reroll availability and badge count per augment slot from `rerollOrder[index]` + `secondRerollOrder[index]`. Do not gate all rerolls behind one shared `rollChargesRemaining` pool.

### Coach Select swap lag can come from width-based stat bars plus full-carousel rerenders
- **Symptom:** Clicking another coach feels sticky even though the UI only changes portrait/stats.
- **Cause:** Coach swap used to rebuild the whole overlay subtree, including every carousel card image, while stat bars animated through a fill implementation that still forced heavier paint/layout work than necessary.
- **Avoid:** Keep coach-select callbacks stable, memoize carousel items/portrait components, and animate stat progress through `transform: scaleX(...)` with `contain`/`will-change` instead of width-driven fill work.

### Coach pose hero assets must be separated from carousel thumbnails
- **Symptom:** A transparent pro-pose PNG looks broken in the coach overlay or the carousel thumbnail becomes awkwardly cropped after swapping assets.
- **Cause:** Reusing the same `imageSrc` for both the large hero presentation and the small carousel thumbnail mixes two incompatible compositions: bottom-anchored transparent pose art versus square cover art.
- **Avoid:** Keep thumbnail art on `imageSrc` / `fallbackImageSrc`, and route hero-only pose assets through `heroImageSrc` / `heroFallbackImageSrc` plus `heroPresentation`.

### Coach asset filenames can drift from `coachSelect.data.ts` after manual export/cleanup
- **Symptom:** A specific coach portrait never appears even though the PNG exists in `public/coach-assets/` or `public/coach-assets/pose/`, and the UI silently falls back to the champion square art.
- **Cause:** Local asset names were normalized to `*-thumb.png` / `pose/*-clean.png`, but `coachSelect.data.ts` can still point at older names like `.webp`.
- **Avoid:** Whenever adding or replacing coach art, verify both the actual files under `public/coach-assets/` and the exact `imageSrc` / `heroImageSrc` values in `src/features/coach-select/coachSelect.data.ts`.

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

### Deploy artifact folders are not Pages source-of-truth
- **Symptom:** Agent inspects old `deploy/`, `test_deploy/`, or `test_deploy2/` folders and assumes production still runs from `/training/*`.
- **Cause:** Those folders can be stale generated artifacts, partially deleted, or local experiments. Production Cloudflare Pages config lives in `public/_headers` and `public/_redirects` for the root deployment on `training.tftiseasy.com`.
- **Avoid:** Infer production topology from `vite.config.ts`, `public/_headers`, `public/_redirects`, and live domain usage. Do NOT treat generated deploy folders as authoritative deployment config.


### Monetization Mode Toggle (updated 2026-03-17)

**Current architecture:** `MONETIZATION_MODE` is date-driven via `resolveMonetizationMode(new Date(), MONETIZATION_PACKAGING)` in `src/config/monetization.ts`. No more boolean flag.

| Mode | Meaning | `MONETIZATION_ENABLED` |
|------|---------|------------------------|
| `'beta'` | Open Beta — all puzzles free, beta banner shown | `false` |
| `'free-pro'` | Post-beta paywall active | `true` |

**Bật OPEN BETA (tắt paywall):**
```ts
// src/config/monetization.ts
betaWindow: {
    startsAt: '2026-03-17T00:00:00.000Z',
    endsAt: '2026-04-16T23:59:59.999Z',  // ← real end date
},
```

**Simulate post-beta (bật paywall để test):**
```ts
// src/config/monetization.ts
betaWindow: {
    startsAt: '2026-03-17T00:00:00.000Z',
    endsAt: '2026-03-16T23:59:59.999Z',  // TEMP: simulate post-beta — revert to 2026-04-16
},
```

> ⚠️ Luôn revert `endsAt` về `2026-04-16` sau khi test xong. Đây là "TEMP" flag, không commit lên main.

### Coach Select swap performance optimization (2026-03-12)
- **Date:** 2026-03-12
- **File:** `src/features/coach-select/hooks/useCoachSelect.ts`, `src/features/coach-select/components/CoachCarousel.tsx`, `src/features/coach-select/components/CoachPortraitImage.tsx`, `src/features/coach-select/components/CoachStatBars.tsx`, `src/features/coach-select/components/CoachSelectOverlay.tsx`, `src/features/coach-select/components/CoachSelectOverlay.css`
- **Problem:** Clicking swap coach felt laggy because the interaction re-rendered the full carousel and progress bars were not isolated for compositor-friendly animation.
- **Fix:** Stabilized `selectCoach` with `startTransition` + refs, memoized coach carousel/image/stat subtrees, preloaded coach portraits, and moved stat fill animation to `transform: scaleX(...)` with paint containment and `will-change`.

### Pro pose profile hero rebuild (2026-03-12)
- **Date:** 2026-03-12
- **File:** `src/features/coach-select/coachSelect.types.ts`, `src/features/coach-select/coachSelect.data.ts`, `src/features/coach-select/components/CoachHeroPortrait.tsx`, `src/features/coach-select/components/CoachSelectOverlay.tsx`, `src/features/coach-select/components/CoachSelectOverlay.css`, `src/features/coach-select/components/CoachSelectOverlay.test.tsx`, `public/coach-assets/pose/visian-clean.png`, `public/coach-assets/visian-thumb.png`, `scripts/prepare_visian_pose_assets.py`
- **Problem:** The coach hero still behaved like a framed poster, so transparent pro-pose assets floated above the panel floor, showed canvas/checkerboard artifacts, and broke the carousel when reused as thumbnails.
- **Fix:** Split hero-vs-thumbnail asset fields, introduced `CoachHeroPortrait` with `pose` / `art` / `art-fallback` resolution, anchored pose PNGs to the bottom edge of the hero panel with dedicated CSS, generated a clean `Visian` pose asset plus separate thumb, and added tests for pose mode plus fallback mode.

### Coach Select no-fallback NotebookLM contract (2026-03-12)
- **Date:** 2026-03-12
- **File:** `src/features/coach-select/coachSelect.service.ts`, `src/features/coach-select/hooks/useCoachSelect.ts`, `src/features/coach-select/components/CoachResponseCard.tsx`, `src/features/coach-select/coachSelect.service.test.ts`, `src/features/coach-select/hooks/useCoachSelect.test.tsx`, `src/features/coach-select/components/CoachSelectOverlay.test.tsx`
- **Problem:** Client used to fabricate local coach analysis when `visian-chat` failed or returned empty text, hiding backend / NotebookLM CLI issues and making outages look like real picks.
- **Fix:** Removed local fallback generation entirely, throw an unavailable error on invoke failure or empty answer, log parsed Edge Function error details for debugging, and render a themed busy/sleeping coach message instead of fake analysis.

### `visian-chat` missing-secret diagnostics improvement (2026-03-12)
- **Date:** 2026-03-12
- **File:** `supabase/functions/visian-chat/index.ts`, `src/features/coach-select/coachSelect.service.ts`
- **Problem:** Remote `visian-chat` returned a generic `Visian proxy not configured`, while browser console wrapped the failing request as a misleading CORS/preflight issue. That made it hard to see which secret was actually missing.
- **Fix:** Edge Function now returns explicit `detail` + `missingEnv[]` when required secrets are absent, and the client-side error parser now includes those fields in diagnostic logs.

### Hosted NotebookLM CLI bridge for `visian-chat` (2026-03-12)
- **Date:** 2026-03-12
- **File:** `supabase/functions/visian-chat/index.ts`, `services/notebooklm_bridge/*`
- **Problem:** The temporary local proxy+tunnel approach made `visian-chat` depend on a dev machine and produced unstable `500` / fake-CORS failures instead of a real backend contract.
- **Fix:** Replaced the temporary transport with a hosted NotebookLM CLI bridge design. `visian-chat` now expects `NOTEBOOKLM_BRIDGE_URL` and `NOTEBOOKLM_BRIDGE_API_KEY`, while the new Python bridge shells out to `notebooklm --storage <storage_state.json> ask --new -n <NOTEBOOK_ID> --json ...`, verifies notebook visibility on `/health`, sanitizes Python-related env vars, and returns structured errors.

### Coach avatar filename remap fix (2026-03-13)
- **Date:** 2026-03-13
- **File:** `src/features/coach-select/coachSelect.data.ts`, `src/features/coach-select/components/CoachSelectOverlay.test.tsx`
- **Problem:** Coach data drifted from the uploaded asset names. `dit_sap`, `one_by_one`, `buffalow`, and `tftiseasy` still referenced old avatar filenames, so the carousel or hero panel silently fell back to champion square art even though the correct `*-thumb.png` / `pose/*-clean.png` files existed under `public/coach-assets/`. `Dit Sap` was especially fragile because the upload now uses hyphenated names (`dit-sap-thumb.png`, `pose/dit-sap-clean.png`) instead of the earlier no-hyphen variant.
- **Fix:** Repointed every coach to the actual uploaded filenames (`dit-sap-thumb.png`, `1by1-thumb.png`, `buffalow-thumb.png`, `tftiseasy-thumb.png`, and `pose/dit-sap-clean.png`) and added a regression test that loops through all 5 coaches to verify both hero and thumbnail stay on `coach-assets` instead of falling back to `tft-assets`.

### NotebookLM coach latency hot-path optimization (2026-03-13)
- **Date:** 2026-03-13
- **File:** `services/notebooklm_bridge/app.py`, `services/notebooklm_bridge/bridge.py`, `services/notebooklm_bridge/tests/test_bridge.py`, `services/notebooklm_bridge/tests/test_app.py`, `supabase/functions/visian-chat/index.ts`, `supabase/functions/visian-chat/prompt.ts`, `supabase/functions/visian-chat/prompt.test.ts`
- **Problem:** Mỗi lần `Coach Select` hỏi NotebookLM, bridge từng gọi `notebooklm list --json` để verify notebook rồi mới gọi `ask --new`, khiến hot path tốn 2 subprocess + prompt backend còn dài dòng không cần thiết.
- **Fix:** Cắt notebook visibility check khỏi `/ask` (chỉ giữ ở `/health`), cache `NotebookLMBridge` theo process, thêm timing logs nội bộ, rút prompt coach xuống dạng compact 3-line persona + strict 4-line output contract, và serialize game context thành một dòng có truncation cố định để giảm latency.

### Coach Select should reuse cached answer for the same puzzle after "An phan tich" (2026-03-13)
- **Date:** 2026-03-13
- **File:** `src/features/coach-select/hooks/useCoachSelect.ts`, `src/features/coach-select/hooks/useCoachSelect.test.tsx`, `src/App.tsx`
- **Problem:** User could hide the analysis card and immediately ask the same coach on the same puzzle again, which re-hit NotebookLM even though the exact answer had already been returned once.
- **Fix:** Cache successful coach answers by `puzzleId + coachId` inside `useCoachSelect`; if the same coach is asked again on the same puzzle, restore the cached answer instantly instead of calling the backend. Clear that cache when puzzle ID changes.

### Coach FAB must live in viewport HUD and stay available for path/plan phases (2026-03-13)
- **Date:** 2026-03-13
- **File:** `src/App.tsx`, `src/features/coach-select/components/CoachFab.css`, `src/App.mobile-overlay.test.tsx`
- **Problem:** `CoachFab` rendered inside `.app-container` got cropped/drifted near the viewport edge on mobile/desktop non-fullscreen, and the entry point only appeared for augment picking so users could not ask coach during `declaring_intent` / `declaring_plan`.
- **Fix:** Treat `CoachFab` as a viewport utility control: render it inside `.viewport-hud-layer`, anchor it with viewport/safe-area offsets, and gate it by all three gameplay phases (`selecting`, `declaring_intent`, `declaring_plan`). Add mobile-overlay regression tests to ensure the button stays in HUD layer and remains visible during plan declaration.

### Coach Select must follow path/plan phase instead of leaking hidden augment options (2026-03-13)
- **Date:** 2026-03-13
- **File:** `src/App.tsx`, `src/features/coach-select/*`, `supabase/functions/visian-chat/prompt.ts`
- **Problem:** Trong `declaring_intent` / `declaring_plan`, app vẫn build coach context từ 3 augment options runtime dù UI chưa reveal augment, nên Coach phân tích sai loại quyết định mà user đang nhìn.
- **Fix:** Build `coachGameContext` theo phase: `path` cho `declaring_intent`, `plan` cho `declaring_plan`, chỉ gửi augment options khi thật sự vào phase chọn augment. Coach question, prompt serialization, và context bar UI cũng phải đọc `decisionType/currentDecisionOptions` thay vì mặc định `currentAugments`.

### Coach Select should route each coach to a different NotebookLM notebook, not fake multi-voice one notebook
- **Symptom:** Agent assumes persona text alone is enough to simulate 5 coaches while the backend actually points every request to one fixed `NOTEBOOKLM_NOTEBOOK_ID`.
- **Cause:** A single shared notebook can change tone a bit, but it does not preserve separate coach-specific source/RAG spaces. In this project the user already maintains distinct notebooks per coach.
- **Avoid:** Use per-request `notebook_id` on the bridge and map `coachId` to the real notebook IDs:
  - `visian -> Wasianiverson`
  - `dit_sap -> Dishsoap`
  - `one_by_one -> YBY1`
  - `buffalow -> Trâu TV`
  - `tftiseasy -> TFTISEASY set 16`

### Docker Compose bootstrap for NotebookLM bridge on EC2 (2026-03-12)
- **Date:** 2026-03-12
- **File:** `services/notebooklm_bridge/docker-compose.yml`, `services/notebooklm_bridge/.env.example`, `services/notebooklm_bridge/README.md`
- **Problem:** Manual `docker run` instructions with placeholder `image: <YOUR_IMAGE>` and `curl`-based healthchecks are brittle, easy to misconfigure, and fail on minimal Python images that do not include `curl`.
- **Fix:** Added a ready-to-run Compose setup that builds the bridge image locally, mounts `./secrets/storage_state.json` to `/app/secrets/storage_state.json`, binds only `127.0.0.1:8080`, restarts with `unless-stopped`, and uses a Python-based healthcheck that works with the existing image.

### EC2 bridge deployment should ship helper scripts, not rely on copy-pasted chat steps
- **Symptom:** User gets stuck halfway through EC2 setup because chat instructions use placeholders, omit upload steps, or assume the service folder is already perfectly arranged on the server.
- **Cause:** NotebookLM bridge deploy has a few non-obvious moving parts: sync files to EC2, create `.env`, place `storage_state.json`, start Compose, then wire Nginx.
- **Avoid:** Keep deploy helpers in-repo under `services/notebooklm_bridge/deploy/ec2/`:
  - `sync-to-ec2.ps1` to upload the bridge bundle from Windows
  - `bootstrap.sh` to start the service on EC2
  - `nginx/notebooklm-bridge.conf` as the reverse-proxy template

### NotebookLM citation stripping on bridge + edge function (2026-03-13)
- **Date:** 2026-03-13
- **File:** `services/notebooklm_bridge/bridge.py`, `services/notebooklm_bridge/tests/test_bridge.py`, `supabase/functions/visian-chat/answer.ts`, `supabase/functions/visian-chat/answer.test.ts`, `supabase/functions/visian-chat/index.ts`
- **Problem:** NotebookLM / CLI van co xu huong chen citation `[1]`, `[2]`, `[1-3]` vao coach/chat response, prompt khong suppress on dinh nen output nhin rat "tool".
- **Fix:** Them helper strip citation bang regex nhe o bridge va Edge Function. Sanitize ngay sau khi nhan raw answer, giu dau cau + xuong dong, khong them them request/model pass nen speed thuc te khong doi dang ke.

### Docker/container healthcheck must use `/live`, not deep `/health`, for NotebookLM bridge
- **Symptom:** Bridge P95 xau di du traffic that rat thap, va EC2 co request CLI nen khong ro nguon tu user hay background.
- **Cause:** `GET /health` cua bridge goi `notebooklm list --json` de verify notebook visibility. Neu Docker Compose/Nginx/system monitor ping `/health` dinh ky, no se spawn CLI subprocess nen va canh tranh tai nguyen voi hot path `/ask`.
- **Avoid:** Dung `GET /live` cho container liveness. Giu `GET /health` cho deep canary theo chu ky dai hon (vd 5 phut) bang timer/cron rieng.

### Production `visian-chat` `502` can be just an expired NotebookLM `storage_state.json` on EC2
- **Symptom:** Browser spam `502` for `functions/v1/visian-chat`; Supabase edge logs show `OPTIONS 200` but `POST 502`; bridge `/health` returns `cli_failed` with `Authentication expired or invalid`.
- **Cause:** The Edge Function can still reach the EC2 bridge, but the bridge's mounted NotebookLM auth file at `~/notebooklm-bridge/secrets/storage_state.json` is expired, so downstream CLI calls fail and `visian-chat` maps that failure to `502`.
- **Avoid:** Debug in this order: `curl http://127.0.0.1:8080/live`, then `curl http://127.0.0.1:8080/health`, then refresh the server copy of `storage_state.json` from the Windows source `C:\Users\Administrator\.notebooklm\storage_state.json`, restart `docker compose`, and finally retest the Supabase function directly.

### NotebookLM bridge observability should correlate via `x-request-id` end-to-end
- **Symptom:** Co log `subprocess_ms` o EC2 va log loi o Supabase nhung kho biet cung mot request hay khong, nhat la luc timeout / dedupe / retry.
- **Cause:** Hot path `frontend -> visian-chat -> bridge` co 2 hop mang va truoc day khong co correlation id chung.
- **Avoid:** `visian-chat` phai tao `request_id`, gui xuong bridge bang header `x-request-id`, bridge echo lai header do, va ca 2 ben log cung `request_id` + `notebook_id` + timing.

### NotebookLM bridge backend dedupe/cache is per Gunicorn worker, not global across all workers/hosts
- **Symptom:** Agent them in-memory cache + in-flight dedupe o bridge roi ky vong moi request duplicate tren toan cluster deu hop nhat thanh 1 subprocess.
- **Cause:** Runtime hien tai dung process-local memory trong Flask/Gunicorn worker. Cache/dedupe khong shared giua workers khac nhau hay giua nhieu EC2 hosts.
- **Avoid:** Xem day la optimization cho single-host low-concurrency. Neu can cross-worker hoac cross-instance dedupe that su, phai them shared store/lock nhu Redis.

### NotebookLM bridge latency + resiliency hardening rollout (2026-03-13)
- **Date:** 2026-03-13
- **File:** `services/notebooklm_bridge/app.py`, `services/notebooklm_bridge/bridge.py`, `services/notebooklm_bridge/tests/test_bridge.py`, `services/notebooklm_bridge/tests/test_app.py`, `services/notebooklm_bridge/Dockerfile`, `services/notebooklm_bridge/docker-compose.yml`, `services/notebooklm_bridge/.env.example`, `services/notebooklm_bridge/README.md`, `services/notebooklm_bridge/deploy/ec2/*`, `supabase/functions/visian-chat/index.ts`
- **Problem:** Hot path van thieu correlation logging, bridge healthcheck dinh ky van co the goi CLI, Gunicorn runtime chua explicit worker config, timeout giua bridge va Edge Function dang ngang nhau, va duplicate request giong het van spawn nhieu subprocess khong can thiet.
- **Fix:** Them `x-request-id` correlation va timing logs o Edge + bridge, tach `GET /live` khoi deep `GET /health`, explicit Gunicorn worker/timeout/max-request defaults, align timeout theo thu tu bridge < gunicorn < nginx, them per-worker in-flight dedupe + TTL cache 45s cho exact identical query, va ship them deep-health EC2 helper + systemd timer sample.

### Coach Select minimize-to-board session must not be gated by `isAugmentOpen` (2026-03-13)
- **Date:** 2026-03-13
- **File:** `src/App.tsx`, `src/features/coach-select/hooks/useCoachSelect.ts`, `src/features/coach-select/components/*`, `src/App.mobile-overlay.test.tsx`
- **Problem:** Khi user an coach de ra ngoai xem board, viec dong selector/path/plan bang `setIsAugmentOpen(false)` tung vo tinh kill luon coach session, mat loading/response dang cho va khong co duong quay lai doc phan tich.
- **Fix:** Tach session coach khoi visibility cua overlay. `useCoachSelect` nay giu nguyen loading/response khi minimize, `App.tsx` chi an options de user quan sat board, hien return FAB mo ngay o state dim, va khi phan tich xong thi bat toast + promote FAB de mo lai overlay da duoc preserve.

### Coach Select SSE transport cannot use `supabase.functions.invoke`
- **Symptom:** Agent tries to stream Coach Select through `supabase.functions.invoke('visian-chat')`, but the client only gets a buffered JSON-style completion and never receives incremental SSE events.
- **Cause:** `supabase.functions.invoke` is fine for one-shot Edge Function responses, but it is the wrong transport for this repo's `POST` + large `gameContext` + `text/event-stream` flow. Coach Select streaming needs direct access to the raw `fetch` body reader.
- **Avoid:** For Coach Select stream mode, call `${VITE_SUPABASE_URL}/functions/v1/visian-chat` via `fetch` with `Accept: text/event-stream`, plus `apikey` and `Authorization: Bearer <anon key>`. Keep `askCoach()` on `supabase.functions.invoke` only as the non-stream fallback path.

### Coach Select SSE explain-only rollout (2026-03-13)
- **Date:** 2026-03-13
- **File:** `src/App.tsx`, `src/features/coach-select/coachSelect.types.ts`, `src/features/coach-select/coachSelect.service.ts`, `src/features/coach-select/hooks/useCoachSelect.ts`, `src/features/coach-select/components/CoachResponseCard.tsx`, `src/features/coach-select/components/CoachSelectOverlay.tsx`, `supabase/functions/visian-chat/index.ts`, `supabase/functions/visian-chat/prompt.ts`
- **Problem:** Coach Select cu phai doi NotebookLM tra full blob text moi hien duoc pick, tao cam giac do. Hon nua, prompt cu van de model tu chon option thay vi chi giai thich pick cua Pro.
- **Fix:** Dua `proChoiceId/proChoiceLabel` vao `CoachGameContext`, stream `pick` ngay tu puzzle metadata bang SSE `fetch`, chi dung NotebookLM de tra loi explain-only `Tai sao: ...`, fake-typing tren frontend bang chunked reasoning, va giu JSON path cu lam fallback neu thieu pro choice hoac stream fail truoc khi mo duoc SSE.

### Coach response card layout regression fix (2026-03-13)
- **Date:** 2026-03-13
- **File:** `src/features/coach-select/components/CoachResponseCard.tsx`, `src/features/coach-select/components/CoachSelectOverlay.css`
- **Problem:** Loading state cua `CoachResponseCard` tung khong co layout rieng, lam dots/status/CTA "Ra ngoai xem lai board" bi troi lech trong card. Dong thoi component bi rot mat structure `Pick / Tai sao / Trang thai` du CSS va test da xem day la contract.
- **Fix:** Khoi phuc render theo section `Pick`, `Tai sao`, `Trang thai`; them loading composition rieng cho khu "Coach dang doc the tran" va canh lai CTA observe-board de card can doi hon, dung visual language cua overlay, va pass lai test component.

### Coach Select prefetch adoption must enter loading immediately after the user clicks
- **Symptom:** User bam `Hỏi Visian` khi prefetch background dang chay, nhung overlay van nam o man `select` mot luc nen nhin giong nhu CTA bi chet / click khong an.
- **Cause:** `askCoach()` truoc day `await prefetchPromiseRef.current` truoc khi set `uiState = 'loading'`, nen click cua user khong co ack UI ngay lap tuc neu request dang duoc "adopt" tu prefetch.
- **Avoid:** Giữ prefetch hoan toan silent truoc click, nhung ngay khi user click CTA thi phai set loading state ngay lap tuc, roi moi cho promise prefetched resolve va reuse ket qua do thay vi spawn request thu hai.
