import { createSupabaseServerClient, getAuthedUserId } from "@/lib/supabase/server";
import { PluginEditForm } from "./plugin-edit-form";

export default async function EditPluginPage({ params }: { params: { id: string } }) {
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

  const { data: versions } = await supabase
    .from("plugin_versions")
    .select("id, version, changelog, minecraft_versions, created_at, download_count, is_latest")
    .eq("plugin_id", params.id)
    .order("created_at", { ascending: false });

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", userId)
    .maybeSingle();
  const accountName = profile?.username ?? "";

  return (
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
        cover_image_url: plugin.cover_image_url,
      }}
      versions={(versions ?? []).map((v) => ({
        id: v.id,
        version: v.version,
        changelog: v.changelog,
        minecraft_versions: v.minecraft_versions ?? [],
        created_at: v.created_at,
        download_count: v.download_count,
        is_latest: Boolean(v.is_latest),
      }))}
    />
  );
}
