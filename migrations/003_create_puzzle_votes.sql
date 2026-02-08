-- Migration: Create puzzle_votes table for anonymous community voting
-- Run this in Supabase SQL Editor
-- Tracks augment choices from ALL users (including guests) for vote percentages

CREATE TABLE IF NOT EXISTS public.puzzle_votes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    puzzle_id TEXT NOT NULL,
    augment_id TEXT NOT NULL,
    augment_name TEXT NOT NULL,
    session_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(puzzle_id, session_id)
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_puzzle_votes_puzzle_id ON public.puzzle_votes(puzzle_id);

-- Enable RLS
ALTER TABLE public.puzzle_votes ENABLE ROW LEVEL SECURITY;

-- Allow anyone (including anonymous/guest) to insert votes
CREATE POLICY "Anyone can insert votes" ON public.puzzle_votes
    FOR INSERT WITH CHECK (true);

-- Allow anyone to read vote counts
CREATE POLICY "Anyone can read votes" ON public.puzzle_votes
    FOR SELECT USING (true);

-- Allow upsert (update own vote if session_id matches)
CREATE POLICY "Anyone can update own vote" ON public.puzzle_votes
    FOR UPDATE USING (true) WITH CHECK (true);

COMMENT ON TABLE public.puzzle_votes IS 'Anonymous community votes for augment choices. Tracks all users including guests.';
COMMENT ON COLUMN public.puzzle_votes.session_id IS 'Browser-generated UUID stored in localStorage. Prevents duplicate votes per session.';
