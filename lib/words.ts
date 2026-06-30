import { dbWordToWord } from "@/lib/supabase/mappers";
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

export async function countDueWords(supabase: SupabaseClient): Promise<number> {
  const now = new Date().toISOString();

  const [neverReviewedRes, dueNowRes] = await Promise.all([
    supabase
      .from("words")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true)
      .eq("is_pending_approval", false)
      .is("next_review_at", null),
    supabase
      .from("words")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true)
      .eq("is_pending_approval", false)
      .not("next_review_at", "is", null)
      .lte("next_review_at", now),
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
