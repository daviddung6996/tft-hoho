-- Phase 2B: Cleanup orphaned rows and normalize legacy values before adding stricter rules
-- Date: 2026-03-07

CREATE TABLE IF NOT EXISTS public.db_orphan_archive (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_table TEXT NOT NULL,
    source_pk TEXT NOT NULL,
    archive_reason TEXT NOT NULL,
    payload JSONB NOT NULL,
    archived_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT db_orphan_archive_unique_source UNIQUE (source_table, source_pk, archive_reason)
);

UPDATE public.users
SET role = lower(btrim(role))
WHERE role IS NOT NULL
  AND role <> lower(btrim(role));

UPDATE public.puzzles
SET tier = lower(btrim(tier))
WHERE tier IS NOT NULL
  AND tier <> lower(btrim(tier));

UPDATE public.user_unlocked_puzzles
SET tier = lower(btrim(tier))
WHERE tier IS NOT NULL
  AND tier <> lower(btrim(tier));

UPDATE public.user_video_unlocks
SET user_result = lower(btrim(user_result))
WHERE user_result IS NOT NULL
  AND user_result <> lower(btrim(user_result));

UPDATE public.puzzles
SET
    meta_data = COALESCE(meta_data, '{}'::jsonb),
    board_state = COALESCE(board_state, '{}'::jsonb),
    augments = COALESCE(augments, '[]'::jsonb),
    pro_first_roll = COALESCE(pro_first_roll, '[]'::jsonb),
    pro_second_roll = COALESCE(pro_second_roll, '[]'::jsonb)
WHERE meta_data IS NULL
   OR board_state IS NULL
   OR augments IS NULL
   OR pro_first_roll IS NULL
   OR pro_second_roll IS NULL;

WITH orphan_rows AS (
    SELECT u.*
    FROM public.user_unlocked_puzzles u
    WHERE NOT EXISTS (
        SELECT 1
        FROM public.puzzles p
        WHERE p.id::text = u.puzzle_id::text
    )
)
INSERT INTO public.db_orphan_archive (source_table, source_pk, archive_reason, payload)
SELECT
    'user_unlocked_puzzles',
    orphan_rows.id::text,
    'missing_puzzle_reference',
    to_jsonb(orphan_rows)
FROM orphan_rows
ON CONFLICT (source_table, source_pk, archive_reason) DO NOTHING;

DELETE FROM public.user_unlocked_puzzles u
WHERE NOT EXISTS (
    SELECT 1
    FROM public.puzzles p
    WHERE p.id::text = u.puzzle_id::text
);

WITH orphan_rows AS (
    SELECT h.*
    FROM public.user_puzzle_history h
    WHERE NOT EXISTS (
        SELECT 1
        FROM public.puzzles p
        WHERE p.id::text = h.puzzle_id::text
    )
)
INSERT INTO public.db_orphan_archive (source_table, source_pk, archive_reason, payload)
SELECT
    'user_puzzle_history',
    orphan_rows.id::text,
    'missing_puzzle_reference',
    to_jsonb(orphan_rows)
FROM orphan_rows
ON CONFLICT (source_table, source_pk, archive_reason) DO NOTHING;

DELETE FROM public.user_puzzle_history h
WHERE NOT EXISTS (
    SELECT 1
    FROM public.puzzles p
    WHERE p.id::text = h.puzzle_id::text
);

WITH orphan_rows AS (
    SELECT v.*
    FROM public.puzzle_votes v
    WHERE NOT EXISTS (
        SELECT 1
        FROM public.puzzles p
        WHERE p.id::text = v.puzzle_id::text
    )
)
INSERT INTO public.db_orphan_archive (source_table, source_pk, archive_reason, payload)
SELECT
    'puzzle_votes',
    orphan_rows.id::text,
    'missing_puzzle_reference',
    to_jsonb(orphan_rows)
FROM orphan_rows
ON CONFLICT (source_table, source_pk, archive_reason) DO NOTHING;

DELETE FROM public.puzzle_votes v
WHERE NOT EXISTS (
    SELECT 1
    FROM public.puzzles p
    WHERE p.id::text = v.puzzle_id::text
);

WITH orphan_rows AS (
    SELECT i.*
    FROM public.user_iq_history i
    WHERE NOT EXISTS (
        SELECT 1
        FROM public.puzzles p
        WHERE p.id::text = i.puzzle_id::text
    )
)
INSERT INTO public.db_orphan_archive (source_table, source_pk, archive_reason, payload)
SELECT
    'user_iq_history',
    orphan_rows.id::text,
    'missing_puzzle_reference',
    to_jsonb(orphan_rows)
FROM orphan_rows
ON CONFLICT (source_table, source_pk, archive_reason) DO NOTHING;

DELETE FROM public.user_iq_history i
WHERE NOT EXISTS (
    SELECT 1
    FROM public.puzzles p
    WHERE p.id::text = i.puzzle_id::text
);

WITH orphan_rows AS (
    SELECT v.*
    FROM public.user_video_unlocks v
    WHERE NOT EXISTS (
        SELECT 1
        FROM public.puzzles p
        WHERE p.id::text = v.puzzle_id::text
    )
)
INSERT INTO public.db_orphan_archive (source_table, source_pk, archive_reason, payload)
SELECT
    'user_video_unlocks',
    orphan_rows.id::text,
    'missing_puzzle_reference',
    to_jsonb(orphan_rows)
FROM orphan_rows
ON CONFLICT (source_table, source_pk, archive_reason) DO NOTHING;

DELETE FROM public.user_video_unlocks v
WHERE NOT EXISTS (
    SELECT 1
    FROM public.puzzles p
    WHERE p.id::text = v.puzzle_id::text
);

WITH orphan_rows AS (
    SELECT h.*
    FROM public.pro_iq_history h
    WHERE NOT EXISTS (
        SELECT 1
        FROM public.pro_players p
        WHERE p.id = h.pro_player_id
    )
)
INSERT INTO public.db_orphan_archive (source_table, source_pk, archive_reason, payload)
SELECT
    'pro_iq_history',
    orphan_rows.id::text,
    'missing_pro_player_reference',
    to_jsonb(orphan_rows)
FROM orphan_rows
ON CONFLICT (source_table, source_pk, archive_reason) DO NOTHING;

DELETE FROM public.pro_iq_history h
WHERE NOT EXISTS (
    SELECT 1
    FROM public.pro_players p
    WHERE p.id = h.pro_player_id
);
