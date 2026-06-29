import { WORDS } from "@/lib/mock-data";
import { loadDueWords } from "@/lib/words";
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
    return await loadDueWords(supabase);
  } catch {
    return WORDS;
  }
}

export default async function PracticePage() {
  const words = await loadPracticeWords();
  return <StudentPracticeClient words={words} />;
}
