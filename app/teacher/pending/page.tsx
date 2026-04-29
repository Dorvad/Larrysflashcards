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
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-700">
        Approved
      </span>
    );
  }
  if (status === "rejected") {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-500">
        Declined
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-700">
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
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Pending Words</h1>
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
        <div className="flex flex-col gap-4">
          {pendingWords.map((word) => {
            const isApproved = word.status === "approved";
            const isRejected = word.status === "rejected";

            return (
              <div
                key={word.id}
                className={`bg-white rounded-2xl p-5 shadow-sm border border-gray-100 transition-all ${
                  isApproved ? "border-l-4 border-l-emerald-400" : ""
                } ${isRejected ? "opacity-50" : ""}`}
              >
                {/* Top row: date + status */}
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-gray-400">{word.submittedAt}</p>
                  {pendingStatusBadge(word.status)}
                </div>

                {/* Hebrew guess */}
                {word.hebrewGuess && (
                  <div className="mb-1">
                    <HebrewText size="sm" className="text-gray-900">
                      {word.hebrewGuess}
                    </HebrewText>
                  </div>
                )}

                {/* English description */}
                <p className="text-xl font-semibold text-gray-900 mb-1">
                  {word.englishDescription}
                </p>

                {/* Heard where */}
                <p className="text-sm text-gray-500">
                  Heard at: {word.heardWhere}
                </p>

                {/* Notes */}
                {word.notes && (
                  <p className="text-sm text-gray-500 mt-1 italic">{word.notes}</p>
                )}

                {/* Approved confirmation */}
                {isApproved && (
                  <p className="text-sm text-emerald-700 mt-3 font-medium">
                    Added to Larry&rsquo;s words
                  </p>
                )}

                {/* Action buttons — full-width on phone, auto-width on sm+ */}
                {word.status === "pending" && (
                  <div className="flex flex-col sm:flex-row gap-3 mt-5">
                    <button
                      type="button"
                      onClick={() => approvePending(word.id)}
                      className="flex-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl px-5 py-4 flex items-center justify-center gap-2 text-base font-semibold active:bg-emerald-200 active:scale-[0.97] transition-all duration-100 min-h-[56px]"
                    >
                      <Check className="w-5 h-5" />
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => rejectPending(word.id)}
                      className="flex-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl px-5 py-4 flex items-center justify-center gap-2 text-base font-semibold active:bg-rose-200 active:scale-[0.97] transition-all duration-100 min-h-[56px]"
                    >
                      <X className="w-5 h-5" />
                      Decline
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
