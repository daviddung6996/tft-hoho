# S01: Coach speed and NotebookLM deep-dive handoff

**Goal:** Make Coach Select feel fast enough to use in the live app, add the external NotebookLM deep-dive handoff, and leave a diagnosable browser → edge → bridge path for downstream slices.
**Demo:** From the live Coach Select screen, the user can ask coach, see a materially faster-feeling response path, and jump out to “Hỏi sâu hơn với NotebookLM đã tổng hợp hàng trăm tài liệu + góc nhìn Pro.”

## Must-Haves

- Coach Select preserves the existing curated in-app coach experience while materially improving the perceived response path.
- Coach Select exposes the exact external deep-dive CTA promised in the roadmap boundary map.
- The live coach path remains diagnosable across browser → `visian-chat` → NotebookLM bridge via request/timing/failure surfaces.
- The slice proves the browser can use the real transport path; this is not a mock-only slice.

## Proof Level

- This slice proves: integration
- Real runtime required: yes
- Human/UAT required: no

## Verification

- `npm run test -- src/features/coach-select/coachSelect.service.test.ts src/features/coach-select/hooks/useCoachSelect.test.tsx src/features/coach-select/components/CoachSelectOverlay.test.tsx src/features/coach-select/components/CoachSelectOverlay.bugfix.test.tsx scripts/local_visian_chat_logging.test.ts`
- `npm run build`
- Run the local stack, open a real puzzle in the browser, open Coach Select, ask coach through the live transport path, and verify the external NotebookLM handoff is visible and opens correctly.

## Observability / Diagnostics

- Runtime signals: `x-request-id`, client-side elapsed time, `x-bridge-cache`, `x-bridge-total-ms`, local adapter/edge logs, coach unavailable state.
- Inspection surfaces: browser console/network, local visian-chat logs, bridge logs, Coach Select UI state.
- Failure visibility: request ID, transport-level error detail, unavailable-state copy, slow-response timing warnings.
- Redaction constraints: never log bridge secrets, auth keys, or private notebook credentials.

## Integration Closure

- Upstream surfaces consumed: `src/lib/visianChat.ts`, `src/features/coach-select/*`, `supabase/functions/visian-chat/*`, `services/notebooklm_bridge/*`, local adapter/logging helpers.
- New wiring introduced in this slice: faster-feeling Coach Select request path, external NotebookLM handoff resolver/CTA, improved transport diagnostics.
- What remains before the milestone is truly usable end-to-end: startup/popup cleanup, richer puzzle teaching density, and free/pro exhaustion-state polish in S02–S04.

## Tasks

- [x] **T01: Baseline and expose coach transport diagnostics** `est:45m`
  - Why: Coach speed is the highest-risk multi-boundary path in the milestone, so execution needs real latency and failure visibility before changing UX behavior.
  - Files: `src/features/coach-select/coachSelect.service.ts`, `src/lib/visianChat.ts`, `supabase/functions/visian-chat/index.ts`, `scripts/local_visian_chat_logging.ts`
  - Do: Preserve and surface request IDs, bridge timing/cache headers, and slow/failure diagnostics across the current browser → edge → bridge path without leaking secrets; update or add focused transport/logging tests.
  - Verify: `npm run test -- src/features/coach-select/coachSelect.service.test.ts scripts/local_visian_chat_logging.test.ts`
  - Done when: A future agent can inspect a slow or failed coach request and see request correlation plus timing/cache context from the real transport path.

- [x] **T02: Make the Coach Select response path feel faster** `est:1h`
  - Why: The user’s biggest complaint is that the app feels slower than raw NotebookLM, so the live overlay has to feel quicker without breaking the JSON-first coach contract.
  - Files: `src/features/coach-select/hooks/useCoachSelect.ts`, `src/features/coach-select/coachSelect.service.ts`, `src/features/coach-select/components/CoachSelectOverlay.tsx`, `src/features/coach-select/components/CoachResponseCard.tsx`
  - Do: Use the best available faster-feeling path in the existing stack (prefetch-aware, stream-aware, or both), keep stale-request protection and minimize/reopen behavior, and preserve clean unavailable/fallback states.
  - Verify: `npm run test -- src/features/coach-select/coachSelect.service.test.ts src/features/coach-select/hooks/useCoachSelect.test.tsx src/features/coach-select/components/CoachSelectOverlay.test.tsx src/features/coach-select/components/CoachSelectOverlay.bugfix.test.tsx`
  - Done when: Coach Select gives the user visible progress quickly, completes through the live transport path, and still honors the stable coach session states promised in the boundary map.

- [x] **T03: Add the external NotebookLM deep-dive handoff in Coach Select** `est:45m`
  - Why: The user wants a free-for-all deep-dive escalation that doubles as marketing for the product’s knowledge depth.
  - Files: `src/features/coach-select/components/CoachSelectOverlay.tsx`, `src/features/coach-select/coachSelect.data.ts`, `src/features/coach-select/components/CoachSelectOverlay.test.tsx`
  - Do: Add the exact CTA copy in Coach Select, resolve public NotebookLM destinations through config/helper code rather than brittle inline conditionals, and open the deep-dive target in a new tab without disrupting the ask flow.
  - Verify: `npm run test -- src/features/coach-select/components/CoachSelectOverlay.test.tsx`
  - Done when: All users can see and use the external NotebookLM handoff from Coach Select, and the CTA wiring is maintainable enough to extend per-coach later if needed.

- [x] **T04: Prove the live coach flow end-to-end and lock the slice boundary** `est:30m`
  - Why: This slice only counts if the real browser → edge → bridge flow works and downstream slices can depend on it without guesswork.
  - Files: `src/features/coach-select/hooks/useCoachSelect.test.tsx`, `src/features/coach-select/components/CoachSelectOverlay.test.tsx`, `scripts/local_visian_chat_server.ts`, `scripts/local_visian_chat_logging.test.ts`
  - Do: Close remaining test gaps around live-path behavior, verify the local adapter/bridge path with the browser, and ensure failure/slow-path diagnostics are visible enough for later slices.
  - Verify: `npm run test -- src/features/coach-select/coachSelect.service.test.ts src/features/coach-select/hooks/useCoachSelect.test.tsx src/features/coach-select/components/CoachSelectOverlay.test.tsx src/features/coach-select/components/CoachSelectOverlay.bugfix.test.tsx scripts/local_visian_chat_logging.test.ts && npm run build`
  - Done when: The slice has repeatable automated checks plus a live browser verification recipe that proves coach speed improvements and the external handoff on the real transport path.
  - Status: automated verification passed on 2026-03-18; live browser verification also passed on 2026-03-18 with the real local adapter/bridge path, visible slow-path diagnostics, and coach-specific NotebookLM `/preview` handoff targets opening correctly.

## Files Likely Touched

- `src/lib/visianChat.ts`
- `src/features/coach-select/coachSelect.service.ts`
- `src/features/coach-select/hooks/useCoachSelect.ts`
- `src/features/coach-select/components/CoachSelectOverlay.tsx`
- `src/features/coach-select/components/CoachResponseCard.tsx`
- `src/features/coach-select/components/CoachSelectOverlay.test.tsx`
- `src/features/coach-select/components/CoachSelectOverlay.bugfix.test.tsx`
- `src/features/coach-select/hooks/useCoachSelect.test.tsx`
- `supabase/functions/visian-chat/index.ts`
- `scripts/local_visian_chat_logging.ts`
- `scripts/local_visian_chat_server.ts`
