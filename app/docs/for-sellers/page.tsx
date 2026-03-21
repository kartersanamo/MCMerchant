import Link from "next/link";
import { DocsToc, type DocsTocItem } from "@/components/docs-toc";

const toc: DocsTocItem[] = [
  { id: "overview", title: "Seller platform overview", group: "Getting started" },
  { id: "account-readiness", title: "Account readiness checklist", group: "Getting started" },
  { id: "storefront", title: "Storefront branding", group: "Storefront" },
  { id: "custom-domain", title: "Custom domain setup", group: "Storefront" },
  { id: "plugin-creation", title: "Create plugin listings", group: "Catalog" },
  { id: "versioning", title: "Version management", group: "Catalog" },
  { id: "release-playbook", title: "Release playbook", group: "Operations" },
  { id: "pricing", title: "Pricing strategy", group: "Operations" },
  { id: "payouts", title: "Stripe payouts", group: "Finance" },
  { id: "compliance", title: "Licensing & compliance", group: "Trust" },
  { id: "support", title: "Support workflow", group: "Trust" },
  { id: "metrics", title: "Growth metrics", group: "Growth" },
  { id: "faq", title: "Seller FAQ", group: "Reference" }
];

export default function SellerDocsPage() {
  return (
    <div className="docs-theme relative mx-auto w-full max-w-6xl px-6 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-80 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(139,92,246,0.24),rgba(15,23,42,0))]"
      />
      <div className="flex flex-col gap-8">
        <div className="docs-hero rounded-3xl border p-8 shadow-2xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-violet-300">Docs · For Sellers</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-50">
            Sell plugins with confidence on MCMerchant
          </h1>
          <p className="mt-3 max-w-3xl text-sm text-gray-300">
            End-to-end operational guide for storefront branding, releases, payouts, and long-term growth.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="#account-readiness" className="rounded-lg bg-violet-500 px-4 py-2 text-sm font-medium text-gray-950 hover:brightness-110">
              Start checklist
            </a>
            <a href="#release-playbook" className="rounded-lg border border-gray-700 bg-gray-950/40 px-4 py-2 text-sm font-medium text-gray-200 hover:border-gray-600">
              Release playbook
            </a>
            <a href="#custom-domain" className="rounded-lg border border-gray-700 bg-gray-950/40 px-4 py-2 text-sm font-medium text-gray-200 hover:border-gray-600">
              Custom domains
            </a>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-12">
          <div className="md:col-span-4 md:self-start lg:col-span-3">
            <div className="docs-toc-shell rounded-2xl border p-2">
              <DocsToc items={toc} defaultGroup="Getting started" title="Seller guide topics" />
            </div>
          </div>

          <div className="md:col-span-8 lg:col-span-9">
            <div className="docs-content space-y-10">
              <section id="overview" className="scroll-mt-28">
                <h2 className="text-xl font-semibold text-gray-50">Seller platform overview</h2>
                <p className="mt-2 text-sm text-gray-300">
                  MCMerchant is built around your brand: a public storefront, reliable licensing, version delivery, and payout rails.
                </p>
              </section>

              <section id="account-readiness" className="scroll-mt-28">
                <h2 className="text-xl font-semibold text-gray-50">Account readiness checklist</h2>
                <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-gray-300">
                  <li>Verify your email to unlock storefront and publish tools.</li>
                  <li>Set your storefront identity (title, tagline, icon, links).</li>
                  <li>Connect Stripe and complete onboarding for transfers.</li>
                  <li>Publish at least one plugin + one version before promoting your store.</li>
                </ol>
              </section>

              <section id="storefront" className="scroll-mt-28">
                <h2 className="text-xl font-semibold text-gray-50">Storefront branding</h2>
                <p className="mt-2 text-sm text-gray-300">
                  Your storefront should explain what you build, who it is for, and how users get help.
                </p>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-gray-300">
                  <li>Use a clear store title and one-line value proposition.</li>
                  <li>Keep your bio practical: compatibility, support policy, update cadence.</li>
                  <li>Prefer stable icon/banner assets to avoid broken visuals on share cards.</li>
                </ul>
              </section>

              <section id="custom-domain" className="scroll-mt-28">
                <h2 className="text-xl font-semibold text-gray-50">Custom domain setup</h2>
                <p className="mt-2 text-sm text-gray-300">
                  Use a hostname like <code>store.yourdomain.com</code>. Then set DNS challenge records and verify in dashboard.
                </p>
                <div className="mt-4 rounded-xl border border-gray-800/80 bg-gray-950/30 p-4">
                  <ol className="list-decimal space-y-1 pl-5 text-sm text-gray-300">
                    <li>Save your custom domain in storefront settings.</li>
                    <li>Add CNAME to your app host and TXT challenge token.</li>
                    <li>Click <code>Verify custom domain</code> in dashboard.</li>
                    <li>Wait for status <code>verified</code>.</li>
                  </ol>
                </div>
              </section>

              <section id="plugin-creation" className="scroll-mt-28">
                <h2 className="text-xl font-semibold text-gray-50">Create plugin listings</h2>
                <p className="mt-2 text-sm text-gray-300">
                  High-performing listings combine strong copy, trustworthy screenshots, and explicit compatibility info.
                </p>
              </section>

              <section id="versioning" className="scroll-mt-28">
                <h2 className="text-xl font-semibold text-gray-50">Version management</h2>
                <p className="mt-2 text-sm text-gray-300">
                  Keep semver consistent. Mark exactly one version as latest. Use changelogs that explain migration risk.
                </p>
              </section>

              <section id="release-playbook" className="scroll-mt-28">
                <h2 className="text-xl font-semibold text-gray-50">Release playbook</h2>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-gray-300">
                  <li>Smoke test on target server versions before upload.</li>
                  <li>Upload jar with final filename buyers should receive.</li>
                  <li>Publish changelog with breaking changes at top.</li>
                  <li>Validate signed download and loader update path.</li>
                </ul>
              </section>

              <section id="pricing" className="scroll-mt-28">
                <h2 className="text-xl font-semibold text-gray-50">Pricing strategy</h2>
                <p className="mt-2 text-sm text-gray-300">
                  Price for support burden, update frequency, and category competition. Revisit pricing after reliability milestones.
                </p>
              </section>

              <section id="payouts" className="scroll-mt-28">
                <h2 className="text-xl font-semibold text-gray-50">Stripe payouts</h2>
                <p className="mt-2 text-sm text-gray-300">
                  Payout eligibility depends on Stripe account capabilities. If checkout is unavailable, complete onboarding in payouts dashboard.
                </p>
              </section>

              <section id="compliance" className="scroll-mt-28">
                <h2 className="text-xl font-semibold text-gray-50">Licensing & compliance</h2>
                <p className="mt-2 text-sm text-gray-300">
                  Keep licensing terms clear and enforceable. Avoid ambiguous refund/support promises in public descriptions.
                </p>
              </section>

              <section id="support" className="scroll-mt-28">
                <h2 className="text-xl font-semibold text-gray-50">Support workflow</h2>
                <p className="mt-2 text-sm text-gray-300">
                  Publish response-time expectations and direct users to one canonical support channel (Discord or issue tracker).
                </p>
              </section>

              <section id="metrics" className="scroll-mt-28">
                <h2 className="text-xl font-semibold text-gray-50">Growth metrics</h2>
                <p className="mt-2 text-sm text-gray-300">
                  Track listing conversion, review momentum, refund incidence, and release adoption to decide roadmap priorities.
                </p>
              </section>

              <section id="faq" className="scroll-mt-28">
                <h2 className="text-xl font-semibold text-gray-50">Seller FAQ</h2>
                <details className="rounded-xl border border-gray-800/80 bg-gray-950/30 p-4">
                  <summary className="cursor-pointer text-sm font-semibold text-gray-200">
                    Should I use one storefront for all plugins?
                  </summary>
                  <p className="mt-2 text-sm text-gray-300">
                    Yes. A single storefront compounds trust, reviews, and repeat buyer recognition.
                  </p>
                </details>
              </section>

              <div className="text-sm text-gray-500">
                <Link href="/docs" className="underline underline-offset-4">Back to docs hub</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
