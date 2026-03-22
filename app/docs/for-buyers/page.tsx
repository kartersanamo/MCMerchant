import Link from "next/link";
import { DocsToc, type DocsTocItem } from "@/components/docs-toc";
import { SUPPORT_DISCORD_URL } from "@/lib/app-url";

const toc: DocsTocItem[] = [
  { id: "overview", title: "Buyer experience overview", group: "Getting started" },
  { id: "finding-plugins", title: "Finding the right plugin", group: "Discovery" },
  { id: "evaluating-quality", title: "Evaluating quality", group: "Discovery" },
  { id: "checkout", title: "Checkout flow", group: "Purchasing" },
  { id: "licenses", title: "Licenses and access", group: "Purchasing" },
  { id: "downloads", title: "Downloads and updates", group: "Usage" },
  { id: "loader", title: "Using MCMerchantLoader", group: "Usage" },
  { id: "account-tools", title: "Account tools", group: "Account" },
  { id: "refunds", title: "Refund and support expectations", group: "Support" },
  { id: "security", title: "Security best practices", group: "Safety" },
  { id: "troubleshooting", title: "Troubleshooting", group: "Support" },
  { id: "faq", title: "Buyer FAQ", group: "Reference" }
];

export default function BuyerDocsPage() {
  return (
    <div className="docs-theme relative mx-auto w-full max-w-6xl px-6 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-80 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(34,211,238,0.24),rgba(15,23,42,0))]"
      />
      <div className="flex flex-col gap-8">
        <div className="docs-hero rounded-3xl border p-8 shadow-2xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-cyan-300">Docs · For Buyers</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-50">
            Buy, install, and manage plugins safely
          </h1>
          <p className="mt-3 max-w-3xl text-sm text-gray-300">
            A complete buyer guide: from discovering plugins to license management and secure downloads.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="#finding-plugins" className="rounded-lg bg-cyan-400 px-4 py-2 text-sm font-medium text-gray-950 hover:brightness-110">
              Discovery guide
            </a>
            <a href="#checkout" className="rounded-lg border border-gray-700 bg-gray-950/40 px-4 py-2 text-sm font-medium text-gray-200 hover:border-gray-600">
              Checkout flow
            </a>
            <a href="#troubleshooting" className="rounded-lg border border-gray-700 bg-gray-950/40 px-4 py-2 text-sm font-medium text-gray-200 hover:border-gray-600">
              Troubleshooting
            </a>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-12">
          <div className="md:col-span-4 md:self-start lg:col-span-3">
            <div className="docs-toc-shell rounded-2xl border p-2">
              <DocsToc items={toc} defaultGroup="Getting started" title="Buyer guide topics" />
            </div>
          </div>

          <div className="md:col-span-8 lg:col-span-9">
            <div className="docs-content space-y-10">
              <section id="overview" className="scroll-mt-28">
                <h2 className="text-xl font-semibold text-gray-50">Buyer experience overview</h2>
                <p className="mt-2 text-sm text-gray-300">
                  MCMerchant purchase flow is designed for clear ownership: one account, one license system, secure downloads.
                </p>
              </section>

              <section id="finding-plugins" className="scroll-mt-28">
                <h2 className="text-xl font-semibold text-gray-50">Finding the right plugin</h2>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-gray-300">
                  <li>Use category + compatibility filters before comparing by price.</li>
                  <li>Check seller storefront quality and release history.</li>
                  <li>Prioritize plugins with clear changelog and support channel.</li>
                </ul>
              </section>

              <section id="evaluating-quality" className="scroll-mt-28">
                <h2 className="text-xl font-semibold text-gray-50">Evaluating quality</h2>
                <p className="mt-2 text-sm text-gray-300">
                  Review depth matters more than raw star count. Focus on update cadence, compatibility claims, and seller responses.
                </p>
              </section>

              <section id="checkout" className="scroll-mt-28">
                <h2 className="text-xl font-semibold text-gray-50">Checkout flow</h2>
                <p className="mt-2 text-sm text-gray-300">
                  Checkout uses Stripe with seller-connected payouts. On success, purchases appear in your account and licenses are issued.
                </p>
              </section>

              <section id="licenses" className="scroll-mt-28">
                <h2 className="text-xl font-semibold text-gray-50">Licenses and access</h2>
                <p className="mt-2 text-sm text-gray-300">
                  License keys are tied to account purchases. Keep keys private and avoid posting them in public channels.
                </p>
              </section>

              <section id="downloads" className="scroll-mt-28">
                <h2 className="text-xl font-semibold text-gray-50">Downloads and updates</h2>
                <p className="mt-2 text-sm text-gray-300">
                  You can download manually from account routes or automate update checks via MCMerchantLoader for licensed plugins.
                </p>
              </section>

              <section id="loader" className="scroll-mt-28">
                <h2 className="text-xl font-semibold text-gray-50">Using MCMerchantLoader</h2>
                <p className="mt-2 text-sm text-gray-300">
                  If you run a server, configure `mcmerchant.yml` with plugin ID, license key, and current version for each purchase.
                </p>
                <p className="mt-2 text-sm text-gray-300">
                  Full technical setup is in <Link href="/docs/loader" className="underline">Loader docs</Link>.
                </p>
              </section>

              <section id="account-tools" className="scroll-mt-28">
                <h2 className="text-xl font-semibold text-gray-50">Account tools</h2>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-gray-300">
                  <li><code>/account/purchases</code> for order history</li>
                  <li><code>/account/licenses</code> for license lookup and usage</li>
                  <li><code>/account</code> for profile and password settings</li>
                </ul>
              </section>

              <section id="refunds" className="scroll-mt-28">
                <h2 className="text-xl font-semibold text-gray-50">Refund and support expectations</h2>
                <p className="mt-2 text-sm text-gray-300">
                  Each seller defines support and refund policies. Contact seller support first with reproducible issue details.
                </p>
              </section>

              <section id="security" className="scroll-mt-28">
                <h2 className="text-xl font-semibold text-gray-50">Security best practices</h2>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-gray-300">
                  <li>Never share license keys publicly.</li>
                  <li>Use strong unique account passwords.</li>
                  <li>Download only from official MCMerchant routes.</li>
                </ul>
              </section>

              <section id="troubleshooting" className="scroll-mt-28">
                <h2 className="text-xl font-semibold text-gray-50">Troubleshooting</h2>
                <div className="space-y-3">
                  <div className="rounded-xl border border-gray-800/80 bg-gray-950/30 p-4">
                    <p className="text-sm font-semibold text-gray-200">Purchase succeeded but license missing</p>
                    <p className="mt-1 text-sm text-gray-300">
                      Wait a moment, then refresh Purchases and Licenses. If it still doesn’t appear,{" "}
                      <a
                        href={SUPPORT_DISCORD_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-300 underline-offset-4 hover:text-cyan-200 hover:underline"
                      >
                        open a support ticket on Discord
                      </a>
                      .
                    </p>
                  </div>
                  <div className="rounded-xl border border-gray-800/80 bg-gray-950/30 p-4">
                    <p className="text-sm font-semibold text-gray-200">Can’t download</p>
                    <p className="mt-1 text-sm text-gray-300">Confirm you are logged in with a verified email and have a valid license for paid plugins.</p>
                  </div>
                </div>
              </section>

              <section id="faq" className="scroll-mt-28">
                <h2 className="text-xl font-semibold text-gray-50">Buyer FAQ</h2>
                <details className="rounded-xl border border-gray-800/80 bg-gray-950/30 p-4">
                  <summary className="cursor-pointer text-sm font-semibold text-gray-200">
                    Do I need MCMerchantLoader to use purchased plugins?
                  </summary>
                  <p className="mt-2 text-sm text-gray-300">
                    No. Loader is optional automation. You can always download and install manually.
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
