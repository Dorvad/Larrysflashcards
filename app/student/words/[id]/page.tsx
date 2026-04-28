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
      {/* Top nav bar */}
      <div className="px-4 pt-6 flex items-center gap-3">
        <Link
          href="/student/words"
          className="flex items-center gap-2 text-gray-500 min-h-[48px]"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-base">My Words</span>
        </Link>
      </div>

      {/* Main content */}
      <div className="px-4 pt-4 pb-8">
        {/* 1. Hero word card */}
        <div className="bg-white rounded-3xl p-8 shadow-md text-center">
          <HebrewText size="xl">{word.hebrewNiqqud}</HebrewText>

          {word.hebrewPlain && word.hebrewPlain !== word.hebrewNiqqud && (
            <p
              dir="rtl"
              lang="he"
              style={{ fontFamily: "'Noto Serif Hebrew', serif" }}
              className="text-2xl text-gray-400 mt-1"
            >
              {word.hebrewPlain}
            </p>
          )}

          <p className="text-lg text-gray-400 italic mt-2">
            {word.transliteration}
          </p>

          <p className="text-2xl font-semibold text-gray-900 mt-4">
            {word.english}
          </p>

          <div className="flex flex-row items-center justify-center gap-2 mt-4 flex-wrap">
            <StatusBadge status={word.status} />
            <span className="text-sm text-gray-500 bg-gray-100 rounded-full px-3 py-0.5">
              {word.category}
            </span>
          </div>

          <button
            disabled
            className="mt-4 flex items-center gap-2 text-sm text-gray-400 bg-gray-100 rounded-full px-4 py-2 cursor-not-allowed mx-auto"
            aria-label="Audio coming soon"
          >
            <Volume2 className="w-4 h-4" />
            Hear it
          </button>
        </div>

        {/* 2. Example sentence */}
        <div className="bg-amber-50 rounded-2xl p-5 mt-4">
          <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-3">
            Example sentence
          </p>
          <p
            dir="rtl"
            lang="he"
            style={{ fontFamily: "'Noto Serif Hebrew', serif" }}
            className="text-xl text-gray-800 mb-2"
          >
            {word.exampleHebrew}
          </p>
          <p className="text-base text-gray-600 italic">{word.exampleEnglish}</p>
        </div>

        {/* 3. Teacher note */}
        {word.teacherNote && (
          <div className="bg-sky-50 rounded-2xl p-5 mt-4 flex gap-3">
            <span className="text-xl shrink-0" aria-hidden="true">
              💬
            </span>
            <p className="text-base text-sky-800">{word.teacherNote}</p>
          </div>
        )}

        {/* 4. Practice history */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mt-4">
          <h2 className="text-base font-semibold text-gray-700 mb-4">
            Practice history
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col">
              <p className="text-xs text-gray-400 mb-1">Reviewed</p>
              <p className="text-xl font-bold text-gray-800">
                {word.timesReviewed}
                <span className="text-sm font-normal text-gray-400 ml-1">
                  times
                </span>
              </p>
            </div>
            <div className="flex flex-col">
              <p className="text-xs text-gray-400 mb-1">Strength</p>
              <p className="text-xl font-bold text-gray-800 flex items-center gap-0.5">
                {Array.from({ length: word.strength }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 text-amber-400 fill-amber-400"
                  />
                ))}
                {word.strength === 0 && (
                  <span className="text-gray-300 text-base">—</span>
                )}
              </p>
            </div>
            <div className="flex flex-col">
              <p className="text-xs text-gray-400 mb-1">Status</p>
              <StatusBadge status={word.status} />
            </div>
          </div>
        </div>

        {/* 5. Practice this word button */}
        <Link
          href="/student/practice"
          className="block w-full bg-sky-500 text-white text-xl font-semibold rounded-2xl py-5 mt-6 text-center"
        >
          Practice this word
        </Link>
      </div>
    </div>
  );
}

export default Page;
