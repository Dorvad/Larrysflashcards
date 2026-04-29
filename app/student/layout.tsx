import BottomNav from "@/components/student/BottomNav";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {/*
        Bottom nav is visible up to xl (1280px).
        pb-24 reserves space below content so nothing hides behind the fixed nav.
        xl: no nav, reduce bottom padding and widen the content column.
      */}
      <main className="flex-1 pb-24 xl:pb-12 md:max-w-xl md:mx-auto md:w-full lg:max-w-2xl xl:max-w-3xl">
        {children}
      </main>

      <BottomNav />
    </div>
  );
}
