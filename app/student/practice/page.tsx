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

    const { data, error } = await supabase
      .from("words")
      .select("*")
      .eq("is_active", true)
      .eq("is_pending_approval", false)
      .or(`next_review_at.is.null,next_review_at.lte.${now}`)
      .order("next_review_at", { ascending: true, nullsFirst: true });

    if (error) return { words: [], demoMode: false, error: error.message };
    return { words: (data ?? []).map(dbWordToWord), demoMode: false };
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
