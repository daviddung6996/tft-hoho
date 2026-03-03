-- V2: Augment Trainer 3-2 — Add intent tracking columns to user_puzzle_attempts
-- These columns are optional and only populated for V2 (3-2 stage) puzzles

ALTER TABLE public.user_puzzle_attempts
ADD COLUMN IF NOT EXISTS declared_path text,
ADD COLUMN IF NOT EXISTS intent_score integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS time_to_path_ms integer DEFAULT 0;

-- Add comment for documentation
COMMENT ON COLUMN public.user_puzzle_attempts.declared_path IS 'V2: User declared augment path intent (econ/item/combat/emblem)';
COMMENT ON COLUMN public.user_puzzle_attempts.intent_score IS 'V2: Intent match score (0 = mismatch, 10 = match)';
COMMENT ON COLUMN public.user_puzzle_attempts.time_to_path_ms IS 'V2: Time taken to declare intent in milliseconds';
