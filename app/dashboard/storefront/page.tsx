import Link from "next/link";
import { createSupabaseServerClient, getAuthedUserId } from "@/lib/supabase/server";
import { getPublicStorefrontPath, getStorefrontProfileForUser } from "@/lib/storefront-profile";
import { StorefrontSettingsForm } from "@/components/storefront-settings-form";

export default async function StorefrontDashboardPage() {
  const userId = await getAuthedUserId();
  if (!userId) return null;

  const supabase = createSupabaseServerClient();
  const { profile, hasStorefrontColumns } = await getStorefrontProfileForUser(supabase, userId);

  if (!profile) {
    return (
      <div className="mx-auto w-full max-w-4xl px-6 py-10 text-gray-300">
        Could not load your profile.
      </div>
    );
  }

  const storefrontPath = getPublicStorefrontPath(profile);

  return (
    <div className="relative mx-auto w-full max-w-4xl px-6 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-brand-500/10 via-transparent to-transparent"
      />
      <div className="relative rounded-2xl border border-gray-800 bg-gray-950/30 p-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-400">Your flagship page</p>
        <h1 className="mt-2 text-2xl font-semibold text-gray-100">Storefront studio</h1>
        <p className="mt-2 text-sm text-gray-400">
          This is the main surface buyers see: your brand, socials, featured work, and a filterable catalog. Everything ties
          into MCMerchant licenses and MCMerchantLoader updates.
        </p>

        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          <Link
            href={storefrontPath}
            className="rounded-lg bg-brand-500 px-4 py-2 font-medium text-gray-950 shadow-sm transition hover:brightness-110"
          >
            View my storefront
          </Link>
          <Link
            href="/dashboard/plugins"
            className="rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 font-medium text-gray-200 hover:border-gray-600"
          >
            Manage plugins
          </Link>
          <Link
            href="/dashboard"
            className="rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 font-medium text-gray-200 hover:border-gray-600"
          >
            Dashboard
          </Link>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-gray-800 bg-gray-900/20 p-6">
        <h2 className="text-lg font-semibold text-gray-100">Branding & discovery</h2>
        <p className="mt-1 text-sm text-gray-400">
          These fields power your public page and future custom-domain routing. Licensing, downloads, and MCMerchantLoader
          behavior are unchanged.
        </p>
        <div className="mt-6">
          <StorefrontSettingsForm profile={profile} hasStorefrontColumns={hasStorefrontColumns} />
        </div>
      </div>
    </div>
  );
}
