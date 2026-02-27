---
name: hextech-core
description: The Unified System for TFT Hextech. Contains the Hextech Premium Design Philosophy, Brand Identity, and UI Builder patterns. This is the SINGLE SOURCE OF TRUTH for all UI decisions.
---

# Hextech Core System

**Brand:** TFT Set 16 Hextech
**Role:** Single Source of Truth for Design & Implementation.

## 1. Design Philosophy: Hextech Premium

> This app is NOT a website. It is a **Game Client**. Every screen must feel like you're inside the League of Legends client.

### The 5 Pillars

#### 1. Atmosphere First
- Backgrounds are NEVER flat colors. Always **layered radial gradients** creating depth.
- Gold ambient glow at top, teal depth at bottom, dark base layer.
- Ambient gold particle dots for key screens (Login, Review, Achievement).
- **Breathing room**: Minimum `3cqw` padding. Let atmosphere fill space, not content.

```css
/* Standard Atmosphere Background */
.atmosphere {
    background:
        radial-gradient(ellipse at 50% 30%, rgba(200, 170, 110, 0.08) 0%, transparent 60%),
        radial-gradient(ellipse at 50% 80%, rgba(21, 58, 62, 0.4) 0%, transparent 50%),
        linear-gradient(180deg, rgba(5, 28, 30, 0.92) 0%, rgba(0, 0, 0, 0.96) 100%);
}
```

#### 2. Section-Based Composition
- UI is NOT "floating cards". UI is **connected sections** sharing borders.
- Each section has a role: Hero → CTA → Options → Detail.
- Left/right borders run continuously between sections, creating **one unified block**.
- Use **Corner Accent Frames** (L-shaped corners) instead of full clip-path on panels.

```css
/* Section with shared borders */
.section-hero {
    border: 0.06cqw solid rgba(200, 170, 110, 0.15);
    border-bottom: none; /* Connects to next section */
    background: radial-gradient(ellipse at 50% 0%, rgba(200, 170, 110, 0.06), transparent 70%),
                linear-gradient(180deg, rgba(21, 58, 62, 0.5), rgba(5, 28, 30, 0.8));
}
.section-middle {
    border-left: 0.06cqw solid rgba(200, 170, 110, 0.15);
    border-right: 0.06cqw solid rgba(200, 170, 110, 0.15);
    /* No top/bottom border - connected */
}
.section-footer {
    border: 0.06cqw solid rgba(200, 170, 110, 0.15);
    border-top: none; /* Connects to previous section */
}
```

#### 3. Progressive Disclosure
- Show little, act clear. Never show everything at once.
- Complex forms hide behind a single click. Default view shows only primary CTA.
- Animation only for content transitions (`opacity + translateY`, 0.3s), NEVER for hover.

#### 4. Hero-CTA Pattern
- Every fullscreen view: **Hero** (value/context) → **CTA** (primary action) → **Secondary** (options).
- Primary CTA: Large gold button with **hextech chamfer** (octagonal clip-path) and **glow sweep**.
- Secondary CTAs: Thin border, transparent background, inline row.

```css
/* Primary CTA - Gold Chamfer with Glow Sweep */
.cta-primary {
    background: linear-gradient(180deg, #C89B3C 0%, #A07828 100%);
    border: 0.1cqw solid #c8aa6e;
    clip-path: polygon(
        1cqw 0, calc(100% - 1cqw) 0,
        100% 1cqw, 100% calc(100% - 1cqw),
        calc(100% - 1cqw) 100%, 1cqw 100%,
        0 calc(100% - 1cqw), 0 1cqw
    );
    overflow: hidden;
}
/* Animated sweep child element */
.cta-primary .sweep {
    position: absolute; top: 0; left: -100%;
    width: 60%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
    animation: sweep 3s ease-in-out infinite;
}
@keyframes sweep { 0%,100% { left: -60%; } 50% { left: 100%; } }
```

#### 5. Guided Attention
- Only **ONE** element animates at any time (glow sweep on primary CTA).
- Everything else is STATIC. Only `border-color` and `box-shadow` change on hover.
- Visual hierarchy: Badge → Title → Tagline → Features → CTA → Divider → Options.

---

## 2. Brand Identity & Resources

| Resource | Purpose | Path |
| :--- | :--- | :--- |
| **Design Tokens** | Colors, fonts, spacing (JSON) | [`resources/design-tokens.json`](resources/design-tokens.json) |
| **Tech Stack** | Coding rules, units, libs | [`resources/tech-stack.md`](resources/tech-stack.md) |
| **Voice & Tone** | Copywriting rules (Vietnamese) | [`resources/voice-tone.md`](resources/voice-tone.md) |
| **Components** | Code templates | [`resources/hextech-components.md`](resources/hextech-components.md) |

---

## 3. Construction Rules

### A. Core Physics
1. **Fixed Ratio**: 16:9 container.
2. **Unit System**: `cqw` ONLY. `100cqw` = Full Width. No `px`/`rem`/`vw`/`vh`.
3. **Static Layout**: No reflow. Absolute or rigid grid.
4. **No Hover Animations**: Only `border-color` + `box-shadow` glow on hover.

### B. Visual Style
- **Theme**: Hextech Green. NO BLUE (#00A3FF).
- **Backgrounds**: Layered atmosphere gradients (Pillar 1).
- **Borders**: Gold `#c8aa6e`, subtle `rgba(200, 170, 110, 0.15)`.
- **Corners**: Corner Accent Frames (L-shaped) for panels. Chamfer clip-path for CTA buttons.
- **Icons**: NO Unicode symbols, NO emoji, NO AI-generated icons. Only **inline SVG** or **official Riot/TFT asset images**.
- **Typography**: Spectral (headings, gold), Inter (body, grey/white).

### C. Color System

| Role | Value |
| :--- | :--- |
| Atmosphere BG | Layered radial gradients |
| Modal Shell BG | `linear-gradient(180deg, #0d2e30, #081e20)` |
| Hero/Top Section BG | `linear-gradient(180deg, rgba(21,58,62,0.95), rgba(13,46,48,0.98))` |
| Metric Section BG | `rgba(16, 52, 56, 0.95)` |
| Chart/Content Section BG | `rgba(11, 40, 43, 0.97)` |
| Activity/Bottom Section BG | `rgba(13, 46, 48, 0.97)` |
| CTA Button | `linear-gradient(180deg, #C89B3C, #A07828)` |
| Border Gold (outer/prominent) | `rgba(200, 170, 110, 0.45)` |
| Border Gold (section dividers) | `rgba(200, 170, 110, 0.30)` |
| Border Gold (subtle/inner) | `rgba(200, 170, 110, 0.15)` |
| Text — Stat Values (numbers) | `#FFFFFF` |
| Text — Title / Cream | `#F0E6D2` |
| Text — Heading Gold | `#c8aa6e` |
| Text — Labels | `rgba(200, 170, 110, 0.75)` |
| Text — Body | `#94A3B8` |
| Text — Muted/Disabled | `rgba(200, 170, 110, 0.45)` |
| CTA Text | `#051c1e` |

> 🔴 **WRONG**: `rgba(5, 28, 30, 0.8)` for section backgrounds = pitch black = **FAIL** 
> ✅ **CORRECT**: Use `rgba(11–16, 40–52, 43–56, 0.95–0.97)` = teal dark = Game Client look.

### C2. IQ Rank Color System

Used as `--rank-color` CSS variable in Hero sections. **Do NOT change these.**

| Rank | Color | Notes |
| :--- | :--- | :--- |
| Challenger | `#00D1C1` | Cyan teal |
| Grandmaster | `#FF6B35` | Orange |
| Master | `#8B5CF6` | Purple — only rank exception to Purple Ban |
| Diamond | `#4F46E5` | Indigo |
| Platinum | `#0EA5E9` | Sky blue |
| Gold | `#EAB308` | Yellow gold |
| Silver | `#94A3B8` | Steel |
| Bronze | `#B45309` | Amber |
| Iron | `#4B5563` | Gray |
| Unranked | `#4B5563` | Same as Iron, with `opacity: 0.45` |

Source of truth: `src/features/user-iq/userIqCalculator.ts → getUserIqRankColor()`

### D. Typography System

| Role | Font | Weight | Style |
| :--- | :--- | :--- | :--- |
| Hero Title | Spectral | 700 | UPPERCASE, 3cqw |
| Section Title | Spectral | 700 | UPPERCASE, 1.5-2cqw |
| Subtitle | Inter | 500 | uppercase, 0.7cqw, muted gold |
| Tagline | Inter | 400 | 1.1cqw, light cream |
| Badge | Inter | 600 | UPPERCASE, 0.65cqw, letter-spacing 0.15cqw |
| CTA Text | Spectral | 700 | UPPERCASE, 1.4cqw |
| Body | Inter | 400-500 | 0.8cqw |
| Small/Hint | Inter | 400 | 0.65cqw, muted |

---

## 4. Modal Brightness Standard

> UI must feel like a **Game Client**, NOT a dark website. The reference screen is the **Review Decision** screen which uses vivid teal panels.

**Rule:** Every modal/overlay background MUST use `#0d2e30` or brighter as the base — NEVER let it fall to near-black.

```
Modal Shell   → #0d2e30 base
Hero Section  → rgba(21,58,62, 0.95) — lightest (top)
Stats/Metrics → rgba(16,52,56, 0.95)
Charts        → rgba(11,40,43, 0.97)
Activity      → rgba(13,46,48, 0.97) — darkest (bottom)
```

**Outer border** on ALL modals/panels: `0.06cqw solid rgba(200, 170, 110, 0.45)` — always visible.

---

The Login screen is the **canonical example** of all 5 pillars applied together.
See: `src/components/Auth/LoginModal.tsx` + `LoginModal.css`

**Structure:**
```
.login-overlay          → Atmosphere background + ambient particles
  .login-landing        → Centered column container (36cqw)
    .login-hero         → Section 1: Badge + Title + Tagline + Features
    .login-cta-section  → Section 2: Gold CTA button with chamfer + sweep
    .login-options      → Section 3: Divider + Google/Email buttons
      .login-form       → Progressive disclosure: hidden email form
```

---

## 5. Workflow for AI

1. **Read `AGENTS.md`** for non-negotiable rules.
2. **Read this SKILL.md** for design philosophy and patterns.
3. **Check `design-tokens.json`** for exact color codes.
4. **Check `hextech-components.md`** for reusable code blocks.
5. **Implement** using `cqw`, CSS classes, atmosphere gradients.
6. **Review**: Does it look like the League Client? If yes, good. If it looks like a web app, **FAIL**.
