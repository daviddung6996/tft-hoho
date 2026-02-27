-- Migration: Allow multiple attempts per puzzle per user
-- Previously it was limited to 1 attempt per (user, puzzle) via UNIQUE constraint
-- Now each play session creates a new row, accurately recording history

ALTER TABLE user_puzzle_attempts 
DROP CONSTRAINT IF EXISTS user_puzzle_attempts_user_id_puzzle_id_key;

-- Safety: also drop any other unique constraints on these columns
DO $$
DECLARE
    constraint_name text;
BEGIN
    FOR constraint_name IN
        SELECT conname
        FROM pg_constraint
        WHERE conrelid = 'user_puzzle_attempts'::regclass
          AND contype = 'u'
    LOOP
        EXECUTE 'ALTER TABLE user_puzzle_attempts DROP CONSTRAINT ' || quote_ident(constraint_name);
    END LOOP;
END $$;
