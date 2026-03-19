import Link from "next/link";
import { createSupabaseServerClient, getAuthedUserId } from "@/lib/supabase/server";
import { StarRating } from "@/components/star-rating";
import { MarkdownContent } from "@/components/markdown-content";
import { NoLicenseModal } from "@/components/no-license-modal";
import { PluginReviewsTab } from "@/components/plugin-reviews-tab";
import { getCategoryLabel } from "@/lib/constants/categories";
import { ReportPluginPlaceholder } from "@/components/report-plugin-placeholder";
import Image from "next/image";

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
      />
    </svg>
  );
}

function formatPrice(priceCents: number) {
  if ((priceCents ?? 0) <= 0) return "Free";
  return `$${(priceCents / 100).toFixed(2)}`;
}

function formatDate(input: string | null | undefined) {
  if (!input) return "";
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export default async function PluginPage({
  params,
  searchParams
}: {
  params: { slug: string };
  searchParams?: { tab?: string; error?: string };
}) {
  const tab = searchParams?.tab ?? "description";
  const errorParam = searchParams?.error;

  const supabase = createSupabaseServerClient();
  const authedUserId = await getAuthedUserId();

  const { data: plugin, error: pluginErr } = await supabase
    .from("plugins")
    .select(
      "id, seller_id, slug, name, tagline, description, price_cents, category, tags, cover_image_url, total_downloads"
    )
    .eq("slug", params.slug)
    .eq("status", "published")
    .single();

  if (pluginErr || !plugin) {
    return (
      <div className="mx-auto w-full max-w-6xl px-6 py-14 text-gray-300">
        Plugin not found.
      </div>
    );
  }

  const { data: sellerProfile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", plugin.seller_id)
    .maybeSingle();

  const sellerUsername = sellerProfile?.username ?? "Unknown";

  const { data: latest } = await supabase
    .from("plugin_versions")
    .select("id, version, changelog, file_url, minecraft_versions, created_at, download_count")
    .eq("plugin_id", plugin.id)
    .eq("is_latest", true)
    .maybeSingle();

  const { data: versions } = await supabase
    .from("plugin_versions")
    .select("id, version, changelog, minecraft_versions, created_at, download_count")
    .eq("plugin_id", plugin.id)
    .order("created_at", { ascending: false });

  const { data: reviews } = await supabase
    .from("reviews")
    .select("id, buyer_id, rating, body, created_at")
    .eq("plugin_id", plugin.id);

  const ratingAvg =
    reviews && reviews.length
      ? reviews.reduce((sum: number, r: any) => sum + Number(r.rating ?? 0), 0) / reviews.length
      : 0;

  const buyerIds = Array.from(new Set((reviews ?? []).map((r: any) => r.buyer_id)));
  const { data: reviewProfiles } = buyerIds.length
    ? await supabase
        .from("profiles")
        .select("id, username")
        .in("id", buyerIds)
    : { data: [] as any[] };
  const usernameById = new Map<string, string>(
    (reviewProfiles ?? []).map((p: any) => [p.id, p.username])
  );
  const reviewUsernames = Object.fromEntries(usernameById);

  const latestVersionLabel = latest?.version ?? "n/a";
  const reviewCount = (reviews ?? []).length;

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      {errorParam === "checkout_unavailable" ? (
        <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          <p>This plugin is temporarily unavailable for purchase. The seller is still setting up payouts.</p>
          <p className="mt-2">
            <Link href="/dashboard/payouts" className="font-medium underline hover:no-underline">
              Sellers: complete your payout setup in Dashboard → Payouts
            </Link>
          </p>
        </div>
      ) : null}
      {errorParam === "no_license" ? (
        <NoLicenseModal
          pluginName={plugin.name}
          pluginSlug={plugin.slug}
          pluginId={plugin.id}
          latestVersionId={latest?.id ?? null}
          priceCents={plugin.price_cents ?? 0}
        />
      ) : null}
      <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900/30">
        <div className="relative h-56 w-full bg-gray-950">
          {plugin.cover_image_url ? (
            <Image
              src={plugin.cover_image_url}
              alt={`${plugin.name} cover`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 1200px"
              priority
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 to-gray-950/10" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="flex items-end justify-between gap-6">
              <div>
                <div className="text-sm text-gray-300">
                  by{" "}
                  <Link href="#" className="text-brand-400 hover:underline">
                    {sellerUsername}
                  </Link>
                </div>
                <h1 className="mt-1 text-3xl font-semibold text-gray-50">
                  {plugin.name}
                </h1>
                <div className="mt-3 flex items-center gap-4">
                  {ratingAvg ? <StarRating rating={ratingAvg} /> : null}
                  <div className="text-sm text-gray-300">
                    {(plugin.total_downloads ?? 0).toLocaleString()} downloads
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-3">
                <div className="text-right">
                  <div className="text-xs text-gray-400">Price</div>
                  <div className="text-xl font-semibold text-gray-100">
                    {formatPrice(plugin.price_cents)}
                  </div>
                </div>

                {plugin.price_cents > 0 ? (
                  authedUserId ? (
                    latest?.id ? (
                      <Link
                        href={`/api/v1/checkout-session?pluginId=${plugin.id}&versionId=${latest.id}&slug=${plugin.slug}`}
                        className="rounded-md bg-brand-500 px-5 py-2.5 text-center font-medium text-gray-950"
                      >
                        Buy now
                      </Link>
                    ) : (
                      <div className="rounded-md border border-gray-800 bg-gray-950 px-5 py-2.5 text-sm text-gray-300">
                        Latest version unavailable
                      </div>
                    )
                  ) : (
                    <Link
                      href={`/login?redirect=/plugin/${plugin.slug}`}
                      className="rounded-md bg-brand-500 px-5 py-2.5 text-center font-medium text-gray-950"
                    >
                      Buy now
                    </Link>
                  )
                ) : (
                  <Link
                    href={`/plugin/${plugin.slug}/install`}
                    className="rounded-md border border-gray-800 bg-gray-950 px-5 py-2.5 text-center font-medium text-gray-100"
                  >
                    Download free
                  </Link>
                )}
              </div>
            </div>

            <p className="mt-3 max-w-2xl text-sm text-gray-300">
              {plugin.tagline}
            </p>
          </div>
        </div>

        <div className="grid gap-6 p-6 lg:grid-cols-[1fr_320px]">
          <section className="min-w-0">
            <nav className="flex gap-2 border-b border-gray-800 pb-3">
              {[
                { key: "description", label: "Description" },
                { key: "versions", label: "Versions" },
                { key: "reviews", label: reviewCount ? `Reviews (${reviewCount})` : "Reviews" }
              ].map((t) => (
                <Link
                  key={t.key}
                  href={`?tab=${t.key}`}
                  className={[
                    "rounded-md px-3 py-1 text-sm",
                    tab === t.key ? "bg-gray-950 text-gray-100" : "text-gray-300 hover:text-gray-100"
                  ].join(" ")}
                >
                  {t.label}
                </Link>
              ))}
            </nav>

            {tab === "description" ? (
              <div className="mt-5">
                <h2 className="text-sm font-medium text-gray-200">Overview</h2>
                <div className="mt-3">
                  <MarkdownContent content={plugin.description ?? ""} />
                </div>
              </div>
            ) : null}

            {tab === "versions" ? (
              <div className="mt-5 space-y-4">
                {(versions ?? []).map((v: any) => (
                  <div key={v.id} className="rounded-xl border border-gray-800 bg-gray-900/30 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-gray-100">
                          v{v.version} {v.id === latest?.id ? <span className="text-xs text-brand-400">(latest)</span> : null}
                        </div>
                        <div className="mt-1 text-xs text-gray-400">
                          Released {formatDate(v.created_at)}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-xs text-gray-400">
                          {v.download_count ?? 0} downloads
                        </div>
                        {(plugin.price_cents ?? 0) <= 0 ? (
                          <Link
                            href={`/plugin/${plugin.slug}/install?versionId=${v.id}`}
                            className="inline-flex items-center gap-1.5 rounded-md border border-gray-700 bg-gray-800 px-2.5 py-1.5 text-xs font-medium text-gray-200 hover:border-gray-600 hover:bg-gray-700"
                          >
                            <DownloadIcon className="h-4 w-4" />
                            Download
                          </Link>
                        ) : (
                          <Link
                            href={`/plugin/${plugin.slug}/install?versionId=${v.id}`}
                            className="inline-flex items-center gap-1.5 rounded-md border border-gray-700 bg-gray-800 px-2.5 py-1.5 text-xs font-medium text-gray-200 hover:border-gray-600 hover:bg-gray-700"
                          >
                            <DownloadIcon className="h-4 w-4" />
                            Download
                          </Link>
                        )}
                      </div>
                    </div>
                    {v.changelog ? (
                      <div className="mt-3 whitespace-pre-wrap text-sm text-gray-300">
                        {v.changelog}
                      </div>
                    ) : null}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(v.minecraft_versions ?? []).map((mv: string) => (
                        <span key={mv} className="rounded-full border border-gray-800 bg-gray-950 px-2 py-0.5 text-xs text-gray-200">
                          {mv}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {tab === "reviews" ? (
              <div id="reviews">
              <PluginReviewsTab
                reviews={(reviews ?? []).map((r: any) => ({
                  id: r.id,
                  buyer_id: r.buyer_id,
                  rating: Number(r.rating ?? 0),
                  body: r.body ?? null,
                  created_at: r.created_at ?? null
                }))}
                reviewUsernames={reviewUsernames}
                ratingAvg={ratingAvg}
                pluginSlug={params.slug}
              />
              </div>
            ) : null}
          </section>

          <aside className="space-y-4">
            <div className="rounded-xl border border-gray-800 bg-gray-900/30 p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="text-xs font-medium text-gray-400">Latest</div>
                {latest?.id ? (
                  <Link
                    href={`/plugin/${plugin.slug}/install`}
                    className="rounded-md p-1.5 text-gray-400 transition hover:bg-gray-800 hover:text-brand-400"
                    title="Download"
                    aria-label="Download latest version"
                  >
                    <DownloadIcon className="h-5 w-5" />
                  </Link>
                ) : null}
              </div>
              <div className="mt-2 text-lg font-semibold text-gray-100">
                v{latestVersionLabel}
              </div>
              <div className="mt-1 text-xs text-gray-400">
                Updated {formatDate(latest?.created_at)}
              </div>
            </div>

            <div className="rounded-xl border border-gray-800 bg-gray-900/30 p-4">
              <div className="text-xs font-medium text-gray-400">Category</div>
              <div className="mt-2 text-sm text-gray-100">{getCategoryLabel(plugin.category ?? "")}</div>
              <div className="mt-4 text-xs font-medium text-gray-400">Tags</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {(plugin.tags ?? []).map((t: string) => (
                  <span key={t} className="rounded-full border border-gray-800 bg-gray-950 px-2 py-0.5 text-xs text-gray-200">
                    {t}
                  </span>
                ))}
              </div>

              <div className="mt-4">
                <ReportPluginPlaceholder />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

