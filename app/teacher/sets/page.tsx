import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TopBar } from "@/components/layout/TopBar";
import { SetsManager } from "@/components/teacher/SetsManager";
import type { Profile, WordSet } from "@/types/database";

export default async function ManageSetsPage() {
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

  const { data: wordSets } = await supabase
    .from("word_sets")
    .select("*")
    .order("sort_order")
    .returns<WordSet[]>();

  return (
    <div className="min-h-screen bg-cream">
      <TopBar profile={profile} backHref="/teacher" title="Manage lessons" />
      <main className="max-w-lg mx-auto px-4 py-8">
        <SetsManager sets={wordSets ?? []} teacherId={user.id} />
      </main>
    </div>
  );
}
