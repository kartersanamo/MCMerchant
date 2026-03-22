/**
 * Canonical public base URL for auth redirects and emails.
 * Prefer NEXT_PUBLIC_APP_URL (inlined at build for client components) so production
 * confirmation links point at the real site, not localhost or an internal host.
 */
export function getPublicAppOrigin(): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim() || process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (raw) {
    try {
      return new URL(raw.replace(/\/$/, "")).origin;
    } catch {
      // ignore invalid env
    }
  }
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return "";
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
      return new URL(raw.replace(/\/$/, "")).origin;
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
