---
name: refactor-app
description: Comprehensive guide for refactoring the application to ensure scalability, maintainability, and strict adherence to project architectural standards (AGENTS.md). Use when the user asks to "refactor", "cleanup", "reorganize", or "improve" code structure, or when you identify a file is too large/complex.
---

# Refactor App Skill

This skill guides you through the process of refactoring code within the TFT Hextech HUD project. It enforces the 3-Layer Architecture and specific design system rules defined in `AGENTS.md`.

> [!CAUTION]
> **REFACTOR = RESTRUCTURE, NOT REDESIGN**
> - **DO NOT** change the UI appearance, colors, or existing styles
> - **DO NOT** change business logic
> - Only split files, rename variables, and reorganize code structure

---

## 1. Immutable Principles (NON-NEGOTIABLE)

### 🔒 UI Preservation

| DO NOT | DO |
|:---|:---|
| ❌ Change colors | ✅ Keep Hextech color codes (`#153a3e`, `#c8aa6e`, etc.) |
| ❌ Add/remove animations | ✅ Keep static state |
| ❌ Change font family | ✅ Keep `Spectral` for headings, `Inter` for body |
| ❌ Change layout/spacing | ✅ Keep existing `cqw` values |
| ❌ Create new styles | ✅ Copy styles from similar components if needed |

### 🔒 Logic Preservation

| DO NOT | DO |
|:---|:---|
| ❌ Change algorithms | ✅ Only extract functions, don't modify internal logic |
| ❌ Add/remove features | ✅ Keep existing functionality |
| ❌ Change data flow | ✅ Keep props/state structure |
| ❌ "Fix things along the way" | ✅ Only do what's in scope |

---

## 2. Design System Reference (from AGENTS.md)

When refactoring, you **MUST preserve** these values:

### 🎨 Color Palette (Hextech Theme)

```css
/* Panel Background */
background: linear-gradient(180deg, #153a3e 0%, #051c1e 100%);

/* Border */
border: 0.1cqw solid #c8aa6e;

/* Shadow/Glow */
box-shadow: 0 0 1.5cqw rgba(200, 170, 110, 0.25);

/* Text */
color: #F0F6FC;           /* White - primary text */
color: #c8aa6e;           /* Gold - headings */
color: #94A3B8;           /* Blue Grey - body text */
color: #F0E6D2;           /* Light Cream - button text */
```

### 📏 Unit System

- ✅ **REQUIRED**: `cqw` for all dimensions
- ❌ **FORBIDDEN**: `px`, `rem`, `em`, `vh`, `vw`

---

## 3. Refactoring Workflow

### Phase 1: Analyze

1. **Read the file**: Understand current logic and dependencies
2. **Document styles**: Screenshot or note visual appearance BEFORE refactoring
3. **Identify Code Smells**:
   - Long file (>300 lines)?
   - Mixed concerns (logic + UI)?
   - Hardcoded values?
   - `any` types?

### Phase 2: Plan

1. **Propose new structure**: Decide where new files will live
   ```
   MyComponent.tsx (800 lines)
   ↓
   MyComponent/
   ├── index.tsx (orchestrator, <100 lines)
   ├── MyComponent.css (keep styles unchanged!)
   ├── hooks/
   │   └── useMyLogic.ts (state & effects)
   └── components/
       ├── SubComponentA.tsx
       └── SubComponentB.tsx
   ```

2. **Pre-execution checklist**:
   - [ ] Documented visual appearance?
   - [ ] Understood current logic?
   - [ ] Plan does NOT change UI/logic?

### Phase 3: Execute

1. **Extract Logic First**: Move state and effects to custom hook
2. **Extract UI**: Move render chunks to sub-components
3. **Copy Styles**: Move CSS as-is, DO NOT modify
4. **Strict Types**: Replace `any` with proper interfaces

> [!WARNING]
> During this phase, if you find bugs or styles that need fixing:
> - **DO NOT** fix them during the refactor process
> - **DOCUMENT** them and report after refactoring is complete

### Phase 4: Verify

1. **Compile**: Ensure no TS errors
2. **Visual Check**: Compare UI before/after refactor
3. **Functional Check**: Test main features
4. **Final checklist**:
   - [ ] UI looks IDENTICAL to before refactor?
   - [ ] Logic works IDENTICAL to before refactor?
   - [ ] No new code styles were added?

---

## 4. Common Refactoring Patterns

### Pattern A: Splitting a "God Component"

**Before:** `src/pages/Admin.tsx` (800 lines)

**After:**
```
src/pages/Admin/
├── index.tsx         (< 100 lines, orchestrator)
├── Admin.css         (IDENTICAL to old CSS file)
├── hooks/
│   └── useAdminData.ts
└── components/
    ├── DataTable.tsx
    ├── EditorPanel.tsx
    └── Sidebar.tsx
```

### Pattern B: Extract Logic Only (No UI Changes)

**Before:**
```tsx
// Component.tsx
const [data, setData] = useState([]);
useEffect(() => { fetchData(); }, []);
const handleClick = () => { /* logic */ };
return <div>...</div>;
```

**After:**
```tsx
// useComponentLogic.ts
export function useComponentLogic() {
  const [data, setData] = useState([]);
  useEffect(() => { fetchData(); }, []);
  const handleClick = () => { /* IDENTICAL logic */ };
  return { data, handleClick };
}

// Component.tsx
const { data, handleClick } = useComponentLogic();
return <div>...</div>;  // IDENTICAL UI
```

### Pattern C: Move CSS (No Value Changes)

**Before:** Inline style
```tsx
<div style={{ width: '25cqw', border: '0.1cqw solid #c8aa6e' }}>
```

**After:** External CSS (IDENTICAL values)
```css
.my-component {
  width: 25cqw;
  border: 0.1cqw solid #c8aa6e;
}
```

---

## 5. Final Checklist

Before completing a refactor, verify:

- [ ] **Visual**: UI before/after refactor is IDENTICAL
- [ ] **Colors**: No new colors outside Hextech palette
- [ ] **Units**: All dimensions use `cqw`
- [ ] **Logic**: All functions work the same as before
- [ ] **No Extras**: No new animations/hover effects added
- [ ] **Clean**: Delete temp files, don't create unnecessary markdown reports
