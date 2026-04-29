"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  MessageCircle,
  UtensilsCrossed,
  Home,
  Plane,
  MessageSquare,
  Zap,
  Star,
  BookOpen,
  Hash,
  Heart,
  ChevronLeft,
} from "lucide-react";
import WordCard from "@/components/student/WordCard";
import type { Word, WordCategory } from "@/types";

const CATEGORY_META: Record<
  WordCategory,
  { icon: React.ReactNode; accent: string; bg: string; border: string }
> = {
  Greetings:         { icon: <MessageCircle className="w-5 h-5" />,    accent: "text-sky-600",    bg: "bg-sky-50",     border: "border-sky-100"    },
  "Food & Drink":    { icon: <UtensilsCrossed className="w-5 h-5" />,  accent: "text-orange-600", bg: "bg-orange-50",  border: "border-orange-100" },
  "Daily life":      { icon: <Home className="w-5 h-5" />,             accent: "text-emerald-600",bg: "bg-emerald-50", border: "border-emerald-100"},
  Travel:            { icon: <Plane className="w-5 h-5" />,            accent: "text-teal-600",   bg: "bg-teal-50",    border: "border-teal-100"   },
  "Useful phrases":  { icon: <MessageSquare className="w-5 h-5" />,    accent: "text-violet-600", bg: "bg-violet-50",  border: "border-violet-100" },
  Verbs:             { icon: <Zap className="w-5 h-5" />,              accent: "text-amber-600",  bg: "bg-amber-50",   border: "border-amber-100"  },
  "Jewish holidays": { icon: <Star className="w-5 h-5" />,             accent: "text-yellow-600", bg: "bg-yellow-50",  border: "border-yellow-100" },
  "Lesson words":    { icon: <BookOpen className="w-5 h-5" />,         accent: "text-blue-600",   bg: "bg-blue-50",    border: "border-blue-100"   },
  Numbers:           { icon: <Hash className="w-5 h-5" />,             accent: "text-rose-600",   bg: "bg-rose-50",    border: "border-rose-100"   },
  Family:            { icon: <Heart className="w-5 h-5" />,            accent: "text-pink-600",   bg: "bg-pink-50",    border: "border-pink-100"   },
};

function CategoryCard({
  category,
  count,
  mastered,
  onClick,
  animDelay,
}: {
  category: WordCategory;
  count: number;
  mastered: number;
  onClick: () => void;
  animDelay: number;
}) {
  const meta = CATEGORY_META[category];
  const pct = count === 0 ? 0 : (mastered / count) * 100;

  return (
    <button
      type="button"
      onClick={onClick}
      style={{ animationDelay: `${animDelay}ms` }}
      className={`animate-pop-in text-left w-full p-4 rounded-2xl border transition-all duration-150 active:scale-[0.96] active:brightness-95 ${meta.bg} ${meta.border} shadow-sm`}
    >
      <div className={`mb-3 ${meta.accent}`}>{meta.icon}</div>
      <p className={`text-sm font-bold leading-tight ${meta.accent}`}>{category}</p>
      <p className={`text-xs mt-0.5 ${meta.accent} opacity-70`}>
        {count} {count === 1 ? "word" : "words"}
      </p>
      <div className="mt-3 h-1.5 bg-white/60 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 bg-current"
          style={{ width: `${pct}%` }}
        />
      </div>
    </button>
  );
}

export function StudentWordsClient({
  words,
  demoMode,
  error,
}: {
  words: Word[];
  demoMode: boolean;
  error?: string;
}) {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<WordCategory | null>(null);

  const categories = useMemo<WordCategory[]>(() => {
    const seen = new Set<WordCategory>();
    words.forEach((w) => seen.add(w.category));
    return Array.from(seen).sort();
  }, [words]);

  const categoryStats = useMemo(() => {
    const map: Record<string, { count: number; mastered: number }> = {};
    for (const w of words) {
      if (!map[w.category]) map[w.category] = { count: 0, mastered: 0 };
      map[w.category].count++;
      if (w.status === "mastered") map[w.category].mastered++;
    }
    return map;
  }, [words]);

  const filteredWords = useMemo(() => {
    const q = query.toLowerCase().trim();
    return words.filter((w) => {
      const matchesQuery =
        !q ||
        w.hebrewNiqqud.includes(q) ||
        w.hebrewPlain.includes(q) ||
        w.transliteration.toLowerCase().includes(q) ||
        w.english.toLowerCase().includes(q);
      const matchesCategory = !selectedCategory || w.category === selectedCategory;
      return matchesQuery && matchesCategory;
    });
  }, [query, selectedCategory, words]);

  const isSearching = query.trim().length > 0;
  const showWordList = isSearching || selectedCategory !== null;

  return (
    <div className="min-h-screen">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="px-5 pt-10 pb-5">
        {selectedCategory && !isSearching ? (
          <div className="animate-fade-slide-up">
            <button
              onClick={() => setSelectedCategory(null)}
              className="flex items-center gap-1 text-sky-500 font-semibold text-sm mb-3 min-h-[44px] -ml-1 px-1"
            >
              <ChevronLeft className="w-4 h-4" />
              All topics
            </button>
            <h1 className="text-3xl font-bold text-gray-900">{selectedCategory}</h1>
            <p className="text-base text-gray-400 mt-1">
              {filteredWords.length} {filteredWords.length === 1 ? "word" : "words"}
            </p>
          </div>
        ) : (
          <div className="animate-fade-slide-up">
            <Link
              href="/student"
              className="flex items-center gap-1 text-sky-500 font-semibold text-sm mb-3 min-h-[44px] -ml-1 px-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Home
            </Link>
            <h1 className="text-[32px] font-bold text-gray-900">My Words</h1>
            <p className="text-base text-gray-400 mt-1">
              {words.length} {words.length === 1 ? "word" : "words"} · {categories.length}{" "}
              {categories.length === 1 ? "topic" : "topics"}
              {demoMode && " · demo"}
            </p>
          </div>
        )}
      </div>

      {/* ── Error banner ────────────────────────────────────────── */}
      {error && (
        <div className="mx-5 mb-4 bg-rose-50 border border-rose-200 rounded-2xl px-4 py-3 animate-fade-slide-up">
          <p className="text-sm text-rose-700">Couldn&apos;t load words. Try again later.</p>
        </div>
      )}

      {/* ── Empty state ─────────────────────────────────────────── */}
      {!error && words.length === 0 && (
        <div className="px-5 py-16 text-center animate-fade-slide-up">
          <p className="text-5xl mb-4">📚</p>
          <p className="text-xl font-semibold text-gray-700">No words yet</p>
          <p className="text-base text-gray-400 mt-2">Dor will add words for you soon.</p>
        </div>
      )}

      {/* ── Search ──────────────────────────────────────────────── */}
      {words.length > 0 && (
        <div className="px-5 mb-6 animate-fade-slide-up delay-50">
          <div className="bg-white rounded-2xl border border-gray-200 flex items-center px-4 gap-3 shadow-sm min-h-[52px]">
            <Search className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Hebrew or English…"
              className="flex-1 py-3 text-base bg-transparent outline-none placeholder:text-gray-300"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="text-gray-400 text-sm font-medium min-h-[44px] px-1"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Category grid ───────────────────────────────────────── */}
      {!showWordList && words.length > 0 && (
        <div className="px-5">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-4 animate-fade-slide-up delay-75">
            Topics
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {categories.map((cat, i) => {
              const stats = categoryStats[cat] ?? { count: 0, mastered: 0 };
              return (
                <CategoryCard
                  key={cat}
                  category={cat}
                  count={stats.count}
                  mastered={stats.mastered}
                  onClick={() => setSelectedCategory(cat)}
                  animDelay={75 + i * 55}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* ── Word list ───────────────────────────────────────────── */}
      {showWordList && (
        <div className="px-5 pb-8 flex flex-col gap-3">
          {filteredWords.length > 0 ? (
            filteredWords.map((word, i) => (
              <div
                key={word.id}
                className="animate-fade-slide-up"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <WordCard word={word} />
              </div>
            ))
          ) : (
            <div className="text-center py-16 text-gray-400 animate-fade-slide-up">
              <p className="text-base">No words match</p>
              <p className="text-sm mt-1">Try a different search or topic</p>
            </div>
          )}
        </div>
      )}

      {/* ── Suggest word FAB ────────────────────────────────────── */}
      <Link
        href="/student/add-word"
        className="fixed bottom-24 right-4 xl:bottom-6 bg-sky-500 active:bg-sky-600 active:scale-[0.96] text-white rounded-full px-5 py-3.5 shadow-xl shadow-sky-300/50 flex items-center gap-2 text-sm font-bold z-40 transition-all"
      >
        + Suggest word
      </Link>
    </div>
  );
}
