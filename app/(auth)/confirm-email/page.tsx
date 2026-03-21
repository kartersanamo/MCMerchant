"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

function ConfirmEmailInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"working" | "error">("working");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get("code");
    const next = searchParams.get("next") ?? "/email-verified";

    if (code) {
      const target = `/auth/callback?code=${encodeURIComponent(code)}&next=${encodeURIComponent(next)}`;
      window.location.replace(target);
      return;
    }

    const hash = typeof window !== "undefined" ? window.location.hash.replace(/^#/, "") : "";
    if (hash) {
      const params = new URLSearchParams(hash);
      const access_token = params.get("access_token");
      const refresh_token = params.get("refresh_token");
      if (access_token && refresh_token) {
        (async () => {
          const supabase = createSupabaseBrowserClient();
          const { error: sessionError } = await supabase.auth.setSession({
            access_token,
            refresh_token
          });
          window.history.replaceState(null, "", window.location.pathname + window.location.search);
          if (sessionError) {
            setStatus("error");
            setMessage(sessionError.message);
            return;
          }
          const { data } = await supabase.auth.getUser();
          const ok = !!(data.user?.email_confirmed_at ?? data.user?.confirmed_at);
          if (!ok) {
            setStatus("error");
            setMessage("Email not confirmed. Open the latest link from your inbox.");
            return;
          }
          router.replace("/email-verified");
        })();
        return;
      }
    }

    setStatus("error");
    setMessage("This page needs a valid link from your confirmation email.");
  }, [router, searchParams]);

  return (
    <div className="mx-auto w-full max-w-md px-6 py-16 text-center">
      {status === "working" ? (
        <>
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-gray-700 border-t-brand-500" />
          <p className="mt-6 text-sm text-gray-300">Finishing sign-in…</p>
        </>
      ) : null}
      {status === "error" ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-left">
          <p className="text-sm font-medium text-red-200">Couldn&apos;t confirm from this page</p>
          <p className="mt-2 text-sm text-red-200/80">{message}</p>
          <div className="mt-4 flex flex-col gap-2 text-sm">
            <Link href="/check-email" className="font-medium text-brand-400 hover:underline">
              Resend confirmation email
            </Link>
            <Link href="/login" className="text-gray-400 hover:text-gray-200">
              Back to log in
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function ConfirmEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-md px-6 py-16 text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-gray-700 border-t-brand-500" />
        </div>
      }
    >
      <ConfirmEmailInner />
    </Suspense>
  );
}
