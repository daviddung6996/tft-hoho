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
| Panel BG | `linear-gradient(180deg, #153a3e, #051c1e)` |
| Section BG | `rgba(5, 28, 30, 0.8)` to `0.95` |
| CTA Button | `linear-gradient(180deg, #C89B3C, #A07828)` |
| Border Gold | `#c8aa6e` |
| Border Subtle | `rgba(200, 170, 110, 0.15)` |
| Text Title | `#F0E6D2` |
| Text Heading | `#c8aa6e` |
| Text Body | `#94A3B8` |
| Text Muted | `rgba(200, 170, 110, 0.45)` |
| CTA Text | `#051c1e` |
| Accent | `#F0E6D2` |

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

## 4. Reference Implementation: LoginModal

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
