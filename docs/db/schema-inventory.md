# Live DB Schema Inventory

Audit date: 2026-03-07
Project: `jhhppdjjsxzzyfrvfgpr`
Method: live Supabase service-role audit against the configured project in `.env` plus local migration review.

## Source Of Truth

The schema source of truth must be:

1. `supabase/migrations/`
2. live audit scripts in `scripts/db/`
3. app type mirror in `src/lib/supabase.ts`

Dashboard-only schema changes are no longer acceptable unless they are backfilled into migrations in the same change set.

## Live Tables Seen In Production

Core gameplay tables:

- `users`
- `champions`
- `traits`
- `items`
- `augments`
- `puzzles`
- `user_puzzle_history`
- `user_puzzle_attempts`
- `puzzle_votes`
- `user_iq_history`

Economy / monetization tables:

- `user_wallets`
- `tcoin_transactions`
- `user_unlocked_puzzles`
- `pro_supporters`
- `donations`
- `user_video_unlocks`

Admin / content tables:

- `pro_players`
- `pro_iq_history`
- `memes`

## Confirmed Schema Drift Before This Cleanup

Missing from the pre-existing local migration set while already used by the app:

- `pro_players`
- `pro_iq_history`
- `memes`
- `user_video_unlocks`

Remote columns seen live but not fully represented in the older local schema mirror:

- `puzzles.video_thumbnail_url`
- `users.created_by`
- `pro_supporters.updated_at`

Policy drift already visible from repo review:

- app service layer treats `mod` as admin-equivalent for content operations
- older RLS migrations only grant write access to `admin`

## Required Tables And Columns

The audit scripts treat these as required:

- all fields used directly by gameplay services and admin tools
- all ledger fields required for T-Coin integrity
- all unlock/history fields that reference puzzles
- all Pro IQ / meme / video unlock fields used in current code paths

Run the current inventory at any time with:

```powershell
npx tsx scripts/db/audit.ts
```

Run the fail-fast gate with:

```powershell
npx tsx scripts/db/health-check.ts
```
