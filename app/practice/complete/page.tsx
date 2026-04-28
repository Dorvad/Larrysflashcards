import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/Button";
import { formatDuration, scoreLabel } from "@/lib/utils";
import type { Profile, SessionSummary } from "@/types/database";

interface Props {
  searchParams: Promise<{ session?: string }>;
}

export default async function CompletePage({ searchParams }: Props) {
  const { session: sessionId } = await searchParams;
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

  const { data: summary } = sessionId
    ? await supabase
        .from("session_summary")
        .select("*")
        .eq("id", sessionId)
        .single<SessionSummary>()
    : { data: null };

  const score = summary?.score_pct ?? null;

  return (
    <div className="min-h-screen bg-cream">
      <TopBar profile={profile} backHref="/practice" title="Done!" />

      <main className="max-w-md mx-auto px-4 py-12 text-center">
        {/* Celebration */}
        <div className="text-7xl mb-6 animate-fade-in" aria-hidden="true">
          {score !== null && score >= 90
            ? "🌟"
            : score !== null && score >= 70
            ? "👍"
            : "💪"}
        </div>

        <h2 className="text-3xl font-bold text-gray-800 mb-2 animate-slide-up">
          {scoreLabel(score)}
        </h2>

        {summary && (
          <div className="mt-6 bg-white rounded-3xl shadow-card p-6 text-left animate-slide-up">
            <div className="grid grid-cols-2 gap-4">
              <Stat
                label="Cards"
                value={String(summary.total_cards)}
              />
              <Stat
                label="Correct"
                value={`${summary.correct_count} / ${summary.total_cards - summary.skipped_count}`}
              />
              {score !== null && (
                <Stat label="Score" value={`${score}%`} highlight />
              )}
              {summary.duration_seconds !== null && (
                <Stat
                  label="Time"
                  value={formatDuration(summary.duration_seconds)}
                />
              )}
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3">
          <Link href="/practice/session" className="block">
            <Button size="xl" variant="primary">
              Practice again
            </Button>
          </Link>
          <Link href="/practice" className="block">
            <Button size="xl" variant="secondary">
              Choose another lesson
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-4 ${highlight ? "bg-sky-50" : "bg-gray-50"}`}
    >
      <p className="text-base text-gray-500">{label}</p>
      <p
        className={`text-2xl font-bold mt-0.5 ${
          highlight ? "text-sky-600" : "text-gray-800"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
