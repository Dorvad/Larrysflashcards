"use client";

import { useState, useTransition } from "react";
import { Pencil, X, Download } from "lucide-react";
import Link from "next/link";
import { rejectWord } from "@/app/actions/pending";
import EmptyState from "@/components/shared/EmptyState";
import HebrewText from "@/components/shared/HebrewText";

export interface PendingWordData {
  id: string;
  hebrew: string;
  description: string;
  context: string;
  notes: string;
  submittedAt: string;
  hebrewPlain: string;
  hebrewNiqqud: string;
  transliteration: string;
  exampleHebrew: string;
  category: string;
  difficulty: string;
}

function csvField(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function exportPendingToCSV(words: PendingWordData[]) {
  const header = "hebrew,hebrew_niqqud,transliteration,meaning_en,example_he,example_en,category,difficulty,teacher_notes";
  const rows = words.map((w) => {
    const hebrewForExport = w.hebrewPlain === "(unknown)" ? "" : w.hebrewPlain;
    return [
      csvField(hebrewForExport),
      csvField(w.hebrewNiqqud),
      csvField(w.transliteration),
      csvField(w.description),
      csvField(w.exampleHebrew),
      csvField(w.context),
      csvField(w.category),
      csvField(w.difficulty),
      csvField(w.notes),
    ].join(",");
  });
  // BOM for Excel Hebrew compatibility
  const csv = "﻿" + [header, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `student-suggestions-${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

type LocalStatus = "pending" | "declined" | "error";

function PendingCard({ word }: { word: PendingWordData }) {
  const [status, setStatus] = useState<LocalStatus>("pending");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDecline() {
    startTransition(async () => {
      const result = await rejectWord(word.id);
      if (result.error) {
        setErrorMsg(result.error);
        setStatus("error");
      } else {
        setStatus("declined");
      }
    });
  }

  return (
    <div
      className={`bg-white rounded-2xl p-5 shadow-sm border border-gray-100 transition-all ${
        status === "declined" ? "opacity-40" : ""
      }`}
    >
      {/* Top row: date + status badge */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-gray-400">{word.submittedAt}</p>
        {status === "declined" && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-500">
            Declined
          </span>
        )}
        {status === "pending" && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-700">
            Pending
          </span>
        )}
        {status === "error" && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-rose-100 text-rose-700">
            Error
          </span>
        )}
      </div>

      {/* Hebrew guess */}
      {word.hebrew && word.hebrew !== "(unknown)" && (
        <div className="mb-1">
          <HebrewText size="sm" className="text-gray-900">
            {word.hebrew}
          </HebrewText>
        </div>
      )}

      {/* Description */}
      <p className="text-xl font-semibold text-gray-900 mb-1">{word.description}</p>

      {/* Context */}
      {word.context && <p className="text-sm text-gray-500">{word.context}</p>}

      {/* Notes */}
      {word.notes && <p className="text-sm text-gray-500 mt-1 italic">{word.notes}</p>}

      {/* Error */}
      {errorMsg && <p className="text-sm text-rose-600 mt-2">{errorMsg}</p>}

      {/* Action buttons */}
      {status === "pending" && (
        <div className="flex flex-col sm:flex-row gap-3 mt-5">
          <Link
            href={`/teacher/words/${word.id}/edit`}
            className="flex-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl px-5 py-4 flex items-center justify-center gap-2 text-base font-semibold active:bg-emerald-200 active:scale-[0.97] transition-all duration-100 min-h-[56px]"
          >
            <Pencil className="w-5 h-5" />
            Add to vocabulary
          </Link>
          <button
            type="button"
            onClick={handleDecline}
            disabled={isPending}
            className="flex-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl px-5 py-4 flex items-center justify-center gap-2 text-base font-semibold active:bg-rose-200 active:scale-[0.97] transition-all duration-100 min-h-[56px] disabled:opacity-50"
          >
            <X className="w-5 h-5" />
            {isPending ? "Saving…" : "Decline"}
          </button>
        </div>
      )}
    </div>
  );
}

export function TeacherPendingClient({
  words,
  demoMode,
  error,
}: {
  words: PendingWordData[];
  demoMode: boolean;
  error?: string;
}) {
  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-1">
        <h1 className="text-2xl font-bold text-gray-900">Pending Words</h1>
        {words.length > 0 && (
          <button
            type="button"
            onClick={() => exportPendingToCSV(words)}
            className="inline-flex items-center gap-2 text-sm text-sky-600 font-semibold min-h-[44px] px-3 py-2 rounded-xl bg-sky-50 border border-sky-200 active:bg-sky-100 transition-colors shrink-0"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        )}
      </div>
      <p className="text-base text-gray-500 mb-6">
        Words Larry would like to learn.
        {demoMode && (
          <span className="ml-2 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
            demo
          </span>
        )}
      </p>

      {error && (
        <div className="mb-6 bg-rose-50 border border-rose-200 rounded-2xl px-4 py-3">
          <p className="text-sm text-rose-700">
            Couldn&apos;t load pending words. Please try again later.
          </p>
        </div>
      )}

      {!error && words.length === 0 ? (
        <EmptyState emoji="🎉" title="All caught up!" description="No pending words right now." />
      ) : (
        <div className="flex flex-col gap-4">
          {words.map((word) => (
            <PendingCard key={word.id} word={word} />
          ))}
        </div>
      )}
    </div>
  );
}
