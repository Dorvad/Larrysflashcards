import { WORDS } from "@/lib/mock-data";
import { dbWordToWord } from "@/lib/supabase/mappers";
import { StudentPracticeClient } from "./_client";
import type { Word } from "@/types";

async function loadPracticeWords(): Promise<Word[]> {
  const configured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  if (!configured) return WORDS;

  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { data } = await supabase
      .from("words")
      .select("*")
      .eq("is_active", true)
      .eq("is_pending_approval", false)
      .order("created_at", { ascending: false });

    return (data ?? []).map(dbWordToWord);
  } catch {
    return WORDS;
  }
}

export default async function PracticePage() {
  const words = await loadPracticeWords();
  return <StudentPracticeClient words={words} />;
}
