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
