"use client";

import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getEmailAuthCallbackUrl } from "@/lib/app-url";
import {
  isEmailAlreadyRegisteredSignupError,
  isSignupObfuscatedExistingEmail
} from "@/lib/auth/signup-duplicate";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

function SignupPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/dashboard";

  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** Existing account UX (clear message + CTAs), separate from generic errors. */
  const [existingEmail, setExistingEmail] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setExistingEmail(null);

    const emailRedirectTo = getEmailAuthCallbackUrl("/email-verified");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo
      }
    });

    if (error) {
      if (isEmailAlreadyRegisteredSignupError(error)) {
        setExistingEmail(email.trim());
        setLoading(false);
        return;
      }

      const msg = (error.message ?? "").trim();
      const status = "status" in error ? Number((error as { status?: number }).status) : NaN;
      const lower = msg.toLowerCase();
      const looksLikeEmailOrServer =
        status === 500 ||
        lower.includes("error sending confirmation email") ||
        lower.includes("confirmation email") ||
        lower.includes("smtp") ||
        lower.includes("mail") ||
        lower.includes("internal server error") ||
        (!msg && !Number.isFinite(status));

      setError(
        looksLikeEmailOrServer
          ? `${msg || "Signup failed while sending the confirmation email."}\n\nThis usually means Supabase could not send email (custom SMTP misconfiguration) or a database trigger on signup failed. Check Dashboard → Logs → Auth, then Email/SMTP under Authentication → Providers. See docs/supabase-auth-email-troubleshooting.md.`
          : msg || "Sign up failed. Please try again."
      );
      setLoading(false);
      return;
    }

    if (isSignupObfuscatedExistingEmail(data)) {
      setExistingEmail(email.trim());
      setLoading(false);
      return;
    }

    if (!data.user) {
      setError(
        "We couldn’t complete sign-up. If you already have an account, use Log in below or try forgot password."
      );
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

        <div className="flex items-start gap-3">
          <input
            id="signup-legal-agree"
            type="checkbox"
            required
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-700 bg-gray-950 text-brand-500 focus:ring-2 focus:ring-brand-500 focus:ring-offset-0 focus:ring-offset-gray-950"
          />
          <label htmlFor="signup-legal-agree" className="text-sm text-gray-300">
            I agree to the{" "}
            <Link href="/tos" className="text-brand-400 hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-brand-400 hover:underline">
              Privacy Policy
            </Link>
            .
          </label>
        </div>

        {existingEmail ? (
          <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-4 text-sm text-sky-100/90">
            <p className="font-semibold text-sky-50">An account already exists for this email</p>
            <p className="mt-2 leading-relaxed text-sky-100/85">
              That address is already registered. Log in with your existing password, or reset your password if
              you don&apos;t remember it. If you never finished email confirmation, you can resend the link.
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <Link
                href={`/login?redirect=${encodeURIComponent(redirect)}&email=${encodeURIComponent(existingEmail)}`}
                className="inline-flex justify-center rounded-md bg-brand-500 px-4 py-2 text-center text-sm font-medium text-gray-950"
              >
                Log in
              </Link>
              <Link
                href={`/forgot-password?email=${encodeURIComponent(existingEmail)}`}
                className="inline-flex justify-center rounded-md border border-sky-400/35 bg-sky-500/10 px-4 py-2 text-center text-sm font-medium text-sky-100 hover:bg-sky-500/15"
              >
                Forgot password
              </Link>
              <Link
                href={`/check-email?email=${encodeURIComponent(existingEmail)}`}
                className="inline-flex justify-center rounded-md border border-gray-700 px-4 py-2 text-center text-sm font-medium text-gray-200 hover:bg-gray-800/80"
              >
                Resend confirmation email
              </Link>
            </div>
          </div>
        ) : null}

        {error ? (
          <div className="whitespace-pre-wrap text-sm text-red-400">{error}</div>
        ) : null}

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

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-md px-6 py-14 text-center text-sm text-gray-400">Loading…</div>
      }
    >
      <SignupPageInner />
    </Suspense>
  );
}

