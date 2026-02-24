-- Migration: Add Row Level Security to Existing Game Data Tables
-- Run this in Supabase SQL Editor AFTER running 001_create_users_table.sql
-- This enforces role-based access control at the database level

-- ============================================
-- Enable RLS on all game data tables
-- ============================================

ALTER TABLE IF EXISTS public.champions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.traits ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.augments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.puzzles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_puzzle_history ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CHAMPIONS TABLE POLICIES
-- ============================================

-- Everyone can read champions (needed for gameplay)
CREATE POLICY "Anyone can view champions" ON public.champions
    FOR SELECT USING (true);

-- Only admins can insert, update, or delete champions
CREATE POLICY "Only admins can modify champions" ON public.champions
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- ============================================
-- TRAITS TABLE POLICIES
-- ============================================

-- Everyone can read traits (needed for gameplay)
CREATE POLICY "Anyone can view traits" ON public.traits
    FOR SELECT USING (true);

-- Only admins can insert, update, or delete traits
CREATE POLICY "Only admins can modify traits" ON public.traits
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- ============================================
-- ITEMS TABLE POLICIES
-- ============================================

-- Everyone can read items (needed for gameplay)
CREATE POLICY "Anyone can view items" ON public.items
    FOR SELECT USING (true);

-- Only admins can insert, update, or delete items
CREATE POLICY "Only admins can modify items" ON public.items
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- ============================================
-- AUGMENTS TABLE POLICIES
-- ============================================

-- Everyone can read augments (needed for gameplay)
CREATE POLICY "Anyone can view augments" ON public.augments
    FOR SELECT USING (true);

-- Only admins can insert, update, or delete augments
CREATE POLICY "Only admins can modify augments" ON public.augments
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- ============================================
-- PUZZLES TABLE POLICIES
-- ============================================

-- Everyone can read puzzles (needed for gameplay)
CREATE POLICY "Anyone can view puzzles" ON public.puzzles
    FOR SELECT USING (true);

-- Only admins can insert, update, or delete puzzles
CREATE POLICY "Only admins can modify puzzles" ON public.puzzles
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- ============================================
-- USER PUZZLE HISTORY TABLE POLICIES
-- ============================================

-- Users can only view their own puzzle history
CREATE POLICY "Users can view own puzzle history" ON public.user_puzzle_history
    FOR SELECT USING (auth.uid()::text = user_id);

-- Users can only insert their own puzzle completions
CREATE POLICY "Users can insert own puzzle history" ON public.user_puzzle_history
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Users can update their own puzzle history (if needed for timestamps)
CREATE POLICY "Users can update own puzzle history" ON public.user_puzzle_history
    FOR UPDATE USING (auth.uid()::text = user_id)
    WITH CHECK (auth.uid()::text = user_id);

-- Users can delete their own puzzle history (if needed for reset)
CREATE POLICY "Users can delete own puzzle history" ON public.user_puzzle_history
    FOR DELETE USING (auth.uid()::text = user_id);

-- Admins can view all puzzle history (for analytics)
CREATE POLICY "Admins can view all puzzle history" ON public.user_puzzle_history
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- Admins can manage all puzzle history
CREATE POLICY "Admins can modify all puzzle history" ON public.user_puzzle_history
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Verify RLS is enabled on all tables
SELECT
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename IN ('users', 'champions', 'traits', 'items', 'augments', 'puzzles', 'user_puzzle_history')
ORDER BY tablename;

-- View all policies created
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================
-- TESTING NOTES
-- ============================================

-- To test RLS policies:
-- 1. Sign up as a regular user via the app
-- 2. In Supabase SQL Editor, test queries as that user:
--    SET LOCAL role TO authenticated;
--    SET LOCAL request.jwt.claims TO '{"sub": "user-uuid-here"}';
--    SELECT * FROM champions; -- Should work
--    INSERT INTO champions ... -- Should fail
--
-- 3. Promote user to admin:
--    UPDATE public.users SET role = 'admin' WHERE id = 'user-uuid-here';
--
-- 4. Test again - admin should be able to insert/update/delete

-- ============================================
-- SECURITY NOTES
-- ============================================

-- RLS is the PRIMARY security layer - it cannot be bypassed from the client
-- Even if someone tampers with the frontend code, database will enforce permissions
-- Service layer checks are SECONDARY (for better UX and error messages)
-- Always test RLS policies thoroughly before deploying to production
