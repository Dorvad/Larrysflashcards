"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  ArrowLeft,
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
  ChevronRight,
} from "lucide-react";
import { WORDS } from "@/lib/mock-data";
import WordCard from "@/components/student/WordCard";
import EmptyState from "@/components/shared/EmptyState";
import type { WordCategory } from "@/types";

// ─── Category metadata ─────────────────────────────────────────────────────────

const CATEGORY_META: Record<
  WordCategory,
  { icon: React.ReactNode; color: string; bg: string; ring: string }
> = {
  Greetings: {
    icon: <MessageCircle className="w-6 h-6" />,
    color: "text-sky-600",
    bg: "bg-sky-50",
    ring: "ring-sky-200",
  },
  "Food & Drink": {
    icon: <UtensilsCrossed className="w-6 h-6" />,
    color: "text-orange-600",
    bg: "bg-orange-50",
    ring: "ring-orange-200",
  },
  "Daily life": {
    icon: <Home className="w-6 h-6" />,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    ring: "ring-emerald-200",
  },
  Travel: {
    icon: <Plane className="w-6 h-6" />,
    color: "text-teal-600",
    bg: "bg-teal-50",
    ring: "ring-teal-200",
  },
  "Useful phrases": {
    icon: <MessageSquare className="w-6 h-6" />,
    color: "text-violet-600",
    bg: "bg-violet-50",
    ring: "ring-violet-200",
  },
  Verbs: {
    icon: <Zap className="w-6 h-6" />,
    color: "text-amber-600",
    bg: "bg-amber-50",
    ring: "ring-amber-200",
  },
  "Jewish holidays": {
    icon: <Star className="w-6 h-6" />,
    color: "text-yellow-600",
    bg: "bg-yellow-50",
    ring: "ring-yellow-200",
  },
  "Lesson words": {
    icon: <BookOpen className="w-6 h-6" />,
    color: "text-blue-600",
    bg: "bg-blue-50",
    ring: "ring-blue-200",
  },
  Numbers: {
    icon: <Hash className="w-6 h-6" />,
    color: "text-rose-600",
    bg: "bg-rose-50",
    ring: "ring-rose-200",
  },
  Family: {
    icon: <Heart className="w-6 h-6" />,
    color: "text-pink-600",
    bg: "bg-pink-50",
    ring: "ring-pink-200",
  },
};

// ─── Mastery bar helper ────────────────────────────────────────────────────────

function MasteryBar({
  mastered,
  total,
}: {
  mastered: number;
  total: number;
}) {
  const pct = total === 0 ? 0 : Math.round((mastered / total) * 100);
  return (
    <div className="mt-3">
      <div className="flex justify-between text-xs text-gray-400 mb-1">
        <span>{mastered} mastered</span>
        <span>{pct}%</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-400 rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

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
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left w-full p-4 rounded-2xl border-2 transition-all active:scale-[0.97] ${
        active
          ? `${meta.bg} border-current ${meta.color} ring-2 ${meta.ring}`
          : "bg-white border-gray-100 shadow-sm active:bg-gray-50"
      }`}
    >
      <div className={`mb-2 ${meta.color}`}>{meta.icon}</div>
      <p className={`text-sm font-semibold leading-tight ${active ? meta.color : "text-gray-800"}`}>
        {category}
      </p>
      <p className={`text-xs mt-0.5 ${active ? meta.color : "text-gray-400"}`}>
        {count} {count === 1 ? "word" : "words"}
      </p>
      <MasteryBar mastered={mastered} total={count} />
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function WordsPage() {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<WordCategory | null>(null);

  // All categories present in the word list
  const categories = useMemo<WordCategory[]>(() => {
    const seen = new Set<WordCategory>();
    WORDS.forEach((w) => seen.add(w.category));
    return Array.from(seen).sort();
  }, []);

  // Stats per category
  const categoryStats = useMemo(() => {
    const map: Record<string, { count: number; mastered: number }> = {};
    for (const w of WORDS) {
      if (!map[w.category]) map[w.category] = { count: 0, mastered: 0 };
      map[w.category].count++;
      if (w.status === "mastered") map[w.category].mastered++;
    }
    return map;
  }, []);

  // Filtered words (search + category)
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

  function handleCategoryClick(cat: WordCategory) {
    setSelectedCategory(selectedCategory === cat ? null : cat);
  }

  return (
    <div className="bg-[#F7F5F0] min-h-screen relative">
      {/* Header */}
      <div className="px-4 pt-8 pb-4 flex items-center gap-3">
        {selectedCategory && !isSearching ? (
          <button
            onClick={() => setSelectedCategory(null)}
            className="flex items-center gap-2 min-h-[48px] text-gray-500 pr-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        ) : null}
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {selectedCategory && !isSearching ? selectedCategory : "My Words"}
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {isSearching || selectedCategory
              ? `${filteredWords.length} words`
              : `${WORDS.length} Hebrew words across ${categories.length} topics`}
          </p>
        </div>
      </div>

      {/* Search bar */}
      <div className="px-4">
        <div className="bg-white rounded-2xl border-2 border-gray-200 flex items-center px-4 gap-3 min-h-[52px]">
          <Search className="w-5 h-5 text-gray-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Hebrew or English…"
            className="flex-1 py-3 text-base bg-transparent outline-none placeholder:text-gray-300"
          />
        </div>
      </div>

      {/* Category grid — shown when not searching */}
      {!isSearching && (
        <div className="px-4 mt-5">
          {!selectedCategory && (
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
              Topics
            </p>
          )}
          <div className={selectedCategory ? "hidden" : "grid grid-cols-2 gap-3 sm:grid-cols-3"}>
            {categories.map((cat) => {
              const stats = categoryStats[cat] ?? { count: 0, mastered: 0 };
              return (
                <CategoryCard
                  key={cat}
                  category={cat}
                  count={stats.count}
                  mastered={stats.mastered}
                  active={selectedCategory === cat}
                  onClick={() => handleCategoryClick(cat)}
                />
              );
            })}
          </div>

          {/* Active category header with change button */}
          {selectedCategory && (
            <button
              onClick={() => setSelectedCategory(null)}
              className="w-full flex items-center justify-between bg-white border border-gray-200 rounded-2xl px-4 py-3 mb-4 shadow-sm active:bg-gray-50 min-h-[52px]"
            >
              <div className="flex items-center gap-3">
                <span className={CATEGORY_META[selectedCategory].color}>
                  {CATEGORY_META[selectedCategory].icon}
                </span>
                <span className="text-base font-semibold text-gray-800">
                  {selectedCategory}
                </span>
              </div>
              <span className="text-sm text-sky-500 font-medium flex items-center gap-1">
                All topics <ChevronRight className="w-4 h-4" />
              </span>
            </button>
          )}
        </div>
      )}

      {/* Word list */}
      {(isSearching || selectedCategory) && (
        <div className="px-4 mt-4 pb-32 flex flex-col gap-3">
          {filteredWords.length > 0 ? (
            filteredWords.map((word) => <WordCard key={word.id} word={word} />)
          ) : (
            <EmptyState
              emoji="🔍"
              title="No words match"
              description="Try a different search or pick another topic"
            />
          )}
        </div>
      )}

      {/* All words shortcut when no category selected and not searching */}
      {!isSearching && !selectedCategory && (
        <div className="px-4 mt-5 pb-32">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
            All words
          </p>
          <div className="flex flex-col gap-3">
            {WORDS.slice(0, 4).map((word) => (
              <WordCard key={word.id} word={word} />
            ))}
            {WORDS.length > 4 && (
              <button
                onClick={() => {
                  /* Show all — handled by selecting a category or searching */
                }}
                className="text-center text-sky-600 font-semibold text-base py-4 bg-white rounded-2xl border border-gray-100 shadow-sm active:bg-gray-50 min-h-[56px]"
              >
                Search to see all {WORDS.length} words
              </button>
            )}
          </div>
        </div>
      )}

      {/* Suggest a word FAB */}
      <Link
        href="/student/add-word"
        className="fixed bottom-24 right-4 xl:bottom-6 bg-sky-500 text-white rounded-full px-5 py-3 shadow-lg flex items-center gap-2 text-base font-semibold z-40 active:bg-sky-700 active:scale-[0.97] transition-all"
      >
        <span className="text-lg leading-none">+</span>
        <span>Suggest word</span>
      </Link>
    </div>
  );
}
