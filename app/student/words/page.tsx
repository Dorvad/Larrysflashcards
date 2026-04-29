"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { WORDS } from "@/lib/mock-data";
import WordCard from "@/components/student/WordCard";
import EmptyState from "@/components/shared/EmptyState";
import Link from "next/link";
import type { WordCategory, WordStatus } from "@/types";

const STATUS_OPTIONS: Array<WordStatus | "All"> = [
  "All",
  "new",
  "practicing",
  "strong",
  "mastered",
];

const STATUS_LABELS: Record<WordStatus | "All", string> = {
  All: "All",
  new: "New",
  practicing: "Practicing",
  strong: "Strong",
  mastered: "Mastered",
};

export default function WordsPage() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<WordCategory | "All">(
    "All"
  );
  const [activeStatus, setActiveStatus] = useState<WordStatus | "All">("All");

  // Derive unique categories from WORDS
  const categories = useMemo<Array<WordCategory | "All">>(() => {
    const cats = Array.from(new Set(WORDS.map((w) => w.category)));
    return ["All", ...cats] as Array<WordCategory | "All">;
  }, []);

  const filteredWords = useMemo(() => {
    const q = query.toLowerCase().trim();
    return WORDS.filter((word) => {
      const matchesQuery =
        !q ||
        word.hebrewNiqqud.includes(q) ||
        word.hebrewPlain.includes(q) ||
        word.transliteration.toLowerCase().includes(q) ||
        word.english.toLowerCase().includes(q);
      const matchesCategory =
        activeCategory === "All" || word.category === activeCategory;
      const matchesStatus =
        activeStatus === "All" || word.status === activeStatus;
      return matchesQuery && matchesCategory && matchesStatus;
    });
  }, [query, activeCategory, activeStatus]);

  return (
    <div className="bg-[#F7F5F0] min-h-screen relative">
      {/* Header */}
      <div className="px-4 pt-8 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">My Words</h1>
        <p className="text-base text-gray-500 mt-0.5">
          {WORDS.length} Hebrew words
        </p>
      </div>

      {/* Search bar */}
      <div className="px-4 mt-4">
        <div
          className="bg-white rounded-2xl border-2 border-gray-200 flex items-center px-4 gap-3"
          style={{ minHeight: "52px" }}
        >
          <Search className="w-5 h-5 text-gray-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Hebrew or English..."
            className="flex-1 py-3 text-base bg-transparent outline-none placeholder:text-gray-300"
          />
        </div>
      </div>

      {/* Category filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 mt-3 px-4">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`rounded-full px-4 py-2.5 text-sm font-medium whitespace-nowrap border transition-colors min-h-[44px] active:scale-[0.97] ${
              activeCategory === cat
                ? "bg-sky-500 text-white border-sky-500"
                : "bg-white text-gray-600 border-gray-200 active:bg-gray-100"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Status filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 mt-2 px-4">
        {STATUS_OPTIONS.map((status) => (
          <button
            key={status}
            onClick={() => setActiveStatus(status)}
            className={`rounded-full px-4 py-2.5 text-sm font-medium whitespace-nowrap border transition-colors min-h-[44px] active:scale-[0.97] ${
              activeStatus === status
                ? "bg-sky-500 text-white border-sky-500"
                : "bg-white text-gray-600 border-gray-200 active:bg-gray-100"
            }`}
          >
            {STATUS_LABELS[status]}
          </button>
        ))}
      </div>

      {/* Results count */}
      <div className="px-4 mt-4">
        <p className="text-sm text-gray-400">{filteredWords.length} words</p>
      </div>

      {/* Word list */}
      <div className="px-4 mt-3 flex flex-col gap-3 pb-32">
        {filteredWords.length > 0 ? (
          filteredWords.map((word) => <WordCard key={word.id} word={word} />)
        ) : (
          <EmptyState
            emoji="🔍"
            title="No words match this search"
            description="Try a different word or clear the filters"
          />
        )}
      </div>

      {/* Suggest a word FAB */}
      <Link
        href="/student/add-word"
        className="fixed bottom-24 right-4 bg-sky-500 text-white rounded-full px-5 py-3 shadow-lg flex items-center gap-2 text-base font-semibold z-40"
      >
        <span>+</span>
        <span>Suggest word</span>
      </Link>
    </div>
  );
}
