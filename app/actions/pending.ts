"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export interface PendingActionResult {
  error?: string;
  wordId?: string;
}

async function ensureTeacher() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated.");
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "teacher") throw new Error("Only teachers can manage pending words.");
  return user;
}

export async function approveWord(wordId: string): Promise<PendingActionResult> {
  try {
    await ensureTeacher();
    const admin = createAdminClient();
    const { error } = await admin
      .from("words")
      .update({ is_pending_approval: false, is_active: true })
      .eq("id", wordId);
    if (error) return { error: error.message };
    revalidatePath("/teacher/pending");
    revalidatePath("/teacher");
    revalidatePath("/student/words");
    return { wordId };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not approve word." };
  }
}

export async function rejectWord(wordId: string): Promise<PendingActionResult> {
  try {
    await ensureTeacher();
    const admin = createAdminClient();
    const { error } = await admin
      .from("words")
      .update({ is_pending_approval: false, is_active: false })
      .eq("id", wordId);
    if (error) return { error: error.message };
    revalidatePath("/teacher/pending");
    revalidatePath("/teacher");
    return { wordId };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not decline word." };
  }
}
