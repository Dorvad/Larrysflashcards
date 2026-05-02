import { PENDING_WORDS } from "@/lib/mock-data";
import { TeacherPendingClient } from "./_client";
import type { PendingWordData } from "./_client";
import { unstable_noStore as noStore } from "next/cache";

interface LoadResult {
  words: PendingWordData[];
  demoMode: boolean;
  error?: string;
}

async function loadPendingWords(): Promise<LoadResult> {
  noStore();
  const configured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  if (!configured) {
    return {
      words: PENDING_WORDS.filter((w) => w.status === "pending").map((w) => ({
        id: w.id,
        hebrew: w.hebrewGuess ?? "",
        description: w.englishDescription,
        context: w.heardWhere,
        notes: w.notes ?? "",
        submittedAt: w.submittedAt,
      })),
      demoMode: true,
    };
  }

  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("words")
      .select("id, hebrew, hebrew_niqqud, meaning_en, example_en, teacher_notes, created_at")
      .eq("is_pending_approval", true)
      .order("created_at", { ascending: true });

    if (error) return { words: [], demoMode: false, error: error.message };

    const words: PendingWordData[] = (data ?? []).map((w) => ({
      id: w.id,
      hebrew: w.hebrew_niqqud ?? w.hebrew ?? "",
      description: w.meaning_en ?? "",
      context: w.example_en ?? "",
      notes: w.teacher_notes ?? "",
      submittedAt: new Date(w.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    }));

    return { words, demoMode: false };
  } catch (e) {
    return {
      words: [],
      demoMode: false,
      error: e instanceof Error ? e.message : "Could not load pending words",
    };
  }
}

export default async function PendingPage() {
  const { words, demoMode, error } = await loadPendingWords();
  return <TeacherPendingClient words={words} demoMode={demoMode} error={error} />;
}
