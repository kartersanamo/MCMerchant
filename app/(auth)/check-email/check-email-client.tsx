"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getEmailAuthCallbackUrl, SUPPORT_DISCORD_URL } from "@/lib/app-url";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function CheckEmailClient() {
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") ?? "";
  const reason = searchParams.get("reason") ?? "";
  const error = searchParams.get("error") ?? "";

  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [emailField, setEmailField] = useState(emailParam);
  useEffect(() => {
    setEmailField(emailParam);
  }, [emailParam]);

  const [resendState, setResendState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  const errorMessage = useMemo(() => {
    switch (error) {
      case "missing_code":
        return "That confirmation link is incomplete. Request a new email below or sign in again.";
      case "callback_failed":
        return "We couldn’t finish signing you in from that link. Try again from a fresh email or resend below.";
      case "config":
        return `Server configuration error. Open a support ticket in our Discord: ${SUPPORT_DISCORD_URL}`;
      default:
        return error ? "Something went wrong. Try resending the email or sign in again." : null;
    }
  }, [error]);

  async function resend() {
    const addr = emailField.trim();
    if (!addr) {
      setResendState("error");
      setResendMessage("Enter the email you used to sign up.");
      return;
    }

    setResendState("sending");
    setResendMessage(null);

    const emailRedirectTo = getEmailAuthCallbackUrl("/email-verified");

    const { error: resendError } = await supabase.auth.resend({
      type: "signup",
      email: addr,
      options: { emailRedirectTo }
    });

    if (resendError) {
      setResendState("error");
      setResendMessage(resendError.message);
      return;
    }

    setResendState("sent");
    setResendMessage("Another message is on its way. Check spam and promotions tabs too.");
  }

  return (
    <div className="mx-auto w-full max-w-lg px-6 py-16">
      <div className="relative overflow-hidden rounded-2xl border border-gray-800 bg-gradient-to-b from-brand-500/10 via-gray-950/40 to-gray-950 p-8 shadow-xl shadow-black/20">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-brand-500/20 blur-3xl"
        />

        <div className="relative text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500/15 ring-1 ring-brand-500/30">
            <svg className="h-8 w-8 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>

          <h1 className="mt-6 text-2xl font-semibold tracking-tight text-gray-50">Check your email</h1>

          {reason === "verify_email" ? (
            <p className="mt-3 rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-100/90">
              Your account is signed in, but your email isn&apos;t verified yet. Confirm your email to open your
              storefront, publish plugins, download the loader, and leave reviews.
            </p>
          ) : (
            <p className="mt-3 text-sm leading-relaxed text-gray-300">
              We sent a confirmation link to{" "}
              <span className="font-medium text-gray-100">{emailField.trim() || "your inbox"}</span>. Click the
              button in that email to verify and unlock the full marketplace.
            </p>
          )}

          {errorMessage ? (
            <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {errorMessage}
            </p>
          ) : null}

          <ul className="mt-8 space-y-3 text-left text-sm text-gray-400">
            <li className="flex gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-800 text-xs font-semibold text-brand-300">
                1
              </span>
              <span>Open the email from MCMerchant (check spam / promotions).</span>
            </li>
            <li className="flex gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-800 text-xs font-semibold text-brand-300">
                2
              </span>
              <span>
                Tap <strong className="text-gray-200">Confirm</strong> — we&apos;ll sign you in and take you to a
                welcome screen.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-800 text-xs font-semibold text-brand-300">
                3
              </span>
              <span>Then you can set up your storefront, upload plugins, and download the loader.</span>
            </li>
          </ul>

          <div className="mt-8 rounded-xl border border-gray-800 bg-gray-950/50 p-4 text-left">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Didn&apos;t get it?</p>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
              <label className="block flex-1 text-left text-xs text-gray-500">
                <span className="text-gray-400">Email</span>
                <input
                  type="email"
                  value={emailField}
                  onChange={(e) => setEmailField(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-sm text-gray-100"
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </label>
              <button
                type="button"
                disabled={resendState === "sending"}
                onClick={() => void resend()}
                className="shrink-0 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-gray-950 transition hover:brightness-110 disabled:opacity-50"
              >
                {resendState === "sending" ? "Sending…" : "Resend email"}
              </button>
            </div>
            {resendMessage ? (
              <p
                className={
                  resendState === "error" ? "mt-3 text-sm text-red-400" : "mt-3 text-sm text-brand-200/90"
                }
              >
                {resendMessage}
              </p>
            ) : null}
          </div>

          <p className="mt-8 text-sm text-gray-500">
            Wrong address?{" "}
            <Link href="/signup" className="font-medium text-brand-400 hover:underline">
              Sign up again
            </Link>{" "}
            ·{" "}
            <Link href="/login" className="font-medium text-brand-400 hover:underline">
              Back to log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
