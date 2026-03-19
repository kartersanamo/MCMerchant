import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PluginInstallFlow } from "@/components/plugin-install-flow";

export default async function PluginInstallPage({
  params,
  searchParams
}: {
  params: { slug: string };
  searchParams?: { versionId?: string };
}) {
  const supabase = createSupabaseServerClient();

  const { data: plugin, error } = await supabase
    .from("plugins")
    .select("id, name, slug, price_cents")
    .eq("slug", params.slug)
    .eq("status", "published")
    .maybeSingle();

  if (error || !plugin) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-14 text-gray-300">
        Plugin not found.
      </div>
    );
  }

  const isFree = (plugin.price_cents ?? 0) <= 0;

  return (
    <PluginInstallFlow
      pluginId={plugin.id}
      pluginName={plugin.name}
      slug={plugin.slug}
      isFree={isFree}
      versionId={searchParams?.versionId ?? undefined}
    />
  );
}
