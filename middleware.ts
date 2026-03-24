import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

function normalizeHost(input: string | null): string {
  if (!input) return "";
  return input.split(":")[0].trim().toLowerCase();
}

/** Public hostname from env, or null for localhost / missing. */
function getCanonicalHostname(): string | null {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim() || process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return null;
  try {
    const h = new URL(raw.replace(/\/$/, "")).hostname.toLowerCase();
    if (!h || h === "localhost" || h === "127.0.0.1") return null;
    return h;
  } catch {
    return null;
  }
}

function isLocalDevHost(host: string) {
  return host === "localhost" || host === "127.0.0.1" || host.endsWith(".local");
}

/** Hostnames that should resolve to the same site as canonical (www ↔ apex). */
function hostVariantsForCanonical(canonicalHost: string): Set<string> {
  const v = new Set<string>([canonicalHost]);
  if (canonicalHost.startsWith("www.")) {
    v.add(canonicalHost.slice(4));
  } else {
    v.add(`www.${canonicalHost}`);
  }
  return v;
}

/**
 * Enforce https:// + single hostname from NEXT_PUBLIC_APP_URL (or SITE_URL) in production.
 * Skips: previews, dev, *.vercel.app, and any host that is not an alias of the canonical domain
 * (so seller custom domains keep working).
 */
function shouldEnforceCanonicalHostRedirect(): boolean {
  if (process.env.DISABLE_CANONICAL_REDIRECT === "1") return false;
  if (process.env.VERCEL_ENV === "preview" || process.env.VERCEL_ENV === "development") return false;
  if (process.env.NODE_ENV !== "production") return false;
  return true;
}

function canonicalHostRedirect(req: NextRequest): NextResponse | null {
  const host = normalizeHost(req.headers.get("host"));
  if (!host || isLocalDevHost(host)) return null;
  if (!shouldEnforceCanonicalHostRedirect()) return null;

  const canonical = getCanonicalHostname();
  if (!canonical) return null;

  if (host.endsWith(".vercel.app")) return null;

  const variants = hostVariantsForCanonical(canonical);
  if (!variants.has(host)) return null;

  const fwd = req.headers.get("x-forwarded-proto");
  const proto =
    fwd ?? (req.nextUrl.protocol.replace(":", "") === "https" ? "https" : "http");

  const wrongProto = proto !== "https";
  const wrongHost = host !== canonical;
  if (!wrongProto && !wrongHost) return null;

  const target = req.nextUrl.clone();
  target.protocol = "https:";
  target.hostname = canonical;
  target.port = "";

  return NextResponse.redirect(target, 301);
}

function getPrimaryHosts(): Set<string> {
  const hosts = new Set<string>(["localhost", "127.0.0.1"]);
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (appUrl) hosts.add(new URL(appUrl).hostname.toLowerCase());
  } catch {}
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (siteUrl) hosts.add(new URL(siteUrl).hostname.toLowerCase());
  } catch {}
  return hosts;
}

function isEmailVerified(user: { email_confirmed_at?: string | null; confirmed_at?: string | null }) {
  return !!(user.email_confirmed_at ?? user.confirmed_at);
}

function requiresEmailVerification(pathname: string) {
  if (pathname.startsWith("/dashboard/storefront")) return true;
  if (pathname.startsWith("/dashboard/plugins")) return true;
  if (pathname.startsWith("/dashboard/payouts")) return true;
  if (pathname.startsWith("/dashboard/sales")) return true;
  if (pathname.startsWith("/loader/install")) return true;
  return false;
}

function isAuthWall(pathname: string) {
  return pathname.startsWith("/dashboard") || pathname.startsWith("/account");
}

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  const canonicalRedirect = canonicalHostRedirect(req);
  if (canonicalRedirect) return canonicalRedirect;

  // Supabase sometimes sends users to the project "Site URL" root with ?code=...
  // Forward to the real OAuth callback route.
  if (pathname === "/" && req.nextUrl.searchParams.has("code")) {
    const callback = new URL(req.url);
    callback.pathname = "/auth/callback";
    return NextResponse.redirect(callback);
  }

  const host = normalizeHost(req.headers.get("host"));
  const primaryHosts = getPrimaryHosts();

  const needsAuth = isAuthWall(pathname) || pathname.startsWith("/loader/install");
  const needsVerified = requiresEmailVerification(pathname);
  const onPrimaryHost = primaryHosts.has(host);
  /** Custom domain landing `/` may rewrite to a storefront — needs DB lookup. */
  const needsCustomDomainHomeRewrite = !onPrimaryHost && pathname === "/";

  if (!needsAuth && !needsVerified && !needsCustomDomainHomeRewrite) {
    return NextResponse.next();
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next();
  }

  const res = NextResponse.next();

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return req.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
        cookiesToSet.forEach(({ name, value, options }) => {
          res.cookies.set(name, value, options as any);
        });
      }
    }
  });

  // Custom-domain storefront routing:
  // If host is not one of our primary hosts and the user opens `/`,
  // resolve the domain to a verified seller storefront.
  if (needsCustomDomainHomeRewrite) {
    const { data: domainProfile } = await supabase
      .from("profiles")
      .select("username, store_slug")
      .eq("custom_domain", host)
      .eq("custom_domain_status", "verified")
      .maybeSingle();
    if (domainProfile) {
      const handle = domainProfile.store_slug?.trim() || domainProfile.username;
      const rewriteUrl = req.nextUrl.clone();
      rewriteUrl.pathname = `/store/${encodeURIComponent(handle)}`;
      rewriteUrl.search = search;
      return NextResponse.rewrite(rewriteUrl);
    }
  }

  if (!needsAuth && !needsVerified) {
    return NextResponse.next();
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    if (!needsAuth) return NextResponse.next();
    const redirectTo = `${pathname}${search}`;
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", redirectTo);
    return NextResponse.redirect(loginUrl);
  }

  if (needsVerified && !isEmailVerified(user)) {
    const u = new URL("/check-email", req.url);
    u.searchParams.set("reason", "verify_email");
    if (user.email) u.searchParams.set("email", user.email);
    return NextResponse.redirect(u);
  }

  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|MCMerchantMono.png|robots.txt|sitemap.xml).*)"
  ]
};
