"use client";

import { useState, useRef } from "react";
import { createWord, updateWord } from "@/app/actions/words";
import { AudioUploader } from "./AudioUploader";
import { ImageUploader } from "./ImageUploader";
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
  const isEditing = Boolean(word);
  const formRef = useRef<HTMLFormElement>(null);

  // Text state
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

  // Media state
  const wordAudioBlob = useRef<Blob | null>(null);
  const exampleAudioBlob = useRef<Blob | null>(null);
  const imageFile = useRef<File | null>(null);
  const clearWordAudio = useRef(false);
  const clearExampleAudio = useRef(false);
  const clearImage = useRef(false);

  // Submit state
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const formData = new FormData();
    formData.set("hebrewNiqqud", hebrewNiqqud);
    formData.set("hebrewPlain", hebrewPlain);
    formData.set("transliteration", transliteration);
    formData.set("english", english);
    formData.set("exampleHebrew", exampleHebrew);
    formData.set("exampleEnglish", exampleEnglish);
    formData.set("category", category);
    formData.set("difficulty", difficulty);
    formData.set("teacherNote", teacherNote);
    formData.set("weeklyFocus", weeklyFocus ? "1" : "0");

    if (wordAudioBlob.current) {
      formData.set(
        "audioWord",
        new File([wordAudioBlob.current], "pronunciation.webm", {
          type: wordAudioBlob.current.type || "audio/webm",
        })
      );
    }
    if (clearWordAudio.current) formData.set("clearAudioWord", "1");

    if (exampleAudioBlob.current) {
      formData.set(
        "audioExample",
        new File([exampleAudioBlob.current], "example.webm", {
          type: exampleAudioBlob.current.type || "audio/webm",
        })
      );
    }
    if (clearExampleAudio.current) formData.set("clearAudioExample", "1");

    if (imageFile.current) {
      formData.set("image", imageFile.current);
    }
    if (clearImage.current) formData.set("clearImage", "1");

    const result = isEditing
      ? await updateWord(word!.id, formData)
      : await createWord(formData);

    if (result?.error) {
      setError(result.error);
      setSaving(false);
    } else {
      // Hard navigation so the server component re-fetches fresh data
      // (soft router.push may serve a cached render before revalidatePath propagates)
      window.location.href = "/teacher/words";
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-8">
      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl px-5 py-4">
          <p className="text-sm font-semibold text-rose-700 mb-1">Could not save</p>
          <p className="text-sm text-rose-600">{error}</p>
        </div>
      )}

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
      </FormSection>

      {/* Section: Category */}
      <FormSection label="Category">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`py-3 px-3 rounded-xl text-sm font-medium text-center transition-colors border-2 min-h-[48px] active:scale-[0.97] ${
                category === c
                  ? "border-sky-400 bg-sky-50 text-sky-700"
                  : "border-gray-200 bg-white text-gray-500"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </FormSection>

      {/* Section: Pronunciation */}
      <FormSection label="Pronunciation">
        <AudioUploader
          label="Word recording"
          existingUrl={word?.audioUrl}
          onBlobChange={(blob) => {
            wordAudioBlob.current = blob;
            if (!blob) clearWordAudio.current = true;
          }}
          onClear={() => {
            clearWordAudio.current = true;
          }}
        />
      </FormSection>

      {/* Section: Usage Example */}
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
        <AudioUploader
          label="Example sentence recording"
          existingUrl={word?.audioExampleUrl}
          onBlobChange={(blob) => {
            exampleAudioBlob.current = blob;
            if (!blob) clearExampleAudio.current = true;
          }}
          onClear={() => {
            clearExampleAudio.current = true;
          }}
        />
      </FormSection>

      {/* Section: Picture */}
      <FormSection label="Picture">
        <ImageUploader
          existingUrl={word?.imageUrl}
          onFileChange={(file) => {
            imageFile.current = file;
            if (!file) clearImage.current = true;
          }}
          onClear={() => {
            clearImage.current = true;
          }}
        />
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

      {/* Save */}
      <button
        type="submit"
        disabled={saving}
        className="w-full bg-sky-500 active:bg-sky-700 disabled:bg-sky-300 text-white text-xl font-semibold py-5 rounded-2xl transition-colors active:scale-[0.97] min-h-[64px]"
      >
        {saving ? "Saving…" : isEditing ? "Save changes" : "Add word"}
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
