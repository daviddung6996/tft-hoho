# T-Coin Context

## Purpose

Document the T-Coin wallet, earn animations, lock overlays, and runtime reward rules.

## Read This When

- You are changing T-Coin balance UI, earn flows, or puzzle locking.
- You need the canonical icon, reason, and unlock rules.

## Key Entry Points

- `src/features/tcoin/tcoin.service.ts`
- `src/features/tcoin/tcoin.types.ts`
- `src/features/tcoin/components/TCoinIcon.tsx`
- `src/features/tcoin/components/TCoinBalance.tsx`
- `src/features/tcoin/components/PuzzleLockOverlay.tsx`
- `src/hooks/useGameFlow.ts`

## Inbound / Outbound Dependencies

- Inbound: gameplay result flow, user wallet state, settings/profile UI, and tier selection UI.
- Outbound: Supabase wallet tables and transaction records.

## Relevant Skills

- `frontend-design`
- `problem-solving-pro`
- `supabase-postgres-best-practices`

## Rules and Invariants

- Always render T-Coin with `TCoinIcon`; do not use emoji, plain text, or placeholder glyphs.
- Treat T-Coin as an engagement layer, not the repo's business core.
- Runtime earn behavior is defined by actual `earnCoins(...)` call sites, not just by the constant table.
- Keep lock overlays and balance displays visually consistent with the existing sizing rules.

## Known Gotchas

- The earn-rate table can imply more reward triggers than the runtime currently calls.
- UI regressions often reappear when a component falls back to text like `T-Coin` instead of the icon component.

## How to Verify

- `rg -n "TCoinIcon|earnCoins|TCOIN_EARN_RATES" src`
- Run the app and confirm balance, lock overlay, and earn animation all use the icon component.

## Related Contexts

- `../../components/Settings/CONTEXT.md`
- `../../services/CONTEXT.md`
- `../../../supabase/CONTEXT.md`
