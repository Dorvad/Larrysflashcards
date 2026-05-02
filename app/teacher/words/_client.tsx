"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Plus, Upload } from "lucide-react";
import StatusBadge from "@/components/shared/StatusBadge";
import HebrewText from "@/components/shared/HebrewText";
import EmptyState from "@/components/shared/EmptyState";
import type { Word, WordStatus } from "@/types";

type StatusFilter = "All" | WordStatus;
const STATUS_OPTIONS: StatusFilter[] = ["All", "new", "practicing", "strong", "mastered"];

export function TeacherWordsClient({
  words,
  demoMode = false,
  error,
}: {
  words: Word[];
  demoMode?: boolean;
  error?: string;
}) {
  const [query, setQuery] = useState("");
  const [activeStatus, setActiveStatus] = useState<StatusFilter>("All");

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return words.filter((w) => {
      const matchesQuery =
        !q ||
        w.english.toLowerCase().includes(q) ||
        w.transliteration.toLowerCase().includes(q) ||
        w.hebrewNiqqud.includes(q) ||
        w.hebrewPlain.includes(q);
      const matchesStatus = activeStatus === "All" || w.status === activeStatus;
      return matchesQuery && matchesStatus;
    });
  }, [words, query, activeStatus]);

  return (
    <div>
      {/* Demo mode banner */}
      {demoMode && (
        <div className="mb-5 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex items-start gap-3">
          <span className="text-amber-500 text-lg leading-none mt-0.5">⚠</span>
          <div>
            <p className="text-sm font-semibold text-amber-800">Demo mode</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Showing sample words. Add your Supabase credentials to <code className="font-mono bg-amber-100 px-1 rounded">.env.local</code> to use the real database.
            </p>
          </div>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="mb-5 bg-rose-50 border border-rose-200 rounded-2xl px-4 py-3 flex items-start gap-3">
          <span className="text-rose-500 text-lg leading-none mt-0.5">✕</span>
          <div>
            <p className="text-sm font-semibold text-rose-800">Database error</p>
            <p className="text-xs text-rose-700 mt-0.5 font-mono">{error}</p>
            <p className="text-xs text-rose-600 mt-1">
              Make sure the schema is set up and the student record exists in Supabase.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Words
          <span className="text-base font-normal text-gray-400 ml-2">
            {words.length}
          </span>
        </h1>
        <div className="flex items-center gap-2">
          <Link
            href="/teacher/words/import"
            className="bg-white border border-gray-200 text-gray-700 rounded-xl px-4 py-3 flex items-center gap-2 text-base font-semibold transition-colors min-h-[48px] active:bg-gray-50"
          >
            <Upload className="w-4 h-4" />
            Import CSV
          </Link>
          <Link
            href="/teacher/words/new"
            className="bg-sky-500 active:bg-sky-700 text-white rounded-xl px-5 py-3 flex items-center gap-2 text-base font-semibold transition-colors min-h-[48px]"
          >
            <Plus className="w-4 h-4" />
            Add word
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search words…"
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
            className={`rounded-full px-4 py-2.5 text-sm font-medium capitalize transition-colors min-h-[44px] ${
              activeStatus === s
                ? "bg-sky-500 text-white"
                : "bg-white text-gray-600 border border-gray-200 active:bg-gray-100"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <p className="text-sm text-gray-400 mb-3">{filtered.length} words</p>

      {filtered.length === 0 ? (
        <EmptyState
          emoji="🔍"
          title="No words found"
          description="Try clearing some filters or adding a new word"
        />
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((word) => (
            <Link
              key={word.id}
              href={`/teacher/words/${word.id}/edit`}
              className="bg-white rounded-xl px-4 py-4 flex items-center gap-4 shadow-sm active:bg-gray-50 transition-colors min-h-[64px] border border-gray-100"
            >
              {/* Image thumbnail */}
              {word.imageUrl && (
                <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={word.imageUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Hebrew */}
              <div className="w-28 shrink-0 text-right">
                <HebrewText size="sm" className="text-gray-900">
                  {word.hebrewNiqqud}
                </HebrewText>
              </div>

              {/* Transliteration */}
              <p className="hidden sm:block w-24 shrink-0 text-sm text-gray-400 italic">
                {word.transliteration}
              </p>

              {/* English */}
              <p className="flex-1 text-base font-medium text-gray-800 min-w-0 truncate">
                {word.english}
              </p>

              {/* Category */}
              <span className="hidden md:block text-xs bg-gray-50 rounded-full px-3 py-1 text-gray-500 shrink-0">
                {word.category}
              </span>

              {/* Status */}
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
