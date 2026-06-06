# Hextech × SpaceGod Component Patterns

> These are reusable motifs for the global Hextech system. Keep Hextech colors, but use SpaceGod framing, typography rhythm, and ornamental structure.

## 1. App Atmosphere Shell

Used for: app roots, fullscreen shells, major page wrappers.

```css
.hex-app-shell {
  position: relative;
  min-height: 100vh;
  background:
    radial-gradient(circle at top, rgba(200, 170, 110, 0.08), transparent 42%),
    radial-gradient(circle at bottom, rgba(91, 164, 207, 0.06), transparent 30%),
    linear-gradient(180deg, #051c1e 0%, #081e20 55%, #051c1e 100%);
  color: var(--sg-text);
  overflow: hidden;
}

.hex-app-shell__content {
  position: relative;
  z-index: 10;
}
```

## 2. Sacred Geometry Overlay

Used for: global decoration layer behind content.

```tsx
<div className="hex-sacred-geometry" aria-hidden="true" />
```

```css
.hex-sacred-geometry {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.08;
  background:
    radial-gradient(circle at center, rgba(200, 170, 110, 0.08) 0, transparent 45%),
    linear-gradient(rgba(200, 170, 110, 0.06), rgba(200, 170, 110, 0.06));
  mask-image: radial-gradient(circle at center, black, transparent 75%);
}
```

## 3. Title Block

Used for: page headers, section intros, major tab headings.

```tsx
<section className="hex-title-block">
  <p className="hex-title-block__eyebrow">∞ ARCANE INDEX ∞</p>
  <h1 className="hex-title-block__title">Tier List</h1>
  <p className="hex-title-block__subtitle">meta snapshot // live coaching context</p>
</section>
```

```css
.hex-title-block {
  position: relative;
  padding: 1.25rem 2rem;
  border: 1px solid var(--sg-gold);
  background: rgba(5, 28, 30, 0.6);
  backdrop-filter: blur(4px);
  text-align: center;
}

.hex-title-block::before,
.hex-title-block::after {
  content: '';
  position: absolute;
  width: 8px;
  height: 8px;
  border: 1px solid var(--sg-gold);
}

.hex-title-block::before {
  top: -1px;
  left: -1px;
  border-right: 0;
  border-bottom: 0;
}

.hex-title-block::after {
  right: -1px;
  bottom: -1px;
  border-left: 0;
  border-top: 0;
}

.hex-title-block__eyebrow {
  margin: 0 0 0.4rem;
  font: 500 10px/1 var(--sg-font-mono, 'IBM Plex Mono', monospace);
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--sg-gold);
}

.hex-title-block__title {
  margin: 0;
  font-family: var(--sg-font-display, 'Cinzel', serif);
  font-size: clamp(1.4rem, 2vw, 2rem);
  font-weight: 500;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--sg-text);
}

.hex-title-block__subtitle {
  margin: 0.45rem 0 0;
  font: 400 12px/1.5 var(--sg-font-mono, 'IBM Plex Mono', monospace);
  color: var(--sg-text-muted);
}
```

## 4. Ceremonial Navigation

Used for: tab bars, section nav, compact mode switchers.

```css
.hex-nav {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  color: var(--sg-text-muted);
  font: 500 10px/1 var(--sg-font-display, 'Cinzel', serif);
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.hex-nav__item {
  position: relative;
  padding-bottom: 0.35rem;
}

.hex-nav__item.is-active {
  color: var(--sg-gold);
}

.hex-nav__item.is-active::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 2px;
  background: var(--sg-gold);
}

.hex-nav__sep {
  color: var(--sg-gold-30);
}
```

## 5. Section Panel

Used for: form sections, metrics surfaces, article sections, detail panes.

```css
.hex-panel {
  position: relative;
  padding: 1.25rem;
  border: 1px solid var(--sg-border);
  background: var(--sg-bg-card);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.02);
}

.hex-panel__title {
  margin: 0 0 0.85rem;
  padding-bottom: 0.65rem;
  border-bottom: 1px solid var(--sg-gold-15);
  font: 500 13px/1.3 var(--sg-font-display, 'Cinzel', serif);
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--sg-gold);
}
```

## 6. Tier / List Row Container

Used for: ranking rows, grouped lists, feature clusters.

```css
.hex-tier-row {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid var(--sg-border-silver);
  background: rgba(8, 30, 32, 0.5);
}

.hex-tier-row::before {
  content: '';
  width: 3px;
  background: var(--tier-accent, var(--sg-gold));
  grid-column: 1;
  grid-row: 1 / span 2;
}
```

## 7. Card Pattern

Used for: comp cards, unit cards, feature tiles, image-backed cards.

```css
.hex-card {
  position: relative;
  border: 1px solid var(--sg-border);
  background: linear-gradient(180deg, rgba(13, 46, 48, 0.92), rgba(8, 30, 32, 0.95));
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.25s ease;
}

.hex-card:hover {
  transform: translateY(-3px);
  border-color: var(--sg-gold);
}

.hex-card__label {
  font: 500 9px/1.2 var(--sg-font-mono, 'IBM Plex Mono', monospace);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--sg-text);
}
```

## 8. Buttons

Used for: primary / ghost / badge-like actions.

```css
.hex-btn-primary {
  padding: 0.8rem 1.1rem;
  border: 1px solid var(--sg-gold);
  background: var(--sg-bg-surface);
  color: var(--sg-gold);
  font: 500 11px/1 var(--sg-font-mono, 'IBM Plex Mono', monospace);
  letter-spacing: 0.15em;
  text-transform: uppercase;
  transition: background 0.2s ease, color 0.2s ease, transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.hex-btn-primary:hover {
  background: var(--sg-gold);
  color: var(--sg-gold-ink);
  transform: translateY(-2px);
}

.hex-btn-ghost {
  padding: 0.8rem 1.1rem;
  border: 1px solid var(--sg-border);
  background: transparent;
  color: var(--sg-text-muted);
  font: 500 11px/1 var(--sg-font-mono, 'IBM Plex Mono', monospace);
  letter-spacing: 0.15em;
  text-transform: uppercase;
}

.hex-btn-ghost:hover {
  border-color: var(--sg-gold);
  color: var(--sg-gold);
}
```

## 9. Inputs and Labels

Used for: forms, filters, compact data entry.

```css
.hex-label {
  display: block;
  margin-bottom: 0.4rem;
  font: 500 10px/1.2 var(--sg-font-mono, 'IBM Plex Mono', monospace);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--sg-text-muted);
}

.hex-input {
  width: 100%;
  padding: 0.8rem 0.9rem;
  border: 1px solid var(--sg-border);
  background: var(--sg-bg-surface);
  color: var(--sg-text);
  font: 400 13px/1.4 var(--sg-font-mono, 'IBM Plex Mono', monospace);
}

.hex-input:focus {
  outline: none;
  border-color: var(--sg-gold);
}
```

## 10. Decorative Separators

Used for: section breaks, ceremonial accents, between major blocks.

```css
.hex-diamond-separator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  color: var(--sg-gold);
}

.hex-diamond-separator::before,
.hex-diamond-separator::after {
  content: '';
  width: 48px;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--sg-gold-45), transparent);
}
```

## 11. Motion Tokens

Used for: repeated rows, page enter, subtle ambient detail.

```css
@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes pulse-gold {
  0%, 100% { opacity: 0.07; }
  50% { opacity: 0.12; }
}

@keyframes page-enter {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
```

## 12. Usage Notes

- Start with shell + typography + panels before micro-decoration.
- Use decorative layers sparingly; readability wins.
- Prefer one coherent ornamental language across the app over many custom flourishes.
- If a project already has good structure, reskin it by mapping these motifs into existing components rather than rewriting everything.
