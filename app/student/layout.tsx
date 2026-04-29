import BottomNav from "@/components/student/BottomNav";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Content: centred on tablet/desktop, full-width on phone */}
      <main className="flex-1 pb-28 md:pb-10 md:max-w-xl md:mx-auto md:w-full lg:max-w-2xl">
        {children}
      </main>

      {/* Bottom nav — visible on all sizes up to lg */}
      <BottomNav />
    </div>
  );
}
