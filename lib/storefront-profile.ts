import type { SupabaseClient } from "@supabase/supabase-js";

/** Columns for public seller pages + dashboard (requires migration if missing). */
export const STOREFRONT_PROFILE_EXTENDED =
  "id, username, display_name, store_title, store_tagline, store_bio, store_website_url, store_slug, custom_domain, custom_domain_status, store_banner_url, store_icon_url, store_github_url, store_discord_url, store_twitter_url, store_theme";

export const STOREFRONT_PROFILE_BASIC = "id, username, display_name";

export function isMissingColumnError(err: unknown): boolean {
  const msg = String((err as { message?: string })?.message ?? "").toLowerCase();
  const code = String((err as { code?: string })?.code ?? "");
  return (
    msg.includes("schema cache") ||
    msg.includes("does not exist") ||
    code === "42703" ||
    (msg.includes("column") && msg.includes("could not find"))
  );
}

export type StorefrontPublicProfile = {
  id: string;
  username: string;
  display_name: string | null;
  store_title?: string | null;
  store_tagline?: string | null;
  store_bio?: string | null;
  store_website_url?: string | null;
  store_slug?: string | null;
  custom_domain?: string | null;
  custom_domain_status?: string | null;
  store_banner_url?: string | null;
  store_icon_url?: string | null;
  store_github_url?: string | null;
  store_discord_url?: string | null;
  store_twitter_url?: string | null;
  store_theme?: string | null;
};

async function selectProfile(
  supabase: SupabaseClient,
  columns: string,
  field: "id" | "username" | "store_slug",
  value: string
) {
  return supabase.from("profiles").select(columns).eq(field, value).maybeSingle();
}

/**
 * Profile shown on /store/[handle] — handle matches username first, then optional store_slug.
 */
export async function getStorefrontProfileByHandle(
  supabase: SupabaseClient,
  handle: string
): Promise<StorefrontPublicProfile | null> {
  const decoded = decodeURIComponent(handle).trim();
  if (!decoded) return null;

  let useExtended = true;
  let columns = STOREFRONT_PROFILE_EXTENDED;

  let { data, error } = await selectProfile(supabase, columns, "username", decoded);

  if (error && isMissingColumnError(error)) {
    useExtended = false;
    columns = STOREFRONT_PROFILE_BASIC;
    ({ data, error } = await selectProfile(supabase, columns, "username", decoded));
  }

  if (error && !isMissingColumnError(error)) {
    return null;
  }

  if (!data && useExtended) {
    const second = await selectProfile(supabase, STOREFRONT_PROFILE_EXTENDED, "store_slug", decoded);
    if (!second.error) {
      data = second.data;
    }
  }

  if (!data) return null;
  return data as unknown as StorefrontPublicProfile;
}

export async function getStorefrontProfileForUser(
  supabase: SupabaseClient,
  userId: string
): Promise<{ profile: StorefrontPublicProfile | null; hasStorefrontColumns: boolean }> {
  let hasStorefrontColumns = true;
  let { data, error } = await selectProfile(
    supabase,
    STOREFRONT_PROFILE_EXTENDED,
    "id",
    userId
  );

  if (error && isMissingColumnError(error)) {
    hasStorefrontColumns = false;
    ({ data, error } = await selectProfile(supabase, STOREFRONT_PROFILE_BASIC, "id", userId));
  }

  if (error && !isMissingColumnError(error)) {
    return { profile: null, hasStorefrontColumns };
  }

  return {
    profile: data ? (data as unknown as StorefrontPublicProfile) : null,
    hasStorefrontColumns
  };
}

/** Public URL path for this seller (vanity slug when set). */
export function getPublicStorefrontPath(profile: StorefrontPublicProfile): string {
  const raw = profile.store_slug?.trim();
  const handle = raw && raw.length > 0 ? raw : profile.username;
  return `/store/${encodeURIComponent(handle)}`;
}

const STORE_SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{1,30}[a-z0-9])$/;

/**
 * Normalizes store_slug or returns an error message.
 */
export function normalizeStoreSlug(raw: string | null | undefined): { slug: string | null; error?: string } {
  if (raw == null || String(raw).trim() === "") {
    return { slug: null };
  }
  const s = String(raw).trim().toLowerCase();
  if (s.length < 3 || s.length > 32) {
    return { slug: null, error: "Store URL slug must be 3–32 characters." };
  }
  if (!STORE_SLUG_RE.test(s)) {
    return {
      slug: null,
      error:
        "Store URL slug must use lowercase letters, numbers, and hyphens (no leading/trailing hyphen)."
    };
  }
  return { slug: s };
}

export function getStorefrontDisplayName(profile: StorefrontPublicProfile): string {
  return (
    profile.store_title?.trim() ||
    profile.display_name?.trim() ||
    profile.username ||
    "Developer"
  );
}

export function getStorefrontInitials(profile: StorefrontPublicProfile): string {
  const base = getStorefrontDisplayName(profile);
  const parts = base.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    const a = parts[0]?.[0] ?? "";
    const b = parts[1]?.[0] ?? "";
    return `${a}${b}`.toUpperCase().slice(0, 2);
  }
  const u = (parts[0] || profile.username || "?").replace(/[^a-zA-Z0-9]/g, "");
  if (u.length >= 2) return u.slice(0, 2).toUpperCase();
  return (profile.username || "?").slice(0, 2).toUpperCase();
}
