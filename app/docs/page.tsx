import Link from "next/link";

export default function DocsPage() {
  return (
    <div className="docs-theme relative mx-auto w-full max-w-6xl px-6 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-80 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(16,185,129,0.25),rgba(15,23,42,0))]"
      />
      <div className="flex flex-col gap-8">
        <div className="docs-hero rounded-3xl border p-8 shadow-2xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-300">Docs</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-50">
            Choose your MCMerchant docs path
          </h1>
          <p className="mt-3 max-w-3xl text-sm text-gray-300">
            Complete guides for every role: server owners using MCMerchantLoader, creators selling plugins,
            and players buying/downloading safely.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/docs/loader"
              className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-gray-950 transition hover:brightness-110"
            >
              Loader docs
            </Link>
            <Link
              href="/docs/for-sellers"
              className="rounded-lg border border-gray-800 bg-gray-950/40 px-4 py-2 text-sm font-medium text-gray-200 hover:border-gray-700"
            >
              Seller docs
            </Link>
            <Link
              href="/docs/for-buyers"
              className="rounded-lg border border-gray-800 bg-gray-950/40 px-4 py-2 text-sm font-medium text-gray-200 hover:border-gray-700"
            >
              Buyer docs
            </Link>
          </div>
        </div>

        <section className="rounded-2xl border border-slate-800/80 bg-slate-900/45 p-6">
          <h2 className="text-xl font-semibold text-emerald-300">Documentation paths</h2>
          <p className="mt-2 text-sm text-slate-300">
            Each path is fully focused and has its own sticky sidebar navigation.
          </p>

          <div className="mt-6 grid gap-5 md:grid-cols-3">
            <Link
              href="/docs/loader"
              className="group rounded-2xl border border-slate-700/80 bg-gradient-to-b from-emerald-500/15 to-slate-950/70 p-5 transition hover:border-emerald-400/40 hover:shadow-lg hover:shadow-emerald-900/25"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-300">MCMerchant Loader</p>
              <h3 className="mt-2 text-lg font-semibold text-slate-100">For server owners</h3>
              <p className="mt-2 text-sm text-slate-300">
                Setup, config, commands, update lifecycle, API behavior, checksum integrity, and ops troubleshooting.
              </p>
              <p className="mt-4 text-sm font-medium text-emerald-200 group-hover:text-emerald-100">
                Open loader docs →
              </p>
            </Link>

            <Link
              href="/docs/for-sellers"
              className="group rounded-2xl border border-slate-700/80 bg-gradient-to-b from-violet-500/15 to-slate-950/70 p-5 transition hover:border-violet-400/40 hover:shadow-lg hover:shadow-violet-900/25"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-violet-300">For Sellers</p>
              <h3 className="mt-2 text-lg font-semibold text-slate-100">Publish and grow</h3>
              <p className="mt-2 text-sm text-slate-300">
                Storefront branding, versions, pricing, payouts, release workflow, and custom-domain verification.
              </p>
              <p className="mt-4 text-sm font-medium text-violet-200 group-hover:text-violet-100">
                Open seller docs →
              </p>
            </Link>

            <Link
              href="/docs/for-buyers"
              className="group rounded-2xl border border-slate-700/80 bg-gradient-to-b from-cyan-500/15 to-slate-950/70 p-5 transition hover:border-cyan-400/40 hover:shadow-lg hover:shadow-cyan-900/25"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-cyan-300">For Buyers</p>
              <h3 className="mt-2 text-lg font-semibold text-slate-100">Buy with confidence</h3>
              <p className="mt-2 text-sm text-slate-300">
                Discovery, checkout, license keys, download routes, account tools, and support-first problem solving.
              </p>
              <p className="mt-4 text-sm font-medium text-cyan-200 group-hover:text-cyan-100">
                Open buyer docs →
              </p>
            </Link>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800/80 bg-slate-900/35 p-6">
          <h2 className="text-xl font-semibold text-slate-100">Quick links</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Link href="/loader/install" className="rounded-lg border border-slate-700 bg-slate-950/50 px-4 py-3 text-sm text-slate-200 hover:border-slate-600">
              Download loader installer
            </Link>
            <Link href="/dashboard/storefront" className="rounded-lg border border-slate-700 bg-slate-950/50 px-4 py-3 text-sm text-slate-200 hover:border-slate-600">
              Seller storefront dashboard
            </Link>
            <Link href="/browse" className="rounded-lg border border-slate-700 bg-slate-950/50 px-4 py-3 text-sm text-slate-200 hover:border-slate-600">
              Browse marketplace
            </Link>
            <Link href="/account/licenses" className="rounded-lg border border-slate-700 bg-slate-950/50 px-4 py-3 text-sm text-slate-200 hover:border-slate-600">
              Manage licenses
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

