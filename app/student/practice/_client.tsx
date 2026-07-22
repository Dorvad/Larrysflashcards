"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PracticeCard } from "@/components/student/PracticeCard";
import { addSessionRetryCard, submitReview } from "@/app/actions/practice";
import {
  buildInitialQueue,
  insertForgottenRetry,
  summarizeWordOutcomes,
  type QueueCard,
} from "@/lib/practice-retry";
import type { CardResponse, Word } from "@/types";
import { X } from "lucide-react";

interface Props {
  words: Word[];
  uniqueWordCount: number;
  sessionId?: string;
  totalDueRemaining: number;
  encouragementCount: number;
  error?: string;
}

export function StudentPracticeClient({
  words,
  uniqueWordCount,
  sessionId,
  totalDueRemaining,
  encouragementCount,
  error,
}: Props) {
  const router = useRouter();
  const [queue, setQueue] = useState<QueueCard[]>(() => buildInitialQueue(words));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<CardResponse[]>([]);
  const [retriedWordIds, setRetriedWordIds] = useState<Set<string>>(() => new Set());
  const [phase, setPhase] = useState<"quiz" | "complete">("quiz");
  const [saving, setSaving] = useState(false);

  async function handleResponse(response: CardResponse) {
    const currentCard = queue[currentIndex];
    setSaving(true);

    const result = await submitReview(
      currentCard.word.id,
      response,
      currentCard.word.strength,
      sessionId
    );

    if (result.error) {
      console.error("Could not save review:", result.error);
    }

    let nextQueue = queue;
    if (
      response === "forgot" &&
      !currentCard.isRetry &&
      !retriedWordIds.has(currentCard.word.id)
    ) {
      const retry = insertForgottenRetry(
        queue,
        currentIndex,
        currentCard.word,
        retriedWordIds
      );
      if (retry.inserted) {
        nextQueue = retry.queue;
        setQueue(retry.queue);
        setRetriedWordIds((prev) => new Set(prev).add(currentCard.word.id));
        if (sessionId) {
          const retryResult = await addSessionRetryCard(sessionId);
          if (retryResult.error) {
            console.error("Could not extend session for retry:", retryResult.error);
          }
        }
      }
    }

    setSaving(false);

    const newResponses = [...responses, response];
    setResponses(newResponses);

    if (currentIndex >= nextQueue.length - 1) {
      setPhase("complete");
      router.refresh();
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }

  function handlePracticeMore() {
    // Same-route navigation does not remount this client; bump ?n= so the page key changes.
    router.replace(`/student/practice?n=${Date.now()}`);
  }

  const summary = useMemo(() => {
    const { remembered, willReturn } = summarizeWordOutcomes(queue, responses);
    const knewCount = responses.filter((r) => r === "knew").length;
    const almostCount = responses.filter((r) => r === "almost").length;
    const forgotCount = responses.filter((r) => r === "forgot").length;
    return {
      knewCount,
      almostCount,
      forgotCount,
      remembered,
      willReturn,
      allRemembered: remembered === uniqueWordCount && uniqueWordCount > 0,
    };
  }, [responses, queue, uniqueWordCount]);

  if (words.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 gap-6 text-center">
        <div className="animate-pop-in">
          <h1 className="text-3xl font-bold text-gray-900">All caught up</h1>
          <p className="text-xl text-gray-500 mt-2">No words due right now.</p>
        </div>
        <Link href="/student" className="btn-primary text-lg rounded-2xl px-8 py-4 animate-fade-slide-up delay-150">
          Back home
        </Link>
      </div>
    );
  }

  if (phase === "quiz") {
    const currentCard = queue[currentIndex];
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
            <p className="text-sm text-gray-500 text-center mb-1">
              A short session — starting with a word you know well.
            </p>
          )}
          {error && (
            <p className="text-xs text-amber-600 text-center mb-2">{error}</p>
          )}
        </div>

        <div key={`${currentIndex}-${currentCard.word.id}-${currentCard.isRetry}`} className="px-4 pb-6 animate-card-enter">
          <PracticeCard
            word={currentCard.word}
            cardNumber={currentIndex + 1}
            totalCards={queue.length}
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
        <h1 className="text-3xl font-bold text-gray-900">Session complete</h1>
        {summary.allRemembered ? (
          <p className="text-lg text-gray-500 mt-2">
            You remembered all {uniqueWordCount} word{uniqueWordCount === 1 ? "" : "s"} today.
          </p>
        ) : (
          <>
            <p className="text-lg text-gray-500 mt-2">
              You practised {uniqueWordCount} word{uniqueWordCount === 1 ? "" : "s"}.
            </p>
            <p className="text-base text-gray-500 mt-1">
              {summary.remembered} were remembered, and {summary.willReturn} will return soon.
            </p>
          </>
        )}
        {totalDueRemaining > 0 && (
          <p className="text-base text-gray-400 mt-3">
            {totalDueRemaining} more word{totalDueRemaining === 1 ? "" : "s"} remain for later sessions.
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
