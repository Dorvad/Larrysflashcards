import { WORDS } from "@/lib/mock-data";
import { dbWordToWord } from "@/lib/supabase/mappers";
import { PracticeClient } from "./_client";
import type { Word } from "@/types";

interface LoadResult {
  words: Word[];
  demoMode: boolean;
  error?: string;
}

async function loadDueWords(): Promise<LoadResult> {
  const configured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  if (!configured) {
    return { words: WORDS.slice(0, 5), demoMode: true };
  }

  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const now = new Date().toISOString();

    // Split into two queries to avoid embedding a timestamp with colons
    // inside a PostgREST .or() filter string (causes a parse error).
    const [neverReviewedRes, dueNowRes] = await Promise.all([
      supabase
        .from("words")
        .select("*")
        .eq("is_active", true)
        .eq("is_pending_approval", false)
        .is("next_review_at", null),
      supabase
        .from("words")
        .select("*")
        .eq("is_active", true)
        .eq("is_pending_approval", false)
        .not("next_review_at", "is", null)
        .lte("next_review_at", now),
    ]);

    const error = neverReviewedRes.error ?? dueNowRes.error;
    if (error) return { words: [], demoMode: false, error: error.message };

    const combined = [
      ...(neverReviewedRes.data ?? []),
      ...(dueNowRes.data ?? []),
    ].map(dbWordToWord);

    return { words: combined, demoMode: false };
  } catch (e) {
    return {
      words: [],
      demoMode: false,
      error: e instanceof Error ? e.message : "Could not load practice words",
    };
  }
}

export default async function PracticePage() {
  const { words, demoMode, error } = await loadDueWords();
  return <PracticeClient words={words} demoMode={demoMode} error={error} />;
}
