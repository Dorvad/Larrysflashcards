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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Hello, Dor.</h1>
        <p className="text-base text-gray-500 mt-1">Here&rsquo;s how Larry is doing.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard value={WORDS.length} label="Active words" />
        <StatCard value={dueToday.length} label="Due today" />
        <StatCard value={weakWords.length} label="Struggling" />
        <StatCard value={PENDING_WORDS.length} label="Pending" />
      </div>

      {/* Pending words from Larry */}
      {PENDING_WORDS.length > 0 && (
        <section className="mt-10">
          <div className="flex justify-between items-baseline mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Words from Larry</h2>
            <Link href="/teacher/pending" className="text-sm text-sky-600 hover:underline">
              View all
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            {PENDING_WORDS.slice(0, 2).map((word) => (
              <div
                key={word.id}
                className="bg-white rounded-2xl p-4 shadow-sm flex items-start gap-4 border-l-4 border-sky-300"
              >
                <div className="shrink-0 w-10 flex items-center justify-center">
                  {word.hebrewGuess ? (
                    <HebrewText size="sm" className="text-gray-800">
                      {word.hebrewGuess}
                    </HebrewText>
                  ) : (
                    <span className="text-xl text-gray-300">?</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-medium text-gray-800">{word.englishDescription}</p>
                  <p className="text-sm text-gray-500">{word.heardWhere}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{word.submittedAt}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Suggested for next lesson */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold text-gray-800 mb-1">Suggested for next lesson</h2>
        <p className="text-sm text-gray-500 mb-4">
          Words Larry finds hardest — worth reviewing together.
        </p>
        <div className="flex flex-col gap-2">
          {NEXT_LESSON_SUGGESTIONS.slice(0, 4).map((word) => (
            <div
              key={word.id}
              className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm"
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
      </section>

      {/* Recent sessions */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent practice sessions</h2>
        <div className="flex flex-col gap-2">
          {PRACTICE_SESSIONS.slice(0, 3).map((session) => {
            const pct = Math.round((session.scores.knew / session.wordCount) * 100);
            const scoreColor =
              pct >= 80 ? "text-emerald-600" : pct >= 60 ? "text-amber-500" : "text-rose-500";
            const formattedDate = new Date(session.date).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            });
            return (
              <div
                key={session.id}
                className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm"
              >
                <div>
                  <p className="text-base font-medium text-gray-800">{formattedDate}</p>
                  <p className="text-sm text-gray-500">{session.wordCount} words</p>
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
    </div>
  );
}

function StatCard({ value, label }: { value: number; label: string }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  );
}
