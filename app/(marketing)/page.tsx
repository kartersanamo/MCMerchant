import Link from "next/link";
import { PluginGrid } from "@/components/plugin-grid";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function LandingPage() {
  const supabase = createSupabaseServerClient();

  const { data: plugins } = await supabase
    .from("plugins")
    .select("id, slug, name, tagline, cover_image_url, price_cents, total_downloads, seller_id")
    .eq("status", "published")
    .order("updated_at", { ascending: false })
    .limit(12);

  const pluginList = plugins ?? [];

  const sellerIds = Array.from(new Set(pluginList.map((p: { seller_id: string }) => p.seller_id)));
  const { data: profiles } = sellerIds.length
    ? await supabase
        .from("profiles")
        .select("id, username")
        .in("id", sellerIds)
    : { data: [] as { id: string; username: string }[] };

  const usernameById = new Map(
    (profiles ?? []).map((u) => [u.id, u.username])
  );

  const { data: reviews } = pluginList.length
    ? await supabase
        .from("reviews")
        .select("plugin_id, rating")
        .in("plugin_id", pluginList.map((p: { id: string }) => p.id))
    : { data: [] as { plugin_id: string; rating: number }[] };

  const ratingsByPlugin = new Map<string, { sum: number; count: number }>();
  (reviews ?? []).forEach((r) => {
    const cur = ratingsByPlugin.get(r.plugin_id) ?? { sum: 0, count: 0 };
    cur.sum += Number(r.rating ?? 0);
    cur.count += 1;
    ratingsByPlugin.set(r.plugin_id, cur);
  });

  const pluginsForGrid = pluginList.map((p: {
    id: string;
    slug: string;
    name: string;
    tagline: string | null;
    cover_image_url: string | null;
    price_cents: number | null;
    total_downloads: number | null;
    seller_id: string;
  }) => {
    const agg = ratingsByPlugin.get(p.id);
    const rating = agg && agg.count ? agg.sum / agg.count : 0;
    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      tagline: p.tagline,
      cover_image_url: p.cover_image_url,
      seller_username: usernameById.get(p.seller_id) ?? "Unknown",
      rating,
      price_cents: p.price_cents ?? 0,
      total_downloads: p.total_downloads ?? 0,
    };
  });

  return (
    <div className="min-h-screen">
      <main className="mx-auto w-full max-w-6xl px-6 py-14">
        <section className="relative">
          <div className="inline-flex items-center rounded-full border border-gray-800 bg-gray-900/40 px-4 py-2 text-sm text-gray-200">
            Built for Minecraft plugin developers
          </div>

          <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-tight text-gray-50">
            The plugin marketplace built for Minecraft developers
          </h1>

          <p className="mt-4 max-w-2xl text-gray-300">
            Sell your work with modern UX, deliver automatic updates, and protect licenses
            with a download flow your buyers can trust.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <Link
              href="/browse"
              className="rounded-md bg-brand-500 px-5 py-3 text-center font-medium text-gray-950"
            >
              Browse plugins
            </Link>
            <Link
              href="/signup"
              className="rounded-md border border-gray-800 bg-gray-950 px-5 py-3 text-center font-medium text-gray-100 hover:border-gray-700"
            >
              Sign up
            </Link>
            <Link
              href="/dashboard"
              className="rounded-md border border-gray-800 bg-gray-950 px-5 py-3 text-center font-medium text-gray-100 hover:border-gray-700"
            >
              Start selling
            </Link>
          </div>
        </section>

        <section className="mt-12 grid gap-4 sm:grid-cols-3">
          {[
            { title: "Instant payouts", desc: "Stripe Connect payouts for sellers." },
            { title: "Auto-update delivery", desc: "Signed downloads for every version." },
            { title: "License key protection", desc: "Paid plugins require valid keys." }
          ].map((f) => (
            <div key={f.title} className="rounded-xl border border-gray-800 bg-gray-900/30 p-5">
              <h3 className="text-sm font-medium text-gray-100">{f.title}</h3>
              <p className="mt-2 text-sm text-gray-400">{f.desc}</p>
            </div>
          ))}
        </section>

        <section className="mt-14">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-lg font-semibold text-gray-100">
              {pluginsForGrid.length ? "Featured plugins" : "Plugins"}
            </h2>
            <Link href="/browse" className="text-sm text-brand-400 hover:underline">
              View all
            </Link>
          </div>
          <div className="mt-6">
            {pluginsForGrid.length ? (
              <PluginGrid plugins={pluginsForGrid} />
            ) : (
              <div className="rounded-xl border border-dashed border-gray-700 bg-gray-900/30 p-12 text-center">
                <p className="text-gray-400">No plugins yet.</p>
                <p className="mt-1 text-sm text-gray-500">Be the first to publish one.</p>
                <Link
                  href="/signup"
                  className="mt-4 inline-block rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-gray-950"
                >
                  Sign up to sell
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
