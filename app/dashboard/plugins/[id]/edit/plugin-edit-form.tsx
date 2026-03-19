"use client";

import { useState } from "react";
import MDEditor from "@uiw/react-md-editor";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deletePlugin } from "@/app/dashboard/plugins/actions";
import { PLUGIN_CATEGORIES, DEFAULT_PLUGIN_CATEGORY } from "@/lib/constants/categories";

type Plugin = {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  category: string;
  tags: string[] | string;
  price_cents: number | null;
  status: string;
  cover_image_url: string | null;
};

type Version = {
  id: string;
  version: string;
  changelog: string | null;
  minecraft_versions: string[];
  created_at: string;
  download_count: number | null;
  is_latest: boolean;
};

function formatDate(input: string) {
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export function PluginEditForm({
  accountName,
  plugin,
  versions,
}: {
  accountName: string;
  plugin: Plugin;
  versions: Version[];
}) {
  const router = useRouter();
  const [name, setName] = useState(plugin.name);
  const [slug, setSlug] = useState(plugin.slug);
  const [tagline, setTagline] = useState(plugin.tagline);
  const [description, setDescription] = useState(plugin.description ?? "");
  const [category, setCategory] = useState(plugin.category ?? DEFAULT_PLUGIN_CATEGORY);
  const [tags, setTags] = useState(
    Array.isArray(plugin.tags) ? plugin.tags.join(", ") : String(plugin.tags ?? "")
  );
  const [isFree, setIsFree] = useState((plugin.price_cents ?? 0) <= 0);
  const [priceDollars, setPriceDollars] = useState(
    (plugin.price_cents ?? 0) > 0 ? ((plugin.price_cents ?? 0) / 100).toFixed(2) : "9.99"
  );
  const [status, setStatus] = useState(plugin.status);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const deleteConfirmExpected = `${accountName}/${plugin.name}`;
  const deleteConfirmValid = deleteConfirm.trim() === deleteConfirmExpected;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const formData = new FormData();
    formData.set("name", name);
    formData.set("slug", slug);
    formData.set("tagline", tagline);
    formData.set("description", description);
    formData.set("category", category);
    formData.set("tags", tags);
    formData.set("status", status);
    formData.set("is_free", String(isFree));
    formData.set("price_dollars", priceDollars);
    if (coverFile) formData.set("cover_image", coverFile);

    const res = await fetch(`/api/v1/dashboard/plugins/${plugin.id}`, {
      method: "PATCH",
      body: formData,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setMessage({ type: "err", text: (data.error as string) ?? "Failed to save" });
      setSaving(false);
      return;
    }

    setMessage({ type: "ok", text: "Changes saved." });
    setCoverFile(null);
    setSaving(false);
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <Link
        href="/dashboard/plugins"
        className="inline-flex items-center gap-1.5 text-sm text-gray-400 transition hover:text-gray-200"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to plugins
      </Link>

      <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-50">{plugin.name}</h1>
          <p className="mt-1 text-sm text-gray-400">/{plugin.slug}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              plugin.status === "published"
                ? "bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30"
                : "bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30"
            }`}
          >
            {plugin.status === "published" ? "Published" : "Draft"}
          </span>
          <Link
            href={`/plugin/${plugin.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-gray-700 bg-gray-800/80 px-3 py-1.5 text-sm text-gray-200 transition hover:border-gray-600 hover:bg-gray-800"
          >
            View on site →
          </Link>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-8">
        <section className="rounded-2xl border border-gray-800/80 bg-gray-900/40 p-6 shadow-lg shadow-black/20">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
            Overview
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-gray-500">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-1.5 w-full rounded-lg border border-gray-800 bg-gray-950/80 px-3 py-2.5 text-gray-100 placeholder-gray-500 focus:border-brand-500/50 focus:outline-none focus:ring-1 focus:ring-brand-500/50"
                placeholder="Plugin name"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500">Slug</label>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
                className="mt-1.5 w-full rounded-lg border border-gray-800 bg-gray-950/80 px-3 py-2.5 text-gray-100 placeholder-gray-500 focus:border-brand-500/50 focus:outline-none focus:ring-1 focus:ring-brand-500/50"
                placeholder="plugin-slug"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-xs font-medium text-gray-500">Tagline</label>
            <input
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              required
              className="mt-1.5 w-full rounded-lg border border-gray-800 bg-gray-950/80 px-3 py-2.5 text-gray-100 placeholder-gray-500 focus:border-brand-500/50 focus:outline-none focus:ring-1 focus:ring-brand-500/50"
              placeholder="One-line description"
            />
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-gray-500">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-gray-800 bg-gray-950/80 px-3 py-2.5 text-gray-100 focus:border-brand-500/50 focus:outline-none focus:ring-1 focus:ring-brand-500/50"
              >
                {PLUGIN_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500">Tags</label>
              <input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-gray-800 bg-gray-950/80 px-3 py-2.5 text-gray-100 placeholder-gray-500 focus:border-brand-500/50 focus:outline-none focus:ring-1 focus:ring-brand-500/50"
                placeholder="economy, tokens, balance"
              />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-800/80 bg-gray-900/40 p-6 shadow-lg shadow-black/20">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
            Pricing
          </h2>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input
                type="checkbox"
                checked={isFree}
                onChange={(e) => setIsFree(e.target.checked)}
                className="rounded border-gray-600 bg-gray-800 text-brand-500 focus:ring-brand-500/50"
              />
              Free plugin
            </label>
            {!isFree && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">$</span>
                <input
                  type="text"
                  value={priceDollars}
                  onChange={(e) => setPriceDollars(e.target.value)}
                  className="w-24 rounded-lg border border-gray-800 bg-gray-950/80 px-3 py-2 text-gray-100"
                />
              </div>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-gray-800/80 bg-gray-900/40 p-6 shadow-lg shadow-black/20">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
            Description
          </h2>
          <p className="mt-1 text-xs text-gray-500">Markdown supported.</p>
          <div className="mt-4" data-color-mode="dark">
            <MDEditor
              value={description}
              onChange={(v) => setDescription(v ?? "")}
              height={280}
              preview="live"
            />
          </div>
        </section>

        <section className="rounded-2xl border border-gray-800/80 bg-gray-900/40 p-6 shadow-lg shadow-black/20">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
            Cover image
          </h2>
          <div className="mt-4 flex flex-wrap items-start gap-6">
            {plugin.cover_image_url && !coverFile && (
              <div className="h-28 w-48 overflow-hidden rounded-xl border border-gray-800 bg-gray-950">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={plugin.cover_image_url}
                  alt="Cover"
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
                className="text-sm text-gray-400 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-500 file:px-4 file:py-2 file:text-sm file:font-medium file:text-gray-950 file:hover:bg-brand-400"
              />
              {coverFile && (
                <p className="mt-2 text-xs text-gray-500">New image will be saved on submit.</p>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-800/80 bg-gray-900/40 p-6 shadow-lg shadow-black/20">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
              Versions
            </h2>
            <Link
              href={`/dashboard/plugins/${plugin.id}/versions`}
              className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-gray-950 transition hover:brightness-110"
            >
              Add version
            </Link>
          </div>

          {versions.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-gray-700 bg-gray-950/50 p-8 text-center">
              <p className="text-sm text-gray-400">No versions yet.</p>
              <p className="mt-1 text-xs text-gray-500">Buyers need at least one version to download.</p>
              <Link
                href={`/dashboard/plugins/${plugin.id}/versions`}
                className="mt-4 inline-block rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm text-gray-200 hover:border-gray-600"
              >
                Upload first version
              </Link>
            </div>
          ) : (
            <ul className="mt-6 space-y-3">
              {versions.map((v) => (
                <li
                  key={v.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-800 bg-gray-950/50 p-4 transition hover:border-gray-700"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-100">v{v.version}</span>
                      {v.is_latest && (
                        <span className="rounded-full bg-brand-500/20 px-2 py-0.5 text-xs font-medium text-brand-300 ring-1 ring-brand-500/30">
                          Latest
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                      <span>{(v.download_count ?? 0).toLocaleString()} downloads</span>
                      <span>{formatDate(v.created_at)}</span>
                      {v.minecraft_versions?.length ? (
                        <span className="flex flex-wrap gap-1">
                          {v.minecraft_versions.slice(0, 3).map((mv) => (
                            <span
                              key={mv}
                              className="rounded bg-gray-800 px-1.5 py-0.5 text-gray-400"
                            >
                              {mv}
                            </span>
                          ))}
                          {v.minecraft_versions.length > 3 && (
                            <span className="text-gray-500">+{v.minecraft_versions.length - 3}</span>
                          )}
                        </span>
                      ) : null}
                    </div>
                    {v.changelog && (
                      <p className="mt-2 line-clamp-2 text-sm text-gray-400">{v.changelog}</p>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Link
                      href={`/dashboard/plugins/${plugin.id}/versions`}
                      className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-xs font-medium text-gray-200 hover:border-gray-600"
                    >
                      Add version
                    </Link>
                    <Link
                      href={`/plugin/${plugin.slug}`}
                      className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-xs font-medium text-gray-200 hover:border-gray-600"
                    >
                      View
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-gray-800/80 bg-gray-900/40 p-6 shadow-lg shadow-black/20">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="mt-1.5 rounded-lg border border-gray-800 bg-gray-950/80 px-3 py-2 text-gray-100 focus:border-brand-500/50 focus:outline-none focus:ring-1 focus:ring-brand-500/50"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
            <div className="flex items-center gap-3">
              {message && (
                <span
                  className={
                    message.type === "ok"
                      ? "text-sm text-emerald-400"
                      : "text-sm text-red-400"
                  }
                >
                  {message.text}
                </span>
              )}
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-gray-950 transition hover:brightness-110 disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          </div>
        </section>
      </form>

      <section className="mt-10 rounded-2xl border-2 border-red-900/50 bg-red-950/20 p-6 shadow-lg">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-red-400">
          Danger zone
        </h2>
        <p className="mt-2 text-sm text-gray-300">
          Deleting this plugin is permanent. All versions and data will be removed.
        </p>
        <p className="mt-3 text-sm text-gray-400">
          Type <span className="font-mono font-medium text-gray-200">{deleteConfirmExpected}</span> below to confirm.
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
          <div className="min-w-0 flex-1">
            <label htmlFor="delete-confirm" className="sr-only">
              Type {deleteConfirmExpected} to confirm delete
            </label>
            <input
              id="delete-confirm"
              type="text"
              value={deleteConfirm}
              onChange={(e) => {
                setDeleteConfirm(e.target.value);
                setDeleteError(null);
              }}
              placeholder={deleteConfirmExpected}
              className="w-full rounded-lg border border-red-900/50 bg-gray-950 px-3 py-2.5 font-mono text-sm text-gray-100 placeholder-gray-500 focus:border-red-500/50 focus:outline-none focus:ring-1 focus:ring-red-500/50"
            />
          </div>
          <button
            type="button"
            disabled={!deleteConfirmValid || deleting}
            onClick={async () => {
              if (!deleteConfirmValid) return;
              setDeleting(true);
              setDeleteError(null);
              const result = await deletePlugin(plugin.id);
              setDeleting(false);
              if (result.error) {
                setDeleteError(result.error);
                return;
              }
              router.push("/dashboard/plugins");
            }}
            className="shrink-0 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-500 disabled:opacity-50 disabled:hover:bg-red-600"
          >
            {deleting ? "Deleting…" : "Delete plugin"}
          </button>
        </div>
        {deleteError && (
          <p className="mt-3 text-sm text-red-400">{deleteError}</p>
        )}
      </section>
    </div>
  );
}
