---
estimated_steps: 4
estimated_files: 3
---

# T03: Add the external NotebookLM deep-dive handoff in Coach Select

**Slice:** S01 — Coach speed and NotebookLM deep-dive handoff
**Milestone:** M001

## Description

Add the external deep-dive CTA to Coach Select so any user can jump out to NotebookLM for a longer investigation. The CTA should feel like a value escalation, not like the app is giving up.

## Steps

1. Define a maintainable handoff-link resolver for Coach Select instead of hardcoding URLs inline in the render tree.
2. Add the exact CTA copy in Coach Select: “Hỏi sâu hơn với NotebookLM đã tổng hợp hàng trăm tài liệu + góc nhìn Pro.”
3. Open the external destination in a new tab without blocking or replacing the in-app ask flow.
4. Add UI tests that prove the CTA renders and uses the expected target resolution.

## Must-Haves

- [ ] The exact deep-dive CTA appears in Coach Select for all users.
- [ ] The CTA target is resolved from helper/config code, not buried inside ad hoc JSX branches.
- [ ] Using the CTA does not break the in-app coach flow or require a login/paywall detour.

## Verification

- `npm run test -- src/features/coach-select/components/CoachSelectOverlay.test.tsx`
- In the browser, open Coach Select and confirm the CTA is visible and opens the external NotebookLM target in a new tab.

## Inputs

- `src/features/coach-select/components/CoachSelectOverlay.tsx` — current Coach Select layout and CTA area.
- `src/features/coach-select/coachSelect.data.ts` — existing coach-local configuration surface.
- D004 in `.gsd/DECISIONS.md` — external NotebookLM handoff is part of the product strategy, not a side experiment.

## Expected Output

- `src/features/coach-select/components/CoachSelectOverlay.tsx` — Coach Select deep-dive CTA placement and behavior.
- `src/features/coach-select/coachSelect.data.ts` or adjacent helper — public NotebookLM handoff target resolution.
- `src/features/coach-select/components/CoachSelectOverlay.test.tsx` — coverage for CTA rendering and target behavior.
