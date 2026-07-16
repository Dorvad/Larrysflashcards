-- Track unique vocabulary words separately from total card attempts (including retries).
-- Idempotent — safe to run on an existing project.

ALTER TABLE public.practice_sessions
  ADD COLUMN IF NOT EXISTS word_count INTEGER NOT NULL DEFAULT 0 CHECK (word_count >= 0);

-- Backfill: legacy sessions treated card_count as unique words.
UPDATE public.practice_sessions
SET word_count = card_count
WHERE word_count = 0 AND card_count > 0;
