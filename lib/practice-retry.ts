import type { Word } from "@/types";

export interface QueueCard {
  word: Word;
  /** True when this appearance is a one-time retry after "I forgot". */
  isRetry: boolean;
}

export function buildInitialQueue(words: Word[]): QueueCard[] {
  return words.map((word) => ({ word, isRetry: false }));
}

/**
 * Insert a single retry for a forgotten word.
 * - Only one retry per word per session.
 * - Placed after at least two other cards when possible, never immediately next.
 * - Retries do not count as additional unique vocabulary.
 */
export function insertForgottenRetry(
  queue: QueueCard[],
  currentIndex: number,
  word: Word,
  retriedWordIds: ReadonlySet<string>
): { queue: QueueCard[]; inserted: boolean } {
  if (retriedWordIds.has(word.id)) {
    return { queue, inserted: false };
  }

  const retryCard: QueueCard = { word, isRetry: true };
  // currentIndex is the card just answered; insert after at least two more cards.
  const minInsertIndex = currentIndex + 3;
  const insertIndex =
    minInsertIndex <= queue.length ? minInsertIndex : queue.length;

  const newQueue = [...queue];
  newQueue.splice(insertIndex, 0, retryCard);
  return { queue: newQueue, inserted: true };
}

/** Best outcome per word for calm session summaries (knew beats almost beats forgot). */
export function summarizeWordOutcomes(
  queue: QueueCard[],
  responses: Array<"forgot" | "almost" | "knew">
): { remembered: number; willReturn: number } {
  const best = new Map<string, number>();
  const rank = { forgot: 1, almost: 2, knew: 3 };

  queue.slice(0, responses.length).forEach((card, index) => {
    const response = responses[index];
    const score = rank[response];
    const prev = best.get(card.word.id) ?? 0;
    if (score > prev) best.set(card.word.id, score);
  });

  let remembered = 0;
  let willReturn = 0;
  for (const score of Array.from(best.values())) {
    if (score === 3) remembered++;
    else willReturn++;
  }

  return { remembered, willReturn };
}
