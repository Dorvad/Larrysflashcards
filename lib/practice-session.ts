import { shuffle } from "@/lib/utils";
import type { Word } from "@/types";

/**
 * Pedagogical session design (single-student app, age-friendly):
 * - Distributed practice: cap session length so learning spreads across days
 *   (Cepeda et al., 2006 — spacing effects).
 * - Interleaving: mix priority and familiar cards rather than blocking by
 *   difficulty (Rohrer & Taylor, 2007).
 * - Confidence warm-up: open with a familiar word, ~30% encouragement cards
 *   (self-efficacy / motivation, Bandura).
 * - Priority queue: overdue and weakest due words first (spaced repetition).
 */
export const SESSION_TARGET_SIZE = 10;
export const SESSION_MIN_SIZE = 6;
export const ENCOURAGEMENT_RATIO = 0.3;
export const FAMILIAR_MIN_STRENGTH = 3;

export interface BuiltSession {
  cards: Word[];
  priorityCount: number;
  encouragementCount: number;
  totalDueRemaining: number;
}

/** Sort due words: most overdue first, then lowest strength. */
export function sortDueByPriority(dueWords: Word[]): Word[] {
  const now = Date.now();
  return [...dueWords].sort((a, b) => {
    const aDue = a.nextReview ? new Date(a.nextReview).getTime() : now - 86_400_000;
    const bDue = b.nextReview ? new Date(b.nextReview).getTime() : now - 86_400_000;
    if (aDue !== bDue) return aDue - bDue;
    return a.strength - b.strength;
  });
}

export function buildSessionDeck(
  dueWords: Word[],
  familiarPool: Word[]
): BuiltSession {
  if (dueWords.length === 0) {
    return {
      cards: [],
      priorityCount: 0,
      encouragementCount: 0,
      totalDueRemaining: 0,
    };
  }

  const sortedDue = sortDueByPriority(dueWords);
  const encouragementTarget = Math.max(
    2,
    Math.round(SESSION_TARGET_SIZE * ENCOURAGEMENT_RATIO)
  );
  const encouragementCount = Math.min(encouragementTarget, familiarPool.length);
  let priorityCount = Math.min(
    sortedDue.length,
    SESSION_TARGET_SIZE - encouragementCount
  );

  if (priorityCount + encouragementCount < SESSION_MIN_SIZE) {
    priorityCount = Math.min(
      sortedDue.length,
      SESSION_MIN_SIZE - encouragementCount
    );
  }

  const priorityCards = sortedDue.slice(0, priorityCount);
  const encouragementCards = shuffle(familiarPool).slice(0, encouragementCount);
  const cards = interleaveCards(priorityCards, encouragementCards);

  return {
    cards,
    priorityCount: priorityCards.length,
    encouragementCount: encouragementCards.length,
    totalDueRemaining: Math.max(0, sortedDue.length - priorityCount),
  };
}

/** Estimate the next session size for home-screen copy. */
export function estimateNextSessionSize(
  dueCount: number,
  familiarAvailable: number
): number {
  if (dueCount === 0) return 0;
  const encouragement = Math.min(
    Math.max(2, Math.round(SESSION_TARGET_SIZE * ENCOURAGEMENT_RATIO)),
    familiarAvailable
  );
  const priority = Math.min(dueCount, SESSION_TARGET_SIZE - encouragement);
  return priority + encouragement;
}

function interleaveCards(priority: Word[], familiar: Word[]): Word[] {
  if (familiar.length === 0) return shuffle(priority);
  if (priority.length === 0) return shuffle(familiar);

  const result: Word[] = [];
  let pi = 0;
  let fi = 0;

  // Warm-up: one familiar card before harder material
  result.push(familiar[fi++]);

  while (pi < priority.length || fi < familiar.length) {
    for (let i = 0; i < 2 && pi < priority.length; i++) {
      result.push(priority[pi++]);
    }
    if (fi < familiar.length) {
      result.push(familiar[fi++]);
    }
  }

  return result;
}
