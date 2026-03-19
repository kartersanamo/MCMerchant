import { createSupabaseServerClient, getAuthedUserId } from "@/lib/supabase/server";
import Link from "next/link";
import { StripeConnectButton } from "@/components/stripe-connect-button";
import { syncStripeOnboardingStatus } from "@/lib/stripe-connect";

export default async function DashboardPage() {
  const userId = await getAuthedUserId();
  if (!userId) return null;

  const supabase = createSupabaseServerClient();
  const { stripeOnboarded } = await syncStripeOnboardingStatus(supabase, userId);

  const { data: allPlugins } = await supabase
    .from("plugins")
    .select("id, slug, name, status, updated_at, price_cents, total_downloads, total_sales")
    .eq("seller_id", userId);

  const plugins = (allPlugins ?? []).sort(
    (a: any, b: any) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );
  const recentPlugins = plugins.slice(0, 5);

  const freeCount = plugins.filter((p: any) => (p.price_cents ?? 0) <= 0).length;
  const paidCount = plugins.filter((p: any) => (p.price_cents ?? 0) > 0).length;
  const paidPlugins = plugins.filter((p: any) => (p.price_cents ?? 0) > 0);
  const avgPaidCents =
    paidCount > 0
      ? paidPlugins.reduce((sum: number, p: any) => sum + (p.price_cents ?? 0), 0) / paidCount
      : 0;
  const totalDownloads = plugins.reduce((sum: number, p: any) => sum + (p.total_downloads ?? 0), 0);
  const totalSales = plugins.reduce((sum: number, p: any) => sum + (p.total_sales ?? 0), 0);
  const publishedCount = plugins.filter((p: any) => p.status === "published").length;

  const pluginIds = plugins.map((p: any) => p.id);
  let totalRevenueCents = 0;
  if (pluginIds.length > 0) {
    const { data: purchases } = await supabase
      .from("purchases")
      .select("amount_cents")
      .in("plugin_id", pluginIds)
      .eq("status", "completed");
    totalRevenueCents = (purchases ?? []).reduce((s: number, r: any) => s + (r.amount_cents ?? 0), 0);
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <h1 className="text-2xl font-semibold text-gray-100">Seller dashboard</h1>
      <p className="mt-2 text-sm text-gray-400">
        Stats and quick actions. Connect Stripe to enable payouts.
      </p>

      {!stripeOnboarded ? (
        <div className="mt-6 rounded-xl border border-brand-500/60 bg-brand-500/10 p-4">
          <div className="text-sm font-medium text-brand-300">Connect Stripe</div>
          <div className="mt-1 text-sm text-gray-300">Enable Stripe Connect onboarding for payouts.</div>
          <div className="mt-3">
            <StripeConnectButton />
          </div>
        </div>
      ) : null}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-800 bg-gray-900/30 p-4">
          <div className="text-xs text-gray-400">Total revenue</div>
          <div className="mt-2 text-lg font-semibold text-gray-100">
            ${(totalRevenueCents / 100).toFixed(2)}
          </div>
        </div>
        <div className="rounded-xl border border-gray-800 bg-gray-900/30 p-4">
          <div className="text-xs text-gray-400">Total sales</div>
          <div className="mt-2 text-lg font-semibold text-gray-100">{totalSales.toLocaleString()}</div>
        </div>
        <div className="rounded-xl border border-gray-800 bg-gray-900/30 p-4">
          <div className="text-xs text-gray-400">Total downloads</div>
          <div className="mt-2 text-lg font-semibold text-gray-100">{totalDownloads.toLocaleString()}</div>
        </div>
        <div className="rounded-xl border border-gray-800 bg-gray-900/30 p-4">
          <div className="text-xs text-gray-400">Published plugins</div>
          <div className="mt-2 text-lg font-semibold text-gray-100">
            {publishedCount} of {plugins.length}
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-800 bg-gray-900/30 p-4">
          <div className="text-xs text-gray-400">Plugin spread</div>
          <div className="mt-2 text-sm text-gray-200">
            <span className="font-medium text-gray-100">{freeCount}</span> free,{" "}
            <span className="font-medium text-gray-100">{paidCount}</span> paid
            {paidCount > 0 ? (
              <>
                {" "}
                · avg <span className="font-medium text-gray-100">${(avgPaidCents / 100).toFixed(2)}</span>
              </>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <Link
          href="/dashboard/plugins/new"
          className="rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-gray-950"
        >
          Create new plugin
        </Link>
        <Link
          href="/dashboard/payouts"
          className="rounded-md border border-gray-700 bg-gray-800 px-4 py-2 text-sm font-medium text-gray-200 hover:border-gray-600 hover:bg-gray-700"
        >
          Payouts
        </Link>
      </div>

      <section className="mt-8">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-gray-100">My plugins</h2>
          <Link
            href="/dashboard/plugins"
            className="rounded-md border border-gray-800 bg-gray-950 px-4 py-2 text-sm text-gray-100 hover:border-gray-700"
          >
            View all
          </Link>
        </div>
        <div className="mt-4 space-y-3">
          {recentPlugins.length ? (
            recentPlugins.map((p: { id: string; slug: string; name: string; status: string }) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-xl border border-gray-800 bg-gray-900/30 p-4"
              >
                <div>
                  <div className="text-sm font-medium text-gray-100">{p.name}</div>
                  <div className="mt-1 text-xs text-gray-400">Status: {p.status}</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href={`/dashboard/plugins/${p.id}/edit`} className="rounded-md border border-gray-800 bg-gray-950 px-3 py-1.5 text-xs text-gray-100">
                    Edit
                  </Link>
                  <Link href={`/dashboard/plugins/${p.id}/versions`} className="rounded-md border border-gray-800 bg-gray-950 px-3 py-1.5 text-xs text-gray-100">
                    Add version
                  </Link>
                  <Link href={`/plugin/${p.slug}`} className="rounded-md border border-gray-800 bg-gray-950 px-3 py-1.5 text-xs text-gray-100">
                    View
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-gray-800 bg-gray-900/30 p-6 text-sm text-gray-300">
              No plugins yet. Create your first plugin.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

