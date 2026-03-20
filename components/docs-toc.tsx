"use client";

import { useMemo, useState } from "react";

export type DocsTocItem = {
  id: string;
  title: string;
  group?: string;
};

export function DocsToc({
  items,
  defaultGroup,
  title
}: {
  items: DocsTocItem[];
  defaultGroup?: string;
  title?: string;
}) {
  const [query, setQuery] = useState("");

  const normalizedQuery = query.trim().toLowerCase();

  const groups = useMemo(() => {
    const result = new Map<string, DocsTocItem[]>();
    for (const item of items) {
      const group = item.group ?? defaultGroup ?? "Docs";
      const list = result.get(group) ?? [];
      list.push(item);
      result.set(group, list);
    }
    return result;
  }, [items, defaultGroup]);

  const filteredGroups = useMemo(() => {
    if (!normalizedQuery) return groups;
    const result = new Map<string, DocsTocItem[]>();
    for (const [group, list] of groups.entries()) {
      const filtered = list.filter((i) => i.title.toLowerCase().includes(normalizedQuery));
      if (filtered.length) result.set(group, filtered);
    }
    return result;
  }, [groups, normalizedQuery]);

  return (
    <aside className="sticky top-[5.5rem] max-h-[calc(100vh-6rem)] overflow-auto rounded-2xl border border-gray-800/80 bg-gray-950/40 p-4 shadow-lg shadow-black/20">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            {title ?? "Table of Contents"}
          </p>
        </div>
      </div>

      <div className="mt-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search docs…"
          className="w-full rounded-lg border border-gray-800 bg-gray-900/50 px-3 py-2 text-sm text-gray-100 placeholder-gray-600 focus:border-brand-500/50 focus:outline-none focus:ring-1 focus:ring-brand-500/50"
        />
      </div>

      <div className="mt-4 space-y-5">
        {Array.from(filteredGroups.entries()).map(([group, groupItems]) => (
          <div key={group} className="space-y-2">
            <p className="text-xs font-semibold text-gray-600">{group}</p>
            <ul className="space-y-1">
              {groupItems.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className="block rounded-lg px-2 py-1 text-sm text-gray-300 transition hover:bg-gray-900/60 hover:text-gray-100"
                  >
                    {item.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
        {filteredGroups.size === 0 ? (
          <p className="text-sm text-gray-500">No sections match your search.</p>
        ) : null}
      </div>
    </aside>
  );
}

