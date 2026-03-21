import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

function normalizeHost(input: string | null): string {
  if (!input) return "";
  return input.split(":")[0].trim().toLowerCase();
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
  if (!primaryHosts.has(host) && pathname === "/") {
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

  if (!needsAuth && !needsVerified) return NextResponse.next();

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
