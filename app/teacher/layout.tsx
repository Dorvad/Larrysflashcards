import { redirect } from "next/navigation";
import TeacherNav from "@/components/teacher/TeacherNav";

export default async function TeacherLayout({
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

    const role = user.user_metadata?.role as string | undefined;
    if (role !== "teacher") redirect("/student");
  }

  return (
    <div className="min-h-screen">
      <TeacherNav />
      <main className="lg:pl-64 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 py-6 lg:py-10">{children}</div>
      </main>
    </div>
  );
}
