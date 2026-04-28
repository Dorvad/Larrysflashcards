// Auto-generated types matching the Supabase schema.
// Re-run `supabase gen types typescript` after schema changes.

export type Role = "student" | "teacher";
export type PracticeMode = "hebrew_to_english" | "english_to_hebrew" | "mixed";
export type CardResult = "correct" | "incorrect" | "skipped";

export interface Profile {
  id: string;
  role: Role;
  display_name: string;
  created_at: string;
}

export interface WordSet {
  id: string;
  name: string;
  description: string | null;
  color: string;
  sort_order: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Word {
  id: string;
  word_set_id: string | null;
  hebrew: string;
  transliteration: string | null;
  english: string;
  notes: string | null;
  audio_url: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface PracticeSession {
  id: string;
  student_id: string;
  word_set_id: string | null;
  mode: PracticeMode;
  started_at: string;
  completed_at: string | null;
  total_cards: number;
  correct_count: number;
  skipped_count: number;
}

export interface PracticeResult {
  id: string;
  session_id: string;
  word_id: string;
  result: CardResult;
  response_ms: number | null;
  answered_at: string;
}

// View types
export interface WordStats {
  word_id: string;
  hebrew: string;
  english: string;
  word_set_id: string | null;
  total_attempts: number;
  correct_count: number;
  incorrect_count: number;
  skipped_count: number;
  accuracy_pct: number | null;
}

export interface SessionSummary {
  id: string;
  student_id: string;
  student_name: string;
  word_set_name: string | null;
  mode: PracticeMode;
  started_at: string;
  completed_at: string | null;
  total_cards: number;
  correct_count: number;
  skipped_count: number;
  score_pct: number | null;
  duration_seconds: number | null;
}

// Joined types used in UI
export interface WordWithSet extends Word {
  word_set: WordSet | null;
}

export interface SessionWithResults extends PracticeSession {
  results: PracticeResult[];
}
