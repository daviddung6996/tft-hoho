# Mobile Menu Sheet Redesign — Awwwards-Grade Bottom Sheet

## Status: `DRAFT`

## 1. Problem

Current mobile menu bottom sheet (screenshot attached) is minimal and cramped:
- Profile card + IQ panel are stacked vertically with tight spacing
- Menu items (`Quản trị`, `Chọn Đấu Trường`, etc.) are plain text rows with no visual hierarchy
- T-Coin balance is absent (removed from menu, hidden on mobile header)
- No visual polish — feels like a debug panel, not a polished mobile product
- Missing items that exist on desktop: Video Library count, Support link visibility is poor
- No drag-to-dismiss gesture (standard mobile UX)
- No visual grouping of related actions

**Scope:** Mobile only (`phone-landscape` / `viewport-hud-layer[data-layout-mode="phone-landscape"]`). Desktop menu MUST remain 100% unchanged.

---

## 2. Design Vision — Awwwards Mobile Sheet

Inspired by premium mobile apps (Linear, Raycast, Cash App, Arc Browser):

### Layout Structure (top → bottom):

```
┌──────────────────────────────────┐
│  ─── drag handle ───             │  ← 4px × 36px rounded pill, rgba gold
│                                  │
│  ┌─ HERO SECTION ──────────────┐ │
│  │  [Avatar]  Admin TFT        │ │  ← Large avatar (48px), bold name
│  │            @tftiseasy        │ │  ← Subtitle / gamertag
│  │            View Profile →    │ │  ← Gold accent link
│  └──────────────────────────────┘ │
│                                  │
│  ┌─ STATS ROW (horizontal) ────┐ │
│  │  ┌─────────┐  ┌─────────┐  │ │
│  │  │ TFT IQ  │  │ T-Coin  │  │ │  ← Two side-by-side stat cards
│  │  │ [Icon]  │  │ [Icon]  │  │ │
│  │  │  1250   │  │   85    │  │ │  ← Large number, rank/unit below
│  │  │ Diamond │  │ T-Coin  │  │ │
│  │  │ ██████░ │  │         │  │ │  ← Progress bar (IQ only)
│  │  └─────────┘  └─────────┘  │ │
│  └──────────────────────────────┘ │
│                                  │
│  ─ section divider ─             │  ← Gold gradient line
│                                  │
│  ┌─ NAVIGATION GROUP ──────────┐ │
│  │  ◈ Chọn Đấu Trường      →  │ │  ← Each row: icon + label + chevron
│  │  ▶ Kho Pro Analysis  12/20 │ │  ← Badge count on right
│  │  ☕ Ủng hộ dự án           │ │
│  └──────────────────────────────┘ │
│                                  │
│  ─ section divider ─             │
│                                  │
│  ┌─ SYSTEM GROUP ──────────────┐ │
│  │  ⬡ Quản trị             →  │ │  ← Admin only
│  │  ⤢ Toàn màn hình           │ │  ← Fullscreen toggle (MOVED here)
│  │  → Đăng xuất               │ │  ← Destructive action, muted color
│  └──────────────────────────────┘ │
│                                  │
│  padding bottom (safe-area)      │
└──────────────────────────────────┘
```

---

## 3. Design Tokens (Mobile Sheet Only)

### Dimensions
| Token | Value |
|-------|-------|
| Sheet max-height | `82vh` |
| Sheet border-radius (top) | `24px 24px 0 0` |
| Drag handle | `4px × 36px`, `border-radius: 2px` |
| Avatar size | `48px` |
| Menu item min-height | `48px` (touch target) |
| Section padding | `16px horizontal` |
| Item gap | `2px` |
| Section gap | `12px` |

### Colors (follow Hextech system)
| Element | Value |
|---------|-------|
| Sheet background | `linear-gradient(180deg, #132e31 0%, #071d1f 100%)` |
| Drag handle | `rgba(200, 170, 110, 0.35)` |
| Hero name | `#F0E6D2` |
| Hero subtitle | `rgba(200, 170, 110, 0.65)` |
| Stat card bg | `rgba(0, 0, 0, 0.30)` |
| Stat card border | `1px solid rgba(200, 170, 110, 0.15)` |
| Stat value (number) | `#FFFFFF` |
| Stat label | `rgba(200, 170, 110, 0.55)` |
| Nav item text | `#F0E6D2` |
| Nav item icon | `#c8aa6e` |
| Nav item hover/active | `rgba(200, 170, 110, 0.10)` |
| Section divider | `linear-gradient(90deg, transparent, rgba(200,170,110,0.20), transparent)` |
| Destructive text (logout) | `rgba(248, 113, 113, 0.75)` |
| Badge bg | `rgba(200, 170, 110, 0.15)` |
| Badge text | `#c8aa6e` |

### Typography
| Element | Font | Size | Weight |
|---------|------|------|--------|
| Display name | Inter | `16px` | `700` |
| Subtitle/gamertag | Inter | `12px` | `500` |
| Stat value | Spectral | `26px` | `700` |
| Stat label | Inter | `10px` | `600`, `uppercase`, `letter-spacing: 0.5px` |
| Nav item | Inter | `14px` | `500` |
| Badge count | Share Tech Mono | `11px` | `600` |
| Section header (if any) | Inter | `10px` | `700`, `uppercase` |

---

## 4. Interaction Patterns

### 4.1 Open Animation
- **Backdrop:** Fade in `rgba(0,0,0,0.65)` + `backdrop-filter: blur(6px)` over `300ms`
- **Sheet:** Slide up from bottom with `cubic-bezier(0.32, 0.72, 0, 1)` over `400ms`
- **Content items:** Staggered fade-in, each item `30ms` delay after sheet reaches position (CSS `animation-delay` on `.menu-nav-item:nth-child(n)`)

### 4.2 Close Methods
1. **Tap backdrop** → slide down + fade out (`250ms`)
2. **Drag handle down** → velocity-based dismiss (if dragged >30% of sheet height OR velocity > 0.5px/ms, dismiss; else snap back)
3. **Swipe down on sheet content** (when scrolled to top) → same as drag handle
4. **Tap any menu item** → action fires, sheet closes

### 4.3 Drag-to-Dismiss (New)
- Track `touchstart` / `touchmove` / `touchend` on the sheet
- Only activate drag-dismiss when `scrollTop === 0` (content is at top)
- During drag: sheet follows finger with `transform: translateY(...)`, backdrop opacity reduces proportionally
- Visual indicator: drag handle brightens during active drag

### 4.4 Haptic Feedback (Optional/Progressive)
- `navigator.vibrate?.(10)` on menu item tap (if supported)

---

## 5. Structural Changes

### 5.1 `SettingsButton.tsx` — Mobile Sheet Markup Changes

**New mobile-specific DOM structure** (rendered conditionally when `phone-landscape`):

```tsx
{/* Mobile Bottom Sheet — only rendered on phone-landscape */}
{isOpen && isMobile && (
  <>
    <div className="mobile-sheet-backdrop" onClick={close} />
    <div className="mobile-sheet" ref={sheetRef} onTouchStart={...} onTouchMove={...} onTouchEnd={...}>
      {/* Drag Handle */}
      <div className="mobile-sheet-handle">
        <div className="mobile-sheet-handle-bar" />
      </div>

      {/* Hero Section */}
      <div className="mobile-sheet-hero" onClick={goToProfile}>
        <div className="mobile-sheet-avatar">{initial}</div>
        <div className="mobile-sheet-hero-info">
          <div className="mobile-sheet-name">{displayName}</div>
          <div className="mobile-sheet-subtitle">View Profile →</div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="mobile-sheet-stats">
        <div className="mobile-sheet-stat-card">
          <span className="mobile-sheet-stat-label">TFT IQ</span>
          <div className="mobile-sheet-stat-value-row">
            <IqRankIcon rank={rank} />
            <span className="mobile-sheet-stat-value">{iqScore}</span>
          </div>
          <span className="mobile-sheet-stat-rank" style={{color: rankColor}}>{rankName}</span>
          <div className="mobile-sheet-progress"><div className="mobile-sheet-progress-fill" /></div>
          <span className="mobile-sheet-stat-next">{nextRankText}</span>
        </div>
        <div className="mobile-sheet-stat-card">
          <span className="mobile-sheet-stat-label">T-Coin</span>
          <div className="mobile-sheet-stat-value-row">
            <TCoinIcon size={20} />
            <span className="mobile-sheet-stat-value">{tcoinBalance}</span>
          </div>
        </div>
      </div>

      {/* Navigation Group */}
      <div className="mobile-sheet-divider" />
      <div className="mobile-sheet-nav-group">
        <button className="mobile-sheet-nav-item" onClick={arenaClick}>
          <span className="mobile-sheet-nav-icon">◈</span>
          <span>Chọn Đấu Trường</span>
          <span className="mobile-sheet-nav-chevron">›</span>
        </button>
        <button className="mobile-sheet-nav-item" onClick={libraryClick}>
          <span className="mobile-sheet-nav-icon">{videoSvg}</span>
          <span>Kho Pro Analysis</span>
          {totalCount > 0 && <span className="mobile-sheet-badge">{unlockedCount}/{totalCount}</span>}
        </button>
        <button className="mobile-sheet-nav-item" onClick={supportClick}>
          <span className="mobile-sheet-nav-icon">☕</span>
          <span>Ủng hộ dự án</span>
        </button>
      </div>

      {/* System Group */}
      <div className="mobile-sheet-divider" />
      <div className="mobile-sheet-nav-group">
        {isAdmin && (
          <button className="mobile-sheet-nav-item" onClick={adminClick}>
            <span className="mobile-sheet-nav-icon">⬡</span>
            <span>Quản trị</span>
            <span className="mobile-sheet-nav-chevron">›</span>
          </button>
        )}
        <button className="mobile-sheet-nav-item" onClick={toggleFullscreen}>
          <span className="mobile-sheet-nav-icon">{fullscreenSvg}</span>
          <span>{isFullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}</span>
        </button>
        <button className="mobile-sheet-nav-item mobile-sheet-nav-item--danger" onClick={logout}>
          <span className="mobile-sheet-nav-icon">↪</span>
          <span>{isGuest ? 'Đăng nhập' : 'Đăng xuất'}</span>
        </button>
      </div>
    </div>
  </>
)}
```

### 5.2 Mobile Layout Mode Detection

Use existing `getLayoutMode()` from `src/components/Game/mobileLayout.ts`. Import and call in component:

```tsx
const [layoutMode, setLayoutMode] = useState(getLayoutMode());
// sync on resize (already done in App.tsx, can also read from data-layout-mode attribute)
const isMobile = layoutMode === 'phone-landscape';
```

Or simpler: read `data-layout-mode` from the parent `viewport-hud-layer` element.

### 5.3 T-Coin Balance in Sheet

Import `useTCoin()` hook (already used by `TCoinBalance.tsx`):
```tsx
import { useTCoin } from '../../features/tcoin/hooks/useTCoin';
const { balance } = useTCoin();
```

Use `<TCoinIcon size={20} />` per mandatory pattern (AGENTS.md).

### 5.4 Fullscreen Button — Move INTO Sheet on Mobile

On mobile, the standalone `.fullscreen-button` in the top bar is unnecessary clutter. Move fullscreen toggle into the sheet as a nav item.

**CSS change:** Hide `.fullscreen-button` on `phone-landscape`:
```css
.viewport-hud-layer[data-layout-mode="phone-landscape"] .fullscreen-button {
    display: none;
}
```

---

## 6. File Changes

### `src/components/Settings/SettingsButton.tsx`
- **[MODIFY]** Add mobile layout detection (`isMobile` state or derived from context)
- **[MODIFY]** Conditionally render new `mobile-sheet-*` DOM when `isMobile && isOpen`
- **[MODIFY]** Keep existing desktop dropdown render path untouched (gated by `!isMobile`)
- **[ADD]** Import `useTCoin` hook, `TCoinIcon` component
- **[ADD]** Touch drag-to-dismiss handler (`handleTouchStart`, `handleTouchMove`, `handleTouchEnd`)
- **[ADD]** Staggered animation class assignment on nav items

### `src/components/Settings/SettingsButton.css`
- **[ADD]** New CSS block for all `mobile-sheet-*` classes (scoped under `viewport-hud-layer[data-layout-mode="phone-landscape"]`)
- **[MODIFY]** Hide `.fullscreen-button` on `phone-landscape`
- **[KEEP]** All existing desktop styles (`menu-dropdown`, `menu-profile-card`, etc.) — NO changes
- **[REMOVE]** Old `phone-landscape` overrides for `.menu-dropdown` (replaced by new sheet styles)

### `src/components/Settings/MobileMenuSheet.css` (NEW — optional split)
- If CSS becomes too long (>200 lines mobile-only), extract to separate file
- Otherwise keep in `SettingsButton.css` under clear section comment

---

## 7. Animation Keyframes

```css
@keyframes mobile-sheet-up {
    from { transform: translateY(100%); }
    to   { transform: translateY(0); }
}

@keyframes mobile-sheet-down {
    from { transform: translateY(0); opacity: 1; }
    to   { transform: translateY(100%); opacity: 0; }
}

@keyframes mobile-sheet-backdrop-in {
    from { opacity: 0; }
    to   { opacity: 1; }
}

@keyframes mobile-sheet-item-in {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
}
```

Staggered items:
```css
.mobile-sheet-nav-item:nth-child(1) { animation-delay: 0.05s; }
.mobile-sheet-nav-item:nth-child(2) { animation-delay: 0.08s; }
.mobile-sheet-nav-item:nth-child(3) { animation-delay: 0.11s; }
.mobile-sheet-nav-item:nth-child(4) { animation-delay: 0.14s; }
.mobile-sheet-nav-item:nth-child(5) { animation-delay: 0.17s; }
```

---

## 8. Drag-to-Dismiss Implementation

```typescript
// Simplified drag-to-dismiss logic
const sheetRef = useRef<HTMLDivElement>(null);
const dragStart = useRef<{ y: number; time: number } | null>(null);

const handleTouchStart = (e: React.TouchEvent) => {
    const sheet = sheetRef.current;
    if (!sheet || sheet.scrollTop > 0) return; // only when at top
    dragStart.current = { y: e.touches[0].clientY, time: Date.now() };
};

const handleTouchMove = (e: React.TouchEvent) => {
    if (!dragStart.current || !sheetRef.current) return;
    const dy = e.touches[0].clientY - dragStart.current.y;
    if (dy > 0) { // dragging down
        sheetRef.current.style.transform = `translateY(${dy}px)`;
        // reduce backdrop opacity proportionally
    }
};

const handleTouchEnd = (e: React.TouchEvent) => {
    if (!dragStart.current || !sheetRef.current) return;
    const dy = e.changedTouches[0].clientY - dragStart.current.y;
    const dt = Date.now() - dragStart.current.time;
    const velocity = dy / dt; // px/ms

    if (dy > sheetRef.current.offsetHeight * 0.3 || velocity > 0.5) {
        closeSheet(); // dismiss
    } else {
        sheetRef.current.style.transform = ''; // snap back
    }
    dragStart.current = null;
};
```

---

## 9. Responsive Considerations

- **Portrait phone:** This spec targets `phone-landscape` (the primary gameplay mode). If `phone-portrait` detection is added later, the same sheet applies.
- **Tablet:** NOT affected. Tablets use desktop dropdown.
- **Desktop:** NOT affected. Zero CSS leakage — all mobile sheet styles scoped under `viewport-hud-layer[data-layout-mode="phone-landscape"]`.
- **Safe areas:** Bottom padding uses `max(24px, env(safe-area-inset-bottom))` for notch/gesture-bar devices.

---

## 10. Edge Cases

| Case | Behavior |
|------|----------|
| Guest user (no profile) | Hero section shows "Khách" + "Đăng nhập →" instead of "View Profile →" |
| Guest — no IQ stats | IQ card shows `0` / `UNRANKED`, progress bar empty |
| Guest — no T-Coin | T-Coin card shows `0` |
| Admin user | "Quản trị" item visible in System group |
| Non-admin | "Quản trị" item hidden |
| Very long display name | Truncate with `text-overflow: ellipsis` at 1 line |
| Sheet content overflows 82vh | `overflow-y: auto` with momentum scroll |
| Fullscreen already active | Toggle label changes to "Thoát toàn màn hình" |
| Monetization disabled | T-Coin card still shows balance (it's free economy, not paywalled) |

---

## 11. Verification Plan

### Manual Testing
1. `npm run dev` → open Chrome DevTools → iPhone SE landscape
2. Tap hamburger → sheet slides up from bottom with stagger animation
3. Verify: drag handle visible, hero section, 2 stat cards side-by-side, nav items with chevrons
4. Tap backdrop → sheet dismisses
5. Drag handle down >30% → sheet dismisses
6. Drag handle down <30% → sheet snaps back
7. Verify T-Coin balance shows with `<TCoinIcon />`
8. Verify fullscreen toggle is IN the sheet, NOT in top bar
9. Switch to desktop viewport → verify NOTHING changed (dropdown menu as before)
10. Check all menu actions work: Arena, Library, Support, Admin, Logout

### Checklist
- [ ] Desktop menu unchanged
- [ ] Mobile sheet has drag handle
- [ ] Hero section: avatar + name + View Profile
- [ ] Stats row: IQ card + T-Coin card side-by-side
- [ ] IQ progress bar with rank color
- [ ] Navigation group with chevrons
- [ ] System group with fullscreen toggle
- [ ] Staggered item animations
- [ ] Drag-to-dismiss works
- [ ] Backdrop tap closes
- [ ] Safe area padding at bottom
- [ ] No layout shift on open/close (no `filter`/`backdrop-filter` on game container)
- [ ] Guest user shows login CTA
- [ ] TCoinIcon used (not emoji 🪙)

---

## 12. Tasks

- [ ] Task 1: Add mobile layout detection to `SettingsButton.tsx` (import `getLayoutMode` or read attribute)
- [ ] Task 2: Build mobile sheet DOM structure (hero, stats row, nav groups) — conditional render alongside existing desktop dropdown
- [ ] Task 3: Import `useTCoin` + `TCoinIcon`, render T-Coin stat card in mobile sheet
- [ ] Task 4: Write all `mobile-sheet-*` CSS classes (scoped under phone-landscape)
- [ ] Task 5: Implement drag-to-dismiss touch handlers
- [ ] Task 6: Add staggered animation keyframes + delays
- [ ] Task 7: Move fullscreen toggle into sheet, hide standalone button on mobile
- [ ] Task 8: Handle edge cases (guest, admin, long names, overflow)
- [ ] Task 9: Manual verification on multiple viewport sizes
