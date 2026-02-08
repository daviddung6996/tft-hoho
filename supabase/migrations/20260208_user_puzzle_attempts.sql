-- Migration: Create user_puzzle_attempts table for analytics tracking
-- Run this in Supabase Dashboard -> SQL Editor

CREATE TABLE IF NOT EXISTS user_puzzle_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    puzzle_id UUID NOT NULL REFERENCES puzzles(id) ON DELETE CASCADE,
    
    -- User's decision
    user_pick_id TEXT NOT NULL,
    user_pick_name TEXT,
    is_correct BOOLEAN NOT NULL,
    
    -- Behavior tracking
    reroll_count INTEGER DEFAULT 0,
    reroll_indices INTEGER[] DEFAULT '{}',
    time_to_decide_ms INTEGER,
    
    -- Context (denormalized for analytics queries)
    puzzle_stage TEXT,
    pro_pick_id TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, puzzle_id)
);

-- Indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_attempts_user ON user_puzzle_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_attempts_stage ON user_puzzle_attempts(puzzle_stage);
CREATE INDEX IF NOT EXISTS idx_attempts_correct ON user_puzzle_attempts(is_correct);
CREATE INDEX IF NOT EXISTS idx_attempts_created ON user_puzzle_attempts(created_at DESC);

-- Enable RLS
ALTER TABLE user_puzzle_attempts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own attempts
CREATE POLICY "Users can read own attempts"
ON user_puzzle_attempts FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy: Users can insert their own attempts
CREATE POLICY "Users can insert own attempts"
ON user_puzzle_attempts FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own attempts (for re-attempts)
CREATE POLICY "Users can update own attempts"
ON user_puzzle_attempts FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);
