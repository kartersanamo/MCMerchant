import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { StorefrontPublicProfile } from "@/lib/storefront-profile";
import {
  getStorefrontDisplayName,
  getStorefrontInitials,
  getPublicStorefrontPath,
  getStorefrontProfileByHandle
} from "@/lib/storefront-profile";
import { getStorefrontThemeClasses, resolveStoreTheme } from "@/lib/storefront-theme";
import { MarkdownContent } from "@/components/markdown-content";
import { StorefrontCatalog, type StorefrontCatalogItem } from "@/components/storefront-catalog";
import { StorefrontShareBar } from "@/components/storefront-share-bar";
import { StorefrontSubnav } from "@/components/storefront-subnav";
import { StarRating } from "@/components/star-rating";
import { getCategoryLabel } from "@/lib/constants/categories";

export const dynamic = "force-dynamic";

function publicSiteBase() {
  return (process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL)?.replace(/\/$/, "") ?? "";
}

function buildAbsoluteStoreUrl(path: string) {
  const base = publicSiteBase();
  if (!base) return null;
  return `${base}${path}`;
}

function coerceTags(raw: unknown): string[] | null {
  if (raw == null) return null;
  if (Array.isArray(raw)) return raw.map(String);
  if (typeof raw === "string") {
    try {
      const j = JSON.parse(raw);
      return Array.isArray(j) ? j.map(String) : null;
    } catch {
      return raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
  }
  return null;
}

export async function generateMetadata({
  params
}: {
  params: { handle: string };
}): Promise<Metadata> {
  const supabase = createSupabaseServerClient();
  const profile = await getStorefrontProfileByHandle(supabase, params.handle);
  if (!profile) {
    return { title: "Storefront not found — MCMerchant" };
  }
  const name = getStorefrontDisplayName(profile);
  const desc = (
    profile.store_tagline?.trim() ||
    `Shop Minecraft plugins by @${profile.username} on MCMerchant.`
  ).slice(0, 160);
  const path = getPublicStorefrontPath(profile);
  const canonical = buildAbsoluteStoreUrl(path);

  return {
    title: `${name} — Developer storefront`,
    description: desc,
    openGraph: {
      title: `${name} on MCMerchant`,
      description: desc,
      url: canonical ?? undefined
    }
  };
}

function formatPrice(priceCents: number) {
  if ((priceCents ?? 0) <= 0) return "Free";
  return `$${(priceCents / 100).toFixed(2)}`;
}

const NEW_DAYS = 18;

function SocialIconRow({
  profile,
  theme
}: {
  profile: StorefrontPublicProfile;
  theme: ReturnType<typeof getStorefrontThemeClasses>;
}) {
  const iconBtn =
    "inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-800 bg-gray-950/80 text-gray-300 transition hover:border-gray-600 hover:bg-gray-900 hover:text-white";

  return (
    <div className="flex flex-wrap items-center gap-2">
      {profile.store_website_url ? (
        <a
          href={profile.store_website_url}
          target="_blank"
          rel="noreferrer"
          className={iconBtn}
          aria-label="Website"
          title="Website"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9-9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
            />
          </svg>
        </a>
      ) : null}
      {profile.store_github_url ? (
        <a
          href={profile.store_github_url}
          target="_blank"
          rel="noreferrer"
          className={iconBtn}
          aria-label="GitHub"
          title="GitHub"
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path d="M12 .5C5.65.5.5 5.65.5 12a11.5 11.5 0 008.41 11.1c.61.11.82-.27.82-.6 0-.3-.01-1.3-.01-2.35-3.42.75-4.14-1.65-4.14-1.65-.56-1.42-1.36-1.8-1.36-1.8-1.11-.76.09-.74.09-.74 1.23.09 1.88 1.26 1.88 1.26 1.09 1.87 2.86 1.33 3.55 1.02.11-.8.43-1.33.78-1.64-2.73-.31-5.6-1.36-5.6-6.05 0-1.34.48-2.44 1.26-3.3-.13-.31-.55-1.57.12-3.28 0 0 1.03-.33 3.38 1.26a11.7 11.7 0 016.24 0c2.35-1.59 3.38-1.26 3.38-1.26.67 1.71.25 2.97.12 3.28.78.86 1.26 1.96 1.26 3.3 0 4.7-2.88 5.74-5.63.03.43.56.85 1.64.63 3.28a11.57 11.57 0 00.02-3.27c0-.33.21-.71.84-.59A11.52 11.52 0 0023.5 12C23.5 5.65 18.35.5 12 .5z" />
          </svg>
        </a>
      ) : null}
      {profile.store_discord_url ? (
        <a
          href={profile.store_discord_url}
          target="_blank"
          rel="noreferrer"
          className={iconBtn}
          aria-label="Discord"
          title="Discord"
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
          </svg>
        </a>
      ) : null}
      {profile.store_twitter_url ? (
        <a
          href={profile.store_twitter_url}
          target="_blank"
          rel="noreferrer"
          className={iconBtn}
          aria-label="X / Twitter"
          title="X / Twitter"
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </a>
      ) : null}
      <Link
        href="/browse"
        className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition ${theme.pillIdle}`}
      >
        All plugins catalog
      </Link>
    </div>
  );
}

export default async function PublicStorefrontPage({ params }: { params: { handle: string } }) {
  const supabase = createSupabaseServerClient();
  const profile = await getStorefrontProfileByHandle(supabase, params.handle);

  if (!profile) {
    return (
      <div className="mx-auto w-full max-w-6xl px-6 py-14">
        <h1 className="text-xl font-semibold text-gray-100">Storefront not found</h1>
        <p className="mt-2 text-sm text-gray-400">
          There is no seller profile for <span className="font-mono text-gray-200">{params.handle}</span>.
        </p>
        <Link href="/browse" className="mt-6 inline-block text-sm text-brand-400 hover:underline">
          Browse the marketplace
        </Link>
      </div>
    );
  }

  const path = getPublicStorefrontPath(profile);
  const displayName = getStorefrontDisplayName(profile);
  const initials = getStorefrontInitials(profile);
  const canonical = buildAbsoluteStoreUrl(path);
  const themeId = resolveStoreTheme(profile.store_theme ?? null);
  const theme = getStorefrontThemeClasses(themeId);

  const { data: plugins } = await supabase
    .from("plugins")
    .select(
      "id, slug, name, tagline, cover_image_url, price_cents, total_downloads, total_sales, category, tags, updated_at, seller_id"
    )
    .eq("seller_id", profile.id)
    .eq("status", "published")
    .order("updated_at", { ascending: false });

  const pluginList = plugins ?? [];

  const { data: reviews } = pluginList.length
    ? await supabase
        .from("reviews")
        .select("plugin_id, rating")
        .in(
          "plugin_id",
          pluginList.map((p) => p.id)
        )
    : { data: [] as { plugin_id: string; rating: number }[] };

  const ratingsByPlugin = new Map<string, { sum: number; count: number }>();
  (reviews ?? []).forEach((r) => {
    const cur = ratingsByPlugin.get(r.plugin_id) ?? { sum: 0, count: 0 };
    cur.sum += Number(r.rating ?? 0);
    cur.count += 1;
    ratingsByPlugin.set(r.plugin_id, cur);
  });

  const catalogItems: StorefrontCatalogItem[] = pluginList.map((p) => {
    const agg = ratingsByPlugin.get(p.id);
    const rating = agg && agg.count ? agg.sum / agg.count : 0;
    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      tagline: p.tagline,
      cover_image_url: p.cover_image_url,
      seller_username: profile.username,
      rating,
      price_cents: p.price_cents ?? 0,
      total_downloads: p.total_downloads ?? 0,
      category: p.category ?? null,
      tags: coerceTags(p.tags),
      updated_at: p.updated_at ?? new Date().toISOString()
    };
  });

  let featuredId: (typeof pluginList)[0] | null = null;
  for (const p of pluginList) {
    if (!featuredId) {
      featuredId = p;
      continue;
    }
    const d = (p.total_downloads ?? 0) - (featuredId.total_downloads ?? 0);
    if (d > 0) featuredId = p;
    else if (d === 0 && p.updated_at && featuredId.updated_at) {
      if (new Date(p.updated_at) > new Date(featuredId.updated_at)) featuredId = p;
    }
  }

  const featuredCardData = featuredId ? catalogItems.find((c) => c.id === featuredId.id) ?? null : null;

  const totalDownloads = pluginList.reduce((s, p) => s + (p.total_downloads ?? 0), 0);
  const totalSales = pluginList.reduce((s, p) => s + (p.total_sales ?? 0), 0);
  const allReviewRows = reviews ?? [];
  const avgRatingAll = allReviewRows.length
    ? allReviewRows.reduce((s, r) => s + Number(r.rating ?? 0), 0) / allReviewRows.length
    : 0;
  const freeCount = pluginList.filter((p) => (p.price_cents ?? 0) <= 0).length;
  const paidCount = pluginList.length - freeCount;

  const now = Date.now();
  const featuredIsNew = featuredId?.updated_at
    ? now - new Date(featuredId.updated_at).getTime() < NEW_DAYS * 86400000
    : false;

  const showAbout = Boolean(profile.store_bio?.trim());
  const showFeatured = Boolean(featuredCardData && pluginList.length > 1);

  const bannerUrl = profile.store_banner_url?.trim() || null;
  const iconUrl = profile.store_icon_url?.trim() || null;

  return (
    <div className="relative min-h-screen pb-16">
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-35%] h-[75vmin] w-[75vmin] -translate-x-1/2 rounded-full bg-brand-500/12 blur-[100px]" />
        <div className="absolute right-[-10%] top-1/4 h-[55vmin] w-[55vmin] rounded-full bg-purple-600/10 blur-[90px]" />
      </div>

      <div className="relative mx-auto w-full max-w-6xl px-4 pb-6 pt-6 sm:px-6 lg:px-8">
        <header className={`relative overflow-hidden rounded-3xl border ${theme.accentBorder} bg-gray-950 shadow-2xl ${theme.glow}`}>
          {bannerUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- user-provided banner from any host
            <img
              src={bannerUrl}
              alt={`Storefront banner · ${displayName}`}
              className="absolute inset-0 h-full w-full object-cover opacity-35"
            />
          ) : null}
          <div
            className={`absolute inset-0 bg-gradient-to-br ${theme.heroGradient} ${bannerUrl ? "opacity-80" : "opacity-100"}`}
          />
          <div className={`absolute inset-0 bg-gradient-to-t ${theme.heroOverlay}`} />

          <div className="relative px-6 py-10 sm:px-10 sm:py-12">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex min-w-0 flex-1 gap-5">
                <div
                  className={`flex h-20 w-20 shrink-0 overflow-hidden items-center justify-center rounded-2xl border-2 bg-gray-950/70 text-2xl font-bold text-gray-50 shadow-lg ring-2 sm:h-24 sm:w-24 sm:text-3xl ${theme.accentBorder} ${theme.ring}`}
                >
                  {iconUrl ? (
                    // User-provided URL from any host; use plain img (not next/image) so no remotePatterns needed.
                    <img
                      src={iconUrl}
                      alt={`${displayName} storefront icon`}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    initials
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-xs font-bold uppercase tracking-[0.2em] ${theme.accentText}`}>
                    Developer storefront · MCMerchant
                  </p>
                  <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-50 sm:text-4xl">{displayName}</h1>
                  {profile.store_tagline ? (
                    <p className="mt-3 max-w-2xl text-base leading-relaxed text-gray-200/90">{profile.store_tagline}</p>
                  ) : (
                    <p className="mt-3 max-w-2xl text-sm text-gray-400">
                      Plugins and tools by <span className="font-mono text-gray-300">@{profile.username}</span>
                    </p>
                  )}

                  <div className="mt-6">
                    <SocialIconRow profile={profile} theme={theme} />
                  </div>
                </div>
              </div>

              <div className="w-full shrink-0 lg:max-w-md">
                <StorefrontShareBar
                  absoluteUrl={canonical}
                  path={path}
                  accentBorder={theme.accentBorder}
                  accentText={theme.accentText}
                />
                {profile.custom_domain && profile.custom_domain_status === "verified" ? (
                  <p className="mt-3 text-center text-xs text-emerald-400/90">
                    Custom domain · {profile.custom_domain}
                  </p>
                ) : null}
              </div>
            </div>

            {showAbout ? (
              <div id="store-section-about" className="mt-10 w-full">
                <div className="flex items-center gap-3">
                  <h2 className={`text-sm font-semibold uppercase tracking-wider ${theme.accentText}`}>About</h2>
                  <div className="h-px flex-1 bg-gray-800/80" />
                </div>
                <div className="prose-storefront mt-4 max-w-4xl">
                  <MarkdownContent content={profile.store_bio ?? ""} />
                </div>
              </div>
            ) : null}

            {pluginList.length ? (
              <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { label: "Plugins", value: String(pluginList.length) },
                  { label: "Downloads", value: totalDownloads.toLocaleString() },
                  {
                    label: "Avg rating",
                    value: allReviewRows.length ? avgRatingAll.toFixed(1) : "—"
                  },
                  { label: "Total sales", value: totalSales.toLocaleString() }
                ].map((s) => (
                  <div
                    key={s.label}
                    className="rounded-2xl border border-white/10 bg-gray-950/50 px-4 py-4 backdrop-blur-sm"
                  >
                    <div className="text-2xl font-semibold tabular-nums text-gray-50">{s.value}</div>
                    <div className="mt-1 text-xs font-medium uppercase tracking-wider text-gray-500">{s.label}</div>
                  </div>
                ))}
              </div>
            ) : null}

            {pluginList.length ? (
              <p className="mt-6 text-xs text-gray-500">
                {freeCount} free · {paidCount} paid · Licensed delivery & updates via MCMerchantLoader
              </p>
            ) : null}
          </div>
        </header>

        <StorefrontSubnav theme={theme} showFeatured={showFeatured} showAbout={showAbout} />

        {showFeatured && featuredCardData && featuredId ? (
          <section
            id="store-section-featured"
            className="scroll-mt-32 mt-10 rounded-3xl border border-gray-800/90 bg-gradient-to-br from-gray-900/80 to-gray-950/90 p-1 shadow-xl"
          >
            <div className="rounded-[1.35rem] border border-gray-800/60 bg-gray-950/40 p-6 sm:p-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
                <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-gray-900 sm:aspect-video lg:h-52 lg:w-80 lg:shrink-0 lg:aspect-auto">
                  {featuredId.cover_image_url ? (
                    <Image
                      src={featuredId.cover_image_url}
                      alt={`${featuredId.name} cover`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 320px"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full min-h-[200px] items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 text-gray-600">
                      <span className="text-sm">Featured</span>
                    </div>
                  )}
                  {featuredIsNew ? (
                    <span
                      className={`absolute left-3 top-3 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${theme.accentBorder} bg-gray-950/80 ${theme.accentText}`}
                    >
                      Recently updated
                    </span>
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-xs font-semibold uppercase tracking-wider ${theme.accentText}`}>Featured</p>
                  <h2 className="mt-2 text-2xl font-semibold text-gray-50">{featuredId.name}</h2>
                  <p className="mt-2 line-clamp-2 text-sm text-gray-400">{featuredId.tagline ?? "Top pick from this storefront."}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-4">
                    <StarRating rating={featuredCardData.rating} />
                    <span className="text-sm text-gray-500">
                      {(featuredId.total_downloads ?? 0).toLocaleString()} downloads
                    </span>
                    {featuredId.category ? (
                      <span className="rounded-full border border-gray-700 bg-gray-900 px-2.5 py-0.5 text-xs text-gray-300">
                        {getCategoryLabel(featuredId.category)}
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                      href={`/plugin/${featuredId.slug}`}
                      className="rounded-xl bg-gray-100 px-5 py-2.5 text-sm font-semibold text-gray-950 transition hover:bg-white"
                    >
                      Plugin details
                    </Link>
                    <Link
                      href={`/plugin/${featuredId.slug}/install`}
                      className={`rounded-xl border px-5 py-2.5 text-sm font-medium transition ${theme.pillIdle}`}
                    >
                      Installer & downloads
                    </Link>
                    <span className="flex items-center rounded-xl border border-gray-700 bg-gray-900/50 px-4 py-2.5 text-sm font-medium text-gray-200">
                      {formatPrice(featuredId.price_cents ?? 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ) : null}

        <section id="store-section-catalog" className={`scroll-mt-28 mt-10 rounded-3xl border border-gray-800 bg-gray-950/50 p-6 sm:p-8`}>
          <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-50">All plugins</h2>
              <p className="mt-1 text-sm text-gray-400">
                Search, sort, and filter—everything here uses MCMerchant licensing and secure downloads.
              </p>
            </div>
          </div>
          {catalogItems.length ? (
            <StorefrontCatalog items={catalogItems} theme={theme} />
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-700 bg-gray-900/20 py-20 text-center">
              <Image
                src="/MCMerchantMono.png"
                alt="MCMerchant"
                width={56}
                height={56}
                className="opacity-40"
                unoptimized
              />
              <p className="mt-4 text-sm text-gray-400">No published plugins yet.</p>
              <p className="mt-1 text-xs text-gray-600">Check back soon for new releases.</p>
            </div>
          )}
        </section>

        <footer className="mt-12 rounded-2xl border border-gray-800/80 bg-gray-950/60 px-6 py-5 text-center text-xs text-gray-500">
          Storefront powered by{" "}
          <Link href="/" className={`font-medium ${theme.accentText} hover:underline`}>
            MCMerchant
          </Link>
          {" · "}
          <Link href="/docs/loader" className="hover:text-gray-400 hover:underline">
            MCMerchantLoader
          </Link>
          {" · "}
          <Link href="/browse" className="hover:text-gray-400 hover:underline">
            Browse marketplace
          </Link>
        </footer>
      </div>
    </div>
  );
}
