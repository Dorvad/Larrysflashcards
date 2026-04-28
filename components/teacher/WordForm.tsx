"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Word, WordCategory, Difficulty } from "@/types";

const CATEGORIES: WordCategory[] = [
  "Greetings",
  "Food & Drink",
  "Daily life",
  "Travel",
  "Useful phrases",
  "Verbs",
  "Jewish holidays",
  "Lesson words",
  "Numbers",
  "Family",
];

interface WordFormProps {
  word?: Word;
}

export function WordForm({ word }: WordFormProps) {
  const router = useRouter();
  const isEditing = Boolean(word);

  const [hebrewNiqqud, setHebrewNiqqud] = useState(word?.hebrewNiqqud ?? "");
  const [hebrewPlain, setHebrewPlain] = useState(word?.hebrewPlain ?? "");
  const [transliteration, setTransliteration] = useState(
    word?.transliteration ?? ""
  );
  const [english, setEnglish] = useState(word?.english ?? "");
  const [exampleHebrew, setExampleHebrew] = useState(
    word?.exampleHebrew ?? ""
  );
  const [exampleEnglish, setExampleEnglish] = useState(
    word?.exampleEnglish ?? ""
  );
  const [category, setCategory] = useState<WordCategory>(
    word?.category ?? "Greetings"
  );
  const [difficulty, setDifficulty] = useState<Difficulty>(
    word?.difficulty ?? "medium"
  );
  const [teacherNote, setTeacherNote] = useState(word?.teacherNote ?? "");
  const [weeklyFocus, setWeeklyFocus] = useState(false);
  const [saved, setSaved] = useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => {
      router.push("/teacher/words");
    }, 1200);
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-8">
      {/* Section A: Word */}
      <FormSection label="A. The Word" icon="📝">
        <Field label="Hebrew (with niqqud)">
          <input
            dir="rtl"
            lang="he"
            className="input-field text-2xl"
            style={{ fontFamily: "'Noto Serif Hebrew', serif" }}
            value={hebrewNiqqud}
            onChange={(e) => setHebrewNiqqud(e.target.value)}
            placeholder="שָׁלוֹם"
            required
          />
        </Field>
        <Field label="Hebrew (without niqqud)">
          <input
            dir="rtl"
            lang="he"
            className="input-field text-xl"
            style={{ fontFamily: "'Noto Serif Hebrew', serif" }}
            value={hebrewPlain}
            onChange={(e) => setHebrewPlain(e.target.value)}
            placeholder="שלום"
          />
        </Field>
        <Field label="Transliteration">
          <input
            className="input-field"
            value={transliteration}
            onChange={(e) => setTransliteration(e.target.value)}
            placeholder="shalom"
            required
          />
        </Field>
        <Field label="English meaning">
          <input
            className="input-field"
            value={english}
            onChange={(e) => setEnglish(e.target.value)}
            placeholder="hello, peace, goodbye"
            required
          />
        </Field>
      </FormSection>

      {/* Section B: Usage */}
      <FormSection label="B. Usage" icon="💬">
        <Field label="Hebrew example sentence">
          <textarea
            dir="rtl"
            lang="he"
            className="input-field text-lg resize-none"
            style={{ fontFamily: "'Noto Serif Hebrew', serif" }}
            rows={2}
            value={exampleHebrew}
            onChange={(e) => setExampleHebrew(e.target.value)}
            placeholder="שָׁלוֹם, מַה שְּׁלוֹמְךָ?"
          />
        </Field>
        <Field label="English translation of example">
          <input
            className="input-field"
            value={exampleEnglish}
            onChange={(e) => setExampleEnglish(e.target.value)}
            placeholder="Hello, how are you?"
          />
        </Field>
        <Field label="Category">
          <select
            className="input-field"
            value={category}
            onChange={(e) => setCategory(e.target.value as WordCategory)}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>
      </FormSection>

      {/* Section C: Teacher support */}
      <FormSection label="C. Teacher Notes" icon="👩‍🏫">
        <Field label="Note for Larry">
          <textarea
            className="input-field resize-none"
            rows={3}
            value={teacherNote}
            onChange={(e) => setTeacherNote(e.target.value)}
            placeholder="An interesting connection or tip to help Larry remember..."
          />
        </Field>
        <Field label="Difficulty">
          <div className="flex gap-3">
            {(["easy", "medium", "hard"] as Difficulty[]).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDifficulty(d)}
                className={`flex-1 py-3 rounded-xl text-base font-medium transition-colors capitalize border-2 ${
                  difficulty === d
                    ? d === "easy"
                      ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                      : d === "medium"
                      ? "border-amber-400 bg-amber-50 text-amber-700"
                      : "border-rose-400 bg-rose-50 text-rose-700"
                    : "border-gray-200 bg-white text-gray-500"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </Field>
        <label className="flex items-center gap-3 cursor-pointer py-1">
          <input
            type="checkbox"
            checked={weeklyFocus}
            onChange={(e) => setWeeklyFocus(e.target.checked)}
            className="w-5 h-5 rounded accent-sky-500"
          />
          <span className="text-base text-gray-700">
            Add to this week&rsquo;s focus words
          </span>
        </label>
      </FormSection>

      {/* Section D: Audio */}
      <FormSection label="D. Audio" icon="🔊">
        <div className="bg-gray-50 rounded-2xl p-5 border-2 border-dashed border-gray-200 text-center">
          <p className="text-gray-400 text-base">
            Audio upload — coming soon
          </p>
          <p className="text-gray-300 text-sm mt-1">
            You&rsquo;ll be able to record or upload a pronunciation clip here
          </p>
        </div>
      </FormSection>

      {/* Save button */}
      <button
        type="submit"
        disabled={saved}
        className="w-full bg-sky-500 hover:bg-sky-600 active:bg-sky-700 disabled:bg-emerald-500 text-white text-xl font-semibold py-5 rounded-2xl transition-colors min-h-[64px]"
      >
        {saved ? "✓  Saved!" : isEditing ? "Save changes" : "Add word"}
      </button>
    </form>
  );
}

function FormSection({
  label,
  icon,
  children,
}: {
  label: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg" aria-hidden>
          {icon}
        </span>
        <h3 className="text-base font-semibold text-gray-500 uppercase tracking-wider">
          {label}
        </h3>
      </div>
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-4">
        {children}
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-600">{label}</label>
      {children}
    </div>
  );
}
