"use client";

import { useState } from "react";
import Link from "next/link";
import { getDueToday } from "@/lib/mock-data";
import { PracticeCard } from "@/components/student/PracticeCard";
import type { CardResponse, Word } from "@/types";
import { ArrowLeft } from "lucide-react";

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function PracticePage() {
  const [cards] = useState<Word[]>(() => shuffleArray(getDueToday()));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<CardResponse[]>([]);
  const [phase, setPhase] = useState<"quiz" | "complete">("quiz");

  function handleResponse(response: CardResponse) {
    const newResponses = [...responses, response];
    setResponses(newResponses);

    if (currentIndex >= cards.length - 1) {
      setPhase("complete");
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  }

  function handlePracticeMore() {
    setCurrentIndex(0);
    setResponses([]);
    setPhase("quiz");
  }

  if (phase === "quiz") {
    const currentWord = cards[currentIndex];

    return (
      <div className="bg-[#F7F5F0] min-h-screen">
        {/* Top bar */}
        <div className="px-4 pt-6 pb-4 flex items-center justify-between">
          <Link
            href="/student"
            className="flex items-center gap-2 text-gray-400 min-h-[48px]"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Stop practice</span>
          </Link>
        </div>

        {/* Practice card */}
        <div className="px-4 py-4">
          <PracticeCard
            word={currentWord}
            cardNumber={currentIndex + 1}
            totalCards={cards.length}
            onResponse={handleResponse}
          />
        </div>
      </div>
    );
  }

  // Complete phase
  const knewCount = responses.filter((r) => r === "knew").length;
  const almostCount = responses.filter((r) => r === "almost").length;
  const forgotCount = responses.filter((r) => r === "forgot").length;

  return (
    <div className="bg-[#F7F5F0] min-h-screen flex flex-col items-center justify-center px-6 gap-6">
      {/* Celebration */}
      <span className="text-6xl" aria-hidden="true">
        ✨
      </span>
      <h1 className="text-3xl font-bold text-gray-900 text-center">
        Nice work, Larry!
      </h1>
      <p className="text-xl text-gray-600 text-center">
        You practiced {cards.length} words today.
      </p>

      {/* Score summary */}
      <div className="bg-white rounded-3xl p-6 shadow-md max-w-sm w-full">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-base text-emerald-700 font-medium">
              I knew it
            </span>
            <span className="text-xl font-bold text-emerald-600">
              {knewCount}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-base text-amber-700 font-medium">
              Almost
            </span>
            <span className="text-xl font-bold text-amber-600">
              {almostCount}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-base text-rose-700 font-medium">
              Still learning
            </span>
            <span className="text-xl font-bold text-rose-600">
              {forgotCount}
            </span>
          </div>
        </div>
      </div>

      <p className="text-base text-gray-500 text-center italic">
        We&apos;ll bring the harder words back soon.
      </p>

      {/* Action buttons */}
      <div className="flex flex-col gap-3 max-w-sm w-full">
        <Link
          href="/student"
          className="btn-secondary text-lg w-full text-center rounded-2xl py-4"
        >
          Back home
        </Link>
        <button
          onClick={handlePracticeMore}
          className="btn-primary text-lg w-full rounded-2xl py-4"
        >
          Practice more
        </button>
      </div>
    </div>
  );
}
