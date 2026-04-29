"use client";

import { useState, useTransition } from "react";
import { Check, X } from "lucide-react";
import { approveWord, rejectWord } from "@/app/actions/pending";
import EmptyState from "@/components/shared/EmptyState";
import HebrewText from "@/components/shared/HebrewText";

export interface PendingWordData {
  id: string;
  hebrew: string;
  description: string;
  context: string;
  notes: string;
  submittedAt: string;
}

type LocalStatus = "pending" | "approved" | "declined" | "error";

function PendingCard({ word }: { word: PendingWordData }) {
  const [status, setStatus] = useState<LocalStatus>("pending");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleApprove() {
    startTransition(async () => {
      const result = await approveWord(word.id);
      if (result.error) {
        setErrorMsg(result.error);
        setStatus("error");
      } else {
        setStatus("approved");
      }
    });
  }

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
        status === "approved" ? "border-l-4 border-l-emerald-400" : ""
      } ${status === "declined" ? "opacity-40" : ""}`}
    >
      {/* Top row: date + status badge */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-gray-400">{word.submittedAt}</p>
        {status === "approved" && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-700">
            Approved
          </span>
        )}
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

      {/* Approved confirmation */}
      {status === "approved" && (
        <p className="text-sm text-emerald-700 mt-3 font-medium">Added to Larry&rsquo;s words</p>
      )}

      {/* Action buttons */}
      {status === "pending" && (
        <div className="flex flex-col sm:flex-row gap-3 mt-5">
          <button
            type="button"
            onClick={handleApprove}
            disabled={isPending}
            className="flex-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl px-5 py-4 flex items-center justify-center gap-2 text-base font-semibold active:bg-emerald-200 active:scale-[0.97] transition-all duration-100 min-h-[56px] disabled:opacity-50"
          >
            <Check className="w-5 h-5" />
            {isPending ? "Saving…" : "Approve"}
          </button>
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
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Pending Words</h1>
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
