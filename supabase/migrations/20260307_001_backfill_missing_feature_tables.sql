-- Phase 2A: Backfill missing schema definitions that already exist remotely
-- Date: 2026-03-07

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

ALTER TABLE public.users
    ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.users(id) ON DELETE SET NULL;

ALTER TABLE public.puzzles
    ADD COLUMN IF NOT EXISTS video_thumbnail_url TEXT;

ALTER TABLE public.pro_supporters
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

UPDATE public.pro_supporters
SET updated_at = COALESCE(updated_at, created_at, started_at, now())
WHERE updated_at IS NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'set_pro_supporters_updated_at'
    ) THEN
        CREATE TRIGGER set_pro_supporters_updated_at
        BEFORE UPDATE ON public.pro_supporters
        FOR EACH ROW
        EXECUTE FUNCTION public.handle_updated_at();
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.pro_players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    region TEXT NOT NULL,
    avatar_url TEXT,
    liquipedia_url TEXT,
    datatft_url TEXT,
    current_iq INTEGER NOT NULL DEFAULT 1500,
    iq_tier TEXT NOT NULL DEFAULT 'Rising',
    current_rank TEXT,
    current_lp INTEGER,
    tournament_titles INTEGER NOT NULL DEFAULT 0,
    notes TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT pro_players_region_check CHECK (region IN ('AMER', 'EMEA', 'APAC', 'CN', 'VN', 'OTHER')),
    CONSTRAINT pro_players_iq_tier_check CHECK (iq_tier IN ('GOAT', 'Elite', 'Top Pro', 'Pro', 'Rising')),
    CONSTRAINT pro_players_current_iq_check CHECK (current_iq >= 0),
    CONSTRAINT pro_players_tournament_titles_check CHECK (tournament_titles >= 0)
);

CREATE INDEX IF NOT EXISTS idx_pro_players_current_iq ON public.pro_players(current_iq DESC);
CREATE INDEX IF NOT EXISTS idx_pro_players_is_active ON public.pro_players(is_active);
CREATE INDEX IF NOT EXISTS idx_pro_players_region ON public.pro_players(region);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'set_pro_players_updated_at'
    ) THEN
        CREATE TRIGGER set_pro_players_updated_at
        BEFORE UPDATE ON public.pro_players
        FOR EACH ROW
        EXECUTE FUNCTION public.handle_updated_at();
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.pro_iq_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pro_player_id UUID NOT NULL REFERENCES public.pro_players(id) ON DELETE CASCADE,
    iq_score INTEGER NOT NULL,
    iq_tier TEXT NOT NULL,
    change_amount INTEGER NOT NULL DEFAULT 0,
    change_reason TEXT NOT NULL,
    source TEXT NOT NULL DEFAULT 'manual',
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT pro_iq_history_iq_score_check CHECK (iq_score >= 0),
    CONSTRAINT pro_iq_history_iq_tier_check CHECK (iq_tier IN ('GOAT', 'Elite', 'Top Pro', 'Pro', 'Rising')),
    CONSTRAINT pro_iq_history_source_check CHECK (source IN ('manual', 'tournament', 'ladder'))
);

CREATE INDEX IF NOT EXISTS idx_pro_iq_history_player_recorded_at
    ON public.pro_iq_history(pro_player_id, recorded_at DESC);

CREATE TABLE IF NOT EXISTS public.memes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    text TEXT NOT NULL,
    emoji TEXT NOT NULL,
    image_url TEXT,
    category TEXT NOT NULL,
    insight TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT memes_category_check CHECK (category IN ('correct', 'incorrect'))
);

CREATE INDEX IF NOT EXISTS idx_memes_category_active
    ON public.memes(category, is_active, created_at DESC);

CREATE TABLE IF NOT EXISTS public.user_video_unlocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    puzzle_id TEXT NOT NULL,
    video_url TEXT NOT NULL,
    user_result TEXT NOT NULL,
    iq_delta INTEGER,
    unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT user_video_unlocks_user_puzzle_key UNIQUE (user_id, puzzle_id),
    CONSTRAINT user_video_unlocks_result_check CHECK (user_result IN ('correct', 'incorrect'))
);

CREATE INDEX IF NOT EXISTS idx_user_video_unlocks_user_id_unlocked_at
    ON public.user_video_unlocks(user_id, unlocked_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_video_unlocks_puzzle_id
    ON public.user_video_unlocks(puzzle_id);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'set_user_video_unlocks_updated_at'
    ) THEN
        CREATE TRIGGER set_user_video_unlocks_updated_at
        BEFORE UPDATE ON public.user_video_unlocks
        FOR EACH ROW
        EXECUTE FUNCTION public.handle_updated_at();
    END IF;
END $$;

ALTER TABLE public.user_video_unlocks
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();


COMMENT ON TABLE public.pro_players IS 'Curated roster of pro players used by the Pro IQ admin tools.';
COMMENT ON TABLE public.pro_iq_history IS 'Audit trail of manual or system-driven Pro IQ changes.';
COMMENT ON TABLE public.memes IS 'Feedback meme library used after puzzle completion.';
COMMENT ON TABLE public.user_video_unlocks IS 'Tracks puzzle explanation videos unlocked by each user.';
