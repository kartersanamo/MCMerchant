"use client";

import { useMemo, useState } from "react";
import { PluginCard, type PluginCardData } from "@/components/plugin-card";
import { getCategoryLabel } from "@/lib/constants/categories";
import type { StorefrontThemeClasses } from "@/lib/storefront-theme";

export type StorefrontCatalogItem = PluginCardData & {
  category: string | null;
  tags: string[] | null;
  updated_at: string;
};

type SortId = "popular" | "newest" | "rating" | "price_low" | "price_high";
type PriceFilter = "all" | "free" | "paid";

type Props = {
  items: StorefrontCatalogItem[];
  theme: StorefrontThemeClasses;
};

export function StorefrontCatalog({ items, theme }: Props) {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortId>("popular");
  const [price, setPrice] = useState<PriceFilter>("all");
  const [category, setCategory] = useState<string | "all">("all");

  const categories = useMemo(() => {
    const s = new Set<string>();
    items.forEach((i) => {
      if (i.category) s.add(i.category);
    });
    return Array.from(s).sort((a, b) => getCategoryLabel(a).localeCompare(getCategoryLabel(b)));
  }, [items]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let list = items.slice();

    if (needle) {
      list = list.filter((i) => {
        const tags = (i.tags ?? []).join(" ").toLowerCase();
        return (
          i.name.toLowerCase().includes(needle) ||
          (i.tagline ?? "").toLowerCase().includes(needle) ||
          tags.includes(needle) ||
          (i.category ?? "").toLowerCase().includes(needle)
        );
      });
    }

    if (price === "free") list = list.filter((i) => (i.price_cents ?? 0) <= 0);
    if (price === "paid") list = list.filter((i) => (i.price_cents ?? 0) > 0);
    if (category !== "all") list = list.filter((i) => i.category === category);

    list.sort((a, b) => {
      switch (sort) {
        case "newest":
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        case "rating":
          return (b.rating ?? 0) - (a.rating ?? 0);
        case "price_low":
          return (a.price_cents ?? 0) - (b.price_cents ?? 0);
        case "price_high":
          return (b.price_cents ?? 0) - (a.price_cents ?? 0);
        case "popular":
        default:
          return (b.total_downloads ?? 0) - (a.total_downloads ?? 0);
      }
    });

    return list;
  }, [items, q, sort, price, category]);

  const selectClass =
    "rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-sm text-gray-100 focus:border-gray-600 focus:outline-none focus:ring-1 focus:ring-brand-500/40";

  const chip = (active: boolean, onClick: () => void, label: string) => (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
        active ? theme.pillActive : theme.pillIdle
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex-1">
          <label htmlFor="storefront-search" className="sr-only">
            Search plugins
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" aria-hidden>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              id="storefront-search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name, tagline, tags…"
              className="w-full rounded-xl border border-gray-800 bg-gray-950 py-3 pl-10 pr-4 text-sm text-gray-100 placeholder:text-gray-600 focus:border-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <select className={selectClass} value={sort} onChange={(e) => setSort(e.target.value as SortId)} aria-label="Sort">
            <option value="popular">Most downloads</option>
            <option value="newest">Newest</option>
            <option value="rating">Highest rated</option>
            <option value="price_low">Price: low → high</option>
            <option value="price_high">Price: high → low</option>
          </select>
          <select
            className={selectClass}
            value={price}
            onChange={(e) => setPrice(e.target.value as PriceFilter)}
            aria-label="Price"
          >
            <option value="all">All prices</option>
            <option value="free">Free only</option>
            <option value="paid">Paid only</option>
          </select>
        </div>
      </div>

      {categories.length ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wider text-gray-500">Category</span>
          {chip(category === "all", () => setCategory("all"), "All")}
          {categories.map((c) =>
            chip(category === c, () => setCategory(c), getCategoryLabel(c))
          )}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-800/80 pb-3 text-sm text-gray-400">
        <span>
          Showing <span className="font-medium text-gray-200">{filtered.length}</span>
          {filtered.length === 1 ? " plugin" : " plugins"}
          {items.length !== filtered.length ? (
            <span className="text-gray-500">
              {" "}
              (of {items.length})
            </span>
          ) : null}
        </span>
        {q || category !== "all" || price !== "all" ? (
          <button
            type="button"
            onClick={() => {
              setQ("");
              setCategory("all");
              setPrice("all");
              setSort("popular");
            }}
            className={`text-xs font-medium ${theme.accentText} hover:underline`}
          >
            Reset filters
          </button>
        ) : null}
      </div>

      {filtered.length ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => (
            <PluginCard key={p.id} plugin={p} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-gray-700 bg-gray-950/40 py-16 text-center">
          <p className="text-sm text-gray-400">No plugins match your filters.</p>
          <button
            type="button"
            onClick={() => {
              setQ("");
              setCategory("all");
              setPrice("all");
            }}
            className={`mt-3 text-sm font-medium ${theme.accentText} hover:underline`}
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
