"use client";

import { useState } from "react";

function CopyIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

export function CopyButton({
  text,
  copiedLabel = "Copied",
  defaultLabel = "Copy"
}: {
  text: string;
  copiedLabel?: string;
  defaultLabel?: string;
}) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1200);
        } catch {
          // Ignore: clipboard access can fail depending on browser permissions.
        }
      }}
      className="inline-flex h-7 items-center gap-2 rounded-md border border-gray-800 bg-gray-950/40 px-2 text-xs text-gray-300 transition hover:bg-gray-950/70 hover:text-gray-100"
      aria-label={`Copy ${text}`}
      title={copied ? copiedLabel : defaultLabel}
    >
      <CopyIcon />
      {copied ? copiedLabel : defaultLabel}
    </button>
  );
}

