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

  let pendingCount = 0;

  if (configured) {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "teacher") redirect("/student");

    const { count } = await supabase
      .from("words")
      .select("*", { count: "exact", head: true })
      .eq("is_pending_approval", true);

    pendingCount = count ?? 0;
  }

  return (
    <div className="min-h-screen">
      <TeacherNav pendingCount={pendingCount} />
      <main className="lg:pl-64 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 py-6 lg:py-10">{children}</div>
      </main>
    </div>
  );
}
