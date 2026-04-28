import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { WordForm } from "@/components/teacher/WordForm";

export default function NewWordPage() {
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

      {/* Heading */}
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Add a word</h1>
      <p className="text-base text-gray-500 mb-8">
        Add a new Hebrew word for Larry to practice.
      </p>

      {/* Form */}
      <WordForm />
    </div>
  );
}
