"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import { MINECRAFT_VERSIONS, SERVER_PLATFORMS } from "@/lib/constants/minecraft";

type Version = {
  id: string;
  version: string;
  changelog: string | null;
  minecraft_versions: string[] | null;
  server_platform?: string | null;
  created_at: string;
  download_count: number | null;
  is_latest: boolean;
};

function formatDate(input: string) {
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function parseSelectedOptions(e: ChangeEvent<HTMLSelectElement>) {
  return Array.from(e.target.selectedOptions).map((o) => o.value);
}

export function VersionManager({
  pluginId,
  pluginName,
  versions
}: {
  pluginId: string;
  pluginName: string;
  versions: Version[];
}) {
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editVersion, setEditVersion] = useState<string>("");
  const [editChangelog, setEditChangelog] = useState<string>("");
  const [editMinecraftVersions, setEditMinecraftVersions] = useState<string[]>([]);
  const [editServerPlatform, setEditServerPlatform] = useState<string>("");

  const latestVersion = useMemo(() => versions.find((v) => v.is_latest), [versions]);

  function openEditor(v: Version) {
    setMessage(null);
    setEditingId(v.id);
    setEditVersion(v.version);
    setEditChangelog(v.changelog ?? "");
    setEditMinecraftVersions((v.minecraft_versions ?? []).slice());
    setEditServerPlatform(v.server_platform ?? "");
  }

  async function submitEdit(versionId: string, closeAfter = true) {
    setSavingId(versionId);
    setMessage(null);

    const formData = new FormData();
    formData.set("version", editVersion);
    formData.set("changelog", editChangelog);
    formData.set("minecraft_versions", editMinecraftVersions.join(","));
    // Keep server_platform optional: we don't currently persist it in the versions list query,
    // but the API route supports it if the column exists and the client sends it.
    if (editServerPlatform.trim()) formData.set("server_platform", editServerPlatform.trim());

    const res = await fetch(`/api/v1/dashboard/plugins/${pluginId}/versions/${versionId}`, {
      method: "PATCH",
      body: formData
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMessage({ type: "err", text: (data.error as string) ?? `Update failed (${res.status})` });
      setSavingId(null);
      return;
    }

    setSavingId(null);
    setMessage({ type: "ok", text: "Version updated." });
    if (closeAfter) setEditingId(null);
    // Reload is the simplest way to keep list/flags consistent.
    window.location.reload();
  }

  async function setLatest(versionId: string) {
    setMessage(null);
    setSavingId(versionId);
    const formData = new FormData();
    formData.set("is_latest", "true");

    const res = await fetch(`/api/v1/dashboard/plugins/${pluginId}/versions/${versionId}`, {
      method: "PATCH",
      body: formData
    });
    const data = await res.json().catch(() => ({}));
    setSavingId(null);
    if (!res.ok) {
      setMessage({ type: "err", text: (data.error as string) ?? `Failed to set latest (${res.status})` });
      return;
    }

    setMessage({ type: "ok", text: "Latest version updated." });
    window.location.reload();
  }

  async function deleteVersion(versionId: string) {
    setDeletingId(versionId);
    setMessage(null);
    const confirmed = window.confirm("Delete this version? This cannot be undone.");
    if (!confirmed) {
      setDeletingId(null);
      return;
    }

    const res = await fetch(`/api/v1/dashboard/plugins/${pluginId}/versions/${versionId}`, {
      method: "DELETE"
    });
    const data = await res.json().catch(() => ({}));
    setDeletingId(null);

    if (!res.ok) {
      setMessage({ type: "err", text: (data.error as string) ?? `Delete failed (${res.status})` });
      return;
    }

    setMessage({ type: "ok", text: "Version deleted." });
    window.location.reload();
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-800/80 bg-gray-900/40 p-6 shadow-lg shadow-black/20">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Manage versions</h2>
            <p className="mt-1 text-sm text-gray-400">
              {pluginName}: edit changelog + supported Minecraft versions.
            </p>
          </div>
          {latestVersion ? (
            <div className="rounded-full bg-brand-500/20 px-3 py-1 text-xs font-medium text-brand-300 ring-1 ring-brand-500/30">
              Current latest: v{latestVersion.version}
            </div>
          ) : null}
        </div>
        {message ? (
          <div
            className={`mt-4 rounded-md px-3 py-2 text-sm ${
              message.type === "ok" ? "border border-emerald-900/40 bg-emerald-950/20 text-emerald-200" : "border border-red-900/40 bg-red-950/20 text-red-200"
            }`}
          >
            {message.text}
          </div>
        ) : null}
      </div>

      <div className="space-y-3">
        {versions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-700 bg-gray-950/50 p-8 text-center">
            <p className="text-sm text-gray-400">No versions yet.</p>
            <p className="mt-1 text-xs text-gray-500">Upload the first version to enable downloads.</p>
          </div>
        ) : (
          versions.map((v) => {
            const isEditing = editingId === v.id;
            return (
              <div
                key={v.id}
                className="rounded-2xl border border-gray-800 bg-gray-950/40 p-5 shadow-sm shadow-black/20"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-gray-100">v{v.version}</span>
                      {v.is_latest ? (
                        <span className="rounded-full bg-brand-500/20 px-2 py-0.5 text-xs font-medium text-brand-300 ring-1 ring-brand-500/30">
                          Latest
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                      <span>{(v.download_count ?? 0).toLocaleString()} downloads</span>
                      <span>{formatDate(v.created_at)}</span>
                      {v.minecraft_versions?.length ? (
                        <span className="flex flex-wrap gap-1">
                          {v.minecraft_versions.slice(0, 4).map((mv) => (
                            <span
                              key={mv}
                              className="rounded bg-gray-800 px-1.5 py-0.5 text-gray-400"
                            >
                              {mv}
                            </span>
                          ))}
                          {v.minecraft_versions.length > 4 ? (
                            <span className="text-gray-500">+{v.minecraft_versions.length - 4}</span>
                          ) : null}
                        </span>
                      ) : null}
                    </div>
                    {v.changelog ? <p className="mt-2 line-clamp-2 text-sm text-gray-400">{v.changelog}</p> : null}
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2">
                    {!v.is_latest ? (
                      <button
                        type="button"
                        disabled={savingId === v.id}
                        onClick={() => setLatest(v.id)}
                        className="rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-medium text-gray-950 transition hover:brightness-110 disabled:opacity-50"
                      >
                        {savingId === v.id ? "Setting…" : "Set latest"}
                      </button>
                    ) : null}

                    <button
                      type="button"
                      onClick={() => (isEditing ? setEditingId(null) : openEditor(v))}
                      className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-xs font-medium text-gray-200 hover:border-gray-600"
                    >
                      {isEditing ? "Close" : "Edit"}
                    </button>

                    <button
                      type="button"
                      disabled={deletingId === v.id}
                      onClick={() => deleteVersion(v.id)}
                      className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-red-500 disabled:opacity-50"
                    >
                      {deletingId === v.id ? "Deleting…" : "Delete"}
                    </button>
                  </div>
                </div>

                {isEditing ? (
                  <div className="mt-4 rounded-xl border border-gray-800/80 bg-gray-950/40 p-4">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        submitEdit(v.id);
                      }}
                      className="space-y-4"
                    >
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="block text-xs font-medium text-gray-500">Version</label>
                          <input
                            value={editVersion}
                            onChange={(e) => setEditVersion(e.target.value)}
                            className="mt-1.5 w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-gray-100 placeholder-gray-500 focus:border-brand-500/50 focus:outline-none focus:ring-1 focus:ring-brand-500/50"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500">Server platform (optional)</label>
                          <select
                            value={editServerPlatform}
                            onChange={(e) => setEditServerPlatform(e.target.value)}
                            className="mt-1.5 w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-gray-100 focus:border-brand-500/50 focus:outline-none focus:ring-1 focus:ring-brand-500/50"
                          >
                            <option value="">Auto / leave as-is</option>
                            {SERVER_PLATFORMS.map((p) => (
                              <option key={p} value={p}>
                                {p}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-500">Changelog</label>
                        <textarea
                          value={editChangelog}
                          onChange={(e) => setEditChangelog(e.target.value)}
                          className="mt-1.5 w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-2.5 text-gray-100 placeholder-gray-500 focus:border-brand-500/50 focus:outline-none focus:ring-1 focus:ring-brand-500/50"
                          rows={5}
                          placeholder="What changed?"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-500">Minecraft versions</label>
                        <select
                          multiple
                          value={editMinecraftVersions}
                          onChange={(e) => setEditMinecraftVersions(parseSelectedOptions(e))}
                          className="mt-1 w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-gray-100"
                          size={8}
                        >
                          {MINECRAFT_VERSIONS.map((mv) => (
                            <option key={mv} value={mv}>
                              {mv}
                            </option>
                          ))}
                        </select>
                        <p className="mt-1 text-xs text-gray-500">
                          Hold Ctrl (Windows/Linux) or Cmd (Mac) to select multiple versions.
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-xs text-gray-500">
                          Tip: set “Set latest” after you edit to ensure buyers get the newest build.
                        </p>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-xs font-medium text-gray-200 hover:border-gray-600"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={savingId === v.id}
                            className="rounded-lg bg-brand-500 px-3 py-2 text-xs font-medium text-gray-950 transition hover:brightness-110 disabled:opacity-50"
                          >
                            {savingId === v.id ? "Saving…" : "Save changes"}
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

