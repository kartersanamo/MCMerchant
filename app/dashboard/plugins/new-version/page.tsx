import Link from "next/link";
import { createSupabaseServerClient, getAuthedUserId } from "@/lib/supabase/server";

export default async function NewVersionSelectPluginPage() {
  const userId = await getAuthedUserId();
  if (!userId) return null;

  const supabase = createSupabaseServerClient();
  const { data: plugins } = await supabase
    .from("plugins")
    .select("id, slug, name, status, updated_at")
    .eq("seller_id", userId)
    .order("updated_at", { ascending: false });

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-10">
      <Link
        href="/dashboard/plugins"
        className="text-sm text-gray-400 hover:text-gray-200"
      >
        ← Back to my plugins
      </Link>
      <h1 className="mt-4 text-2xl font-semibold text-gray-100">Add new version</h1>
      <p className="mt-2 text-sm text-gray-400">
        Select which plugin you want to upload a new version for.
      </p>

      <div className="mt-6 space-y-3">
        {(plugins ?? []).length ? (
          (plugins ?? []).map((p: { id: string; slug: string; name: string; status: string }) => (
            <Link
              key={p.id}
              href={`/dashboard/plugins/${p.id}/versions`}
              className="flex items-center justify-between rounded-xl border border-gray-800 bg-gray-900/30 p-4 transition hover:border-gray-700 hover:bg-gray-900/50"
            >
              <div>
                <div className="text-sm font-medium text-gray-100">{p.name}</div>
                <div className="mt-1 text-xs text-gray-400">Status: {p.status}</div>
              </div>
              <span className="text-xs text-gray-500">Add version →</span>
            </Link>
          ))
        ) : (
          <div className="rounded-xl border border-gray-800 bg-gray-900/30 p-8 text-center text-sm text-gray-300">
            <p>You don&apos;t have any plugins yet.</p>
            <Link
              href="/dashboard/plugins/new"
              className="mt-4 inline-block rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-gray-950"
            >
              Create your first plugin
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
