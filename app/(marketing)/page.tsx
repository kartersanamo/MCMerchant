import Link from "next/link";
import { PluginGrid } from "@/components/plugin-grid";

// Completely static - serve the page from cache without any database queries
export const dynamic = 'force-static';
export const revalidate = false;

export default function LandingPage() {
  // No database queries - page loads instantly
  const pluginsForGrid: any[] = [];

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
            Your storefront. Your licenses. Your update channel.
          </h1>

          <p className="mt-4 max-w-2xl text-gray-300">
            MCMerchant is built so you market <span className="text-gray-100">you</span>—a branded public storefront,
            Stripe payouts, license keys, and MCMerchantLoader so buyers stay current without hunting Discord threads.
            Custom domains and deeper build-pipeline tooling are on the roadmap.
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

          <div className="mt-8 overflow-hidden rounded-2xl border border-gray-800 bg-gray-950/30">
            <div className="flex items-center justify-between gap-4 border-b border-gray-800 bg-gray-900/20 px-4 py-3">
              <div className="text-sm font-medium text-gray-200">Example update check flow</div>
              <div className="text-xs text-gray-500">Copy/paste friendly</div>
            </div>
            <pre className="overflow-x-auto p-4 text-xs leading-relaxed text-gray-200">
{`curl -G "https://mcmmerchant.net/api/v1/plugins/<pluginId>/latest" \\
  -H "X-License-Key: <PDEX-XXXX-XXXX-XXXX-XXXX>" \\
  -H "X-Plugin-Version: 1.0.0" \\
  -H "X-Minecraft-Version: 1.21.11" \\
  -H "X-Server-Software: Paper"`}
            </pre>
          </div>
        </section>

        {/* Platform pillars */}
        <section className="mt-14 rounded-2xl border border-gray-800 bg-gray-900/25 p-6">
          <h2 className="text-lg font-semibold text-gray-100">Built for developers who sell</h2>
          <p className="mt-2 text-sm text-gray-400">
            The marketplace is the discovery layer; your storefront is where fans anchor. Roadmap includes custom domains,
            CI-native uploads, and optional integrations with obfuscation / shrinking tools in your own pipeline.
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {[
              { t: "Storefront", d: "Share one link forever—even as you ship new jars." },
              { t: "License graph", d: "Every purchase ties to a key—revoke, rotate, and audit from one system." },
              { t: "Updater as product", d: "Fewer “how do I update?” tickets; loader + API do the boring work." }
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
                Curated picks—click a seller to open their full storefront.
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

        {/* Trust / developer-friendly story */}
        <section className="mt-14 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-gray-800 bg-gray-900/30 p-6">
            <h2 className="text-lg font-semibold text-gray-100">Built for dev velocity</h2>
            <p className="mt-2 text-sm text-gray-400">
              Stop re-inventing licensing UX. Ship versions like you ship code—repeatably, safely, and with upgrade visibility.
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
            <h3 className="text-sm font-semibold text-gray-100">What developers say</h3>
            <div className="mt-4 space-y-4">
              {[
                {
                  quote: "We can focus on releases instead of support tickets about “where’s the update?”",
                  by: "Server-side plugin maintainer"
                },
                {
                  quote: "The staging flow + checksums are exactly what we want for safe upgrades.",
                  by: "Indie developer"
                }
              ].map((q) => (
                <blockquote key={q.by} className="rounded-xl border border-gray-800 bg-gray-900/30 p-4">
                  <p className="text-sm text-gray-300 leading-relaxed">“{q.quote}”</p>
                  <footer className="mt-2 text-xs text-gray-500">{q.by}</footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="mt-14 rounded-2xl border border-gray-800 bg-gradient-to-r from-brand-500/15 via-purple-500/10 to-fuchsia-500/10 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-100">Own your developer brand on MCMerchant</h2>
              <p className="mt-2 text-sm text-gray-400">
                Spin up a storefront, publish plugins, and let MCMerchantLoader handle licensed delivery—so you stay focused on
                builds, changelogs, and community—not reinventing commerce infra.
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
