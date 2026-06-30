import { dbWordToWord } from "@/lib/supabase/mappers";
import type { PracticeSession, Word } from "@/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClient = { from: (table: string) => any };

export interface SessionSummaryRow {
  id: string;
  date: string;
  startedAt: string;
  completedAt: string | null;
  wordCount: number;
  encouragementCount: number;
  scores: { knew: number; almost: number; forgot: number };
  durationMinutes: number;
}

export interface TeacherStudentStats {
  activeCount: number;
  pendingCount: number;
  strugglingCount: number;
  dueCount: number;
  lastPracticedAt: string | null;
  sessionsThisWeek: number;
  words: Word[];
  sessions: SessionSummaryRow[];
}

function sessionDurationMinutes(startedAt: string, completedAt: string | null): number {
  if (!completedAt) return 0;
  const ms = new Date(completedAt).getTime() - new Date(startedAt).getTime();
  return Math.max(1, Math.round(ms / 60_000));
}

function startOfWeek(): Date {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapSessionRow(row: any): SessionSummaryRow {
  const startedAt = row.started_at as string;
  const completedAt = (row.completed_at as string | null) ?? null;
  const date = (completedAt ?? startedAt).split("T")[0];
  return {
    id: row.id as string,
    date,
    startedAt,
    completedAt,
    wordCount: row.card_count as number,
    encouragementCount: (row.encouragement_count as number) ?? 0,
    scores: {
      knew: row.knew_count as number,
      almost: row.almost_count as number,
      forgot: row.forgot_count as number,
    },
    durationMinutes: sessionDurationMinutes(startedAt, completedAt),
  };
}

export function mapMockPracticeSessions(sessions: PracticeSession[]): SessionSummaryRow[] {
  return sessions.map((s) => ({
    id: s.id,
    date: s.date,
    startedAt: s.date,
    completedAt: s.date,
    wordCount: s.wordCount,
    encouragementCount: 0,
    scores: s.scores,
    durationMinutes: s.durationMinutes,
  }));
}

/** Load Larry's vocabulary + practice session history for the teacher dashboard. */
export async function loadTeacherStudentStats(
  supabase: SupabaseClient
): Promise<TeacherStudentStats> {
  const weekStart = startOfWeek().toISOString();

  const [wordsRes, sessionsRes, sessionsWeekRes] = await Promise.all([
    supabase
      .from("words")
      .select("*")
      .eq("is_active", true)
      .eq("is_pending_approval", false),
    supabase
      .from("practice_sessions")
      .select("*")
      .not("completed_at", "is", null)
      .order("completed_at", { ascending: false })
      .limit(12),
    supabase
      .from("practice_sessions")
      .select("*", { count: "exact", head: true })
      .not("completed_at", "is", null)
      .gte("completed_at", weekStart),
  ]);

  const words = (wordsRes.data ?? []).map(dbWordToWord);
  const sessions = (sessionsRes.data ?? []).map(mapSessionRow);

  const now = new Date().toISOString();
  const dueCount =
    words.filter((w: Word) => !w.nextReview).length +
    words.filter((w: Word) => w.nextReview && w.nextReview <= now).length;

  return {
    activeCount: words.length,
    pendingCount: 0,
    strugglingCount: words.filter((w: Word) => w.strength <= 2).length,
    dueCount,
    lastPracticedAt: sessions[0]?.completedAt ?? null,
    sessionsThisWeek: sessionsWeekRes.count ?? 0,
    words,
    sessions,
  };
}

/** Fallback when practice_sessions table is not migrated yet. */
export async function loadSessionsFromReviews(
  supabase: SupabaseClient,
  limit = 12
): Promise<SessionSummaryRow[]> {
  const { data } = await supabase
    .from("reviews")
    .select("result, reviewed_at")
    .order("reviewed_at", { ascending: false })
    .limit(200);

  const byDay = new Map<
    string,
    { knew: number; almost: number; forgot: number; wordCount: number; lastAt: string }
  >();

  for (const r of data ?? []) {
    const day = new Date(r.reviewed_at).toISOString().split("T")[0];
    const entry = byDay.get(day) ?? {
      knew: 0,
      almost: 0,
      forgot: 0,
      wordCount: 0,
      lastAt: r.reviewed_at,
    };
    entry.wordCount++;
    if (r.result === "knew") entry.knew++;
    else if (r.result === "almost") entry.almost++;
    else entry.forgot++;
    byDay.set(day, entry);
  }

  return Array.from(byDay.entries())
    .slice(0, limit)
    .map(([date, s]) => ({
      id: date,
      date,
      startedAt: s.lastAt,
      completedAt: s.lastAt,
      wordCount: s.wordCount,
      encouragementCount: 0,
      scores: { knew: s.knew, almost: s.almost, forgot: s.forgot },
      durationMinutes: Math.max(1, Math.round(s.wordCount / 3)),
    }));
}

export async function loadPracticeSessions(
  supabase: SupabaseClient,
  limit = 12
): Promise<SessionSummaryRow[]> {
  const { data, error } = await supabase
    .from("practice_sessions")
    .select("*")
    .not("completed_at", "is", null)
    .order("completed_at", { ascending: false })
    .limit(limit);

  if (error) {
    return loadSessionsFromReviews(supabase, limit);
  }

  return (data ?? []).map(mapSessionRow);
}
