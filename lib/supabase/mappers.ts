import type { Word, WordCategory, WordStatus, Difficulty } from "@/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function dbWordToWord(row: any): Word {
  return {
    id: row.id,
    hebrewNiqqud: row.hebrew_niqqud ?? "",
    hebrewPlain: row.hebrew ?? "",
    transliteration: row.transliteration ?? "",
    english: row.meaning_en ?? "",
    exampleHebrew: row.example_he ?? "",
    exampleEnglish: row.example_en ?? "",
    category: (row.category ?? "Lesson words") as WordCategory,
    status: (row.status ?? "new") as WordStatus,
    strength: row.current_strength ?? 0,
    timesReviewed: row.times_reviewed ?? 0,
    lastReviewed: row.last_reviewed ?? null,
    nextReview: null,
    teacherNote: row.teacher_notes ?? undefined,
    tags: row.tags ?? [],
    difficulty: (row.difficulty ?? "medium") as Difficulty,
    audioUrl: row.audio_url ?? undefined,
    audioExampleUrl: row.audio_example_url ?? undefined,
    imageUrl: row.image_url ?? undefined,
  };
}
