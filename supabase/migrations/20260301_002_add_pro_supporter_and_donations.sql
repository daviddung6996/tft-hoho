-- Migration 2: Pro Supporter and Donations
-- Description: Creates tables for tracking Pro Supporter subscriptions and one-off donations

-- 1. Create `pro_supporters` table
CREATE TABLE IF NOT EXISTS public.pro_supporters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ,
    payment_ref TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT pro_supporters_user_id_key UNIQUE (user_id),
    CONSTRAINT pro_supporters_plan_check CHECK (plan IN ('monthly', 'lifetime')),
    CONSTRAINT pro_supporters_status_check CHECK (status IN ('active', 'expired', 'cancelled')),
    CONSTRAINT pro_supporters_plan_expires_check CHECK (
        (plan = 'lifetime' AND expires_at IS NULL) OR 
        (plan = 'monthly' AND expires_at IS NOT NULL)
    )
);

-- Indexes for pro_supporters
CREATE INDEX IF NOT EXISTS idx_pro_supporters_user_id ON public.pro_supporters(user_id);
CREATE INDEX IF NOT EXISTS idx_pro_supporters_status_expires ON public.pro_supporters(status, expires_at);
CREATE INDEX IF NOT EXISTS idx_pro_supporters_active ON public.pro_supporters(user_id) WHERE status = 'active';

-- Setup trigger for pro_supporters updated_at
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


-- 2. Create `donations` table
CREATE TABLE IF NOT EXISTS public.donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    amount INT NOT NULL,
    tier TEXT NOT NULL,
    message TEXT,
    payment_ref TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT donations_amount_check CHECK (amount > 0),
    CONSTRAINT donations_tier_check CHECK (tier IN ('thanks', 'superfan'))
);

-- Indexes for donations
CREATE INDEX IF NOT EXISTS idx_donations_created_at ON public.donations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_donations_user_id ON public.donations(user_id);
CREATE INDEX IF NOT EXISTS idx_donations_tier ON public.donations(tier);
