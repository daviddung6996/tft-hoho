# Hextech Component Patterns

> All components follow the **5 Pillars** from SKILL.md. Reference LoginModal as the canonical implementation.

## 1. Atmosphere Overlay (Fullscreen backdrop)

Used for: Login, Loading, Fullscreen modals.

```css
.hex-atmosphere-overlay {
    position: absolute;
    top: 0; left: 0;
    width: 100cqw; height: 100cqh;
    background:
        radial-gradient(ellipse at 50% 30%, rgba(200, 170, 110, 0.08) 0%, transparent 60%),
        radial-gradient(ellipse at 50% 80%, rgba(21, 58, 62, 0.4) 0%, transparent 50%),
        linear-gradient(180deg, rgba(5, 28, 30, 0.92) 0%, rgba(0, 0, 0, 0.96) 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    container-type: inline-size;
}

/* Optional: Ambient gold particles */
.hex-atmosphere-overlay::before {
    content: '';
    position: absolute;
    top: -50%; left: -50%;
    width: 200%; height: 200%;
    background:
        radial-gradient(1.5px 1.5px at 20% 30%, rgba(200, 170, 110, 0.25) 0%, transparent 100%),
        radial-gradient(1px 1px at 70% 15%, rgba(200, 170, 110, 0.2) 0%, transparent 100%),
        radial-gradient(1.5px 1.5px at 45% 70%, rgba(200, 170, 110, 0.15) 0%, transparent 100%);
    animation: drift 20s linear infinite;
    pointer-events: none;
}
@keyframes drift {
    from { transform: translate(0, 0); }
    to { transform: translate(5%, 3%); }
}
```

## 2. Section Panel (Connected sections)

Used for: Building multi-part layouts (Hero + CTA + Footer).

```css
/* Top section - has top+side borders, no bottom */
.hex-section-top {
    width: 100%;
    padding: 3cqw;
    text-align: center;
    border: 0.06cqw solid rgba(200, 170, 110, 0.15);
    border-bottom: none;
    background:
        radial-gradient(ellipse at 50% 0%, rgba(200, 170, 110, 0.06) 0%, transparent 70%),
        linear-gradient(180deg, rgba(21, 58, 62, 0.5) 0%, rgba(5, 28, 30, 0.8) 100%);
}

/* Middle section - side borders only */
.hex-section-mid {
    width: 100%;
    padding: 2cqw 3cqw;
    background: linear-gradient(180deg, rgba(5, 28, 30, 0.8) 0%, rgba(5, 28, 30, 0.95) 100%);
    border-left: 0.06cqw solid rgba(200, 170, 110, 0.15);
    border-right: 0.06cqw solid rgba(200, 170, 110, 0.15);
}

/* Bottom section - has side+bottom borders, no top */
.hex-section-bottom {
    width: 100%;
    padding: 0 3cqw 2.5cqw;
    background: rgba(5, 28, 30, 0.95);
    border: 0.06cqw solid rgba(200, 170, 110, 0.15);
    border-top: none;
}
```

## 3. Corner Accent Frame

Used for: Decorating hero sections.

```tsx
{/* Place inside a position:relative parent */}
<div className="corner-accent corner-tl" />
<div className="corner-accent corner-tr" />
<div className="corner-accent corner-bl" />
<div className="corner-accent corner-br" />
```

```css
.corner-accent {
    position: absolute;
    width: 1.8cqw; height: 1.8cqw;
    border-color: #c8aa6e;
    border-style: solid;
    border-width: 0;
    opacity: 0.5;
}
.corner-tl { top: -0.06cqw; left: -0.06cqw; border-top-width: 0.12cqw; border-left-width: 0.12cqw; }
.corner-tr { top: -0.06cqw; right: -0.06cqw; border-top-width: 0.12cqw; border-right-width: 0.12cqw; }
.corner-bl { bottom: 0; left: -0.06cqw; border-bottom-width: 0.12cqw; border-left-width: 0.12cqw; }
.corner-br { bottom: 0; right: -0.06cqw; border-bottom-width: 0.12cqw; border-right-width: 0.12cqw; }
```

## 4. Primary CTA Button (Gold Chamfer)

Used for: Main action buttons (Play, Confirm, Submit).

```css
.hex-cta {
    position: relative;
    width: 100%;
    padding: 1.2cqw 2cqw;
    background: linear-gradient(180deg, #C89B3C 0%, #A07828 100%);
    border: 0.1cqw solid #c8aa6e;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.2cqw;
    overflow: hidden;
    clip-path: polygon(
        1cqw 0, calc(100% - 1cqw) 0,
        100% 1cqw, 100% calc(100% - 1cqw),
        calc(100% - 1cqw) 100%, 1cqw 100%,
        0 calc(100% - 1cqw), 0 1cqw
    );
}
.hex-cta:hover:not(:disabled) {
    background: linear-gradient(180deg, #d4a844 0%, #b08830 100%);
    filter: drop-shadow(0 0 1cqw rgba(200, 170, 110, 0.4));
}

/* CTA text */
.hex-cta-text {
    font-family: 'Spectral', serif;
    font-size: 1.4cqw;
    font-weight: 700;
    color: #051c1e;
    text-transform: uppercase;
    letter-spacing: 0.15cqw;
}
.hex-cta-sub {
    font-family: 'Inter', sans-serif;
    font-size: 0.65cqw;
    color: rgba(5, 28, 30, 0.7);
}

/* Glow sweep child */
.hex-cta .glow-sweep {
    position: absolute;
    top: 0; left: -100%;
    width: 60%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
    animation: sweep 3s ease-in-out infinite;
    pointer-events: none;
}
@keyframes sweep { 0%,100% { left: -60%; } 50% { left: 100%; } }
```

## 5. Secondary Button (Ghost)

Used for: Google login, Email toggle, secondary actions.

```css
.hex-btn-ghost {
    flex: 1;
    padding: 0.7cqw;
    border: 0.06cqw solid rgba(200, 170, 110, 0.2);
    background: rgba(200, 170, 110, 0.04);
    color: rgba(240, 230, 210, 0.8);
    font-size: 0.75cqw;
    font-weight: 500;
    font-family: 'Inter', sans-serif;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5cqw;
    transition: border-color 0.2s ease, background 0.2s ease;
}
.hex-btn-ghost:hover:not(:disabled) {
    border-color: rgba(200, 170, 110, 0.5);
    background: rgba(200, 170, 110, 0.08);
}
```

## 6. Divider

Used for: Separating sections with centered text.

```css
.hex-divider {
    text-align: center;
    margin: 1.2cqw 0;
    position: relative;
    height: 1.2cqw;
    display: flex;
    align-items: center;
    justify-content: center;
}
.hex-divider::before,
.hex-divider::after {
    content: '';
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    height: 0.04cqw;
    background: linear-gradient(90deg, transparent, rgba(200, 170, 110, 0.2), transparent);
}
.hex-divider::before { left: 0; width: 25%; }
.hex-divider::after { right: 0; width: 25%; }
.hex-divider span {
    color: rgba(200, 170, 110, 0.45);
    font-size: 0.65cqw;
    font-family: 'Inter', sans-serif;
    padding: 0 1cqw;
    position: relative;
    z-index: 1;
    white-space: nowrap;
}
```

## 7. Badge

Used for: Labels like "SET 16", "MỚI", "PRO".

```css
.hex-badge {
    display: inline-block;
    padding: 0.25cqw 1cqw;
    background: rgba(200, 170, 110, 0.1);
    border: 0.06cqw solid rgba(200, 170, 110, 0.3);
    color: #c8aa6e;
    font-family: 'Inter', sans-serif;
    font-size: 0.65cqw;
    font-weight: 600;
    letter-spacing: 0.15cqw;
    text-transform: uppercase;
}
```

## 8. Form Input

Used for: Email, password, text inputs.

```css
.hex-input {
    width: 100%;
    padding: 0.7cqw 1cqw;
    background: rgba(0, 0, 0, 0.35);
    border: 0.06cqw solid rgba(200, 170, 110, 0.25);
    color: #F0E6D2;
    font-family: 'Inter', sans-serif;
    font-size: 0.8cqw;
    box-sizing: border-box;
    transition: border-color 0.2s ease;
}
.hex-input:focus {
    outline: none;
    border-color: rgba(200, 170, 110, 0.6);
}
.hex-input::placeholder {
    color: rgba(148, 163, 184, 0.5);
}
```

## 9. Close Button

```css
.hex-close {
    width: 2cqw; height: 2cqw;
    background: rgba(0, 0, 0, 0.3);
    border: 0.06cqw solid rgba(200, 170, 110, 0.3);
    color: rgba(200, 170, 110, 0.6);
    font-size: 1cqw;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: border-color 0.2s ease, color 0.2s ease;
}
.hex-close:hover {
    border-color: #c8aa6e;
    color: #c8aa6e;
}
```

## 10. Standard Panel (Legacy - for modals without section composition)

```css
.hex-panel {
    background: linear-gradient(180deg, #153a3e 0%, #051c1e 100%);
    border: 0.1cqw solid #c8aa6e;
    box-shadow: 0 0 1.5cqw rgba(200, 170, 110, 0.25);
    backdrop-filter: blur(8px);
    color: #F0F6FC;
}
```
