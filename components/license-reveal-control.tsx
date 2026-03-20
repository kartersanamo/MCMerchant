"use client";

import { useMemo, useState } from "react";
import { maskLicenseKey } from "@/components/license-badge";

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 3l18 18" />
      <path d="M10.58 10.58A2 2 0 0 0 12 14a2 2 0 0 0 1.42-.42" />
      <path d="M9.88 5.08A10.45 10.45 0 0 1 12 5c6.5 0 10 7 10 7a17.46 17.46 0 0 1-4.05 5.07" />
      <path d="M6.11 6.11C3.55 8.06 2 12 2 12s3.5 7 10 7c1.2 0 2.3-.22 3.29-.58" />
    </svg>
  );
}

export function LicenseRevealControl({ licenseKey }: { licenseKey: string }) {
  const [revealed, setRevealed] = useState(false);
  const masked = useMemo(() => maskLicenseKey(licenseKey), [licenseKey]);

  return (
    <div className="flex items-center gap-2">
      <code
        className="inline-flex max-w-[260px] items-center rounded-md border border-gray-800 bg-gray-950 px-2 py-1 font-mono text-xs text-gray-100"
        title={revealed ? licenseKey : masked}
      >
        {revealed ? licenseKey : masked}
      </code>

      <button
        type="button"
        onClick={() => setRevealed((r) => !r)}
        aria-label={revealed ? "Hide license key" : "Show license key"}
        title={revealed ? "Hide license key" : "Show license key"}
        className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-gray-800 bg-gray-950/40 text-gray-300 transition hover:bg-gray-950/70 hover:text-gray-100"
      >
        <EyeIcon open={revealed} />
      </button>
    </div>
  );
}

