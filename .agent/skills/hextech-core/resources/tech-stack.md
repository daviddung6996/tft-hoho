# Preferred Tech Stack & Implementation Rules

When generating code or UI components for this brand, you **MUST** strictly adhere to the following technology choices.

## Core Stack
* **Framework:** React (TypeScript preferred)
* **Styling Engine:** Tailwind CSS (Mandatory. Do NOT use plain CSS or styled-components unless explicitly asked.)
* **Component Library:** shadcn/ui (Use primitives as base, but style strictly according to Hextech rules defined in AGENTS.md)
* **Icons:** Lucide React or gathered Assets

## Implementation Guidelines

### 1. Mandatory Unit System (CQW)
* **Rule:** You **MUST** use `cqw` (Container Query Width) for all layout dimensions, padding, margins, and font sizes.
* **Prohibition:** Do NOT use `px`, `rem`, `em`, `vh`, or `vw` for main layout elements.
* **Tailwind Usage:** Use arbitrary values like `w-[5cqw]`, `p-[1cqw]`, `text-[1.2cqw]`.

### 2. Tailwind Usage
* Use utility classes directly in JSX.
* Utilize the color tokens defined in `design-tokens.json` (e.g., use `bg-[#153a3e]` or configured theme colors).
* **Dark Mode:** Support dark mode using Tailwind's `dark:` variant modifier if applicable, though the app is primarily dark-themed by default.

### 3. Component Patterns
* **Buttons:** Primary actions must use the Hextech styling (Gold borders, gradients). See `AGENTS.md` for exact CSS classes/styles.
* **Forms:** Labels must be `Inter` font. Inputs must have `#c8aa6e` borders.
* **Layout:** Use Flexbox and CSS Grid. Elements must use fixed positioning or rigid grid structures to avoid reflow.

### 4. Forbidden Patterns
* Do NOT use jQuery.
* Do NOT use Bootstrap classes.
* Do NOT create new CSS files; keep styles located within component files via Tailwind or a single global `index.css` for base variables.
