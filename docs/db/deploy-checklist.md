# DB Deploy Checklist

## Apply Order

Run migrations in this order:

1. `20260307_001_backfill_missing_feature_tables.sql`
2. `20260307_002_cleanup_orphans_and_normalize.sql`
3. `20260307_003_harden_constraints_and_rls.sql`

Do not apply phase 3 before phase 2. The cleanup phase removes rows that would violate the stricter guards.

## Before Deploy

1. Pull latest code and review new files in `supabase/migrations/`, `scripts/db/`, and `docs/db/`.
2. Run:

```powershell
npx tsx scripts/db/audit.ts
```

3. Confirm you understand any current warnings.
4. Apply the new migrations to a staging or non-critical project first.
5. Run:

```powershell
npx tsx scripts/db/health-check.ts
```

The health check must exit cleanly before production rollout.

## After Deploy

1. Re-run `npx tsx scripts/db/audit.ts`.
2. Confirm orphan counts are zero for:
   `user_unlocked_puzzles`, `user_puzzle_history`, `puzzle_votes`, `user_iq_history`, `user_video_unlocks`.
3. Confirm the schema drift items are gone:
   `pro_supporters.updated_at`, `puzzles.video_thumbnail_url`, missing feature-table migrations.
4. Test these user flows:
   content admin save/delete/restore as `mod`
   meme fetch for normal gameplay
   Pro IQ admin screens
   video library unlock path
   puzzle completion and IQ history write path

## Ongoing Rule

Any new Supabase table, column, trigger, policy, or function must ship in the same PR as:

- a migration file
- a health-check update if the new object is critical
- an app type update in `src/lib/supabase.ts` if the frontend touches it
