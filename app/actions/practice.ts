"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export interface ReviewResult {
  error?: string;
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
    // intervals indexed by new strength (1–5)
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
  d.setHours(9, 0, 0, 0); // schedule for 9 am
  return d;
}

export async function submitReview(
  wordId: string,
  result: "forgot" | "almost" | "knew",
  strengthBefore: number
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

    const { newStrength, nextReviewDays, newStatus } = computeSRS(result, strengthBefore);
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

    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not save review." };
  }
}
