# Visian Coach Chat Context

## Purpose

Document the freeform Visian chat surface that lets users ask broader questions beyond the coach-select decision overlay.

## Read This When

- You are changing `visian-coach` components, chat flow, or service wiring.
- You need to understand how the freeform coach panel differs from coach select.

## Key Entry Points

- `src/features/visian-coach/visianCoach.service.ts`
- `src/features/visian-coach/visianCoach.types.ts`
- `src/features/visian-coach/hooks/useVisianChat.ts`
- `src/features/visian-coach/components/VisianChatPanel.tsx`
- `src/features/visian-coach/components/VisianFab.tsx`

## Inbound / Outbound Dependencies

- Inbound: viewport HUD controls and current game context.
- Outbound: `src/lib/visianChat.ts` and the same backend transport family used by coach select.

## Relevant Skills

- `notebooklm`
- `frontend-design`
- `problem-solving-pro`

## Rules and Invariants

- Keep freeform Visian chat distinct from the coach-select decision contract.
- Reuse shared transport helpers where possible so environment overrides stay consistent.
- Preserve the visible gameplay context passed into the coach service when the UI expects contextual answers.

## Known Gotchas

- It is easy to fix one coach surface and leave the other one on stale transport assumptions.
- Environment overrides should go through shared helper code, not per-feature hardcoding.

## How to Verify

- `rg -n "visianChat|useVisianChat|VITE_VISIAN_CHAT_URL" src/features/visian-coach src/lib/visianChat.ts`
- Run the app and send a real freeform Visian question.

## Related Contexts

- `../coach-select/CONTEXT.md`
- `../../../supabase/functions/visian-chat/CONTEXT.md`
- `../../components/Game/CONTEXT.md`
