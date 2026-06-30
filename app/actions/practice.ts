"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { BuiltSession } from "@/lib/practice-session";

export interface ReviewResult {
  error?: string;
}

export interface StartSessionResult {
  error?: string;
  sessionId?: string;
}

function computeSRS(
  result: "forgot" | "almost" | "knew",
  strengthBefore: number
): { newStrength: number; nextReviewDays: number; newStatus: string } {
  let newStrength: number;
  let nextReviewDays: number;

  if (result === "forgot") {
    newStrength = Math.max(0, strengthBefore - 1);
    nextReviewDays = 1;
  } else if (result === "almost") {
    newStrength = Math.min(5, strengthBefore + 1);
    nextReviewDays = 2;
  } else {
    newStrength = Math.min(5, strengthBefore + 1);
    const intervals = [1, 1, 3, 7, 14, 30];
    nextReviewDays = intervals[newStrength] ?? 30;
  }

  const newStatus =
    newStrength <= 1 ? "new"
    : newStrength <= 3 ? "practicing"
    : newStrength === 4 ? "strong"
    : "mastered";

  return { newStrength, nextReviewDays, newStatus };
}

function addDays(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(9, 0, 0, 0);
  return d;
}

export async function startPracticeSession(
  built: BuiltSession
): Promise<StartSessionResult> {
  try {
    if (built.cards.length === 0) {
      return { error: "No cards in this session." };
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "Not signed in." };

    const { data: student } = await supabase
      .from("students")
      .select("id")
      .eq("profile_id", user.id)
      .single();

    if (!student) return { error: "Student record not found." };

    const admin = createAdminClient();
    const { data, error } = await admin
      .from("practice_sessions")
      .insert({
        student_id: student.id,
        card_count: built.cards.length,
        encouragement_count: built.encouragementCount,
      })
      .select("id")
      .single();

    if (error) return { error: error.message };
    return { sessionId: data.id };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not start session." };
  }
}

export async function submitReview(
  wordId: string,
  result: "forgot" | "almost" | "knew",
  strengthBefore: number,
  sessionId?: string
): Promise<ReviewResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "Not signed in." };

    const { data: student } = await supabase
      .from("students")
      .select("id")
      .eq("profile_id", user.id)
      .single();

    if (!student) return { error: "Student record not found." };

    const { newStrength, nextReviewDays, newStatus } = computeSRS(
      result,
      strengthBefore
    );
    const nextReviewAt = addDays(nextReviewDays);
    const now = new Date().toISOString();
    const admin = createAdminClient();

    const [reviewRes, wordRes] = await Promise.all([
      admin.from("reviews").insert({
        word_id: wordId,
        student_id: student.id,
        result,
        strength_before: strengthBefore,
        strength_after: newStrength,
        reviewed_at: now,
        next_review_at: nextReviewAt.toISOString(),
        session_id: sessionId ?? null,
      }),
      admin
        .from("words")
        .update({
          current_strength: newStrength,
          status: newStatus,
          last_reviewed: now,
          next_review_at: nextReviewAt.toISOString(),
        })
        .eq("id", wordId),
    ]);

    if (reviewRes.error) return { error: reviewRes.error.message };
    if (wordRes.error) return { error: wordRes.error.message };

    if (sessionId) {
      const countField =
        result === "knew"
          ? "knew_count"
          : result === "almost"
            ? "almost_count"
            : "forgot_count";

      const { data: session } = await admin
        .from("practice_sessions")
        .select("card_count, knew_count, almost_count, forgot_count")
        .eq("id", sessionId)
        .single();

      if (session) {
        const updates: Record<string, unknown> = {
          [countField]: (session[countField as keyof typeof session] as number) + 1,
        };
        const answered =
          session.knew_count +
          session.almost_count +
          session.forgot_count +
          1;
        if (answered >= session.card_count) {
          updates.completed_at = now;
        }
        await admin.from("practice_sessions").update(updates).eq("id", sessionId);
      }
    }

    revalidatePath("/teacher/progress");
    revalidatePath("/teacher");
    revalidatePath("/student");
    revalidatePath("/student/progress");
    revalidatePath("/student/practice");

    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not save review." };
  }
}
