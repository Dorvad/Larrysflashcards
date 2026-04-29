import { redirect } from "next/navigation";
import BottomNav from "@/components/student/BottomNav";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const configured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  if (configured) {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/login");
    // Teachers can visit /student/* to preview Larry's view — no role block here
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 pb-24 xl:pb-10 md:max-w-xl md:mx-auto md:w-full lg:max-w-2xl xl:max-w-3xl">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
