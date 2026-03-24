"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

type Props = {
  pluginName: string;
  pluginSlug: string;
  pluginId: string;
  latestVersionId: string | null;
  priceCents: number;
};

export function NoLicenseModal({
  pluginName,
  pluginSlug,
  pluginId,
  latestVersionId,
  priceCents,
}: Props) {
  const router = useRouter();

  function dismiss() {
    const url = new URL(window.location.href);
    url.searchParams.delete("error");
    router.replace(url.pathname + url.search);
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="no-license-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-gray-950/80 backdrop-blur-sm"
        onClick={dismiss}
        aria-hidden
      />

      {/* Modal card */}
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
            <h2
              id="no-license-title"
              className="text-lg font-semibold text-gray-50"
            >
              License required
            </h2>
          </div>
        </div>

        <div className="px-6 py-5">
          <p className="text-gray-300">
            You don&apos;t have a license for <strong className="text-gray-100">{pluginName}</strong>.
            Purchase a license to download this plugin and get updates.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={dismiss}
              className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm font-medium text-gray-200 transition hover:border-gray-600 hover:bg-gray-800/80"
            >
              Dismiss
            </button>
            {priceCents > 0 && latestVersionId ? (
              <Link
                href={`/api/v1/checkout-session?pluginId=${pluginId}&versionId=${latestVersionId}&slug=${pluginSlug}`}
                className="rounded-lg bg-amber-500 px-4 py-2.5 text-center text-sm font-medium text-gray-950 transition hover:bg-amber-400"
              >
                Buy license
              </Link>
            ) : (
              <Link
                href={`/plugin/${pluginSlug}`}
                className="rounded-lg bg-brand-500 px-4 py-2.5 text-center text-sm font-medium text-gray-950 transition hover:brightness-110"
              >
                Back to plugin
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
