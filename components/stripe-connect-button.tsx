"use client";

import { useState } from "react";

export function StripeConnectButton({
  disabled,
  label = "Connect Stripe",
  loadingLabel = "Starting..."
}: {
  disabled?: boolean;
  label?: string;
  loadingLabel?: string;
}) {
  const [loading, setLoading] = useState(false);

  async function startConnect() {
    setLoading(true);
    const res = await fetch("/api/v1/stripe/connect", { method: "POST" }).catch(() => null);
    const data = res ? await res.json().catch(() => null) : null;
    if (data?.url) window.location.href = data.url;
    setLoading(false);
  }

  return (
    <button
      type="button"
      disabled={disabled || loading}
      onClick={startConnect}
      className="rounded-md border border-gray-800 bg-gray-950 px-4 py-2 text-sm text-gray-100 disabled:opacity-50"
    >
      {loading ? loadingLabel : label}
    </button>
  );
}

