import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireVerifiedUserForApi } from "@/lib/auth/email-verification";
import {
  getStorefrontHandle,
  isMissingColumnError,
  normalizeStoreSlug,
  STOREFRONT_PROFILE_EXTENDED
} from "@/lib/storefront-profile";
import { normalizeStoreThemeInput } from "@/lib/storefront-theme";
import crypto from "node:crypto";

export const dynamic = "force-dynamic";

type PatchBody = {
  store_title?: string | null;
  store_tagline?: string | null;
  store_bio?: string | null;
  store_website_url?: string | null;
  store_slug?: string | null;
  custom_domain?: string | null;
  store_banner_url?: string | null;
  store_icon_url?: string | null;
  store_github_url?: string | null;
  store_discord_url?: string | null;
  store_twitter_url?: string | null;
  store_theme?: string | null;
};

function trimOrNull(v: unknown, max: number): string | null {
  if (v == null) return null;
  if (typeof v !== "string") return null;
  const t = v.trim();
  if (!t) return null;
  return t.slice(0, max);
}

function sanitizeUrl(v: string | null): string | null {
  if (!v) return null;
  try {
    const u = new URL(v);
    if (u.protocol !== "https:" && u.protocol !== "http:") return null;
    return u.toString();
  } catch {
    return null;
  }
}

function normalizeCustomDomain(v: string | null): { domain: string | null; error?: string } {
  if (!v) return { domain: null };
  const d = v.trim().toLowerCase().replace(/\.$/, "");
  if (!d) return { domain: null };
  if (d.includes("://") || d.includes("/") || d.includes(":")) {
    return { domain: null, error: "Custom domain must be a hostname only (for example: store.yourdomain.com)." };
  }
  if (!d.includes(".")) {
    return { domain: null, error: "Custom domain must include a valid TLD." };
  }
  if (d.startsWith("www.")) {
    return { domain: null, error: "Use the exact hostname you want, for example store.yourdomain.com (not www)." };
  }
  const labelOk = d.split(".").every((p) => /^[a-z0-9-]+$/.test(p) && !p.startsWith("-") && !p.endsWith("-"));
  if (!labelOk) {
    return { domain: null, error: "Custom domain contains invalid characters." };
  }
  return { domain: d };
}

export async function PATCH(req: Request) {
  const gate = await requireVerifiedUserForApi();
  if (gate instanceof NextResponse) return gate;
  const { userId } = gate;

  let body: PatchBody;
  try {
    body = (await req.json()) as PatchBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const supabase = createSupabaseServerClient();
  const { data: currentProfile, error: currentProfileError } = await supabase
    .from("profiles")
    .select("id, username, store_slug, custom_domain")
    .eq("id", userId)
    .maybeSingle();
  if (currentProfileError) {
    if (isMissingColumnError(currentProfileError)) {
      return NextResponse.json(
        {
          error:
            "Storefront columns are not in your database yet. Run the SQL in docs/STOREFRONT_PLATFORM.md.",
          upgradeRequired: true
        },
        { status: 422 }
      );
    }
    return NextResponse.json({ error: currentProfileError.message }, { status: 500 });
  }
  if (!currentProfile) {
    return NextResponse.json({ error: "Profile not found for current user." }, { status: 404 });
  }

  const payload: Record<string, string | null> = {};

  if ("store_title" in body) {
    payload.store_title = trimOrNull(body.store_title, 120);
  }
  if ("store_tagline" in body) {
    payload.store_tagline = trimOrNull(body.store_tagline, 200);
  }
  if ("store_bio" in body) {
    payload.store_bio = trimOrNull(body.store_bio, 4000);
  }
  if ("store_website_url" in body) {
    const t = trimOrNull(body.store_website_url, 500);
    payload.store_website_url = sanitizeUrl(t);
  }
  if ("custom_domain" in body) {
    const parsed = normalizeCustomDomain(trimOrNull(body.custom_domain, 200));
    if (parsed.error) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }
    if (parsed.domain) {
      const appHosts = new Set<string>();
      try {
        const appBase = process.env.NEXT_PUBLIC_APP_URL;
        if (appBase) appHosts.add(new URL(appBase).hostname.toLowerCase());
      } catch {}
      try {
        const siteBase = process.env.NEXT_PUBLIC_SITE_URL;
        if (siteBase) appHosts.add(new URL(siteBase).hostname.toLowerCase());
      } catch {}
      if (appHosts.has(parsed.domain)) {
        return NextResponse.json(
          { error: "Custom domain cannot be the same as your app domain." },
          { status: 400 }
        );
      }
      const { data: taken } = await supabase
        .from("profiles")
        .select("id")
        .eq("custom_domain", parsed.domain)
        .neq("id", userId)
        .maybeSingle();
      if (taken) {
        return NextResponse.json({ error: "That custom domain is already claimed." }, { status: 409 });
      }
    }
    const domainChanged = (currentProfile.custom_domain ?? null) !== parsed.domain;
    payload.custom_domain = parsed.domain;
    payload.custom_domain_status = parsed.domain ? (domainChanged ? "pending" : "pending") : null;
    payload.custom_domain_verified_at = null;
    payload.custom_domain_last_checked_at = null;
    payload.custom_domain_verification_token = parsed.domain
      ? crypto.createHash("sha256").update(`${userId}:${parsed.domain}`).digest("hex").slice(0, 32)
      : null;
  }
  if ("store_banner_url" in body) {
    payload.store_banner_url = sanitizeUrl(trimOrNull(body.store_banner_url, 2000));
  }
  if ("store_icon_url" in body) {
    payload.store_icon_url = sanitizeUrl(trimOrNull(body.store_icon_url, 2000));
  }
  if ("store_github_url" in body) {
    payload.store_github_url = sanitizeUrl(trimOrNull(body.store_github_url, 500));
  }
  if ("store_discord_url" in body) {
    payload.store_discord_url = sanitizeUrl(trimOrNull(body.store_discord_url, 500));
  }
  if ("store_twitter_url" in body) {
    payload.store_twitter_url = sanitizeUrl(trimOrNull(body.store_twitter_url, 500));
  }
  if ("store_theme" in body) {
    payload.store_theme = normalizeStoreThemeInput(body.store_theme);
  }

  if ("store_slug" in body) {
    const slugResult = normalizeStoreSlug(
      body.store_slug == null ? "" : String(body.store_slug)
    );
    if (slugResult.error) {
      return NextResponse.json({ error: slugResult.error }, { status: 400 });
    }
    if (slugResult.slug) {
      const { data: taken } = await supabase
        .from("profiles")
        .select("id")
        .eq("store_slug", slugResult.slug)
        .neq("id", userId)
        .maybeSingle();
      if (taken) {
        return NextResponse.json(
          { error: "That store URL is already taken. Choose another slug." },
          { status: 409 }
        );
      }
    }
    payload.store_slug = slugResult.slug;
    if ((currentProfile.store_slug ?? null) !== slugResult.slug && currentProfile.custom_domain) {
      payload.custom_domain_status = "pending";
      payload.custom_domain_verified_at = null;
      payload.custom_domain_last_checked_at = null;
      payload.custom_domain_verification_token = crypto
        .createHash("sha256")
        .update(`${userId}:${currentProfile.custom_domain}:${slugResult.slug ?? currentProfile.username}`)
        .digest("hex")
        .slice(0, 32);
    }
  }

  if (Object.keys(payload).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const { error } = await supabase.from("profiles").update(payload).eq("id", userId);

  if (error) {
    if (isMissingColumnError(error)) {
      return NextResponse.json(
        {
          error:
            "Storefront columns are not in your database yet. Run the SQL in docs/STOREFRONT_PLATFORM.md.",
          upgradeRequired: true
        },
        { status: 422 }
      );
    }
    console.error("storefront PATCH:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const sel = await supabase
    .from("profiles")
    .select(STOREFRONT_PROFILE_EXTENDED)
    .eq("id", userId)
    .maybeSingle();

  if (sel.error && !isMissingColumnError(sel.error)) {
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: true, profile: sel.data ?? null });
}
