-- Migration 3: RLS Policies for T-Coin and Supporters
-- Description: Enable RLS and add policies for safe frontend access

-- 1. Enable RLS on all tables
ALTER TABLE public.user_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tcoin_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_unlocked_puzzles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pro_supporters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

-- 2. Policies for `user_wallets`
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own wallet' AND tablename = 'user_wallets') THEN
        CREATE POLICY "Users can view their own wallet" ON public.user_wallets FOR SELECT USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert their own wallet' AND tablename = 'user_wallets') THEN
        CREATE POLICY "Users can insert their own wallet" ON public.user_wallets FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own wallet' AND tablename = 'user_wallets') THEN
        CREATE POLICY "Users can update their own wallet" ON public.user_wallets FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;


-- 3. Policies for `tcoin_transactions`
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own transactions' AND tablename = 'tcoin_transactions') THEN
        CREATE POLICY "Users can view their own transactions" ON public.tcoin_transactions FOR SELECT USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert their own transactions' AND tablename = 'tcoin_transactions') THEN
        CREATE POLICY "Users can insert their own transactions" ON public.tcoin_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    -- No UPDATE or DELETE policies -> immutable ledger
END $$;


-- 4. Policies for `user_unlocked_puzzles`
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own unlocked puzzles' AND tablename = 'user_unlocked_puzzles') THEN
        CREATE POLICY "Users can view their own unlocked puzzles" ON public.user_unlocked_puzzles FOR SELECT USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert their own unlocked puzzles' AND tablename = 'user_unlocked_puzzles') THEN
        CREATE POLICY "Users can insert their own unlocked puzzles" ON public.user_unlocked_puzzles FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    -- No UPDATE or DELETE
END $$;


-- 5. Policies for `pro_supporters`
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own supporter status' AND tablename = 'pro_supporters') THEN
        CREATE POLICY "Users can view their own supporter status" ON public.pro_supporters FOR SELECT USING (auth.uid() = user_id);
    END IF;
    -- UPDATE is typically handled by server-side webhooks (service role bypasses RLS). No update for regular users.
END $$;


-- 6. Policies for `donations`
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone authenticated can view donations' AND tablename = 'donations') THEN
        CREATE POLICY "Anyone authenticated can view donations" ON public.donations FOR SELECT TO authenticated USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert their own donations' AND tablename = 'donations') THEN
        CREATE POLICY "Users can insert their own donations" ON public.donations FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    -- Anonymous donations or inserts handled via service role
END $$;
