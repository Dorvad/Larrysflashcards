import TeacherNav from "@/components/teacher/TeacherNav";

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      {/* Teacher nav handles mobile (top bar) and desktop (sidebar) */}
      <TeacherNav />

      {/* Content: full width on mobile, offset by sidebar on desktop */}
      <main className="lg:pl-64 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 py-6 lg:py-10">{children}</div>
      </main>
    </div>
  );
}
