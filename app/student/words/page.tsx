import { WORDS } from "@/lib/mock-data";
import { dbWordToWord } from "@/lib/supabase/mappers";
import { StudentWordsClient } from "./_client";
import type { Word } from "@/types";

interface LoadResult {
  words: Word[];
  demoMode: boolean;
  error?: string;
}

async function loadWords(): Promise<LoadResult> {
  const configured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  if (!configured) {
    return { words: WORDS, demoMode: true };
  }

  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("words")
      .select("*")
      .eq("is_active", true)
      .eq("is_pending_approval", false)
      .order("created_at", { ascending: false });

    if (error) return { words: [], demoMode: false, error: error.message };
    return { words: (data ?? []).map(dbWordToWord), demoMode: false };
  } catch (e) {
    return {
      words: [],
      demoMode: false,
      error: e instanceof Error ? e.message : "Could not load words",
    };
  }
}

export default async function WordsPage() {
  const { words, demoMode, error } = await loadWords();
  return <StudentWordsClient words={words} demoMode={demoMode} error={error} />;
}
