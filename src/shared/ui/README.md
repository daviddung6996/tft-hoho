# Frontend Shared UI

This directory contains strictly presentational (dumb) components.
No business logic or API calls are allowed here.

## Allowed:
- Button.tsx
- Input.tsx
- Card.tsx
- Layout shells (Header, Sidebar)

## Disallowed:
- LoginForm.tsx (belongs in `src/features/auth/`)
- UserProfile.tsx (belongs in `src/features/user/`)
