# Architecture & Structure Reference

Derived from `AGENTS.md`.

## Project Structure

This project follows a feature-centric organization.

```
src/
├── components/       # Shared UI components (Buttons, Modals, Inputs)
├── pages/            # Page-level components (router targets)
├── hooks/            # Shared hooks
├── services/         # API/Supabase services
├── types/            # Shared TypeScript interfaces
├── utils/            # Helper functions
└── ...
```

## Component Guidelines

### 1. Folder vs Single File
*   **Simple Component**: `components/Button.tsx`
*   **Complex Component**:
    ```
    components/ComplexFeature/
    ├── index.tsx       # Public API
    ├── styles.module.css
    ├── SubComponent.tsx
    └── useFeatureLogic.ts
    ```

### 2. State Management
*   **Local State**: `useState` for UI interaction (modals, tabs).
*   **Complex Local State**: `useReducer` or extracted `useHook`.
*   **Server State**: Use service layer functions.

## Naming Conventions
*   **Files**: PascalCase for components (`MyComponent.tsx`), camelCase for hooks/utils (`useHook.ts`).
*   **Standard Props**:
    *   `className`: For extending styles.
    *   `style`: For inline overrides (avoid if possible).
    *   `children`: For compound components.

## "Fixed Position" Philosophy
*   The app is a strict 16:9 container.
*   Elements do NOT reflow. They scale.
*   Use `absolute` positioning + `cqw` often to place elements exactly where they mimic the game HUD.
