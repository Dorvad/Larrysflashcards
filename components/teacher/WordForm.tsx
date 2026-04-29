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
  const [transliteration, setTransliteration] = useState(word?.transliteration ?? "");
  const [english, setEnglish] = useState(word?.english ?? "");
  const [exampleHebrew, setExampleHebrew] = useState(word?.exampleHebrew ?? "");
  const [exampleEnglish, setExampleEnglish] = useState(word?.exampleEnglish ?? "");
  const [category, setCategory] = useState<WordCategory>(word?.category ?? "Greetings");
  const [difficulty, setDifficulty] = useState<Difficulty>(word?.difficulty ?? "medium");
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
      {/* Section: The Word */}
      <FormSection label="The Word">
        <Field label="Hebrew with niqqud (vowel marks)" required>
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
        <Field label="Hebrew without niqqud">
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
        <Field label="Transliteration" required>
          <input
            className="input-field"
            value={transliteration}
            onChange={(e) => setTransliteration(e.target.value)}
            placeholder="shalom"
            required
          />
        </Field>
        <Field label="English meaning" required>
          <input
            className="input-field"
            value={english}
            onChange={(e) => setEnglish(e.target.value)}
            placeholder="hello, peace, goodbye"
            required
          />
        </Field>
      </FormSection>

      {/* Section: Usage */}
      <FormSection label="Usage Example">
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

      {/* Section: Teacher Notes */}
      <FormSection label="Teacher Notes">
        <Field label="Note for Larry">
          <textarea
            className="input-field resize-none"
            rows={3}
            value={teacherNote}
            onChange={(e) => setTeacherNote(e.target.value)}
            placeholder="A tip or connection to help Larry remember this word..."
          />
        </Field>
        <Field label="Difficulty">
          <div className="flex gap-3">
            {(["easy", "medium", "hard"] as Difficulty[]).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDifficulty(d)}
                className={`flex-1 py-3.5 rounded-xl text-base font-medium transition-colors capitalize border-2 min-h-[52px] active:scale-[0.97] ${
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
        {/* Weekly focus toggle — large tap target */}
        <label className="flex items-center gap-4 cursor-pointer py-2 min-h-[52px]">
          <input
            type="checkbox"
            checked={weeklyFocus}
            onChange={(e) => setWeeklyFocus(e.target.checked)}
            className="w-6 h-6 rounded accent-sky-500"
          />
          <span className="text-base text-gray-700">
            Add to this week&rsquo;s focus words
          </span>
        </label>
      </FormSection>

      {/* Section: Audio */}
      <FormSection label="Audio">
        <div className="bg-gray-50 rounded-2xl p-6 border-2 border-dashed border-gray-200 text-center">
          <p className="text-base text-gray-400">Audio upload — coming soon</p>
          <p className="text-sm text-gray-300 mt-1">
            You&rsquo;ll be able to record or upload a pronunciation clip here
          </p>
        </div>
      </FormSection>

      {/* Save */}
      <button
        type="submit"
        disabled={saved}
        className="w-full bg-sky-500 active:bg-sky-700 disabled:bg-emerald-500 text-white text-xl font-semibold py-5 rounded-2xl transition-colors active:scale-[0.97] min-h-[64px]"
      >
        {saved ? "Saved!" : isEditing ? "Save changes" : "Add word"}
      </button>
    </form>
  );
}

function FormSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3 px-1">
        {label}
      </h3>
      <div className="bg-white rounded-2xl px-5 py-5 shadow-sm border border-gray-100 flex flex-col gap-5">
        {children}
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-base font-medium text-gray-700">
        {label}
        {required && <span className="text-rose-400 ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}
