import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PracticeSession } from "@/components/flashcard/PracticeSession";
import type { Profile, Word } from "@/types/database";

interface Props {
  searchParams: Promise<{ set?: string; mode?: string }>;
}

export default async function SessionPage({ searchParams }: Props) {
  const { set, mode } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single<Profile>();
  if (!profile) redirect("/login");

  // Load words for the selected set (or all)
  let query = supabase
    .from("words")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");

  if (set && set !== "all") {
    query = query.eq("word_set_id", set);
  }

  const { data: words } = await query.returns<Word[]>();

  if (!words || words.length === 0) {
    redirect("/practice");
  }

  const practiceMode =
    mode === "english_to_hebrew" || mode === "mixed"
      ? mode
      : "hebrew_to_english";

  return (
    <PracticeSession
      words={words}
      mode={practiceMode}
      studentId={user.id}
      wordSetId={set !== "all" ? set : undefined}
      studentName={profile.display_name}
    />
  );
}
