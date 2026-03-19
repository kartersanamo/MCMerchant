"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { MINECRAFT_VERSIONS, SERVER_PLATFORMS } from "@/lib/constants/minecraft";

export function VersionUploader({ pluginId }: { pluginId: string }) {
  const router = useRouter();
  const [version, setVersion] = useState("");
  const [changelog, setChangelog] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("plugin_id", pluginId);

    const mcSelected = formData.getAll("minecraft_versions") as string[];
    if (mcSelected.length) {
      formData.delete("minecraft_versions");
      formData.set("minecraft_versions", mcSelected.join(","));
    }

    const res = await fetch(`/api/v1/dashboard/plugins/${pluginId}/versions`, {
      method: "POST",
      body: formData
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setError((data.error as string) || `Upload failed (${res.status})`);
      setIsSubmitting(false);
      return;
    }

    router.push(`/dashboard/plugins/${pluginId}/edit`);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm text-gray-300">Version</label>
        <input
          name="version"
          value={version}
          onChange={(e) => setVersion(e.target.value)}
          className="mt-1 w-full rounded-md border border-gray-800 bg-gray-950 px-3 py-2 text-gray-100"
          placeholder="1.4.2"
          required
        />
      </div>

      <div>
        <label className="block text-sm text-gray-300">Changelog</label>
        <textarea
          name="changelog"
          value={changelog}
          onChange={(e) => setChangelog(e.target.value)}
          className="mt-1 w-full rounded-md border border-gray-800 bg-gray-950 px-3 py-2 text-gray-100"
          placeholder="What changed?"
          rows={6}
        />
      </div>

      <div>
        <label className="block text-sm text-gray-300">Minecraft versions</label>
        <select
          name="minecraft_versions"
          multiple
          required
          size={8}
          className="mt-1 w-full rounded-md border border-gray-800 bg-gray-950 px-3 py-2 text-gray-100"
        >
          {MINECRAFT_VERSIONS.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-gray-500">
          Hold Ctrl (Windows/Linux) or Cmd (Mac) to select multiple versions.
        </p>
      </div>

      <div>
        <label className="block text-sm text-gray-300">Server platform</label>
        <select
          name="server_platform"
          className="mt-1 w-full rounded-md border border-gray-800 bg-gray-950 px-3 py-2 text-gray-100"
        >
          <option value="">Select platform (optional)</option>
          {SERVER_PLATFORMS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-gray-500">
          The server software this plugin is built for (e.g. Spigot, Paper).
        </p>
      </div>

      <div>
        <label className="block text-sm text-gray-300">.jar file</label>
        <input
          name="jar_file"
          type="file"
          accept=".jar"
          className="mt-1 w-full text-sm text-gray-300"
          required
        />
      </div>

      {error ? (
        <div className="rounded-md border border-red-900/50 bg-red-950/30 px-3 py-2 text-sm text-red-300">
          {error}
        </div>
      ) : null}

      <button
        disabled={isSubmitting}
        className="w-full rounded-md bg-brand-500 px-4 py-2 font-medium text-gray-950 disabled:opacity-50"
      >
        {isSubmitting ? "Uploading..." : "Upload version"}
      </button>
    </form>
  );
}

