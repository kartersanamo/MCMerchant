import Link from "next/link";
import { createSupabaseServerClient, getAuthedUserId } from "@/lib/supabase/server";
import { LicenseBadge } from "@/components/license-badge";

function formatPrice(priceCents: number | null | undefined) {
  if (!priceCents || priceCents <= 0) return "Free";
  return `$${(priceCents / 100).toFixed(2)}`;
}

function formatDate(input: string | null | undefined) {
  if (!input) return "";
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export default async function PurchasesPage({
  searchParams
}: {
  searchParams?: { checkout?: string };
}) {
  const userId = await getAuthedUserId();
  if (!userId) return null;

  const checkout = searchParams?.checkout;

  const supabase = createSupabaseServerClient();

  const { data: purchases } = await supabase
    .from("purchases")
    .select("id, plugin_id, version_id, amount_cents, status, created_at")
    .eq("buyer_id", userId)
    .order("created_at", { ascending: false });

  const purchaseRows = purchases ?? [];

  const purchaseIds = purchaseRows.map((p: any) => p.id);
  const pluginIds = Array.from(
    new Set(purchaseRows.map((p: any) => p.plugin_id).filter(Boolean))
  );
  const versionIds = Array.from(
    new Set(purchaseRows.map((p: any) => p.version_id).filter(Boolean))
  );

  const { data: plugins } = pluginIds.length
    ? await supabase
        .from("plugins")
        .select("id, slug, name")
        .in("id", pluginIds)
    : { data: [] as any[] };

  const { data: versions } = versionIds.length
    ? await supabase
        .from("plugin_versions")
        .select("id, version")
        .in("id", versionIds)
    : { data: [] as any[] };

  const { data: licenseKeys } = purchaseIds.length
    ? await supabase
        .from("license_keys")
        .select("id, key, plugin_id, purchase_id, status")
        .eq("buyer_id", userId)
        .in("purchase_id", purchaseIds)
        .order("created_at", { ascending: false })
    : { data: [] as any[] };

  const pluginById = new Map<string, any>((plugins ?? []).map((p: any) => [p.id, p]));
  const versionById = new Map<string, any>((versions ?? []).map((v: any) => [v.id, v]));

  const licensesByPurchaseId = new Map<string, any[]>();
  for (const lic of licenseKeys ?? []) {
    const list = licensesByPurchaseId.get(lic.purchase_id) ?? [];
    list.push(lic);
    licensesByPurchaseId.set(lic.purchase_id, list);
  }

  const completedCount = purchaseRows.filter((p: any) => p.status === "completed").length;

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <h1 className="text-2xl font-semibold text-gray-100">Your purchases</h1>

      {checkout === "success" ? (
        <div className="mt-4 rounded-xl border border-brand-500/60 bg-brand-500/10 p-4 text-sm text-brand-200">
          <div className="font-medium">Payment successful</div>
          <div className="mt-1 text-gray-200/90">
            {completedCount > 0
              ? "Your license should now be available below."
              : "Thanks for your purchase. Your license may take a moment to be processed."}
          </div>

          {completedCount === 0 ? (
            <div className="mt-2 text-xs text-brand-100">
              If you are running local development, also ensure the Stripe webhook listener
              is running (otherwise the database may not be updated).
            </div>
          ) : null}
        </div>
      ) : null}

      {purchaseRows.length === 0 ? (
        <div className="mt-6 rounded-xl border border-gray-800 bg-gray-900/30 p-6 text-sm text-gray-300">
          You don&apos;t have any purchases yet. Buy a plugin from the marketplace to get started.
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {purchaseRows.map((p: any) => {
            const plugin = pluginById.get(p.plugin_id);
            const version = versionById.get(p.version_id);
            const purchaseLicenses = licensesByPurchaseId.get(p.id) ?? [];

            return (
              <div
                key={p.id}
                className="flex flex-col gap-3 rounded-xl border border-gray-800 bg-gray-900/30 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="text-sm font-medium text-gray-100">
                    {plugin ? plugin.name : "Purchased plugin"}
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    {p.status ? `Status: ${p.status}` : null}
                    {p.created_at ? ` · ${formatDate(p.created_at)}` : null}
                    {" · "}
                    {version?.version ? `v${version.version}` : "Latest version"}
                  </div>
                  <div className="mt-1 text-xs text-gray-400">Total: {formatPrice(p.amount_cents)}</div>

                  {plugin?.slug ? (
                    <div className="mt-2 text-xs">
                      <Link
                        href={`/plugin/${plugin.slug}`}
                        className="text-brand-400 hover:underline"
                      >
                        View plugin page
                      </Link>
                    </div>
                  ) : null}
                </div>

                <div className="flex flex-col gap-2 sm:items-end">
                  {purchaseLicenses.length === 0 ? (
                    <div className="rounded-md border border-gray-800 bg-gray-950/60 px-3 py-2 text-xs text-gray-300">
                      Processing license...
                    </div>
                  ) : (
                    purchaseLicenses.map((lic: any) => (
                      <div key={lic.id} className="flex flex-col gap-1 rounded-md border border-gray-800 bg-gray-950/60 px-3 py-2 sm:items-end">
                        <div className="text-xs text-gray-400">License key</div>
                        <div>
                          <LicenseBadge licenseKey={lic.key} />
                        </div>
                        <div className="mt-1 flex flex-wrap gap-2 justify-end">
                          <Link
                            href={`/api/downloads/${encodeURIComponent(lic.key)}/${encodeURIComponent(
                              lic.plugin_id
                            )}`}
                            className="rounded-md border border-gray-700 bg-gray-800 px-3 py-1.5 text-xs font-medium text-gray-200 hover:border-gray-600 hover:bg-gray-700"
                          >
                            Download latest
                          </Link>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-8">
        <Link
          href="/account/licenses"
          className="rounded-md border border-gray-800 bg-gray-900/30 px-4 py-2 text-sm font-medium text-gray-200 hover:border-gray-700"
        >
          Manage licenses
        </Link>
      </div>
    </div>
  );
}

