import { WORDS } from "@/lib/mock-data";
import { dbWordToWord } from "@/lib/supabase/mappers";
import { TeacherWordsClient } from "./_client";
import type { Word } from "@/types";

interface LoadResult {
  words: Word[];
  demoMode: boolean;   // true  → no Supabase env vars, showing mock data
  error?: string;      // set   → Supabase configured but query failed
}

async function loadWords(): Promise<LoadResult> {
  const configured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
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

    if (error) {
      return { words: [], demoMode: false, error: error.message };
    }
    return { words: (data ?? []).map(dbWordToWord), demoMode: false };
  } catch (e) {
    return {
      words: [],
      demoMode: false,
      error: e instanceof Error ? e.message : "Unknown error loading words",
    };
  }
}

export default async function WordsPage() {
  const { words, demoMode, error } = await loadWords();
  return <TeacherWordsClient words={words} demoMode={demoMode} error={error} />;
}
