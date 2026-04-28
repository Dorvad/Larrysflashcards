import { PROGRESS_STATS, PRACTICE_SESSIONS } from "@/lib/mock-data";
import ProgressSummaryCard from "@/components/student/ProgressSummaryCard";

function formatDate(isoDate: string): string {
  const date = new Date(isoDate + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export default function ProgressPage() {
  const recentSessions = PRACTICE_SESSIONS.slice(0, 5);

  return (
    <div className="bg-[#F7F5F0] min-h-screen px-4 pt-8 pb-8">
      {/* Header */}
      <h1 className="text-2xl font-bold text-gray-900">Your Progress</h1>
      <p className="text-lg text-gray-500 mt-1">Your Hebrew is growing 🌱</p>

      {/* Total words */}
      <div className="bg-white rounded-3xl p-6 shadow-sm mt-6 text-center">
        <p className="text-6xl font-bold text-gray-900">{PROGRESS_STATS.total}</p>
        <p className="text-base text-gray-500 mt-1">Hebrew words</p>
      </div>

      {/* Progress summary card */}
      <div className="mt-4">
        <ProgressSummaryCard stats={PROGRESS_STATS} />
      </div>

      {/* Recent sessions */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">
          Recent sessions
        </h2>

        {recentSessions.map((session) => {
          const total = session.wordCount;
          const knewPercent =
            total > 0 ? Math.round((session.scores.knew / total) * 100) : 0;

          return (
            <div
              key={session.id}
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-3"
            >
              {/* Date + duration row */}
              <div className="flex items-center justify-between mb-2">
                <p className="text-base font-medium text-gray-800">
                  {formatDate(session.date)}
                </p>
                <p className="text-sm text-gray-400">
                  {session.durationMinutes} min
                </p>
              </div>

              {/* Score row */}
              <p className="text-sm text-gray-500 mb-3">
                {session.wordCount} words &middot;{" "}
                <span className="text-emerald-600 font-medium">
                  {session.scores.knew} knew
                </span>{" "}
                /{" "}
                <span className="text-amber-600 font-medium">
                  {session.scores.almost} almost
                </span>{" "}
                /{" "}
                <span className="text-rose-500 font-medium">
                  {session.scores.forgot} still learning
                </span>
              </p>

              {/* Progress bar */}
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${knewPercent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Encouraging footer */}
      <p className="mt-6 text-center text-base text-gray-400 italic">
        Keep going, Larry. Every word gets easier.
      </p>
    </div>
  );
}
