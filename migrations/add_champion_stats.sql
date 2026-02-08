-- Migration: Add Champion Ability and Stats Columns
-- Run this in Supabase SQL Editor

-- Add ability columns
ALTER TABLE champions 
ADD COLUMN IF NOT EXISTS ability_name text,
ADD COLUMN IF NOT EXISTS ability_name_en text,  
ADD COLUMN IF NOT EXISTS ability_description text,
ADD COLUMN IF NOT EXISTS stats jsonb;

-- Add comment for stats structure documentation
COMMENT ON COLUMN champions.stats IS 'Stats object: {hp: [1★, 2★, 3★], ad: [1★, 2★, 3★], as: number, armor: number, mr: number, mana: {min: number, max: number}, range: number, dps: [1★, 2★, 3★]}';

-- Verify the changes
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'champions'
ORDER BY ordinal_position;
