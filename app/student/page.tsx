import Link from "next/link";
import {
  getDueToday,
  getRecentlyAdded,
  getLastLessonWords,
  PROGRESS_STATS,
} from "@/lib/mock-data";
import ProgressSummaryCard from "@/components/student/ProgressSummaryCard";
import WordCard from "@/components/student/WordCard";

export default function StudentHomePage() {
  const dueToday = getDueToday();
  const recentlyAdded = getRecentlyAdded();
  const lastLessonWords = getLastLessonWords();

  return (
    <div className="bg-[#F7F5F0]">
      {/* Greeting */}
      <div className="px-4 pt-8 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Hello Larry 👋</h1>
        <p className="text-lg text-gray-500 mt-1">
          Ready for a little Hebrew today?
        </p>
      </div>

      {/* Today's Practice card */}
      <div className="bg-sky-500 rounded-3xl p-6 mx-4 mt-2 text-white shadow-lg">
        <p className="text-lg font-semibold">Today&apos;s Practice</p>
        <p className="text-5xl font-bold mt-1 leading-none">{dueToday.length}</p>
        <p className="text-base text-sky-100 mt-1">words to review</p>

        <div className="flex flex-row gap-3 mt-6">
          <Link
            href="/student/practice"
            className="flex-1 text-center bg-white text-sky-600 font-bold text-lg py-4 px-6 rounded-2xl"
          >
            Start Practice
          </Link>
          <Link
            href="/student/words"
            className="bg-sky-600 text-white font-semibold text-base py-4 px-5 rounded-2xl whitespace-nowrap"
          >
            View My Words
          </Link>
        </div>
      </div>

      {/* Progress summary */}
      <div className="px-4 mt-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">
          Your Hebrew
        </h2>
        <ProgressSummaryCard stats={PROGRESS_STATS} />
      </div>

      {/* Recently added */}
      <div className="px-4 mt-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">
          New this week
        </h2>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {recentlyAdded.map((word) => (
            <Link
              key={word.id}
              href={`/student/words/${word.id}`}
              className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-100 shrink-0 block"
            >
              <p
                dir="rtl"
                lang="he"
                style={{ fontFamily: "'Noto Serif Hebrew', serif" }}
                className="text-xl text-gray-900"
              >
                {word.hebrewNiqqud}
              </p>
              <p className="text-sm text-gray-500 mt-0.5">{word.english}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Last lesson words */}
      <div className="px-4 mt-6 pb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">
          From your last lesson
        </h2>
        <div className="flex flex-col gap-3">
          {lastLessonWords.map((word) => (
            <WordCard key={word.id} word={word} />
          ))}
        </div>
      </div>
    </div>
  );
}
