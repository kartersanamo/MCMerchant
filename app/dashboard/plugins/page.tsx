import Link from "next/link";
import { createSupabaseServerClient, getAuthedUserId } from "@/lib/supabase/server";
import { DeletePluginButton } from "@/components/delete-plugin-button";

export default async function MyPluginsPage() {
  const userId = await getAuthedUserId();
  if (!userId) return null;

  const supabase = createSupabaseServerClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", userId)
    .maybeSingle();
  const accountName = profile?.username ?? "account";

  const { data: plugins } = await supabase
    .from("plugins")
    .select("id, slug, name, status, updated_at")
    .eq("seller_id", userId)
    .order("updated_at", { ascending: false })
    .limit(50);

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-gray-100">My plugins</h1>
        <Link
          href="/dashboard/plugins/new"
          className="rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-gray-950"
        >
          New plugin
        </Link>
      </div>

      <div className="mt-6 space-y-3">
        {(plugins ?? []).length ? (
          (plugins ?? []).map((p: any) => (
            <div
              key={p.id}
              className="flex items-center justify-between rounded-xl border border-gray-800 bg-gray-900/30 p-4"
            >
              <div>
                <div className="text-sm font-medium text-gray-100">{p.name}</div>
                <div className="mt-1 text-xs text-gray-400">
                  Status: {p.status}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Link href={`/dashboard/plugins/${p.id}/edit`} className="rounded-md border border-gray-800 bg-gray-950 px-3 py-1.5 text-xs text-gray-100">
                  Edit
                </Link>
                <Link href={`/dashboard/plugins/${p.id}/edit?tab=versions`} className="rounded-md border border-gray-800 bg-gray-950 px-3 py-1.5 text-xs text-gray-100">
                  Add version
                </Link>
                <Link href={`/plugin/${p.slug}`} className="rounded-md border border-gray-800 bg-gray-950 px-3 py-1.5 text-xs text-gray-100">
                  View
                </Link>
                <DeletePluginButton
                  pluginId={p.id}
                  pluginName={p.name}
                  username={accountName}
                />
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-xl border border-gray-800 bg-gray-900/30 p-6 text-sm text-gray-300">
            No plugins yet. Create your first plugin.
          </div>
        )}
      </div>
    </div>
  );
}

