-- Migration: Add User TFT IQ Score

-- 1. Add columns to public.users
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS iq_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS iq_rank TEXT DEFAULT 'Iron',
ADD COLUMN IF NOT EXISTS season INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS total_puzzles_solved INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS accuracy_weight DECIMAL DEFAULT 0,
ADD COLUMN IF NOT EXISTS speed_weight DECIMAL DEFAULT 0;

-- 2. Create user_iq_history table
CREATE TABLE IF NOT EXISTS public.user_iq_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    puzzle_id TEXT NOT NULL,
    change_amount INTEGER NOT NULL,
    time_taken_ms INTEGER NOT NULL,
    is_correct BOOLEAN NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Setup RLS for user_iq_history
ALTER TABLE public.user_iq_history ENABLE ROW LEVEL SECURITY;

-- Users can read their own history
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_iq_history' AND policyname = 'Users can view own history'
    ) THEN
        CREATE POLICY "Users can view own history" ON public.user_iq_history
            FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_iq_history' AND policyname = 'Users can insert own history'
    ) THEN
        CREATE POLICY "Users can insert own history" ON public.user_iq_history
            FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
END
$$;

-- 4. Initial sync for existing users if any
UPDATE public.users 
SET iq_score = 0, iq_rank = 'Iron' 
WHERE iq_score IS NULL;
