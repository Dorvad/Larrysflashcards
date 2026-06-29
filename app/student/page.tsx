import Link from "next/link";
import { getDueToday, getRecentlyAdded } from "@/lib/mock-data";
import { dbWordToWord } from "@/lib/supabase/mappers";
import { countDueWords } from "@/lib/words";
import { ChevronRight, Flame } from "lucide-react";
import { LogoutButton } from "@/components/auth/LogoutButton";
import type { Word } from "@/types";

const DAILY_QUOTES = [
  {
    text: "It does not matter how slowly you go as long as you do not stop.",
    author: "Confucius",
  },
  {
    text: "Ever tried. Ever failed. No matter. Try again. Fail again. Fail better.",
    author: "Samuel Beckett",
  },
  {
    text: "The beautiful thing about learning is nobody can take it away from you.",
    author: "B.B. King",
  },
  {
    text: "Becoming is better than being.",
    author: "Carol S. Dweck",
  },
  {
    text: "The limits of my language mean the limits of my world.",
    author: "Ludwig Wittgenstein",
  },
  {
    text: "Learning another language is not only learning different words for the same things, but learning another way to think about things.",
    author: "Flora Lewis",
  },
  {
    text: "One language sets you in a corridor for life. Two languages open every door along the way.",
    author: "Frank Smith",
  },
  {
    text: "He who does not know foreign languages does not know anything about his own.",
    author: "Johann Wolfgang von Goethe",
  },
  {
    text: "It is astonishing how much enjoyment one can get out of a language that one understands imperfectly.",
    author: "Basil Gildersleeve",
  },
  {
    text: "Do you know what a foreign accent is? It's a sign of bravery.",
    author: "Amy Chua",
  },
];

function getDailyQuote() {
  const dayIndex = Math.floor(Date.now() / 86_400_000);
  return DAILY_QUOTES[dayIndex % DAILY_QUOTES.length];
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function getDateLabel() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

interface StudentData {
  dueCount: number;
  recentlyAdded: Word[];
}

async function loadStudentData(): Promise<StudentData> {
  const configured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  if (!configured) {
    return { dueCount: getDueToday().length, recentlyAdded: getRecentlyAdded() };
  }

  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();

    const [dueCount, recentRes] = await Promise.all([
      countDueWords(supabase),
      supabase
        .from("words")
        .select("*")
        .eq("is_active", true)
        .eq("is_pending_approval", false)
        .order("created_at", { ascending: false })
        .limit(8),
    ]);

    return {
      dueCount,
      recentlyAdded: (recentRes.data ?? []).map(dbWordToWord),
    };
  } catch {
    return { dueCount: getDueToday().length, recentlyAdded: getRecentlyAdded() };
  }
}

export default async function StudentHomePage() {
  const { dueCount: count, recentlyAdded } = await loadStudentData();
  const quote = getDailyQuote();

  return (
    <div className="min-h-screen">
      {/* ── Header ────────────────────────────────────────────── */}
      <div className="px-5 pt-12 pb-6 animate-fade-slide-up">
        <p className="text-sm font-medium text-gray-400 tracking-wide">{getDateLabel()}</p>
        <h1 className="text-[32px] font-bold text-gray-900 leading-tight mt-1">
          {getGreeting()},
          <br />
          Larry.
        </h1>
      </div>

      {/* ── Practice card ─────────────────────────────────────── */}
      <div className="px-5 animate-fade-slide-up delay-75">
        <div className="relative bg-sky-500 rounded-3xl px-6 py-7 shadow-lg shadow-sky-200/60 overflow-hidden">
          <div className="absolute -top-8 -right-8 w-40 h-40 bg-sky-400/30 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-sky-600/20 rounded-full blur-2xl pointer-events-none" />

          <div className="relative">
            {count > 0 ? (
              <div className="flex items-center gap-2 mb-1">
                <Flame className="w-4 h-4 text-sky-200" />
                <p className="text-sky-100 text-base font-semibold">
                  {count} {count === 1 ? "word" : "words"} ready to review
                </p>
              </div>
            ) : (
              <p className="text-sky-100 text-base font-semibold mb-1">
                You&apos;re all caught up today
              </p>
            )}
            <Link
              href="/student/practice"
              className="mt-4 block w-full bg-white active:bg-sky-50 active:scale-[0.98] text-sky-600 text-xl font-bold text-center py-5 rounded-2xl shadow-sm transition-all duration-150"
            >
              Start Practice
            </Link>
          </div>
        </div>
      </div>

      {/* ── Daily quote ───────────────────────────────────────── */}
      <div className="px-5 mt-5 animate-fade-slide-up delay-100">
        <div className="relative bg-amber-50 rounded-3xl px-6 pt-5 pb-6 overflow-hidden border border-amber-100/80">
          <div className="absolute -top-6 -right-6 w-28 h-28 bg-amber-200/40 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-orange-200/30 rounded-full blur-xl pointer-events-none" />

          <div className="relative">
            <span
              aria-hidden="true"
              className="block font-serif text-[72px] leading-none text-amber-200 select-none -mb-3"
            >
              &ldquo;
            </span>
            <p className="text-gray-800 text-lg font-medium leading-snug">
              {quote.text}
            </p>
            <p className="mt-3 text-sm font-semibold text-amber-600">
              — {quote.author}
            </p>
          </div>
        </div>
      </div>

      {/* ── New this week ──────────────────────────────────────── */}
      {recentlyAdded.length > 0 && (
        <div className="mt-10 animate-fade-slide-up delay-150">
          <div className="flex items-center justify-between px-5 mb-4">
            <h2 className="text-[13px] font-semibold text-gray-500 uppercase tracking-wider">
              New this week
            </h2>
            <Link
              href="/student/words"
              className="flex items-center gap-0.5 text-sm text-sky-500 font-semibold"
            >
              See all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-3 px-5 snap-x snap-mandatory">
            {recentlyAdded.map((word, i) => (
              <Link
                key={word.id}
                href={`/student/words/${word.id}`}
                style={{ animationDelay: `${200 + i * 60}ms` }}
                className="animate-fade-slide-up bg-white rounded-2xl px-5 py-4 shadow-sm border border-gray-100/80 shrink-0 block active:scale-[0.97] transition-transform snap-start min-w-[120px]"
              >
                <p
                  dir="rtl"
                  lang="he"
                  style={{ fontFamily: "'Noto Serif Hebrew', serif" }}
                  className="text-2xl text-gray-900 text-center"
                >
                  {word.hebrewNiqqud}
                </p>
                <p className="text-[13px] text-gray-500 mt-2 text-center leading-tight">
                  {word.english}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Bottom links */}
      <div className="flex flex-col items-center gap-3 py-12 mt-4 animate-fade-slide-up delay-300">
        <Link
          href="/teacher"
          className="text-xs text-gray-300 active:text-gray-500 transition-colors"
        >
          Teacher view
        </Link>
        <LogoutButton className="text-xs text-gray-300 active:text-rose-400 transition-colors">
          Sign out
        </LogoutButton>
      </div>
    </div>
  );
}
