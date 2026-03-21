import { createSupabaseServerClient, getAuthedUser } from "@/lib/supabase/server";
import { EnsureProfile } from "@/components/ensure-profile";
import Link from "next/link";
import { StripeConnectButton } from "@/components/stripe-connect-button";
import { syncStripeOnboardingStatus } from "@/lib/stripe-connect";
import { MiniBarChart } from "@/components/mini-bar-chart";

export default async function DashboardPage() {
  const actor = await getAuthedUser();
  if (!actor) return null;
  const userId = actor.id;
  const sellerUnlocked = actor.emailVerified;

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
  const formatMoney = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  let totalRevenueCents = 0;
  const days = 14;
  const start = new Date();
  start.setDate(start.getDate() - (days - 1));
  start.setHours(0, 0, 0, 0);

  const dayKeys: string[] = [];
  const revenueByDay: Record<string, number> = {};
  for (let i = 0; i < days; i++) {
    const d = new Date(start.getTime());
    d.setDate(start.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    dayKeys.push(key);
    revenueByDay[key] = 0;
  }

  let revenueSeries = dayKeys.map((k) => ({ label: k.slice(5), value: 0 }));
  let topPluginsRevenue: { plugin_id: string; amount_cents: number }[] = [];

  try {
    if (pluginIds.length > 0) {
      const { data: purchases } = await supabase
        .from("purchases")
        .select("plugin_id, amount_cents, created_at")
        .in("plugin_id", pluginIds)
        .eq("status", "completed")
        .gte("created_at", start.toISOString());

      const rows = purchases ?? [];
      totalRevenueCents = rows.reduce((s: number, r: any) => s + (r.amount_cents ?? 0), 0);

      for (const r of rows) {
        const key = r.created_at ? new Date(r.created_at).toISOString().slice(0, 10) : null;
        if (key && revenueByDay[key] !== undefined) revenueByDay[key] += r.amount_cents ?? 0;
      }

      revenueSeries = dayKeys.map((k) => ({ label: k.slice(5), value: revenueByDay[k] }));

      // Top plugins by revenue in the same time window (approx).
      const byPlugin = new Map<string, number>();
      for (const r of rows) {
        const pid = r.plugin_id;
        if (!pid) continue;
        byPlugin.set(pid, (byPlugin.get(pid) ?? 0) + (r.amount_cents ?? 0));
      }
      topPluginsRevenue = Array.from(byPlugin.entries())
        .map(([plugin_id, amount_cents]) => ({ plugin_id, amount_cents }))
        .sort((a, b) => b.amount_cents - a.amount_cents)
        .slice(0, 3);
    }
  } catch {
    // If the series query fails (schema differences), keep graphs empty and fall back to totals.
  }

  if (pluginIds.length > 0 && totalRevenueCents === 0) {
    try {
      const { data: purchasesAll } = await supabase
        .from("purchases")
        .select("amount_cents")
        .in("plugin_id", pluginIds)
        .eq("status", "completed");
      totalRevenueCents = (purchasesAll ?? []).reduce((s: number, r: any) => s + (r.amount_cents ?? 0), 0);
    } catch {
      // ignore
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <EnsureProfile />

      <div className="rounded-2xl border border-gray-800 bg-gray-950/30 p-6">
        {!sellerUnlocked ? (
          <div className="mb-6 rounded-xl border border-amber-500/35 bg-amber-500/10 p-4">
            <div className="text-sm font-medium text-amber-200">Verify your email to sell &amp; ship</div>
            <p className="mt-1 text-sm text-amber-100/80">
              Confirm the link we sent you to unlock your storefront, plugin uploads, loader download, and reviews.
            </p>
            <Link
              href={`/check-email?email=${encodeURIComponent(actor.email)}&reason=verify_email`}
              className="mt-3 inline-flex rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-gray-950 hover:brightness-110"
            >
              Resend confirmation email
            </Link>
          </div>
        ) : null}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-100">Developer dashboard</h1>
            <p className="mt-2 text-sm text-gray-400">
              Your brand, storefront, revenue, and plugin releases in one place.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:items-end">
            {sellerUnlocked ? (
              <>
                <Link
                  href="/dashboard/storefront"
                  className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-gray-950 shadow-sm transition hover:brightness-110"
                >
                  Your storefront
                </Link>
                <Link
                  href="/dashboard/plugins/new"
                  className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm font-medium text-gray-200 transition hover:border-gray-600 hover:bg-gray-700"
                >
                  Create new plugin
                </Link>
                <Link
                  href="/dashboard/payouts"
                  className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm font-medium text-gray-200 transition hover:border-gray-600 hover:bg-gray-700"
                >
                  Payouts
                </Link>
              </>
            ) : (
              <p className="max-w-xs text-right text-xs text-gray-500">
                Seller shortcuts appear here after you verify your email.
              </p>
            )}
          </div>
        </div>

        {!sellerUnlocked ? null : !stripeOnboarded ? (
          <div className="mt-5 rounded-xl border border-brand-500/60 bg-brand-500/10 p-4">
            <div className="text-sm font-medium text-brand-300">Connect Stripe</div>
            <div className="mt-1 text-sm text-gray-300">
              Enable Stripe Connect onboarding for payouts.
            </div>
            <div className="mt-3">
              <StripeConnectButton />
            </div>
          </div>
        ) : null}

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-gray-800 bg-gray-900/30 p-4">
            <div className="text-xs text-gray-400">Total revenue</div>
            <div className="mt-2 text-lg font-semibold text-gray-100">{formatMoney(totalRevenueCents)}</div>
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

        <div className="mt-4 grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-xl border border-gray-800 bg-gray-900/30 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xs text-gray-400">Revenue (last {days} days)</div>
                <div className="mt-1 text-sm font-semibold text-gray-100">
                  {formatMoney(
                    revenueSeries.reduce((s: number, d: any) => s + (d.value ?? 0), 0)
                  )}
                </div>
              </div>
              <div className="text-xs text-gray-500">Completed purchases</div>
            </div>

            <div className="mt-4">
              <MiniBarChart
                data={revenueSeries}
                formatValue={(v) => `$${(v / 100).toFixed(0)}`}
              />
            </div>
          </div>

          <div className="rounded-xl border border-gray-800 bg-gray-900/30 p-4">
            <div className="text-xs text-gray-400">Plugin spread</div>
            <div className="mt-2 text-sm text-gray-200">
              <span className="font-medium text-gray-100">{freeCount}</span> free,{" "}
              <span className="font-medium text-gray-100">{paidCount}</span> paid
              {paidCount > 0 ? (
                <>
                  {" "}
                  · avg{" "}
                  <span className="font-medium text-gray-100">${(avgPaidCents / 100).toFixed(2)}</span>
                </>
              ) : null}
            </div>

            <div className="mt-4">
              <div className="text-xs font-medium text-gray-400">Top plugins (14d)</div>
              <div className="mt-2 space-y-2">
                {topPluginsRevenue.length ? (
                  topPluginsRevenue.map((r) => {
                    const p = plugins.find((x: any) => x.id === r.plugin_id);
                    const share = totalRevenueCents > 0 ? (r.amount_cents / totalRevenueCents) * 100 : 0;
                    return (
                      <div key={r.plugin_id} className="rounded-lg border border-gray-800 bg-gray-950/20 p-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="truncate text-sm font-medium text-gray-100">
                              {p?.name ?? "Unknown"}
                            </div>
                            <div className="mt-1 text-xs text-gray-400">{share.toFixed(1)}% of revenue</div>
                          </div>
                          <div className="text-sm font-semibold text-gray-100">
                            {(r.amount_cents / 100).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-xs text-gray-500">No revenue data in the last 14 days.</div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <section>
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-gray-100">Recent plugins</h2>
              <Link href="/dashboard/plugins" className="text-sm text-brand-400 hover:underline">
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
                      <Link
                        href={`/dashboard/plugins/${p.id}/edit`}
                        className="rounded-md border border-gray-800 bg-gray-950 px-3 py-1.5 text-xs text-gray-100 hover:border-gray-700"
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/dashboard/plugins/${p.id}/edit?tab=versions`}
                        className="rounded-md border border-gray-800 bg-gray-950 px-3 py-1.5 text-xs text-gray-100 hover:border-gray-700"
                      >
                        Add version
                      </Link>
                      <Link
                        href={`/plugin/${p.slug}`}
                        className="rounded-md border border-gray-800 bg-gray-950 px-3 py-1.5 text-xs text-gray-100 hover:border-gray-700"
                      >
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

          <aside className="rounded-2xl border border-gray-800 bg-gray-900/30 p-6">
            <h3 className="text-sm font-semibold text-gray-100">Next steps</h3>
            <p className="mt-2 text-sm text-gray-400">A short checklist to stay on track.</p>

            <div className="mt-5 space-y-3">
              <div className="flex items-start gap-3 rounded-xl border border-gray-800 bg-gray-950/20 p-4">
                <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/15 text-sm text-brand-300">
                  1
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-100">Polish your storefront</div>
                  <div className="mt-1 text-xs text-gray-400">
                    Tell buyers who you are—link your storefront from socials and your docs.
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl border border-gray-800 bg-gray-950/20 p-4">
                <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/15 text-sm text-brand-300">
                  2
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-100">Publish plugins + versions</div>
                  <div className="mt-1 text-xs text-gray-400">Ship semver’d jars—licenses and updates flow to buyers.</div>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl border border-gray-800 bg-gray-950/20 p-4">
                <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/15 text-sm text-brand-300">
                  3
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-100">Connect payouts</div>
                  <div className="mt-1 text-xs text-gray-400">
                    {stripeOnboarded ? "Stripe connected—payouts are enabled." : "Connect Stripe to enable payouts."}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3">
              {sellerUnlocked ? (
                <>
                  <Link
                    href="/dashboard/storefront"
                    className="rounded-lg bg-brand-500 px-4 py-2 text-center text-sm font-medium text-gray-950 hover:brightness-110"
                  >
                    Open storefront settings
                  </Link>
                  <Link
                    href="/dashboard/plugins/new"
                    className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-center text-sm font-medium text-gray-200 hover:border-gray-600 hover:bg-gray-700"
                  >
                    Create new plugin
                  </Link>
                  <Link
                    href="/dashboard/plugins"
                    className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-center text-sm font-medium text-gray-200 hover:border-gray-600 hover:bg-gray-700"
                  >
                    Manage plugins
                  </Link>
                </>
              ) : (
                <Link
                  href={`/check-email?email=${encodeURIComponent(actor.email)}&reason=verify_email`}
                  className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-center text-sm font-medium text-amber-100 hover:bg-amber-500/15"
                >
                  Verify email to unlock these steps
                </Link>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

