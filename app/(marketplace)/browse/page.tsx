"use client";

import { useEffect, useMemo, useState } from "react";
import { PluginGrid } from "@/components/plugin-grid";
import { MINECRAFT_VERSIONS, SERVER_PLATFORMS } from "@/lib/constants/minecraft";
import { PLUGIN_CATEGORIES } from "@/lib/constants/categories";

type PluginCardData = {
  id: string;
  slug: string;
  name: string;
  tagline?: string | null;
  cover_image_url?: string | null;
  seller_username: string;
  rating: number;
  price_cents: number;
  total_downloads: number;
};

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/30 p-4">
      <div className="h-36 w-full animate-pulse rounded-lg bg-gray-800" />
      <div className="mt-3 h-4 w-3/4 animate-pulse rounded bg-gray-800" />
      <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-gray-800" />
      <div className="mt-4 h-3 w-full animate-pulse rounded bg-gray-800" />
    </div>
  );
}

export default function BrowsePage() {
  const [q, setQ] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [priceModes, setPriceModes] = useState<string[]>([]);
  const [minecraftVersions, setMinecraftVersions] = useState<string[]>([]);
  const [serverPlatforms, setServerPlatforms] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const [plugins, setPlugins] = useState<PluginCardData[]>([]);

  const params = useMemo(() => {
    const u = new URLSearchParams();
    if (q.trim()) u.set("q", q.trim());
    categories.forEach((c) => u.append("category", c));
    priceModes.forEach((p) => u.append("priceMode", p));
    minecraftVersions.forEach((v) => u.append("minecraftVersion", v));
    serverPlatforms.forEach((s) => u.append("serverPlatform", s));
    return u;
  }, [q, categories, priceModes, minecraftVersions, serverPlatforms]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetch(`/api/v1/plugins/search?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        setPlugins(data.plugins ?? []);
      })
      .catch(() => {
        if (cancelled) return;
        setPlugins([]);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [params]);

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="rounded-xl border border-gray-800 bg-gray-900/30 p-4">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-medium text-gray-200">Filters</div>
                <div className="mt-1 text-xs text-gray-400">Select one or more per filter. Empty = any.</div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setCategories([]);
                  setPriceModes([]);
                  setMinecraftVersions([]);
                  setServerPlatforms([]);
                }}
                className="shrink-0 rounded-md border border-gray-700 bg-gray-800 px-2.5 py-1.5 text-xs font-medium text-gray-300 hover:border-gray-600 hover:bg-gray-700 hover:text-gray-100"
              >
                Clear all
              </button>
            </div>

            <div>
              <div className="flex items-center justify-between gap-2">
                <label className="block text-xs text-gray-400">Category</label>
                {categories.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => setCategories([])}
                    className="text-xs text-gray-500 hover:text-gray-300"
                  >
                    Clear
                  </button>
                ) : null}
              </div>
              <select
                multiple
                size={6}
                value={categories}
                onChange={(e) =>
                  setCategories(Array.from(e.target.selectedOptions, (o) => o.value))
                }
                className="mt-1 w-full rounded-md border border-gray-800 bg-gray-950 px-2 py-1.5 text-sm text-gray-100"
              >
                {PLUGIN_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
              <p className="mt-0.5 text-xs text-gray-500">Ctrl/Cmd to select multiple</p>
            </div>

            <div>
              <div className="flex items-center justify-between gap-2">
                <label className="block text-xs text-gray-400">Price</label>
                {priceModes.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => setPriceModes([])}
                    className="text-xs text-gray-500 hover:text-gray-300"
                  >
                    Clear
                  </button>
                ) : null}
              </div>
              <select
                multiple
                size={3}
                value={priceModes}
                onChange={(e) =>
                  setPriceModes(Array.from(e.target.selectedOptions, (o) => o.value))
                }
                className="mt-1 w-full rounded-md border border-gray-800 bg-gray-950 px-2 py-1.5 text-sm text-gray-100"
              >
                <option value="free">Free</option>
                <option value="paid">Paid</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between gap-2">
                <label className="block text-xs text-gray-400">Minecraft version</label>
                {minecraftVersions.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => setMinecraftVersions([])}
                    className="text-xs text-gray-500 hover:text-gray-300"
                  >
                    Clear
                  </button>
                ) : null}
              </div>
              <select
                multiple
                size={6}
                value={minecraftVersions}
                onChange={(e) =>
                  setMinecraftVersions(Array.from(e.target.selectedOptions, (o) => o.value))
                }
                className="mt-1 w-full rounded-md border border-gray-800 bg-gray-950 px-2 py-1.5 text-sm text-gray-100"
              >
                {MINECRAFT_VERSIONS.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
              <p className="mt-0.5 text-xs text-gray-500">Ctrl/Cmd to select multiple</p>
            </div>

            <div>
              <div className="flex items-center justify-between gap-2">
                <label className="block text-xs text-gray-400">Server platform</label>
                {serverPlatforms.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => setServerPlatforms([])}
                    className="text-xs text-gray-500 hover:text-gray-300"
                  >
                    Clear
                  </button>
                ) : null}
              </div>
              <select
                multiple
                size={6}
                value={serverPlatforms}
                onChange={(e) =>
                  setServerPlatforms(Array.from(e.target.selectedOptions, (o) => o.value))
                }
                className="mt-1 w-full rounded-md border border-gray-800 bg-gray-950 px-2 py-1.5 text-sm text-gray-100"
              >
                {SERVER_PLATFORMS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <p className="mt-0.5 text-xs text-gray-500">Ctrl/Cmd to select multiple</p>
            </div>
          </div>
        </aside>

        <section>
          <div className="flex items-center gap-3">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search plugins by name or tagline..."
              className="w-full rounded-md border border-gray-800 bg-gray-950 px-3 py-2 text-gray-100 placeholder:text-gray-500"
            />
          </div>

          <div className="mt-6">
            {loading ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : plugins.length === 0 ? (
              <div className="rounded-xl border border-gray-800 bg-gray-900/30 p-6 text-sm text-gray-300">
                No plugins found. Try a different search or filter.
              </div>
            ) : (
              <PluginGrid plugins={plugins} />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

