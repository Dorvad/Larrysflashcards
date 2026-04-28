"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { PENDING_WORDS } from "@/lib/mock-data";
import type { PendingWord } from "@/types";
import EmptyState from "@/components/shared/EmptyState";
import HebrewText from "@/components/shared/HebrewText";

function pendingStatusBadge(status: PendingWord["status"]) {
  if (status === "approved") {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-emerald-100 text-emerald-700">
        Approved
      </span>
    );
  }
  if (status === "rejected") {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-gray-100 text-gray-500">
        Declined
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-amber-100 text-amber-700">
      Pending
    </span>
  );
}

export default function PendingPage() {
  const [pendingWords, setPendingWords] = useState<PendingWord[]>([
    ...PENDING_WORDS,
  ]);

  function approvePending(id: string) {
    setPendingWords((prev) =>
      prev.map((w) => (w.id === id ? { ...w, status: "approved" } : w))
    );
  }

  function rejectPending(id: string) {
    setPendingWords((prev) =>
      prev.map((w) => (w.id === id ? { ...w, status: "rejected" } : w))
    );
  }

  const allProcessed = pendingWords.every((w) => w.status !== "pending");

  return (
    <div>
      {/* Header */}
      <h1 className="text-2xl font-bold text-gray-900 mb-1">📬 Pending Words</h1>
      <p className="text-base text-gray-500 mb-6">
        Words Larry would like to learn.
      </p>

      {allProcessed ? (
        <EmptyState
          emoji="🎉"
          title="All caught up!"
          description="No pending words right now."
        />
      ) : (
        pendingWords.map((word) => {
          const isApproved = word.status === "approved";
          const isRejected = word.status === "rejected";

          return (
            <div
              key={word.id}
              className={`bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-4 transition-all ${
                isApproved ? "border-l-4 border-l-emerald-400" : ""
              } ${isRejected ? "opacity-50" : ""}`}
            >
              {/* Top row: date + status */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-400">{word.submittedAt}</p>
                {pendingStatusBadge(word.status)}
              </div>

              {/* Hebrew guess */}
              {word.hebrewGuess && (
                <div className="mt-1">
                  <HebrewText size="sm" className="text-gray-900">
                    {word.hebrewGuess}
                  </HebrewText>
                </div>
              )}

              {/* English description */}
              <p className="text-xl font-semibold text-gray-900 mt-2">
                {word.englishDescription}
              </p>

              {/* Heard where */}
              <p className="text-sm text-gray-500 mt-1">
                Heard at: {word.heardWhere}
              </p>

              {/* Notes */}
              {word.notes && (
                <p className="text-sm text-gray-500 mt-1 italic">{word.notes}</p>
              )}

              {/* Approved confirmation note */}
              {isApproved && (
                <p className="text-sm text-emerald-700 mt-3 font-medium">
                  ✓ Added to Larry&rsquo;s words
                </p>
              )}

              {/* Action buttons — only shown if pending */}
              {word.status === "pending" && (
                <div className="flex gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => approvePending(word.id)}
                    className="flex-1 sm:flex-none bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl px-5 py-3 flex items-center justify-center gap-2 text-base font-semibold hover:bg-emerald-100 transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => rejectPending(word.id)}
                    className="flex-1 sm:flex-none bg-rose-50 text-rose-700 border border-rose-200 rounded-xl px-5 py-3 flex items-center justify-center gap-2 text-base font-semibold hover:bg-rose-100 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Decline
                  </button>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
