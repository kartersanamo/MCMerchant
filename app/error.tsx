"use client";

import Link from "next/link";

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-14">
      <h1 className="text-3xl font-semibold tracking-tight text-gray-50">
        Something went wrong
      </h1>
      <p className="mt-3 text-sm text-gray-300">
        MCMerchant hit an unexpected error. You can try again, or go back home.
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-gray-950 shadow-sm transition hover:brightness-110"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-lg border border-gray-800 bg-gray-950 px-5 py-2.5 text-sm font-medium text-gray-100 transition hover:border-gray-700"
        >
          Go to home
        </Link>
      </div>

      {error?.message ? (
        <pre className="mt-6 overflow-auto rounded-xl border border-gray-800 bg-black/30 p-4 text-xs text-gray-200">
          {error.message}
        </pre>
      ) : null}
    </div>
  );
}

