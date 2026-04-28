import BottomNav from "@/components/student/BottomNav";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Main content — pad bottom on mobile/tablet so it clears the fixed bottom nav */}
      <main className="flex-1 pb-24 lg:pb-0 lg:max-w-4xl lg:mx-auto lg:w-full lg:px-8 lg:pt-8">
        {children}
      </main>

      {/* Bottom nav — hidden on lg+ */}
      <BottomNav />

      {/* Desktop side hint — shown on lg only */}
      <aside className="hidden lg:block fixed left-0 top-0 h-full w-16 bg-white border-r border-gray-100">
        <DesktopStudentNav />
      </aside>
    </div>
  );
}

function DesktopStudentNav() {
  return (
    <nav className="flex flex-col items-center pt-6 gap-2">
      <a
        href="/student"
        className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-400 hover:text-sky-600 hover:bg-sky-50 transition-colors"
        title="Home"
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      </a>
    </nav>
  );
}
