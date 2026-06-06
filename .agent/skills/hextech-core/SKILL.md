---
name: hextech-core
description: Global Hextech × SpaceGod visual system for premium dark fantasy / arcane / TFT-inspired interfaces. Use this whenever the user wants Hextech styling, League/TFT-inspired UI, dark teal + gold aesthetics, ornate sci-fantasy panels, sacred geometry, cosmic ornamentation, or wants an existing interface reskinned into this design language. Treat this as the default style skill across projects unless the repo has explicit override instructions.
---

# Hextech Core System

**Brand Core:** Hextech colors, SpaceGod structure.
**Role:** Global visual system for premium arcane interfaces across projects.

## 1. Core Principle

This system is **not** generic fantasy and not generic SaaS dark mode.
It combines:

- **Hextech identity** → dark teal, antique gold, warm cream, arcane precision
- **SpaceGod composition** → void depth, sacred geometry, ceremonial framing, ornamental hierarchy

Use this system as the **default global styling language** unless the current repo explicitly overrides it.

## 2. Design Philosophy

### 2.1 Mood
Every screen should feel like an **arcane archive / elite game client / ceremonial control panel**.

The user should feel:
- depth, not flatness
- ritual framing, not casual card stacks
- premium restraint, not noisy effects
- cosmic ornament, not random decoration

### 2.2 Identity Contract
- Keep the **Hextech palette** as the brand anchor.
- Borrow **SpaceGod layout, typography rhythm, decorative framing, and motion language**.
- Prefer **one strong atmosphere layer** and **one clear focal point**.
- Decoration must support hierarchy, never compete with content.

### 2.3 What “good” looks like
A successful screen feels:
- premium
- arcane
- structured
- immersive
- readable

If it feels like a normal dashboard with teal borders, it failed.

---

## 3. Global Rules

### 3.1 Apply globally first
When using this skill:
1. establish shared tokens first
2. establish app-shell/background treatment second
3. establish reusable motifs third
4. style individual screens last

Do **not** treat Hextech as a one-off page skin.
Create a global foundation that other screens/components can inherit.

### 3.2 Default scope
Unless the repo says otherwise, apply the system at these layers:
- app shell / body background
- typography tokens
- primary surfaces and borders
- navigation
- buttons and form controls
- card and panel motifs
- shared decorative primitives

### 3.3 Override model
If project instructions conflict with this skill:
- preserve this skill’s **mood and hierarchy** when possible
- obey the repo’s concrete constraints
- adapt patterns rather than forcing exact markup

---

## 4. Color System

Use the Hextech palette with SpaceGod naming.

```css
:root {
  --sg-bg: #051c1e;
  --sg-bg-mid: #081e20;
  --sg-bg-card: rgba(13, 46, 48, 0.97);
  --sg-bg-surface: rgba(21, 58, 62, 0.60);
  --sg-bg-overlay: rgba(0, 0, 0, 0.25);

  --sg-gold: #c8aa6e;
  --sg-gold-hover: #d4b876;
  --sg-gold-dim: #a8883a;
  --sg-gold-glow: rgba(200, 170, 110, 0.30);
  --sg-gold-ink: #051c1e;

  --sg-gold-08: rgba(200, 170, 110, 0.08);
  --sg-gold-10: rgba(200, 170, 110, 0.10);
  --sg-gold-15: rgba(200, 170, 110, 0.15);
  --sg-gold-20: rgba(200, 170, 110, 0.20);
  --sg-gold-30: rgba(200, 170, 110, 0.30);
  --sg-gold-45: rgba(200, 170, 110, 0.45);

  --sg-text: #F0E6D2;
  --sg-text-muted: #9a94a8;
  --sg-text-dim: rgba(240, 230, 210, 0.45);
  --sg-text-body: rgba(240, 230, 210, 0.82);

  --sg-border: rgba(200, 170, 110, 0.15);
  --sg-border-hover: rgba(200, 170, 110, 0.35);
  --sg-border-silver: rgba(138, 143, 168, 0.18);

  --sg-tier-s: #c8aa6e;
  --sg-tier-a: #8a8fa8;
  --sg-tier-b: #7a7f96;
  --sg-tier-c: #6a6f84;
  --sg-tier-d: #5a5f72;

  --sg-ok: #4fc878;
  --sg-err: #EF4444;
  --sg-warn: #F59E0B;
  --sg-blue: #5ba4cf;
}
```

### Color guidance
- Backgrounds must stay **teal-dark**, never dead black.
- Gold is for hierarchy, emphasis, borders, and ceremonial framing.
- Cream is for primary text.
- Muted violet-silver is acceptable for secondary hierarchy.
- Do not introduce neon blue/purple as the main identity.

---

## 5. Typography System

Use:
- **Cinzel** for display / ceremonial headings
- **IBM Plex Mono** for body / labels / metadata
- optional project title serif for compact localized headings if Cinzel hurts readability

```css
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=IBM+Plex+Mono:wght@300;400;500&display=swap');
```

### Roles
- **Page title** → Cinzel, uppercase, wide tracking
- **Section title** → Cinzel, restrained gold
- **Body / data / forms** → IBM Plex Mono
- **Labels / badges / nav** → IBM Plex Mono, uppercase, spaced letters

### Typography intent
Display type should feel ceremonial.
Body type should feel technical and precise.

---

## 6. Layout Structure

### 6.1 App shell
Default shell order:
1. starfield / atmospheric background
2. sacred geometry / decorative overlay
3. foreground shell content

All real content must sit above decoration with deliberate layering.

### 6.2 Navigation
Navigation should feel like a ceremonial rail, not pill-tabs.

Preferred traits:
- thin separators
- uppercase labels
- muted inactive state
- gold active state
- ornamental flankers such as `∞`, diamonds, or subtle dividers

### 6.3 Title block
Each major screen should open with a **TitleBlock** pattern:
- framed container
- gold border
- corner marks
- subtitle/context line
- optional connector line downward into content

### 6.4 Surface hierarchy
Prefer these layers:
- shell atmosphere
- elevated section panel
- dense card surface
- badges / accents / highlights

Do not build the interface as unrelated floating cards.
Sections should feel connected or at least rhythmically aligned.

---

## 7. Shared Component Motifs

Use these as reusable primitives across projects.

### 7.1 Decorative primitives
- star canvas
- sacred geometry SVG
- corner marks
- diamond separators
- gradient connector lines

### 7.2 Surfaces
- title block
- section panel
- tier row / list row with accent rail
- comp card / unit card / feature card
- data table surface

### 7.3 Controls
- gold-outline primary button
- ghost secondary button
- mono labels
- teal-dark input surfaces with gold focus

### 7.4 Motion
Use restrained motion only:
- page enter
- fade-in-up stagger for repeated rows
- subtle hover lift on cards/buttons
- ambient pulse on decorative elements

No noisy perpetual motion beyond controlled ambient layers.

---

## 8. Construction Rules for AI

1. Start from shared tokens, not isolated component CSS.
2. Establish the background and typography before styling detail components.
3. Prefer reusable visual motifs over bespoke one-off ornaments.
4. Keep contrast readable; ornament must not reduce usability.
5. Treat sacred geometry and stars as **supporting atmosphere**, not content.
6. When reskinning an existing app, preserve structure that already works and swap the visual language systematically.
7. If a repo already has design tokens, map this system into them instead of duplicating a second token system unless separation is clearly useful.

---

## 9. Global Application Checklist

When applying this skill to a codebase, usually update in this order:

1. global tokens / variables
2. app shell / body / background
3. typography imports and roles
4. navigation styling
5. shared panels and cards
6. buttons and controls
7. page-specific refinements
8. decorative components only after the foundation works

If only one screen is changed while the rest of the app stays visually unrelated, the rollout is incomplete.

---

## 10. Resources

| Resource | Purpose | Path |
|---|---|---|
| Design Tokens | Shared colors and system primitives | `resources/design-tokens.json` |
| Tech Stack | Implementation constraints | `resources/tech-stack.md` |
| Voice & Tone | Copy guidance | `resources/voice-tone.md` |
| Components | Reusable UI patterns | `resources/hextech-components.md` |

---

## 11. Workflow

1. Read the project instructions.
2. Read this skill for global style direction.
3. Read the component resource for reusable patterns.
4. Map the system into the project’s existing tokens/components.
5. Apply the style globally first, then refine individual screens.
6. Review the result: does it feel ceremonial, arcane, premium, and cohesive across the app?

If it only looks “teal and gold,” keep going.
