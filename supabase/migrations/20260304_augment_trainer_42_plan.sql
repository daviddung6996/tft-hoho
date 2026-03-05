-- V3: Augment Trainer 4-2 — Add plan tracking columns to user_puzzle_attempts
-- These columns are optional and only populated for V3 (4-2 stage) puzzles

ALTER TABLE public.user_puzzle_attempts
ADD COLUMN IF NOT EXISTS declared_plan text,
ADD COLUMN IF NOT EXISTS plan_score integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS time_to_plan_ms integer DEFAULT 0;

-- Add comment for documentation
COMMENT ON COLUMN public.user_puzzle_attempts.declared_plan IS 'V3: User declared stabilization plan (stabilize/cap/patch/greed)';
COMMENT ON COLUMN public.user_puzzle_attempts.plan_score IS 'V3: Plan match score (0 = mismatch, 10 = match)';
COMMENT ON COLUMN public.user_puzzle_attempts.time_to_plan_ms IS 'V3: Time taken to declare plan in milliseconds';
