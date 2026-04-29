import Link from "next/link";
import { getDueToday, getRecentlyAdded } from "@/lib/mock-data";
import { ChevronRight } from "lucide-react";

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

export default function StudentHomePage() {
  const dueToday = getDueToday();
  const recentlyAdded = getRecentlyAdded();
  const count = dueToday.length;

  return (
    <div className="min-h-screen">
      {/* ── Header ────────────────────────────────────────────── */}
      <div className="px-5 pt-12 pb-6">
        <p className="text-sm font-medium text-gray-400 tracking-wide">
          {getDateLabel()}
        </p>
        <h1 className="text-[32px] font-bold text-gray-900 leading-tight mt-1">
          {getGreeting()},
          <br />
          Larry.
        </h1>
      </div>

      {/* ── Practice card ─────────────────────────────────────── */}
      <div className="px-5">
        <div className="bg-sky-500 rounded-3xl px-6 py-7 shadow-lg shadow-sky-200/60">
          <p className="text-sky-100 text-base font-medium">
            {count > 0
              ? `${count} word${count === 1 ? "" : "s"} ready to review`
              : "You're all caught up today"}
          </p>
          <Link
            href="/student/practice"
            className="mt-4 block w-full bg-white active:bg-sky-50 active:scale-[0.98] text-sky-600 text-xl font-bold text-center py-5 rounded-2xl shadow-sm transition-all duration-150"
          >
            Start Practice
          </Link>
        </div>
      </div>

      {/* ── New this week ──────────────────────────────────────── */}
      {recentlyAdded.length > 0 && (
        <div className="mt-10">
          <div className="flex items-center justify-between px-5 mb-4">
            <h2 className="text-base font-semibold text-gray-500 uppercase tracking-wider text-[13px]">
              New this week
            </h2>
            <Link
              href="/student/words"
              className="flex items-center gap-0.5 text-sm text-sky-500 font-semibold"
            >
              See all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 px-5 snap-x snap-mandatory">
            {recentlyAdded.map((word) => (
              <Link
                key={word.id}
                href={`/student/words/${word.id}`}
                className="bg-white rounded-2xl px-5 py-4 shadow-sm border border-gray-100/80 shrink-0 block active:scale-[0.97] transition-transform snap-start min-w-[120px]"
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

      {/* Teacher access — deliberately low-key */}
      <div className="text-center py-12 mt-4">
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
