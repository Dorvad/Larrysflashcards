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
--  §0   Prerequisites (uuid, triggers)
--  §1   Helper functions (used by RLS policies)
--  §2   Table: profiles
--  §3   Table: students
--  §4   Table: words
--  §5   Table: reviews
--  §6   Table: weekly_focus
--  §7   Table: teacher_notes
--  §8   Indexes
--  §9   Row-Level Security policies (all tables)
--  §10  Auth trigger: auto-create profile on sign-up
--
-- ================================================================


-- ================================================================
-- §0  PREREQUISITES
-- ================================================================

-- gen_random_uuid() is built into PostgreSQL 13+.
-- uuid-ossp is not required.

-- updated_at trigger function: called by every table that has
-- an updated_at column.  Defined once, reused everywhere.
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
-- §1  HELPER FUNCTIONS
-- ================================================================
-- These functions run with SECURITY DEFINER so they can read
-- the underlying tables without being blocked by RLS themselves.
-- SET search_path = public prevents search-path injection.
-- They are called inside RLS policy USING / WITH CHECK clauses.

-- Returns the current user's role ('teacher' | 'student' | NULL).
-- Returns NULL if the user has no profile yet.
CREATE OR REPLACE FUNCTION public.my_role()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$;

-- Returns the students.id for the currently signed-in student.
-- Returns NULL if the user is a teacher or has no student record.
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
-- §2  TABLE: profiles
-- ================================================================
-- One row per Supabase Auth user.
-- Created automatically by the handle_new_user trigger (see §10).
-- The role is set from user_metadata.role at sign-up.

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
-- §3  TABLE: students
-- ================================================================
-- One row per student user.
-- Created by the teacher after the student's first sign-in.
-- teacher_id links the student to their teacher's profile.

CREATE TABLE IF NOT EXISTS public.students (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id           UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  display_name         TEXT,
  teacher_id           UUID        NOT NULL REFERENCES public.profiles(id),
  notes                TEXT,                 -- teacher's private notes about this student
  text_size_preference TEXT        NOT NULL DEFAULT 'default'
                         CHECK (text_size_preference IN ('small', 'default', 'large', 'x-large')),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Each Auth user can be a student only once
  UNIQUE (profile_id)
);

CREATE OR REPLACE TRIGGER trg_students_updated_at
  BEFORE UPDATE ON public.students
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;


-- ================================================================
-- §4  TABLE: words
-- ================================================================
-- One row per vocabulary word assigned to a student.
--
-- Lifecycle:
--   • Teacher adds a word → is_pending_approval = FALSE,
--     submitted_by_student = FALSE, is_active = TRUE
--   • Student suggests a word → is_pending_approval = TRUE,
--     submitted_by_student = TRUE, is_active = FALSE
--   • Teacher approves suggestion → is_pending_approval = FALSE,
--     is_active = TRUE  (teacher updates the row)
--   • Teacher declines suggestion → is_active stays FALSE,
--     or the row is deleted

CREATE TABLE IF NOT EXISTS public.words (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id           UUID        NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  created_by           UUID        NOT NULL REFERENCES public.profiles(id),

  -- Hebrew content
  hebrew               TEXT        NOT NULL,          -- plain Hebrew without niqqud
  hebrew_niqqud        TEXT,                          -- with vowel marks (niqqud)
  transliteration      TEXT,
  meaning_en           TEXT        NOT NULL,
  example_he           TEXT,
  example_en           TEXT,

  -- Organisation
  category             TEXT,
  tags                 TEXT[]      NOT NULL DEFAULT '{}',

  -- Dor's guidance for Larry (shown on card)
  teacher_notes        TEXT,

  -- Audio
  audio_url            TEXT,

  -- Learning state
  status               TEXT        NOT NULL DEFAULT 'new'
                         CHECK (status IN ('new', 'practicing', 'strong', 'mastered')),
  current_strength     INTEGER     NOT NULL DEFAULT 0
                         CHECK (current_strength BETWEEN 0 AND 5),

  -- Visibility / approval
  is_active            BOOLEAN     NOT NULL DEFAULT TRUE,
  is_pending_approval  BOOLEAN     NOT NULL DEFAULT FALSE,
  submitted_by_student BOOLEAN     NOT NULL DEFAULT FALSE,

  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- A word pending approval must not be marked active yet
  CONSTRAINT pending_words_not_active
    CHECK (NOT (is_pending_approval = TRUE AND is_active = TRUE))
);

CREATE OR REPLACE TRIGGER trg_words_updated_at
  BEFORE UPDATE ON public.words
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.words ENABLE ROW LEVEL SECURITY;


-- ================================================================
-- §5  TABLE: reviews
-- ================================================================
-- One row per individual card review in a practice session.
-- Reviews are append-only; nobody may update or delete them.
-- The strength algorithm updates words.current_strength separately.

CREATE TABLE IF NOT EXISTS public.reviews (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  word_id         UUID        NOT NULL REFERENCES public.words(id) ON DELETE CASCADE,
  student_id      UUID        NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  result          TEXT        NOT NULL CHECK (result IN ('forgot', 'almost', 'knew')),
  strength_before INTEGER     NOT NULL DEFAULT 0
                    CHECK (strength_before BETWEEN 0 AND 5),
  strength_after  INTEGER     NOT NULL DEFAULT 0
                    CHECK (strength_after BETWEEN 0 AND 5),
  reviewed_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  next_review_at  TIMESTAMPTZ          -- NULL until a scheduling algorithm is added
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;


-- ================================================================
-- §6  TABLE: weekly_focus
-- ================================================================
-- Dor marks specific words as the lesson focus for a given week.
-- Unique per (student, word, week_start_date) so Dor can re-add
-- a word in a different week without conflict.

CREATE TABLE IF NOT EXISTS public.weekly_focus (
  id              UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id      UUID    NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  word_id         UUID    NOT NULL REFERENCES public.words(id)    ON DELETE CASCADE,
  week_start_date DATE    NOT NULL,                   -- always a Monday
  created_by      UUID    NOT NULL REFERENCES public.profiles(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (student_id, word_id, week_start_date)
);

ALTER TABLE public.weekly_focus ENABLE ROW LEVEL SECURITY;


-- ================================================================
-- §7  TABLE: teacher_notes
-- ================================================================
-- Private notes Dor keeps about Larry's learning.
-- Completely hidden from students via RLS.

CREATE TABLE IF NOT EXISTS public.teacher_notes (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id  UUID        NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  created_by  UUID        NOT NULL REFERENCES public.profiles(id),
  note        TEXT        NOT NULL CHECK (char_length(note) > 0),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
  -- No updated_at: notes are immutable; create a new one to amend.
);

ALTER TABLE public.teacher_notes ENABLE ROW LEVEL SECURITY;


-- ================================================================
-- §8  INDEXES
-- ================================================================

-- profiles
CREATE INDEX IF NOT EXISTS idx_profiles_role
  ON public.profiles (role);

-- students
CREATE INDEX IF NOT EXISTS idx_students_profile_id
  ON public.students (profile_id);

CREATE INDEX IF NOT EXISTS idx_students_teacher_id
  ON public.students (teacher_id);

-- words
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

-- reviews
CREATE INDEX IF NOT EXISTS idx_reviews_student_id
  ON public.reviews (student_id);

CREATE INDEX IF NOT EXISTS idx_reviews_word_id
  ON public.reviews (word_id);

CREATE INDEX IF NOT EXISTS idx_reviews_reviewed_at
  ON public.reviews (student_id, reviewed_at DESC);

-- reviews: future spaced-repetition scheduling
CREATE INDEX IF NOT EXISTS idx_reviews_next_review
  ON public.reviews (student_id, next_review_at)
  WHERE next_review_at IS NOT NULL;

-- weekly_focus
CREATE INDEX IF NOT EXISTS idx_weekly_focus_student_week
  ON public.weekly_focus (student_id, week_start_date DESC);

-- teacher_notes
CREATE INDEX IF NOT EXISTS idx_teacher_notes_student_id
  ON public.teacher_notes (student_id, created_at DESC);


-- ================================================================
-- §9  ROW-LEVEL SECURITY POLICIES
-- ================================================================
--
-- Guiding principles
-- ──────────────────
-- • No policy grants access to ALL authenticated users.
-- • Every policy is tied to the current user's role or ownership.
-- • Students cannot see other students' data.
-- • Students cannot see teacher_notes at all.
-- • Students can only SUGGEST words (pending approval);
--   they cannot edit teacher-approved words.
-- • Reviews are append-only for students.
-- • Anonymous / unauthenticated access: always denied (no policy
--   fires for anon users, so the default DENY applies).


-- ── §9.1  profiles ───────────────────────────────────────────────

-- Every user can read and update their own profile.
CREATE POLICY "profiles: read own"
  ON public.profiles
  FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "profiles: update own"
  ON public.profiles
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    -- Prevent a user from promoting themselves to teacher
    AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
  );

-- Teacher can read profiles of students assigned to them.
CREATE POLICY "profiles: teacher reads own students"
  ON public.profiles
  FOR SELECT
  USING (
    public.my_role() = 'teacher'
    AND EXISTS (
      SELECT 1 FROM public.students s
      WHERE s.profile_id = profiles.id
        AND s.teacher_id = auth.uid()
    )
  );

-- INSERT: handled entirely by the handle_new_user trigger (§10).
-- No client INSERT policy is defined → clients cannot insert directly.

-- DELETE: no policy → denied for all clients.


-- ── §9.2  students ───────────────────────────────────────────────

-- Student reads their own student record.
CREATE POLICY "students: student reads own"
  ON public.students
  FOR SELECT
  USING (profile_id = auth.uid());

-- Student can update only their own display preferences.
-- (Column-level enforcement belongs in the application layer.)
CREATE POLICY "students: student updates own preferences"
  ON public.students
  FOR UPDATE
  USING (profile_id = auth.uid())
  WITH CHECK (
    profile_id = auth.uid()
    -- Prevent the student from changing their assigned teacher
    AND teacher_id = (SELECT teacher_id FROM public.students WHERE profile_id = auth.uid())
  );

-- Teacher has full access to student records they own.
CREATE POLICY "students: teacher manages own students"
  ON public.students
  FOR ALL
  USING  (teacher_id = auth.uid())
  WITH CHECK (teacher_id = auth.uid());


-- ── §9.3  words ──────────────────────────────────────────────────

-- Student reads their own active words (includes pending suggestions).
CREATE POLICY "words: student reads own"
  ON public.words
  FOR SELECT
  USING (student_id = public.my_student_id());

-- Student can suggest a new word (insert only when correctly flagged).
CREATE POLICY "words: student suggests word"
  ON public.words
  FOR INSERT
  WITH CHECK (
    student_id           = public.my_student_id()
    AND created_by       = auth.uid()
    AND is_pending_approval  = TRUE
    AND submitted_by_student = TRUE
    AND is_active            = FALSE
  );

-- Student may NOT update or delete words.
-- (No student UPDATE or DELETE policy → denied by default.)

-- Teacher has full access to words belonging to their students.
CREATE POLICY "words: teacher manages own student words"
  ON public.words
  FOR ALL
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


-- ── §9.4  reviews ────────────────────────────────────────────────

-- Student reads their own reviews.
CREATE POLICY "reviews: student reads own"
  ON public.reviews
  FOR SELECT
  USING (student_id = public.my_student_id());

-- Student inserts their own reviews (append-only; no UPDATE/DELETE).
CREATE POLICY "reviews: student inserts own"
  ON public.reviews
  FOR INSERT
  WITH CHECK (student_id = public.my_student_id());

-- Teacher reads reviews for their students.
CREATE POLICY "reviews: teacher reads own student reviews"
  ON public.reviews
  FOR SELECT
  USING (
    public.my_role() = 'teacher'
    AND EXISTS (
      SELECT 1 FROM public.students s
      WHERE s.id = reviews.student_id
        AND s.teacher_id = auth.uid()
    )
  );

-- No UPDATE or DELETE policy for reviews → immutable for everyone.


-- ── §9.5  weekly_focus ───────────────────────────────────────────

-- Student reads their own weekly focus words.
CREATE POLICY "weekly_focus: student reads own"
  ON public.weekly_focus
  FOR SELECT
  USING (student_id = public.my_student_id());

-- Teacher has full control over weekly focus for their students.
CREATE POLICY "weekly_focus: teacher manages own"
  ON public.weekly_focus
  FOR ALL
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


-- ── §9.6  teacher_notes ──────────────────────────────────────────
-- Completely hidden from students.
-- Teacher can only see notes they themselves created.

CREATE POLICY "teacher_notes: teacher manages own notes"
  ON public.teacher_notes
  FOR ALL
  USING (
    public.my_role() = 'teacher'
    AND created_by = auth.uid()
  )
  WITH CHECK (
    public.my_role() = 'teacher'
    AND created_by = auth.uid()
  );

-- No student policy → students cannot SELECT, INSERT, UPDATE, or DELETE.


-- ================================================================
-- §10  AUTH TRIGGER: auto-create profile on sign-up
-- ================================================================
-- When a user signs up, Supabase fires this trigger.
-- The function reads raw_user_meta_data, which you supply when
-- creating users via the Supabase Dashboard or the admin SDK:
--
--   supabase.auth.admin.createUser({
--     email: '...',
--     password: '...',
--     user_metadata: { role: 'teacher', full_name: 'Dor' }
--   })
--
-- Valid roles: 'teacher' | 'student'
-- If role is absent or invalid it defaults to 'student' (safe default).

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _role TEXT;
BEGIN
  -- Sanitise: only allow known roles; anything else defaults to student
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
  ON CONFLICT (id) DO NOTHING;   -- idempotent: safe to re-run

  RETURN NEW;
END;
$$;

-- Drop and recreate so re-running the script is safe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
