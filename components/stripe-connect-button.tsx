"use client";

import { useState } from "react";

export function StripeConnectButton({
  disabled,
  label = "Connect Stripe",
  loadingLabel = "Starting...",
  /** Clear saved Connect account first (e.g. after switching from test to live API keys). */
  resetBeforeConnect = false
}: {
  disabled?: boolean;
  label?: string;
  loadingLabel?: string;
  resetBeforeConnect?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startConnect() {
    setError(null);
    setLoading(true);
    const res = await fetch("/api/v1/stripe/connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reset: resetBeforeConnect })
    }).catch(() => null);
    const data = res ? await res.json().catch(() => null) : null;
    if (data?.url) {
      window.location.href = data.url;
      return;
    }
    const msg =
      typeof data?.error === "string"
        ? data.error
        : res && !res.ok
          ? `Request failed (${res.status})`
          : "Could not start Stripe Connect.";
    setError(msg);
    setLoading(false);
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={disabled || loading}
        onClick={startConnect}
        className="rounded-md border border-gray-800 bg-gray-950 px-4 py-2 text-sm text-gray-100 disabled:opacity-50"
      >
        {loading ? loadingLabel : label}
      </button>
      {error ? (
        <p className="max-w-md text-sm text-red-400" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

