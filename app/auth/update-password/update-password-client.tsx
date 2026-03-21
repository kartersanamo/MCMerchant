"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const MIN_LEN = 8;
const MAX_LEN = 72;
const PW_RESET_FLOW_KEY = "mcmerchant_password_reset_flow";

function UpdatePasswordInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [phase, setPhase] = useState<"working" | "ready" | "error">("working");
  const [sessionMessage, setSessionMessage] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formNotice, setFormNotice] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const code = searchParams.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (cancelled) return;
        if (error) {
          setSessionMessage(error.message ?? "This reset link is invalid or expired.");
          setPhase("error");
          return;
        }
        try {
          sessionStorage.setItem(PW_RESET_FLOW_KEY, "1");
        } catch {
          /* ignore */
        }
        setPhase("ready");
        if (typeof window !== "undefined") {
          window.history.replaceState(null, "", "/auth/update-password");
        }
        return;
      }

      const hash = typeof window !== "undefined" ? window.location.hash.replace(/^#/, "") : "";
      if (hash) {
        const params = new URLSearchParams(hash);
        const access_token = params.get("access_token");
        const refresh_token = params.get("refresh_token");
        const type = params.get("type");
        if (access_token && refresh_token && type === "recovery") {
          const { error } = await supabase.auth.setSession({ access_token, refresh_token });
          if (cancelled) return;
          if (error) {
            setSessionMessage(error.message ?? "Could not verify this link.");
            setPhase("error");
            return;
          }
          try {
            sessionStorage.setItem(PW_RESET_FLOW_KEY, "1");
          } catch {
            /* ignore */
          }
          window.history.replaceState(null, "", window.location.pathname + window.location.search);
          setPhase("ready");
          return;
        }
      }

      const {
        data: { session }
      } = await supabase.auth.getSession();
      if (cancelled) return;

      let inFlow = false;
      try {
        inFlow = sessionStorage.getItem(PW_RESET_FLOW_KEY) === "1";
      } catch {
        inFlow = false;
      }

      if (session?.user && inFlow) {
        setPhase("ready");
        return;
      }

      setSessionMessage("Open the password link from your email to continue.");
      setPhase("error");
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [searchParams, supabase]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormNotice(null);

    if (password.length < MIN_LEN) {
      setFormNotice({
        type: "err",
        text: `Password must be at least ${MIN_LEN} characters.`
      });
      return;
    }
    if (password.length > MAX_LEN) {
      setFormNotice({
        type: "err",
        text: `Password must be at most ${MAX_LEN} characters.`
      });
      return;
    }
    if (password !== confirmPassword) {
      setFormNotice({ type: "err", text: "Passwords do not match." });
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSubmitting(false);

    if (error) {
      setFormNotice({ type: "err", text: error.message || "Could not update password." });
      return;
    }

    try {
      sessionStorage.removeItem(PW_RESET_FLOW_KEY);
    } catch {
      /* ignore */
    }
    setFormNotice({ type: "ok", text: "Password updated. Redirecting…" });
    router.replace("/account?notice=password_updated");
  }

  if (phase === "working") {
    return (
      <div className="mx-auto w-full max-w-md px-6 py-16 text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-gray-700 border-t-brand-500" />
        <p className="mt-6 text-sm text-gray-300">Verifying your link…</p>
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div className="mx-auto w-full max-w-md px-6 py-16">
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-left">
          <p className="text-sm font-medium text-red-200">Can&apos;t reset password here</p>
          <p className="mt-2 text-sm text-red-200/80">{sessionMessage}</p>
          <div className="mt-4 flex flex-col gap-2 text-sm">
            <Link href="/account" className="font-medium text-brand-400 hover:underline">
              Back to account
            </Link>
            <Link href="/login" className="text-gray-400 hover:text-gray-200">
              Log in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md px-6 py-14">
      <h1 className="text-2xl font-semibold text-gray-100">Set a new password</h1>
      <p className="mt-2 text-sm text-gray-400">
        Choose a strong password. It must be at least {MIN_LEN} characters and match in both fields.
      </p>

      <form onSubmit={(e) => void onSubmit(e)} className="mt-8 space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500">New password</label>
          <input
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-sm text-gray-100"
            placeholder={`At least ${MIN_LEN} characters`}
            minLength={MIN_LEN}
            maxLength={MAX_LEN}
            required
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500">
            Confirm password
          </label>
          <input
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="mt-2 w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-sm text-gray-100"
            placeholder="Re-enter password"
            minLength={MIN_LEN}
            maxLength={MAX_LEN}
            required
          />
        </div>
        {formNotice ? (
          <p className={formNotice.type === "ok" ? "text-sm text-emerald-300" : "text-sm text-red-300"}>
            {formNotice.text}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-gray-950 disabled:opacity-60"
        >
          {submitting ? "Saving…" : "Update password"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-gray-500">
        <Link href="/account" className="text-brand-400 hover:underline">
          Cancel and return to account
        </Link>
      </p>
    </div>
  );
}

export function UpdatePasswordClient() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-md px-6 py-16 text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-gray-700 border-t-brand-500" />
        </div>
      }
    >
      <UpdatePasswordInner />
    </Suspense>
  );
}
