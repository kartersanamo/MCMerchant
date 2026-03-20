"use client";

import { useEffect, useState } from "react";

type Props = {
  /** Full URL when env is set; otherwise copy uses origin + path on the client. */
  absoluteUrl: string | null;
  path: string;
  accentBorder: string;
  accentText: string;
};

export function StorefrontShareBar({ absoluteUrl, path, accentBorder, accentText }: Props) {
  const [state, setState] = useState<"idle" | "copied" | "err">("idle");
  const [canWebShare, setCanWebShare] = useState(false);

  // Important: avoid navigator/window checks during render so SSR markup matches
  // the client's first render (prevents hydration mismatch).
  useEffect(() => {
    setCanWebShare(
      typeof navigator !== "undefined" &&
        typeof (navigator as any).share === "function"
    );
  }, []);

  function getResolvedUrl(): string {
    if (absoluteUrl && absoluteUrl.startsWith("http")) return absoluteUrl;
    // Only used in event handlers (click/share), not during render.
    if (typeof window !== "undefined") {
      const p = path.startsWith("/") ? path : `/${path}`;
      return `${window.location.origin}${p}`;
    }
    return path; // SSR fallback
  }

  const displayUrl = absoluteUrl ?? path;

  async function copy() {
    try {
      await navigator.clipboard.writeText(getResolvedUrl());
      setState("copied");
      setTimeout(() => setState("idle"), 2000);
    } catch {
      setState("err");
      setTimeout(() => setState("idle"), 2500);
    }
  }

  function nativeShare() {
    const url = getResolvedUrl();
    if (typeof navigator !== "undefined" && (navigator as any).share) {
      navigator.share({ title: "Storefront", url }).catch(() => {});
    }
  }

  return (
    <div
      className={`rounded-xl border ${accentBorder} bg-gray-950/60 p-4 shadow-lg shadow-black/20 backdrop-blur-sm`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className={`text-xs font-semibold uppercase tracking-wider ${accentText}`}>Share storefront</div>
          <p className="mt-1 font-mono text-[11px] text-gray-400 break-all sm:text-xs">{displayUrl}</p>
          {state === "copied" ? (
            <p className="mt-1 text-xs text-emerald-400">Copied link to clipboard.</p>
          ) : null}
          {state === "err" ? (
            <p className="mt-1 text-xs text-amber-300">Could not copy—select the URL manually.</p>
          ) : null}
        </div>
        <div className="flex flex-shrink-0 flex-wrap gap-2">
          <button
            type="button"
            onClick={copy}
            className="rounded-lg bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-950 transition hover:bg-white"
          >
            Copy link
          </button>
          {canWebShare ? (
            <button
              type="button"
              onClick={nativeShare}
              className={`rounded-lg border ${accentBorder} px-3 py-2 text-xs font-medium text-gray-200 transition hover:bg-gray-900`}
            >
              Share…
            </button>
          ) : null}
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent("Check out this storefront: " + displayUrl)}`}
            target="_blank"
            rel="noreferrer"
            className={`rounded-lg border ${accentBorder} px-3 py-2 text-xs font-medium text-gray-200 transition hover:bg-gray-900`}
          >
            Post
          </a>
        </div>
      </div>
    </div>
  );
}
