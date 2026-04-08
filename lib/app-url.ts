/**
 * Canonical public base URL for auth redirects and emails.
 * Prefer NEXT_PUBLIC_APP_URL (inlined at build for client components) so production
 * confirmation links point at the real site, not localhost or an internal host.
 */
export function getPublicAppOrigin(): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim() || process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (raw) {
    try {
      const u = new URL(raw.replace(/\/$/, ""));
      const host = u.hostname.toLowerCase();
      // Match server: never trust localhost in env for production builds.
      if (
        process.env.NODE_ENV === "production" &&
        (host === "localhost" || host === "127.0.0.1")
      ) {
        // fall through to window
      } else {
        return u.origin;
      }
    } catch {
      // ignore invalid env
    }
  }
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return "";
}

/**
 * Prefer NEXT_PUBLIC_APP_URL when the user is on localhost so downloads hit the real deployment.
 * Otherwise "" so links stay same-origin (custom storefront domains keep working).
 */
export function getPublicApiOriginForBrowser(): string {
  if (typeof window === "undefined") return "";
  const h = window.location.hostname.toLowerCase();
  if (h !== "localhost" && h !== "127.0.0.1") return "";
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim() || process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return "";
  try {
    const u = new URL(raw.replace(/\/$/, ""));
    const eh = u.hostname.toLowerCase();
    if (eh === "localhost" || eh === "127.0.0.1") return "";
    return u.origin;
  } catch {
    return "";
  }
}

/** Public origin for redirects: canonical env, else proxy-aware forwarded host (not raw request.url). */
export function getRequestPublicOrigin(request: Request): string {
  const reqUrl = new URL(request.url);
  const canonical = getCanonicalAppOriginForServer();
  const fwdHost = request.headers.get("x-forwarded-host")?.trim() || reqUrl.host;
  const fwdProto =
    request.headers.get("x-forwarded-proto")?.trim() || reqUrl.protocol.replace(":", "");
  return canonical || `${fwdProto}://${fwdHost}`;
}

export function getEmailAuthCallbackUrl(nextPath = "/email-verified"): string {
  const origin = getPublicAppOrigin();
  return `${origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;
}

/** Canonical origin for server-side redirects (API routes). No `window`. */
export function getCanonicalAppOriginForServer(): string {
  const raw =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (raw) {
    try {
      const u = new URL(raw.replace(/\/$/, ""));
      const host = u.hostname.toLowerCase();
      // Guard against accidental production config like https://localhost:3000.
      if (
        process.env.NODE_ENV === "production" &&
        (host === "localhost" || host === "127.0.0.1")
      ) {
        // ignore and keep falling back
      } else {
        return u.origin;
      }
    } catch {
      // ignore
    }
  }
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    const host = vercel.replace(/^https?:\/\//, "");
    return `https://${host}`;
  }
  return "";
}

/** User support: open a ticket in the MCMerchant Discord server. */
export const SUPPORT_DISCORD_URL = "https://discord.gg/yhkADUBcRe" as const;

/** Optional public repo URL for the footer (HTTPS only). READMEs that link to your site help discovery over time. */
export function getPublicSourceRepoUrl(): string | null {
  const raw = process.env.NEXT_PUBLIC_GITHUB_URL?.trim();
  if (!raw) return null;
  try {
    const u = new URL(raw);
    if (u.protocol !== "https:") return null;
    return u.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}
