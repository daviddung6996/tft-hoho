-- Migration 1: T-Coin Core Tables and Puzzle Tier
-- Description: Standardize `puzzles.tier` and create foundational ledger tables for T-Coin

-- 1. Enable pgcrypto for UUID generation if not exists
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Add and standardize `tier` on `public.puzzles`
DO $$
BEGIN
    -- Add column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'puzzles' AND column_name = 'tier') THEN
        ALTER TABLE public.puzzles ADD COLUMN tier TEXT;
    END IF;
END $$;

-- Backfill existing rows that have null tier
UPDATE public.puzzles SET tier = 'free' WHERE tier IS NULL;

-- Make it NOT NULL and set DEFAULT
ALTER TABLE public.puzzles ALTER COLUMN tier SET DEFAULT 'free';
ALTER TABLE public.puzzles ALTER COLUMN tier SET NOT NULL;

-- Add check constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'puzzles_tier_check' 
          AND conrelid = 'public.puzzles'::regclass
    ) THEN
        ALTER TABLE public.puzzles ADD CONSTRAINT puzzles_tier_check CHECK (tier IN ('free', 'advanced', 'rare'));
    END IF;
END $$;


-- 3. Create `user_wallets` table
CREATE TABLE IF NOT EXISTS public.user_wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    balance INT NOT NULL DEFAULT 30,
    total_earned INT NOT NULL DEFAULT 30,
    total_spent INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT user_wallets_user_id_key UNIQUE (user_id),
    CONSTRAINT user_wallets_balance_check CHECK (balance >= 0),
    CONSTRAINT user_wallets_total_earned_check CHECK (total_earned >= 0),
    CONSTRAINT user_wallets_total_spent_check CHECK (total_spent >= 0)
);

-- Index for user_wallets
CREATE INDEX IF NOT EXISTS idx_user_wallets_user_id ON public.user_wallets(user_id);


-- 4. Create `tcoin_transactions` table (Ledger)
CREATE TABLE IF NOT EXISTS public.tcoin_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount INT NOT NULL,
    balance_after INT NOT NULL,
    type TEXT NOT NULL,
    reason TEXT NOT NULL,
    reference_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT tcoin_transactions_type_check CHECK (type IN ('earn', 'spend')),
    CONSTRAINT tcoin_transactions_balance_after_check CHECK (balance_after >= 0),
    CONSTRAINT tcoin_transactions_amount_type_check CHECK (
        (type = 'earn' AND amount > 0) OR 
        (type = 'spend' AND amount < 0)
    )
);

-- Indexes for tcoin_transactions
CREATE INDEX IF NOT EXISTS idx_tcoin_transactions_user_id_created_at ON public.tcoin_transactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tcoin_transactions_reason_created_at ON public.tcoin_transactions(reason, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tcoin_transactions_reference_id ON public.tcoin_transactions(reference_id);


-- 5. Create `user_unlocked_puzzles` table
CREATE TABLE IF NOT EXISTS public.user_unlocked_puzzles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    puzzle_id TEXT NOT NULL,
    tier TEXT NOT NULL,
    unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT user_unlocked_puzzles_user_puzzle_key UNIQUE (user_id, puzzle_id),
    CONSTRAINT user_unlocked_puzzles_tier_check CHECK (tier IN ('free', 'advanced', 'rare'))
);

-- Indexes for user_unlocked_puzzles
CREATE INDEX IF NOT EXISTS idx_unlocked_puzzles_user_id_unlocked_at ON public.user_unlocked_puzzles(user_id, unlocked_at DESC);
CREATE INDEX IF NOT EXISTS idx_unlocked_puzzles_puzzle_id ON public.user_unlocked_puzzles(puzzle_id);

-- Setup trigger for user_wallets updated_at
-- Create function if not exists
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'set_user_wallets_updated_at'
    ) THEN
        CREATE TRIGGER set_user_wallets_updated_at
        BEFORE UPDATE ON public.user_wallets
        FOR EACH ROW
        EXECUTE FUNCTION public.handle_updated_at();
    END IF;
END $$;
