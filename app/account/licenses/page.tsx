import Link from "next/link";
import { createSupabaseServerClient, getAuthedUserId } from "@/lib/supabase/server";
import { LicenseRevealControl } from "@/components/license-reveal-control";
import { CopyButton } from "@/components/copy-button";

export default async function LicensesPage() {
  const userId = await getAuthedUserId();
  if (!userId) return null;

  const supabase = createSupabaseServerClient();

  const { data: rows, error: licensesErr } = await supabase
    .from("license_keys")
    // Keep this selection minimal so the page still shows licenses even if some optional columns
    // haven't been added to the schema yet.
    .select("id, key, plugin_id, status")
    .eq("buyer_id", userId)
    .order("created_at", { ascending: false });

  const licenses = rows ?? [];

  const pluginIds = Array.from(
    new Set((licenses ?? []).map((l: any) => l.plugin_id).filter(Boolean))
  );

  const { data: plugins } = pluginIds.length
    ? await supabase
        .from("plugins")
        .select("id, slug, name")
        .in("id", pluginIds)
    : { data: [] as any[] };

  const pluginById = new Map<string, any>((plugins ?? []).map((p: any) => [p.id, p]));

  const { data: latestRows } = pluginIds.length
    ? await supabase
        .from("plugin_versions")
        .select("plugin_id, version")
        .eq("is_latest", true)
        .in("plugin_id", pluginIds)
    : { data: [] as any[] };

  const latestVersionByPluginId = new Map<string, string>(
    (latestRows ?? []).map((r: any) => [r.plugin_id, r.version])
  );

  const { data: recentPurchases } = !licensesErr && licenses.length === 0
    ? await supabase
        .from("purchases")
        .select("id, plugin_id, version_id, status, created_at")
        .eq("buyer_id", userId)
        .order("created_at", { ascending: false })
        .limit(5)
    : { data: [] as any[] };

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <h1 className="text-2xl font-semibold text-gray-100">Your licenses</h1>
      <p className="mt-2 text-sm text-gray-400">
        Each purchase creates a license key you can use to install and update your plugins.
      </p>

      {licensesErr ? (
        <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-sm text-red-200">
          Failed to load licenses: {licensesErr.message}
        </div>
      ) : null}

      {licenses.length === 0 ? (
        <div className="mt-6 rounded-xl border border-gray-800 bg-gray-900/30 p-6 text-sm text-gray-300">
          You don&apos;t have any licenses yet.
          <div className="mt-2 text-sm text-gray-400">
            If you just completed a purchase, the webhook can take a moment to generate the license key.
          </div>

          {recentPurchases && recentPurchases.length ? (
            <div className="mt-4 space-y-2 text-xs text-gray-400">
              <div className="text-sm font-medium text-gray-300">Recent purchases</div>
              {recentPurchases.map((p: any) => (
                <div key={p.id} className="flex items-center justify-between gap-3">
                  <span>
                    {p.status ?? "unknown"} · {p.plugin_id ?? "unknown plugin"}
                  </span>
                  <span>{p.created_at ? new Date(p.created_at).toLocaleString() : null}</span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {licenses.map((l: any) => (
            <div
              key={l.id}
              className="flex flex-col gap-3 rounded-xl border border-gray-800 bg-gray-900/30 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-full border border-gray-800 bg-gray-950/40 px-2 py-0.5 text-[11px] text-gray-200">
                    {l.status ?? "unknown"}
                  </span>

                  <span className="min-w-0 truncate text-sm font-medium text-gray-100">
                    {pluginById.get(l.plugin_id)?.name ?? "Unknown plugin"}
                  </span>
                </div>

                <div className="mt-2 flex flex-col gap-2 sm:mt-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] text-gray-400">License</span>
                    <LicenseRevealControl licenseKey={l.key} />
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
                    <span className="text-[11px] text-gray-500">Plugin-id</span>
                    {l.plugin_id ? (
                      <>
                        <code className="truncate rounded-md border border-gray-800 bg-gray-950/40 px-2 py-1 font-mono text-[11px] text-gray-200 max-w-[240px]">
                          {l.plugin_id}
                        </code>
                        <CopyButton text={l.plugin_id} defaultLabel="Copy" copiedLabel="Copied" />
                      </>
                    ) : null}
                    <span className="ml-1 text-[11px] text-gray-500">
                      Latest:{" "}
                      <span className="text-gray-200">
                        {latestVersionByPluginId.get(l.plugin_id) ?? "n/a"}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap justify-end gap-2 sm:flex-col sm:items-end">
                <Link
                  href={`/api/downloads/${encodeURIComponent(l.key)}/${encodeURIComponent(
                    l.plugin_id
                  )}`}
                  className="rounded-md border border-gray-700 bg-gray-800 px-3 py-1.5 text-xs font-medium text-gray-200 hover:border-gray-600 hover:bg-gray-700"
                >
                  Download latest
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


