"use client";

import { useState, useRef } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getWordById } from "@/lib/mock-data";
import StatusBadge from "@/components/shared/StatusBadge";
import HebrewText from "@/components/shared/HebrewText";
import { Volume2, Play, Pause, Star, ChevronLeft } from "lucide-react";

function AudioButton({ url, label, variant = "primary" }: { url: string; label: string; variant?: "primary" | "ghost" }) {
  const [playing, setPlaying] = useState(false);
  const ref = useRef<HTMLAudioElement>(null);

  function toggle() {
    if (!ref.current) return;
    playing ? ref.current.pause() : ref.current.play();
    setPlaying(!playing);
  }

  return (
    <>
      <button
        type="button"
        onClick={toggle}
        className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 min-h-[44px] text-sm font-semibold transition-all active:scale-[0.96] ${
          variant === "primary"
            ? "bg-sky-500 text-white active:bg-sky-700 shadow-md shadow-sky-200/50"
            : "text-sky-600 bg-sky-50 border border-sky-200 active:bg-sky-100"
        }`}
      >
        {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
        {label}
      </button>
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio ref={ref} src={url} onEnded={() => setPlaying(false)} className="hidden" />
    </>
  );
}

export default function WordDetailPage({ params }: { params: { id: string } }) {
  const word = getWordById(params.id);
  if (!word) notFound();

  return (
    <div className="min-h-screen pb-4">
      {/* Back navigation */}
      <div className="px-4 pt-5 animate-fade-slide-up">
        <Link
          href="/student/words"
          className="inline-flex items-center gap-1 text-sky-500 font-semibold text-sm min-h-[44px]"
        >
          <ChevronLeft className="w-4 h-4" />
          My Words
        </Link>
      </div>

      {/* Hero card */}
      <div className="mx-4 mt-3 bg-white rounded-3xl shadow-md overflow-hidden border border-gray-100/80 animate-pop-in">
        {word.imageUrl && (
          <div className="w-full h-52 sm:h-64 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={word.imageUrl} alt={word.english} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="p-6 text-center flex flex-col items-center gap-3">
          <HebrewText size="xl">{word.hebrewNiqqud}</HebrewText>

          {word.hebrewPlain && word.hebrewPlain !== word.hebrewNiqqud && (
            <p dir="rtl" lang="he" style={{ fontFamily: "'Noto Serif Hebrew', serif" }}
               className="text-2xl text-gray-300">
              {word.hebrewPlain}
            </p>
          )}

          <p className="text-3xl font-bold text-gray-900">{word.english}</p>
          <p className="text-lg text-gray-400 italic">{word.transliteration}</p>

          <div className="flex flex-wrap gap-2 justify-center mt-1">
            <StatusBadge status={word.status} />
            <span className="text-sm bg-gray-100 text-gray-500 rounded-full px-3 py-1">
              {word.category}
            </span>
          </div>

          <div className="mt-1">
            {word.audioUrl ? (
              <AudioButton url={word.audioUrl} label="Hear it" />
            ) : (
              <button disabled className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 min-h-[44px] text-sm text-gray-300 bg-gray-50 border border-gray-100 cursor-not-allowed">
                <Volume2 className="w-4 h-4" /> No audio yet
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 mt-4 flex flex-col gap-4">
        {/* Example sentence */}
        <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100/60 animate-fade-slide-up delay-75">
          <p className="text-[11px] font-semibold text-amber-500 uppercase tracking-widest mb-3">
            Example
          </p>
          <p dir="rtl" lang="he" style={{ fontFamily: "'Noto Serif Hebrew', serif" }}
             className="text-xl text-gray-800 mb-2 leading-relaxed">
            {word.exampleHebrew}
          </p>
          <p className="text-base text-gray-500 italic">{word.exampleEnglish}</p>
          {word.audioExampleUrl && (
            <div className="mt-4">
              <AudioButton url={word.audioExampleUrl} label="Hear example" variant="ghost" />
            </div>
          )}
        </div>

        {/* Teacher note */}
        {word.teacherNote && (
          <div className="bg-sky-50 rounded-2xl p-5 border border-sky-100/60 animate-fade-slide-up delay-150">
            <p className="text-[11px] font-semibold text-sky-500 uppercase tracking-widest mb-2">
              Note from Dor
            </p>
            <p className="text-base text-sky-900">{word.teacherNote}</p>
          </div>
        )}

        {/* Practice history */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100/80 animate-fade-slide-up delay-200">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
            Practice history
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-gray-400 mb-1">Reviewed</p>
              <p className="text-2xl font-bold text-gray-800">
                {word.timesReviewed}
                <span className="text-sm font-normal text-gray-400 ml-1">×</span>
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Strength</p>
              <div className="flex items-center gap-0.5 mt-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${i < word.strength ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"}`}
                  />
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Status</p>
              <div className="mt-1">
                <StatusBadge status={word.status} />
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <Link
          href="/student/practice"
          className="animate-fade-slide-up delay-300 block w-full bg-sky-500 active:bg-sky-700 active:scale-[0.97] text-white text-xl font-bold rounded-2xl py-5 text-center transition-all shadow-lg shadow-sky-200/60 min-h-[68px]"
        >
          Practice this word
        </Link>
      </div>
    </div>
  );
}
