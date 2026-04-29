import { WORDS } from "@/lib/mock-data";
import { dbWordToWord } from "@/lib/supabase/mappers";
import { TeacherWordsClient } from "./_client";
import type { Word } from "@/types";

async function loadWords(): Promise<Word[]> {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return WORDS;
  }
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { data } = await supabase
      .from("words")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });
    if (!data || data.length === 0) return WORDS;
    return data.map(dbWordToWord);
  } catch {
    return WORDS;
  }
}

export default async function WordsPage() {
  const words = await loadWords();
  return <TeacherWordsClient words={words} />;
}
