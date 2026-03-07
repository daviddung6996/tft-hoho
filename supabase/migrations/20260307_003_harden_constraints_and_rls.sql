-- Phase 3: Harden constraints, referential guards, and RLS so drift does not recur
-- Date: 2026-03-07

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.users
        WHERE id = auth.uid()
          AND role = 'admin'
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_admin_or_mod()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.users
        WHERE id = auth.uid()
          AND role IN ('admin', 'mod')
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.promote_to_admin(target_email TEXT, secret_key TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    IF secret_key <> 'tfthoho_admin_2024' THEN
        RETURN FALSE;
    END IF;

    UPDATE public.users
    SET role = 'admin'
    WHERE email = target_email;

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.ensure_puzzle_reference_exists()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.puzzle_id IS NULL THEN
        RETURN NEW;
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM public.puzzles
        WHERE id::text = NEW.puzzle_id::text
    ) THEN
        RAISE EXCEPTION 'Puzzle reference % does not exist in public.puzzles', NEW.puzzle_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
    constraint_name TEXT;
BEGIN
    FOR constraint_name IN
        SELECT conname
        FROM pg_constraint
        WHERE conrelid = 'public.users'::regclass
          AND contype = 'c'
          AND pg_get_constraintdef(oid) ILIKE '%role%'
    LOOP
        EXECUTE 'ALTER TABLE public.users DROP CONSTRAINT ' || quote_ident(constraint_name);
    END LOOP;
END $$;

ALTER TABLE public.users
    ADD CONSTRAINT users_role_check CHECK (role IN ('user', 'mod', 'admin'));

ALTER TABLE public.pro_supporters
    ADD CONSTRAINT pro_supporters_updated_at_not_null CHECK (updated_at IS NOT NULL) NOT VALID;

ALTER TABLE public.puzzles
    ALTER COLUMN meta_data SET DEFAULT '{}'::jsonb,
    ALTER COLUMN board_state SET DEFAULT '{}'::jsonb,
    ALTER COLUMN augments SET DEFAULT '[]'::jsonb,
    ALTER COLUMN pro_first_roll SET DEFAULT '[]'::jsonb,
    ALTER COLUMN pro_second_roll SET DEFAULT '[]'::jsonb,
    ALTER COLUMN void_mod_ids SET DEFAULT '{}'::text[];

CREATE INDEX IF NOT EXISTS idx_user_puzzle_history_puzzle_id
    ON public.user_puzzle_history(puzzle_id);
CREATE INDEX IF NOT EXISTS idx_user_iq_history_puzzle_id
    ON public.user_iq_history(puzzle_id);
CREATE INDEX IF NOT EXISTS idx_user_video_unlocks_user_puzzle
    ON public.user_video_unlocks(user_id, puzzle_id);
CREATE INDEX IF NOT EXISTS idx_puzzles_tier_created_at
    ON public.puzzles(tier, created_at DESC);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'enforce_puzzle_ref_user_puzzle_history') THEN
        CREATE TRIGGER enforce_puzzle_ref_user_puzzle_history
        BEFORE INSERT OR UPDATE ON public.user_puzzle_history
        FOR EACH ROW
        EXECUTE FUNCTION public.ensure_puzzle_reference_exists();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'enforce_puzzle_ref_user_iq_history') THEN
        CREATE TRIGGER enforce_puzzle_ref_user_iq_history
        BEFORE INSERT OR UPDATE ON public.user_iq_history
        FOR EACH ROW
        EXECUTE FUNCTION public.ensure_puzzle_reference_exists();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'enforce_puzzle_ref_puzzle_votes') THEN
        CREATE TRIGGER enforce_puzzle_ref_puzzle_votes
        BEFORE INSERT OR UPDATE ON public.puzzle_votes
        FOR EACH ROW
        EXECUTE FUNCTION public.ensure_puzzle_reference_exists();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'enforce_puzzle_ref_user_unlocked_puzzles') THEN
        CREATE TRIGGER enforce_puzzle_ref_user_unlocked_puzzles
        BEFORE INSERT OR UPDATE ON public.user_unlocked_puzzles
        FOR EACH ROW
        EXECUTE FUNCTION public.ensure_puzzle_reference_exists();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'enforce_puzzle_ref_user_video_unlocks') THEN
        CREATE TRIGGER enforce_puzzle_ref_user_video_unlocks
        BEFORE INSERT OR UPDATE ON public.user_video_unlocks
        FOR EACH ROW
        EXECUTE FUNCTION public.ensure_puzzle_reference_exists();
    END IF;
END $$;

ALTER TABLE public.pro_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pro_iq_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_video_unlocks ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Mods can view all users') THEN
        CREATE POLICY "Mods can view all users" ON public.users
            FOR SELECT USING (public.is_admin_or_mod());
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'champions' AND policyname = 'Mods can modify champions') THEN
        CREATE POLICY "Mods can modify champions" ON public.champions
            FOR ALL USING (public.is_admin_or_mod())
            WITH CHECK (public.is_admin_or_mod());
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'traits' AND policyname = 'Mods can modify traits') THEN
        CREATE POLICY "Mods can modify traits" ON public.traits
            FOR ALL USING (public.is_admin_or_mod())
            WITH CHECK (public.is_admin_or_mod());
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'items' AND policyname = 'Mods can modify items') THEN
        CREATE POLICY "Mods can modify items" ON public.items
            FOR ALL USING (public.is_admin_or_mod())
            WITH CHECK (public.is_admin_or_mod());
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'augments' AND policyname = 'Mods can modify augments') THEN
        CREATE POLICY "Mods can modify augments" ON public.augments
            FOR ALL USING (public.is_admin_or_mod())
            WITH CHECK (public.is_admin_or_mod());
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'puzzles' AND policyname = 'Mods can modify puzzles') THEN
        CREATE POLICY "Mods can modify puzzles" ON public.puzzles
            FOR ALL USING (public.is_admin_or_mod())
            WITH CHECK (public.is_admin_or_mod());
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_puzzle_history' AND policyname = 'Mods can view all puzzle history') THEN
        CREATE POLICY "Mods can view all puzzle history" ON public.user_puzzle_history
            FOR SELECT USING (public.is_admin_or_mod());
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_puzzle_history' AND policyname = 'Mods can modify all puzzle history') THEN
        CREATE POLICY "Mods can modify all puzzle history" ON public.user_puzzle_history
            FOR ALL USING (public.is_admin_or_mod())
            WITH CHECK (public.is_admin_or_mod());
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pro_players' AND policyname = 'Mods can read pro players') THEN
        CREATE POLICY "Mods can read pro players" ON public.pro_players
            FOR SELECT USING (public.is_admin_or_mod());
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pro_players' AND policyname = 'Mods can modify pro players') THEN
        CREATE POLICY "Mods can modify pro players" ON public.pro_players
            FOR ALL USING (public.is_admin_or_mod())
            WITH CHECK (public.is_admin_or_mod());
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pro_iq_history' AND policyname = 'Mods can read pro iq history') THEN
        CREATE POLICY "Mods can read pro iq history" ON public.pro_iq_history
            FOR SELECT USING (public.is_admin_or_mod());
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pro_iq_history' AND policyname = 'Mods can insert pro iq history') THEN
        CREATE POLICY "Mods can insert pro iq history" ON public.pro_iq_history
            FOR INSERT WITH CHECK (public.is_admin_or_mod());
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'memes' AND policyname = 'Anyone can read active memes') THEN
        CREATE POLICY "Anyone can read active memes" ON public.memes
            FOR SELECT USING (is_active = true OR public.is_admin_or_mod());
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'memes' AND policyname = 'Mods can modify memes') THEN
        CREATE POLICY "Mods can modify memes" ON public.memes
            FOR ALL USING (public.is_admin_or_mod())
            WITH CHECK (public.is_admin_or_mod());
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_video_unlocks' AND policyname = 'Users can read own video unlocks') THEN
        CREATE POLICY "Users can read own video unlocks" ON public.user_video_unlocks
            FOR SELECT USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_video_unlocks' AND policyname = 'Users can insert own video unlocks') THEN
        CREATE POLICY "Users can insert own video unlocks" ON public.user_video_unlocks
            FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_video_unlocks' AND policyname = 'Users can update own video unlocks') THEN
        CREATE POLICY "Users can update own video unlocks" ON public.user_video_unlocks
            FOR UPDATE USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_video_unlocks' AND policyname = 'Mods can view all video unlocks') THEN
        CREATE POLICY "Mods can view all video unlocks" ON public.user_video_unlocks
            FOR SELECT USING (public.is_admin_or_mod());
    END IF;
END $$;
