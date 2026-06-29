import { PROGRESS_STATS, PRACTICE_SESSIONS } from "@/lib/mock-data";
import { dbWordToWord } from "@/lib/supabase/mappers";
import ProgressSummaryCard from "@/components/student/ProgressSummaryCard";
import type { ProgressStats } from "@/types";
import { unstable_noStore as noStore } from "next/cache";

function formatDate(isoDate: string): string {
  const date = new Date(isoDate + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

interface SessionRow {
  id: string;
  date: string;
  wordCount: number;
  scores: { forgot: number; almost: number; knew: number };
  durationMinutes: number;
}

async function loadProgress(): Promise<{
  stats: ProgressStats;
  sessions: SessionRow[];
  demoMode: boolean;
}> {
  noStore();
  const configured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  if (!configured) {
    return {
      stats: PROGRESS_STATS,
      sessions: PRACTICE_SESSIONS.slice(0, 5),
      demoMode: true,
    };
  }

  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();

    const [wordsRes, reviewsRes] = await Promise.all([
      supabase
        .from("words")
        .select("*")
        .eq("is_active", true)
        .eq("is_pending_approval", false),
      supabase
        .from("reviews")
        .select("result, reviewed_at")
        .order("reviewed_at", { ascending: false })
        .limit(200),
    ]);

    const words = (wordsRes.data ?? []).map(dbWordToWord);
    const stats: ProgressStats = {
      total: words.length,
      newWords: words.filter((w) => w.strength <= 1).length,
      practicing: words.filter((w) => w.strength === 2 || w.strength === 3).length,
      strong: words.filter((w) => w.strength === 4).length,
      mastered: words.filter((w) => w.strength >= 5).length,
      recentSessions: [],
    };

    const reviewByDay = new Map<
      string,
      { knew: number; almost: number; forgot: number; wordCount: number }
    >();

    for (const review of reviewsRes.data ?? []) {
      const day = new Date(review.reviewed_at).toISOString().split("T")[0];
      const entry = reviewByDay.get(day) ?? {
        knew: 0,
        almost: 0,
        forgot: 0,
        wordCount: 0,
      };
      entry.wordCount++;
      if (review.result === "knew") entry.knew++;
      else if (review.result === "almost") entry.almost++;
      else entry.forgot++;
      reviewByDay.set(day, entry);
    }

    const sessions = Array.from(reviewByDay.entries())
      .slice(0, 5)
      .map(([date, s]) => ({
        id: date,
        date,
        wordCount: s.wordCount,
        scores: { knew: s.knew, almost: s.almost, forgot: s.forgot },
        durationMinutes: Math.max(1, Math.round(s.wordCount / 3)),
      }));

    stats.recentSessions = sessions;

    return { stats, sessions, demoMode: false };
  } catch {
    return {
      stats: PROGRESS_STATS,
      sessions: PRACTICE_SESSIONS.slice(0, 5),
      demoMode: true,
    };
  }
}

export default async function ProgressPage() {
  const { stats, sessions, demoMode } = await loadProgress();

  return (
    <div className="bg-[#F7F5F0] min-h-screen px-5 pt-10 pb-8">
      <h1 className="text-2xl font-bold text-gray-900">Your Progress</h1>
      <p className="text-lg text-gray-500 mt-1">
        Your Hebrew is growing.
        {demoMode && (
          <span className="ml-2 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
            demo
          </span>
        )}
      </p>

      <div className="bg-white rounded-3xl p-8 shadow-sm mt-6 text-center">
        <p className="text-7xl font-bold text-gray-900">{stats.total}</p>
        <p className="text-lg text-gray-500 mt-2">Hebrew words learned</p>
      </div>

      <div className="mt-5">
        <ProgressSummaryCard stats={stats} />
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent sessions</h2>

        {sessions.length === 0 ? (
          <p className="text-base text-gray-400 text-center py-8">
            No practice sessions yet — start practicing to see your progress here.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {sessions.map((session) => {
              const total = session.wordCount;
              const knewPercent =
                total > 0 ? Math.round((session.scores.knew / total) * 100) : 0;

              return (
                <div
                  key={session.id}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
                >
                  <div className="flex items-baseline justify-between mb-2">
                    <p className="text-base font-medium text-gray-800">
                      {formatDate(session.date)}
                    </p>
                    <p className="text-sm text-gray-400">{session.durationMinutes} min</p>
                  </div>

                  <div className="flex gap-4 text-base mb-4">
                    <span className="text-emerald-600 font-medium">
                      {session.scores.knew} knew
                    </span>
                    <span className="text-amber-600 font-medium">
                      {session.scores.almost} almost
                    </span>
                    <span className="text-rose-500 font-medium">
                      {session.scores.forgot} still learning
                    </span>
                  </div>

                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                      style={{ width: `${knewPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <p className="mt-8 text-center text-base text-gray-400 italic">
        Keep going, Larry. Every word gets easier.
      </p>
    </div>
  );
}
