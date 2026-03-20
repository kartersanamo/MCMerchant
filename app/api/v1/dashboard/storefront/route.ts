import { NextResponse } from "next/server";
import { createSupabaseServerClient, getAuthedUserId } from "@/lib/supabase/server";
import {
  isMissingColumnError,
  normalizeStoreSlug,
  STOREFRONT_PROFILE_EXTENDED
} from "@/lib/storefront-profile";
import { normalizeStoreThemeInput } from "@/lib/storefront-theme";

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

export async function PATCH(req: Request) {
  const userId = await getAuthedUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: PatchBody;
  try {
    body = (await req.json()) as PatchBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const supabase = createSupabaseServerClient();

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
    payload.custom_domain = trimOrNull(body.custom_domain, 200)?.toLowerCase() ?? null;
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
