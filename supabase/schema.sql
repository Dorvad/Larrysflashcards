-- Larry's Flashcards — Supabase schema
-- Run this in the Supabase SQL editor to initialize the database.

-- ─────────────────────────────────────────────
-- Extensions
-- ─────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────────
-- Profiles (one row per authenticated user)
-- ─────────────────────────────────────────────
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  role        text not null check (role in ('student', 'teacher')),
  display_name text not null,
  created_at  timestamptz default now()
);

-- Automatically create a profile on sign-up via auth trigger
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, role, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'student'),
    coalesce(new.raw_user_meta_data->>'display_name', new.email)
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─────────────────────────────────────────────
-- Word sets (lessons / categories)
-- ─────────────────────────────────────────────
create table public.word_sets (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  description text,
  color       text default '#1a6fd4',  -- display colour for the card set
  sort_order  integer default 0,
  created_by  uuid references public.profiles(id),
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ─────────────────────────────────────────────
-- Words
-- ─────────────────────────────────────────────
create table public.words (
  id              uuid primary key default uuid_generate_v4(),
  word_set_id     uuid references public.word_sets(id) on delete set null,
  hebrew          text not null,          -- e.g. שָׁלוֹם
  transliteration text,                   -- e.g. shalom  (optional, Dor controls)
  english         text not null,          -- e.g. peace / hello
  notes           text,                   -- extra context from Dor
  audio_url       text,                   -- optional pronunciation clip
  image_url       text,                   -- optional visual cue
  sort_order      integer default 0,
  is_active       boolean default true,
  created_by      uuid references public.profiles(id),
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ─────────────────────────────────────────────
-- Practice sessions
-- ─────────────────────────────────────────────
create table public.practice_sessions (
  id              uuid primary key default uuid_generate_v4(),
  student_id      uuid references public.profiles(id) on delete cascade,
  word_set_id     uuid references public.word_sets(id) on delete set null,
  mode            text not null check (mode in ('hebrew_to_english', 'english_to_hebrew', 'mixed')),
  started_at      timestamptz default now(),
  completed_at    timestamptz,
  total_cards     integer default 0,
  correct_count   integer default 0,
  skipped_count   integer default 0
);

-- ─────────────────────────────────────────────
-- Per-card results within a session
-- ─────────────────────────────────────────────
create table public.practice_results (
  id              uuid primary key default uuid_generate_v4(),
  session_id      uuid references public.practice_sessions(id) on delete cascade,
  word_id         uuid references public.words(id) on delete cascade,
  result          text not null check (result in ('correct', 'incorrect', 'skipped')),
  response_ms     integer,  -- time taken to answer in milliseconds
  answered_at     timestamptz default now()
);

-- ─────────────────────────────────────────────
-- Row-level security
-- ─────────────────────────────────────────────
alter table public.profiles           enable row level security;
alter table public.word_sets          enable row level security;
alter table public.words              enable row level security;
alter table public.practice_sessions  enable row level security;
alter table public.practice_results   enable row level security;

-- Profiles: users can read their own; teachers can read all
create policy "own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "teachers read all profiles" on public.profiles
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'teacher')
  );

-- Word sets: everyone can read; only teachers can write
create policy "read word sets" on public.word_sets
  for select using (auth.role() = 'authenticated');

create policy "teachers manage word sets" on public.word_sets
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'teacher')
  );

-- Words: everyone can read active words; only teachers can write
create policy "read active words" on public.words
  for select using (auth.role() = 'authenticated' and is_active = true);

create policy "teachers read all words" on public.words
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'teacher')
  );

create policy "teachers manage words" on public.words
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'teacher')
  );

-- Practice sessions: students manage their own; teachers read all
create policy "own sessions" on public.practice_sessions
  for all using (student_id = auth.uid());

create policy "teachers read sessions" on public.practice_sessions
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'teacher')
  );

-- Practice results: follow session ownership
create policy "own results" on public.practice_results
  for all using (
    exists (
      select 1 from public.practice_sessions s
      where s.id = session_id and s.student_id = auth.uid()
    )
  );

create policy "teachers read results" on public.practice_results
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'teacher')
  );

-- ─────────────────────────────────────────────
-- Helpful views
-- ─────────────────────────────────────────────

-- Word stats: how often each word is answered correctly
create view public.word_stats as
select
  w.id            as word_id,
  w.hebrew,
  w.english,
  w.word_set_id,
  count(pr.id)                                            as total_attempts,
  count(pr.id) filter (where pr.result = 'correct')      as correct_count,
  count(pr.id) filter (where pr.result = 'incorrect')    as incorrect_count,
  count(pr.id) filter (where pr.result = 'skipped')      as skipped_count,
  round(
    100.0 * count(pr.id) filter (where pr.result = 'correct')
    / nullif(count(pr.id) filter (where pr.result != 'skipped'), 0)
  , 1)                                                    as accuracy_pct
from public.words w
left join public.practice_results pr on pr.word_id = w.id
group by w.id, w.hebrew, w.english, w.word_set_id;

-- Session summary view
create view public.session_summary as
select
  ps.id,
  ps.student_id,
  p.display_name          as student_name,
  ws.name                 as word_set_name,
  ps.mode,
  ps.started_at,
  ps.completed_at,
  ps.total_cards,
  ps.correct_count,
  ps.skipped_count,
  round(
    100.0 * ps.correct_count / nullif(ps.total_cards - ps.skipped_count, 0)
  , 1)                    as score_pct,
  extract(epoch from (ps.completed_at - ps.started_at))::integer as duration_seconds
from public.practice_sessions ps
join public.profiles p on p.id = ps.student_id
left join public.word_sets ws on ws.id = ps.word_set_id;
