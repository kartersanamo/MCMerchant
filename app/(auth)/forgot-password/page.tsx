"use client";

import Link from "next/link";
import { useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getPublicAppOrigin } from "@/lib/app-url";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

function ForgotPasswordForm() {
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get("email") ?? "";

  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [email, setEmail] = useState(initialEmail);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const origin = getPublicAppOrigin();
    if (!origin) {
      setError("This site is missing NEXT_PUBLIC_APP_URL. Password reset links cannot be sent.");
      setLoading(false);
      return;
    }

    const redirectTo = `${origin}/auth/update-password`;

    const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo
    });

    setLoading(false);
    if (resetErr) {
      setError(resetErr.message ?? "Could not send reset email.");
      return;
    }
    setDone(true);
  }

  return (
    <div className="mx-auto w-full max-w-md px-6 py-14">
      <h1 className="text-2xl font-semibold text-gray-100">Reset your password</h1>
      <p className="mt-2 text-sm text-gray-400">
        Enter the email for your account. If it exists, we&apos;ll send a link to choose a new password.
      </p>

      {done ? (
        <div className="mt-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-100/90">
          <p className="font-medium text-emerald-100">Check your inbox</p>
          <p className="mt-2 text-emerald-100/85">
            If an account exists for <span className="font-mono text-emerald-50">{email.trim()}</span>, you&apos;ll
            receive an email with a reset link shortly. The link expires after a short time.
          </p>
          <p className="mt-3 text-emerald-100/70">
            Didn&apos;t see it? Check spam, or try again in a few minutes.
          </p>
          <Link href="/login" className="mt-4 inline-block text-sm font-medium text-brand-400 hover:underline">
            Back to log in
          </Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm text-gray-300">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              autoComplete="email"
              className="mt-1 w-full rounded-md border border-gray-800 bg-gray-950 px-3 py-2 text-gray-100"
            />
          </div>
          {error ? <div className="text-sm text-red-400">{error}</div> : null}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-brand-500 px-4 py-2 font-medium text-gray-950 disabled:opacity-50"
          >
            {loading ? "Sending…" : "Send reset link"}
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-gray-400">
        <Link href="/login" className="text-brand-400 hover:underline">
          Back to log in
        </Link>
      </p>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-md px-6 py-14 text-sm text-gray-400">Loading…</div>
      }
    >
      <ForgotPasswordForm />
    </Suspense>
  );
}
