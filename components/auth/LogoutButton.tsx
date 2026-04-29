"use client";

import { createClient } from "@/lib/supabase/client";

interface LogoutButtonProps {
  className?: string;
  children: React.ReactNode;
}

export function LogoutButton({ className, children }: LogoutButtonProps) {
  async function handleLogout() {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // Supabase not configured or error — still redirect
    }
    window.location.href = "/login";
  }

  return (
    <button type="button" onClick={handleLogout} className={className}>
      {children}
    </button>
  );
}
