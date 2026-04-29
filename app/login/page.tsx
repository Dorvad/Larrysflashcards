import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#F7F5F0] flex flex-col items-center justify-center px-6 py-12">
      {/* Card wrapper */}
      <div className="w-full max-w-sm animate-fade-slide-up">
        {/* App header */}
        <div className="text-center mb-10">
          <div
            className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-sky-500 shadow-lg shadow-sky-200/60 mb-5 text-4xl"
            aria-hidden="true"
          >
            📖
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            Larry&rsquo;s Flashcards
          </h1>
          <p className="text-lg text-gray-500">Hebrew vocabulary practice</p>
        </div>

        {/* Login form card */}
        <div className="bg-white rounded-3xl shadow-md border border-gray-100/80 p-7">
          <LoginForm />
        </div>

        <p className="mt-8 text-base text-gray-400 text-center">
          Having trouble? Ask Dor for help.
        </p>
      </div>
    </main>
  );
}
