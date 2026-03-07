# Data Quality Report

Audit date: 2026-03-07
Generated from the live project configured in `.env`.

## Row Counts

- `users`: 2
- `champions`: 104
- `traits`: 53
- `items`: 113
- `augments`: 279
- `puzzles`: 10
- `user_puzzle_history`: 156
- `user_puzzle_attempts`: 2
- `puzzle_votes`: 312
- `user_wallets`: 2
- `tcoin_transactions`: 361
- `user_unlocked_puzzles`: 4
- `pro_supporters`: 1
- `donations`: 0
- `user_iq_history`: present
- `pro_players`: 32
- `pro_iq_history`: 34
- `memes`: 3
- `user_video_unlocks`: 0

## Findings

Hard failures found in live data:

- `user_unlocked_puzzles` contains 4 rows pointing to puzzle IDs no longer present in `puzzles`
- `user_puzzle_history` contains 154 rows pointing to puzzle IDs no longer present in `puzzles`
- `puzzle_votes` contains 309 rows pointing to puzzle IDs no longer present in `puzzles`
- `user_iq_history` contains 797 rows pointing to puzzle IDs no longer present in `puzzles`

Checks that passed on 2026-03-07:

- no invalid role values in `users`
- no invalid `puzzles.tier` values
- no invalid `user_unlocked_puzzles.tier` values
- no negative wallet balances
- no ledger sign/type mismatches in `tcoin_transactions`
- no invalid `pro_supporters.plan/status` rows
- no broken JSON shape detected in the audited puzzle payload columns

## Interpretation

The database is not broadly corrupt. The dominant problem is referential drift caused by puzzle IDs being replaced or removed without cleaning dependent tables.

That has three concrete effects:

- history tables keep stale rows forever
- unlock state can reference dead content
- analytics and retention numbers become harder to trust

## Remediation Added In This Change

- archive-and-delete cleanup migration for orphan rows
- trigger-based puzzle reference enforcement for text/uuid mixed tables
- health-check script that will fail CI/manual deploy if new orphan drift appears
