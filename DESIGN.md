---
name: TFTISEASY Training Tool
description: A premium Hextech decision chamber for practicing TFT choices against a real Challenger player.
colors:
  hextech-gold: "#C8AA6E"
  hextech-gold-hover: "#D4B876"
  hextech-gold-deep: "#A07828"
  submerged-green: "#051C1E"  # app/base/sunken background (replaces tactical-void #090C14)
  # tactical-void: "#090C14"  # DEPRECATED — dark navy forbidden for background roles
  panel-teal: "#153A3E"
  abyss-teal: "#051C1E"  # kept as alias; now == submerged-green
  text-starlight: "#F0F6FC"
  text-cream: "#F0E6D2"
  text-muted: "#94A3B8"
  combat-rose: "#FF4E50"
  success: "#10B981"
  danger: "#EF4444"
  warning: "#EAB308"
  info: "#0EA5E9"
  tier-advanced: "#E8C252"
  tier-rare: "#C084FC"
  tier-rare-depth: "#A855F7"
  interaction-swap: "#9333EA"
  game-gold: "#FFD700"
  live-danger: "#FF3B3B"
  review-accent: "#FFB8C6"
  rank-challenger: "#00D1C1"
  rank-grandmaster: "#FF6B35"
  rank-master: "#8B5CF6"
  rank-diamond: "#4F46E5"
  rank-platinum: "#0EA5E9"
  rank-gold: "#EAB308"
  rank-silver: "#94A3B8"
  rank-bronze: "#B45309"
  rank-iron: "#4B5563"
typography:
  display:
    fontFamily: "Spectral, Georgia, serif"
    fontSize: "1.5cqw"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.02em"
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.8cqw"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.7cqw"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.05em"
  technical:
    fontFamily: "ui-monospace, Cascadia Mono, Consolas, monospace"
    fontSize: "0.75cqw"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "0.02em"
rounded:
  hairline: "0.1cqw"
  micro: "0.12cqw"
  subtle: "0.15cqw"
  tight: "0.2cqw"
  compact: "0.25cqw"
  control: "0.3cqw"
  control-lg: "0.35cqw"
  panel: "0.4cqw"
  panel-lg: "0.45cqw"
  panel-xl: "0.5cqw"
  display: "0.6cqw"
  pill: "999px"
  circle: "50%"
spacing:
  xs: "0.2cqw"
  sm: "0.5cqw"
  md: "0.8cqw"
  lg: "1.2cqw"
  xl: "2cqw"
components:
  button-primary:
    backgroundColor: "#00000000"
    textColor: "{colors.text-cream}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "0.5cqw 1.2cqw"
  button-primary-hover:
    backgroundColor: "{colors.panel-teal}"
    textColor: "{colors.hextech-gold-hover}"
  input:
    backgroundColor: "#00000066"
    textColor: "{colors.text-starlight}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "0.5cqw 0.8cqw"
  panel:
    backgroundColor: "{colors.abyss-teal}"
    textColor: "{colors.text-starlight}"
    rounded: "{rounded.panel}"
    padding: "1.2cqw"
  navigation-active:
    backgroundColor: "#00000000"
    textColor: "{colors.hextech-gold}"
    typography: "{typography.label}"
---

# Design System: TFTISEASY Training Tool

## 1. Overview

**Creative North Star: "The Challenger Decision Chamber"**

TFTISEASY should feel like stepping into an elite Hextech review room built around one consequential choice. The TFT board supplies the world and spatial context; restrained teal surfaces, antique gold framing, and clear result states direct attention to the decision. The atmosphere is premium and arcane, but the interaction model remains familiar, fast, and legible.

The system rejects the generic SaaS dashboard with teal borders, noisy neon cyberpunk, and unrelated floating card stacks. It also rejects ceremonial decoration that delays feedback. Every visible layer must strengthen one of three moments: choosing, validating, or sharing.

**Key Characteristics:**

- Dark tactical canvas with teal—not pitch-black—working surfaces.
- Antique gold used as hierarchy and framing, never as uncontrolled decoration.
- Spectral headings for rare ceremonial emphasis; Inter for the working product UI.
- Container-relative `cqw` sizing inside the 16:9 game canvas, with explicit mobile floors and safe areas.
- Layered radial atmosphere on overlays; opacity-only entrances for stable gameplay geometry.

**The One Focal Decision Rule.** Every gameplay state has one dominant question or result. Supporting panels may explain the board, but they must not compete with the active decision.

## 2. Colors

The palette anchors on Submerged Green (`#051C1E`) as the app/base canvas, deep teal working surfaces elevated above it, and a scarce antique-gold signal.

### Primary

- **Hextech Gold** (`colors.hextech-gold`): borders, active hierarchy, headings, focus, and the ceremonial edge around important actions.
- **Gold Hover** (`colors.hextech-gold-hover`): a short-lived interaction state; never a second persistent accent.
- **Gold Deep** (`colors.hextech-gold-deep`): depth within gold gradients and pressed states.

### Secondary

- **Panel Teal** (`colors.panel-teal`): the bright edge of modal and panel gradients.
- **Abyss Teal** (`colors.abyss-teal`): modal depth, dense card bases, and the dark end of Hextech surfaces.
- **Combat Rose** (`colors.combat-rose`): destructive or combat-relevant meaning only.

### Tertiary

- **Rank Identity** (`colors.rank-*`): the canonical Challenger-to-Iron mapping. Components must receive rank color from the shared calculator; local redefinitions are forbidden.
- **Success** and **Danger** (`colors.success`, `colors.danger`): semantic states, never decorative accents.

### Neutral

- **Submerged Green** (`colors.submerged-green`, `#051C1E`): app-shell background behind the arena and atmosphere. Dark navy (`#090C14`, `#060D1A`) is forbidden for this role.
- **Starlight** (`colors.text-starlight`): primary values and high-confidence UI text.
- **Warm Cream** (`colors.text-cream`): headings and premium body emphasis.
- **Muted Steel** (`colors.text-muted`): secondary metadata only; maintain readable contrast on every teal surface.

**The Gold Scarcity Rule.** Gold marks hierarchy, focus, and reward. If every border glows, the hierarchy has failed.

**The Teal Surface Rule.** Modal and panel bodies must retain visible teal depth. A flat or pitch-black body is off-brand even when it has a gold border.

**The Submerged Green Rule.** App shell is `#051C1E`. Panels sit visibly above at `#0B282B`/`#153A3E`. Dark navy (`#090C14`, `#060D1A`) is forbidden for background roles. Semantic info/rank blues (`#0EA5E9`, `#4F46E5`) are intentional — do not replace them.

**The Token Boundary Rule.** Reusable interface colors and every numeric border radius live in `src/index.css`, including an RGB companion when alpha variants are needed. A raw color may remain local only when it is a one-off illustration or TFT-domain detail such as an emblem material, unit rarity, or coach artwork. The moment the same color base is used twice, promote it to a semantic token. `npm run audit:gameplay-tokens` enforces this boundary across the gameplay surface.

The intentional one-off palettes are cataloged in `.impeccable/design.json` as augment artwork, board feedback, game-info icons, unit rarity materials, sidebar domain materials, and coach character artwork. They are not reusable interface accents.

## 3. Typography

**Display Font:** Spectral (with Georgia and serif fallbacks)  
**Body Font:** Inter (with system UI and sans-serif fallbacks)  
**Label/Mono Font:** Inter for controls; the system monospace stack for timers, values, and technical metadata.

**Character:** Spectral gives rare result and title moments the authority of a game client; Inter disappears into repeated controls and dense TFT information. The pairing is premium without turning the working interface into fantasy prose.

### Hierarchy

- **Display** (600, `typography.display`, 1.2): modal heroes, result titles, and major section identity only.
- **Headline** (600, approximately 1.1–1.3cqw, 1.2): panel and review headings.
- **Title** (600, approximately 0.9–1.1cqw, 1.25): card and subsection titles.
- **Body** (400, `typography.body`, 1.5): explanations and metadata; prose should remain within 65–75ch.
- **Label** (600, `typography.label`, 0.05em): buttons, navigation, badges, and compact status labels. Uppercase is reserved for short game-client labels.
- **Technical** (500, `typography.technical`, 1.3): timers, stage, IQ, rank progress, and numerical HUD values.

**The Ceremonial Ceiling Rule.** Spectral is for titles and earned moments, never routine buttons, form labels, or dense data.

## 4. Elevation

Depth comes from tonal layering, gold framing, and restrained ambient glow. Panels use a teal gradient plus a two-part shadow: a close gold atmosphere and a broader dark separation. Overlay backdrops add gold-at-top and teal-at-bottom radial depth over a dark veil. `backdrop-filter` is permitted for fixed viewport modals, but forbidden on absolute in-game overlays inside the filtered app container.

### Shadow Vocabulary

- **Panel Atmosphere** (`0 0 1.5cqw rgba(200,170,110,.25), 0 0 3cqw rgba(0,0,0,.6)`): large Hextech panels and modal shells.
- **Control Focus** (`0 0 .5cqw rgba(200,155,60,.2)`): keyboard focus and input focus.
- **Gameplay Focus Ring** (`0 0 0 2px #081e20, 0 0 0 4px rgba(200,170,110,.9)`): shared high-contrast focus treatment for gameplay buttons and select-and-place targets.
- **Reward Glow** (`0 0 .8cqw rgba(200,170,110,.3)`): short-lived confirmation and hover feedback.

**The Stable Canvas Rule.** Never create or destroy a gameplay stacking context to fake modal focus. Dim with the overlay; animate opacity only.

## 5. Components

### Buttons

- **Shape:** compact, gently chamfered rectangle (`rounded.control`) with a thin gold frame.
- **Primary:** transparent or teal-dark at rest, cream text, `spacing.sm` × `spacing.lg` padding.
- **Hover / Focus:** gold border plus restrained glow; no vertical jump. `:focus-visible` must be at least as clear as hover.
- **Disabled / Loading:** retain component geometry, lower emphasis, and expose state semantically.

### Chips

- **Style:** compact dark-teal surface, full subtle border, cream or muted-steel text.
- **State:** selected chips use the relevant semantic or rank color; inactive chips never use full-saturation accents.

### Cards / Containers

- **Corner Style:** restrained (`rounded.panel`); TFT artwork may use square crops within the frame.
- **Background:** teal tonal layers or the canonical panel gradient, not independent decorative glass cards.
- **Shadow Strategy:** ambient only on focal or elevated surfaces; dense list rows stay flatter.
- **Border:** full perimeter gold or muted-gold border. Accent side stripes are prohibited.
- **Internal Padding:** use the `spacing.md`–`spacing.lg` range and maintain one clear hierarchy per container.

### Inputs / Fields

- **Style:** dark translucent surface, gold-tinted border, Starlight text, Inter body type.
- **Focus:** visible gold border and control-focus glow; never remove the outline without an equivalent keyboard-visible treatment.
- **Error / Disabled:** use semantic color plus explicit copy; color alone is insufficient.

### Navigation

Navigation uses familiar buttons or list items, short Vietnamese labels, muted inactive text, and gold active state. Viewport HUD controls are rendered outside the filtered app canvas and explicitly hidden when a modal, review state, or admin surface owns the screen. Mobile navigation becomes a bottom sheet with safe-area padding and at least 44px interactive targets.

### Hextech Overlay

Fixed modals use a viewport overlay with layered gold and teal radial atmosphere, a dark veil, and blur. In-game overlays use the same atmosphere without `backdrop-filter`. Modal content uses the bright teal-shell standard and a visible outer gold border.

Gameplay decisions use one shared dialog contract: labelled dialog semantics, initial focus, focus trapping, Escape close, and focus restoration. When scouting is required before a choice, the choice controls and rerolls remain natively disabled with a visible instruction; transparent pointer blockers are forbidden.

### T-Coin and IQ Rank

Every T-Coin balance, cost, reward, and lock state renders the shared `TCoinIcon`; emoji and text-only substitutes are forbidden. IQ rank color always comes from `getUserIqRankColor`, with the canonical mapping represented by the `rank-*` tokens.

## 6. Do's and Don'ts

### Do:

- **Do** preserve the current puzzle → validation → share hierarchy before adding decoration.
- **Do** use full atmospheric overlay backgrounds and bright teal modal bodies.
- **Do** use Spectral sparingly and Inter for the working product interface.
- **Do** render T-Coin through `TCoinIcon` and rank identity through the shared rank-color helper.
- **Do** maintain semantic controls, visible keyboard focus, reduced-motion alternatives, safe areas, and mobile touch floors.
- **Do** preserve keyboard select-and-place beside pointer drag for board and bench movement.
- **Do** explain scout-before-choice with visible copy and native disabled states.
- **Do** map new components to existing tokens and shared motifs before adding a one-off color or shadow.
- **Do** run `npm run audit:gameplay-tokens` after gameplay styling changes; repeated raw colors and numeric border radii are regressions.

### Don't:

- **Don't** build a generic SaaS dashboard with teal borders and unrelated card stacks.
- **Don't** introduce neon blue/purple cyberpunk or noisy fantasy ornament.
- **Don't** use pitch-black modals or flat black backdrops with no Hextech atmosphere.
- **Don't** present a cosmetic economy, T-Coin grind, or third-party IQ vanity as the product's core value.
- **Don't** use colored side-stripe borders, gradient text, nested cards, or decorative glassmorphism as defaults.
- **Don't** animate layout properties, bounce/elastic easing, or `backdrop-filter`; motion must convey state and respect reduced motion.
- **Don't** blur the gameplay content wrapper or use `backdrop-filter` on an absolute in-game overlay.
- **Don't** place a transparent hit-testing layer above decision controls; if an action is unavailable, show why.

## 7. Trait Detail Panels (True Damage Specification)

True Damage Trait Panel (A-Side & B-Side) represents a specialized in-game detail panel matching exact Riot video frame measurements:

### Panel Dimensions & Geometry
- **Fixed Dimensions:** `width: 602px; height: 885px; overflow: hidden; display: flex; flex-direction: column;`
- **Output Resolutions:** 1x (`602 × 885px`) and 2x (`1204 × 1770px`).

### Color Tokens (Exact Measured Hex)
- **Panel Background (Vertical Gradient):** `linear-gradient(180deg, #0D1414 0%, #0B1111 45%, #090D0D 100%)`
- **Panel Flat Fallback:** `#0B1111`
- **Panel Border:** `2px solid #8A713F`
- **Header Background:** `#0C1A1B`
- **Header Bottom Border:** `1px solid rgba(201, 169, 97, 0.28)`
- **Title ("True Damage"):** `#EFE7D3`
- **Body Text:** `#E9E2D0`
- **Lead Text ("A-Side: Win" / "B-Side: Lose"):** `#FFFFFF`, bold (`font-weight: 700`)
- **Inactive / Unactivated Tier ("5)"):** `#7E7E76`
- **Flip Button Background (Vertical Gradient):** `linear-gradient(180deg, #6F5029 0%, #4C3718 55%, #3A2A12 100%)`
- **Flip Button Border:** `2px solid #C9A961`
- **Flip Button Text:** `#F2E8CE`
- **Flip Button Inset Shadow:** `inset 0 1px 0 rgba(255, 232, 175, 0.35), inset 0 -1px 0 rgba(0, 0, 0, 0.45)`
- **SVG Icon Fallback Fill:** `#F2EDE0`

### Layout & Spacing Metrics
- **Header:** `height: 102px; display: flex; align-items: center; padding: 0 28px; gap: 16px;`
- **Icon Slot:** `.icon-slot { flex: 0 0 auto; width: 46px; height: 46px; display: flex; align-items: center; justify-content: center; }`
- **Title:** `font-size: 47px; font-weight: 700; line-height: 1; letter-spacing: 0.5px;`
- **Body:** `padding: 34px 28px 0 28px; display: flex; flex-direction: column;`
- **Paragraphs:** `font-size: 29px; line-height: 1.42; margin-top: 28px (between paragraphs);`
- **Button Wrap:** `padding: 0 28px 30px 28px;`
- **Button:** `height: 80px; display: flex; align-items: center; justify-content: center; font-size: 35px; font-weight: 700; letter-spacing: 0.3px;`

### Typography & Word Break Rules
- **Font Stack:**
  - Header/Title: `"Noto Serif Display", "DejaVu Serif", serif` (chuẩn fallback đã kiểm chứng, khớp ngắt dòng và visual frame gốc).
  - **Banned Font:** `SVN-Beauford` bị CẤM vĩnh viễn (sai font / misrendered).
  - Body: `"Liberation Sans", "DejaVu Sans", sans-serif`
- **B-Side Tier 5 Line-Break Compensation:** Due to the fallback body font width, `.dim.bside` MUST have `padding-right: 60px` so that Tier 5 breaks cleanly into 2 lines (`heal 2` / `player Health and gain 2 XP.`), matching the original frame.

### Icon Asset Rules
- The trait icon MUST sit inside `.icon-slot` (46×46px flex slot); absolute positioning or hardcoded icon sizes are forbidden.
- Source priority: (1) Official CDN icon (`https://ap.tft.tools/static/trait-icons/tft10_truedamage_w.svg` or local `/tft-assets/traits/tft10_truedamage_w.svg`) via `<img>`; (2) Manual SVG fallback with comment tag. AI generation or upscaled video frames are strictly banned.
- Clean cursor rule: the Flip button MUST NOT display any mouse cursor artifacts.

## 8. Preserved Pages (Explicit Non-Modification)

- **Coming Soon Page (`src/components/ComingSoonPage/`):** Retains its existing design, tokens, and theme without changes. Do NOT migrate or modify this page during theme or token updates.

## 9. Theme Authority & Game HUD Architecture (After Hours BANNED)

### tft-hoho is an In-Game HUD/Simulator, NOT a Website
`tft-hoho` simulates the live League of Legends / Teamfight Tactics game client. It is **not** a SaaS website, blog, or marketing portal. Therefore:
- **STRICTLY BANNED: After Hours Theme (`#000000` Void / `#E7DED1` Bone)**.
  The `@tftiseasy/ui-library` website tokens, `--tui-theme: after-hours`, and pitch-black `#000000` HUD surfaces are completely banned from `tft-hoho`.
- **STRICTLY BANNED: Ad-Hoc Standalone HTML Previews**.
  Trait panels and HUD elements must be integrated as native React components inside the in-game HUD (`SynergyPanel.tsx`, `TrueDamagePanel.tsx`). Detached standalone preview pages (e.g. `public/true-damage-panel.html`) are prohibited.

### Canonical Riot Panel & Hextech In-Game Palette (Measured Verbatim)
All panels, HUD rails, chips, and overlays must adhere to the exact measured Riot palette:
- **Flat Backdrop / Panel Surface:** `#0B1111` (RGB: `11 17 17`)
- **Panel Gradient (Vertical):** `linear-gradient(180deg, #0D1414 0%, #0B1111 45%, #090D0D 100%)`
- **Surface Top (Gradient start):** `#0D1414` (RGB: `13 20 20`)
- **Surface Deep (Gradient end):** `#090D0D` (RGB: `9 13 13`)
- **Header / Elevated Surface:** `#0C1A1B` (RGB: `12 26 27`)
- **HUD Frame / Border Gold:** `#8A713F` (RGB: `138 113 63`, 2px solid)
- **Active Accent Gold:** `#C9A961` (RGB: `201 169 97`, 2px solid)
- **Sub-border / Divider:** `1px solid rgba(201, 169, 97, 0.28)`
- **Title / Heading Text:** `#EFE7D3` (Noto Serif Display / Spectral)
- **Body / Label Text:** `#E9E2D0` (Liberation Sans / Inter)
- **Highlight / Active State:** `#FFFFFF` (bold, font-weight 700)
- **Dim / Inactive State:** `#7E7E76`
- **Accent Action Button:** `linear-gradient(180deg, #6F5029 0%, #4C3718 55%, #3A2A12 100%)`, border `2px solid #C9A961`, text `#F2E8CE`, inset shadow `inset 0 1px 0 rgba(255, 232, 175, 0.35), inset 0 -1px 0 rgba(0, 0, 0, 0.45)`.


