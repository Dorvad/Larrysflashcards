import Link from "next/link";
import {
  WORDS,
  PENDING_WORDS,
  getDueToday,
  getWeakWords,
  PRACTICE_SESSIONS,
  NEXT_LESSON_SUGGESTIONS,
} from "@/lib/mock-data";
import StatusBadge from "@/components/shared/StatusBadge";
import HebrewText from "@/components/shared/HebrewText";

export default function TeacherDashboard() {
  const dueToday = getDueToday();
  const weakWords = getWeakWords();

  return (
    <div>
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">👋 Hello, Dor</h1>
        <p className="text-base text-gray-500 mt-1">Here&rsquo;s how Larry is doing.</p>
      </div>

      {/* Stats row */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard emoji="📝" value={WORDS.length} label="Active words" />
        <StatCard emoji="📅" value={dueToday.length} label="Due today" />
        <StatCard emoji="💪" value={weakWords.length} label="Struggling" />
        <StatCard emoji="📬" value={PENDING_WORDS.length} label="Pending words" />
      </div>

      {/* Pending words from Larry */}
      {PENDING_WORDS.length > 0 && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold text-gray-800">📬 Words from Larry</h2>
            <Link href="/teacher/pending" className="text-sm text-sky-600 hover:underline">
              View all
            </Link>
          </div>
          {PENDING_WORDS.slice(0, 2).map((word) => (
            <div
              key={word.id}
              className="bg-white rounded-2xl p-4 shadow-sm flex items-start gap-3 border-l-4 border-sky-300 mb-2"
            >
              <div className="shrink-0">
                {word.hebrewGuess ? (
                  <HebrewText size="sm" className="text-gray-800">
                    {word.hebrewGuess}
                  </HebrewText>
                ) : (
                  <span className="text-xl text-gray-400">?</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-medium text-gray-800">{word.englishDescription}</p>
                <p className="text-sm text-gray-500">{word.heardWhere}</p>
                <p className="text-xs text-gray-400 mt-1">{word.submittedAt}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Suggested next lesson */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">🎯 Suggested for next lesson</h2>
        <p className="text-sm text-gray-500 mb-3">
          Words Larry finds hardest — worth reviewing together.
        </p>
        {NEXT_LESSON_SUGGESTIONS.slice(0, 4).map((word) => (
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
            <StatusBadge status={word.status} />
          </div>
        ))}
      </div>

      {/* Recent activity */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Recent practice sessions</h2>
        {PRACTICE_SESSIONS.slice(0, 3).map((session) => {
          const pct = Math.round((session.scores.knew / session.wordCount) * 100);
          const scoreColor =
            pct >= 80
              ? "text-emerald-600"
              : pct >= 60
              ? "text-amber-500"
              : "text-rose-500";
          const formattedDate = new Date(session.date).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          });
          return (
            <div
              key={session.id}
              className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm mb-2"
            >
              <div>
                <p className="text-base font-medium text-gray-800">{formattedDate}</p>
                <p className="text-sm text-gray-500">{session.wordCount} words</p>
              </div>
              <span className={`text-xl font-bold ${scoreColor}`}>{pct}%</span>
            </div>
          );
        })}
        <Link
          href="/teacher/progress"
          className="text-sm text-sky-600 hover:underline mt-2 block"
        >
          View full progress →
        </Link>
      </div>
    </div>
  );
}

function StatCard({
  emoji,
  value,
  label,
}: {
  emoji: string;
  value: number;
  label: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <span className="text-xl" aria-hidden="true">
        {emoji}
      </span>
      <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}
