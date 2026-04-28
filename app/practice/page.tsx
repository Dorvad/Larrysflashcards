import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { Profile, WordSet } from "@/types/database";

export default async function PracticePage() {
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

  const { data: wordSets } = await supabase
    .from("word_sets")
    .select("*")
    .order("sort_order")
    .returns<WordSet[]>();

  // Count words per set
  const { data: wordCounts } = await supabase
    .from("words")
    .select("word_set_id")
    .eq("is_active", true);

  const countsBySet = (wordCounts ?? []).reduce<Record<string, number>>(
    (acc, w) => {
      if (w.word_set_id) acc[w.word_set_id] = (acc[w.word_set_id] ?? 0) + 1;
      return acc;
    },
    {}
  );

  return (
    <div className="min-h-screen bg-cream">
      <TopBar profile={profile} />

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-1">
            Shalom, {profile.display_name}! 👋
          </h2>
          <p className="text-lg text-gray-500">
            Choose a lesson to practise, or study all words.
          </p>
        </div>

        {/* All words option */}
        <Link href="/practice/session?set=all" className="block mb-4">
          <Card className="border-2 border-sky-200 hover:border-sky-400 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xl font-semibold text-gray-800">
                  All words
                </p>
                <p className="text-base text-gray-500 mt-0.5">
                  {(wordCounts ?? []).length} words · mixed practice
                </p>
              </div>
              <span className="text-3xl" aria-hidden="true">
                🌟
              </span>
            </div>
          </Card>
        </Link>

        {/* Per-set cards */}
        <div className="grid gap-4">
          {(wordSets ?? []).map((set) => {
            const count = countsBySet[set.id] ?? 0;
            return (
              <Link
                key={set.id}
                href={`/practice/session?set=${set.id}`}
                className="block"
              >
                <Card>
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-xl font-semibold text-gray-800 truncate">
                          {set.name}
                        </p>
                        <Badge color={set.color}>{count} words</Badge>
                      </div>
                      {set.description && (
                        <p className="text-base text-gray-500 truncate">
                          {set.description}
                        </p>
                      )}
                    </div>
                    <svg
                      className="ml-4 shrink-0 text-gray-400"
                      width="24"
                      height="24"
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
                </Card>
              </Link>
            );
          })}
        </div>

        {(wordSets ?? []).length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-2xl mb-2">📚</p>
            <p className="text-lg">No lessons yet — Dor will add some soon!</p>
          </div>
        )}
      </main>
    </div>
  );
}
