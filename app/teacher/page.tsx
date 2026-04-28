import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import type { Profile, SessionSummary } from "@/types/database";

export default async function TeacherDashboard() {
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

  // Quick stats
  const { count: wordCount } = await supabase
    .from("words")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true);

  const { count: setCount } = await supabase
    .from("word_sets")
    .select("*", { count: "exact", head: true });

  const { data: recentSessions } = await supabase
    .from("session_summary")
    .select("*")
    .order("started_at", { ascending: false })
    .limit(5)
    .returns<SessionSummary[]>();

  const lastSession = recentSessions?.[0];

  return (
    <div className="min-h-screen bg-cream">
      <TopBar profile={profile} title="Teacher Dashboard" />

      <main className="max-w-2xl mx-auto px-4 py-8">
        <p className="text-lg text-gray-500 mb-8">
          Welcome back, {profile.display_name}. Here&rsquo;s how Larry is doing.
        </p>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <StatCard label="Active words" value={String(wordCount ?? 0)} emoji="📝" />
          <StatCard label="Lessons" value={String(setCount ?? 0)} emoji="📚" />
          {lastSession && (
            <StatCard
              label="Last practice"
              value={
                lastSession.score_pct !== null
                  ? `${lastSession.score_pct}%`
                  : "—"
              }
              emoji="🎯"
              subtitle={new Date(lastSession.started_at).toLocaleDateString()}
            />
          )}
          <StatCard
            label="Sessions total"
            value={String(recentSessions?.length ?? 0)}
            emoji="🔄"
            subtitle="recent 5 shown"
          />
        </div>

        {/* Quick actions */}
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Quick actions</h2>
        <div className="grid gap-3 mb-10">
          <ActionLink
            href="/teacher/words/new"
            emoji="➕"
            title="Add a new word"
            description="Add a Hebrew word with translation and notes"
          />
          <ActionLink
            href="/teacher/words"
            emoji="📝"
            title="Manage words"
            description="Edit, reorder, or deactivate words"
          />
          <ActionLink
            href="/teacher/sets"
            emoji="🗂️"
            title="Manage lessons"
            description="Create or edit lesson groups"
          />
          <ActionLink
            href="/teacher/progress"
            emoji="📊"
            title="Larry's progress"
            description="See detailed practice history and accuracy"
          />
        </div>

        {/* Recent sessions */}
        {(recentSessions ?? []).length > 0 && (
          <>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Recent sessions
            </h2>
            <div className="flex flex-col gap-3">
              {recentSessions!.map((s) => (
                <Card key={s.id}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg font-medium text-gray-800">
                        {s.word_set_name ?? "All words"}
                      </p>
                      <p className="text-base text-gray-500 mt-0.5">
                        {new Date(s.started_at).toLocaleDateString()} ·{" "}
                        {s.total_cards} cards ·{" "}
                        {s.correct_count} correct
                      </p>
                    </div>
                    {s.score_pct !== null && (
                      <span
                        className={`text-xl font-bold ${
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
            <div className="mt-4 text-center">
              <Link
                href="/teacher/progress"
                className="text-base text-sky-600 hover:underline"
              >
                View full history →
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
  emoji,
  subtitle,
}: {
  label: string;
  value: string;
  emoji: string;
  subtitle?: string;
}) {
  return (
    <div className="bg-white rounded-3xl shadow-card p-5">
      <p className="text-2xl mb-2" aria-hidden="true">
        {emoji}
      </p>
      <p className="text-3xl font-bold text-gray-800">{value}</p>
      <p className="text-base text-gray-500 mt-0.5">{label}</p>
      {subtitle && (
        <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>
      )}
    </div>
  );
}

function ActionLink({
  href,
  emoji,
  title,
  description,
}: {
  href: string;
  emoji: string;
  title: string;
  description: string;
}) {
  return (
    <Link href={href} className="block">
      <Card>
        <div className="flex items-center gap-4">
          <span className="text-2xl shrink-0" aria-hidden="true">
            {emoji}
          </span>
          <div className="min-w-0">
            <p className="text-lg font-semibold text-gray-800">{title}</p>
            <p className="text-base text-gray-500 truncate">{description}</p>
          </div>
          <svg
            className="ml-auto shrink-0 text-gray-400"
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
      </Card>
    </Link>
  );
}
