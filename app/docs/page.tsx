import Link from "next/link";
import { DocsToc, type DocsTocItem } from "@/components/docs-toc";

const toc: DocsTocItem[] = [
  { id: "overview", title: "What MCMerchantLoader is", group: "Getting started" },
  { id: "quickstart", title: "Quick start (3 minutes)", group: "Getting started" },
  { id: "install", title: "Installation", group: "Getting started" },
  { id: "config", title: "mcmerchant.yml reference", group: "Configuration" },
  { id: "plugins-array", title: "plugins array format", group: "Configuration" },
  { id: "commands", title: "Commands: /pdex", group: "Operations" },
  { id: "status-indicators", title: "Status indicators in /pdex", group: "Operations" },
  { id: "notifications", title: "In-game notifications", group: "Operations" },
  { id: "update-flow", title: "Update check flow", group: "How it works" },
  { id: "semver", title: "Versioning & semver rules", group: "How it works" },
  { id: "scheduler", title: "Scheduler timing + retries", group: "How it works" },
  { id: "timeouts-cache", title: "HTTP timeouts + caching", group: "How it works" },
  { id: "download-replace", title: "Download + jar replacement", group: "How it works" },
  { id: "jar-tracker", title: "download-trackers behavior", group: "How it works" },
  { id: "integrity", title: "SHA-256 integrity verification", group: "How it works" },
  { id: "api", title: "MCMerchant API endpoints", group: "How it works" },
  { id: "api-headers", title: "API request headers", group: "How it works" },
  { id: "api-response", title: "API response fields", group: "How it works" },
  { id: "local-dev", title: "Local development guide", group: "How it works" },
  { id: "troubleshooting", title: "Troubleshooting", group: "Troubleshooting" },
  { id: "debug-console", title: "Debugging checklist", group: "Troubleshooting" },
  { id: "stripe-webhooks", title: "Stripe webhook notes", group: "Troubleshooting" },
  { id: "server-platform", title: "server_platform column (optional)", group: "Troubleshooting" },
  { id: "developer-platform", title: "Developer brand & storefront", group: "Web app" },
  { id: "seller-versions", title: "Seller: managing versions", group: "Web app" },
  { id: "seller-upload", title: "Seller: upload + metadata", group: "Web app" },
  { id: "webapp-version-api", title: "Web app: edit/delete versions", group: "Web app" },
  { id: "supabase-schema", title: "Supabase schema overview", group: "Reference" },
  { id: "storage-buckets", title: "Storage buckets + filenames", group: "Reference" },
  { id: "security", title: "Security & best practices", group: "Reference" },
  { id: "release-checklist", title: "Release checklist", group: "Reference" },
  { id: "faq", title: "FAQ", group: "Reference" }
];

export default function DocsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <div className="flex flex-col gap-6">
        <div className="rounded-2xl border border-gray-800/80 bg-gradient-to-b from-brand-500/10 to-gray-950/20 p-8 shadow-lg shadow-black/20">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-300">Docs</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-50">
            MCMerchant documentation: storefronts, licensing, loader, and updates
          </h1>
          <p className="mt-3 max-w-3xl text-sm text-gray-300">
            Everything you need to run MCMerchantLoader on your Minecraft server, sell under your own developer brand,
            and publish versions—organized for fast scanning and copy-paste friendly examples.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <a
              href="#quickstart"
              className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-gray-950 transition hover:brightness-110"
            >
              Start here
            </a>
            <a
              href="#config"
              className="rounded-lg border border-gray-800 bg-gray-950/40 px-4 py-2 text-sm font-medium text-gray-200 hover:border-gray-700"
            >
              mcmerchant.yml config
            </a>
            <a
              href="#troubleshooting"
              className="rounded-lg border border-gray-800 bg-gray-950/40 px-4 py-2 text-sm font-medium text-gray-200 hover:border-gray-700"
            >
              Troubleshooting
            </a>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-12">
          <div className="md:col-span-4 lg:col-span-3">
            <DocsToc items={toc} defaultGroup="Docs" title="Search + TOC" />
          </div>

          <div className="md:col-span-8 lg:col-span-9">
            <div className="space-y-10">
              <section id="overview" className="scroll-mt-28">
                <h2 className="text-xl font-semibold text-gray-50">What MCMerchantLoader is</h2>
                <p className="mt-2 text-sm text-gray-300">
                  MCMerchantLoader is a Bukkit/Paper plugin that automates checking your purchased plugins for
                  updates on MCMerchant.net and (optionally) downloading them into your server’s <code>/plugins</code>{" "}
                  folder.
                </p>
                <div className="mt-4 rounded-xl border border-gray-800/80 bg-gray-950/30 p-4">
                  <p className="text-sm font-medium text-gray-200">Key features</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-300">
                    <li>Periodic update checks while the server is running.</li>
                    <li>Validates license state via MCMerchant API.</li>
                    <li>Optional automatic download with SHA-256 verification.</li>
                    <li>In-game admin notifications with direct “purchases” links.</li>
                    <li>Clean jar replacement (keeps original filenames uploaded on the website).</li>
                  </ul>
                </div>
              </section>

              <section id="quickstart" className="scroll-mt-28">
                <h2 className="text-xl font-semibold text-gray-50">Quick start (3 minutes)</h2>
                <ol className="mt-2 list-decimal space-y-3 pl-5 text-sm text-gray-300">
                  <li>
                    Install <code>MCMerchantLoader-1.0.0.jar</code> (or your current version) into your server’s plugin folder.
                    On first run, it creates <code>mcmerchant.yml</code> automatically.
                  </li>
                  <li>
                    Open <code>mcmerchant.yml</code> and add one entry per purchased plugin: <code>plugin-id</code>,{" "}
                    <code>license-key</code>, and <code>current-version</code>.
                  </li>
                  <li>
                    Run <code>/pdex reload</code> and then <code>/pdex check</code>. If you enabled{" "}
                    <code>notify-on-join</code> / <code>notify-in-console</code>, results show in console and in-game.
                  </li>
                </ol>
              </section>

              <section id="install" className="scroll-mt-28">
                <h2 className="text-xl font-semibold text-gray-50">Installation</h2>
                <p className="mt-2 text-sm text-gray-300">
                  Drop the loader jar into <code>/plugins</code>, start/restart your server, then edit{" "}
                  <code>mcmerchant.yml</code>.
                </p>
                <div className="mt-4 rounded-xl border border-gray-800/80 bg-gray-950/30 p-4">
                  <p className="text-sm font-medium text-gray-200">What the loader creates</p>
                  <p className="mt-1 text-sm text-gray-300">
                    On first enable, it creates a <code>mcmerchant.yml</code> in the plugin’s data directory by copying the built-in
                    template. It also logs that you should add keys and run <code>/pdex reload</code>.
                  </p>
                </div>
              </section>

              <section id="config" className="scroll-mt-28">
                <h2 className="text-xl font-semibold text-gray-50">mcmerchant.yml reference</h2>
                <p className="mt-2 text-sm text-gray-300">
                  This file controls how MCMerchantLoader checks for updates and how it fetches update metadata.
                </p>
                <div className="mt-4 overflow-auto rounded-xl border border-gray-800/80 bg-black/30 p-4">
                  <pre className="text-xs text-gray-200">
                    <code>{`# How often to check for updates while the server is running.
# Minimum: 1. Recommended: 6.
check-interval-hours: 6

# Whether to automatically download updates into your server’s /plugins folder.
# If you download, you must restart the server to apply the update.
auto-download: false

# Base URL for the MCMerchant API used by this loader.
api-base-url: "https://mcmmerchant.net/api"

# Base URL used for links shown to admins (e.g. purchases dashboard).
app-base-url: "https://mcmmerchant.net"

# Whether to notify admins (with mcmerchant.updates permission) when an update is available.
notify-on-join: true

# Whether to print update results to the server console.
notify-in-console: true

# Licensed plugins
plugins:
  # One entry per purchased plugin.
  # - name: "SuperEconomy"
  #   plugin-id: "abc-123-def-456"
  #   license-key: "PDEX-XXXX-XXXX-XXXX-XXXX"
  #   current-version: "1.0.0"
  #   auto-download: false
`}</code>
                  </pre>
                </div>
                <p className="mt-3 text-xs text-gray-500">
                  Note: the built-in template comment mentions <code>/plugins/update/</code>, but the loader actually downloads
                  directly into <code>/plugins</code> with the original uploaded filename (so it can replace cleanly).
                </p>
              </section>

              <section id="plugins-array" className="scroll-mt-28">
                <h2 className="text-xl font-semibold text-gray-50">plugins array format</h2>
                <p className="mt-2 text-sm text-gray-300">
                  Each list item must contain at least a valid <code>plugin-id</code> and <code>license-key</code>. Optional fields
                  control update behavior for that plugin specifically.
                </p>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-gray-800/80 bg-gray-950/30 p-4">
                    <p className="text-sm font-medium text-gray-200">Required</p>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-300">
                      <li><code>plugin-id</code>: the MCMerchant plugin UUID/string.</li>
                      <li><code>license-key</code>: the purchase license key.</li>
                    </ul>
                  </div>
                  <div className="rounded-xl border border-gray-800/80 bg-gray-950/30 p-4">
                    <p className="text-sm font-medium text-gray-200">Common options</p>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-300">
                      <li><code>name</code>: shown in logs and chat.</li>
                      <li><code>current-version</code>: used to compare semver.</li>
                      <li><code>auto-download</code>: per-plugin override for downloads.</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-gray-800/80 bg-gray-950/30 p-4">
                  <p className="text-sm font-medium text-gray-200">Example</p>
                  <div className="mt-3 overflow-auto rounded-lg bg-black/30 p-4">
                    <pre className="text-xs text-gray-200">
                      <code>{`plugins:
  - name: "SuperEconomy"
    plugin-id: "abc-123-def-456"
    license-key: "PDEX-XXXX-XXXX-XXXX-XXXX"
    current-version: "1.0.0"
    auto-download: false

  - name: "Bedwars"
    plugin-id: "bedwars-uuid"
    license-key: "PDEX-YYYY-YYYY-YYYY-YYYY"
    current-version: "2.3.1"
    auto-download: true
`}</code>
                    </pre>
                  </div>
                </div>
              </section>

              <section id="commands" className="scroll-mt-28">
                <h2 className="text-xl font-semibold text-gray-50">Commands: /pdex</h2>
                <p className="mt-2 text-sm text-gray-300">
                  The command is registered as <code>/pdex</code> and is guarded by the <code>mcmerchant.admin</code> permission.
                </p>

                <div className="mt-4 space-y-4 rounded-2xl border border-gray-800/80 bg-gray-950/30 p-6">
                  <div>
                    <p className="text-sm font-semibold text-gray-200">/pdex check</p>
                    <p className="mt-1 text-sm text-gray-300">
                      Runs checks for all configured plugins immediately, asynchronously. Results are printed in console and handled
                      by the notifier (in-game if enabled).
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-200">/pdex status</p>
                    <p className="mt-1 text-sm text-gray-300">
                      Shows a status summary for each configured plugin: up-to-date, update available, downloaded (restart
                      to apply), license errors, and network errors.
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-200">/pdex reload</p>
                    <p className="mt-1 text-sm text-gray-300">
                      Reloads <code>mcmerchant.yml</code> and restarts the scheduler. Use this after changing license keys or api/app URLs.
                    </p>
                  </div>
                </div>
              </section>

              <section id="notifications" className="scroll-mt-28">
                <h2 className="text-xl font-semibold text-gray-50">In-game notifications</h2>
                <p className="mt-2 text-sm text-gray-300">
                  When <code>notify-on-join</code> is enabled, the loader will notify online admins (players with{" "}
                  <code>mcmerchant.updates</code>) when an update is pending.
                </p>

                <div className="mt-4 rounded-xl border border-gray-800/80 bg-gray-950/30 p-4">
                  <p className="text-sm font-medium text-gray-200">What admins see</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-300">
                    <li>
                      Each pending update is shown as <code>name -&gt; vX.Y.Z</code>.
                    </li>
                    <li>If downloaded, they are told to restart to apply.</li>
                    <li>If not downloaded, they get a link to purchases (uses your configured <code>app-base-url</code>).</li>
                    <li>The console output is controlled independently by <code>notify-in-console</code>.</li>
                  </ul>
                </div>
              </section>

              <section id="update-flow" className="scroll-mt-28">
                <h2 className="text-xl font-semibold text-gray-50">Update check flow</h2>
                <p className="mt-2 text-sm text-gray-300">
                  Each plugin entry maintains a small state machine in memory. Every <code>check-interval-hours</code>, it performs:
                </p>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-gray-800/80 bg-gray-950/30 p-4">
                    <p className="text-sm font-medium text-gray-200">Step-by-step</p>
                    <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-gray-300">
                      <li>Call MCMerchant API to get the “latest” version metadata.</li>
                      <li>Compare <code>current-version</code> to the API’s semver version.</li>
                      <li>Set result status: up-to-date vs update-available.</li>
                      <li>Optionally download the new jar if downloads are enabled.</li>
                      <li>Notify admins / print console output.</li>
                    </ol>
                  </div>

                  <div className="rounded-xl border border-gray-800/80 bg-gray-950/30 p-4">
                    <p className="text-sm font-medium text-gray-200">Licensing outcomes</p>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-300">
                      <li><code>401/403</code> map to invalid/revoked/expired licenses.</li>
                      <li><code>404</code> indicates the plugin id was not found.</li>
                      <li><code>429</code> indicates rate limiting.</li>
                      <li>Network errors show as “could not reach API”.</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section id="download-replace" className="scroll-mt-28">
                <h2 className="text-xl font-semibold text-gray-50">Download + jar replacement</h2>
                <p className="mt-2 text-sm text-gray-300">
                  If <code>auto-download</code> is enabled (globally or per entry), and an update is available, MCMerchant downloads the jar into
                  your <code>/plugins</code> folder.
                </p>

                <div className="mt-4 rounded-2xl border border-gray-800/80 bg-gray-950/30 p-6">
                  <p className="text-sm font-medium text-gray-200">How filenames work</p>
                  <p className="mt-2 text-sm text-gray-300">
                    The loader extracts the “desired filename” from the API’s <code>download_url</code> last URL path segment, URL-decodes it,
                    and sanitizes it for filesystem safety. If it can’t extract a filename, it falls back to a sanitized plugin name + <code>.jar</code>.
                  </p>
                  <p className="mt-3 text-sm text-gray-300">
                    On successful download+checksum, it replaces the previous jar:
                  </p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-300">
                    <li>It keeps track of the last downloaded jar name in <code>download-trackers/{`{pluginId}`}.txt</code>.</li>
                    <li>If the new filename differs, it deletes the previous jar (best-effort).</li>
                    <li>If no tracker exists yet (first auto-download), it deletes versioned jars matching the entry name prefix and also deletes the legacy constant name jar.</li>
                  </ul>
                </div>
              </section>

              <section id="integrity" className="scroll-mt-28">
                <h2 className="text-xl font-semibold text-gray-50">SHA-256 integrity verification</h2>
                <p className="mt-2 text-sm text-gray-300">
                  MCMerchant verifies downloaded jars against the API-provided SHA-256 hash (if present).
                </p>
                <div className="mt-4 rounded-xl border border-gray-800/80 bg-gray-950/30 p-4">
                  <p className="text-sm font-medium text-gray-200">Behavior</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-300">
                    <li>If SHA-256 is missing/blank, it won’t verify (but it still checks the downloaded file isn’t empty).</li>
                    <li>If checksum mismatches, it deletes the downloaded jar.</li>
                    <li>After a successful stage, it instructs you to restart to apply the update.</li>
                  </ul>
                </div>
              </section>

              <section id="api" className="scroll-mt-28">
                <h2 className="text-xl font-semibold text-gray-50">MCMerchant API endpoints</h2>
                <p className="mt-2 text-sm text-gray-300">
                  MCMerchantLoader’s updater uses one “latest metadata” endpoint. Downloads are performed using the returned URL.
                </p>
                <div className="mt-4 overflow-auto rounded-xl border border-gray-800/80 bg-black/30 p-4">
                  <pre className="text-xs text-gray-200">
                    <code>{`GET {api-base-url}/v1/plugins/{pluginId}/latest

Headers:
  X-License-Key: {licenseKey}
  X-Plugin-Version: {currentVersion}
  X-Minecraft-Version: {BukkitVersionMajorMinor}
  X-Server-Software: {Bukkit.getName()}

Expected JSON fields (from the loader):
  version, download_url, changelog, sha256 (or sha256_checksum), released_at, file_size_bytes, minecraft_versions[]
`}</code>
                  </pre>
                </div>
                <p className="mt-3 text-xs text-gray-500">
                  If the loader receives an error status, it maps the status to license/network/update errors as described earlier.
                </p>
              </section>

              <section id="local-dev" className="scroll-mt-28">
                <h2 className="text-xl font-semibold text-gray-50">Local development guide</h2>
                <p className="mt-2 text-sm text-gray-300">
                  When running the web app and loader locally, set your URLs to localhost so the loader hits your dev API and
                  generates correct admin links.
                </p>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-gray-800/80 bg-gray-950/30 p-4">
                    <p className="text-sm font-medium text-gray-200">Recommended local mcmerchant.yml</p>
                    <div className="mt-3 overflow-auto rounded-lg bg-black/30 p-4">
                      <pre className="text-xs text-gray-200">
                        <code>{`api-base-url: "http://localhost:3000/api"
app-base-url: "http://localhost:3000"
`}</code>
                      </pre>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      If Next dev runs on a different port (3001/3002), update accordingly.
                    </p>
                  </div>

                  <div className="rounded-xl border border-gray-800/80 bg-gray-950/30 p-4">
                    <p className="text-sm font-medium text-gray-200">Stripe webhook in dev</p>
                    <p className="mt-2 text-sm text-gray-300">
                      Ensure your webhook listener is running so purchases create license keys quickly.
                    </p>
                    <div className="mt-3 overflow-auto rounded-lg bg-black/30 p-4">
                      <pre className="text-xs text-gray-200">
                        <code>{`pnpm webhooks:listen
`}</code>
                      </pre>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      After changing config, restart the loader and run <code>/pdex reload</code>.
                    </p>
                  </div>
                </div>
              </section>

              <section id="troubleshooting" className="scroll-mt-28">
                <h2 className="text-xl font-semibold text-gray-50">Troubleshooting</h2>
                <div className="space-y-6">
                  <div className="rounded-xl border border-red-900/40 bg-red-950/20 p-5">
                    <p className="text-sm font-semibold text-red-200">“My plugin didn’t update”</p>
                    <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-red-100">
                      <li>Run <code>/pdex check</code> and check console output.</li>
                      <li>Verify <code>plugin-id</code> and <code>license-key</code> match what’s shown on your account.</li>
                      <li>Confirm <code>current-version</code> is the version you actually run.</li>
                      <li>If you changed URLs, run <code>/pdex reload</code>.</li>
                    </ul>
                  </div>

                  <div className="rounded-xl border border-gray-800/80 bg-gray-950/30 p-5">
                    <p className="text-sm font-semibold text-gray-200">Network errors</p>
                    <p className="mt-2 text-sm text-gray-300">
                      “Could not reach API” typically means your <code>api-base-url</code> is wrong for the environment.
                      Fix it in <code>mcmerchant.yml</code> and reload.
                    </p>
                  </div>

                  <div className="rounded-xl border border-gray-800/80 bg-gray-950/30 p-5">
                    <p className="text-sm font-semibold text-gray-200">License problems</p>
                    <p className="mt-2 text-sm text-gray-300">
                      If the API returns <code>revoked</code> / <code>expired</code> / invalid, the loader marks the license state as an error and won’t download.
                      Double-check your purchase and ensure you’re using the correct license key.
                    </p>
                  </div>

                  <div className="rounded-xl border border-gray-800/80 bg-gray-950/30 p-5">
                    <p className="text-sm font-semibold text-gray-200">“I enabled auto-download but nothing changed”</p>
                    <p className="mt-2 text-sm text-gray-300">
                      Auto-download only happens when the API reports an update is available and the license is valid. It also requires a server restart to apply the staged jar.
                      Check the console for a message like “downloaded to /plugins - restart to apply”.
                    </p>
                  </div>
                </div>
              </section>

              <section id="stripe-webhooks" className="scroll-mt-28">
                <h2 className="text-xl font-semibold text-gray-50">Stripe webhook notes</h2>
                <p className="mt-2 text-sm text-gray-300">
                  In dev, purchases are processed by your Next.js webhook handler. If the webhook fails, the UI may show “no purchases yet” even after checkout.
                </p>
                <div className="mt-4 rounded-xl border border-gray-800/80 bg-gray-950/30 p-4">
                  <p className="text-sm font-medium text-gray-200">What to check</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-300">
                    <li>Your webhook secret is configured in environment variables.</li>
                    <li>The webhook listener is running and forwarding to your local server.</li>
                    <li>Your webhook handler logs success for <code>checkout.session.completed</code>.</li>
                  </ul>
                </div>
              </section>

              <section id="server-platform" className="scroll-mt-28">
                <h2 className="text-xl font-semibold text-gray-50">server_platform column (optional)</h2>
                <p className="mt-2 text-sm text-gray-300">
                  Some marketplace features (filtering or storing server platform metadata on versions) may rely on a <code>server_platform</code> column in Supabase.
                  If that column isn’t present yet in a local schema, parts of the system will degrade gracefully.
                </p>
                <div className="mt-4 rounded-xl border border-gray-800/80 bg-gray-950/30 p-4">
                  <p className="text-sm font-medium text-gray-200">Practical guidance</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-300">
                    <li>Local dev should still work for downloads and listings.</li>
                    <li>Version upload/edit retries may omit <code>server_platform</code> if the DB schema doesn’t have it.</li>
                    <li>For production correctness, add <code>server_platform</code> to your schema.</li>
                  </ul>
                </div>
              </section>

              <section id="developer-platform" className="scroll-mt-28">
                <h2 className="text-xl font-semibold text-gray-50">Developer brand &amp; storefront</h2>
                <p className="mt-2 text-sm text-gray-300">
                  MCMerchant is oriented around <strong className="text-gray-200">developers marketing themselves</strong>,
                  not only anonymous listings. Each seller gets a public storefront at{" "}
                  <code className="rounded bg-gray-900 px-1">/store/&lt;username&gt;</code> or a vanity slug, plus the
                  same licensing and MCMerchantLoader update channel for every plugin.
                </p>
                <div className="mt-4 space-y-4 rounded-xl border border-gray-800/80 bg-gray-950/30 p-4">
                  <div>
                    <p className="text-sm font-medium text-gray-200">What ships today</p>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-300">
                      <li>
                        <strong className="text-gray-200">Public storefront</strong> with accent themes, optional banner
                        image, social icons (website, GitHub, Discord, X), stats, featured plugin (when you publish more than
                        one), share actions, Markdown about section, and a searchable / sortable / filterable plugin catalog.
                      </li>
                      <li>
                        <strong className="text-gray-200">Dashboard → Storefront</strong> for editing branding fields
                        (requires optional DB columns—see repo <code className="text-xs">docs/STOREFRONT_PLATFORM.md</code>
                        ).
                      </li>
                      <li>
                        <strong className="text-gray-200">Marketplace + loader</strong> unchanged: license keys, paid
                        delivery, auto-update, checksums.
                      </li>
                    </ul>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-200">Roadmap (honest)</p>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-300">
                      <li>
                        <strong className="text-gray-200">Custom domains</strong>: capture hostname + verification status
                        in the DB; automated DNS/TLS + edge routing is not wired yet.
                      </li>
                      <li>
                        <strong className="text-gray-200">Obfuscation / CI</strong>: treat as build-pipeline and partner
                        tooling—MCMerchant should orchestrate uploads and metadata, not replace ProGuard-grade workflows.
                      </li>
                    </ul>
                  </div>
                </div>
              </section>

              <section id="seller-versions" className="scroll-mt-28">
                <h2 className="text-xl font-semibold text-gray-50">Seller: managing versions</h2>
                <p className="mt-2 text-sm text-gray-300">
                  On the seller dashboard, go to your plugin and open <code>Manage versions</code>.
                  You can upload a jar, edit metadata, set the latest version, or delete versions.
                </p>
                <div className="mt-4 rounded-xl border border-gray-800/80 bg-gray-950/30 p-4">
                  <p className="text-sm font-medium text-gray-200">Editing metadata</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-300">
                    <li><code>Version</code>: normalized/validated as semver.</li>
                    <li><code>Changelog</code>: shown in update notifications.</li>
                    <li><code>Minecraft versions</code>: determines compatibility tags on the marketplace.</li>
                    <li><code>Server platform</code>: optional depending on DB schema.</li>
                  </ul>
                </div>
              </section>

              <section id="seller-upload" className="scroll-mt-28">
                <h2 className="text-xl font-semibold text-gray-50">Seller: upload + metadata</h2>
                <p className="mt-2 text-sm text-gray-300">
                  Uploading a version stores the jar in the private storage bucket and creates a row in <code>plugin_versions</code>.
                  The loader later downloads the jar using the stored URL.
                </p>
                <div className="mt-4 overflow-auto rounded-xl border border-gray-800/80 bg-black/30 p-4">
                  <pre className="text-xs text-gray-200">
                    <code>{`POST /api/v1/dashboard/plugins/{pluginId}/versions
FormData:
  version: string (semver)
  changelog: string
  minecraft_versions: string (comma-separated)
  server_platform: string (optional)
  jar_file: File (.jar)
`}</code>
                  </pre>
                </div>
              </section>

              <section id="security" className="scroll-mt-28">
                <h2 className="text-xl font-semibold text-gray-50">Security & best practices</h2>
                <p className="mt-2 text-sm text-gray-300">
                  MCMerchantLoader never asks you to paste secrets at runtime; all license information lives only in your server’s local
                  <code>mcmerchant.yml</code>.
                </p>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-gray-800/80 bg-gray-950/30 p-4">
                    <p className="text-sm font-medium text-gray-200">Do</p>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-300">
                      <li>Keep <code>mcmerchant.yml</code> private (it contains license keys).</li>
                      <li>Use least-privilege permissions for admins (only admins should use <code>/pdex</code>).</li>
                      <li>Make sure your jar uploads include correct checksums and download URLs.</li>
                    </ul>
                  </div>
                  <div className="rounded-xl border border-gray-800/80 bg-gray-950/30 p-4">
                    <p className="text-sm font-medium text-gray-200">Don’t</p>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-300">
                      <li>Expose license keys in logs or screenshots.</li>
                      <li>Rely on “auto-download” alone—always restart the server to apply staged jars.</li>
                      <li>Change server URLs without reloading the plugin.</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section id="status-indicators" className="scroll-mt-28">
                <h2 className="text-xl font-semibold text-gray-50">Status indicators in /pdex</h2>
                <p className="mt-2 text-sm text-gray-300">
                  The <code>/pdex status</code> output uses small symbols to make a scan possible in chat. The meanings below match the loader’s implementation.
                </p>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-gray-800/80 bg-gray-950/30 p-4">
                    <p className="text-sm font-medium text-gray-200">Indicators</p>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-300">
                      <li><code>o</code>: not checked yet (no result in memory).</li>
                      <li><code>*</code>: up to date.</li>
                      <li><code>^</code>: update available (shows “Update: vX.Y.Z”).</li>
                      <li><code>v</code>: update downloaded (shows “Downloaded vX.Y.Z (restart)”).</li>
                      <li><code>x</code>: license invalid/revoked/expired (message is shown).</li>
                      <li><code>?</code>: network error or other unknown result (message is truncated for network errors).</li>
                    </ul>
                  </div>
                  <div className="rounded-xl border border-gray-800/80 bg-gray-950/30 p-4">
                    <p className="text-sm font-medium text-gray-200">Time since last check</p>
                    <p className="mt-2 text-sm text-gray-300">
                      Each line also includes a relative “last checked” age (e.g. “5m ago”), so you can distinguish “stale state” from “fresh failure”.
                    </p>
                    <p className="mt-2 text-sm text-gray-300">
                      If you change your config, run <code>/pdex reload</code> first, then <code>/pdex check</code>.
                    </p>
                  </div>
                </div>
              </section>

              <section id="semver" className="scroll-mt-28">
                <h2 className="text-xl font-semibold text-gray-50">Versioning & semver rules</h2>
                <p className="mt-2 text-sm text-gray-300">
                  MCMerchant compares versions using a simplified semver parser:
                </p>
                <div className="mt-4 overflow-auto rounded-xl border border-gray-800/80 bg-black/30 p-4">
                  <pre className="text-xs text-gray-200">
                    <code>{`How it parses:
  - Trims whitespace and strips leading "v" or "V"
  - Removes any build/pre-release suffix (splits on '+' or '-' and keeps the left side)
  - Splits by '.'
  - Missing parts become 0 (e.g. "1" => 1.0.0, "1.2" => 1.2.0)
  - Compares (major, minor, patch)
`}</code>
                  </pre>
                </div>
                <div className="mt-4 rounded-xl border border-gray-800/80 bg-gray-950/30 p-4">
                  <p className="text-sm font-medium text-gray-200">Practical examples</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-300">
                    <li><code>1</code> is treated as <code>1.0.0</code>.</li>
                    <li><code>2.7</code> is treated as <code>2.7.0</code>.</li>
                    <li><code>1.2.3-beta.1</code> compares as <code>1.2.3</code>.</li>
                    <li>The loader considers an update available only when <code>latest &gt; current</code>.</li>
                  </ul>
                </div>
              </section>

              <section id="scheduler" className="scroll-mt-28">
                <h2 className="text-xl font-semibold text-gray-50">Scheduler timing + retries</h2>
                <p className="mt-2 text-sm text-gray-300">
                  The loader runs update checks asynchronously on a schedule. To reduce spikes, it staggers checks across entries.
                </p>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-gray-800/80 bg-gray-950/30 p-4">
                    <p className="text-sm font-medium text-gray-200">Timing constants</p>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-300">
                      <li>Startup delay: <code>STARTUP_DELAY_TICKS = 60</code></li>
                      <li>Stagger per plugin: <code>STAGGER_TICKS = 40</code></li>
                      <li>Interval: <code>check-interval-hours * 72000</code> (20 ticks/sec)</li>
                    </ul>
                  </div>
                  <div className="rounded-xl border border-gray-800/80 bg-gray-950/30 p-4">
                    <p className="text-sm font-medium text-gray-200">Retry behavior</p>
                    <p className="mt-2 text-sm text-gray-300">
                      The updater uses HTTP retry logic at most <code>maxRetries</code> times for failed requests (network / transient failures).
                      In the current loader config it is set to <code>maxRetries: 2</code>.
                    </p>
                  </div>
                </div>
              </section>

              <section id="timeouts-cache" className="scroll-mt-28">
                <h2 className="text-xl font-semibold text-gray-50">HTTP timeouts + caching</h2>
                <p className="mt-2 text-sm text-gray-300">
                  The loader’s HTTP client is configured to keep update checks responsive.
                </p>
                <div className="mt-4 overflow-auto rounded-xl border border-gray-800/80 bg-black/30 p-4">
                  <pre className="text-xs text-gray-200">
                    <code>{`In MultiUpdater:
  connectTimeoutMs: 5000
  readTimeoutMs: 8000
  maxRetries: 2
  cacheMinutes: 0

Effect:
  - Fail fast when the API is unreachable
  - Avoid stale cached “latest” responses
`}</code>
                  </pre>
                </div>
                <p className="mt-3 text-sm text-gray-300">
                  If your server has slow networking or strict outbound firewall rules, you may see network errors. Adjusting timeouts
                  requires updating the loader code (or adding configuration if you want it later).
                </p>
              </section>

              <section id="jar-tracker" className="scroll-mt-28">
                <h2 className="text-xl font-semibold text-gray-50">download-trackers behavior</h2>
                <p className="mt-2 text-sm text-gray-300">
                  To replace jars cleanly on auto-download, the loader remembers which jar it downloaded last.
                </p>
                <div className="mt-4 overflow-auto rounded-xl border border-gray-800/80 bg-black/30 p-4">
                  <pre className="text-xs text-gray-200">
                    <code>{`Location:
  {pluginDataFolder}/download-trackers/{sanitizedPluginId}.txt

What it stores:
  - The desired jar filename extracted from download_url

How it’s used:
  - If a tracker exists, the loader deletes the “previousFilename”
  - If no tracker exists (first auto-download), it performs best-effort cleanup by:
      * deleting versioned jars matching the entry name prefix
      * deleting the legacy constant-name jar
`}</code>
                  </pre>
                </div>
                <p className="mt-3 text-xs text-gray-500">
                  Cleanup is “best-effort”: filesystem permissions or OS locks may prevent deletion, but downloads will still proceed if checksums validate.
                </p>
              </section>

              <section id="api-headers" className="scroll-mt-28">
                <h2 className="text-xl font-semibold text-gray-50">API request headers</h2>
                <p className="mt-2 text-sm text-gray-300">
                  These headers are attached to the loader’s update check request. They’re how the API verifies license validity and selects the latest build.
                </p>
                <div className="mt-4 overflow-auto rounded-xl border border-gray-800/80 bg-black/30 p-4">
                  <pre className="text-xs text-gray-200">
                    <code>{`GET {api-base-url}/v1/plugins/{pluginId}/latest

X-License-Key: {licenseKey}
X-Plugin-Version: {currentVersion}
X-Minecraft-Version: {Bukkit.getBukkitVersion().split("-")[0]}
X-Server-Software: {Bukkit.getName()}
`}</code>
                  </pre>
                </div>
              </section>

              <section id="api-response" className="scroll-mt-28">
                <h2 className="text-xl font-semibold text-gray-50">API response fields</h2>
                <p className="mt-2 text-sm text-gray-300">
                  The loader expects these fields from the “latest” response:
                </p>
                <div className="mt-4 overflow-auto rounded-xl border border-gray-800/80 bg-black/30 p-4">
                  <pre className="text-xs text-gray-200">
                    <code>{`version: string (semver)
download_url: string (points to the jar file)
changelog: string (may be null)

sha256: string (preferred) OR sha256_checksum: string (fallback)
file_size_bytes: number
released_at: string

minecraft_versions: string[] (compatibility tags)
`}</code>
                  </pre>
                </div>
                <p className="mt-3 text-sm text-gray-300">
                  The loader performs checksum verification using <code>sha256</code>/<code>sha256_checksum</code> when provided.
                  It extracts the jar filename from <code>download_url</code>.
                </p>
              </section>

              <section id="debug-console" className="scroll-mt-28">
                <h2 className="text-xl font-semibold text-gray-50">Debugging checklist</h2>
                <p className="mt-2 text-sm text-gray-300">
                  Use this checklist when updates or license processing don’t behave as expected.
                </p>

                <ol className="mt-3 list-decimal space-y-3 pl-5 text-sm text-gray-300">
                  <li>
                    Run <code>/pdex status</code> to confirm whether the loader thinks the license is valid and an update exists.
                    Look specifically for <code>x</code> (license issues) vs <code>^</code>/<code>v</code> (version availability).
                  </li>
                  <li>
                    Run <code>/pdex check</code> after any config change. Wait for logs/notifier messages to confirm the new state.
                  </li>
                  <li>
                    Verify <code>api-base-url</code> and <code>app-base-url</code> match your environment (especially when running local dev).
                  </li>
                  <li>
                    If the API returns “Plugin ID not found”, verify your <code>plugin-id</code> is correct and that the plugin is published on the marketplace.
                  </li>
                  <li>
                    If downloads fail, verify storage/download URLs resolve, and confirm your backend returns a valid <code>sha256</code>.
                    A checksum mismatch deletes the downloaded jar.
                  </li>
                  <li>
                    In local dev: make sure your Stripe webhook listener is running so purchases create license keys promptly.
                  </li>
                </ol>

                <div className="mt-4 rounded-xl border border-gray-800/80 bg-gray-950/30 p-4">
                  <p className="text-sm font-medium text-gray-200">What messages to look for</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-300">
                    <li><code>[MCM] Loaded N plugin(s) from mcmerchant.yml</code></li>
                    <li><code>[MCM] Update available for …</code> plus “Download: …</li>
                    <li><code>[MCM] Downloading update v…</code></li>
                    <li><code>[MCM] Checksum mismatch. Download deleted.</code></li>
                    <li><code>[MCM] Could not reach API …</code></li>
                  </ul>
                </div>
              </section>

              <section id="webapp-version-api" className="scroll-mt-28">
                <h2 className="text-xl font-semibold text-gray-50">Web app: edit/delete versions</h2>
                <p className="mt-2 text-sm text-gray-300">
                  Seller actions are handled via version-specific endpoints in the dashboard API.
                </p>
                <div className="mt-4 space-y-4 rounded-2xl border border-gray-800/80 bg-gray-950/30 p-6">
                  <div>
                    <p className="text-sm font-semibold text-gray-200">Edit (PATCH)</p>
                    <div className="mt-2 overflow-auto rounded-lg bg-black/30 p-4">
                      <pre className="text-xs text-gray-200">
                        <code>{`PATCH /api/v1/dashboard/plugins/{id}/versions/{versionId}
FormData (any of):
  version
  changelog
  minecraft_versions (comma-separated)
  server_platform (optional, if schema supports it)
  is_latest = true|false

Special behavior:
  - Setting is_latest promotes exactly one version per plugin.
  - If server_platform column is missing, the route retries without it.
`}</code>
                      </pre>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-200">Delete (DELETE)</p>
                    <div className="mt-2 overflow-auto rounded-lg bg-black/30 p-4">
                      <pre className="text-xs text-gray-200">
                        <code>{`DELETE /api/v1/dashboard/plugins/{id}/versions/{versionId}

Behavior:
  - Deletes the plugin_versions row
  - Best-effort deletes the jar object from storage (using file_url)
  - If you delete the current latest, another version is promoted
`}</code>
                      </pre>
                    </div>
                  </div>
                </div>
              </section>

              <section id="supabase-schema" className="scroll-mt-28">
                <h2 className="text-xl font-semibold text-gray-50">Supabase schema overview</h2>
                <p className="mt-2 text-sm text-gray-300">
                  MCMerchant relies on a small set of tables for marketplace state, licensing, and version metadata. Exact schemas vary by environment,
                  but the loader and dashboard code consistently use the following concepts:
                </p>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-gray-800/80 bg-gray-950/30 p-4">
                    <p className="text-sm font-medium text-gray-200">plugin_versions</p>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-300">
                      <li><code>plugin_id</code> (FK to <code>plugins</code>)</li>
                      <li><code>version</code> (semver string)</li>
                      <li><code>changelog</code> (text)</li>
                      <li><code>minecraft_versions</code> (array)</li>
                      <li><code>file_url</code> (storage path used for downloads)</li>
                      <li><code>is_latest</code> (boolean; only one should be true per plugin)</li>
                      <li><code>server_platform</code> (optional; may be absent in dev schemas)</li>
                    </ul>
                  </div>
                  <div className="rounded-xl border border-gray-800/80 bg-gray-950/30 p-4">
                    <p className="text-sm font-medium text-gray-200">Licensing tables</p>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-300">
                      <li><code>license_keys</code>: maps buyer/license key to plugin availability state.</li>
                      <li><code>profiles</code>: stores seller/user metadata (username display, etc.).</li>
                      <li><code>reviews</code>: marketplace ratings (not required for loader operation).</li>
                    </ul>
                  </div>
                </div>
                <div className="mt-4 rounded-xl border border-gray-800/80 bg-gray-950/30 p-4">
                  <p className="text-sm font-medium text-gray-200">Schema mismatch handling</p>
                  <p className="mt-2 text-sm text-gray-300">
                    Some routes already attempt retries when <code>server_platform</code> is missing. For production correctness, add the column
                    so filtering and updates can work consistently.
                  </p>
                </div>
              </section>

              <section id="storage-buckets" className="scroll-mt-28">
                <h2 className="text-xl font-semibold text-gray-50">Storage buckets + filenames</h2>
                <p className="mt-2 text-sm text-gray-300">
                  Jars and images are stored in Supabase Storage buckets. The loader downloads directly from the storage URLs returned by the API.
                </p>
                <div className="mt-4 space-y-4">
                  <div className="rounded-xl border border-gray-800/80 bg-gray-950/30 p-4">
                    <p className="text-sm font-semibold text-gray-200">plugin-files (jar downloads)</p>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-300">
                      <li>Bucket should be <code>Private</code>.</li>
                      <li>Uploads land under <code>jars/{`{pluginId}`}/{`{safeFilename}`}</code>.</li>
                      <li>The dashboard sanitizes the original jar filename for path safety (non safe chars become underscores).</li>
                      <li>Auto-download replaces jars in <code>/plugins</code> using the filename derived from <code>download_url</code>.</li>
                    </ul>
                  </div>
                  <div className="rounded-xl border border-gray-800/80 bg-gray-950/30 p-4">
                    <p className="text-sm font-semibold text-gray-200">plugin-images (covers)</p>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-300">
                      <li>Used for plugin cover images.</li>
                      <li>Paths look like <code>covers/{`{sellerId}`}/{`{slug}`}-{`{timestamp}`}.png</code> (based on upload).</li>
                      <li>Public URLs are used for rendering covers.</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section id="release-checklist" className="scroll-mt-28">
                <h2 className="text-xl font-semibold text-gray-50">Release checklist</h2>
                <p className="mt-2 text-sm text-gray-300">
                  Before you hit “Publish” on a new build, use this checklist to ensure updates work smoothly.
                </p>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-gray-300">
                  <li>Upload the jar with the exact filename you want buyers to receive.</li>
                  <li>Set the <code>Version</code> to valid semver (<code>1.2.3</code>).</li>
                  <li>Fill out changelog (used in admin notifications).</li>
                  <li>Select compatible <code>Minecraft versions</code>.</li>
                  <li>If using <code>server_platform</code>, ensure your schema supports it.</li>
                  <li>Mark the version as <code>latest</code> so the loader finds it.</li>
                  <li>Optionally test via a local server with <code>api-base-url</code> and <code>app-base-url</code> set to localhost.</li>
                </ul>
              </section>

              <section id="faq" className="scroll-mt-28">
                <h2 className="text-xl font-semibold text-gray-50">FAQ</h2>

                <div className="space-y-4">
                  <details className="group rounded-2xl border border-gray-800/80 bg-gray-950/30 p-5">
                    <summary className="cursor-pointer list-none text-sm font-semibold text-gray-200">
                      Why does the loader ask to restart?
                    </summary>
                    <p className="mt-3 text-sm text-gray-300">
                      When auto-download is enabled, MCMerchantLoader downloads and stages the jar into your <code>/plugins</code> directory,
                      but it can’t unload/reload the running plugin safely from within the JVM. Restarting applies the staged jar.
                    </p>
                  </details>

                  <details className="group rounded-2xl border border-gray-800/80 bg-gray-950/30 p-5">
                    <summary className="cursor-pointer list-none text-sm font-semibold text-gray-200">
                      Does it preserve the uploaded jar filename?
                    </summary>
                    <p className="mt-3 text-sm text-gray-300">
                      Yes. The loader extracts the filename from the API <code>download_url</code> and downloads directly into <code>/plugins</code>{" "}
                      using that name. It then deletes the previously tracked jar to keep your folder clean.
                    </p>
                  </details>

                  <details className="group rounded-2xl border border-gray-800/80 bg-gray-950/30 p-5">
                    <summary className="cursor-pointer list-none text-sm font-semibold text-gray-200">
                      What if I don’t have any purchases yet?
                    </summary>
                    <p className="mt-3 text-sm text-gray-300">
                      If you just completed checkout, the webhook may still be processing. In local dev, ensure the webhook listener is running
                      so license keys are created promptly.
                    </p>
                  </details>
                </div>

                <div className="mt-6 rounded-2xl border border-brand-500/30 bg-brand-500/10 p-5">
                  <p className="text-sm font-semibold text-brand-200">Need more?</p>
                  <p className="mt-2 text-sm text-gray-300">
                    This page is designed to grow. If you want, I can expand it further with:
                    more API endpoints, database schema diagrams, “how to debug from console logs”, and a copy-paste
                    server-admin runbook.
                  </p>
                  <p className="mt-4 text-xs text-gray-500">
                    For now, start with <a className="underline underline-offset-4" href="#config">mcmerchant.yml</a> and{" "}
                    <a className="underline underline-offset-4" href="#troubleshooting">Troubleshooting</a>.
                  </p>
                </div>
              </section>

              <div className="mt-12 text-sm text-gray-500">
                <p>
                  Want docs for a specific part of the system? Reply with what to cover (loader config, API reference, seller workflows, or schema),
                  and I’ll expand this page accordingly.
                </p>
                <p className="mt-2">
                  Quick navigation:{" "}
                  <Link href="/browse" className="underline underline-offset-4">
                    Plugins
                  </Link>
                  {" · "}
                  <Link href="/account/licenses" className="underline underline-offset-4">
                    Licenses
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

