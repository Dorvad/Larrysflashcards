import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { Profile, Word, WordSet } from "@/types/database";

export default async function ManageWordsPage() {
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

  const { data: words } = await supabase
    .from("words")
    .select("*, word_set:word_sets(*)")
    .order("word_set_id", { ascending: true })
    .order("sort_order")
    .returns<(Word & { word_set: WordSet | null })[]>();

  const { data: wordSets } = await supabase
    .from("word_sets")
    .select("*")
    .order("sort_order")
    .returns<WordSet[]>();

  const setMap = Object.fromEntries((wordSets ?? []).map((s) => [s.id, s]));

  return (
    <div className="min-h-screen bg-cream">
      <TopBar profile={profile} backHref="/teacher" title="Manage words" />

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-lg text-gray-500">
            {(words ?? []).length} words total
          </p>
          <Link href="/teacher/words/new">
            <Button size="md" variant="primary">
              + Add word
            </Button>
          </Link>
        </div>

        <div className="flex flex-col gap-3">
          {(words ?? []).map((word) => (
            <Link key={word.id} href={`/teacher/words/${word.id}`}>
              <div
                className={`bg-white rounded-2xl shadow-card px-5 py-4 flex items-center gap-4 hover:shadow-card-hover transition-shadow ${
                  !word.is_active ? "opacity-50" : ""
                }`}
              >
                {/* Hebrew */}
                <div className="w-28 shrink-0 text-right">
                  <p
                    className="hebrew text-gray-800"
                    lang="he"
                    dir="rtl"
                  >
                    {word.hebrew}
                  </p>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-lg font-medium text-gray-800">
                    {word.english}
                  </p>
                  {word.transliteration && (
                    <p className="text-base text-gray-400 italic">
                      {word.transliteration}
                    </p>
                  )}
                </div>

                {word.word_set_id && setMap[word.word_set_id] && (
                  <Badge color={setMap[word.word_set_id].color}>
                    {setMap[word.word_set_id].name}
                  </Badge>
                )}

                <svg
                  className="shrink-0 text-gray-300"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        {(words ?? []).length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-2xl mb-3">📝</p>
            <p className="text-lg">No words yet.</p>
            <Link href="/teacher/words/new">
              <Button variant="primary" size="lg" className="mt-6">
                Add the first word
              </Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
