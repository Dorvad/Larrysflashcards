"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Flashcard } from "./Flashcard";
import { createClient } from "@/lib/supabase/client";
import { shuffle } from "@/lib/utils";
import type { Word, PracticeMode, CardResult } from "@/types/database";

interface PracticeSessionProps {
  words: Word[];
  mode: PracticeMode;
  studentId: string;
  wordSetId?: string;
  studentName: string;
}

interface PendingResult {
  word_id: string;
  result: CardResult;
  response_ms: number;
}

export function PracticeSession({
  words,
  mode,
  studentId,
  wordSetId,
  studentName,
}: PracticeSessionProps) {
  const router = useRouter();
  const supabase = createClient();

  const [deck] = useState<Word[]>(() => shuffle(words));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<PendingResult[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const cardStartTime = useRef(Date.now());

  const currentWord = deck[currentIndex];

  // Create the session record on first answer
  async function ensureSession(): Promise<string> {
    if (sessionId) return sessionId;

    const { data, error } = await supabase
      .from("practice_sessions")
      .insert({
        student_id: studentId,
        word_set_id: wordSetId ?? null,
        mode,
        total_cards: deck.length,
      })
      .select("id")
      .single();

    if (error || !data) throw new Error("Could not start session");
    setSessionId(data.id);
    return data.id;
  }

  const advance = useCallback(
    async (result: CardResult) => {
      const response_ms = Date.now() - cardStartTime.current;
      const newResult: PendingResult = {
        word_id: currentWord.id,
        result,
        response_ms,
      };

      const updatedResults = [...results, newResult];
      setResults(updatedResults);

      const isLast = currentIndex === deck.length - 1;

      if (isLast) {
        setSaving(true);
        try {
          const sid = await ensureSession();

          // Save all results
          await supabase.from("practice_results").insert(
            updatedResults.map((r) => ({ ...r, session_id: sid }))
          );

          // Update session totals
          const correct = updatedResults.filter(
            (r) => r.result === "correct"
          ).length;
          const skipped = updatedResults.filter(
            (r) => r.result === "skipped"
          ).length;

          await supabase
            .from("practice_sessions")
            .update({
              completed_at: new Date().toISOString(),
              correct_count: correct,
              skipped_count: skipped,
            })
            .eq("id", sid);

          router.push(`/practice/complete?session=${sid}`);
        } catch {
          // Even if save fails, navigate to complete
          router.push("/practice/complete");
        }
      } else {
        setCurrentIndex((i) => i + 1);
        cardStartTime.current = Date.now();
      }
    },
    [currentIndex, currentWord, deck, results, sessionId, router, supabase, wordSetId, studentId, mode]
  );

  if (saving) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p className="text-xl text-gray-500">Saving results…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Minimal top bar during practice — no distractions */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <p className="text-lg font-medium text-gray-600">
            Practising, {studentName}
          </p>
          <button
            onClick={() => router.push("/practice")}
            className="text-base text-gray-400 hover:text-gray-600 underline underline-offset-4 min-h-[44px] px-2"
          >
            Quit
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-8">
        <Flashcard
          key={currentWord.id}
          word={currentWord}
          mode={mode}
          cardNumber={currentIndex + 1}
          totalCards={deck.length}
          onCorrect={() => advance("correct")}
          onIncorrect={() => advance("incorrect")}
          onSkip={() => advance("skipped")}
        />
      </main>
    </div>
  );
}
