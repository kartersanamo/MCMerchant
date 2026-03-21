import Link from "next/link";
import { EnsureProfile } from "@/components/ensure-profile";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { userEmailIsVerified } from "@/lib/auth/email-verification";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Email verified"
};

export default async function EmailVerifiedPage() {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    redirect("/login?redirect=/email-verified");
  }
  if (!userEmailIsVerified(data.user)) {
    redirect(`/check-email?email=${encodeURIComponent(data.user.email ?? "")}`);
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-16">
      <EnsureProfile />

      <div className="relative overflow-hidden rounded-2xl border border-gray-800 bg-gradient-to-b from-emerald-500/15 via-gray-950/50 to-gray-950 p-10 shadow-xl shadow-black/25">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-20 top-0 h-48 w-48 rounded-full bg-emerald-500/20 blur-3xl"
        />

        <div className="relative text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20 ring-1 ring-emerald-400/40">
            <svg className="h-9 w-9 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h1 className="mt-6 text-3xl font-semibold tracking-tight text-gray-50">You&apos;re verified</h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-gray-300">
            Your email is confirmed and your account is fully unlocked. You can open a storefront, publish plugins,
            download MCMerchantLoader, and join the conversation with reviews.
          </p>

          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            <Link
              href="/dashboard/storefront"
              className="rounded-xl border border-gray-800 bg-gray-950/60 px-4 py-4 text-left transition hover:border-brand-500/40 hover:bg-gray-900/80"
            >
              <div className="text-xs font-semibold uppercase tracking-wider text-brand-400">Storefront</div>
              <div className="mt-1 text-sm text-gray-200">Brand your public page and featured plugins</div>
            </Link>
            <Link
              href="/dashboard/plugins/new"
              className="rounded-xl border border-gray-800 bg-gray-950/60 px-4 py-4 text-left transition hover:border-brand-500/40 hover:bg-gray-900/80"
            >
              <div className="text-xs font-semibold uppercase tracking-wider text-brand-400">Plugins</div>
              <div className="mt-1 text-sm text-gray-200">Create a listing and upload jars</div>
            </Link>
            <Link
              href="/loader/install"
              className="rounded-xl border border-gray-800 bg-gray-950/60 px-4 py-4 text-left transition hover:border-brand-500/40 hover:bg-gray-900/80"
            >
              <div className="text-xs font-semibold uppercase tracking-wider text-brand-400">Loader</div>
              <div className="mt-1 text-sm text-gray-200">Download MCMerchantLoader for your server</div>
            </Link>
            <Link
              href="/browse"
              className="rounded-xl border border-gray-800 bg-gray-950/60 px-4 py-4 text-left transition hover:border-brand-500/40 hover:bg-gray-900/80"
            >
              <div className="text-xs font-semibold uppercase tracking-wider text-brand-400">Marketplace</div>
              <div className="mt-1 text-sm text-gray-200">Browse plugins and read reviews</div>
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3 text-sm">
            <Link
              href="/dashboard"
              className="rounded-lg bg-brand-500 px-5 py-2.5 font-medium text-gray-950 transition hover:brightness-110"
            >
              Go to dashboard
            </Link>
            <Link href="/docs/loader" className="rounded-lg border border-gray-700 px-5 py-2.5 text-gray-200 hover:border-gray-600">
              Loader docs
            </Link>
          </div>

          <p className="mt-8 text-xs text-gray-500">
            Tip: bookmark your dashboard — it&apos;s home for sales, versions, and payouts.
          </p>
        </div>
      </div>
    </div>
  );
}
