"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Plus } from "lucide-react";
import { WORDS } from "@/lib/mock-data";
import StatusBadge from "@/components/shared/StatusBadge";
import HebrewText from "@/components/shared/HebrewText";
import EmptyState from "@/components/shared/EmptyState";
import type { WordCategory, WordStatus, Difficulty } from "@/types";

type StatusFilter = "All" | WordStatus;
type CategoryFilter = "All" | WordCategory;
type DifficultyFilter = "All" | Difficulty;

const STATUS_OPTIONS: StatusFilter[] = ["All", "new", "practicing", "strong", "mastered"];

export default function WordsPage() {
  const [query, setQuery] = useState("");
  const [activeStatus, setActiveStatus] = useState<StatusFilter>("All");
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("All");
  const [activeDifficulty, setActiveDifficulty] = useState<DifficultyFilter>("All");

  const filteredWords = useMemo(() => {
    return WORDS.filter((word) => {
      const q = query.toLowerCase();
      const matchesQuery =
        !q ||
        word.english.toLowerCase().includes(q) ||
        word.transliteration.toLowerCase().includes(q) ||
        word.hebrewNiqqud.includes(q) ||
        word.hebrewPlain.includes(q);
      const matchesStatus = activeStatus === "All" || word.status === activeStatus;
      const matchesCategory = activeCategory === "All" || word.category === activeCategory;
      const matchesDifficulty = activeDifficulty === "All" || word.difficulty === activeDifficulty;
      return matchesQuery && matchesStatus && matchesCategory && matchesDifficulty;
    });
  }, [query, activeStatus, activeCategory, activeDifficulty]);

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Words</h1>
        <Link
          href="/teacher/words/new"
          className="bg-sky-500 active:bg-sky-700 text-white rounded-xl px-5 py-3 flex items-center gap-2 text-base font-semibold transition-colors min-h-[48px]"
        >
          <Plus className="w-4 h-4" />
          Add word
        </Link>
      </div>

      {/* Search bar */}
      <div className="relative mb-5">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search words..."
          className="w-full bg-white border border-gray-200 rounded-xl pl-11 pr-4 py-3.5 text-base text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-300 shadow-sm min-h-[52px]"
        />
      </div>

      {/* Status filter chips */}
      <div className="flex flex-wrap gap-2 mb-5">
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setActiveStatus(s)}
            className={`rounded-full px-4 py-2.5 text-sm font-medium cursor-pointer transition-colors capitalize min-h-[44px] ${
              activeStatus === s
                ? "bg-sky-500 text-white"
                : "bg-white text-gray-600 border border-gray-200 active:bg-gray-100"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Results count */}
      <p className="text-sm text-gray-400 mb-3">{filteredWords.length} words</p>

      {/* Word list — each row is a full tap target */}
      {filteredWords.length === 0 ? (
        <EmptyState
          emoji="🔍"
          title="No words found"
          description="Try clearing some filters"
        />
      ) : (
        <div className="flex flex-col gap-2">
          {filteredWords.map((word) => (
            <Link
              key={word.id}
              href={`/teacher/words/${word.id}/edit`}
              className="bg-white rounded-xl px-5 py-4 flex items-center gap-4 shadow-sm active:bg-gray-50 transition-colors min-h-[64px]"
            >
              {/* Hebrew */}
              <div className="w-28 shrink-0 text-right">
                <HebrewText size="sm" className="text-gray-900">
                  {word.hebrewNiqqud}
                </HebrewText>
              </div>

              {/* Transliteration — hidden on smallest screens */}
              <p className="hidden sm:block w-28 shrink-0 text-sm text-gray-400 italic">
                {word.transliteration}
              </p>

              {/* English */}
              <p className="flex-1 text-base font-medium text-gray-800 min-w-0 truncate">
                {word.english}
              </p>

              {/* Category */}
              <span className="hidden md:inline-block text-xs bg-gray-50 rounded-full px-3 py-1 text-gray-500 shrink-0">
                {word.category}
              </span>

              {/* Status badge */}
              <div className="shrink-0">
                <StatusBadge status={word.status} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
