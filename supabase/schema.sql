-- ================================================================
-- LARRY'S HEBREW FLASHCARDS — DATABASE SCHEMA
-- ================================================================
--
-- WHERE TO RUN THIS FILE
-- ──────────────────────
-- 1. Open your Supabase project dashboard (supabase.com)
-- 2. Go to:  SQL Editor  →  New query
-- 3. Paste the entire contents of this file
-- 4. Click  Run  (or press Ctrl/Cmd + Enter)
--
-- Run this file ONCE on a fresh project.
-- It is idempotent: CREATE ... IF NOT EXISTS and
-- CREATE OR REPLACE protect you from re-running it,
-- but dropping and re-creating tables will destroy data.
--
-- CONTENTS
-- ────────
--  §0   updated_at trigger function
--  §1   Table: profiles
--  §2   Table: students
--  §3   Table: words
--  §4   Table: reviews
--  §5   Table: weekly_focus
--  §6   Table: teacher_notes
--  §7   Helper functions for RLS  ← must come AFTER the tables they query
--  §8   Indexes
--  §9   Row-Level Security policies
--  §10  Auth trigger: auto-create profile on sign-up
--
-- ================================================================


-- ================================================================
-- §0  updated_at TRIGGER FUNCTION
-- ================================================================
-- Reused by every table that has an updated_at column.

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


-- ================================================================
-- §1  TABLE: profiles
-- ================================================================
-- One row per Supabase Auth user.
-- Created automatically by the handle_new_user trigger (§10).
-- The role is read from user_metadata.role at sign-up.

CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role        TEXT        NOT NULL CHECK (role IN ('teacher', 'student')),
  full_name   TEXT        NOT NULL DEFAULT '',
  email       TEXT        NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;


-- ================================================================
-- §2  TABLE: students
-- ================================================================
-- One row per student user.
-- Created by the teacher after the student's first sign-in.
-- teacher_id links the student to their teacher's profile.

CREATE TABLE IF NOT EXISTS public.students (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id           UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  display_name         TEXT,
  teacher_id           UUID        NOT NULL REFERENCES public.profiles(id),
  notes                TEXT,
  text_size_preference TEXT        NOT NULL DEFAULT 'default'
                         CHECK (text_size_preference IN ('small', 'default', 'large', 'x-large')),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (profile_id)
);

CREATE OR REPLACE TRIGGER trg_students_updated_at
  BEFORE UPDATE ON public.students
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;


-- ================================================================
-- §3  TABLE: words
-- ================================================================
-- One row per vocabulary word assigned to a student.
--
-- Lifecycle:
--   Teacher adds word    → is_pending_approval=FALSE, is_active=TRUE
--   Student suggests     → is_pending_approval=TRUE,  is_active=FALSE
--   Teacher approves     → is_pending_approval=FALSE, is_active=TRUE
--   Teacher declines     → delete the row, or leave is_active=FALSE

CREATE TABLE IF NOT EXISTS public.words (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id           UUID        NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  created_by           UUID        NOT NULL REFERENCES public.profiles(id),

  hebrew               TEXT        NOT NULL,
  hebrew_niqqud        TEXT,
  transliteration      TEXT,
  meaning_en           TEXT        NOT NULL,
  example_he           TEXT,
  example_en           TEXT,

  category             TEXT,
  difficulty           TEXT        NOT NULL DEFAULT 'medium'
                         CHECK (difficulty IN ('easy', 'medium', 'hard')),
  tags                 TEXT[]      NOT NULL DEFAULT '{}',
  teacher_notes        TEXT,
  audio_url            TEXT,
  audio_example_url    TEXT,
  image_url            TEXT,

  status               TEXT        NOT NULL DEFAULT 'new'
                         CHECK (status IN ('new', 'practicing', 'strong', 'mastered')),
  current_strength     INTEGER     NOT NULL DEFAULT 0
                         CHECK (current_strength BETWEEN 0 AND 5),

  last_reviewed        TIMESTAMPTZ,
  next_review_at       TIMESTAMPTZ,

  is_active            BOOLEAN     NOT NULL DEFAULT TRUE,
  is_pending_approval  BOOLEAN     NOT NULL DEFAULT FALSE,
  submitted_by_student BOOLEAN     NOT NULL DEFAULT FALSE,

  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- A word pending approval must not simultaneously be active
  CONSTRAINT pending_words_not_active
    CHECK (NOT (is_pending_approval = TRUE AND is_active = TRUE))
);

CREATE OR REPLACE TRIGGER trg_words_updated_at
  BEFORE UPDATE ON public.words
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.words ENABLE ROW LEVEL SECURITY;


-- ================================================================
-- §4  TABLE: reviews
-- ================================================================
-- One row per individual card review.
-- Append-only: no UPDATE or DELETE policies are defined.

CREATE TABLE IF NOT EXISTS public.reviews (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  word_id         UUID        NOT NULL REFERENCES public.words(id)    ON DELETE CASCADE,
  student_id      UUID        NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  result          TEXT        NOT NULL CHECK (result IN ('forgot', 'almost', 'knew')),
  strength_before INTEGER     NOT NULL DEFAULT 0 CHECK (strength_before BETWEEN 0 AND 5),
  strength_after  INTEGER     NOT NULL DEFAULT 0 CHECK (strength_after  BETWEEN 0 AND 5),
  reviewed_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  next_review_at  TIMESTAMPTZ           -- NULL until a scheduling algorithm is wired up
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;


-- ================================================================
-- §5  TABLE: weekly_focus
-- ================================================================
-- Dor marks words as lesson focus for a given week.

CREATE TABLE IF NOT EXISTS public.weekly_focus (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id      UUID        NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  word_id         UUID        NOT NULL REFERENCES public.words(id)    ON DELETE CASCADE,
  week_start_date DATE        NOT NULL,
  created_by      UUID        NOT NULL REFERENCES public.profiles(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (student_id, word_id, week_start_date)
);

ALTER TABLE public.weekly_focus ENABLE ROW LEVEL SECURITY;


-- ================================================================
-- §6  TABLE: teacher_notes
-- ================================================================
-- Private notes Dor keeps about Larry's learning.
-- Completely hidden from students via RLS.

CREATE TABLE IF NOT EXISTS public.teacher_notes (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id  UUID        NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  created_by  UUID        NOT NULL REFERENCES public.profiles(id),
  note        TEXT        NOT NULL CHECK (char_length(note) > 0),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.teacher_notes ENABLE ROW LEVEL SECURITY;


-- ================================================================
-- §7  HELPER FUNCTIONS  (defined AFTER the tables they query)
-- ================================================================
-- LANGUAGE SQL functions are validated at creation time in PostgreSQL,
-- so they must come after the tables they reference.
--
-- SECURITY DEFINER: the function runs as its owner (postgres), bypassing
-- RLS on the inner query.  This is intentional — it lets the function
-- read the current user's own row without being blocked by the very
-- policy it is helping to evaluate.
--
-- SET search_path = public: prevents search-path injection attacks.

-- Returns the current user's role ('teacher' | 'student' | NULL).
CREATE OR REPLACE FUNCTION public.my_role()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$;

-- Returns students.id for the signed-in student (NULL for teachers).
CREATE OR REPLACE FUNCTION public.my_student_id()
RETURNS UUID
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT id FROM public.students WHERE profile_id = auth.uid()
$$;


-- ================================================================
-- §8  INDEXES
-- ================================================================

CREATE INDEX IF NOT EXISTS idx_profiles_role
  ON public.profiles (role);

CREATE INDEX IF NOT EXISTS idx_students_profile_id
  ON public.students (profile_id);

CREATE INDEX IF NOT EXISTS idx_students_teacher_id
  ON public.students (teacher_id);

CREATE INDEX IF NOT EXISTS idx_words_student_id
  ON public.words (student_id);

CREATE INDEX IF NOT EXISTS idx_words_status
  ON public.words (status)
  WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_words_pending
  ON public.words (student_id, is_pending_approval)
  WHERE is_pending_approval = TRUE;

CREATE INDEX IF NOT EXISTS idx_words_category
  ON public.words (category)
  WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_reviews_student_id
  ON public.reviews (student_id);

CREATE INDEX IF NOT EXISTS idx_reviews_word_id
  ON public.reviews (word_id);

CREATE INDEX IF NOT EXISTS idx_reviews_reviewed_at
  ON public.reviews (student_id, reviewed_at DESC);

CREATE INDEX IF NOT EXISTS idx_reviews_next_review
  ON public.reviews (student_id, next_review_at)
  WHERE next_review_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_words_next_review
  ON public.words (next_review_at)
  WHERE is_active = TRUE AND next_review_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_weekly_focus_student_week
  ON public.weekly_focus (student_id, week_start_date DESC);

CREATE INDEX IF NOT EXISTS idx_teacher_notes_student_id
  ON public.teacher_notes (student_id, created_at DESC);


-- ================================================================
-- §9  ROW-LEVEL SECURITY POLICIES
-- ================================================================
--
-- Principles
-- ──────────
-- • No policy grants access to ALL authenticated users.
-- • Every policy is tied to the current user's role or ownership.
-- • Students cannot see other students' data.
-- • Students cannot see teacher_notes at all.
-- • Students can only INSERT pending word suggestions; they cannot
--   edit teacher-approved words.
-- • Reviews are append-only.
-- • Unauthenticated / anonymous: always denied (no policy fires).


-- ── profiles ─────────────────────────────────────────────────────

CREATE POLICY "profiles: read own"
  ON public.profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "profiles: update own"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    -- Prevent self-promotion: role must stay the same
    AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
  );

-- Teacher can read the profiles of students assigned to them.
CREATE POLICY "profiles: teacher reads own students"
  ON public.profiles FOR SELECT
  USING (
    public.my_role() = 'teacher'
    AND EXISTS (
      SELECT 1 FROM public.students s
      WHERE s.profile_id = profiles.id
        AND s.teacher_id = auth.uid()
    )
  );

-- INSERT: handled by the handle_new_user trigger — no client policy needed.
-- DELETE: no policy → denied for all clients.


-- ── students ─────────────────────────────────────────────────────

CREATE POLICY "students: student reads own"
  ON public.students FOR SELECT
  USING (profile_id = auth.uid());

CREATE POLICY "students: student updates own preferences"
  ON public.students FOR UPDATE
  USING (profile_id = auth.uid())
  WITH CHECK (
    profile_id = auth.uid()
    -- Student cannot reassign themselves to a different teacher
    AND teacher_id = (SELECT teacher_id FROM public.students WHERE profile_id = auth.uid())
  );

CREATE POLICY "students: teacher manages own students"
  ON public.students FOR ALL
  USING  (teacher_id = auth.uid())
  WITH CHECK (teacher_id = auth.uid());


-- ── words ────────────────────────────────────────────────────────

-- Student reads all of their own words (active + pending suggestions).
CREATE POLICY "words: student reads own"
  ON public.words FOR SELECT
  USING (student_id = public.my_student_id());

-- Student can only insert a word flagged as a pending suggestion.
CREATE POLICY "words: student suggests word"
  ON public.words FOR INSERT
  WITH CHECK (
    student_id           = public.my_student_id()
    AND created_by       = auth.uid()
    AND is_pending_approval  = TRUE
    AND submitted_by_student = TRUE
    AND is_active            = FALSE
  );

-- Student may NOT update or delete words (no policy → denied).

-- Teacher has full access to words belonging to their students.
CREATE POLICY "words: teacher manages own student words"
  ON public.words FOR ALL
  USING (
    public.my_role() = 'teacher'
    AND EXISTS (
      SELECT 1 FROM public.students s
      WHERE s.id = words.student_id
        AND s.teacher_id = auth.uid()
    )
  )
  WITH CHECK (
    public.my_role() = 'teacher'
    AND EXISTS (
      SELECT 1 FROM public.students s
      WHERE s.id = words.student_id
        AND s.teacher_id = auth.uid()
    )
  );


-- ── reviews ──────────────────────────────────────────────────────

CREATE POLICY "reviews: student reads own"
  ON public.reviews FOR SELECT
  USING (student_id = public.my_student_id());

-- Append-only for students — no UPDATE or DELETE policy.
CREATE POLICY "reviews: student inserts own"
  ON public.reviews FOR INSERT
  WITH CHECK (student_id = public.my_student_id());

CREATE POLICY "reviews: teacher reads own student reviews"
  ON public.reviews FOR SELECT
  USING (
    public.my_role() = 'teacher'
    AND EXISTS (
      SELECT 1 FROM public.students s
      WHERE s.id = reviews.student_id
        AND s.teacher_id = auth.uid()
    )
  );


-- ── weekly_focus ─────────────────────────────────────────────────

CREATE POLICY "weekly_focus: student reads own"
  ON public.weekly_focus FOR SELECT
  USING (student_id = public.my_student_id());

CREATE POLICY "weekly_focus: teacher manages own"
  ON public.weekly_focus FOR ALL
  USING (
    public.my_role() = 'teacher'
    AND EXISTS (
      SELECT 1 FROM public.students s
      WHERE s.id = weekly_focus.student_id
        AND s.teacher_id = auth.uid()
    )
  )
  WITH CHECK (
    public.my_role() = 'teacher'
    AND EXISTS (
      SELECT 1 FROM public.students s
      WHERE s.id = weekly_focus.student_id
        AND s.teacher_id = auth.uid()
    )
    AND created_by = auth.uid()
  );


-- ── teacher_notes ────────────────────────────────────────────────
-- No student policy at all → students are denied at every operation.

CREATE POLICY "teacher_notes: teacher manages own notes"
  ON public.teacher_notes FOR ALL
  USING (
    public.my_role() = 'teacher'
    AND created_by = auth.uid()
  )
  WITH CHECK (
    public.my_role() = 'teacher'
    AND created_by = auth.uid()
  );


-- ================================================================
-- §10  AUTH TRIGGER: auto-create profile on sign-up
-- ================================================================
-- Fires after every INSERT on auth.users.
-- Reads raw_user_meta_data.role; sanitised so only 'teacher' or
-- 'student' are accepted — anything else silently becomes 'student'.
--
-- Supply metadata when creating users:
--   Dashboard → Authentication → Users → Add user
--   User metadata JSON: { "role": "teacher", "full_name": "Dor" }
--
--   Or via Admin SDK:
--   supabase.auth.admin.createUser({
--     email: '...', password: '...',
--     user_metadata: { role: 'teacher', full_name: 'Dor' },
--   })

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _role TEXT;
BEGIN
  _role := CASE
    WHEN NEW.raw_user_meta_data->>'role' IN ('teacher', 'student')
      THEN NEW.raw_user_meta_data->>'role'
    ELSE 'student'
  END;

  INSERT INTO public.profiles (id, role, full_name, email)
  VALUES (
    NEW.id,
    _role,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.email, '')
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ================================================================
-- §11  STORAGE BUCKET (run separately in Supabase Dashboard)
-- ================================================================
--
-- Supabase Storage cannot be configured via SQL alone.
-- After running this schema, set up the bucket manually:
--
--  1. Supabase Dashboard → Storage → New bucket
--     Name:   word-media
--     Public: YES  (files are served via public URL)
--
--  2. Add these RLS policies on the bucket
--     (Storage → word-media → Policies → New policy):
--
--  INSERT policy  (teachers can upload)
--  ┌──────────────────────────────────────────────┐
--  │ name: "Teachers can upload word media"       │
--  │ allowed operation: INSERT                    │
--  │ target roles: authenticated                  │
--  │ USING expression:                            │
--  │   public.my_role() = 'teacher'               │
--  └──────────────────────────────────────────────┘
--
--  SELECT policy  (everyone can read public URLs)
--  ┌──────────────────────────────────────────────┐
--  │ name: "Public read word media"               │
--  │ allowed operation: SELECT                    │
--  │ target roles: public                         │
--  │ USING expression: true                       │
--  └──────────────────────────────────────────────┘
--
--  DELETE policy  (teachers can delete their uploads)
--  ┌──────────────────────────────────────────────┐
--  │ name: "Teachers can delete word media"       │
--  │ allowed operation: DELETE                    │
--  │ target roles: authenticated                  │
--  │ USING expression:                            │
--  │   public.my_role() = 'teacher'               │
--  └──────────────────────────────────────────────┘
--
-- ================================================================
-- §12  IF YOU ALREADY RAN THE SCHEMA (migration-only additions)
-- ================================================================
-- Run only if upgrading an existing database — these columns may
-- not exist yet.  Idempotent; safe to run multiple times.

ALTER TABLE public.words
  ADD COLUMN IF NOT EXISTS difficulty        TEXT NOT NULL DEFAULT 'medium'
    CHECK (difficulty IN ('easy', 'medium', 'hard')),
  ADD COLUMN IF NOT EXISTS audio_example_url TEXT,
  ADD COLUMN IF NOT EXISTS image_url         TEXT,
  ADD COLUMN IF NOT EXISTS last_reviewed     TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS next_review_at    TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_words_next_review
  ON public.words (next_review_at)
  WHERE is_active = TRUE AND next_review_at IS NOT NULL;
