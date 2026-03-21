import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q") ?? "";
  const categories = url.searchParams.getAll("category").filter((c) => c && c !== "any");
  const priceModes = url.searchParams.getAll("priceMode").filter((p) => p && p !== "any");
  const minecraftVersions = url.searchParams.getAll("minecraftVersion").filter((v) => v && v !== "any");
  const serverPlatforms = url.searchParams.getAll("serverPlatform").filter((s) => s && s !== "any");

  const supabase = createSupabaseServerClient();

  function applyCommonFilters<T extends any>(query: T): T {
    let next = query;
    if (categories.length > 0) {
      next = next.in("category", categories);
    }
    const onlyFree = priceModes.length === 1 && priceModes[0] === "free";
    const onlyPaid = priceModes.length === 1 && priceModes[0] === "paid";
    if (onlyFree) next = next.eq("price_cents", 0);
    if (onlyPaid) next = next.gt("price_cents", 0);
    return next;
  }

  const baseQuery = () =>
    applyCommonFilters(
      supabase
        .from("plugins")
        .select("id, slug, name, tagline, cover_image_url, price_cents, total_downloads, seller_id, category")
        .eq("status", "published")
        .limit(30)
    );

  const term = q.trim();
  let plugins: any[] = [];
  let error: any = null;

  if (!term) {
    const res = await baseQuery();
    plugins = res.data ?? [];
    error = res.error;
  } else {
    const like = `%${term}%`;
    const [{ data: nameMatches, error: nameError }, { data: sellerProfiles }] = await Promise.all([
      baseQuery().or(`name.ilike.${like},tagline.ilike.${like}`),
      supabase.from("profiles").select("id").ilike("username", like).limit(50)
    ]);

    const sellerIds = (sellerProfiles ?? []).map((p: any) => p.id).filter(Boolean);
    let sellerPlugins: any[] = [];
    if (sellerIds.length > 0) {
      const sellerRes = await baseQuery().in("seller_id", sellerIds);
      sellerPlugins = sellerRes.data ?? [];
    }

    const byId = new Map<string, any>();
    [...(nameMatches ?? []), ...sellerPlugins].forEach((p: any) => byId.set(p.id, p));
    plugins = Array.from(byId.values()).slice(0, 30);
    error = nameError;
  }

  if (error || !plugins) {
    return NextResponse.json({ plugins: [] }, { status: 200 });
  }

  const pluginIds = plugins.map((p: any) => p.id as string);

  // Latest version filters: Minecraft version(s) and/or server platform(s).
  let compatiblePluginIds = new Set(pluginIds);
  if (minecraftVersions.length > 0 || serverPlatforms.length > 0) {
    let versions: any[] = [];
    let hasServerPlatformColumn = true;

    try {
      const { data } = await supabase
        .from("plugin_versions")
        .select("plugin_id, minecraft_versions, server_platform")
        .eq("is_latest", true)
        .in("plugin_id", pluginIds);
      versions = data ?? [];
    } catch {
      // If the schema doesn't have `server_platform` yet, fall back to mc-only matching.
      hasServerPlatformColumn = false;
      const { data } = await supabase
        .from("plugin_versions")
        .select("plugin_id, minecraft_versions")
        .eq("is_latest", true)
        .in("plugin_id", pluginIds);
      versions = data ?? [];
    }

    const compat = new Set<string>();
    (versions ?? []).forEach((v: any) => {
      const raw = v.minecraft_versions;
      const mcList: string[] = Array.isArray(raw)
        ? raw
        : typeof raw === "string"
          ? raw.split(",").map((s: string) => s.trim()).filter(Boolean)
          : [];
      const matchesMc =
        minecraftVersions.length === 0 || minecraftVersions.some((mv) => mcList.includes(mv));
      const matchesPlatform = (() => {
        if (!hasServerPlatformColumn) return true; // can't filter without the column
        if (serverPlatforms.length === 0) return true;
        const vPlatform = v.server_platform ? String(v.server_platform).trim() : "";
        return vPlatform && serverPlatforms.includes(vPlatform);
      })();

      if (matchesMc && matchesPlatform) compat.add(v.plugin_id);
    });
    compatiblePluginIds = compat;
  }

  const filteredPlugins = plugins.filter((p: any) => compatiblePluginIds.has(p.id));

  // Seller usernames
  const sellerIds = Array.from(new Set(filteredPlugins.map((p: any) => p.seller_id)));
  const { data: profiles } = sellerIds.length
    ? await supabase
        .from("profiles")
        .select("id, username")
        .in("id", sellerIds)
    : { data: [] as any[] };

  const usernameById = new Map<string, string>(
    (profiles ?? []).map((u: any) => [u.id, u.username])
  );

  // Rating (average of reviews) computed in route logic.
  const { data: reviews } = sellerIds.length
    ? await supabase
        .from("reviews")
        .select("plugin_id, rating")
        .in("plugin_id", filteredPlugins.map((p: any) => p.id))
    : { data: [] as any[] };

  const ratingsByPlugin = new Map<string, { sum: number; count: number }>();
  (reviews ?? []).forEach((r: any) => {
    const pid = r.plugin_id;
    const cur = ratingsByPlugin.get(pid) ?? { sum: 0, count: 0 };
    cur.sum += Number(r.rating ?? 0);
    cur.count += 1;
    ratingsByPlugin.set(pid, cur);
  });

  const pluginsOut = filteredPlugins.map((p: any) => {
    const agg = ratingsByPlugin.get(p.id);
    const rating = agg && agg.count ? agg.sum / agg.count : 4.2;

    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      tagline: p.tagline,
      cover_image_url: p.cover_image_url,
      seller_username: usernameById.get(p.seller_id) ?? "Unknown",
      rating,
      price_cents: p.price_cents ?? 0,
      total_downloads: p.total_downloads ?? 0
    };
  });

  return NextResponse.json({ plugins: pluginsOut }, { status: 200 });
}

