"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getEmailAuthCallbackUrl } from "@/lib/app-url";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/browse";
  const emailFromQuery = searchParams.get("email") ?? "";

  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [email, setEmail] = useState(emailFromQuery);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsEmailConfirmation, setNeedsEmailConfirmation] = useState(false);
  const [magicState, setMagicState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [magicMessage, setMagicMessage] = useState<string | null>(null);

  useEffect(() => {
    if (emailFromQuery) setEmail(emailFromQuery);
  }, [emailFromQuery]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setNeedsEmailConfirmation(false);

    const timeoutId = setTimeout(() => {
      setError("Request timed out. Check your connection and try again.");
      setLoading(false);
    }, 15000);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        const msg = (error.message ?? "").toLowerCase();
        const code = (error as { code?: string }).code ?? "";
        if (
          code === "email_not_confirmed" ||
          msg.includes("email not confirmed") ||
          msg.includes("not confirmed")
        ) {
          setNeedsEmailConfirmation(true);
          setError(
            "Confirm your email before signing in. Check your inbox or resend the confirmation link."
          );
          setLoading(false);
          clearTimeout(timeoutId);
          return;
        }
        setError(error.message);
        setLoading(false);
        clearTimeout(timeoutId);
        return;
      }

      clearTimeout(timeoutId);
      // Full page navigation so the next request reliably sends session cookies (avoids Supabase SSR cookie timing issues).
      window.location.href = redirect;
      return;
    } catch (err) {
      clearTimeout(timeoutId);
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function sendMagicLink() {
    const addr = email.trim();
    if (!addr) {
      setMagicState("error");
      setMagicMessage("Enter your email first.");
      return;
    }
    setMagicState("sending");
    setMagicMessage(null);
    const emailRedirectTo = getEmailAuthCallbackUrl(redirect);
    const { error } = await supabase.auth.signInWithOtp({
      email: addr,
      options: {
        emailRedirectTo
      }
    });
    if (error) {
      setMagicState("error");
      setMagicMessage(error.message || "Could not send magic link.");
      return;
    }
    setMagicState("sent");
    setMagicMessage("Magic link sent. Check your inbox and spam/promotions tabs.");
  }

  return (
    <div className="mx-auto w-full max-w-md px-6 py-14">
      <h1 className="text-2xl font-semibold text-gray-100">Log in</h1>
      <p className="mt-2 text-sm text-gray-400">
        Use your email and password to continue.
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
          <div className="flex items-center justify-between gap-2">
            <label className="block text-sm text-gray-300">Password</label>
            <Link
              href={
                email.trim()
                  ? `/forgot-password?email=${encodeURIComponent(email.trim())}`
                  : "/forgot-password"
              }
              className="text-xs font-medium text-brand-400 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
            className="mt-1 w-full rounded-md border border-gray-800 bg-gray-950 px-3 py-2 text-gray-100"
          />
        </div>

        {error ? <div className="text-sm text-red-400">{error}</div> : null}

        {needsEmailConfirmation ? (
          <div className="rounded-lg border border-brand-500/25 bg-brand-500/5 px-3 py-2 text-center text-sm">
            <Link
              href={`/check-email?email=${encodeURIComponent(email)}`}
              className="font-medium text-brand-400 hover:underline"
            >
              Resend confirmation email
            </Link>
          </div>
        ) : null}

        <button
          disabled={loading}
          className="w-full rounded-md bg-brand-500 px-4 py-2 font-medium text-gray-950 disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Log in"}
        </button>

        <div className="rounded-lg border border-gray-800 bg-gray-900/40 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Passwordless</p>
          <button
            type="button"
            onClick={() => void sendMagicLink()}
            disabled={magicState === "sending"}
            className="mt-2 w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm font-medium text-gray-200 hover:border-gray-600 disabled:opacity-50"
          >
            {magicState === "sending" ? "Sending magic link…" : "Email me a magic link"}
          </button>
          {magicMessage ? (
            <p className={magicState === "error" ? "mt-2 text-sm text-red-400" : "mt-2 text-sm text-emerald-300"}>
              {magicMessage}
            </p>
          ) : null}
        </div>

        <p className="text-center text-sm text-gray-400">
          Don&apos;t have an account?{" "}
          <Link
            href={redirect ? `/signup?redirect=${encodeURIComponent(redirect)}` : "/signup"}
            className="text-brand-400 hover:underline"
          >
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}

