import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getWordById } from "@/lib/mock-data";
import { WordForm } from "@/components/teacher/WordForm";
import StatusBadge from "@/components/shared/StatusBadge";
import HebrewText from "@/components/shared/HebrewText";

async function Page({ params }: { params: { id: string } }) {
  const maybeWord = getWordById(params.id);
  if (!maybeWord) notFound();
  const word = maybeWord;

  return (
    <div>
      {/* Back link */}
      <Link
        href="/teacher/words"
        className="inline-flex items-center gap-2 text-base text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to words
      </Link>

      {/* Word display */}
      <HebrewText size="lg" className="block font-bold leading-tight">
        {word.hebrewNiqqud}
      </HebrewText>
      <p className="text-lg text-gray-500 mt-1">{word.english}</p>
      <div className="mt-2">
        <StatusBadge status={word.status} />
      </div>

      <hr className="mt-6 mb-8 border-gray-200" />

      {/* Form */}
      <WordForm word={word} />
    </div>
  );
}

export default Page;
