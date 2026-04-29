"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      setError(
        "We couldn't sign you in. Please check the email and password."
      );
      setLoading(false);
      return;
    }

    const role = data.user.user_metadata?.role as string | undefined;
    window.location.href = role === "teacher" ? "/teacher" : "/student";
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div>
        <label
          htmlFor="email"
          className="block text-lg font-medium text-gray-700 mb-2"
        >
          Email address
        </label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-lg font-medium text-gray-700 mb-2"
        >
          Password
        </label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 bg-rose-50 border border-rose-200 rounded-2xl px-4 py-4"
        >
          <span className="text-rose-500 text-xl leading-none mt-0.5" aria-hidden>
            ⚠
          </span>
          <p className="text-base text-rose-700 leading-snug">{error}</p>
        </div>
      )}

      <Button type="submit" loading={loading} size="xl" className="mt-1">
        Sign in
      </Button>
    </form>
  );
}
