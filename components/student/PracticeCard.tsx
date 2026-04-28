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
    <div className="flex flex-col gap-6 w-full max-w-lg mx-auto">
      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>
            {cardNumber} of {totalCards}
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-sky-400 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Flash card */}
      <div className="bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden">
        {/* Question face */}
        <div className="px-6 pt-10 pb-8 text-center flex flex-col items-center gap-4">
          {/* Audio placeholder */}
          <button
            disabled
            className="flex items-center gap-2 text-sm text-gray-300 bg-gray-50 rounded-full px-4 py-2 cursor-not-allowed"
            aria-label="Audio coming soon"
          >
            <Volume2 className="w-4 h-4" />
            Hear it
          </button>

          <HebrewText size="xl">{word.hebrewNiqqud}</HebrewText>

          {!revealed && (
            <p className="text-sm text-gray-400 mt-1">
              {word.category}
            </p>
          )}
        </div>

        {/* Revealed answer */}
        {revealed && (
          <div className="border-t border-gray-100 bg-gray-50 px-6 py-6 flex flex-col gap-4 animate-fade-in">
            <div className="text-center">
              <p className="text-3xl font-semibold text-gray-900">
                {word.english}
              </p>
              <p className="text-base text-gray-400 italic mt-1">
                {word.transliteration}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-gray-100">
              <p
                className="text-lg text-gray-700 mb-1"
                dir="rtl"
                lang="he"
                style={{ fontFamily: "'Noto Serif Hebrew', serif" }}
              >
                {word.exampleHebrew}
              </p>
              <p className="text-sm text-gray-500 italic">
                {word.exampleEnglish}
              </p>
            </div>

            {word.teacherNote && (
              <div className="flex gap-2 bg-amber-50 rounded-2xl p-4 border border-amber-100">
                <span className="text-lg shrink-0">💬</span>
                <p className="text-sm text-amber-800">{word.teacherNote}</p>
              </div>
            )}
          </div>
        )}

        {/* Action area */}
        <div className="px-6 pb-8 pt-4">
          {!revealed ? (
            <button
              onClick={() => setRevealed(true)}
              className="w-full bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white text-lg font-semibold py-4 rounded-2xl transition-colors min-h-[60px]"
            >
              Show meaning
            </button>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-center text-sm text-gray-400 font-medium uppercase tracking-wide">
                How did you do?
              </p>
              <div className="grid grid-cols-3 gap-3">
                <ResponseButton
                  onClick={() => onResponse("forgot")}
                  bg="bg-rose-50 hover:bg-rose-100 active:bg-rose-200"
                  text="text-rose-700"
                  emoji="😕"
                  label="I forgot"
                />
                <ResponseButton
                  onClick={() => onResponse("almost")}
                  bg="bg-amber-50 hover:bg-amber-100 active:bg-amber-200"
                  text="text-amber-700"
                  emoji="🤔"
                  label="Almost"
                />
                <ResponseButton
                  onClick={() => onResponse("knew")}
                  bg="bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200"
                  text="text-emerald-700"
                  emoji="✓"
                  label="I knew it"
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
  text,
  emoji,
  label,
}: {
  onClick: () => void;
  bg: string;
  text: string;
  emoji: string;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1.5 rounded-2xl py-4 px-2 min-h-[80px] transition-colors ${bg}`}
    >
      <span className="text-2xl leading-none">{emoji}</span>
      <span className={`text-sm font-semibold ${text}`}>{label}</span>
    </button>
  );
}
