"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PracticeCard } from "@/components/student/PracticeCard";
import { submitReview } from "@/app/actions/practice";
import type { CardResponse, Word } from "@/types";
import { X, PartyPopper, Sparkles } from "lucide-react";

interface Props {
  words: Word[];
  sessionId?: string;
  totalDueRemaining: number;
  encouragementCount: number;
  error?: string;
}

export function StudentPracticeClient({
  words,
  sessionId,
  totalDueRemaining,
  encouragementCount,
  error,
}: Props) {
  const router = useRouter();
  const [cards] = useState<Word[]>(words);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<CardResponse[]>([]);
  const [phase, setPhase] = useState<"quiz" | "complete">("quiz");
  const [saving, setSaving] = useState(false);

  async function handleResponse(response: CardResponse) {
    const currentWord = cards[currentIndex];
    setSaving(true);

    const result = await submitReview(
      currentWord.id,
      response,
      currentWord.strength,
      sessionId
    );

    setSaving(false);

    if (result.error) {
      console.error("Could not save review:", result.error);
    }

    const newResponses = [...responses, response];
    setResponses(newResponses);

    if (currentIndex >= cards.length - 1) {
      setPhase("complete");
      router.refresh();
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }

  function handlePracticeMore() {
    router.push("/student/practice");
    router.refresh();
  }

  const summary = useMemo(() => {
    const knewCount = responses.filter((r) => r === "knew").length;
    const almostCount = responses.filter((r) => r === "almost").length;
    const forgotCount = responses.filter((r) => r === "forgot").length;
    return {
      knewCount,
      almostCount,
      forgotCount,
      isPerfect: knewCount === cards.length,
    };
  }, [responses, cards.length]);

  if (cards.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 gap-6 text-center">
        <div className="animate-pop-in">
          <p className="text-5xl mb-4">🎉</p>
          <h1 className="text-3xl font-bold text-gray-900">All caught up!</h1>
          <p className="text-xl text-gray-500 mt-2">No words due right now.</p>
        </div>
        <Link href="/student" className="btn-primary text-lg rounded-2xl px-8 py-4 animate-fade-slide-up delay-150">
          Back home
        </Link>
      </div>
    );
  }

  if (phase === "quiz") {
    const currentWord = cards[currentIndex];
    return (
      <div>
        <div className="px-4 pt-5 pb-1">
          <div className="flex justify-end mb-2">
            <Link
              href="/student"
              className="flex items-center gap-1.5 text-sm font-medium text-gray-400 active:text-gray-600 min-h-[44px] min-w-[44px] justify-end"
            >
              <X className="w-5 h-5" />
              Stop
            </Link>
          </div>
          {encouragementCount > 0 && currentIndex === 0 && (
            <p className="text-sm text-sky-600 text-center flex items-center justify-center gap-1.5 mb-1">
              <Sparkles className="w-4 h-4" />
              This session mixes review words with a few you already know well.
            </p>
          )}
          {error && (
            <p className="text-xs text-amber-600 text-center mb-2">{error}</p>
          )}
        </div>

        <div key={currentIndex} className="px-4 pb-6 animate-card-enter">
          <PracticeCard
            word={currentWord}
            cardNumber={currentIndex + 1}
            totalCards={cards.length}
            onResponse={handleResponse}
            disabled={saving}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 gap-6">
      <div className="animate-pop-in text-center">
        {summary.isPerfect && <PartyPopper className="w-10 h-10 text-amber-400 mx-auto mb-3" />}
        <h1 className="text-3xl font-bold text-gray-900">
          {summary.isPerfect ? "Perfect session!" : "Nice work, Larry."}
        </h1>
        <p className="text-lg text-gray-500 mt-2">
          You practiced {cards.length} word{cards.length === 1 ? "" : "s"} this round.
        </p>
        {totalDueRemaining > 0 && (
          <p className="text-base text-sky-600 mt-2 font-medium">
            {totalDueRemaining} more word{totalDueRemaining === 1 ? "" : "s"} ready for your next session.
          </p>
        )}
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-md w-full max-w-sm animate-fade-slide-up delay-100">
        <div className="flex flex-col gap-4">
          <ScoreRow label="I knew it" value={summary.knewCount} color="text-emerald-500" delay={150} />
          <ScoreRow label="Almost" value={summary.almostCount} color="text-amber-500" delay={225} />
          <ScoreRow label="Still learning" value={summary.forgotCount} color="text-rose-500" delay={300} />
        </div>
      </div>

      {summary.forgotCount > 0 && (
        <p className="text-sm text-gray-400 text-center italic animate-fade-slide-up delay-375">
          We&apos;ll bring the harder words back soon.
        </p>
      )}

      <div className="flex flex-col gap-3 w-full max-w-sm animate-fade-slide-up delay-375">
        {totalDueRemaining > 0 ? (
          <button onClick={handlePracticeMore} className="btn-primary text-lg w-full rounded-2xl py-4">
            Next session
          </button>
        ) : (
          <button onClick={handlePracticeMore} className="btn-primary text-lg w-full rounded-2xl py-4">
            Practice again
          </button>
        )}
        <Link href="/student" className="btn-secondary text-lg w-full text-center rounded-2xl py-4">
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
