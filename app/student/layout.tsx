import BottomNav from "@/components/student/BottomNav";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 pb-24 xl:pb-10 md:max-w-xl md:mx-auto md:w-full lg:max-w-2xl xl:max-w-3xl">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
