# Larry's Flashcards

A private Hebrew vocabulary practice app for Larry (student) and Dor (teacher).

---

## Local setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create your local environment file

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in the four values described below.
The file is listed in `.gitignore` — it will never be committed.

### 3. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment variables

### Where to find the values

All four values come from your Supabase project dashboard.

**`NEXT_PUBLIC_SUPABASE_URL`**
> Supabase Dashboard → your project → **Project Settings** → **API**
> → **Project URL**
>
> Looks like: `https://abcdefghijklm.supabase.co`

**`NEXT_PUBLIC_SUPABASE_ANON_KEY`**
> Same page → **Project API keys** → **anon** / **public**
>
> This key is safe to expose to the browser.
> Its permissions are controlled by your Row Level Security policies.

**`SUPABASE_SERVICE_ROLE_KEY`**
> Same page → **Project API keys** → **service_role** → click **Reveal**
>
> ⚠️ This key bypasses all Row Level Security.
> It must only ever be used in server-side code (Server Actions, API Routes).
> Never prefix it with `NEXT_PUBLIC_` and never let it reach the browser.

**`NEXT_PUBLIC_SITE_URL`**
> The public URL of this deployment.
> - Local development: `http://localhost:3000`
> - Production: your Vercel URL or custom domain, e.g. `https://larrysflashcards.vercel.app`
>
> Supabase uses this value in auth redirect links (e.g. email confirmation).

---

## Creating users (Dor and Larry)

The app has two roles: **teacher** (Dor) and **student** (Larry).
Both are created in Supabase Auth. The role is set in `user_metadata` at
creation time; the `handle_new_user` database trigger reads it and automatically
creates the matching row in the `profiles` table.

### Option A — Supabase Dashboard (recommended)

1. Open your Supabase project → **Authentication** → **Users**
2. Click **Add user** → **Create new user**
3. Enter email and a strong password, then click **Create user**
4. Click the new user in the list → **Edit**
5. Paste the JSON below into **Raw user meta data** and save:

For Dor (teacher):
```json
{"role": "teacher", "full_name": "Dor"}
```
For Larry (student):
```json
{"role": "student", "full_name": "Larry"}
```

> **Important:** Set the metadata *before* the user signs in for the first time.
> The trigger runs on INSERT into `auth.users`, so if the user signs in via
> magic link first, re-set the metadata and manually insert a profiles row (see below).

### Option B — SQL Editor

Run these statements in **Supabase Dashboard → SQL Editor** (replace the
placeholders with real values):

```sql
-- Create Dor
SELECT auth.create_user(
  '{"email":"dor@example.com","password":"your-strong-password","user_metadata":{"role":"teacher","full_name":"Dor"}}'::jsonb
);

-- Create Larry
SELECT auth.create_user(
  '{"email":"larry@example.com","password":"your-strong-password","user_metadata":{"role":"student","full_name":"Larry"}}'::jsonb
);
```

### Verify the profiles table

After creating both users, confirm the trigger fired:

```sql
SELECT id, role, full_name, email FROM public.profiles;
```

You should see two rows — one with `role = 'teacher'`, one with `role = 'student'`.

### If a profiles row is missing

The trigger may not have fired (e.g., user was created before the schema was
applied). Insert the row manually:

```sql
-- Replace <uuid> with the user's id from auth.users
INSERT INTO public.profiles (id, role, full_name, email)
VALUES (
  '<uuid-from-auth.users>',
  'teacher',           -- or 'student'
  'Dor',
  'dor@example.com'
)
ON CONFLICT (id) DO UPDATE
  SET role = EXCLUDED.role,
      full_name = EXCLUDED.full_name,
      email = EXCLUDED.email;
```

---

## Database setup

Run `supabase/schema.sql` once against a fresh Supabase project:

1. Open your Supabase project
2. Go to **SQL Editor** → **New query**
3. Paste the full contents of `supabase/schema.sql`
4. Click **Run**

To load sample data, repeat with `supabase/seed.sql` — but read the
instructions at the top of that file first (you must create the Auth
users before running the seed).

---

## Deploying to Vercel

### Add environment variables in Vercel

1. Open your project on [vercel.com](https://vercel.com)
2. Go to **Settings** → **Environment Variables**
3. Add each of the four variables:

| Variable | Environment |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | Production, Preview, Development |
| `NEXT_PUBLIC_SITE_URL` | Set to your production URL for Production; your preview URL for Preview |

> **Important:** After adding or changing environment variables in Vercel,
> you must **redeploy** for the changes to take effect.
> Go to **Deployments** → find the latest deployment → **Redeploy**.

### Supabase Auth redirect URL

Add your production URL to the Supabase allow-list so email confirmation
links work in production:

1. Supabase Dashboard → **Authentication** → **URL Configuration**
2. Add your Vercel URL to **Redirect URLs**, e.g.:
   `https://larrysflashcards.vercel.app/**`

---

## Project structure

```
app/                  Next.js App Router pages
  student/            Larry's screens
  teacher/            Dor's screens
  login/              Login page
components/           React components
  student/            Student-facing components
  teacher/            Teacher-facing components
  shared/             Shared UI primitives
  ui/                 Base design-system components
lib/
  supabase/
    client.ts         Browser Supabase client  (NEXT_PUBLIC_ keys only)
    server.ts         Server Supabase client   (NEXT_PUBLIC_ keys only)
    middleware.ts     Session refresh helper   (NEXT_PUBLIC_ keys only)
    admin.ts          Admin client             (service role key — server only)
  mock-data.ts        Static prototype data (replaced by Supabase in production)
supabase/
  schema.sql          Full database schema with RLS policies
  seed.sql            Optional sample data
types/                TypeScript type definitions
```

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS |
| Backend | Supabase (PostgreSQL + Auth + RLS) |
| Hosting | Vercel |
