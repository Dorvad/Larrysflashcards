"use client";

import { useState, useRef } from "react";
import { Volume2, Play, Pause, X, Minus, Check } from "lucide-react";
import HebrewText from "@/components/shared/HebrewText";
import type { Word, CardResponse } from "@/types";

interface PracticeCardProps {
  word: Word;
  cardNumber: number;
  totalCards: number;
  onResponse: (response: CardResponse) => void;
  disabled?: boolean;
}

export function PracticeCard({
  word,
  cardNumber,
  totalCards,
  onResponse,
  disabled = false,
}: PracticeCardProps) {
  const [revealed, setRevealed] = useState(false);
  const [wordPlaying, setWordPlaying] = useState(false);
  const [examplePlaying, setExamplePlaying] = useState(false);
  const wordAudioRef = useRef<HTMLAudioElement>(null);
  const exampleAudioRef = useRef<HTMLAudioElement>(null);

  const progress = ((cardNumber - 1) / totalCards) * 100;

  function toggleWordAudio() {
    const audio = wordAudioRef.current;
    if (!audio) return;
    if (wordPlaying) { audio.pause(); } else { audio.currentTime = 0; audio.play(); }
    setWordPlaying(!wordPlaying);
  }

  function toggleExampleAudio() {
    const audio = exampleAudioRef.current;
    if (!audio) return;
    if (examplePlaying) { audio.pause(); } else { audio.currentTime = 0; audio.play(); }
    setExamplePlaying(!examplePlaying);
  }

  return (
    <div className="flex flex-col gap-5 w-full max-w-lg mx-auto">
      {/* Progress */}
      <div className="animate-fade-slide-up">
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>{cardNumber} of {totalCards}</span>
          <span>{Math.round(((cardNumber) / totalCards) * 100)}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-sky-400 to-sky-500 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${(cardNumber / totalCards) * 100}%` }}
          />
        </div>
      </div>

      {/* Card */}
      <div className="bg-white rounded-3xl shadow-[0_4px_32px_rgba(0,0,0,0.10)] border border-gray-100 overflow-hidden">
        {/* Image */}
        {word.imageUrl && (
          <div className="w-full h-40 sm:h-48 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={word.imageUrl} alt={word.english} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Question face */}
        <div className="bg-gradient-to-b from-sky-50/80 to-white px-6 pt-8 pb-6 text-center flex flex-col items-center gap-5">
          {word.audioUrl ? (
            <button
              type="button"
              onClick={toggleWordAudio}
              className="flex items-center gap-2 text-sm font-semibold text-sky-600 bg-sky-50 border border-sky-200 rounded-full px-5 py-2.5 min-h-[44px] active:bg-sky-100 active:scale-[0.97] transition-all"
            >
              {wordPlaying ? <Pause className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              {wordPlaying ? "Playing…" : "Hear it"}
            </button>
          ) : (
            <button
              disabled
              className="flex items-center gap-2 text-sm text-gray-300 bg-gray-50 border border-gray-100 rounded-full px-5 py-2.5 cursor-not-allowed min-h-[44px]"
            >
              <Volume2 className="w-4 h-4" />
              Hear it
            </button>
          )}

          <HebrewText size="2xl">{word.hebrewNiqqud}</HebrewText>

          {!revealed && (
            <p className="text-base text-gray-400 italic">{word.category}</p>
          )}
        </div>

        {/* Revealed answer */}
        {revealed && (
          <div className="border-t border-gray-100 bg-gray-50/80 px-6 py-6 flex flex-col gap-5 animate-fade-in">
            <div className="text-center animate-pop-in">
              <p className="text-3xl font-bold text-gray-900">{word.english}</p>
              <p className="text-lg text-gray-400 italic mt-1">{word.transliteration}</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-100 animate-fade-slide-up delay-75">
              <p
                className="text-xl text-gray-700 mb-2 leading-relaxed"
                dir="rtl"
                lang="he"
                style={{ fontFamily: "'Noto Serif Hebrew', serif" }}
              >
                {word.exampleHebrew}
              </p>
              <p className="text-base text-gray-500 italic">{word.exampleEnglish}</p>
              {word.audioExampleUrl && (
                <button
                  type="button"
                  onClick={toggleExampleAudio}
                  className="mt-3 flex items-center gap-2 text-sm font-medium text-sky-600 active:text-sky-800"
                >
                  {examplePlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  Hear the example
                </button>
              )}
            </div>

            {word.teacherNote && (
              <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100 animate-fade-slide-up delay-150">
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
              className="w-full bg-sky-500 active:bg-sky-700 text-white text-xl font-bold py-5 rounded-2xl transition-all duration-100 active:scale-[0.97] shadow-md shadow-sky-200/50 min-h-[68px]"
            >
              Show meaning
            </button>
          ) : (
            <div className="flex flex-col gap-3 animate-slide-up">
              <p className="text-center text-xs text-gray-400 font-semibold uppercase tracking-widest">
                How did that go?
              </p>
              <div className="flex flex-col gap-3 sm:grid sm:grid-cols-3">
                <ResponseButton
                  onClick={() => onResponse("forgot")}
                  disabled={disabled}
                  bg="bg-rose-100 active:bg-rose-200"
                  border="border-rose-300"
                  textColor="text-rose-800"
                  icon={<X className="w-5 h-5" />}
                  label="I forgot"
                  sublabel="Try again soon"
                />
                <ResponseButton
                  onClick={() => onResponse("almost")}
                  disabled={disabled}
                  bg="bg-amber-100 active:bg-amber-200"
                  border="border-amber-300"
                  textColor="text-amber-800"
                  icon={<Minus className="w-5 h-5" />}
                  label="Almost"
                  sublabel="Getting there"
                />
                <ResponseButton
                  onClick={() => onResponse("knew")}
                  disabled={disabled}
                  bg="bg-emerald-100 active:bg-emerald-200"
                  border="border-emerald-300"
                  textColor="text-emerald-800"
                  icon={<Check className="w-5 h-5" />}
                  label="I knew it!"
                  sublabel="Well done"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {word.audioUrl && (
        // eslint-disable-next-line jsx-a11y/media-has-caption
        <audio ref={wordAudioRef} src={word.audioUrl} onEnded={() => setWordPlaying(false)} className="hidden" />
      )}
      {word.audioExampleUrl && (
        // eslint-disable-next-line jsx-a11y/media-has-caption
        <audio ref={exampleAudioRef} src={word.audioExampleUrl} onEnded={() => setExamplePlaying(false)} className="hidden" />
      )}
    </div>
  );
}

function ResponseButton({
  onClick,
  bg,
  border,
  textColor,
  icon,
  label,
  sublabel,
  disabled = false,
}: {
  onClick: () => void;
  bg: string;
  border: string;
  textColor: string;
  icon: React.ReactNode;
  label: string;
  sublabel: string;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex flex-col items-center justify-center gap-1.5 w-full rounded-2xl py-5 px-3 border transition-all duration-100 active:scale-[0.96] min-h-[72px] sm:min-h-[88px] disabled:opacity-50 disabled:cursor-not-allowed ${bg} ${border}`}
    >
      <span className={`${textColor}`}>{icon}</span>
      <span className={`text-lg font-bold leading-tight ${textColor}`}>{label}</span>
      <span className="text-xs text-gray-500 leading-tight">{sublabel}</span>
    </button>
  );
}
