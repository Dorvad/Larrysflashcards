import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Demo mode — no Supabase config, let everything through
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setAll(cookiesToSet: any[]) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // IMPORTANT: use getUser(), not getSession() — validates the JWT server-side
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isAuthPath =
    pathname.startsWith("/login") || pathname.startsWith("/auth");

  // ── Unauthenticated ───────────────────────────────────────────
  if (!user && !isAuthPath) {
    const redirect = request.nextUrl.clone();
    redirect.pathname = "/login";
    return NextResponse.redirect(redirect);
  }

  if (user) {
    const role = (user.user_metadata?.role as string) ?? null;

    // Already logged in — bounce away from login page
    if (pathname === "/login") {
      const redirect = request.nextUrl.clone();
      redirect.pathname = role === "teacher" ? "/teacher" : "/student";
      return NextResponse.redirect(redirect);
    }

    // Students cannot access teacher routes
    if (pathname.startsWith("/teacher") && role !== "teacher") {
      const redirect = request.nextUrl.clone();
      redirect.pathname = "/student";
      return NextResponse.redirect(redirect);
    }

    // Teachers CAN access /student/* to preview Larry's view — no block needed
  }

  return supabaseResponse;
}
