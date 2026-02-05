---
name: hextech-core
description: The Unified System for TFT Hextech. This skill combines Brand Identity (Design Tokens, Voice, Tech Stack) and the Hextech UI Builder (Component Patterns, Layout Rules). Use this as the primary reference for ALL UI, Styling, and Content generation.
---

# Hextech Core System

**Brand:** TFT Set 16 Hextech
**Role:** Single Source of Truth for Design & Implementation.

## 1. Brand Identity & Resources

Before starting any task, consult the detailed resource files:

| Resource | Purpose | Path |
| :--- | :--- | :--- |
| **🎨 Design Tokens** | Exact colors, fonts, spacing values (JSON) | 👉 [`resources/design-tokens.json`](resources/design-tokens.json) |
| **🛠️ Tech Stack** | Coding rules, mandatory units (`cqw`), libs | 👉 [`resources/tech-stack.md`](resources/tech-stack.md) |
| **🗣️ Voice & Tone** | Copywriting personality and constraints | 👉 [`resources/voice-tone.md`](resources/voice-tone.md) |
| **🧩 Components** | Code templates for Modals, Buttons, Panels | 👉 [`resources/hextech-components.md`](resources/hextech-components.md) |

---

## 2. Hextech UI Construction Rules

When building UI, you **MUST** follow these core implementation principles.

### A. Core Physics
1.  **Fixed Ratio**: The app lives in a 16:9 container.
2.  **Unit System**: **EVERYTHING** must use `cqw` (Container Query Width). `100cqw` = Full Width.
    *   ❌ No `px`, `rem`, `vw`, `vh` for layout.
    *   ✅ padding: `1cqw`, font-size: `0.8cqw`, border: `0.1cqw`.
3.  **Static Layout**: Elements do not reflow. Position is absolute or rigid grid. No "responsive reflow" found in standard web apps.
4.  **No Hover Animations**: Buttons and panels must remain static (no scale/translate on hover). Only `border-color` or `box-shadow` (glow) changes are allowed.

### B. Visual Style (Hextech Green Theme)
*   **Theme**: **Hextech Green** only. ❌ **NO BLUE** (#00A3FF) allowed.
*   **Backgrounds**: Dark Teal/Green Gradients (`linear-gradient(180deg, #153a3e 0%, #051c1e 100%)`).
*   **Borders**: Gold (`#c8aa6e`) - usually `0.1cqw`.
*   **Corners**:
    *   **Panels**: Cut corners (45-degree chamfer) using `clip-path` or pseudo-elements (preferred).
    *   **Buttons**: Sharp or slightly chamfered.
*   **Typography**:
    *   Headings: `Spectral` (Serif, Gold).
    *   Body: `Inter` (Sans-serif, Blue-Grey/White).

### C. Common Patterns

#### Modal / Panel
```tsx
<div className="absolute top-[10cqw] left-[20cqw] w-[60cqw] h-[40cqw] bg-gradient-to-b from-[#153a3e] to-[#051c1e] border-[0.1cqw] border-[#c8aa6e] shadow-[0_0_1.5cqw_rgba(200,170,110,0.25)] flex flex-col p-[2cqw]">
  <h2 className="font-spectral text-[#c8aa6e] text-[2cqw] uppercase">Title</h2>
  <div className="text-white font-inter text-[1cqw]">Content...</div>
</div>
```

#### Primary Button
```tsx
<button className="px-[2cqw] py-[1cqw] border-[0.1cqw] border-[#c8aa6e] text-[#F0E6D2] font-spectral hover:border-[#d4b876] hover:shadow-[0_0_0.8cqw_rgba(200,170,110,0.3)] transition-colors">
  CONFIRM
</button>
```

#### Admin Operations
For Admin tools that float *over* the game or exist outside the 16:9 scaling context, you may use `rem` for font sizes/padding, but continue to use Hextech colors and Gold borders.

## 3. Workflow for AI

1.  **Check `design-tokens.json`** for valid color codes.
2.  **Check `hextech-components.md`** for reusable code blocks.
3.  **Implement** using `cqw` and Tailwind classes.
4.  **Review**: Does it look like the League of Legends Client? If yes, good. If it looks like a Bootstrap website, **FAIL**.
