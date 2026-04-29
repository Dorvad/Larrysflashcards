import { notFound } from "next/navigation";
import Link from "next/link";
import { getWordById } from "@/lib/mock-data";
import StatusBadge from "@/components/shared/StatusBadge";
import HebrewText from "@/components/shared/HebrewText";
import { Volume2, ArrowLeft, Star } from "lucide-react";

async function Page({ params }: { params: { id: string } }) {
  const word = getWordById(params.id);
  if (!word) notFound();

  return (
    <div className="bg-[#F7F5F0] min-h-screen">
      {/* Top nav */}
      <div className="px-4 pt-5 pb-1">
        <Link
          href="/student/words"
          className="inline-flex items-center gap-2 text-gray-500 min-h-[48px]"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-base">My Words</span>
        </Link>
      </div>

      <div className="px-4 pt-2 pb-10 flex flex-col gap-4">
        {/* Hero word card */}
        <div className="bg-white rounded-3xl p-8 shadow-md text-center flex flex-col items-center gap-3">
          <HebrewText size="xl">{word.hebrewNiqqud}</HebrewText>

          {word.hebrewPlain && word.hebrewPlain !== word.hebrewNiqqud && (
            <p
              dir="rtl"
              lang="he"
              style={{ fontFamily: "'Noto Serif Hebrew', serif" }}
              className="text-2xl text-gray-400"
            >
              {word.hebrewPlain}
            </p>
          )}

          <p className="text-xl text-gray-400 italic">{word.transliteration}</p>
          <p className="text-2xl font-semibold text-gray-900">{word.english}</p>

          <div className="flex flex-row items-center justify-center gap-2 flex-wrap">
            <StatusBadge status={word.status} />
            <span className="text-sm text-gray-500 bg-gray-100 rounded-full px-3 py-1">
              {word.category}
            </span>
          </div>

          <button
            disabled
            className="flex items-center gap-2 text-sm text-gray-400 bg-gray-100 border border-gray-200 rounded-full px-5 py-2.5 cursor-not-allowed min-h-[44px]"
            aria-label="Audio not yet available"
          >
            <Volume2 className="w-4 h-4" />
            Hear it
          </button>
        </div>

        {/* Example sentence */}
        <div className="bg-amber-50 rounded-2xl p-5">
          <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-3">
            Example sentence
          </p>
          <p
            dir="rtl"
            lang="he"
            style={{ fontFamily: "'Noto Serif Hebrew', serif" }}
            className="text-xl text-gray-800 mb-2 leading-relaxed"
          >
            {word.exampleHebrew}
          </p>
          <p className="text-base text-gray-600 italic">{word.exampleEnglish}</p>
        </div>

        {/* Teacher note */}
        {word.teacherNote && (
          <div className="bg-sky-50 rounded-2xl p-5">
            <p className="text-xs font-semibold text-sky-600 uppercase tracking-wide mb-2">
              Note from Dor
            </p>
            <p className="text-base text-sky-800">{word.teacherNote}</p>
          </div>
        )}

        {/* Practice history */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="text-base font-semibold text-gray-700 mb-4">Practice history</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <p className="text-sm text-gray-400">Reviewed</p>
              <p className="text-2xl font-bold text-gray-800">
                {word.timesReviewed}
                <span className="text-sm font-normal text-gray-400 ml-1">×</span>
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-sm text-gray-400">Strength</p>
              <div className="flex items-center gap-0.5 mt-1">
                {Array.from({ length: word.strength }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
                {word.strength === 0 && (
                  <span className="text-gray-300 text-base">—</span>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-sm text-gray-400">Status</p>
              <div className="mt-0.5">
                <StatusBadge status={word.status} />
              </div>
            </div>
          </div>
        </div>

        {/* Practice CTA */}
        <Link
          href="/student/practice"
          className="block w-full bg-sky-500 active:bg-sky-700 active:scale-[0.97] text-white text-xl font-bold rounded-2xl py-5 text-center transition-all duration-100 min-h-[68px]"
        >
          Practice this word
        </Link>
      </div>
    </div>
  );
}

export default Page;
