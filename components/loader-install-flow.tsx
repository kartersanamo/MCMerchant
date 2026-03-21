"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Props = {
  loaderName: string;
  downloadUrl: string;
  backHref: string;
};

type Gate = "checking" | "login" | "verify" | "ready";

export function LoaderInstallFlow({ loaderName, downloadUrl, backHref }: Props) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [gate, setGate] = useState<Gate>("checking");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (cancelled) return;
      const u = data.user;
      if (!u) {
        setGate("login");
        return;
      }
      setUserEmail(u.email ?? "");
      const verified = !!(u.email_confirmed_at ?? u.confirmed_at);
      if (!verified) {
        setGate("verify");
        return;
      }
      setGate("ready");
    })();
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  const [secondsLeft, setSecondsLeft] = useState(3);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (gate !== "ready") return;

    if (secondsLeft <= 0) {
      setDone(true);
      window.open(downloadUrl, "_blank", "noopener,noreferrer");
      window.location.href = backHref;
      return;
    }

    const t = window.setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => window.clearInterval(t);
  }, [secondsLeft, downloadUrl, backHref, gate]);

  if (gate === "checking") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4 py-10">
        <div className="rounded-xl border border-gray-800 bg-gray-900/30 px-10 py-12 text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-gray-700 border-t-brand-500" />
          <p className="mt-4 text-sm text-gray-400">Checking your account…</p>
        </div>
      </div>
    );
  }

  if (gate === "login") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-xl border border-gray-800 bg-gray-900/30 p-8 text-center">
          <h1 className="text-lg font-semibold text-gray-100">Log in to download</h1>
          <p className="mt-2 text-sm text-gray-400">
            The loader is only available to signed-in users with a verified email.
          </p>
          <Link
            href="/login?redirect=/loader/install"
            className="mt-6 inline-flex rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-gray-950 hover:brightness-110"
          >
            Log in
          </Link>
          <div className="mt-4">
            <Link href={backHref} className="text-sm text-brand-400 hover:underline">
              ← Back
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (gate === "verify") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-xl border border-amber-500/30 bg-amber-500/10 p-8 text-center">
          <h1 className="text-lg font-semibold text-amber-100">Verify your email first</h1>
          <p className="mt-2 text-sm text-amber-100/80">
            Once your email is confirmed, you can download {loaderName} and use it on your server.
          </p>
          <Link
            href={`/check-email?email=${encodeURIComponent(userEmail)}&reason=verify_email`}
            className="mt-6 inline-flex rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-medium text-gray-950 hover:brightness-110"
          >
            Resend confirmation email
          </Link>
          <div className="mt-4">
            <Link href={backHref} className="text-sm text-brand-400 hover:underline">
              ← Back
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-10">
      <div className="flex w-full max-w-5xl gap-6">
        <aside className="hidden w-40 shrink-0 lg:block">
          <div className="sticky top-24 rounded-xl border-2 border-dashed border-gray-700 bg-gray-900/50 p-4 text-center text-xs text-gray-500">
            Ad slot (left)
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="rounded-xl border border-gray-800 bg-gray-900/30 p-8 text-center">
            <h1 className="text-xl font-semibold text-gray-100">Installing {loaderName}</h1>

            {!done ? (
              <>
                <div className="mt-6 flex justify-center">
                  <div className="h-12 w-12 animate-spin rounded-full border-2 border-gray-700 border-t-brand-500" />
                </div>
                <p className="mt-4 text-gray-400">
                  Starting download in {secondsLeft} second{secondsLeft !== 1 ? "s" : ""}…
                </p>

                <div className="mt-6 mx-auto h-2 w-full max-w-xs overflow-hidden rounded-full bg-gray-800">
                  <div
                    className="h-full bg-brand-500 transition-all duration-1000"
                    style={{ width: `${((3 - secondsLeft) / 3) * 100}%` }}
                  />
                </div>
              </>
            ) : (
              <p className="mt-4 text-gray-400">Redirecting…</p>
            )}

            <div className="mt-6">
              <Link href={backHref} className="text-sm text-brand-400 hover:underline">
                ← Back
              </Link>
            </div>
          </div>
        </main>

        <aside className="hidden w-40 shrink-0 lg:block">
          <div className="sticky top-24 rounded-xl border-2 border-dashed border-gray-700 bg-gray-900/50 p-4 text-center text-xs text-gray-500">
            Ad slot (right)
          </div>
        </aside>
      </div>
    </div>
  );
}
