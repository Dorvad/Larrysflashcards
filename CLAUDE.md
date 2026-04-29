# Larry's Flashcards — project guide

A private Hebrew vocabulary practice app for Larry (student, 70s) and Dor (his teacher).

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS |
| Backend | Supabase (PostgreSQL + Auth + RLS) |
| Hosting target | Vercel |

## Running locally

```bash
cp .env.example .env.local   # fill in Supabase credentials
npm install
npm run dev                   # http://localhost:3000
```

## Database setup

Run `supabase/schema.sql` in the Supabase SQL editor once, against a fresh project.
It creates all tables, RLS policies, triggers, and views.

## Key design decisions

- **Two roles**: `student` (Larry) and `teacher` (Dor). Set via `user_metadata.role` at sign-up.
- **Age-friendly sizing**: minimum font 16px, minimum touch targets 48px, Hebrew words rendered at 32–44px.
- **No spaced-repetition algorithm yet** — cards are shuffled randomly; accuracy data is collected to add SRS later.
- **RTL Hebrew**: all Hebrew text gets `dir="rtl"` and `lang="he"` plus the Noto Serif Hebrew font.

## Route map

```
/                      → redirects based on role
/login                 → email + password login
/practice              → Larry: pick a lesson
/practice/session      → Larry: flashcard session (?set=<id>|all)
/practice/complete     → Larry: session summary (?session=<id>)
/teacher               → Dor: dashboard with stats and quick links
/teacher/words         → Dor: list / search all words
/teacher/words/new     → Dor: add a word
/teacher/words/[id]    → Dor: edit a word
/teacher/sets          → Dor: create / edit lesson groups
/teacher/progress      → Dor: Larry's full practice history
```

## Component conventions

- All client components start with `"use client"`.
- Server components fetch data directly via `lib/supabase/server.ts`.
- `lib/supabase/client.ts` is for client components only.
- Shared UI primitives live in `components/ui/`.
- Feature-specific components live in `components/flashcard/` or `components/teacher/`.
