"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { Word, WordSet } from "@/types/database";

interface WordFormProps {
  word?: Word;
  wordSets: WordSet[];
  teacherId: string;
}

export function WordForm({ word, wordSets, teacherId }: WordFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const isEditing = Boolean(word);

  const [hebrew, setHebrew] = useState(word?.hebrew ?? "");
  const [transliteration, setTransliteration] = useState(
    word?.transliteration ?? ""
  );
  const [english, setEnglish] = useState(word?.english ?? "");
  const [notes, setNotes] = useState(word?.notes ?? "");
  const [wordSetId, setWordSetId] = useState(word?.word_set_id ?? "");
  const [isActive, setIsActive] = useState(word?.is_active ?? true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const errs: Record<string, string> = {};
    if (!hebrew.trim()) errs.hebrew = "Hebrew word is required";
    if (!english.trim()) errs.english = "English translation is required";
    return errs;
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setSaving(true);
    const payload = {
      hebrew: hebrew.trim(),
      transliteration: transliteration.trim() || null,
      english: english.trim(),
      notes: notes.trim() || null,
      word_set_id: wordSetId || null,
      is_active: isActive,
      updated_at: new Date().toISOString(),
    };

    const { error } = isEditing
      ? await supabase.from("words").update(payload).eq("id", word!.id)
      : await supabase
          .from("words")
          .insert({ ...payload, created_by: teacherId });

    setSaving(false);
    if (error) {
      setErrors({ _: "Couldn't save. Please try again." });
    } else {
      router.push("/teacher/words");
      router.refresh();
    }
  }

  async function handleDelete() {
    if (!word || !confirm("Delete this word? This can't be undone.")) return;
    setDeleting(true);
    await supabase.from("words").delete().eq("id", word.id);
    router.push("/teacher/words");
    router.refresh();
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-5">
      {/* Hebrew — RTL input */}
      <div>
        <label
          htmlFor="hebrew"
          className="block text-lg font-medium text-gray-700 mb-2"
        >
          Hebrew word <span className="text-red-500">*</span>
        </label>
        <input
          id="hebrew"
          dir="rtl"
          lang="he"
          className={`w-full px-4 py-3 text-2xl bg-white border-2 rounded-xl font-hebrew focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-colors ${
            errors.hebrew ? "border-red-400 bg-red-50" : "border-gray-200"
          }`}
          value={hebrew}
          onChange={(e) => setHebrew(e.target.value)}
          placeholder="לשון"
          style={{ fontFamily: "var(--font-hebrew)" }}
        />
        {errors.hebrew && (
          <p className="mt-1 text-base text-red-600">{errors.hebrew}</p>
        )}
      </div>

      {/* Transliteration */}
      <div>
        <label
          htmlFor="translit"
          className="block text-lg font-medium text-gray-700 mb-2"
        >
          Transliteration{" "}
          <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <Input
          id="translit"
          value={transliteration}
          onChange={(e) => setTransliteration(e.target.value)}
          placeholder="lashon"
        />
      </div>

      {/* English */}
      <div>
        <label
          htmlFor="english"
          className="block text-lg font-medium text-gray-700 mb-2"
        >
          English translation <span className="text-red-500">*</span>
        </label>
        <Input
          id="english"
          value={english}
          onChange={(e) => setEnglish(e.target.value)}
          placeholder="language"
          error={errors.english}
        />
      </div>

      {/* Notes */}
      <div>
        <label
          htmlFor="notes"
          className="block text-lg font-medium text-gray-700 mb-2"
        >
          Notes for Larry{" "}
          <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <textarea
          id="notes"
          className="w-full px-4 py-3 text-lg bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-colors resize-none"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. used in everyday greetings"
        />
      </div>

      {/* Word set */}
      <div>
        <label
          htmlFor="wordSet"
          className="block text-lg font-medium text-gray-700 mb-2"
        >
          Lesson{" "}
          <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <select
          id="wordSet"
          className="w-full px-4 py-3 text-lg bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-colors min-h-[48px]"
          value={wordSetId}
          onChange={(e) => setWordSetId(e.target.value)}
        >
          <option value="">No lesson</option>
          {wordSets.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* Active toggle */}
      <label className="flex items-center gap-3 cursor-pointer py-2">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="w-6 h-6 rounded accent-sky-500"
        />
        <span className="text-lg text-gray-700">
          Active (shown to Larry during practice)
        </span>
      </label>

      {errors._ && (
        <p className="text-base text-red-600 bg-red-50 rounded-xl px-4 py-3">
          {errors._}
        </p>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="submit" loading={saving} size="xl">
          {isEditing ? "Save changes" : "Add word"}
        </Button>
      </div>

      {isEditing && (
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="text-base text-red-500 hover:underline text-center py-2 disabled:opacity-50"
        >
          {deleting ? "Deleting…" : "Delete this word"}
        </button>
      )}
    </form>
  );
}
