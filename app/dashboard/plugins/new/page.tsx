"use client";

import { useEffect, useState } from "react";
import MDEditor from "@uiw/react-md-editor";
import { useRouter } from "next/navigation";
import { MINECRAFT_VERSIONS, SERVER_PLATFORMS } from "@/lib/constants/minecraft";
import { PLUGIN_CATEGORIES, DEFAULT_PLUGIN_CATEGORY } from "@/lib/constants/categories";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function NewPluginPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [tagline, setTagline] = useState("");
  const [category, setCategory] = useState(DEFAULT_PLUGIN_CATEGORY);
  const [tags, setTags] = useState("economy");
  const [isFree, setIsFree] = useState(false);
  const [priceDollars, setPriceDollars] = useState("9.99");

  const [description, setDescription] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const [firstVersion, setFirstVersion] = useState("");
  const [firstChangelog, setFirstChangelog] = useState("");
  const [firstMinecraftVersions, setFirstMinecraftVersions] = useState<string[]>([]);
  const [firstServerPlatform, setFirstServerPlatform] = useState("");
  const [firstJarFile, setFirstJarFile] = useState<File | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showNoVersionWarning, setShowNoVersionWarning] = useState(false);

  const hasFirstVersion =
    firstVersion.trim() !== "" &&
    firstMinecraftVersions.length > 0 &&
    firstJarFile != null &&
    firstJarFile.size > 0;

  useEffect(() => {
    setSlug(slugify(name));
  }, [name]);

  async function submit(status: "draft" | "published") {
    setSubmitting(true);
    setSubmitError(null);

    const formData = new FormData();
    formData.set("name", name);
    formData.set("slug", slug);
    formData.set("tagline", tagline);
    formData.set("category", category);
    formData.set("tags", tags);
    formData.set("status", status);
    formData.set("is_free", String(isFree));

    if (!isFree) formData.set("price_dollars", priceDollars);
    formData.set("description", description);
    if (coverFile) formData.set("cover_image", coverFile);

    const res = await fetch("/api/v1/dashboard/plugins", {
      method: "POST",
      body: formData
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      if (data.code === "email_not_verified") {
        setSubmitError(
          "Verify your email before publishing. Check your inbox or open the link from your confirmation email."
        );
      } else {
        setSubmitError(data.message ?? data.error ?? "Failed to create plugin");
      }
      setSubmitting(false);
      return;
    }

    const data = await res.json().catch(() => ({}));
    const pluginId = data?.id;
    if (!pluginId) {
      setSubmitting(false);
      return;
    }

    if (hasFirstVersion && firstJarFile) {
      const versionFormData = new FormData();
      versionFormData.set("version", firstVersion.trim());
      versionFormData.set("changelog", firstChangelog);
      versionFormData.set("minecraft_versions", firstMinecraftVersions.join(","));
      if (firstServerPlatform) versionFormData.set("server_platform", firstServerPlatform);
      versionFormData.set("jar_file", firstJarFile);

      const versionRes = await fetch(`/api/v1/dashboard/plugins/${pluginId}/versions`, {
        method: "POST",
        body: versionFormData
      });

      if (!versionRes.ok) {
        const errData = await versionRes.json().catch(() => ({}));
        if (errData.code === "email_not_verified") {
          setSubmitError(
            "Verify your email before uploading versions. Check your inbox for the confirmation link."
          );
        } else {
          setSubmitError(errData.message ?? errData.error ?? "Plugin created but version upload failed");
        }
        setSubmitting(false);
        return;
      }
    }

    router.push(`/dashboard/plugins/${pluginId}/edit?tab=${hasFirstVersion ? "versions" : "info"}`);
    setSubmitting(false);
  }

  function handlePublishClick() {
    if (!hasFirstVersion) {
      setShowNoVersionWarning(true);
      return;
    }
    submit("published");
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <h1 className="text-2xl font-semibold text-gray-100">Create new plugin</h1>
      <p className="mt-2 text-sm text-gray-400">Create your listing and publish with complete storefront-ready metadata.</p>

      <div className="mt-6 space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm text-gray-300">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-800 bg-gray-950 px-3 py-2 text-gray-100"
              required
              placeholder="Super Economy"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300">Slug</label>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-800 bg-gray-950 px-3 py-2 text-gray-100"
              required
              placeholder="super-economy"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-300">Tagline</label>
          <input
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-800 bg-gray-950 px-3 py-2 text-gray-100"
            required
            placeholder="One-line description for your listing"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="sm:col-span-1">
            <label className="block text-sm text-gray-300">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-800 bg-gray-950 px-3 py-2 text-gray-100"
            >
              {PLUGIN_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm text-gray-300">Tags</label>
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-800 bg-gray-950 px-3 py-2 text-gray-100"
              placeholder="economy, economy-plugins, economy-balance"
            />
            <p className="mt-1 text-xs text-gray-500">
              Comma-separated tags.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-gray-800 bg-gray-900/30 p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-medium text-gray-100">Price</div>
              <div className="text-xs text-gray-400">Choose free or set a paid price.</div>
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-200">
              <input
                type="checkbox"
                checked={isFree}
                onChange={(e) => setIsFree(e.target.checked)}
              />
              Free plugin
            </label>
          </div>

          {!isFree ? (
            <div className="mt-4">
              <label className="block text-sm text-gray-300">Price (USD)</label>
              <input
                value={priceDollars}
                onChange={(e) => setPriceDollars(e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-800 bg-gray-950 px-3 py-2 text-gray-100"
              />
            </div>
          ) : null}
        </div>

        <div>
          <label className="block text-sm text-gray-300">Cover image (.png/.jpg)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
            className="mt-2 w-full text-sm text-gray-300"
          />
        </div>

        <div className="rounded-xl border border-gray-800 bg-gray-900/30 p-4">
          <h3 className="text-sm font-medium text-gray-100">Add first version (optional)</h3>
          <p className="mt-1 text-xs text-gray-400">
            You can add a version now or later from the plugin&apos;s page. Buyers can only download when at least one version exists.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs text-gray-400">Version</label>
              <input
                value={firstVersion}
                onChange={(e) => setFirstVersion(e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-800 bg-gray-950 px-3 py-2 text-sm text-gray-100"
                placeholder="1.0.0"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400">Server platform</label>
              <select
                value={firstServerPlatform}
                onChange={(e) => setFirstServerPlatform(e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-800 bg-gray-950 px-3 py-2 text-sm text-gray-100"
              >
                <option value="">Select platform (optional)</option>
                {SERVER_PLATFORMS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-xs text-gray-400">Minecraft versions</label>
            <select
              multiple
              size={6}
              value={firstMinecraftVersions}
              onChange={(e) => {
                const opts = Array.from(e.target.selectedOptions, (o) => o.value);
                setFirstMinecraftVersions(opts);
              }}
              className="mt-1 w-full rounded-md border border-gray-800 bg-gray-950 px-3 py-2 text-sm text-gray-100"
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
          <div className="mt-4">
            <label className="block text-xs text-gray-400">Changelog</label>
            <textarea
              value={firstChangelog}
              onChange={(e) => setFirstChangelog(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-800 bg-gray-950 px-3 py-2 text-sm text-gray-100"
              placeholder="What's in this version?"
              rows={3}
            />
          </div>
          <div className="mt-4">
            <label className="block text-xs text-gray-400">.jar file</label>
            <input
              type="file"
              accept=".jar"
              onChange={(e) => setFirstJarFile(e.target.files?.[0] ?? null)}
              className="mt-1 w-full text-sm text-gray-300"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-300">Description (Markdown)</label>
          <div className="mt-2">
            <MDEditor
              value={description}
              onChange={(v) => setDescription(String(v ?? ""))}
              height={300}
            />
          </div>
        </div>

        {submitError ? <div className="text-sm text-red-400">{submitError}</div> : null}

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            disabled={submitting}
            onClick={() => submit("draft")}
            className="rounded-md border border-gray-800 bg-gray-950 px-4 py-2 text-sm font-medium text-gray-100 disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Save as draft"}
          </button>
          <button
            disabled={submitting}
            onClick={handlePublishClick}
            className="rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-gray-950 disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Publish"}
          </button>
        </div>
      </div>

      {showNoVersionWarning ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="no-version-warning-title"
        >
          <div
            className="absolute inset-0 bg-gray-950/80 backdrop-blur-sm"
            onClick={() => setShowNoVersionWarning(false)}
            aria-hidden
          />
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-amber-500/30 bg-gray-900 shadow-2xl shadow-amber-500/5">
            <div className="border-b border-gray-800 bg-amber-500/5 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/20">
                  <svg
                    className="h-5 w-5 text-amber-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <h2 id="no-version-warning-title" className="text-lg font-semibold text-gray-50">
                  No version added yet
                </h2>
              </div>
            </div>
            <div className="px-6 py-5">
              <p className="text-gray-300">
                You haven&apos;t added a version for this plugin. Buyers won&apos;t be able to download it until you upload at least one version. You can add a version now or from the plugin page after publishing.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row-reverse sm:justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowNoVersionWarning(false);
                    submit("published");
                  }}
                  disabled={submitting}
                  className="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-gray-950 disabled:opacity-50"
                >
                  Publish anyway
                </button>
                <button
                  type="button"
                  onClick={() => setShowNoVersionWarning(false)}
                  className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm font-medium text-gray-200 hover:border-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

