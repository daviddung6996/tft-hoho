# Refactoring Checklist

Use this checklist to verify every refactoring task.

## 1. Structure & Size
- [ ] **File Length**: Is the file under 300 lines?
- [ ] **Logic Separation**: Is business logic extracted to custom hooks?
- [ ] **Component Separation**: Are sub-parts (like headers, rows, specialized cards) extracted to their own files?
- [ ] **Imports**: Are imports clean and grouped? (Libraries first, then internal).

## 2. Type Safety
- [ ] **No `any`**: Are `any` types avoided?
- [ ] **Interfaces**: Are props and state defined with named interfaces?
- [ ] **Return Types**: (Optional) Are complex functions typed?

## 3. Visual & Design System (`AGENTS.md`)
- [ ] **Units**: Are `px` values removed and replaced with `cqw`?
- [ ] **Colors**: Are hex codes replaced with CSS variables (`var(--primary)`, etc.) where possible?
- [ ] **Borders**: Are borders 1px/0.1cqw solid?
- [ ] **Shadows**: Are black shadows replaced with colored glow shadows?

## 4. Maintainability
- [ ] **Comments**: are complex logic blocks commented?
- [ ] **Naming**: Do variable names clearly describe their purpose?
- [ ] **Dead Code**: Is unused code/imports removed?
