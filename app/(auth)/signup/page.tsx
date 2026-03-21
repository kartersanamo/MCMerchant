"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getEmailAuthCallbackUrl } from "@/lib/app-url";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/dashboard";

  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const emailRedirectTo = getEmailAuthCallbackUrl("/email-verified");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo
      }
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // With "Confirm email" on, Supabase usually returns user + session=null.
    // If the project has auto-confirm enabled, we may get a session immediately.
    if (data.session?.user) {
      const verified = !!(data.session.user.email_confirmed_at ?? data.session.user.confirmed_at);
      setLoading(false);
      if (verified) {
        window.location.href = redirect;
      } else {
        router.push(`/check-email?email=${encodeURIComponent(email)}`);
      }
      return;
    }

    router.push(`/check-email?email=${encodeURIComponent(email)}`);
    setLoading(false);
  }

  return (
    <div className="mx-auto w-full max-w-md px-6 py-14">
      <h1 className="text-2xl font-semibold text-gray-100">Sign up</h1>
      <p className="mt-2 text-sm text-gray-400">
        Create your account to buy plugins and sell your work.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm text-gray-300">Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
            className="mt-1 w-full rounded-md border border-gray-800 bg-gray-950 px-3 py-2 text-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-300">Password</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
            className="mt-1 w-full rounded-md border border-gray-800 bg-gray-950 px-3 py-2 text-gray-100"
          />
        </div>

        {error ? <div className="text-sm text-red-400">{error}</div> : null}

        <button
          disabled={loading}
          className="w-full rounded-md bg-brand-500 px-4 py-2 font-medium text-gray-950 disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create account"}
        </button>

        <p className="text-center text-sm text-gray-400">
          Already have an account?{" "}
          <Link
            href={redirect ? `/login?redirect=${encodeURIComponent(redirect)}` : "/login"}
            className="text-brand-400 hover:underline"
          >
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}

