# User IQ Context

## Purpose

Document user IQ calculation, rank mapping, and the UI elements that display IQ score and rank identity.

## Read This When

- You are changing IQ calculation or rank display.
- You need the canonical rank color system.

## Key Entry Points

- `src/features/user-iq/userIqCalculator.ts`
- `src/features/user-iq/userIq.service.ts`
- `src/features/user-iq/userIq.types.ts`
- `src/features/user-iq/components/UserIqBadge.tsx`
- `src/features/user-iq/components/IqScoreSummary.tsx`

## Inbound / Outbound Dependencies

- Inbound: user history, profile modal, and app-level stats displays.
- Outbound: Supabase history tables and profile UI styling.

## Relevant Skills

- `frontend-design`
- `problem-solving-pro`

## Rules and Invariants

- The rank color table is canonical and should not be casually changed.
- Rank-driven CSS variables should be derived from the calculator helper rather than duplicated locally.
- Profile and badge UIs should consume the same rank mapping.

## Known Gotchas

- Re-defining rank colors in component-local CSS creates drift from the canonical user IQ mapping.
- Settings and profile UI depend on this feature for rank identity even though the modal itself lives elsewhere.

## How to Verify

- `rg -n "rank-color|getUserIqRankColor|UserIqBadge" src/features/user-iq src/components/Settings`
- Open the profile modal and confirm the rank styling still matches the calculator mapping.

## Related Contexts

- `../../components/Settings/CONTEXT.md`
- `../../../supabase/CONTEXT.md`
