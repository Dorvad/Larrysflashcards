import BottomNav from "@/components/student/BottomNav";
import { StudentTopBar } from "@/components/student/StudentTopBar";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <StudentTopBar />

      {/*
        pt-14  = space for fixed top bar (56px)
        pb-24  = space for fixed bottom nav
        xl:pb-12 = desktop: no bottom nav
        Content column is capped and centred on wider screens.
      */}
      <main className="flex-1 pt-14 pb-24 xl:pb-12 md:max-w-xl md:mx-auto md:w-full lg:max-w-2xl xl:max-w-3xl">
        {children}
      </main>

      <BottomNav />
    </div>
  );
}
