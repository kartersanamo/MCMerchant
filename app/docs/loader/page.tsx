import Link from "next/link";
import { DocsToc, type DocsTocItem } from "@/components/docs-toc";

const toc: DocsTocItem[] = [
  { id: "overview", title: "Overview", group: "Getting started" },
  { id: "install", title: "Install MCMerchantLoader", group: "Getting started" },
  { id: "download-jar", title: "Download jar", group: "Getting started" },
  { id: "first-run", title: "First run & mcmerchant.yml", group: "Getting started" },
  { id: "config", title: "mcmerchant.yml config reference", group: "Configuration" },
  { id: "plugins-entry", title: "`plugins:` entry format", group: "Configuration" },
  { id: "commands", title: "Commands: /pdex", group: "Usage" },
  { id: "permissions", title: "Permissions", group: "Usage" },
  { id: "how-it-works", title: "How it works (update lifecycle)", group: "How it works" },
  { id: "api-request", title: "API request headers", group: "How it works" },
  { id: "download", title: "Download, checksum, replace jar", group: "How it works" },
  { id: "troubleshooting", title: "Troubleshooting", group: "Troubleshooting" },
  { id: "faq", title: "FAQ", group: "Reference" }
];

export default function LoaderDocsPage() {
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
            MCMerchant Loader
          </h1>
          <p className="mt-3 max-w-3xl text-sm text-gray-300">
            Install MCMerchantLoader on your Paper/Spigot server to automatically check purchased plugin licenses for updates, verify downloads, and stage jar replacements.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <a
              href="#install"
              className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-gray-950 transition hover:brightness-110"
            >
              Install guide
            </a>
            <a
              href="#config"
              className="rounded-lg border border-gray-800 bg-gray-950/40 px-4 py-2 text-sm font-medium text-gray-200 hover:border-gray-700"
            >
              mcmerchant.yml config
            </a>
            <a
              href="#how-it-works"
              className="rounded-lg border border-gray-800 bg-gray-950/40 px-4 py-2 text-sm font-medium text-gray-200 hover:border-gray-700"
            >
              How it works
            </a>
          </div>

          <div className="mt-6">
            <Link
              href="/loader/install"
              className="block w-full rounded-xl bg-brand-500 px-6 py-4 text-center text-lg font-semibold text-gray-950 shadow-sm shadow-brand-500/20 transition hover:brightness-110 sm:w-auto"
            >
              Download MCMerchantLoader-1.0.0.jar
            </Link>
          </div>

          <p className="mt-4 text-xs text-gray-500">
            Back to the main docs:{" "}
            <Link href="/docs" className="underline underline-offset-4 hover:text-gray-200">
              /docs
            </Link>
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-12">
          <div className="md:col-span-4 md:self-start lg:col-span-3">
            <div className="docs-toc-shell rounded-2xl border p-2">
              <DocsToc items={toc} defaultGroup="Getting started" title="On this page" />
            </div>
          </div>

          <div className="md:col-span-8 lg:col-span-9">
            <div className="docs-content space-y-10">
              <section id="overview" className="scroll-mt-28">
                <h2 className="text-xl font-semibold text-gray-50">Overview</h2>
                <p className="mt-2 text-sm text-gray-300">
                  MCMerchantLoader is a Bukkit/Paper companion plugin that checks your configured MCMerchant license keys for updates and (optionally) downloads the newest compatible jar into your server’s <code>/plugins</code> folder.
                </p>
                <div className="mt-4 rounded-xl border border-gray-800/80 bg-gray-950/30 p-4">
                  <p className="text-sm font-medium text-gray-200">What you get</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-300">
                    <li>Automatic update checks on a schedule</li>
                    <li>License validation (invalid/revoked/expired are enforced)</li>
                    <li>Optional download + SHA-256 checksum verification</li>
                    <li>In-game admin notifications with direct purchases links</li>
                    <li>Clean jar replacement that keeps the original uploaded filenames</li>
                  </ul>
                </div>
              </section>

              <section id="install" className="scroll-mt-28">
                <h2 className="text-xl font-semibold text-gray-50">Install MCMerchantLoader</h2>
                <p className="mt-2 text-sm text-gray-300">
                  Recommended servers: Paper/Spigot (Bukkit API).
                  You install the loader by placing the jar into your server’s plugin folder, then configuring <code>mcmerchant.yml</code>.
                </p>

                <div className="mt-4 rounded-2xl border border-gray-800/80 bg-gray-950/30 p-6">
                  <p className="text-sm font-semibold text-gray-100">Installation steps</p>
                  <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-gray-300">
                    <li>Download <code>MCMerchantLoader-1.0.0.jar</code> from the button at the top of this page</li>
                    <li>Copy it into your server’s <code>/plugins</code> directory</li>
                    <li>Start the server (it will create a default <code>mcmerchant.yml</code>)</li>
                    <li>Edit <code>mcmerchant.yml</code> and add your purchased entries</li>
                    <li>Run <code>/pdex reload</code> then <code>/pdex check</code></li>
                  </ol>
                </div>
              </section>

              <section id="download-jar" className="scroll-mt-28">
                <h2 className="text-xl font-semibold text-gray-50">Download jar</h2>
                <p className="mt-2 text-sm text-gray-300">
                  Use the hosted installer flow to download the official loader jar. You do not need to build anything from source.
                </p>
                <div className="mt-4 rounded-xl border border-gray-800/80 bg-gray-950/30 p-4">
                  <p className="text-sm text-gray-200">
                    Download link:{" "}
                    <Link href="/loader/install" className="font-medium text-brand-400 hover:underline">
                      /loader/install
                    </Link>
                  </p>
                  <p className="mt-2 text-xs text-gray-400">
                    The download is served by <code>/api/downloads/loader</code>.
                  </p>
                </div>
                <p className="mt-3 text-xs text-gray-500">
                  After downloading, copy <code>MCMerchantLoader-1.0.0.jar</code> into your server’s <code>/plugins</code> folder.
                </p>
              </section>

              <section id="first-run" className="scroll-mt-28">
                <h2 className="text-xl font-semibold text-gray-50">First run & mcmerchant.yml</h2>
                <p className="mt-2 text-sm text-gray-300">
                  On first enable, the loader creates <code>mcmerchant.yml</code> automatically (based on its packaged template). Then you add one entry per purchased plugin under <code>plugins:</code>.
                </p>
                <div className="mt-4 rounded-xl border border-gray-800/80 bg-gray-950/30 p-4">
                  <p className="text-sm font-medium text-gray-200">Template keys you should configure</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-300">
                    <li><code>api-base-url</code></li>
                    <li><code>app-base-url</code></li>
                    <li><code>notify-on-join</code></li>
                    <li><code>notify-in-console</code></li>
                    <li><code>auto-download</code></li>
                    <li>Each <code>plugins[]</code> entry: <code>plugin-id</code>, <code>license-key</code>, <code>current-version</code></li>
                  </ul>
                </div>
              </section>

              <section id="config" className="scroll-mt-28">
                <h2 className="text-xl font-semibold text-gray-50">mcmerchant.yml config reference</h2>
                <p className="mt-2 text-sm text-gray-300">
                  Use these keys to control scheduling, notifications, and which API/app base URLs to target.
                </p>

                <div className="mt-4 overflow-auto rounded-xl border border-gray-800/80 bg-black/30 p-4">
                  <pre className="text-xs text-gray-200">
                    <code>{`# How often to check for updates while the server is running.
# Minimum: 1. Recommended: 6.
check-interval-hours: 6

# Whether to automatically download updates.
# Server must be restarted to apply downloaded updates.
auto-download: false

# Base URL for the MCMerchant API used by this loader.
api-base-url: "https://mcmerchant.net/api"

# Base URL used for links shown to admins.
app-base-url: "https://mcmerchant.net"

notify-on-join: true
notify-in-console: true

plugins:
  - name: "Your plugin display name"
    plugin-id: "abc-123-def-456"
    license-key: "PDEX-XXXX-XXXX-XXXX-XXXX"
    current-version: "1.0.0"
    auto-download: false
`}</code>
                  </pre>
                </div>
              </section>

              <section id="plugins-entry" className="scroll-mt-28">
                <h2 className="text-xl font-semibold text-gray-50">`plugins:` entry format</h2>
                <p className="mt-2 text-sm text-gray-300">
                  Each list item must include a valid <code>plugin-id</code> and <code>license-key</code>. The loader uses <code>current-version</code> to decide if an update is newer.
                </p>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-gray-800/80 bg-gray-950/30 p-4">
                    <p className="text-sm font-medium text-gray-200">Required</p>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-300">
                      <li><code>plugin-id</code></li>
                      <li><code>license-key</code></li>
                      <li><code>current-version</code></li>
                    </ul>
                  </div>
                  <div className="rounded-xl border border-gray-800/80 bg-gray-950/30 p-4">
                    <p className="text-sm font-medium text-gray-200">Optional</p>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-300">
                      <li><code>name</code> (for logs/chat display)</li>
                      <li><code>auto-download</code> (per-plugin override)</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section id="commands" className="scroll-mt-28">
                <h2 className="text-xl font-semibold text-gray-50">Commands: /pdex</h2>
                <p className="mt-2 text-sm text-gray-300">
                  The loader registers the <code>pdex</code> command and supports three subcommands.
                </p>
                <div className="mt-4 space-y-4 rounded-2xl border border-gray-800/80 bg-gray-950/30 p-6">
                  <div>
                    <p className="text-sm font-semibold text-gray-100">/pdex check</p>
                    <p className="mt-1 text-sm text-gray-300">
                      Runs checks for all configured plugins immediately.
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-100">/pdex status</p>
                    <p className="mt-1 text-sm text-gray-300">
                      Shows the last-known status per plugin (up-to-date, update available, downloaded, or license/network errors).
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-100">/pdex reload</p>
                    <p className="mt-1 text-sm text-gray-300">
                      Reloads <code>mcmerchant.yml</code> and restarts checks.
                    </p>
                  </div>
                </div>
              </section>

              <section id="permissions" className="scroll-mt-28">
                <h2 className="text-xl font-semibold text-gray-50">Permissions</h2>
                <p className="mt-2 text-sm text-gray-300">
                  By default, the plugin requires the admin permission to run commands, and a separate permission to receive update notifications on join.
                </p>
                <div className="mt-4 overflow-auto rounded-xl border border-gray-800/80 bg-black/30 p-4">
                  <pre className="text-xs text-gray-200">
                    <code>{`Permissions (from plugin.yml):
  mcmerchant.admin:
    Access to /pdex and in-game update notifications.

  mcmerchant.updates:
    Receive in-game update notifications on join.
`}</code>
                  </pre>
                </div>
              </section>

              <section id="how-it-works" className="scroll-mt-28">
                <h2 className="text-xl font-semibold text-gray-50">How it works (update lifecycle)</h2>
                <p className="mt-2 text-sm text-gray-300">
                  The loader keeps an in-memory state per <code>plugin-id</code>. On schedule, it checks the license and fetches the “latest” metadata, then optionally downloads and replaces jars.
                </p>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-gray-800/80 bg-gray-950/30 p-4">
                    <p className="text-sm font-medium text-gray-200">Update check pipeline</p>
                    <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-gray-300">
                      <li>Build a request with your license key and current server/plugin versions</li>
                      <li>Call MCMerchant API for <code>/v1/plugins/{`{pluginId}`}/latest</code></li>
                      <li>Interpret response (license errors, rate limits, version comparisons)</li>
                      <li>If update available and auto-download is enabled, stage the jar</li>
                      <li>Notify admins + write to console depending on config</li>
                    </ol>
                  </div>
                  <div className="rounded-xl border border-gray-800/80 bg-gray-950/30 p-4">
                    <p className="text-sm font-medium text-gray-200">Status outcomes</p>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-300">
                      <li><code>401/403</code>: invalid/revoked/expired</li>
                      <li><code>429</code>: rate limited</li>
                      <li><code>404</code>: plugin id not found</li>
                      <li>Network errors map to network status</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section id="api-request" className="scroll-mt-28">
                <h2 className="text-xl font-semibold text-gray-50">API request headers</h2>
                <p className="mt-2 text-sm text-gray-300">
                  The loader authenticates and selects the right latest build using these headers.
                </p>
                <div className="mt-4 overflow-auto rounded-xl border border-gray-800/80 bg-black/30 p-4">
                  <pre className="text-xs text-gray-200">
                    <code>{`GET {api-base-url}/v1/plugins/{pluginId}/latest

X-License-Key: {licenseKey}
X-Plugin-Version: {currentVersion}
X-Minecraft-Version: {BukkitVersionMajorMinor}
X-Server-Software: {Bukkit.getName()}
`}</code>
                  </pre>
                </div>
              </section>

              <section id="download" className="scroll-mt-28">
                <h2 className="text-xl font-semibold text-gray-50">Download, checksum, replace jar</h2>
                <p className="mt-2 text-sm text-gray-300">
                  If auto-download is enabled and an update is available, the loader downloads the jar directly into your server’s plugin folder.
                  It then verifies SHA-256 (when provided), and replaces the previous jar safely.
                </p>

                <div className="mt-4 rounded-2xl border border-gray-800/80 bg-gray-950/30 p-6">
                  <p className="text-sm font-medium text-gray-200">Key behavior</p>
                  <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-gray-300">
                    <li>Extracts the desired filename from the API <code>download_url</code> and URL-decodes it</li>
                    <li>If checksum is provided, verifies before keeping the jar</li>
                    <li>On successful download, deletes the previously downloaded jar (tracked per plugin)</li>
                    <li>Always instructs you to restart so changes apply</li>
                  </ul>
                </div>
              </section>

              <section id="troubleshooting" className="scroll-mt-28">
                <h2 className="text-xl font-semibold text-gray-50">Troubleshooting</h2>
                <div className="mt-4 space-y-4">
                  <div className="rounded-xl border border-red-900/30 bg-red-950/20 p-5">
                    <p className="text-sm font-semibold text-red-200">My plugin shows a red license error</p>
                    <p className="mt-2 text-sm text-red-100">
                      Double-check <code>plugin-id</code> and <code>license-key</code> in <code>mcmerchant.yml</code>. The loader enforces revoked/expired licenses and won’t download.
                    </p>
                  </div>
                  <div className="rounded-xl border border-gray-800/80 bg-gray-950/30 p-5">
                    <p className="text-sm font-semibold text-gray-100">Network errors</p>
                    <p className="mt-2 text-sm text-gray-300">
                      Verify your API URL is reachable from your server and that your connection is stable. After updating settings, run <code>/pdex reload</code>.
                    </p>
                  </div>
                  <div className="rounded-xl border border-gray-800/80 bg-gray-950/30 p-5">
                    <p className="text-sm font-semibold text-gray-100">Checksum mismatch</p>
                    <p className="mt-2 text-sm text-gray-300">
                      If the API reports a SHA-256 that doesn’t match the jar, the loader deletes the downloaded jar. Re-upload/fix the stored jar in your dashboard.
                    </p>
                  </div>
                </div>
              </section>

              <section id="faq" className="scroll-mt-28">
                <h2 className="text-xl font-semibold text-gray-50">FAQ</h2>
                <div className="space-y-4">
                  <details className="group rounded-2xl border border-gray-800/80 bg-gray-950/30 p-5">
                    <summary className="cursor-pointer list-none text-sm font-semibold text-gray-200">
                      Where do I get the jar to install?
                    </summary>
                    <p className="mt-3 text-sm text-gray-300">
                      Use the download button at the top of this page (or open{" "}
                      <Link href="/loader/install" className="text-brand-400 hover:underline">
                        /loader/install
                      </Link>
                      ), then place the jar in your server’s <code>/plugins</code> folder.
                    </p>
                  </details>

                  <details className="group rounded-2xl border border-gray-800/80 bg-gray-950/30 p-5">
                    <summary className="cursor-pointer list-none text-sm font-semibold text-gray-200">
                      Do I need to restart the server?
                    </summary>
                    <p className="mt-3 text-sm text-gray-300">
                      Yes. MCMerchantLoader stages jar files in <code>/plugins</code>, and the server must restart to load the new jar.
                    </p>
                  </details>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

