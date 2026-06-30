import Link from "next/link";
import {
  WORDS,
  PENDING_WORDS,
  getDueToday,
  getWeakWords,
  PRACTICE_SESSIONS,
  NEXT_LESSON_SUGGESTIONS,
} from "@/lib/mock-data";
import { dbWordToWord } from "@/lib/supabase/mappers";
import { countDueWords } from "@/lib/words";
import { loadPracticeSessions, mapMockPracticeSessions, type SessionSummaryRow } from "@/lib/teacher-analytics";
import { AlertCircle } from "lucide-react";
import StatusBadge from "@/components/shared/StatusBadge";
import HebrewText from "@/components/shared/HebrewText";
import type { Word } from "@/types";
import { unstable_noStore as noStore } from "next/cache";

interface DashboardData {
  activeCount: number;
  pendingCount: number;
  strugglingCount: number;
  dueCount: number;
  pendingWords: { id: string; hebrew: string; description: string; context: string; submittedAt: string }[];
  suggestedWords: Word[];
  recentSessions: SessionSummaryRow[];
  lastPracticedAt: string | null;
  sessionsThisWeek: number;
  demoMode: boolean;
  error?: string;
}

async function loadDashboard(): Promise<DashboardData> {
  noStore();
  const configured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  if (!configured) {
    const dueToday = getDueToday();
    const weakWords = getWeakWords();
    return {
      activeCount: WORDS.length,
      pendingCount: PENDING_WORDS.length,
      strugglingCount: weakWords.length,
      dueCount: dueToday.length,
      pendingWords: PENDING_WORDS.slice(0, 2).map((w) => ({
        id: w.id,
        hebrew: w.hebrewGuess ?? "",
        description: w.englishDescription,
        context: w.heardWhere,
        submittedAt: w.submittedAt,
      })),
      suggestedWords: NEXT_LESSON_SUGGESTIONS.slice(0, 4),
      recentSessions: mapMockPracticeSessions(PRACTICE_SESSIONS.slice(0, 3)),
      lastPracticedAt: PRACTICE_SESSIONS[0]?.date ?? null,
      sessionsThisWeek: PRACTICE_SESSIONS.length,
      demoMode: true,
    };
  }

  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();

    // ── Core queries (always needed — never fall back to mock) ─────────────
    const [activeRes, pendingRes, pendingWordsRes, suggestedRes] = await Promise.all([
      supabase
        .from("words")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true)
        .eq("is_pending_approval", false),
      supabase
        .from("words")
        .select("*", { count: "exact", head: true })
        .eq("is_pending_approval", true),
      supabase
        .from("words")
        .select("id, hebrew, hebrew_niqqud, meaning_en, example_en, teacher_notes, created_at")
        .eq("is_pending_approval", true)
        .order("created_at", { ascending: false })
        .limit(3),
      supabase
        .from("words")
        .select("*")
        .eq("is_active", true)
        .eq("is_pending_approval", false)
        .lte("current_strength", 2)
        .order("current_strength", { ascending: true })
        .limit(4),
    ]);

    // ── Optional queries (schema-dependent — graceful fallback to zeros) ───
    let strugglingCount = 0;
    let dueCount = 0;
    let recentSessions: SessionSummaryRow[] = [];
    let lastPracticedAt: string | null = null;
    let sessionsThisWeek = 0;

    try {
      const weekStart = new Date();
      const day = weekStart.getDay();
      const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1);
      weekStart.setDate(diff);
      weekStart.setHours(0, 0, 0, 0);

      const [strugglingRes, dueWordsCount, sessions, sessionsWeekRes] =
        await Promise.all([
          supabase
            .from("words")
            .select("*", { count: "exact", head: true })
            .eq("is_active", true)
            .eq("is_pending_approval", false)
            .lte("current_strength", 2),
          countDueWords(supabase),
          loadPracticeSessions(supabase, 5),
          supabase
            .from("practice_sessions")
            .select("*", { count: "exact", head: true })
            .not("completed_at", "is", null)
            .gte("completed_at", weekStart.toISOString()),
        ]);

      strugglingCount = strugglingRes.count ?? 0;
      dueCount = dueWordsCount;
      recentSessions = sessions;
      lastPracticedAt = sessions[0]?.completedAt ?? null;
      sessionsThisWeek = sessionsWeekRes.count ?? sessions.length;
    } catch {
      // optional stats unavailable — pending data is still shown correctly
    }

    return {
      activeCount: activeRes.count ?? 0,
      pendingCount: pendingRes.count ?? 0,
      strugglingCount,
      dueCount,
      pendingWords: (pendingWordsRes.data ?? []).map((w) => ({
        id: w.id,
        hebrew: w.hebrew_niqqud ?? w.hebrew ?? "",
        description: w.meaning_en ?? "",
        context: w.example_en ?? "",
        submittedAt: new Date(w.created_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
      })),
      suggestedWords: (suggestedRes.data ?? []).map(dbWordToWord),
      recentSessions,
      lastPracticedAt,
      sessionsThisWeek,
      demoMode: false,
    };
  } catch (e) {
    return {
      activeCount: 0,
      pendingCount: 0,
      strugglingCount: 0,
      dueCount: 0,
      pendingWords: [],
      suggestedWords: [],
      recentSessions: [],
      lastPracticedAt: null,
      sessionsThisWeek: 0,
      demoMode: false,
      error: e instanceof Error ? e.message : "Could not load dashboard",
    };
  }
}

export default async function TeacherDashboard() {
  const data = await loadDashboard();

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Hello, Dor.</h1>
        <p className="text-base text-gray-500 mt-1">
          Here&rsquo;s how Larry is doing.
          {data.demoMode && (
            <span className="ml-2 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
              demo
            </span>
          )}
        </p>
      </div>

      {/* Error banner */}
      {data.error && (
        <div className="mb-6 bg-rose-50 border border-rose-200 rounded-2xl px-4 py-3 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-rose-800">Couldn&rsquo;t load dashboard</p>
            <p className="text-xs text-rose-600 mt-0.5 font-mono">{data.error}</p>
          </div>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard value={data.activeCount} label="Active words" />
        <StatCard value={data.strugglingCount} label="Struggling" />
        <StatCard value={data.pendingCount} label="Pending" href="/teacher/pending" />
        <StatCard value={data.dueCount} label="Due today" />
      </div>

      {(data.lastPracticedAt || data.sessionsThisWeek > 0) && (
        <p className="text-sm text-gray-500 mt-4">
          {data.sessionsThisWeek > 0 && (
            <span>{data.sessionsThisWeek} session{data.sessionsThisWeek === 1 ? "" : "s"} this week</span>
          )}
          {data.lastPracticedAt && (
            <span>
              {data.sessionsThisWeek > 0 ? " · " : ""}
              Last practiced{" "}
              {new Date(data.lastPracticedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </span>
          )}
        </p>
      )}

      {/* Pending words from Larry */}
      {data.pendingWords.length > 0 && (
        <section className="mt-10">
          <div className="flex justify-between items-baseline mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Words from Larry</h2>
            <Link href="/teacher/pending" className="text-sm text-sky-600 hover:underline">
              View all
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            {data.pendingWords.map((word) => (
              <div
                key={word.id}
                className="bg-white rounded-2xl p-4 shadow-sm flex items-start gap-4 border-l-4 border-sky-300"
              >
                <div className="shrink-0 w-10 flex items-center justify-center">
                  {word.hebrew && word.hebrew !== "(unknown)" ? (
                    <HebrewText size="sm" className="text-gray-800">
                      {word.hebrew}
                    </HebrewText>
                  ) : (
                    <span className="text-xl text-gray-300">?</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-medium text-gray-800">{word.description}</p>
                  {word.context && (
                    <p className="text-sm text-gray-500">{word.context}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-0.5">{word.submittedAt}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Suggested for next lesson */}
      {data.suggestedWords.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-semibold text-gray-800 mb-1">Suggested for next lesson</h2>
          <p className="text-sm text-gray-500 mb-4">
            Words Larry finds hardest — worth reviewing together.
          </p>
          <div className="flex flex-col gap-2">
            {data.suggestedWords.map((word) => (
              <Link
                key={word.id}
                href={`/teacher/words/${word.id}/edit`}
                className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm active:bg-gray-50 transition-colors"
              >
                <HebrewText size="sm" className="shrink-0">
                  {word.hebrewNiqqud}
                </HebrewText>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-medium text-gray-800">{word.english}</p>
                  {word.transliteration && (
                    <p className="text-sm text-gray-400 italic">{word.transliteration}</p>
                  )}
                </div>
                <StatusBadge status={word.status} />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Recent sessions */}
      {data.recentSessions.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent practice sessions</h2>
          <div className="flex flex-col gap-2">
            {data.recentSessions.map((session) => {
              const total = session.wordCount;
              const pct =
                total === 0
                  ? 0
                  : Math.round((session.scores.knew / total) * 100);
              const scoreColor =
                pct >= 80 ? "text-emerald-600" : pct >= 60 ? "text-amber-500" : "text-rose-500";
              const formattedDate = new Date(session.completedAt ?? session.date).toLocaleDateString(
                "en-US",
                {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                }
              );
              return (
                <div
                  key={session.id}
                  className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm"
                >
                  <div>
                    <p className="text-base font-medium text-gray-800">{formattedDate}</p>
                    <p className="text-sm text-gray-500">
                      {session.wordCount} cards
                      {session.durationMinutes > 0 ? ` · ${session.durationMinutes} min` : ""}
                      {session.encouragementCount > 0
                        ? ` · ${session.encouragementCount} familiar`
                        : ""}
                    </p>
                  </div>
                  <span className={`text-2xl font-bold ${scoreColor}`}>{pct}%</span>
                </div>
              );
            })}
          </div>
          <Link href="/teacher/progress" className="text-sm text-sky-600 hover:underline mt-3 block">
            Full progress history →
          </Link>
        </section>
      )}
    </div>
  );
}

function StatCard({
  value,
  label,
  href,
}: {
  value: number;
  label: string;
  href?: string;
}) {
  const content = (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  );
  if (href) {
    return (
      <Link href={href} className="block active:opacity-80 transition-opacity">
        {content}
      </Link>
    );
  }
  return content;
}
