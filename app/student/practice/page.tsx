import { WORDS } from "@/lib/mock-data";
import {
  buildSessionDeck,
  estimateNextSessionSize,
} from "@/lib/practice-session";
import {
  familiarWords,
  loadActiveWords,
  loadDueWords,
} from "@/lib/words";
import { startPracticeSession } from "@/app/actions/practice";
import { StudentPracticeClient } from "./_client";
import type { Word } from "@/types";

interface PracticePageData {
  words: Word[];
  sessionId?: string;
  totalDueRemaining: number;
  encouragementCount: number;
  error?: string;
}

async function loadPracticeSession(): Promise<PracticePageData> {
  const configured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  if (!configured) {
    const due = WORDS.filter((w) => !w.nextReview || w.nextReview <= new Date().toISOString());
    const familiar = WORDS.filter(
      (w) => w.strength >= 3 && !due.some((d) => d.id === w.id)
    );
    const built = buildSessionDeck(due, familiar);
    return {
      words: built.cards,
      totalDueRemaining: built.totalDueRemaining,
      encouragementCount: built.encouragementCount,
    };
  }

  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const [dueWords, activeWords] = await Promise.all([
      loadDueWords(supabase),
      loadActiveWords(supabase),
    ]);
    const built = buildSessionDeck(dueWords, familiarWords(dueWords, activeWords));

    if (built.cards.length === 0) {
      return {
        words: [],
        totalDueRemaining: 0,
        encouragementCount: 0,
      };
    }

    const started = await startPracticeSession(built);

    return {
      words: built.cards,
      sessionId: started.sessionId,
      totalDueRemaining: built.totalDueRemaining,
      encouragementCount: built.encouragementCount,
      error:
        started.error && !started.error.includes("practice_sessions")
          ? started.error
          : undefined,
    };
  } catch {
    const due = WORDS.filter((w) => !w.nextReview || w.nextReview <= new Date().toISOString());
    const familiar = WORDS.filter(
      (w) => w.strength >= 3 && !due.some((d) => d.id === w.id)
    );
    const built = buildSessionDeck(due, familiar);
    return {
      words: built.cards,
      totalDueRemaining: built.totalDueRemaining,
      encouragementCount: built.encouragementCount,
    };
  }
}


export default async function PracticePage() {
  const data = await loadPracticeSession();
  return (
    <StudentPracticeClient
      words={data.words}
      sessionId={data.sessionId}
      totalDueRemaining={data.totalDueRemaining}
      encouragementCount={data.encouragementCount}
      error={data.error}
    />
  );
}
