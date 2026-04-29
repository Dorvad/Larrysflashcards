import Link from "next/link";
import { getDueToday, getRecentlyAdded } from "@/lib/mock-data";

export default function StudentHomePage() {
  const dueToday = getDueToday();
  const recentlyAdded = getRecentlyAdded();
  const count = dueToday.length;

  return (
    <div className="bg-[#F7F5F0] min-h-screen flex flex-col">
      {/* Greeting */}
      <div className="px-5 pt-10 pb-2">
        <h1 className="text-3xl font-bold text-gray-900 leading-tight">
          Hello, Larry.
        </h1>
        <p className="text-xl text-gray-500 mt-1">
          {count > 0
            ? `You have ${count} word${count === 1 ? "" : "s"} to practice today.`
            : "You're all caught up for today."}
        </p>
      </div>

      {/* Practice CTA — the main action */}
      <div className="px-5 mt-6">
        <Link
          href="/student/practice"
          className="block w-full bg-sky-500 hover:bg-sky-600 active:bg-sky-700 active:scale-[0.98] text-white text-2xl font-bold text-center py-6 rounded-3xl shadow-lg transition-all duration-150"
        >
          Start Practice
        </Link>
        <Link
          href="/student/words"
          className="block w-full text-center text-sky-600 font-semibold text-base mt-4 py-3 rounded-2xl hover:bg-sky-50 transition-colors"
        >
          Browse my words
        </Link>
      </div>

      {/* New this week */}
      {recentlyAdded.length > 0 && (
        <div className="px-5 mt-10">
          <h2 className="text-base font-semibold text-gray-400 uppercase tracking-wide mb-4">
            New this week
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5">
            {recentlyAdded.map((word) => (
              <Link
                key={word.id}
                href={`/student/words/${word.id}`}
                className="bg-white rounded-2xl px-5 py-4 shadow-sm border border-gray-100 shrink-0 block active:scale-[0.97] transition-transform"
              >
                <p
                  dir="rtl"
                  lang="he"
                  style={{ fontFamily: "'Noto Serif Hebrew', serif" }}
                  className="text-2xl text-gray-900 text-center"
                >
                  {word.hebrewNiqqud}
                </p>
                <p className="text-sm text-gray-500 mt-1 text-center">
                  {word.english}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Spacer + teacher link at very bottom */}
      <div className="flex-1" />
      <div className="text-center py-10 mt-4">
        <Link
          href="/teacher"
          className="text-xs text-gray-300 hover:text-gray-400 transition-colors"
        >
          Teacher view
        </Link>
      </div>
    </div>
  );
}
