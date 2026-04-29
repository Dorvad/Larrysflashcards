import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getWordById } from "@/lib/mock-data";
import { dbWordToWord } from "@/lib/supabase/mappers";
import { WordForm } from "@/components/teacher/WordForm";
import StatusBadge from "@/components/shared/StatusBadge";
import HebrewText from "@/components/shared/HebrewText";
import type { Word } from "@/types";

async function loadWord(id: string): Promise<Word | null> {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return getWordById(id) ?? null;
  }
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { data } = await supabase
      .from("words")
      .select("*")
      .eq("id", id)
      .single();
    return data ? dbWordToWord(data) : (getWordById(id) ?? null);
  } catch {
    return getWordById(id) ?? null;
  }
}

export default async function EditWordPage({
  params,
}: {
  params: { id: string };
}) {
  const word = await loadWord(params.id);
  if (!word) notFound();

  return (
    <div>
      <Link
        href="/teacher/words"
        className="inline-flex items-center gap-2 text-base text-gray-500 min-h-[48px] mb-6 -ml-1 px-1"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to words
      </Link>

      <div className="flex items-start gap-4 mb-2">
        {word.imageUrl && (
          <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-gray-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={word.imageUrl} alt="" className="w-full h-full object-cover" />
          </div>
        )}
        <div>
          <HebrewText size="lg" className="block font-bold leading-tight">
            {word.hebrewNiqqud}
          </HebrewText>
          <p className="text-lg text-gray-500 mt-1">{word.english}</p>
        </div>
      </div>
      <div className="mb-8">
        <StatusBadge status={word.status} />
      </div>

      <WordForm word={word} />
    </div>
  );
}
