import Link from "next/link";
import { PluginGrid } from "@/components/plugin-grid";
import { createPublicSupabaseClient } from "@/lib/supabase/public-server";

// Keep landing fast, but refresh featured plugins periodically (anon client = cacheable HTML, no cookies()).
export const revalidate = 300;

export default async function LandingPage() {
  const supabase = createPublicSupabaseClient();
  const { data: plugins } = await supabase
    .from("plugins")
    .select("id, slug, name, tagline, cover_image_url, price_cents, total_downloads, seller_id")
    .eq("status", "published")
    .order("updated_at", { ascending: false })
    .limit(6);

  const basePlugins = plugins ?? [];
  const pluginIds = basePlugins.map((p: any) => p.id);
  const sellerIds = Array.from(new Set(basePlugins.map((p: any) => p.seller_id)));

  const [{ data: profiles }, { data: reviews }] = await Promise.all([
    sellerIds.length
      ? supabase.from("profiles").select("id, username").in("id", sellerIds)
      : Promise.resolve({ data: [] as any[] }),
    pluginIds.length
      ? supabase.from("reviews").select("plugin_id, rating").in("plugin_id", pluginIds)
      : Promise.resolve({ data: [] as any[] })
  ]);

  const usernameById = new Map<string, string>(
    (profiles ?? []).map((u: any) => [u.id, u.username ?? "Unknown"])
  );
  const ratingsByPlugin = new Map<string, { sum: number; count: number }>();
  (reviews ?? []).forEach((r: any) => {
    const pid = r.plugin_id;
    const cur = ratingsByPlugin.get(pid) ?? { sum: 0, count: 0 };
    cur.sum += Number(r.rating ?? 0);
    cur.count += 1;
    ratingsByPlugin.set(pid, cur);
  });

  const pluginsForGrid = basePlugins.map((p: any) => {
    const agg = ratingsByPlugin.get(p.id);
    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      tagline: p.tagline ?? "",
      cover_image_url: p.cover_image_url ?? null,
      seller_username: usernameById.get(p.seller_id) ?? "Unknown",
      rating: agg && agg.count ? agg.sum / agg.count : 0,
      price_cents: p.price_cents ?? 0,
      total_downloads: p.total_downloads ?? 0
    };
  });

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Ambient background decorations */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[-240px] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="absolute bottom-[-260px] left-[-120px] h-[520px] w-[520px] rounded-full bg-purple-500/10 blur-3xl" />
        <div className="absolute top-[140px] right-[-180px] h-[420px] w-[420px] rounded-full bg-fuchsia-500/10 blur-3xl" />
      </div>

      <main className="relative mx-auto w-full max-w-6xl px-6 py-14">
        {/* Hero */}
        <section className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-gray-800 bg-gray-900/40 px-4 py-2 text-sm text-gray-200">
            <span className="h-2 w-2 rounded-full bg-brand-500" />
            Developer-first commerce for Minecraft plugins
          </div>

          <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-tight text-gray-50 sm:text-5xl">
            Your storefront. Your licenses. Your plugins.
          </h1>

          <p className="mt-4 max-w-2xl text-gray-300">
            MCMerchant is built so you can market <span className="text-gray-100">yourself</span>—with a branded public storefront,
            Stripe payouts, license keys, and MCMerchantLoader so buyers stay current with all your updates.
            Whether you ship premium Paper or Spigot plugins or maintain a mix of free and paid jars, you get one place to explain
            what each release does, collect reviews, and prove that downloads match what you published. Buyers discover you through
            browse and search, then land on a storefront that feels like yours—not a generic listing buried in noise.
            Custom domains and deeper build-pipeline tooling are on the roadmap, and the core loop today is already built around how
            real servers operate: verify entitlement, deliver safely, and make upgrades boringly reliable.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <Link
              href="/browse"
              className="rounded-lg bg-brand-500 px-5 py-3 text-center font-medium text-gray-950 shadow-sm transition hover:brightness-110"
            >
              Browse marketplace
            </Link>
            <Link
              href="/signup"
              className="rounded-lg border border-gray-800 bg-gray-950 px-5 py-3 text-center font-medium text-gray-100 transition hover:border-gray-700"
            >
              Create account
            </Link>
            <Link
              href="/dashboard/storefront"
              className="rounded-lg border border-gray-800 bg-gray-950 px-5 py-3 text-center font-medium text-gray-100 transition hover:border-gray-700"
            >
              Build your storefront
            </Link>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              {
                title: "Branded storefront",
                desc: "A public /store page for your plugins, bio, and links—vanity URLs optional."
              },
              {
                title: "Licensing + delivery",
                desc: "Keys, verification, and signed downloads buyers can trust."
              },
              {
                title: "Auto-updates via loader",
                desc: "MCMerchantLoader keeps servers aligned with your latest semver releases."
              }
            ].map((c) => (
              <div
                key={c.title}
                className="rounded-xl border border-gray-800 bg-gray-950/20 p-4 backdrop-blur"
              >
                <h3 className="text-sm font-medium text-gray-100">{c.title}</h3>
                <p className="mt-2 text-sm text-gray-400">{c.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Platform pillars */}
        <section className="mt-14 rounded-2xl border border-gray-800 bg-gray-900/25 p-6">
          <h2 className="text-lg font-semibold text-gray-100">Built for developers who sell</h2>
          <p className="mt-2 text-sm text-gray-400">
            The marketplace is the discovery layer; your storefront is where fans anchor. Sellers keep changelogs, pricing, and
            support expectations in one coherent profile, while buyers compare plugins, read ratings, and follow a predictable path
            from checkout to download. Roadmap includes custom domains, CI-native uploads, and optional integrations with
            obfuscation or shrinking tools in your own pipeline, so you can keep using the compilers and guards you already trust.
            The goal is not to replace your Git workflow—it is to wrap the last mile of commerce, licensing, and delivery in
            something operators can depend on when a production server cannot afford mystery jars or manual drift.
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {[
              { t: "Storefront", d: "Share one link forever—even as you ship new jars." },
              { t: "License management", d: "Every purchase ties to a key to ensure only valid users can use your plugins." },
              { t: "Merchant Loader", d: "No more users asking how to update—the loader does it automatically." }
            ].map((x) => (
              <div key={x.t} className="rounded-xl border border-gray-800 bg-gray-950/30 p-4">
                <div className="text-sm font-semibold text-gray-100">{x.t}</div>
                <p className="mt-2 text-sm text-gray-400">{x.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Feature highlights */}
        <section className="mt-14 grid gap-4 lg:grid-cols-3">
          {[
            {
              title: "Instant payouts",
              desc: "Stripe Connect payouts for sellers with a smooth onboarding flow.",
              icon: (
                <svg className="h-5 w-5 text-brand-400" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M12 1v22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M17 5H9.5a3.5 3.5 0 000 7H14a3.5 3.5 0 010 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              )
            },
            {
              title: "Auto-update delivery",
              desc: "Download to /plugins with checksum verification and safe jar replacement.",
              icon: (
                <svg className="h-5 w-5 text-brand-400" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M21 15V6a2 2 0 00-2-2H5a2 2 0 00-2 2v9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M7 18l5-5 5 5" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
                  <path d="M12 13v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              )
            },
            {
              title: "License protection",
              desc: "Paid plugins require valid keys; revoked/expired licenses are enforced.",
              icon: (
                <svg className="h-5 w-5 text-brand-400" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M12 2l8 4v6c0 5-3.5 9.5-8 10-4.5-.5-8-5-8-10V6l8-4z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                  <path d="M9 12l2 2 4-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )
            }
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border border-gray-800 bg-gray-900/30 p-6">
              <div className="flex items-center gap-3">
                {f.icon}
                <h3 className="text-sm font-semibold text-gray-100">{f.title}</h3>
              </div>
              <p className="mt-3 text-sm text-gray-400">{f.desc}</p>
            </div>
          ))}
        </section>

        {/* Featured plugins gallery */}
        <section className="mt-14">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-100">
                {pluginsForGrid.length ? "Featured plugins" : "Plugins"}
              </h2>
              <p className="mt-1 text-sm text-gray-400">
                Curated picks—click a seller to open their full storefront. Each card links through to richer detail pages where
                you can inspect descriptions, version history, and community feedback before you commit budget or install
                something mission-critical on a live network.
              </p>
            </div>
            <Link href="/browse" className="text-sm text-brand-400 hover:underline">
              View all
            </Link>
          </div>

          <div className="mt-6 rounded-2xl border border-gray-800 bg-gray-950/20 p-6">
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

        {/* How it works */}
        <section className="mt-14">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-gray-100">How it works for seller-developers</h2>
            <div className="text-sm text-gray-400">A flow designed around real server ops</div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              {
                n: "1",
                title: "Verify & deliver",
                desc: "Your buyers download through a license-aware API for secure delivery."
              },
              {
                n: "2",
                title: "Stage updates",
                desc: "Updates land in a safe directory and checksum-verified before they’re applied."
              },
              {
                n: "3",
                title: "Stay current",
                desc: "Servers can check updates on an interval and notify admins when changes are ready."
              }
            ].map((step) => (
              <div
                key={step.n}
                className="rounded-2xl border border-gray-800 bg-gray-900/30 p-6"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/15 text-sm font-semibold text-brand-300">
                    {step.n}
                  </div>
                  <h3 className="text-sm font-semibold text-gray-100">{step.title}</h3>
                </div>
                <p className="mt-3 text-sm text-gray-400">{step.desc}</p>

                <div className="mt-4 rounded-xl border border-gray-800 bg-gray-950/20 p-3">
                  <div className="text-xs font-medium text-gray-200">Output</div>
                  <div className="mt-1 text-xs text-gray-400">
                    {step.n === "1"
                      ? "Download link guarded by a valid key"
                      : step.n === "2"
                        ? "Staged jar + restart instruction"
                        : "Admin notifications + console logs"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Long-form context for discovery & SEO */}
        <section className="mt-14 rounded-2xl border border-gray-800 bg-gray-950/15 p-6">
          <h2 className="text-lg font-semibold text-gray-100">For server owners buying Minecraft plugins</h2>
          <p className="mt-3 max-w-3xl text-sm text-gray-400 leading-relaxed">
            Running a multiplayer server means balancing performance, moderation, and a plugin stack that evolves with your
            community. A dedicated marketplace helps you compare alternatives with consistent pricing signals, visible version
            history, and peer reviews instead of guessing from forum threads alone. When licensing is explicit, you know whether
            your purchase covers one network or several machines, how renewals work, and what happens if you rebuild hardware or
            migrate hosts—questions that too often get answered only after something breaks in production.
          </p>
          <p className="mt-4 max-w-3xl text-sm text-gray-400 leading-relaxed">
            MCMerchant sits alongside the broader Paper and Spigot ecosystem: sellers still ship standard jars, and operators still
            choose their Java runtime, flags, and backup strategy. The platform adds a trustworthy commercial layer—keys, receipts,
            and update channels—so paid plugins do not rely on fragile manual links that expire or disappear from chat logs. If you
            maintain multiple environments, treat staging as the place to validate loader behavior, permissions, and compatibility
            before you roll the same semver tag to players who expect stability above all else.
          </p>
          <h3 className="mt-8 text-sm font-semibold text-gray-200">A practical checklist before you buy</h3>
          <ol className="mt-3 max-w-3xl list-decimal space-y-3 pl-5 text-sm text-gray-300 leading-relaxed">
            <li>
              Read the listing&apos;s description and recent changelog notes so you understand scope, dependencies, and whether the
              author supports your server software version.
            </li>
            <li>
              Confirm how licenses apply to your network topology—development boxes, proxies, and split worlds sometimes need
              explicit allowances from the seller&apos;s policy.
            </li>
            <li>
              After purchase, store your key and account email somewhere durable; you will need them for re-downloads and for the
              loader to prove entitlement automatically.
            </li>
            <li>
              Schedule updates during maintenance windows when possible, and keep backups even when checksums and staging make
              replacements safer than manual drag-and-drop alone.
            </li>
          </ol>
        </section>

        {/* Trust / developer-friendly story */}
        <section className="mt-14 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-gray-800 bg-gray-900/30 p-6">
            <h2 className="text-lg font-semibold text-gray-100">Built for dev velocity</h2>
            <p className="mt-2 text-sm text-gray-400">
              Stop re-inventing licensing UX. Ship versions like you ship code—repeatably, safely, and with upgrade visibility.
              When a server owner asks whether they are allowed to run your jar, the answer should come from the same system that
              issued their key, not from a scattered thread in Discord. When you revoke access or roll a hotfix, that signal should
              propagate without you hand-editing spreadsheets or guessing who paid for which tier last season.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                "Automatic staging and checksum validation",
                "Clean download endpoints for both free + paid",
                "Admin-first notifications with clear restart guidance",
                "A seller dashboard that matches how devs operate"
              ].map((t) => (
                <div key={t} className="flex items-start gap-3 rounded-xl border border-gray-800 bg-gray-950/20 p-4">
                  <svg className="mt-0.5 h-4 w-4 text-brand-400" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="text-sm text-gray-300">{t}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-800 bg-gray-950/20 p-6">
            <h3 className="text-sm font-semibold text-gray-100">What “secure updates” means here</h3>
            <p className="mt-3 text-sm text-gray-400 leading-relaxed">
              Secure delivery is the combination of authenticated downloads, checksum verification before a jar ever touches{" "}
              <code className="rounded bg-gray-900 px-1 py-0.5 text-xs text-gray-300">/plugins</code>, and clear operator messaging
              when a restart is required. It is not a promise that third-party code is bug-free—it is a promise that the file a
              buyer runs is the file you released under their license.
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-gray-300">
              <li>License checks gate paid artifacts; free listings can still use the same predictable download path.</li>
              <li>Staging folders and validation reduce the chance of half-written jars during interrupted transfers.</li>
              <li>Admins see actionable logs instead of silent failures when entitlement or network issues appear.</li>
            </ul>
          </div>
        </section>

        {/* Final CTA */}
        <section className="mt-14 rounded-2xl border border-gray-800 bg-gradient-to-r from-brand-500/15 via-purple-500/10 to-fuchsia-500/10 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-100">Own your developer brand on MCMerchant</h2>
              <p className="mt-2 text-sm text-gray-400">
                Spin up a storefront, publish plugins, and let MCMerchantLoader handle licensed delivery—so you stay focused on
                builds, changelogs, and community—not reinventing commerce infra. If you are evaluating a Minecraft plugin
                marketplace for the first time, start with a small paid or free listing, exercise the loader on a staging server,
                and confirm your semver cadence matches how your players experience change. If you are migrating from ad-hoc PayPal
                links, you will appreciate having receipts, keys, and download history in one place instead of scattered DMs.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="rounded-lg bg-brand-500 px-5 py-3 text-center font-medium text-gray-950 shadow-sm transition hover:brightness-110"
              >
                Get started
              </Link>
              <Link
                href="/dashboard/storefront"
                className="rounded-lg border border-gray-800 bg-gray-950 px-5 py-3 text-center font-medium text-gray-100 transition hover:border-gray-700"
              >
                Storefront settings
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
