-- Practice session tracking for incremental student study and teacher analytics.
-- Idempotent — safe to run on an existing project.

CREATE TABLE IF NOT EXISTS public.practice_sessions (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id          UUID        NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  started_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at        TIMESTAMPTZ,
  card_count          INTEGER     NOT NULL DEFAULT 0 CHECK (card_count >= 0),
  knew_count          INTEGER     NOT NULL DEFAULT 0 CHECK (knew_count >= 0),
  almost_count        INTEGER     NOT NULL DEFAULT 0 CHECK (almost_count >= 0),
  forgot_count        INTEGER     NOT NULL DEFAULT 0 CHECK (forgot_count >= 0),
  encouragement_count INTEGER     NOT NULL DEFAULT 0 CHECK (encouragement_count >= 0)
);

ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS session_id UUID
    REFERENCES public.practice_sessions(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_practice_sessions_student_started
  ON public.practice_sessions (student_id, started_at DESC);

CREATE INDEX IF NOT EXISTS idx_practice_sessions_student_completed
  ON public.practice_sessions (student_id, completed_at DESC)
  WHERE completed_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_reviews_session_id
  ON public.reviews (session_id)
  WHERE session_id IS NOT NULL;

ALTER TABLE public.practice_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "practice_sessions: student manages own" ON public.practice_sessions;
CREATE POLICY "practice_sessions: student manages own"
  ON public.practice_sessions FOR ALL
  USING (student_id = public.my_student_id())
  WITH CHECK (student_id = public.my_student_id());

DROP POLICY IF EXISTS "practice_sessions: teacher reads own student" ON public.practice_sessions;
CREATE POLICY "practice_sessions: teacher reads own student"
  ON public.practice_sessions FOR SELECT
  USING (
    public.my_role() = 'teacher'
    AND EXISTS (
      SELECT 1 FROM public.students s
      WHERE s.id = practice_sessions.student_id
        AND s.teacher_id = auth.uid()
    )
  );
