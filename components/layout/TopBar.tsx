"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import type { Profile } from "@/types/database";

interface TopBarProps {
  profile: Profile;
  title?: string;
  backHref?: string;
}

export function TopBar({ profile, title, backHref }: TopBarProps) {
  const router = useRouter();
  const supabase = createClient();

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
      <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          {backHref && (
            <Link
              href={backHref}
              className="flex items-center justify-center w-10 h-10 rounded-xl hover:bg-gray-100 transition-colors text-gray-600 shrink-0"
              aria-label="Go back"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
            </Link>
          )}
          <h1 className="text-xl font-semibold text-gray-800 truncate">
            {title ?? "Larry's Flashcards"}
          </h1>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-base text-gray-500 hidden sm:block">
            {profile.display_name}
          </span>
          <Button variant="ghost" size="md" onClick={signOut} className="text-base">
            Sign out
          </Button>
        </div>
      </div>
    </header>
  );
}
