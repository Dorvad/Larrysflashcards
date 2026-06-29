import type { Word, WordCategory, WordStatus, Difficulty } from "@/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function dbWordToWord(row: any): Word {
  return {
    id: row.id,
    // hebrew_niqqud may be null for student suggestions; fall back to hebrew
    hebrewNiqqud: row.hebrew_niqqud ?? row.hebrew ?? "",
    hebrewPlain: row.hebrew ?? "",
    transliteration: row.transliteration ?? "",
    english: row.meaning_en ?? "",
    exampleHebrew: row.example_he ?? "",
    exampleEnglish: row.example_en ?? "",
    category: (row.category ?? "Lesson words") as WordCategory,
    status: (row.status ?? "new") as WordStatus,
    strength: row.current_strength ?? 0,
    // times_reviewed comes from a joined count; default 0 if not present
    timesReviewed: (row.reviews_count ?? row.times_reviewed ?? 0) as number,
    lastReviewed: row.last_reviewed ?? null,
    nextReview: row.next_review_at ?? null,
    teacherNote: row.teacher_notes ?? undefined,
    tags: row.tags ?? [],
    difficulty: (row.difficulty ?? "medium") as Difficulty,
    audioUrl: row.audio_url ?? undefined,
    audioExampleUrl: row.audio_example_url ?? undefined,
    imageUrl: row.image_url ?? undefined,
    isPendingApproval: row.is_pending_approval ?? false,
    submittedByStudent: row.submitted_by_student ?? false,
    isActive: row.is_active ?? true,
  };
}
