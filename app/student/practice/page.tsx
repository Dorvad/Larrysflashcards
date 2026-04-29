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
      <div className="bg-[#F7F5F0]">
        {/* Top bar */}
        <div className="px-4 pt-5 pb-1 flex items-center max-w-lg mx-auto">
          <Link
            href="/student"
            className="flex items-center gap-2 text-gray-400 min-h-[48px] pr-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-base">Stop</span>
          </Link>
        </div>

        {/* Practice card — key change triggers slide-in animation */}
        <div key={currentIndex} className="px-4 pb-6 animate-card-enter">
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
      <div className="animate-slide-up text-center">
        <h1 className="text-3xl font-bold text-gray-900">
          {knewCount === cards.length ? "Perfect session!" : "Nice work, Larry."}
        </h1>
        <p className="text-xl text-gray-500 mt-2">
          You practiced {cards.length} word{cards.length === 1 ? "" : "s"}.
        </p>
      </div>

      {/* Score summary */}
      <div className="bg-white rounded-3xl p-6 shadow-md max-w-sm w-full animate-slide-up delay-75">
        <div className="flex flex-col gap-4">
          <ScoreRow label="I knew it" value={knewCount} color="text-emerald-600" />
          <ScoreRow label="Almost" value={almostCount} color="text-amber-500" />
          <ScoreRow label="Still learning" value={forgotCount} color="text-rose-500" />
        </div>
      </div>

      {forgotCount > 0 && (
        <p className="text-base text-gray-400 text-center italic animate-slide-up delay-150">
          We&apos;ll bring the harder words back soon.
        </p>
      )}

      <div className="flex flex-col gap-3 max-w-sm w-full animate-slide-up delay-225">
        <button
          onClick={handlePracticeMore}
          className="btn-primary text-lg w-full rounded-2xl py-4"
        >
          Practice again
        </button>
        <Link
          href="/student"
          className="btn-secondary text-lg w-full text-center rounded-2xl py-4"
        >
          Back home
        </Link>
      </div>
    </div>
  );
}

function ScoreRow({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-base text-gray-700 font-medium">{label}</span>
      <span className={`text-2xl font-bold ${color}`}>{value}</span>
    </div>
  );
}
