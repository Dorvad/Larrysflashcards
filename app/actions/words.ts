"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export interface WordActionResult {
  error?: string;
  wordId?: string;
}

async function ensureTeacher() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated. Please log in.");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "teacher") throw new Error("Only teachers can manage words.");
  return { supabase, user };
}

async function getStudentId(teacherId: string): Promise<string> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("students")
    .select("id")
    .eq("teacher_id", teacherId)
    .limit(1)
    .single();

  if (error || !data) {
    throw new Error(
      "No student found for your account. " +
        "Please create a student record in the database first (see supabase/seed.sql)."
    );
  }
  return data.id;
}

async function uploadMedia(file: File, path: string): Promise<string> {
  const admin = createAdminClient();
  const { error } = await admin.storage
    .from("word-media")
    .upload(path, file, { upsert: true });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  const {
    data: { publicUrl },
  } = admin.storage.from("word-media").getPublicUrl(path);

  return publicUrl;
}

export async function createWord(formData: FormData): Promise<WordActionResult> {
  try {
    const { user } = await ensureTeacher();
    const studentId = await getStudentId(user.id);
    const admin = createAdminClient();

    const tempId = crypto.randomUUID();
    let audioUrl: string | null = null;
    let audioExampleUrl: string | null = null;
    let imageUrl: string | null = null;

    const wordAudioFile = formData.get("audioWord") as File | null;
    if (wordAudioFile && wordAudioFile.size > 0) {
      audioUrl = await uploadMedia(wordAudioFile, `audio/${tempId}/word.webm`);
    }

    const exampleAudioFile = formData.get("audioExample") as File | null;
    if (exampleAudioFile && exampleAudioFile.size > 0) {
      audioExampleUrl = await uploadMedia(
        exampleAudioFile,
        `audio/${tempId}/example.webm`
      );
    }

    const imageFile = formData.get("image") as File | null;
    if (imageFile && imageFile.size > 0) {
      const ext = imageFile.type.split("/")[1] || "jpg";
      imageUrl = await uploadMedia(imageFile, `images/${tempId}/image.${ext}`);
    }

    const weeklyFocus = formData.get("weeklyFocus") === "1";

    const { data, error } = await admin
      .from("words")
      .insert({
        student_id: studentId,
        created_by: user.id,
        hebrew_niqqud: formData.get("hebrewNiqqud") as string,
        hebrew: (formData.get("hebrewPlain") as string) || null,
        transliteration: (formData.get("transliteration") as string) || null,
        meaning_en: formData.get("english") as string,
        example_he: (formData.get("exampleHebrew") as string) || null,
        example_en: (formData.get("exampleEnglish") as string) || null,
        category: (formData.get("category") as string) || null,
        difficulty: (formData.get("difficulty") as string) || "medium",
        teacher_notes: (formData.get("teacherNote") as string) || null,
        audio_url: audioUrl,
        audio_example_url: audioExampleUrl,
        image_url: imageUrl,
        is_active: true,
        is_pending_approval: false,
      })
      .select("id")
      .single();

    if (error) return { error: error.message };

    if (weeklyFocus && data) {
      const weekStart = getWeekStart();
      await admin.from("weekly_focus").insert({
        student_id: studentId,
        word_id: data.id,
        week_start_date: weekStart,
        created_by: user.id,
      });
    }

    revalidatePath("/teacher/words");
    revalidatePath("/student/words");
    revalidatePath("/student/practice");
    return { wordId: data?.id };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Unknown error" };
  }
}

export async function updateWord(
  id: string,
  formData: FormData
): Promise<WordActionResult> {
  try {
    await ensureTeacher();
    const admin = createAdminClient();

    const updates: Record<string, unknown> = {
      hebrew_niqqud: formData.get("hebrewNiqqud"),
      hebrew: (formData.get("hebrewPlain") as string) || null,
      transliteration: (formData.get("transliteration") as string) || null,
      meaning_en: formData.get("english"),
      example_he: (formData.get("exampleHebrew") as string) || null,
      example_en: (formData.get("exampleEnglish") as string) || null,
      category: (formData.get("category") as string) || null,
      difficulty: formData.get("difficulty") || "medium",
      teacher_notes: (formData.get("teacherNote") as string) || null,
      // Activate the word when a teacher saves — handles both regular edits
      // and student suggestions (which start as is_active=false, is_pending_approval=true)
      is_active: true,
      is_pending_approval: false,
    };

    const wordAudioFile = formData.get("audioWord") as File | null;
    if (wordAudioFile && wordAudioFile.size > 0) {
      updates.audio_url = await uploadMedia(wordAudioFile, `audio/${id}/word.webm`);
    } else if (formData.get("clearAudioWord") === "1") {
      updates.audio_url = null;
    }

    const exampleAudioFile = formData.get("audioExample") as File | null;
    if (exampleAudioFile && exampleAudioFile.size > 0) {
      updates.audio_example_url = await uploadMedia(
        exampleAudioFile,
        `audio/${id}/example.webm`
      );
    } else if (formData.get("clearAudioExample") === "1") {
      updates.audio_example_url = null;
    }

    const imageFile = formData.get("image") as File | null;
    if (imageFile && imageFile.size > 0) {
      const ext = imageFile.type.split("/")[1] || "jpg";
      updates.image_url = await uploadMedia(imageFile, `images/${id}/image.${ext}`);
    } else if (formData.get("clearImage") === "1") {
      updates.image_url = null;
    }

    const { error } = await admin.from("words").update(updates).eq("id", id);
    if (error) return { error: error.message };

    revalidatePath("/teacher", "layout");
    revalidatePath("/student/words");
    return { wordId: id };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Unknown error" };
  }
}

export async function deleteWord(id: string): Promise<WordActionResult> {
  try {
    await ensureTeacher();
    const admin = createAdminClient();
    const { error } = await admin.from("words").update({ is_active: false }).eq("id", id);
    if (error) return { error: error.message };

    revalidatePath("/teacher/words");
    revalidatePath("/student/words");
    return { wordId: id };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Unknown error" };
  }
}

export interface ImportRow {
  hebrew: string;
  hebrewNiqqud?: string;
  transliteration?: string;
  english: string;
  exampleHebrew?: string;
  exampleEnglish?: string;
  category?: string;
  difficulty?: string;
  teacherNote?: string;
}

export interface ImportResult {
  imported: number;
  errors: { row: number; message: string }[];
}

export async function importWords(rows: ImportRow[]): Promise<ImportResult> {
  const errors: { row: number; message: string }[] = [];
  let imported = 0;

  try {
    const { user } = await ensureTeacher();
    const studentId = await getStudentId(user.id);
    const admin = createAdminClient();

    const VALID_CATEGORIES = [
      "Greetings","Food & Drink","Daily life","Travel","Useful phrases",
      "Verbs","Jewish holidays","Lesson words","Numbers","Family",
    ];
    const VALID_DIFFICULTIES = ["easy", "medium", "hard"];

    // Process in chunks of 50 to avoid timeouts
    const CHUNK = 50;
    for (let start = 0; start < rows.length; start += CHUNK) {
      const chunk = rows.slice(start, start + CHUNK);
      const inserts = chunk
        .map((r, i) => {
          const rowNum = start + i + 1;
          if (!r.hebrew?.trim()) {
            errors.push({ row: rowNum, message: "Hebrew is required" });
            return null;
          }
          if (!r.english?.trim()) {
            errors.push({ row: rowNum, message: "English meaning is required" });
            return null;
          }
          const category = VALID_CATEGORIES.includes(r.category ?? "")
            ? r.category
            : "Lesson words";
          const difficulty = VALID_DIFFICULTIES.includes(r.difficulty ?? "")
            ? r.difficulty
            : "medium";
          return {
            student_id: studentId,
            created_by: user.id,
            hebrew: r.hebrew.trim(),
            hebrew_niqqud: r.hebrewNiqqud?.trim() || r.hebrew.trim(),
            transliteration: r.transliteration?.trim() || null,
            meaning_en: r.english.trim(),
            example_he: r.exampleHebrew?.trim() || null,
            example_en: r.exampleEnglish?.trim() || null,
            category,
            difficulty,
            teacher_notes: r.teacherNote?.trim() || null,
            is_active: true,
            is_pending_approval: false,
          };
        })
        .filter(Boolean);

      if (inserts.length > 0) {
        const { error } = await admin.from("words").insert(inserts);
        if (error) {
          // Mark entire chunk as errored
          for (let i = start; i < start + chunk.length; i++) {
            errors.push({ row: i + 1, message: error.message });
          }
        } else {
          imported += inserts.length;
        }
      }
    }

    revalidatePath("/teacher/words");
    revalidatePath("/student/words");
    revalidatePath("/student");
  } catch (e) {
    return {
      imported: 0,
      errors: [{ row: 0, message: e instanceof Error ? e.message : "Import failed" }],
    };
  }

  return { imported, errors };
}

export async function suggestWord(formData: FormData): Promise<WordActionResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "Not signed in." };

    const { data: student, error: studentErr } = await supabase
      .from("students")
      .select("id")
      .eq("profile_id", user.id)
      .single();

    if (studentErr || !student) {
      return { error: "Student record not found. Ask Dor for help." };
    }

    const hebrewGuess = ((formData.get("hebrewGuess") as string) ?? "").trim();
    const description = ((formData.get("description") as string) ?? "").trim();
    const heardWhere = ((formData.get("heardWhere") as string) ?? "").trim();
    const notes = ((formData.get("notes") as string) ?? "").trim();

    if (!description) return { error: "Please describe the word." };

    const { data, error } = await supabase
      .from("words")
      .insert({
        student_id: student.id,
        created_by: user.id,
        hebrew: hebrewGuess || "(unknown)",
        hebrew_niqqud: hebrewGuess || null,
        meaning_en: description,
        example_en: heardWhere ? `Heard: ${heardWhere}` : null,
        teacher_notes: notes || null,
        is_pending_approval: true,
        submitted_by_student: true,
        is_active: false,
      })
      .select("id")
      .single();

    if (error) return { error: error.message };

    revalidatePath("/teacher", "layout");
    return { wordId: data?.id };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not send suggestion." };
  }
}

function getWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday
  const monday = new Date(now.setDate(diff));
  return monday.toISOString().split("T")[0];
}
