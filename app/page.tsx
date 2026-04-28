import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-16 gap-10">
      <div className="text-center">
        <p className="text-5xl mb-4" aria-hidden>
          📖
        </p>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Larry&rsquo;s Flashcards
        </h1>
        <p className="text-lg text-gray-500">
          Hebrew vocabulary practice — prototype demo
        </p>
      </div>

      <div className="w-full max-w-sm flex flex-col gap-4">
        <Link
          href="/student"
          className="flex flex-col items-center gap-2 bg-white rounded-3xl p-8 shadow-md border border-gray-100 hover:shadow-lg transition-shadow active:scale-[0.98]"
        >
          <span className="text-4xl" aria-hidden>
            👴
          </span>
          <span className="text-xl font-bold text-gray-900">
            Larry&rsquo;s View
          </span>
          <span className="text-sm text-gray-500 text-center">
            Student — practice Hebrew words
          </span>
        </Link>

        <Link
          href="/teacher"
          className="flex flex-col items-center gap-2 bg-white rounded-3xl p-8 shadow-md border border-gray-100 hover:shadow-lg transition-shadow active:scale-[0.98]"
        >
          <span className="text-4xl" aria-hidden>
            👩‍🏫
          </span>
          <span className="text-xl font-bold text-gray-900">
            Dor&rsquo;s View
          </span>
          <span className="text-sm text-gray-500 text-center">
            Teacher — manage words and track progress
          </span>
        </Link>
      </div>

      <p className="text-sm text-gray-400">
        Static prototype — no login required
      </p>
    </main>
  );
}
