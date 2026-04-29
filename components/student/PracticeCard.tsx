"use client";

import { useState } from "react";
import { Volume2 } from "lucide-react";
import HebrewText from "@/components/shared/HebrewText";
import type { Word, CardResponse } from "@/types";

interface PracticeCardProps {
  word: Word;
  cardNumber: number;
  totalCards: number;
  onResponse: (response: CardResponse) => void;
}

export function PracticeCard({
  word,
  cardNumber,
  totalCards,
  onResponse,
}: PracticeCardProps) {
  const [revealed, setRevealed] = useState(false);

  const progress = ((cardNumber - 1) / totalCards) * 100;

  return (
    <div className="flex flex-col gap-5 w-full max-w-lg mx-auto">
      {/* Progress */}
      <div>
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>{cardNumber} of {totalCards}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-sky-400 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Card */}
      <div className="bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden">
        {/* Question face */}
        <div className="px-6 pt-10 pb-8 text-center flex flex-col items-center gap-5">
          {/* Hear it — placeholder, visually present but not active */}
          <button
            disabled
            className="flex items-center gap-2 text-sm text-gray-400 bg-gray-50 border border-gray-200 rounded-full px-5 py-2.5 cursor-not-allowed min-h-[44px]"
            aria-label="Audio not yet available"
          >
            <Volume2 className="w-4 h-4" />
            Hear it
          </button>

          {/* Hebrew word — large, prominent */}
          <HebrewText size="2xl">{word.hebrewNiqqud}</HebrewText>

          {!revealed && (
            <p className="text-base text-gray-400 italic">{word.category}</p>
          )}
        </div>

        {/* Revealed answer */}
        {revealed && (
          <div className="border-t border-gray-100 bg-gray-50 px-6 py-6 flex flex-col gap-5 animate-fade-in">
            <div className="text-center">
              <p className="text-3xl font-semibold text-gray-900">{word.english}</p>
              <p className="text-lg text-gray-400 italic mt-1">{word.transliteration}</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <p
                className="text-xl text-gray-700 mb-2 leading-relaxed"
                dir="rtl"
                lang="he"
                style={{ fontFamily: "'Noto Serif Hebrew', serif" }}
              >
                {word.exampleHebrew}
              </p>
              <p className="text-base text-gray-500 italic">{word.exampleEnglish}</p>
            </div>

            {word.teacherNote && (
              <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100">
                <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-1">
                  Note from Dor
                </p>
                <p className="text-base text-amber-800">{word.teacherNote}</p>
              </div>
            )}
          </div>
        )}

        {/* Action area */}
        <div className="px-5 pb-7 pt-4">
          {!revealed ? (
            <button
              onClick={() => setRevealed(true)}
              className="w-full bg-sky-500 active:bg-sky-700 text-white text-xl font-bold py-5 rounded-2xl transition-colors duration-100 active:scale-[0.97] min-h-[68px]"
            >
              Show meaning
            </button>
          ) : (
            <div className="flex flex-col gap-3 animate-slide-up">
              <p className="text-center text-sm text-gray-400 font-medium uppercase tracking-wide">
                How did that go?
              </p>

              {/* Phone: stacked full-width  |  sm+: 3 columns */}
              <div className="flex flex-col gap-3 sm:grid sm:grid-cols-3">
                <ResponseButton
                  onClick={() => onResponse("forgot")}
                  bg="bg-rose-50 active:bg-rose-200"
                  border="border-rose-200"
                  text="text-rose-700"
                  label="I forgot"
                  sublabel="Try again soon"
                />
                <ResponseButton
                  onClick={() => onResponse("almost")}
                  bg="bg-amber-50 active:bg-amber-200"
                  border="border-amber-200"
                  text="text-amber-700"
                  label="Almost"
                  sublabel="Getting there"
                />
                <ResponseButton
                  onClick={() => onResponse("knew")}
                  bg="bg-emerald-50 active:bg-emerald-200"
                  border="border-emerald-200"
                  text="text-emerald-700"
                  label="I knew it"
                  sublabel="Well done"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ResponseButton({
  onClick,
  bg,
  border,
  text,
  label,
  sublabel,
}: {
  onClick: () => void;
  bg: string;
  border: string;
  text: string;
  label: string;
  sublabel: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1 w-full rounded-2xl py-5 px-3
        border transition-all duration-100 active:scale-[0.96] min-h-[72px] sm:min-h-[88px]
        ${bg} ${border}`}
    >
      <span className={`text-lg font-bold leading-tight ${text}`}>{label}</span>
      <span className="text-xs text-gray-400 leading-tight">{sublabel}</span>
    </button>
  );
}
