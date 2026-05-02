import {
  WORDS,
  PRACTICE_SESSIONS,
  getWeakWords,
  PROGRESS_STATS,
  NEXT_LESSON_SUGGESTIONS,
} from "@/lib/mock-data";
import { dbWordToWord } from "@/lib/supabase/mappers";
import { unstable_noStore as noStore } from "next/cache";
import StatusBadge from "@/components/shared/StatusBadge";
import HebrewText from "@/components/shared/HebrewText";
import type { WordCategory } from "@/types";

// ─── Vocabulary breakdown config ─────────────────────────────────────────────

const BREAKDOWN_ROWS: {
  key: "new" | "practicing" | "strong" | "mastered";
  label: string;
  dotColor: string;
  barColor: string;
}[] = [
  { key: "new", label: "New", dotColor: "bg-sky-400", barColor: "bg-sky-400" },
  {
    key: "practicing",
    label: "Practicing",
    dotColor: "bg-amber-400",
    barColor: "bg-amber-400",
  },
  {
    key: "strong",
    label: "Strong",
    dotColor: "bg-violet-400",
    barColor: "bg-violet-400",
  },
  {
    key: "mastered",
    label: "Mastered",
    dotColor: "bg-emerald-400",
    barColor: "bg-emerald-400",
  },
];

// ─── Category grouping ────────────────────────────────────────────────────────

function getCategoryCounts(): { category: WordCategory; count: number }[] {
  const counts = new Map<WordCategory, number>();
  for (const word of WORDS) {
    counts.set(word.category, (counts.get(word.category) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);
}

// ─── Strength dots helper ─────────────────────────────────────────────────────

function StrengthDots({ strength }: { strength: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`Strength: ${strength} of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={`inline-block w-2.5 h-2.5 rounded-full ${
            i < strength ? "bg-sky-400" : "bg-gray-200"
          }`}
        />
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface ProgressData {
  weakWords: ReturnType<typeof getWeakWords>;
  categoryCounts: { category: WordCategory; count: number }[];
  total: number;
  mastered: number;
  practicing: number;
  newWords: number;
  strong: number;
  suggestedWords: ReturnType<typeof getWeakWords>;
  sessions: { id: string; date: string; wordCount: number; durationMinutes: number; scores: { knew: number; almost: number; forgot: number } }[];
}

async function loadProgressData(): Promise<ProgressData> {
  noStore();
  const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  if (!configured) {
    return {
      weakWords: getWeakWords(),
      categoryCounts: getCategoryCounts(),
      total: PROGRESS_STATS.total,
      mastered: PROGRESS_STATS.mastered,
      practicing: PROGRESS_STATS.practicing,
      newWords: PROGRESS_STATS.newWords,
      strong: PROGRESS_STATS.strong,
      suggestedWords: NEXT_LESSON_SUGGESTIONS,
      sessions: PRACTICE_SESSIONS,
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
    const total = words.length;
    const newWords = words.filter((w) => w.strength <= 1).length;
    const practicing = words.filter((w) => w.strength === 2 || w.strength === 3).length;
    const strong = words.filter((w) => w.strength === 4).length;
    const mastered = words.filter((w) => w.strength >= 5).length;
    const weakWords = words.filter((w) => w.strength <= 2);

    const catMap = new Map<WordCategory, number>();
    for (const w of words) catMap.set(w.category, (catMap.get(w.category) ?? 0) + 1);
    const categoryCounts = Array.from(catMap.entries()).map(([category, count]) => ({ category, count })).sort((a,b)=>b.count-a.count);

    const reviewByDay = new Map();
    for (const r of reviewsRes.data ?? []) {
      const day = new Date(r.reviewed_at).toISOString().split("T")[0];
      const entry = reviewByDay.get(day) ?? { knew: 0, almost: 0, forgot: 0, wordCount: 0 };
      entry.wordCount++;
      if (r.result === "knew") entry.knew++;
      else if (r.result === "almost") entry.almost++;
      else entry.forgot++;
      reviewByDay.set(day, entry);
    }

    const sessions = Array.from(reviewByDay.entries()).slice(0, 8).map(([date, s]) => ({
      id: date,
      date,
      wordCount: s.wordCount,
      durationMinutes: Math.max(1, Math.round(s.wordCount / 3)),
      scores: { knew: s.knew, almost: s.almost, forgot: s.forgot },
    }));

    return {
      weakWords,
      categoryCounts,
      total,
      mastered,
      practicing,
      newWords,
      strong,
      suggestedWords: weakWords.slice(0, 6),
      sessions,
    };
  } catch {
    return {
      weakWords: getWeakWords(),
      categoryCounts: getCategoryCounts(),
      total: PROGRESS_STATS.total,
      mastered: PROGRESS_STATS.mastered,
      practicing: PROGRESS_STATS.practicing,
      newWords: PROGRESS_STATS.newWords,
      strong: PROGRESS_STATS.strong,
      suggestedWords: NEXT_LESSON_SUGGESTIONS,
      sessions: PRACTICE_SESSIONS,
    };
  }
}

export default async function ProgressPage() {
  const data = await loadProgressData();
  const weakWords = data.weakWords;
  const categoryCounts = data.categoryCounts;
  const total = data.total;

  const breakdownCounts: Record<string, number> = {
    new: data.newWords,
    practicing: data.practicing,
    strong: data.strong,
    mastered: data.mastered,
  };

  return (
    <div>
      {/* Header */}
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Larry&rsquo;s Progress</h1>
      <p className="text-base text-gray-500 mb-6">
        A picture of how Larry&rsquo;s Hebrew is growing.
      </p>

      {/* 1. Summary stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryCard value={data.total} label="Words" />
        <SummaryCard value={data.mastered} label="Mastered" />
        <SummaryCard value={data.practicing} label="Practicing" />
        <SummaryCard value={data.newWords} label="New" />
      </div>

      {/* 2. Vocabulary breakdown */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Vocabulary breakdown</h2>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          {BREAKDOWN_ROWS.map((row) => {
            const count = breakdownCounts[row.key];
            const pct = total > 0 ? (count / total) * 100 : 0;
            return (
              <div key={row.key} className="flex items-center gap-3 mb-3 last:mb-0">
                <span className={`w-3 h-3 rounded-full shrink-0 ${row.dotColor}`} />
                <span className="text-base text-gray-700 font-medium w-24 shrink-0 capitalize">
                  {row.label}
                </span>
                <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${row.barColor}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-base font-semibold text-gray-800 w-8 text-right shrink-0">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Weak words */}
      {weakWords.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            Words that need more practice
          </h2>
          {weakWords.map((word) => (
            <div
              key={word.id}
              className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm mb-2"
            >
              <HebrewText size="sm" className="shrink-0">
                {word.hebrewNiqqud}
              </HebrewText>
              <div className="flex-1 min-w-0">
                <p className="text-base font-medium text-gray-800">{word.english}</p>
                <p className="text-sm text-gray-400 italic">{word.transliteration}</p>
              </div>
              <StrengthDots strength={word.strength} />
              <div className="shrink-0">
                <StatusBadge status={word.status} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. Category breakdown */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Words by category</h2>
        <div className="flex flex-wrap">
          {categoryCounts.map(({ category, count }) => (
            <span
              key={category}
              className="bg-white rounded-full px-4 py-2 text-sm font-medium shadow-sm inline-flex items-center gap-2 mr-2 mb-2"
            >
              {category}
              <span className="bg-gray-100 rounded-full px-2 py-0.5 text-xs text-gray-500">
                {count}
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* 5. Suggested next lesson */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">
          🎯 Suggested for next lesson
        </h2>
        <p className="text-sm text-gray-500 mb-3">
          These words showed up repeatedly as difficult — worth reviewing together.
        </p>
        {data.suggestedWords.map((word) => (
          <div
            key={word.id}
            className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm mb-2"
          >
            <HebrewText size="sm" className="shrink-0">
              {word.hebrewNiqqud}
            </HebrewText>
            <div className="flex-1 min-w-0">
              <p className="text-base font-medium text-gray-800">{word.english}</p>
              <p className="text-sm text-gray-400 italic">{word.transliteration}</p>
            </div>
            <StrengthDots strength={word.strength} />
          </div>
        ))}
      </div>

      {/* 6. Recent sessions */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Practice sessions</h2>
        {data.sessions.map((session) => {
          const knewPct = session.wordCount > 0
            ? session.scores.knew / session.wordCount
            : 0;
          const formattedDate = new Date(session.date).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          });
          return (
            <div
              key={session.id}
              className="bg-white rounded-2xl p-4 shadow-sm mb-2"
            >
              <div className="flex items-center justify-between">
                <p className="text-base font-medium text-gray-800">
                  {formattedDate} &middot; {session.wordCount} words
                </p>
                <p className="text-sm text-gray-400">{session.durationMinutes} min</p>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Knew:{" "}
                <span className="text-emerald-600 font-medium">
                  {session.scores.knew}
                </span>{" "}
                &middot; Almost:{" "}
                <span className="text-amber-500 font-medium">
                  {session.scores.almost}
                </span>{" "}
                &middot; Still learning:{" "}
                <span className="text-rose-500 font-medium">
                  {session.scores.forgot}
                </span>
              </p>
              {/* Progress bar */}
              <div className="mt-3 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-400 rounded-full transition-all"
                  style={{ width: `${knewPct * 100}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SummaryCard({ value, label }: { value: number; label: string }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}
