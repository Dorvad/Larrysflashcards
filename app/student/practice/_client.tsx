"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { PartyPopper, WifiOff } from "lucide-react";
import { submitReview } from "@/app/actions/practice";
import { PracticeCard } from "@/components/student/PracticeCard";
import type { CardResponse, Word } from "@/types";

function shuffleArray<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function encouragement(knew: number, total: number) {
  const pct = total === 0 ? 0 : knew / total;
  if (pct === 1) return "You remembered every word. Incredible!";
  if (pct >= 0.7) return "That's a great session. Keep it up!";
  if (pct >= 0.4) return "Good effort — the tricky ones will stick soon.";
  return "Every review makes it easier. Come back tomorrow!";
}

export function PracticeClient({
  words: initialWords,
  demoMode,
  error: loadError,
}: {
  words: Word[];
  demoMode: boolean;
  error?: string;
}) {
  const [cards] = useState<Word[]>(() => shuffleArray(initialWords));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<CardResponse[]>([]);
  const [phase, setPhase] = useState<"quiz" | "complete">("quiz");
  const [saveErrors, setSaveErrors] = useState<string[]>([]);
  const [, startTransition] = useTransition();

  function handleResponse(response: CardResponse) {
    const word = cards[currentIndex];

    // Fire-and-forget: user advances immediately, save in background
    startTransition(async () => {
      const res = await submitReview(
        word.id,
        response as "forgot" | "almost" | "knew",
        word.strength
      );
      if (res.error) {
        setSaveErrors((prev) => [...prev, res.error!]);
      }
    });

    const newResponses = [...responses, response];
    setResponses(newResponses);

    if (currentIndex >= cards.length - 1) {
      setPhase("complete");
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }

  // ── Load error ────────────────────────────────────────────────────────────
  if (loadError) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 gap-5 text-center">
        <WifiOff className="w-12 h-12 text-gray-300" />
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Couldn&apos;t load practice</h1>
          <p className="text-base text-gray-400 mt-2">
            Check your connection and try again.
          </p>
        </div>
        <Link
          href="/student"
          className="btn-primary text-lg rounded-2xl px-8 py-4"
        >
          Back home
        </Link>
      </div>
    );
  }

  // ── No words due ──────────────────────────────────────────────────────────
  if (cards.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 gap-6 text-center">
        <div className="animate-pop-in">
          <p className="text-6xl mb-4">🎉</p>
          <h1 className="text-3xl font-bold text-gray-900">All caught up!</h1>
          <p className="text-xl text-gray-500 mt-2">No words due right now.</p>
          <p className="text-base text-gray-400 mt-1">Check back tomorrow.</p>
        </div>
        <Link
          href="/student"
          className="btn-primary text-lg rounded-2xl px-8 py-4 animate-fade-slide-up delay-150"
        >
          Back home
        </Link>
      </div>
    );
  }

  // ── Quiz ──────────────────────────────────────────────────────────────────
  if (phase === "quiz") {
    const currentWord = cards[currentIndex];
    return (
      <div>
        {/* Demo banner */}
        {demoMode && (
          <div className="mx-4 mt-4 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-2 text-sm text-amber-700 text-center">
            Demo mode — results won&apos;t be saved
          </div>
        )}

        {/* Save error banner */}
        {saveErrors.length > 0 && (
          <div className="mx-4 mt-3 bg-rose-50 border border-rose-200 rounded-2xl px-4 py-2 text-sm text-rose-700 text-center">
            Couldn&apos;t save last result — check your connection.
          </div>
        )}

        {/* Stop button */}
        <div className="flex justify-end px-4 pt-5 pb-1">
          <Link
            href="/student"
            className="flex items-center gap-1.5 text-sm font-medium text-gray-400 active:text-gray-600 min-h-[44px] min-w-[44px] justify-end"
          >
            ✕ Stop
          </Link>
        </div>

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

  // ── Complete ──────────────────────────────────────────────────────────────
  const knewCount   = responses.filter((r) => r === "knew").length;
  const almostCount = responses.filter((r) => r === "almost").length;
  const forgotCount = responses.filter((r) => r === "forgot").length;
  const isPerfect   = knewCount === cards.length;

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 gap-6 py-10">
      {/* Title */}
      <div className="animate-pop-in text-center">
        {isPerfect && (
          <PartyPopper className="w-10 h-10 text-amber-400 mx-auto mb-3" />
        )}
        <h1 className="text-3xl font-bold text-gray-900">
          {isPerfect ? "Perfect session!" : "Nice work, Larry."}
        </h1>
        <p className="text-lg text-gray-500 mt-2">
          You practiced {cards.length} word{cards.length === 1 ? "" : "s"}.
        </p>
      </div>

      {/* Score card */}
      <div className="bg-white rounded-3xl p-6 shadow-md w-full max-w-sm animate-fade-slide-up delay-100">
        <div className="flex flex-col gap-4">
          <ScoreRow label="I knew it"      value={knewCount}   color="text-emerald-500" delay={150} />
          <ScoreRow label="Almost"         value={almostCount} color="text-amber-500"   delay={225} />
          <ScoreRow label="Still learning" value={forgotCount} color="text-rose-500"    delay={300} />
        </div>
      </div>

      {/* Encouragement */}
      <p className="text-base text-gray-400 text-center italic animate-fade-slide-up delay-300 max-w-xs">
        {encouragement(knewCount, cards.length)}
      </p>

      {saveErrors.length > 0 && (
        <p className="text-sm text-rose-500 text-center animate-fade-slide-up">
          Some results couldn&apos;t be saved. Check your connection.
        </p>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-3 w-full max-w-sm animate-fade-slide-up delay-375">
        <Link
          href="/student"
          className="btn-primary text-lg w-full text-center rounded-2xl py-4 min-h-[60px] flex items-center justify-center"
        >
          Back home
        </Link>
        <button
          onClick={() => {
            setCurrentIndex(0);
            setResponses([]);
            setPhase("quiz");
            setSaveErrors([]);
          }}
          className="btn-secondary text-lg w-full rounded-2xl py-4 min-h-[60px]"
        >
          Practice again
        </button>
      </div>
    </div>
  );
}

function ScoreRow({
  label,
  value,
  color,
  delay,
}: {
  label: string;
  value: number;
  color: string;
  delay: number;
}) {
  return (
    <div
      className="flex items-center justify-between animate-fade-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <span className="text-base text-gray-700 font-medium">{label}</span>
      <span className={`text-2xl font-bold ${color}`}>{value}</span>
    </div>
  );
}
