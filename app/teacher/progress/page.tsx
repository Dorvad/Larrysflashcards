import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { formatDuration, scoreLabel } from "@/lib/utils";
import type { Profile, SessionSummary, WordStats } from "@/types/database";

export default async function ProgressPage() {
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

  const [{ data: sessions }, { data: wordStats }] = await Promise.all([
    supabase
      .from("session_summary")
      .select("*")
      .order("started_at", { ascending: false })
      .limit(30)
      .returns<SessionSummary[]>(),
    supabase
      .from("word_stats")
      .select("*")
      .gt("total_attempts", 0)
      .order("accuracy_pct", { ascending: true })
      .limit(10)
      .returns<WordStats[]>(),
  ]);

  const avgScore =
    sessions && sessions.length > 0
      ? Math.round(
          sessions
            .filter((s) => s.score_pct !== null)
            .reduce((sum, s) => sum + (s.score_pct ?? 0), 0) /
            sessions.filter((s) => s.score_pct !== null).length
        )
      : null;

  const hardestWords = (wordStats ?? []).filter(
    (w) => w.accuracy_pct !== null && w.accuracy_pct < 70
  );

  return (
    <div className="min-h-screen bg-cream">
      <TopBar
        profile={profile}
        backHref="/teacher"
        title="Larry's progress"
      />

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Summary stats */}
        {sessions && sessions.length > 0 && (
          <div className="grid grid-cols-2 gap-4 mb-8">
            <SummaryCard
              label="Sessions"
              value={String(sessions.length)}
              note="last 30"
            />
            <SummaryCard
              label="Average score"
              value={avgScore !== null ? `${avgScore}%` : "—"}
              note={avgScore !== null ? scoreLabel(avgScore) : undefined}
            />
          </div>
        )}

        {/* Words that need more practice */}
        {hardestWords.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Needs more practice
            </h2>
            <div className="flex flex-col gap-2">
              {hardestWords.map((w) => (
                <div
                  key={w.word_id}
                  className="bg-white rounded-2xl px-5 py-4 flex items-center justify-between shadow-card"
                >
                  <div>
                    <p
                      className="hebrew text-gray-800"
                      lang="he"
                      dir="rtl"
                    >
                      {w.hebrew}
                    </p>
                    <p className="text-base text-gray-500">{w.english}</p>
                  </div>
                  <span className="text-xl font-bold text-red-500">
                    {w.accuracy_pct ?? 0}%
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* All sessions */}
        <section>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Session history
          </h2>

          {(sessions ?? []).length === 0 ? (
            <p className="text-center text-gray-400 text-lg py-8">
              Larry hasn&rsquo;t practised yet.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {(sessions ?? []).map((s) => (
                <Card key={s.id}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-lg font-semibold text-gray-800">
                        {s.word_set_name ?? "All words"}
                      </p>
                      <p className="text-base text-gray-500 mt-0.5">
                        {new Date(s.started_at).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                        {s.duration_seconds !== null &&
                          ` · ${formatDuration(s.duration_seconds)}`}
                      </p>
                      <p className="text-base text-gray-500 mt-0.5">
                        {s.correct_count} correct · {s.skipped_count} skipped
                        · {s.total_cards} total
                      </p>
                    </div>
                    {s.score_pct !== null && (
                      <span
                        className={`text-2xl font-bold shrink-0 ${
                          s.score_pct >= 80
                            ? "text-green-500"
                            : s.score_pct >= 60
                            ? "text-yellow-500"
                            : "text-red-500"
                        }`}
                      >
                        {s.score_pct}%
                      </span>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note?: string;
}) {
  return (
    <div className="bg-white rounded-3xl shadow-card p-5">
      <p className="text-3xl font-bold text-gray-800">{value}</p>
      <p className="text-base text-gray-500 mt-1">{label}</p>
      {note && <p className="text-sm text-gray-400 mt-0.5">{note}</p>}
    </div>
  );
}
