import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TopBar } from "@/components/layout/TopBar";
import { WordForm } from "@/components/teacher/WordForm";
import { WordStats } from "@/components/teacher/WordStats";
import type { Profile, Word, WordSet, WordStats as WordStatsType } from "@/types/database";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditWordPage({ params }: Props) {
  const { id } = await params;
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
  if (!profile || profile.role !== "teacher") redirect("/practice");

  const [{ data: word }, { data: wordSets }, { data: stats }] =
    await Promise.all([
      supabase.from("words").select("*").eq("id", id).single<Word>(),
      supabase
        .from("word_sets")
        .select("*")
        .order("sort_order")
        .returns<WordSet[]>(),
      supabase
        .from("word_stats")
        .select("*")
        .eq("word_id", id)
        .single<WordStatsType>(),
    ]);

  if (!word) notFound();

  return (
    <div className="min-h-screen bg-cream">
      <TopBar profile={profile} backHref="/teacher/words" title="Edit word" />
      <main className="max-w-lg mx-auto px-4 py-8 flex flex-col gap-6">
        <WordForm
          word={word}
          wordSets={wordSets ?? []}
          teacherId={user.id}
        />
        {stats && stats.total_attempts > 0 && (
          <WordStats stats={stats} />
        )}
      </main>
    </div>
  );
}
