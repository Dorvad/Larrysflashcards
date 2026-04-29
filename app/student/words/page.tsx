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
import { WORDS } from "@/lib/mock-data";
import WordCard from "@/components/student/WordCard";
import type { WordCategory } from "@/types";

// ─── Category colours + icons ──────────────────────────────────────────────────

const CATEGORY_META: Record<
  WordCategory,
  { icon: React.ReactNode; accent: string; bg: string }
> = {
  Greetings:        { icon: <MessageCircle className="w-5 h-5" />,    accent: "text-sky-600",    bg: "bg-sky-50"    },
  "Food & Drink":   { icon: <UtensilsCrossed className="w-5 h-5" />,  accent: "text-orange-600", bg: "bg-orange-50" },
  "Daily life":     { icon: <Home className="w-5 h-5" />,             accent: "text-emerald-600",bg: "bg-emerald-50"},
  Travel:           { icon: <Plane className="w-5 h-5" />,            accent: "text-teal-600",   bg: "bg-teal-50"   },
  "Useful phrases": { icon: <MessageSquare className="w-5 h-5" />,    accent: "text-violet-600", bg: "bg-violet-50" },
  Verbs:            { icon: <Zap className="w-5 h-5" />,              accent: "text-amber-600",  bg: "bg-amber-50"  },
  "Jewish holidays":{ icon: <Star className="w-5 h-5" />,             accent: "text-yellow-600", bg: "bg-yellow-50" },
  "Lesson words":   { icon: <BookOpen className="w-5 h-5" />,         accent: "text-blue-600",   bg: "bg-blue-50"   },
  Numbers:          { icon: <Hash className="w-5 h-5" />,             accent: "text-rose-600",   bg: "bg-rose-50"   },
  Family:           { icon: <Heart className="w-5 h-5" />,            accent: "text-pink-600",   bg: "bg-pink-50"   },
};

// ─── Category card ─────────────────────────────────────────────────────────────

function CategoryCard({
  category,
  count,
  mastered,
  active,
  onClick,
}: {
  category: WordCategory;
  count: number;
  mastered: number;
  active: boolean;
  onClick: () => void;
}) {
  const meta = CATEGORY_META[category];
  const pct = count === 0 ? 0 : (mastered / count) * 100;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left w-full p-4 rounded-2xl border transition-all active:scale-[0.97] ${
        active
          ? `${meta.bg} border-current ${meta.accent} shadow-sm`
          : "bg-white border-gray-100 shadow-sm active:shadow-none"
      }`}
    >
      <div className={`mb-3 ${meta.accent}`}>{meta.icon}</div>
      <p className={`text-sm font-semibold leading-tight ${active ? meta.accent : "text-gray-800"}`}>
        {category}
      </p>
      <p className={`text-xs mt-0.5 ${active ? meta.accent : "text-gray-400"}`}>
        {count} {count === 1 ? "word" : "words"}
      </p>
      {/* Mastery bar */}
      <div className="mt-3 h-1 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${active ? "bg-current" : "bg-emerald-400"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function WordsPage() {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<WordCategory | null>(null);

  const categories = useMemo<WordCategory[]>(() => {
    const seen = new Set<WordCategory>();
    WORDS.forEach((w) => seen.add(w.category));
    return Array.from(seen).sort();
  }, []);

  const categoryStats = useMemo(() => {
    const map: Record<string, { count: number; mastered: number }> = {};
    for (const w of WORDS) {
      if (!map[w.category]) map[w.category] = { count: 0, mastered: 0 };
      map[w.category].count++;
      if (w.status === "mastered") map[w.category].mastered++;
    }
    return map;
  }, []);

  const filteredWords = useMemo(() => {
    const q = query.toLowerCase().trim();
    return WORDS.filter((w) => {
      const matchesQuery =
        !q ||
        w.hebrewNiqqud.includes(q) ||
        w.hebrewPlain.includes(q) ||
        w.transliteration.toLowerCase().includes(q) ||
        w.english.toLowerCase().includes(q);
      const matchesCategory = !selectedCategory || w.category === selectedCategory;
      return matchesQuery && matchesCategory;
    });
  }, [query, selectedCategory]);

  const isSearching = query.trim().length > 0;
  const showWordList = isSearching || selectedCategory !== null;

  return (
    <div className="min-h-screen">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="px-5 pt-12 pb-5">
        {selectedCategory && !isSearching ? (
          /* Sub-category view header */
          <>
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
          </>
        ) : (
          /* Main header */
          <>
            <h1 className="text-[32px] font-bold text-gray-900">My Words</h1>
            <p className="text-base text-gray-400 mt-1">
              {WORDS.length} words · {categories.length} topics
            </p>
          </>
        )}
      </div>

      {/* ── Search ──────────────────────────────────────────────── */}
      <div className="px-5 mb-5">
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
              className="text-gray-400 text-sm font-medium"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* ── Category grid ───────────────────────────────────────── */}
      {!showWordList && (
        <div className="px-5">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3">
            Topics
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {categories.map((cat) => {
              const stats = categoryStats[cat] ?? { count: 0, mastered: 0 };
              return (
                <CategoryCard
                  key={cat}
                  category={cat}
                  count={stats.count}
                  mastered={stats.mastered}
                  active={false}
                  onClick={() => setSelectedCategory(cat)}
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
            filteredWords.map((word) => <WordCard key={word.id} word={word} />)
          ) : (
            <div className="text-center py-16 text-gray-400">
              <p className="text-base">No words match</p>
              <p className="text-sm mt-1">Try a different search or topic</p>
            </div>
          )}
        </div>
      )}

      {/* ── Suggest word FAB ────────────────────────────────────── */}
      <Link
        href="/student/add-word"
        className="fixed bottom-24 right-4 xl:bottom-6 bg-sky-500 active:bg-sky-600 active:scale-[0.97] text-white rounded-full px-5 py-3.5 shadow-xl shadow-sky-300/50 flex items-center gap-2 text-sm font-bold z-40 transition-all"
      >
        + Suggest word
      </Link>
    </div>
  );
}
