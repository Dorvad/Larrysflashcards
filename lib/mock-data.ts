import type { Word, PendingWord, PracticeSession, ProgressStats } from "@/types";

// ─── Words ───────────────────────────────────────────────────────────────────

export const WORDS: Word[] = [
  {
    id: "1",
    hebrewNiqqud: "שָׁלוֹם",
    hebrewPlain: "שלום",
    transliteration: "shalom",
    english: "hello, peace, goodbye",
    exampleHebrew: "שָׁלוֹם, מַה שְּׁלוֹמְךָ?",
    exampleEnglish: "Hello, how are you?",
    category: "Greetings",
    status: "mastered",
    strength: 5,
    timesReviewed: 18,
    lastReviewed: "2025-04-26",
    nextReview: "2025-05-10",
    teacherNote:
      "The most important Hebrew word. Shalom means peace, but is used for hello and goodbye too.",
    difficulty: "easy",
    tags: ["everyday", "essential"],
  },
  {
    id: "2",
    hebrewNiqqud: "תּוֹדָה",
    hebrewPlain: "תודה",
    transliteration: "todah",
    english: "thank you",
    exampleHebrew: "תּוֹדָה רַבָּה עַל הָעֶזְרָה!",
    exampleEnglish: "Thank you very much for the help!",
    category: "Greetings",
    status: "mastered",
    strength: 5,
    timesReviewed: 14,
    lastReviewed: "2025-04-25",
    nextReview: "2025-05-09",
    teacherNote: "'Todah rabbah' means 'thank you very much'.",
    difficulty: "easy",
    tags: ["everyday", "essential"],
  },
  {
    id: "3",
    hebrewNiqqud: "קָפֶה",
    hebrewPlain: "קפה",
    transliteration: "kafe",
    english: "coffee",
    exampleHebrew: "אֲנִי רוֹצֶה קָפֶה שָׁחוֹר, בְּבַקָּשָׁה.",
    exampleEnglish: "I want a black coffee, please.",
    category: "Food & Drink",
    status: "strong",
    strength: 4,
    timesReviewed: 9,
    lastReviewed: "2025-04-24",
    nextReview: "2025-04-29",
    teacherNote: "Used in cafes just like in English — very easy to remember.",
    difficulty: "easy",
    tags: ["food", "cafe"],
  },
  {
    id: "4",
    hebrewNiqqud: "מִסְעָדָה",
    hebrewPlain: "מסעדה",
    transliteration: "mis'adah",
    english: "restaurant",
    exampleHebrew: "הַמִּסְעָדָה הַזּוֹ טוֹבָה מְאוֹד.",
    exampleEnglish: "This restaurant is very good.",
    category: "Food & Drink",
    status: "strong",
    strength: 4,
    timesReviewed: 7,
    lastReviewed: "2025-04-23",
    nextReview: "2025-04-28",
    difficulty: "medium",
    tags: ["food", "travel"],
  },
  {
    id: "5",
    hebrewNiqqud: "אֲנִי רוֹצֶה",
    hebrewPlain: "אני רוצה",
    transliteration: "ani rotzeh",
    english: "I want",
    exampleHebrew: "אֲנִי רוֹצֶה לִשְׁתּוֹת מַיִם.",
    exampleEnglish: "I want to drink water.",
    category: "Useful phrases",
    status: "practicing",
    strength: 3,
    timesReviewed: 5,
    lastReviewed: "2025-04-22",
    nextReview: "2025-04-28",
    teacherNote:
      "For a woman the form is 'ani rotzah'. This is one of the most useful phrases.",
    difficulty: "medium",
    tags: ["phrases", "essential"],
  },
  {
    id: "6",
    hebrewNiqqud: "בֹּקֶר טוֹב",
    hebrewPlain: "בוקר טוב",
    transliteration: "boker tov",
    english: "good morning",
    exampleHebrew: "בֹּקֶר טוֹב! אֵיךְ שַׁנַּתְךָ?",
    exampleEnglish: "Good morning! How did you sleep?",
    category: "Greetings",
    status: "mastered",
    strength: 5,
    timesReviewed: 16,
    lastReviewed: "2025-04-26",
    nextReview: "2025-05-12",
    teacherNote: "The reply is 'boker or' — morning light!",
    difficulty: "easy",
    tags: ["greetings", "essential"],
  },
  {
    id: "7",
    hebrewNiqqud: "מַיִם",
    hebrewPlain: "מים",
    transliteration: "mayim",
    english: "water",
    exampleHebrew: "תּוֹכַל לְהָבִיא לִי כּוֹס מַיִם?",
    exampleEnglish: "Can you bring me a glass of water?",
    category: "Food & Drink",
    status: "strong",
    strength: 4,
    timesReviewed: 8,
    lastReviewed: "2025-04-24",
    nextReview: "2025-04-30",
    difficulty: "easy",
    tags: ["food", "essential"],
  },
  {
    id: "8",
    hebrewNiqqud: "חֶשְׁבּוֹן",
    hebrewPlain: "חשבון",
    transliteration: "cheshbon",
    english: "bill, check, account",
    exampleHebrew: "אֶפְשָׁר לְקַבֵּל אֶת הַחֶשְׁבּוֹן?",
    exampleEnglish: "Can we get the bill, please?",
    category: "Food & Drink",
    status: "practicing",
    strength: 2,
    timesReviewed: 4,
    lastReviewed: "2025-04-21",
    nextReview: "2025-04-28",
    teacherNote: "Cheshbon also means math or calculation — the same word!",
    difficulty: "medium",
    tags: ["restaurant", "travel"],
  },
  {
    id: "9",
    hebrewNiqqud: "לְהַזְמִין",
    hebrewPlain: "להזמין",
    transliteration: "lehazmin",
    english: "to order, to invite",
    exampleHebrew: "אֲנִי רוֹצֶה לְהַזְמִין שְׁנֵי פָּלָאפֶל.",
    exampleEnglish: "I want to order two falafels.",
    category: "Verbs",
    status: "practicing",
    strength: 2,
    timesReviewed: 3,
    lastReviewed: "2025-04-20",
    nextReview: "2025-04-28",
    teacherNote:
      "The verb root ז.מ.נ gives us both 'to order' and 'to invite'. Interesting, right?",
    difficulty: "hard",
    tags: ["verbs", "restaurant"],
  },
  {
    id: "10",
    hebrewNiqqud: "עֶרֶב טוֹב",
    hebrewPlain: "ערב טוב",
    transliteration: "erev tov",
    english: "good evening",
    exampleHebrew: "עֶרֶב טוֹב! כֵּיף לִרְאוֹת אוֹתְךָ.",
    exampleEnglish: "Good evening! Nice to see you.",
    category: "Greetings",
    status: "strong",
    strength: 4,
    timesReviewed: 7,
    lastReviewed: "2025-04-23",
    nextReview: "2025-04-29",
    difficulty: "easy",
    tags: ["greetings"],
  },
  {
    id: "11",
    hebrewNiqqud: "בְּבַקָּשָׁה",
    hebrewPlain: "בבקשה",
    transliteration: "bevakasha",
    english: "please, you're welcome",
    exampleHebrew: "תּוֹדָה! — בְּבַקָּשָׁה.",
    exampleEnglish: "Thank you! — You're welcome.",
    category: "Greetings",
    status: "practicing",
    strength: 3,
    timesReviewed: 5,
    lastReviewed: "2025-04-22",
    nextReview: "2025-04-28",
    teacherNote:
      "Bevakasha does double duty: 'please' when asking, and 'you're welcome' when responding.",
    difficulty: "medium",
    tags: ["greetings", "essential"],
  },
  {
    id: "12",
    hebrewNiqqud: "לַיְלָה טוֹב",
    hebrewPlain: "לילה טוב",
    transliteration: "layla tov",
    english: "good night",
    exampleHebrew: "לַיְלָה טוֹב, שֵׁנָה טוֹבָה!",
    exampleEnglish: "Good night, sleep well!",
    category: "Greetings",
    status: "new",
    strength: 0,
    timesReviewed: 0,
    lastReviewed: null,
    nextReview: "2025-04-28",
    difficulty: "easy",
    tags: ["greetings"],
  },
  {
    id: "13",
    hebrewNiqqud: "יַיִן",
    hebrewPlain: "יין",
    transliteration: "yayin",
    english: "wine",
    exampleHebrew: "כּוֹס יַיִן אֶחָד, בְּבַקָּשָׁה.",
    exampleEnglish: "One glass of wine, please.",
    category: "Food & Drink",
    status: "new",
    strength: 0,
    timesReviewed: 0,
    lastReviewed: null,
    nextReview: "2025-04-28",
    teacherNote: "Yayin appears in many Jewish prayers and blessings.",
    difficulty: "easy",
    tags: ["food", "jewish holidays"],
  },
  {
    id: "14",
    hebrewNiqqud: "נֶהֱדָר",
    hebrewPlain: "נהדר",
    transliteration: "nehedar",
    english: "wonderful, great",
    exampleHebrew: "הָאֹכֶל כָּאן נֶהֱדָר!",
    exampleEnglish: "The food here is wonderful!",
    category: "Daily life",
    status: "new",
    strength: 1,
    timesReviewed: 1,
    lastReviewed: "2025-04-27",
    nextReview: "2025-04-28",
    difficulty: "medium",
    tags: ["adjectives", "everyday"],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getWordById(id: string): Word | undefined {
  return WORDS.find((w) => w.id === id);
}

export function getDueToday(): Word[] {
  const today = "2025-04-28";
  return WORDS.filter(
    (w) => w.nextReview !== null && w.nextReview <= today
  );
}

export function getRecentlyAdded(): Word[] {
  return WORDS.filter((w) => w.status === "new").slice(0, 4);
}

export function getLastLessonWords(): Word[] {
  return WORDS.filter((w) => w.id === "8" || w.id === "9" || w.id === "11" || w.id === "14");
}

export function getWeakWords(): Word[] {
  return WORDS.filter((w) => w.strength <= 2 && w.timesReviewed > 0);
}

// ─── Pending words from Larry ─────────────────────────────────────────────────

export const PENDING_WORDS: PendingWord[] = [
  {
    id: "p1",
    hebrewGuess: "אהבה",
    englishDescription: "love",
    heardWhere: "In a song Dor played",
    notes: "I'd really like to know this one",
    submittedAt: "2025-04-27",
    status: "pending",
  },
  {
    id: "p2",
    hebrewGuess: "שוק",
    englishDescription: "market / street market",
    heardWhere: "Walking through the neighbourhood",
    notes: "There was a sign that said שוק",
    submittedAt: "2025-04-26",
    status: "pending",
  },
  {
    id: "p3",
    hebrewGuess: "חג שמח",
    englishDescription: "happy holiday",
    heardWhere: "Dor said it to me last week",
    notes: "",
    submittedAt: "2025-04-24",
    status: "pending",
  },
];

// ─── Practice history ─────────────────────────────────────────────────────────

export const PRACTICE_SESSIONS: PracticeSession[] = [
  {
    id: "s1",
    date: "2025-04-27",
    wordCount: 8,
    scores: { forgot: 1, almost: 2, knew: 5 },
    durationMinutes: 9,
  },
  {
    id: "s2",
    date: "2025-04-25",
    wordCount: 6,
    scores: { forgot: 2, almost: 1, knew: 3 },
    durationMinutes: 7,
  },
  {
    id: "s3",
    date: "2025-04-23",
    wordCount: 9,
    scores: { forgot: 1, almost: 3, knew: 5 },
    durationMinutes: 11,
  },
  {
    id: "s4",
    date: "2025-04-21",
    wordCount: 7,
    scores: { forgot: 3, almost: 2, knew: 2 },
    durationMinutes: 8,
  },
  {
    id: "s5",
    date: "2025-04-18",
    wordCount: 5,
    scores: { forgot: 1, almost: 1, knew: 3 },
    durationMinutes: 6,
  },
];

export const PROGRESS_STATS: ProgressStats = {
  total: WORDS.length,
  newWords: WORDS.filter((w) => w.status === "new").length,
  practicing: WORDS.filter((w) => w.status === "practicing").length,
  strong: WORDS.filter((w) => w.status === "strong").length,
  mastered: WORDS.filter((w) => w.status === "mastered").length,
  recentSessions: PRACTICE_SESSIONS,
};

// ─── Teacher suggested lesson words ──────────────────────────────────────────

export const NEXT_LESSON_SUGGESTIONS: Word[] = WORDS.filter((w) =>
  ["8", "9", "11", "5"].includes(w.id)
);
