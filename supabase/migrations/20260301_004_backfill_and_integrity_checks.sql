-- Migration 4: Backfill and Integrity Checks
-- Description: Backfill user wallets, sync pro supporters, and perform verification queries

-- 1. Backfill `user_wallets` for existing users
-- Will insert a default wallet (30 coins) for any auth.users that don't have one yet.
INSERT INTO public.user_wallets (user_id, balance, total_earned, total_spent)
SELECT id, 30, 30, 0
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.user_wallets)
ON CONFLICT (user_id) DO NOTHING;


-- 2. Sync existing `pro_supporters` data drift
-- Set status to 'expired' for monthly plans where expires_at is in the past
UPDATE public.pro_supporters
SET status = 'expired'
WHERE plan = 'monthly' 
  AND status = 'active' 
  AND expires_at < now();


-- 3. Data integrity fixes
-- Clamp negative balance_after to 0 just in case there's any bad historical data we didn't catch
UPDATE public.tcoin_transactions
SET balance_after = 0
WHERE balance_after < 0;

-- Ensure all puzzle tiers are strictly lowercase
UPDATE public.user_unlocked_puzzles
SET tier = lower(tier)
WHERE tier != lower(tier);


-- 4. Verification Queries (DO blocks purely for checking)
DO $$
DECLARE
    wallet_count INT;
    supporter_count INT;
    policy_count INT;
BEGIN
    -- Check table existence
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_wallets') THEN
        RAISE EXCEPTION 'Table user_wallets does not exist';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tcoin_transactions') THEN
        RAISE EXCEPTION 'Table tcoin_transactions does not exist';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_unlocked_puzzles') THEN
        RAISE EXCEPTION 'Table user_unlocked_puzzles does not exist';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pro_supporters') THEN
        RAISE EXCEPTION 'Table pro_supporters does not exist';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'donations') THEN
        RAISE EXCEPTION 'Table donations does not exist';
    END IF;

    -- Check index existence
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_user_wallets_user_id') THEN
        RAISE NOTICE 'Index idx_user_wallets_user_id does not exist, but is expected.';
    END IF;

    -- Check total policy count across the 5 tables
    SELECT count(*) INTO policy_count 
    FROM pg_policies 
    WHERE tablename IN ('user_wallets', 'tcoin_transactions', 'user_unlocked_puzzles', 'pro_supporters', 'donations');

    IF policy_count = 0 THEN
        RAISE EXCEPTION 'No RLS policies found for the new tables!';
    ELSE
        RAISE NOTICE 'Found % RLS policies total.', policy_count;
    END IF;

    -- Check total wallets backfilled
    SELECT count(*) INTO wallet_count FROM public.user_wallets;
    RAISE NOTICE 'Total user wallets: %', wallet_count;

    -- Check active supporters
    SELECT count(*) INTO supporter_count FROM public.pro_supporters WHERE status = 'active';
    RAISE NOTICE 'Total active pro supporters: %', supporter_count;

END $$;
