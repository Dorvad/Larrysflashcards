import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-cream flex flex-col items-center justify-center px-6 py-12">
      {/* App header */}
      <div className="text-center mb-10">
        <div className="text-5xl mb-4" aria-hidden="true">
          📖
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Larry&rsquo;s Flashcards
        </h1>
        <p className="text-lg text-gray-500">Hebrew vocabulary practice</p>
      </div>

      <div className="w-full max-w-sm">
        <LoginForm />
      </div>

      <p className="mt-10 text-base text-gray-400 text-center">
        Having trouble? Ask Dor for help.
      </p>
    </main>
  );
}
