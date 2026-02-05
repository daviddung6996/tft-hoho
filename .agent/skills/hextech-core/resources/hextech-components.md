# Hextech Component Implementations

## 1. Text

**Typography Rules:**
- Use `Spectral` for headings (`<h1>`, `<h2>`, titles).
- Use `Inter` for body text, labels, and inputs.

**Component:**
```tsx
import React from 'react';

// Title
const HextechTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h1 style={{
    fontFamily: "'Spectral', serif",
    color: "var(--text-primary)",
    textShadow: "0 2px 4px rgba(0,0,0,0.8)",
    fontWeight: 700,
    fontSize: "1.8rem" // Convert to cqw for responsiveness if needed
  }}>
    {children}
  </h1>
);

// Body Text
const HextechBody: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p style={{
    fontFamily: "'Inter', sans-serif",
    color: "var(--text-secondary)",
    fontSize: "0.9rem"
  }}>
    {children}
  </p>
);
```

## 2. Tile / Card

Use glassmorphism and the specific border colors.

**CSS Class:**
```css
.hex-card {
  background: var(--surface-panel);
  backdrop-filter: blur(8px);
  border: 0.1cqw solid #c8aa6e;
  box-shadow: var(--primary-glow);
  border-radius: 4px; /* Or use clip-path for cut corners */
  padding: 1.5rem;
}
```

## 3. Button

**Primary Action (Gold Gradient):**
```css
.btn-hextech-c {
  padding: 0.8rem 1.5rem;
  background: linear-gradient(135deg, #C89B3C 0%, #F0E6D2 100%);
  border: 1px solid #F0E6D2;
  border-radius: 4px;
  color: #090C14;
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s ease;
}
.btn-hextech-primary:hover {
  opacity: 0.9;
}
```

**Close Button (Standard):**
```css
.close-btn {
    width: 2cqw;
    height: 2cqw;
    background: rgba(0, 0, 0, 0.3);
    border: 0.08cqw solid #c8aa6e;
    border-radius: 0.25cqw;
    color: #c8aa6e;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
}
```

## 4. Modal

**Structure:**
Outer wrapper with standard backdrop, centered.
Modal container with `clip-path` and double-mask logic for the border flow.

**HTML Structure:**
```tsx
<div className="hex-modal-overlay">
  <div className="hex-modal">
    <div className="hex-modal-content">
      <button className="close-btn">X</button>
      <div className="hex-modal-title-bar">
        <span className="title">Title</span>
      </div>
      {/* Content */}
    </div>
  </div>
</div>
```

**CSS (Double Mask for Border):**
```css
.hex-modal {
  position: relative;
  /* Shape definition */
  --modal-clip: polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px);
  clip-path: var(--modal-clip);
  background-color: #c8aa6e; /* Border color */
  padding: 2px; /* Border width */
}

.hex-modal-content {
  background: linear-gradient(180deg, #153a3e 0%, #051c1e 100%); /* Inner bg */
  clip-path: var(--modal-clip); /* Matches outer shape */
  height: 100%;
  width: 100%;
}
```
**Note**: Ideally use pseudo-elements `::after` for the background to avoid double nesting if possible, but padding approach works too for simpler setups. See `LoginModal.css` for the advanced pseudo-element approach.
