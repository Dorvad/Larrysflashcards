"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Send } from "lucide-react";

export default function AddWordPage() {
  const [hebrewGuess, setHebrewGuess] = useState("");
  const [description, setDescription] = useState("");
  const [heardWhere, setHeardWhere] = useState("");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const canSubmit = description.trim().length > 0 && heardWhere.trim().length > 0;

  function handleSubmit() {
    if (!canSubmit) return;
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="bg-[#F7F5F0] min-h-screen flex flex-col items-center justify-center px-6 animate-slide-up">
        <span className="text-6xl" aria-hidden="true">
          ✅
        </span>
        <h1 className="text-2xl font-bold text-gray-900 mt-4">
          Sent to Dor!
        </h1>
        <p className="text-base text-gray-500 mt-2 text-center">
          Dor will review your word and add it to your list.
        </p>
        <Link
          href="/student/words"
          className="btn-primary mt-6 text-base w-full max-w-xs text-center rounded-2xl py-4"
        >
          Back to My Words
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#F7F5F0] min-h-screen">
      {/* Top bar */}
      <div className="px-4 pt-6 flex items-center gap-3">
        <Link
          href="/student/words"
          className="flex items-center gap-2 text-gray-500 min-h-[48px]"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-base">Back</span>
        </Link>
        <h1 className="text-xl font-bold text-gray-900 ml-2">Suggest a word</h1>
      </div>

      {/* Info banner */}
      <div className="mt-4 px-4">
        <div className="bg-sky-50 rounded-2xl p-4 border border-sky-100 flex items-start gap-3">
          <span className="text-xl shrink-0" aria-hidden="true">
            💌
          </span>
          <p className="text-sm text-sky-700">
            Write the word or description here, and Dor will add it for you.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="mt-6 px-4 flex flex-col gap-5 pb-10">
        {/* Hebrew word (optional) */}
        <div>
          <label
            htmlFor="hebrew-guess"
            className="block text-base font-medium text-gray-700 mb-1.5"
          >
            Hebrew word{" "}
            <span className="text-gray-400 font-normal">(if you know it)</span>
          </label>
          <input
            id="hebrew-guess"
            type="text"
            dir="rtl"
            lang="he"
            value={hebrewGuess}
            onChange={(e) => setHebrewGuess(e.target.value)}
            placeholder="שלום"
            className="input-field text-2xl"
            style={{ fontFamily: "'Noto Serif Hebrew', serif" }}
          />
        </div>

        {/* What does it mean? (required) */}
        <div>
          <label
            htmlFor="description"
            className="block text-base font-medium text-gray-700 mb-1.5"
          >
            What does it mean?{" "}
            <span className="text-rose-400 font-normal">*</span>
          </label>
          <input
            id="description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. good morning"
            className="input-field"
          />
        </div>

        {/* Where did you see/hear it? (required) */}
        <div>
          <label
            htmlFor="heard-where"
            className="block text-base font-medium text-gray-700 mb-1.5"
          >
            Where did you see or hear it?{" "}
            <span className="text-rose-400 font-normal">*</span>
          </label>
          <input
            id="heard-where"
            type="text"
            value={heardWhere}
            onChange={(e) => setHeardWhere(e.target.value)}
            placeholder="e.g. in a song, on a sign..."
            className="input-field"
          />
        </div>

        {/* Any notes? (optional) */}
        <div>
          <label
            htmlFor="notes"
            className="block text-base font-medium text-gray-700 mb-1.5"
          >
            Any notes?{" "}
            <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            id="notes"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Whatever you remember..."
            className="input-field resize-none"
          />
        </div>

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="bg-sky-500 text-white text-xl rounded-2xl py-5 w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.97] transition-transform"
        >
          <Send className="w-5 h-5" />
          Send to Dor
        </button>
      </div>
    </div>
  );
}
