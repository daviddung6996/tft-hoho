# Feature Modules Context

## Purpose

Describe the newer domain-oriented modules under `src/features/`. This folder is important, but it does not contain the entire frontend.

## Read This When

- You are touching a feature folder under `src/features/`.
- You need to know which feature owns which business domain.
- You are deciding whether logic already has a home here instead of under `src/components` or `src/services`.

## Key Entry Points

- `src/features/augment-trainer/`
- `src/features/coach-select/`
- `src/features/pro-supporter/`
- `src/features/puzzle/`
- `src/features/share/`
- `src/features/tcoin/`
- `src/features/tft-iq/`
- `src/features/user-iq/`
- `src/features/video-library/`
- `src/features/visian-coach/`

## Inbound / Outbound Dependencies

- Inbound: `src/App.tsx`, gameplay hooks, and legacy component trees.
- Outbound: Supabase services, shared UI, and specialized feature contexts.

## Relevant Skills

- `frontend-design`
- `problem-solving-pro`
- `repo-memory`

## Rules and Invariants

- Treat this subtree as the newer domain layer, not as the exclusive home of all frontend logic.
- Prefer feature-local docs before changing feature behavior.
- Keep cross-feature data boundaries explicit when a feature depends on legacy component or service folders.

## Known Gotchas

- Repo readers often assume the app is already fully feature-sliced. It is not.
- Some runtime rules still live in `src/components` or `src/services`, even when a feature owns the user-facing domain.

## How to Verify

- `rg --files src/features`
- Open the specific feature `CONTEXT.md` before editing a feature subtree.

## Related Contexts

- `../components/CONTEXT.md`
- `augment-trainer/CONTEXT.md`
- `coach-select/CONTEXT.md`
- `tcoin/CONTEXT.md`
- `user-iq/CONTEXT.md`
- `video-library/CONTEXT.md`
