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

    revalidatePath("/teacher/words");
    revalidatePath(`/teacher/words/${id}/edit`);
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

function getWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday
  const monday = new Date(now.setDate(diff));
  return monday.toISOString().split("T")[0];
}
