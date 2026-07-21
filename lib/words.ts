import { dbWordToWord } from "@/lib/supabase/mappers";
import { applyStudentScope } from "@/lib/students";
import { FAMILIAR_MIN_STRENGTH } from "@/lib/practice-session";
import type { Word } from "@/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClient = { from: (table: string) => any };

/** Active, approved words assigned to the current student (RLS-scoped). */
export async function loadActiveWords(supabase: SupabaseClient): Promise<Word[]> {
  const { data } = await supabase
    .from("words")
    .select("*")
    .eq("is_active", true)
    .eq("is_pending_approval", false)
    .order("created_at", { ascending: false });

  return (data ?? []).map(dbWordToWord);
}

/** Active, approved words that are new or due for review. */
export async function loadDueWords(supabase: SupabaseClient): Promise<Word[]> {
  const now = new Date().toISOString();

  const [neverReviewedRes, dueNowRes] = await Promise.all([
    supabase
      .from("words")
      .select("*")
      .eq("is_active", true)
      .eq("is_pending_approval", false)
      .is("next_review_at", null),
    supabase
      .from("words")
      .select("*")
      .eq("is_active", true)
      .eq("is_pending_approval", false)
      .not("next_review_at", "is", null)
      .lte("next_review_at", now),
  ]);

  return [...(neverReviewedRes.data ?? []), ...(dueNowRes.data ?? [])].map(
    dbWordToWord
  );
}

function scopeWords<T extends { in: (column: string, values: string[]) => T }>(
  query: T,
  studentIds?: string[]
): T | null {
  return applyStudentScope(query, studentIds);
}

export async function countDueWords(
  supabase: SupabaseClient,
  studentIds?: string[]
): Promise<number> {
  if (studentIds && studentIds.length === 0) return 0;

  const now = new Date().toISOString();

  const neverReviewedQuery = scopeWords(
    supabase
      .from("words")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true)
      .eq("is_pending_approval", false)
      .is("next_review_at", null),
    studentIds
  );
  const dueNowQuery = scopeWords(
    supabase
      .from("words")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true)
      .eq("is_pending_approval", false)
      .not("next_review_at", "is", null)
      .lte("next_review_at", now),
    studentIds
  );

  if (!neverReviewedQuery || !dueNowQuery) return 0;

  const [neverReviewedRes, dueNowRes] = await Promise.all([
    neverReviewedQuery,
    dueNowQuery,
  ]);

  return (neverReviewedRes.count ?? 0) + (dueNowRes.count ?? 0);
}

/** Words strong enough to use as encouragement cards (not currently due). */
export function familiarWords(dueWords: Word[], activeWords: Word[]): Word[] {
  const dueIds = new Set(dueWords.map((w) => w.id));
  return activeWords.filter(
    (w) => !dueIds.has(w.id) && w.strength >= FAMILIAR_MIN_STRENGTH
  );
}

export async function countFamiliarWords(supabase: SupabaseClient): Promise<number> {
  const [dueWords, activeWords] = await Promise.all([
    loadDueWords(supabase),
    loadActiveWords(supabase),
  ]);
  return familiarWords(dueWords, activeWords).length;
}

function startOfWeekDate(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString().split("T")[0];
}

/** Word IDs Dor marked as this week's lesson focus. */
export async function loadWeeklyFocusIds(
  supabase: SupabaseClient
): Promise<Set<string>> {
  const weekStart = startOfWeekDate();
  const { data } = await supabase
    .from("weekly_focus")
    .select("word_id")
    .eq("week_start_date", weekStart);

  return new Set((data ?? []).map((row: { word_id: string }) => row.word_id));
}
