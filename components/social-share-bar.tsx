"use client";

import { useEffect, useState } from "react";

export type SocialShareBarProps = {
  /** Full URL when env is set; otherwise copy uses origin + path on the client. */
  absoluteUrl: string | null;
  path: string;
  headline: string;
  /** Web Share API title */
  nativeShareTitle: string;
  /** Short line for social posts (plugin name, storefront name, etc.) */
  shareSummary: string;
  accentBorder?: string;
  accentText?: string;
};

export function SocialShareBar({
  absoluteUrl,
  path,
  headline,
  nativeShareTitle,
  shareSummary,
  accentBorder = "border-gray-800",
  accentText = "text-brand-400"
}: SocialShareBarProps) {
  const [state, setState] = useState<"idle" | "copied" | "err">("idle");
  const [canWebShare, setCanWebShare] = useState(false);

  useEffect(() => {
    setCanWebShare(
      typeof navigator !== "undefined" && typeof (navigator as Navigator & { share?: unknown }).share === "function"
    );
  }, []);

  function getResolvedUrl(): string {
    if (absoluteUrl && absoluteUrl.startsWith("http")) return absoluteUrl;
    if (typeof window !== "undefined") {
      const p = path.startsWith("/") ? path : `/${path}`;
      return `${window.location.origin}${p}`;
    }
    return path;
  }

  const displayUrl = absoluteUrl && absoluteUrl.startsWith("http") ? absoluteUrl : path;

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
    const nav = navigator as Navigator & { share?: (data: ShareData) => Promise<void> };
    if (typeof nav.share === "function") {
      nav
        .share({
          title: nativeShareTitle,
          text: shareSummary,
          url
        })
        .catch(() => {});
    }
  }

  const url = getResolvedUrl();
  const encodedUrl = encodeURIComponent(url);
  const encodedSummary = encodeURIComponent(shareSummary);

  const outlineBtn = `rounded-lg border ${accentBorder} px-3 py-2 text-xs font-medium text-gray-200 transition hover:bg-gray-900`;
  const primaryBtn = "rounded-lg bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-950 transition hover:bg-white";

  return (
    <div className={`rounded-xl border ${accentBorder} bg-gray-950/60 p-4 shadow-lg shadow-black/20 backdrop-blur-sm`}>
      {/* Always stack: a side-by-side row inside a ~320px sidebar squeezes the URL column to ~0 width
          and break-all then wraps one character per line. */}
      <div className="flex w-full min-w-0 flex-col gap-4">
        <div className="w-full min-w-0">
          <div className={`text-xs font-semibold uppercase tracking-wider ${accentText}`}>{headline}</div>
          <p className="mt-1 w-full max-w-full break-words font-mono text-[11px] leading-relaxed text-gray-400 [overflow-wrap:anywhere] sm:text-xs">
            {displayUrl}
          </p>
          {state === "copied" ? (
            <p className="mt-1 text-xs text-emerald-400">Copied link to clipboard.</p>
          ) : null}
          {state === "err" ? (
            <p className="mt-1 text-xs text-amber-300">Could not copy—select the URL manually.</p>
          ) : null}
        </div>
        <div className="flex w-full min-w-0 flex-wrap gap-2">
          <button type="button" onClick={copy} className={primaryBtn}>
            Copy link
          </button>
          {canWebShare ? (
            <button type="button" onClick={nativeShare} className={outlineBtn}>
              Share…
            </button>
          ) : null}
          <a
            href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedSummary}`}
            target="_blank"
            rel="noreferrer"
            className={outlineBtn}
          >
            Post on X
          </a>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
            target="_blank"
            rel="noreferrer"
            className={outlineBtn}
          >
            Facebook
          </a>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
            target="_blank"
            rel="noreferrer"
            className={outlineBtn}
          >
            LinkedIn
          </a>
          <a
            href={`https://www.reddit.com/submit?url=${encodedUrl}&title=${encodeURIComponent(nativeShareTitle)}`}
            target="_blank"
            rel="noreferrer"
            className={outlineBtn}
          >
            Reddit
          </a>
        </div>
      </div>
    </div>
  );
}
