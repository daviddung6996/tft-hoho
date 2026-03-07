-- Add soft-delete support to puzzles table
-- Required for TrashView / puzzleService.delete() / puzzleService.getDeleted() to work

ALTER TABLE public.puzzles
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_puzzles_deleted_at
    ON public.puzzles(deleted_at)
    WHERE deleted_at IS NOT NULL;
