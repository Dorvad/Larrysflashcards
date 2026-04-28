"use client";

import { useState } from "react";
import type { Word } from "@/types/database";
import type { PracticeMode } from "@/types/database";

interface FlashcardProps {
  word: Word;
  mode: PracticeMode;
  cardNumber: number;
  totalCards: number;
  onCorrect: () => void;
  onIncorrect: () => void;
  onSkip: () => void;
}

export function Flashcard({
  word,
  mode,
  cardNumber,
  totalCards,
  onCorrect,
  onIncorrect,
  onSkip,
}: FlashcardProps) {
  const [revealed, setRevealed] = useState(false);

  // Determine which side is shown first
  const showHebrewFirst =
    mode === "hebrew_to_english" ||
    (mode === "mixed" && Math.random() > 0.5);

  const frontText = showHebrewFirst ? word.hebrew : word.english;
  const backText = showHebrewFirst ? word.english : word.hebrew;
  const frontIsHebrew = showHebrewFirst;
  const backIsHebrew = !showHebrewFirst;

  function handleReveal() {
    if (!revealed) setRevealed(true);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      if (!revealed) handleReveal();
    }
  }

  return (
    <div className="flex flex-col items-center w-full max-w-lg mx-auto">
      {/* Progress indicator */}
      <div className="w-full mb-6">
        <div className="flex justify-between text-base text-gray-500 mb-2">
          <span>
            Card {cardNumber} of {totalCards}
          </span>
          <span>{Math.round(((cardNumber - 1) / totalCards) * 100)}%</span>
        </div>
        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-sky-400 rounded-full transition-all duration-500"
            style={{ width: `${((cardNumber - 1) / totalCards) * 100}%` }}
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Card */}
      <div
        role="button"
        tabIndex={0}
        onClick={handleReveal}
        onKeyDown={handleKeyDown}
        aria-label={
          revealed
            ? "Card revealed"
            : `Tap to reveal the ${showHebrewFirst ? "English" : "Hebrew"}`
        }
        className={`
          w-full min-h-[280px] bg-white rounded-3xl shadow-card p-8
          flex flex-col items-center justify-center gap-4 text-center
          transition-all duration-200 select-none
          ${!revealed ? "cursor-pointer hover:shadow-card-hover active:scale-[0.98]" : ""}
        `}
      >
        {/* Front side — always visible */}
        <div className="w-full">
          {word.word_set_id && (
            <p className="text-base text-gray-400 mb-4 uppercase tracking-wide">
              {frontIsHebrew ? "Hebrew" : "English"}
            </p>
          )}
          <p
            className={
              frontIsHebrew ? "hebrew-lg text-gray-800" : "text-3xl font-semibold text-gray-800"
            }
            lang={frontIsHebrew ? "he" : "en"}
            dir={frontIsHebrew ? "rtl" : "ltr"}
          >
            {frontText}
          </p>
          {frontIsHebrew && word.transliteration && (
            <p className="text-lg text-gray-400 mt-3 italic">
              {word.transliteration}
            </p>
          )}
        </div>

        {/* Back side — shown after reveal */}
        {revealed ? (
          <div className="w-full border-t border-gray-100 pt-4 mt-2 animate-fade-in">
            <p className="text-base text-gray-400 mb-2 uppercase tracking-wide">
              {backIsHebrew ? "Hebrew" : "English"}
            </p>
            <p
              className={
                backIsHebrew
                  ? "hebrew text-gray-800"
                  : "text-2xl font-semibold text-gray-800"
              }
              lang={backIsHebrew ? "he" : "en"}
              dir={backIsHebrew ? "rtl" : "ltr"}
            >
              {backText}
            </p>
            {backIsHebrew && word.transliteration && (
              <p className="text-base text-gray-400 mt-2 italic">
                {word.transliteration}
              </p>
            )}
            {word.notes && (
              <p className="mt-3 text-base text-gray-500 italic">
                {word.notes}
              </p>
            )}
          </div>
        ) : (
          <p className="text-base text-gray-400 mt-4">
            Tap to reveal
          </p>
        )}
      </div>

      {/* Action buttons — only shown after reveal */}
      {revealed ? (
        <div className="mt-6 w-full grid grid-cols-3 gap-3 animate-slide-up">
          <button
            onClick={onIncorrect}
            className="flex flex-col items-center justify-center gap-1 min-h-[72px] bg-red-50 hover:bg-red-100 active:bg-red-200 rounded-2xl transition-colors"
            aria-label="I didn't know this"
          >
            <span className="text-2xl" aria-hidden="true">
              ✗
            </span>
            <span className="text-sm font-medium text-red-600">
              Still learning
            </span>
          </button>

          <button
            onClick={onSkip}
            className="flex flex-col items-center justify-center gap-1 min-h-[72px] bg-gray-50 hover:bg-gray-100 active:bg-gray-200 rounded-2xl transition-colors"
            aria-label="Skip this card"
          >
            <span className="text-2xl" aria-hidden="true">
              →
            </span>
            <span className="text-sm font-medium text-gray-500">Skip</span>
          </button>

          <button
            onClick={onCorrect}
            className="flex flex-col items-center justify-center gap-1 min-h-[72px] bg-green-50 hover:bg-green-100 active:bg-green-200 rounded-2xl transition-colors"
            aria-label="I knew this"
          >
            <span className="text-2xl" aria-hidden="true">
              ✓
            </span>
            <span className="text-sm font-medium text-green-600">
              Got it!
            </span>
          </button>
        </div>
      ) : (
        <div className="mt-6">
          <button
            onClick={onSkip}
            className="text-base text-gray-400 hover:text-gray-600 underline underline-offset-4 py-2"
            aria-label="Skip this card without revealing"
          >
            Skip
          </button>
        </div>
      )}
    </div>
  );
}
