"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Props = {
  pluginId: string;
  pluginName: string;
  slug: string;
  isFree: boolean;
  versionId?: string;
};

export function PluginInstallFlow({ pluginId, pluginName, slug, isFree, versionId }: Props) {
  const [secondsLeft, setSecondsLeft] = useState(3);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (secondsLeft <= 0) {
      setDone(true);
      const base = isFree
        ? `/api/downloads/free/${pluginId}`
        : `/api/downloads/me/${pluginId}`;
      const downloadUrl =
        versionId ? `${base}?versionId=${encodeURIComponent(versionId)}` : base;
      // Start download in new tab so we can redirect current window back to plugin page
      window.open(downloadUrl, "_blank", "noopener,noreferrer");
      window.location.href = `/plugin/${slug}`;
      return;
    }
    const t = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [secondsLeft, pluginId, slug, isFree, versionId]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-10">
      <div className="flex w-full max-w-5xl gap-6">
        {/* Left ad slot */}
        <aside className="hidden w-40 shrink-0 lg:block">
          <div className="sticky top-24 rounded-xl border-2 border-dashed border-gray-700 bg-gray-900/50 p-4 text-center text-xs text-gray-500">
            Ad slot (left)
          </div>
        </aside>

        {/* Center: install progress */}
        <main className="min-w-0 flex-1">
          <div className="rounded-xl border border-gray-800 bg-gray-900/30 p-8 text-center">
            <h1 className="text-xl font-semibold text-gray-100">
              Installing {pluginName}
            </h1>
            {!done ? (
              <>
                <div className="mt-6 flex justify-center">
                  <div className="h-12 w-12 animate-spin rounded-full border-2 border-gray-700 border-t-brand-500" />
                </div>
                <p className="mt-4 text-gray-400">
                  Starting download in {secondsLeft} second{secondsLeft !== 1 ? "s" : ""}…
                </p>
                <div className="mt-6 h-2 w-full max-w-xs overflow-hidden rounded-full bg-gray-800 mx-auto">
                  <div
                    className="h-full bg-brand-500 transition-all duration-1000"
                    style={{ width: `${((3 - secondsLeft) / 3) * 100}%` }}
                  />
                </div>
              </>
            ) : (
              <p className="mt-4 text-gray-400">Redirecting…</p>
            )}
            {!isFree && (
              <p className="mt-4 text-sm text-gray-500">
                Paid plugin: you’ll need to purchase first if you haven’t.
              </p>
            )}
            <div className="mt-6">
              <Link
                href={`/plugin/${slug}`}
                className="text-sm text-brand-400 hover:underline"
              >
                ← Back to plugin
              </Link>
            </div>
          </div>
        </main>

        {/* Right ad slot */}
        <aside className="hidden w-40 shrink-0 lg:block">
          <div className="sticky top-24 rounded-xl border-2 border-dashed border-gray-700 bg-gray-900/50 p-4 text-center text-xs text-gray-500">
            Ad slot (right)
          </div>
        </aside>
      </div>
    </div>
  );
}
