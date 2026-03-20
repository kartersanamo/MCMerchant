import Link from "next/link";
import { createSupabaseServerClient, getAuthedUserId } from "@/lib/supabase/server";
import { PluginEditForm } from "./plugin-edit-form";
import { VersionUploader } from "@/components/version-uploader";
import { VersionManager } from "@/components/version-manager";

export default async function EditPluginPage({
  params,
  searchParams
}: {
  params: { id: string };
  searchParams?: { tab?: string };
}) {
  const userId = await getAuthedUserId();
  if (!userId) return null;

  const supabase = createSupabaseServerClient();

  const { data: plugin } = await supabase
    .from("plugins")
    .select(
      "id, name, slug, tagline, description, category, tags, price_cents, status, cover_image_url, updated_at"
    )
    .eq("id", params.id)
    .eq("seller_id", userId)
    .maybeSingle();

  if (!plugin) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="rounded-2xl border border-red-900/30 bg-red-950/10 p-8 text-center">
          <p className="text-gray-300">Plugin not found or you don’t have permission to edit it.</p>
        </div>
      </div>
    );
  }

  const tab = searchParams?.tab === "versions" ? "versions" : "info";

  // `server_platform` is optional in local/dev schemas. Try with it first, then retry without.
  const { data: versionsWithPlatform, error: versionsError } = await supabase
    .from("plugin_versions")
    .select(
      "id, version, changelog, minecraft_versions, created_at, download_count, is_latest, server_platform"
    )
    .eq("plugin_id", params.id)
    .order("created_at", { ascending: false });

  // `server_platform` is optional in local/dev schemas.
  // Cast to `any` to allow fallback query results that may omit the column.
  let versions: any = versionsWithPlatform;
  if (versionsError && String(versionsError.message ?? "").includes("server_platform")) {
    const { data: fallbackVersions } = await supabase
      .from("plugin_versions")
      .select("id, version, changelog, minecraft_versions, created_at, download_count, is_latest")
      .eq("plugin_id", params.id)
      .order("created_at", { ascending: false });
    versions = fallbackVersions;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", userId)
    .maybeSingle();
  const accountName = profile?.username ?? "";

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 rounded-2xl border border-gray-800/80 bg-gray-900/30 p-1">
          <Link
            href={`/dashboard/plugins/${plugin.id}/edit?tab=info`}
            className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
              tab === "info"
                ? "bg-gray-950 text-gray-100 ring-1 ring-gray-700"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            Information
          </Link>
          <Link
            href={`/dashboard/plugins/${plugin.id}/edit?tab=versions`}
            className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
              tab === "versions"
                ? "bg-gray-950 text-gray-100 ring-1 ring-gray-700"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            Versions
          </Link>
        </div>
      </div>

      {tab === "versions" ? (
        <div className="mt-8 space-y-8">
          <div className="rounded-2xl border border-gray-800/80 bg-gray-900/40 p-6 shadow-lg shadow-black/20">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
                Upload new version
              </h2>
            </div>
            <p className="mt-2 text-sm text-gray-400">
              Upload a .jar, set metadata, and mark it as latest.
            </p>
            <div className="mt-6">
              <VersionUploader pluginId={params.id} />
            </div>
          </div>

          <VersionManager
            pluginId={params.id}
            pluginName={plugin.name}
            versions={(versions ?? []).map((v: any) => ({
              id: v.id,
              version: v.version,
              changelog: v.changelog,
              minecraft_versions: v.minecraft_versions ?? [],
              created_at: v.created_at,
              download_count: v.download_count,
              is_latest: Boolean(v.is_latest),
              server_platform: v.server_platform ?? null
            }))}
          />
        </div>
      ) : (
        <div className="mt-8">
          <PluginEditForm
            accountName={accountName}
            plugin={{
              id: plugin.id,
              name: plugin.name,
              slug: plugin.slug,
              tagline: plugin.tagline ?? "",
              description: plugin.description ?? "",
              category: plugin.category ?? "economy",
              tags: plugin.tags ?? [],
              price_cents: plugin.price_cents,
              status: plugin.status ?? "draft",
              cover_image_url: plugin.cover_image_url
            }}
          />
        </div>
      )}
    </div>
  );
}
