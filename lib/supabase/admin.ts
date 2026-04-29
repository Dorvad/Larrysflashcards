import { createClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase admin client.
 *
 * Uses the service role key, which bypasses ALL Row Level Security.
 *
 * Rules:
 *  • Only call this from Server Actions, Route Handlers, or server utilities.
 *  • Never import this file inside a "use client" component.
 *  • Never pass the returned client (or its responses) to the browser.
 *
 * If you see a Next.js "attempted to import server-only module" error,
 * you are using this client in a client component — move the logic to
 * a Server Action or API Route.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. " +
        "Copy .env.example to .env.local and fill in both values."
    );
  }

  return createClient(url, key, {
    auth: {
      // Admin client does not manage user sessions
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
