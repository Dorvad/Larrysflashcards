import Link from "next/link";
import { getDueToday, getRecentlyAdded } from "@/lib/mock-data";

export default function StudentHomePage() {
  const dueToday = getDueToday();
  const recentlyAdded = getRecentlyAdded();
  const count = dueToday.length;

  return (
    <div className="bg-[#F7F5F0] min-h-screen flex flex-col">
      {/* Greeting */}
      <div className="px-5 pt-8 pb-2">
        <h2 className="text-3xl font-bold text-gray-900 leading-tight">
          Hello, Larry.
        </h2>
        <p className="text-lg text-gray-500 mt-1">
          {count > 0
            ? `${count} word${count === 1 ? "" : "s"} ready to practice.`
            : "You're all caught up for today."}
        </p>
      </div>

      {/* Primary CTA */}
      <div className="px-5 mt-6">
        <Link
          href="/student/practice"
          className="block w-full bg-sky-500 active:bg-sky-700 active:scale-[0.98] text-white text-2xl font-bold text-center py-7 rounded-3xl shadow-lg transition-all duration-150"
        >
          Start Practice
        </Link>
      </div>

      {/* New this week */}
      {recentlyAdded.length > 0 && (
        <div className="px-5 mt-10">
          <div className="flex items-baseline justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
              New this week
            </h3>
            <Link
              href="/student/words"
              className="text-sm text-sky-600 font-medium"
            >
              See all
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 snap-x snap-mandatory">
            {recentlyAdded.map((word) => (
              <Link
                key={word.id}
                href={`/student/words/${word.id}`}
                className="bg-white rounded-2xl px-5 py-4 shadow-sm border border-gray-100 shrink-0 block active:scale-[0.97] transition-transform snap-start min-w-[120px]"
              >
                <p
                  dir="rtl"
                  lang="he"
                  style={{ fontFamily: "'Noto Serif Hebrew', serif" }}
                  className="text-2xl text-gray-900 text-center"
                >
                  {word.hebrewNiqqud}
                </p>
                <p className="text-sm text-gray-500 mt-1.5 text-center leading-tight">
                  {word.english}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1" />

      {/* Teacher access — intentionally low-contrast */}
      <div className="text-center py-8">
        <Link
          href="/teacher"
          className="text-xs text-gray-300 active:text-gray-500 transition-colors"
        >
          Teacher view
        </Link>
      </div>
    </div>
  );
}
