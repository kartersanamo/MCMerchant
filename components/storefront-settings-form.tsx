"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import MDEditor from "@uiw/react-md-editor";
import type { StorefrontPublicProfile } from "@/lib/storefront-profile";
import { getPublicStorefrontPath } from "@/lib/storefront-profile";
import { STORE_THEME_IDS, type StoreThemeId, resolveStoreTheme } from "@/lib/storefront-theme";

type Props = {
  profile: StorefrontPublicProfile;
  hasStorefrontColumns: boolean;
};

type TabId = "brand" | "presence" | "domain";

const THEME_LABELS: Record<StoreThemeId, string> = {
  brand: "MCM green",
  violet: "Violet",
  cyan: "Cyan",
  amber: "Amber",
  rose: "Rose"
};

const THEME_PREVIEW_DOT: Record<StoreThemeId, string> = {
  brand: "bg-brand-400",
  violet: "bg-violet-400",
  cyan: "bg-cyan-400",
  amber: "bg-amber-400",
  rose: "bg-rose-400"
};

export function StorefrontSettingsForm({ profile, hasStorefrontColumns }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<TabId>("brand");

  const [storeTitle, setStoreTitle] = useState(profile.store_title ?? "");
  const [storeTagline, setStoreTagline] = useState(profile.store_tagline ?? "");
  const [storeBio, setStoreBio] = useState(profile.store_bio ?? "");
  const [storeTheme, setStoreTheme] = useState(resolveStoreTheme(profile.store_theme ?? null));
  const [storeBannerUrl, setStoreBannerUrl] = useState(profile.store_banner_url ?? "");
  const [storeIconUrl, setStoreIconUrl] = useState(profile.store_icon_url ?? "");

  const [storeWebsiteUrl, setStoreWebsiteUrl] = useState(profile.store_website_url ?? "");
  const [storeGithubUrl, setStoreGithubUrl] = useState(profile.store_github_url ?? "");
  const [storeDiscordUrl, setStoreDiscordUrl] = useState(profile.store_discord_url ?? "");
  const [storeTwitterUrl, setStoreTwitterUrl] = useState(profile.store_twitter_url ?? "");

  const [storeSlug, setStoreSlug] = useState(profile.store_slug ?? "");
  const [customDomain, setCustomDomain] = useState(profile.custom_domain ?? "");

  const [saving, setSaving] = useState(false);
  const [verifyingDomain, setVerifyingDomain] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const publicPath = getPublicStorefrontPath({
    ...profile,
    store_title: storeTitle || null,
    store_slug: storeSlug || null
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch("/api/v1/dashboard/storefront", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          store_title: storeTitle,
          store_tagline: storeTagline,
          store_bio: storeBio,
          store_theme: storeTheme,
          store_banner_url: storeBannerUrl,
          store_icon_url: storeIconUrl,
          store_website_url: storeWebsiteUrl,
          store_github_url: storeGithubUrl,
          store_discord_url: storeDiscordUrl,
          store_twitter_url: storeTwitterUrl,
          store_slug: storeSlug,
          custom_domain: customDomain
        })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data.code === "email_not_verified") {
          setError(
            typeof data.message === "string"
              ? data.message
              : "Verify your email before saving your storefront."
          );
        } else {
          setError(
            typeof data.error === "string"
              ? data.error
              : "Could not save storefront. Check the console or try again."
          );
        }
        setSaving(false);
        return;
      }
      setMessage("Saved successfully.");
      router.refresh();
    } catch {
      setError("Network error while saving.");
    }
    setSaving(false);
  }

  async function verifyDomain() {
    setVerifyingDomain(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/v1/dashboard/storefront/custom-domain/verify", {
        method: "POST"
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setMessage("Custom domain verified. It should begin routing to your storefront shortly.");
      } else if (res.status === 409) {
        setError(
          "DNS records were not fully detected yet. Confirm TXT and CNAME records, then try again."
        );
      } else {
        setError(typeof data.error === "string" ? data.error : "Could not verify custom domain.");
      }
      router.refresh();
    } catch {
      setError("Network error while verifying custom domain.");
    }
    setVerifyingDomain(false);
  }

  const tabBtn = (id: TabId, label: string) => (
    <button
      key={id}
      type="button"
      onClick={() => setTab(id)}
      className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
        tab === id
          ? "bg-brand-500 text-gray-950 shadow-sm"
          : "text-gray-400 hover:bg-gray-800/80 hover:text-gray-100"
      }`}
    >
      {label}
    </button>
  );

  const input =
    "mt-1 w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-2.5 text-sm text-gray-100 placeholder:text-gray-600 focus:border-brand-500/50 focus:outline-none focus:ring-2 focus:ring-brand-500/20";

  if (!hasStorefrontColumns) {
    return (
      <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-100">
        <p className="font-medium">Storefront columns missing</p>
        <p className="mt-2 text-amber-200/90">
          Run the SQL migration in <code className="rounded bg-black/30 px-1">docs/STOREFRONT_PLATFORM.md</code> to enable
          branding, themes, social links, banner URL, vanity slugs, and custom domain fields.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-gray-800 bg-gray-900/40 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Public storefront</div>
          <p className="mt-1 text-sm text-gray-300">
            Live at{" "}
            <Link href={publicPath} className="font-mono text-brand-400 hover:underline">
              {publicPath}
            </Link>
          </p>
        </div>
        <Link
          href={publicPath}
          className="inline-flex items-center justify-center rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-gray-950 shadow-sm transition hover:brightness-110"
        >
          Preview storefront
        </Link>
      </div>

      <div className="flex flex-wrap gap-2 rounded-xl border border-gray-800 bg-gray-950/50 p-1.5">
        {tabBtn("brand", "Brand & look")}
        {tabBtn("presence", "Links & social")}
        {tabBtn("domain", "URL & domain")}
      </div>

      {message ? (
        <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
          {message}
        </div>
      ) : null}
      {error ? (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</div>
      ) : null}

      {tab === "brand" ? (
        <div className="space-y-6 rounded-2xl border border-gray-800/80 bg-gray-950/30 p-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-100">Accent theme</h3>
            <p className="mt-1 text-xs text-gray-500">Colors on your public hero, pills, and share card.</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {STORE_THEME_IDS.map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setStoreTheme(id)}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm transition ${
                    storeTheme === id
                      ? "border-brand-500/60 bg-brand-500/10 text-gray-100 ring-2 ring-brand-500/30"
                      : "border-gray-800 bg-gray-900/50 text-gray-300 hover:border-gray-700"
                  }`}
                >
                  <span className={`h-3 w-3 rounded-full ${THEME_PREVIEW_DOT[id]}`} aria-hidden />
                  {THEME_LABELS[id]}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-300">Store title</label>
              <input
                className={input}
                value={storeTitle}
                onChange={(e) => setStoreTitle(e.target.value)}
                placeholder={profile.display_name ?? profile.username}
                maxLength={120}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Tagline</label>
              <input
                className={input}
                value={storeTagline}
                onChange={(e) => setStoreTagline(e.target.value)}
                placeholder="Premium Paper plugins for competitive Minecraft servers"
                maxLength={200}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">Banner image URL</label>
            <input
              className={`${input} font-mono text-xs sm:text-sm`}
              value={storeBannerUrl}
              onChange={(e) => setStoreBannerUrl(e.target.value)}
              placeholder="https://… (any HTTPS image)"
              maxLength={2000}
            />
            <p className="mt-1 text-xs text-gray-500">
              Shown behind your hero. Use a wide image (e.g. 1600×600). Hosted on your CDN or Supabase public bucket.
            </p>
            {storeBannerUrl.trim() ? (
              <div className="relative mt-3 aspect-[21/9] max-h-40 w-full overflow-hidden rounded-xl border border-gray-800 bg-gray-900">
                {/* eslint-disable-next-line @next/next/no-img-element -- user-provided URL from any host */}
                <img src={storeBannerUrl.trim()} alt="Banner preview" className="h-full w-full object-cover" />
              </div>
            ) : null}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">Storefront icon (PFP) URL</label>
            <input
              className={`${input} font-mono text-xs sm:text-sm`}
              value={storeIconUrl}
              onChange={(e) => setStoreIconUrl(e.target.value)}
              placeholder="https://… (any HTTPS image)"
              maxLength={2000}
            />
            <p className="mt-1 text-xs text-gray-500">
              Rendered as a circular avatar in your hero header. If empty, it falls back to initials.
            </p>
            {storeIconUrl.trim() ? (
              <div className="relative mt-3 flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element -- user-provided URL from any host */}
                <img
                  src={storeIconUrl.trim()}
                  alt="Icon preview"
                  className="h-14 w-14 rounded-full border border-gray-800 bg-gray-950 object-cover"
                />
                <div className="text-xs text-gray-500">
                  Tip: square images look best.
                </div>
              </div>
            ) : null}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">About (Markdown)</label>
            <p className="mt-1 text-xs text-gray-500">
              Edit on the left, live preview on the right — same as plugin descriptions. Blank lines and line breaks
              are preserved on your public storefront.
            </p>
            <div className="mt-3" data-color-mode="dark">
              <MDEditor
                value={storeBio}
                onChange={(v) => {
                  const next = String(v ?? "");
                  setStoreBio(next.length > 4000 ? next.slice(0, 4000) : next);
                }}
                height={320}
                preview="live"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">{storeBio.length} / 4000 characters</p>
          </div>
        </div>
      ) : null}

      {tab === "presence" ? (
        <div className="space-y-5 rounded-2xl border border-gray-800/80 bg-gray-950/30 p-6">
          <p className="text-xs text-gray-500">
            Icons appear on your storefront header. All URLs must be <span className="text-gray-400">https://</span>.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-300">Website</label>
              <input
                className={input}
                value={storeWebsiteUrl}
                onChange={(e) => setStoreWebsiteUrl(e.target.value)}
                placeholder="https://your-site.dev"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">GitHub</label>
              <input
                className={`${input} font-mono text-xs`}
                value={storeGithubUrl}
                onChange={(e) => setStoreGithubUrl(e.target.value)}
                placeholder="https://github.com/you"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Discord invite</label>
              <input
                className={`${input} font-mono text-xs`}
                value={storeDiscordUrl}
                onChange={(e) => setStoreDiscordUrl(e.target.value)}
                placeholder="https://discord.gg/…"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">X / Twitter</label>
              <input
                className={`${input} font-mono text-xs`}
                value={storeTwitterUrl}
                onChange={(e) => setStoreTwitterUrl(e.target.value)}
                placeholder="https://x.com/…"
              />
            </div>
          </div>
        </div>
      ) : null}

      {tab === "domain" ? (
        <div className="space-y-5 rounded-2xl border border-gray-800/80 bg-gray-950/30 p-6">
          <div>
            <label className="block text-sm font-medium text-gray-300">Vanity slug</label>
            <input
              className={`${input} font-mono`}
              value={storeSlug}
              onChange={(e) => setStoreSlug(e.target.value.toLowerCase())}
              placeholder={profile.username}
              maxLength={32}
            />
            <p className="mt-1 text-xs text-gray-500">
              URL: <span className="font-mono text-gray-400">/store/{storeSlug || profile.username}</span>
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Custom domain</label>
            <input
              className={`${input} font-mono`}
              value={customDomain}
              onChange={(e) => setCustomDomain(e.target.value.toLowerCase())}
              placeholder="plugins.yourstudio.com"
              maxLength={200}
            />
            <p className="mt-1 text-xs text-gray-500">
              Enter only the hostname. Example: <span className="font-mono">store.kartersanamo.com</span>.
            </p>
            {profile.custom_domain_status ? (
              <p className="mt-2 text-xs text-gray-400">
                Status: <span className="text-gray-200">{profile.custom_domain_status}</span>
              </p>
            ) : null}
            {customDomain.trim() ? (
              <div className="mt-3 space-y-3 rounded-xl border border-gray-800 bg-gray-900/40 p-4 text-xs text-gray-400">
                <p className="font-medium text-gray-300">DNS setup</p>
                <p>
                  1) Add CNAME: <span className="font-mono text-gray-200">{customDomain.trim()}</span> →{" "}
                  <span className="font-mono text-gray-200">
                    {(() => {
                      try {
                        return new URL(
                          process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
                        ).hostname;
                      } catch {
                        return "your-app-host";
                      }
                    })()}
                  </span>
                </p>
                <p>
                  2) Add TXT: <span className="font-mono text-gray-200">
                    _mcmmerchant-challenge.{customDomain.trim()}
                  </span>{" "}
                  ={" "}
                  <span className="font-mono text-gray-200">
                    {profile.custom_domain_verification_token ?? "(save first to generate token)"}
                  </span>
                </p>
                <p>3) Save storefront, wait for DNS propagation, then click verify.</p>
                <button
                  type="button"
                  disabled={verifyingDomain}
                  onClick={() => void verifyDomain()}
                  className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 font-medium text-gray-200 hover:border-gray-600 disabled:opacity-60"
                >
                  {verifyingDomain ? "Verifying..." : "Verify custom domain"}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-brand-500 px-6 py-2.5 text-sm font-semibold text-gray-950 shadow-sm transition hover:brightness-110 disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save storefront"}
        </button>
        <Link
          href={publicPath}
          className="rounded-xl border border-gray-700 px-5 py-2.5 text-sm font-medium text-gray-200 hover:border-gray-600"
        >
          View live page
        </Link>
      </div>
    </form>
  );
}
