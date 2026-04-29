-- ================================================================
-- LARRY'S HEBREW FLASHCARDS — OPTIONAL SEED DATA
-- ================================================================
--
-- PURPOSE
-- ───────
-- This file shows how to populate the database after schema.sql
-- has been applied.  It is NOT part of the core schema.
-- Run it only when you want sample / demo data.
--
-- WHERE TO RUN
-- ────────────
-- Supabase Dashboard → SQL Editor → New query
-- Paste this file, fill in the UUIDs in the block below, click Run.
--
-- ────────────────────────────────────────────────────────────────
-- IMPORTANT: CREATE AUTH USERS FIRST
-- ────────────────────────────────────────────────────────────────
-- profiles rows are created automatically by the handle_new_user
-- trigger when an Auth user is registered.  You cannot insert
-- profiles directly without a matching auth.users row.
--
-- Step A — Create Dor (teacher) in Supabase Dashboard
--   Authentication → Users → Add user → Create new user
--   Email:     dor@example.com
--   Password:  (choose something strong)
--   User metadata JSON:
--     { "role": "teacher", "full_name": "Dor" }
--
-- Step B — Create Larry (student)
--   Same flow, metadata:
--     { "role": "student", "full_name": "Larry" }
--
-- Step C — Copy both UIDs from Authentication → Users (the "UID" column)
--   Paste them into the two variables below.
--
-- ================================================================
-- ⚠  REPLACE THESE TWO PLACEHOLDER UUIDs BEFORE RUNNING  ⚠
-- ================================================================

DO $$
DECLARE
  -- ┌─────────────────────────────────────────────────────────┐
  -- │  Paste the real Auth UIDs here                          │
  -- └─────────────────────────────────────────────────────────┘
  dor_user_id   UUID := '00000000-0000-0000-0000-000000000001';  -- ← Dor's UID
  larry_user_id UUID := '00000000-0000-0000-0000-000000000002';  -- ← Larry's UID

  larry_student_id UUID;

BEGIN

  -- ============================================================
  -- 1. Create Larry's student record
  --    Profiles for both users already exist (trigger created them).
  --    We just need to create the students row and link it to Dor.
  -- ============================================================
  INSERT INTO public.students (
    id, profile_id, display_name, teacher_id,
    notes, text_size_preference
  )
  VALUES (
    gen_random_uuid(),
    larry_user_id,
    'Larry',
    dor_user_id,
    'Larry is a motivated student in his 70s. Prefers larger text and real-world stories over grammar rules.',
    'large'
  )
  ON CONFLICT (profile_id) DO NOTHING
  RETURNING id INTO larry_student_id;

  -- If already existed (re-run), look it up
  IF larry_student_id IS NULL THEN
    SELECT id INTO larry_student_id
    FROM public.students
    WHERE profile_id = larry_user_id;
  END IF;

  -- ============================================================
  -- 2. Vocabulary words (14 words, 5 categories)
  -- ============================================================
  INSERT INTO public.words (
    student_id, created_by,
    hebrew, hebrew_niqqud, transliteration, meaning_en,
    example_he, example_en,
    category, tags, teacher_notes,
    status, current_strength,
    is_active, is_pending_approval, submitted_by_student
  ) VALUES

  -- Greetings ──────────────────────────────────────────────────

  ( larry_student_id, dor_user_id,
    'שלום', 'שָׁלוֹם', 'shalom', 'hello / peace / goodbye',
    'שָׁלוֹם, מַה שְּׁלוֹמְךָ?', 'Hello, how are you?',
    'Greetings', ARRAY['essential','greeting'],
    'Used for hello AND goodbye — it means peace. One of Larry''s favourite words.',
    'mastered', 5, TRUE, FALSE, FALSE ),

  ( larry_student_id, dor_user_id,
    'תודה', 'תּוֹדָה', 'toda', 'thank you',
    'תּוֹדָה רַבָּה!', 'Thank you very much!',
    'Greetings', ARRAY['essential','polite'],
    'Toda raba = thank you very much. Larry uses this after every lesson.',
    'mastered', 5, TRUE, FALSE, FALSE ),

  ( larry_student_id, dor_user_id,
    'בוקר טוב', 'בֹּקֶר טוֹב', 'boker tov', 'good morning',
    'בֹּקֶר טוֹב! אֵיךְ אַתָּה?', 'Good morning! How are you?',
    'Greetings', ARRAY['greeting','time-of-day'],
    'The response is "boker or" — morning light.',
    'strong', 4, TRUE, FALSE, FALSE ),

  ( larry_student_id, dor_user_id,
    'ערב טוב', 'עֶרֶב טוֹב', 'erev tov', 'good evening',
    'עֶרֶב טוֹב, נָעִים מְאוֹד.', 'Good evening, very nice to meet you.',
    'Greetings', ARRAY['greeting','time-of-day'],
    NULL,
    'practicing', 2, TRUE, FALSE, FALSE ),

  -- Food & Drink ───────────────────────────────────────────────

  ( larry_student_id, dor_user_id,
    'מים', 'מַיִם', 'mayim', 'water',
    'אֲנִי רוֹצֶה מַיִם, בְּבַקָּשָׁה.', 'I would like water, please.',
    'Food & Drink', ARRAY['essential','noun'],
    'Mayim appears in many Hebrew songs. A great word to remember.',
    'strong', 4, TRUE, FALSE, FALSE ),

  ( larry_student_id, dor_user_id,
    'לחם', 'לֶחֶם', 'lechem', 'bread',
    'הַלֶּחֶם טָעִים מְאוֹד.', 'The bread is very tasty.',
    'Food & Drink', ARRAY['food','noun'],
    'Bethlehem = Beth Lechem = house of bread. Great memory hook.',
    'practicing', 3, TRUE, FALSE, FALSE ),

  ( larry_student_id, dor_user_id,
    'קפה', 'קָפֶה', 'kafe', 'coffee',
    'אֲנִי שׁוֹתֶה קָפֶה בַּבֹּקֶר.', 'I drink coffee in the morning.',
    'Food & Drink', ARRAY['drink','daily-life'],
    NULL,
    'new', 1, TRUE, FALSE, FALSE ),

  -- Daily Life ─────────────────────────────────────────────────

  ( larry_student_id, dor_user_id,
    'בית', 'בַּיִת', 'bayit', 'house / home',
    'אֲנִי בַּבַּיִת.', 'I am at home.',
    'Daily life', ARRAY['noun','essential'],
    'Appears in compound words: bet knesset (synagogue), bet sefer (school).',
    'strong', 4, TRUE, FALSE, FALSE ),

  ( larry_student_id, dor_user_id,
    'ספר', 'סֵפֶר', 'sefer', 'book',
    'אֲנִי קוֹרֵא סֵפֶר.', 'I am reading a book.',
    'Daily life', ARRAY['noun','culture'],
    'Same root as sofer (scribe) and mispar (number).',
    'practicing', 2, TRUE, FALSE, FALSE ),

  ( larry_student_id, dor_user_id,
    'יום', 'יוֹם', 'yom', 'day',
    'יוֹם טוֹב!', 'Good day! / Happy holiday!',
    'Daily life', ARRAY['time','essential'],
    'Yom Kippur = Day of Atonement. Yom tov = good day, also used for Jewish holidays.',
    'practicing', 3, TRUE, FALSE, FALSE ),

  -- Useful Phrases ─────────────────────────────────────────────

  ( larry_student_id, dor_user_id,
    'בבקשה', 'בְּבַקָּשָׁה', 'bevakasha', 'please / here you go',
    'מַיִם, בְּבַקָּשָׁה.', 'Water, please.',
    'Useful phrases', ARRAY['essential','polite'],
    'Also means "here you are" when handing something over.',
    'strong', 4, TRUE, FALSE, FALSE ),

  ( larry_student_id, dor_user_id,
    'סליחה', 'סְלִיחָה', 'slicha', 'excuse me / sorry',
    'סְלִיחָה, אֵיפֹה הַתַּחֲנָה?', 'Excuse me, where is the station?',
    'Useful phrases', ARRAY['essential','polite'],
    'Same root as forgiveness (mechila). Works for both "excuse me" and "I''m sorry".',
    'new', 1, TRUE, FALSE, FALSE ),

  -- Verbs ──────────────────────────────────────────────────────

  ( larry_student_id, dor_user_id,
    'אני אוהב', 'אֲנִי אוֹהֵב', 'ani ohev', 'I love (masc.)',
    'אֲנִי אוֹהֵב לִלְמוֹד עִבְרִית.', 'I love learning Hebrew.',
    'Verbs', ARRAY['verb','emotion'],
    'Ohev (masc.) / ohevet (fem.). Larry should use ohev.',
    'practicing', 2, TRUE, FALSE, FALSE ),

  ( larry_student_id, dor_user_id,
    'ללמוד', 'לִלְמוֹד', 'lilmod', 'to learn / to study',
    'אֲנִי רוֹצֶה לִלְמוֹד עִבְרִית.', 'I want to learn Hebrew.',
    'Verbs', ARRAY['verb','essential'],
    'Root ל-מ-ד gives us limud (study), talmid (student), Talmud.',
    'new', 0, TRUE, FALSE, FALSE );

  -- ============================================================
  -- 3. Sample pending word (submitted by Larry)
  -- ============================================================
  INSERT INTO public.words (
    student_id, created_by,
    hebrew, hebrew_niqqud, transliteration, meaning_en,
    category, tags, teacher_notes, status, current_strength,
    is_active, is_pending_approval, submitted_by_student
  ) VALUES (
    larry_student_id, larry_user_id,
    'חוצפה', 'חֻצְפָּה', 'chutzpah', 'nerve / audacity',
    'Useful phrases', ARRAY[]::TEXT[], NULL,
    'new', 0,
    FALSE,   -- not active until Dor approves
    TRUE,    -- pending Dor's review
    TRUE     -- came from Larry
  );

  -- ============================================================
  -- 4. Sample reviews (simulated past practice sessions)
  -- ============================================================
  INSERT INTO public.reviews (
    word_id, student_id,
    result, strength_before, strength_after,
    reviewed_at
  )
  SELECT
    w.id,
    larry_student_id,
    (ARRAY['forgot','almost','knew'])[1 + floor(random() * 3)::int],
    GREATEST(0, w.current_strength - 1),
    w.current_strength,
    NOW() - (random() * INTERVAL '30 days')
  FROM public.words w
  WHERE w.student_id = larry_student_id
    AND w.is_active = TRUE
  LIMIT 12;

  -- ============================================================
  -- 5. Weekly focus (Dor's lesson plan for this week)
  -- ============================================================
  INSERT INTO public.weekly_focus (
    student_id, word_id, week_start_date, created_by
  )
  SELECT
    larry_student_id,
    w.id,
    date_trunc('week', CURRENT_DATE)::date,   -- Monday of current week
    dor_user_id
  FROM public.words w
  WHERE w.student_id = larry_student_id
    AND w.status IN ('new', 'practicing')
    AND w.is_active = TRUE
  ORDER BY w.current_strength ASC
  LIMIT 5
  ON CONFLICT (student_id, word_id, week_start_date) DO NOTHING;

  -- ============================================================
  -- 6. Private teacher note (invisible to Larry)
  -- ============================================================
  INSERT INTO public.teacher_notes (student_id, created_by, note)
  VALUES (
    larry_student_id,
    dor_user_id,
    'Larry is progressing well on greetings. He struggles with verb conjugations — focus on ohev / rotzeh next session. Prefers visual examples and stories over grammar rules.'
  );

  RAISE NOTICE 'Seed complete. larry_student_id = %', larry_student_id;

END;
$$;
