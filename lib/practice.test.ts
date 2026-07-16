import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildSessionDeck,
  isVerb,
  MAX_VERBS_PER_SESSION,
  SESSION_TARGET_SIZE,
} from "./practice-session";
import {
  buildInitialQueue,
  insertForgottenRetry,
  summarizeWordOutcomes,
} from "./practice-retry";
import type { Word } from "../types";

function makeWord(overrides: Partial<Word> & Pick<Word, "id" | "category">): Word {
  return {
    hebrewNiqqud: "א",
    hebrewPlain: "א",
    transliteration: "a",
    english: "a",
    exampleHebrew: "א",
    exampleEnglish: "a",
    status: "practicing",
    strength: 2,
    timesReviewed: 1,
    lastReviewed: null,
    nextReview: "2025-01-01T00:00:00.000Z",
    difficulty: "easy",
    ...overrides,
  };
}

describe("buildSessionDeck", () => {
  it("selects five unique words with verb priority and familiar opener", () => {
    const due = [
      makeWord({ id: "v1", category: "Verbs", strength: 1, nextReview: "2024-12-01T00:00:00.000Z" }),
      makeWord({ id: "v2", category: "Verbs", strength: 1, nextReview: "2024-12-02T00:00:00.000Z" }),
      makeWord({ id: "v3", category: "Verbs", strength: 2, nextReview: "2024-12-03T00:00:00.000Z" }),
      makeWord({ id: "v4", category: "Verbs", strength: 2, nextReview: "2024-12-04T00:00:00.000Z" }),
      makeWord({ id: "n1", category: "Food & Drink", strength: 1, nextReview: "2024-12-05T00:00:00.000Z" }),
      makeWord({ id: "n2", category: "Greetings", strength: 2, nextReview: "2024-12-06T00:00:00.000Z" }),
      makeWord({ id: "n3", category: "Travel", strength: 2, nextReview: "2024-12-07T00:00:00.000Z" }),
      makeWord({ id: "n4", category: "Daily life", strength: 3, nextReview: "2024-12-08T00:00:00.000Z" }),
    ];
    const familiar = [
      makeWord({
        id: "f1",
        category: "Greetings",
        strength: 4,
        nextReview: "2026-01-01T00:00:00.000Z",
      }),
      makeWord({
        id: "f2",
        category: "Food & Drink",
        strength: 5,
        nextReview: "2026-01-02T00:00:00.000Z",
      }),
    ];

    const built = buildSessionDeck(due, familiar);
    const ids = built.uniqueWords.map((w) => w.id);

    assert.equal(built.uniqueWords.length, SESSION_TARGET_SIZE);
    assert.equal(new Set(ids).size, SESSION_TARGET_SIZE);
    assert.ok(built.encouragementCount >= 1);
    assert.equal(built.cards[0].id, built.uniqueWords[0].id);
    assert.ok(familiar.some((w) => w.id === built.cards[0].id));
    assert.ok(built.verbCount <= MAX_VERBS_PER_SESSION);
    assert.ok(built.verbCount >= 2);
  });

  it("works without verbs", () => {
    const due = Array.from({ length: 6 }, (_, i) =>
      makeWord({
        id: `n${i}`,
        category: "Greetings",
        strength: 1,
        nextReview: `2024-12-0${i + 1}T00:00:00.000Z`,
      })
    );
    const familiar = [
      makeWord({
        id: "f1",
        category: "Food & Drink",
        strength: 4,
        nextReview: "2026-01-01T00:00:00.000Z",
      }),
    ];

    const built = buildSessionDeck(due, familiar);
    assert.equal(built.uniqueWords.length, SESSION_TARGET_SIZE);
    assert.equal(built.verbCount, 0);
    assert.ok(built.encouragementCount >= 1);
  });

  it("handles fewer than five due words", () => {
    const due = [
      makeWord({ id: "d1", category: "Verbs", strength: 1 }),
      makeWord({ id: "d2", category: "Greetings", strength: 2 }),
      makeWord({ id: "d3", category: "Travel", strength: 2 }),
    ];
    const familiar = [
      makeWord({
        id: "f1",
        category: "Food & Drink",
        strength: 4,
        nextReview: "2026-01-01T00:00:00.000Z",
      }),
    ];

    const built = buildSessionDeck(due, familiar);
    assert.equal(built.uniqueWords.length, 4);
    assert.equal(new Set(built.uniqueWords.map((w) => w.id)).size, 4);
  });

  it("does not duplicate familiar and due selections", () => {
    const due = [
      makeWord({ id: "d1", category: "Verbs", strength: 1 }),
      makeWord({ id: "d2", category: "Greetings", strength: 1 }),
      makeWord({ id: "d3", category: "Travel", strength: 2 }),
      makeWord({ id: "d4", category: "Daily life", strength: 2 }),
    ];
    const familiar = [
      makeWord({
        id: "f1",
        category: "Food & Drink",
        strength: 4,
        nextReview: "2026-01-01T00:00:00.000Z",
      }),
    ];

    const built = buildSessionDeck(due, familiar);
    const ids = built.uniqueWords.map((w) => w.id);
    assert.equal(new Set(ids).size, ids.length);
  });
});

describe("insertForgottenRetry", () => {
  const word = makeWord({ id: "w1", category: "Verbs" });

  it("inserts one retry after at least two other cards", () => {
    const queue = buildInitialQueue([
      word,
      makeWord({ id: "w2", category: "Greetings" }),
      makeWord({ id: "w3", category: "Travel" }),
      makeWord({ id: "w4", category: "Daily life" }),
      makeWord({ id: "w5", category: "Food & Drink" }),
    ]);

    const result = insertForgottenRetry(queue, 0, word, new Set());
    assert.equal(result.inserted, true);
    assert.equal(result.queue.length, 6);
    assert.equal(result.queue[0].word.id, "w1");
    assert.notEqual(result.queue[1].word.id, "w1");
    assert.notEqual(result.queue[2].word.id, "w1");
    assert.equal(result.queue[3].word.id, "w1");
    assert.equal(result.queue[3].isRetry, true);
  });

  it("does not insert a second retry for the same word", () => {
    const queue = buildInitialQueue([word, makeWord({ id: "w2", category: "Greetings" })]);
    const first = insertForgottenRetry(queue, 0, word, new Set());
    const second = insertForgottenRetry(first.queue, 0, word, new Set(["w1"]));
    assert.equal(second.inserted, false);
    assert.equal(second.queue.length, first.queue.length);
  });

  it("places retry at end when fewer than two cards remain", () => {
    const queue = buildInitialQueue([
      word,
      makeWord({ id: "w2", category: "Greetings" }),
    ]);
    const result = insertForgottenRetry(queue, 0, word, new Set());
    assert.equal(result.queue.length, 3);
    assert.equal(result.queue[2].word.id, "w1");
    assert.equal(result.queue[2].isRetry, true);
  });

  it("does not create a retry from a retry card", () => {
    const queue = [
      { word, isRetry: false },
      { word: makeWord({ id: "w2", category: "Greetings" }), isRetry: false },
      { word, isRetry: true },
    ];
    const result = insertForgottenRetry(queue, 2, word, new Set(["w1"]));
    assert.equal(result.inserted, false);
  });
});

describe("summarizeWordOutcomes", () => {
  it("uses the best outcome per unique word", () => {
    const queue = [
      { word: makeWord({ id: "w1", category: "Verbs" }), isRetry: false },
      { word: makeWord({ id: "w2", category: "Greetings" }), isRetry: false },
      { word: makeWord({ id: "w1", category: "Verbs" }), isRetry: true },
    ];
    const summary = summarizeWordOutcomes(queue, ["forgot", "almost", "knew"]);
    assert.equal(summary.remembered, 1);
    assert.equal(summary.willReturn, 1);
  });
});

describe("isVerb", () => {
  it("identifies verb category", () => {
    assert.equal(isVerb(makeWord({ id: "v", category: "Verbs" })), true);
    assert.equal(isVerb(makeWord({ id: "n", category: "Greetings" })), false);
  });
});
