export type WordStatus = "new" | "practicing" | "strong" | "mastered";

export type WordCategory =
  | "Greetings"
  | "Food & Drink"
  | "Daily life"
  | "Travel"
  | "Useful phrases"
  | "Verbs"
  | "Jewish holidays"
  | "Lesson words"
  | "Numbers"
  | "Family";

export type Difficulty = "easy" | "medium" | "hard";

export type CardResponse = "forgot" | "almost" | "knew";

export interface Word {
  id: string;
  hebrewNiqqud: string;
  hebrewPlain: string;
  transliteration: string;
  english: string;
  exampleHebrew: string;
  exampleEnglish: string;
  category: WordCategory;
  status: WordStatus;
  strength: number; // 0–5
  timesReviewed: number;
  lastReviewed: string | null; // ISO date string
  nextReview: string | null;   // ISO date string
  teacherNote?: string;
  tags?: string[];
  difficulty: Difficulty;
  audioUrl?: string;
}

export interface PendingWord {
  id: string;
  hebrewGuess?: string;
  englishDescription: string;
  heardWhere: string;
  notes?: string;
  submittedAt: string;
  status: "pending" | "approved" | "rejected";
}

export interface PracticeSession {
  id: string;
  date: string;
  wordCount: number;
  scores: { forgot: number; almost: number; knew: number };
  durationMinutes: number;
}

export interface ProgressStats {
  total: number;
  newWords: number;
  practicing: number;
  strong: number;
  mastered: number;
  recentSessions: PracticeSession[];
}
