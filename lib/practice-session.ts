import { shuffle } from "./utils";
import type { Word } from "@/types";

/**
 * Pedagogical session design (single-student app, age-friendly):
 * - Micro-sessions: five unique words per round for slow, predictable practice.
 * - Verb priority: up to two due verbs when available (lesson verbs matter).
 * - Confidence warm-up: open with one familiar word when possible.
 * - Interleaving: mix priority and familiar cards rather than blocking by difficulty.
 * - Priority queue: overdue and weakest due words first (spaced repetition).
 */
export const SESSION_TARGET_SIZE = 5;
export const MAX_VERBS_PER_SESSION = 2;
export const TARGET_PRIORITY_WORDS = 2;
export const TARGET_FAMILIAR_WORDS = 1;
export const FAMILIAR_MIN_STRENGTH = 3;

export interface BuiltSession {
  /** Ordered initial card appearances (unique words only; retries added client-side). */
  cards: Word[];
  /** Distinct vocabulary selected for this session (≤ SESSION_TARGET_SIZE). */
  uniqueWords: Word[];
  priorityCount: number;
  encouragementCount: number;
  verbCount: number;
  totalDueRemaining: number;
}

export function isVerb(word: Word): boolean {
  return word.category === "Verbs";
}

/** Sort due words: most overdue, lowest strength, weekly focus, then stable id. */
export function sortDueByPriority(
  dueWords: Word[],
  weeklyFocusIds: ReadonlySet<string> = new Set()
): Word[] {
  const now = Date.now();
  return [...dueWords].sort((a, b) => {
    const aDue = a.nextReview ? new Date(a.nextReview).getTime() : now - 86_400_000;
    const bDue = b.nextReview ? new Date(b.nextReview).getTime() : now - 86_400_000;
    if (aDue !== bDue) return aDue - bDue;
    if (a.strength !== b.strength) return a.strength - b.strength;
    const aFocus = weeklyFocusIds.has(a.id) ? 0 : 1;
    const bFocus = weeklyFocusIds.has(b.id) ? 0 : 1;
    if (aFocus !== bFocus) return aFocus - bFocus;
    return a.id.localeCompare(b.id);
  });
}

export function buildSessionDeck(
  dueWords: Word[],
  familiarPool: Word[],
  weeklyFocusIds: ReadonlySet<string> = new Set()
): BuiltSession {
  if (dueWords.length === 0) {
    return {
      cards: [],
      uniqueWords: [],
      priorityCount: 0,
      encouragementCount: 0,
      verbCount: 0,
      totalDueRemaining: 0,
    };
  }

  const sortedDue = sortDueByPriority(dueWords, weeklyFocusIds);
  const selection = selectSessionWords(sortedDue, familiarPool);
  const cards = orderSessionCards(selection.familiar, selection.verbs, selection.otherPriority);
  const priorityCount = selection.verbs.length + selection.otherPriority.length;

  return {
    cards,
    uniqueWords: cards,
    priorityCount,
    encouragementCount: selection.familiar ? 1 : 0,
    verbCount: selection.verbs.length,
    totalDueRemaining: Math.max(0, sortedDue.length - priorityCount),
  };
}

/** Estimate the next session size for home-screen copy. */
export function estimateNextSessionSize(
  dueCount: number,
  familiarAvailable: number
): number {
  if (dueCount === 0) return 0;
  const familiar = Math.min(TARGET_FAMILIAR_WORDS, familiarAvailable);
  return Math.min(SESSION_TARGET_SIZE, dueCount + familiar);
}

interface SessionSelection {
  familiar: Word | null;
  verbs: Word[];
  otherPriority: Word[];
}

function selectSessionWords(
  sortedDue: Word[],
  familiarPool: Word[]
): SessionSelection {
  const selectedIds = new Set<string>();
  let slotsRemaining = SESSION_TARGET_SIZE;

  // Reserve one slot for a familiar warm-up when the pool has eligible words.
  const familiarCandidates = familiarPool.filter(
    (w) => w.strength >= FAMILIAR_MIN_STRENGTH
  );
  let familiar: Word | null = null;
  if (familiarCandidates.length > 0 && slotsRemaining > 0) {
    familiar = shuffle(familiarCandidates)[0];
    selectedIds.add(familiar.id);
    slotsRemaining--;
  }

  // Up to two due verbs, ordered by priority (not random).
  const verbs: Word[] = [];
  for (const word of sortedDue) {
    if (!isVerb(word) || selectedIds.has(word.id)) continue;
    if (verbs.length >= MAX_VERBS_PER_SESSION) break;
    verbs.push(word);
    selectedIds.add(word.id);
    slotsRemaining--;
  }

  // Two additional due or priority words (non-verb preferred when verbs are full).
  const otherPriority: Word[] = [];
  const nonVerbDue = sortedDue.filter((w) => !isVerb(w) && !selectedIds.has(w.id));
  for (const word of nonVerbDue) {
    if (otherPriority.length >= TARGET_PRIORITY_WORDS || slotsRemaining <= 0) break;
    otherPriority.push(word);
    selectedIds.add(word.id);
    slotsRemaining--;
  }

  // Fill any remaining slots with more due words (verbs or otherwise).
  for (const word of sortedDue) {
    if (slotsRemaining <= 0) break;
    if (selectedIds.has(word.id)) continue;
    if (isVerb(word)) {
      verbs.push(word);
    } else {
      otherPriority.push(word);
    }
    selectedIds.add(word.id);
    slotsRemaining--;
  }

  return { familiar, verbs, otherPriority };
}

/** Open with familiar, then interleave verbs with other priority words. */
function orderSessionCards(
  familiar: Word | null,
  verbs: Word[],
  otherPriority: Word[]
): Word[] {
  const result: Word[] = [];
  if (familiar) result.push(familiar);

  let vi = 0;
  let oi = 0;
  while (vi < verbs.length || oi < otherPriority.length) {
    if (vi < verbs.length) result.push(verbs[vi++]);
    if (oi < otherPriority.length) result.push(otherPriority[oi++]);
  }

  return result;
}
