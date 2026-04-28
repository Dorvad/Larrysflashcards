import Link from "next/link";
import type { Word } from "@/types";
import StatusBadge from "@/components/shared/StatusBadge";

interface WordCardProps {
  word: Word;
  onClick?: () => void;
}

export default function WordCard({ word }: WordCardProps) {
  return (
    <Link href={`/student/words/${word.id}`} className="block">
      <div
        className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 min-h-[80px] cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98]"
      >
        <div className="flex flex-row justify-between items-start gap-3">
          {/* Left: Hebrew + transliteration */}
          <div className="flex flex-col">
            <span
              dir="rtl"
              lang="he"
              style={{ fontFamily: "'Noto Serif Hebrew', serif" }}
              className="text-2xl font-semibold text-gray-900"
            >
              {word.hebrewNiqqud || word.hebrewPlain}
            </span>
            {word.transliteration && (
              <span className="text-sm text-gray-400 italic mt-0.5">
                {word.transliteration}
              </span>
            )}
          </div>

          {/* Right: English meaning */}
          <div className="flex-shrink-0 text-right">
            <span className="text-base text-gray-700 font-medium">
              {word.english}
            </span>
          </div>
        </div>

        {/* Bottom row: status badge + category */}
        <div className="flex flex-row items-center gap-2 mt-3">
          <StatusBadge status={word.status} />
          <span className="text-xs text-gray-400 bg-gray-50 rounded-full px-2 py-0.5">
            {word.category}
          </span>
        </div>
      </div>
    </Link>
  );
}
