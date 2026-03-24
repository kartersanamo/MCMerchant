"use client";

import { useState } from "react";
import { SUPPORT_DISCORD_URL } from "@/lib/app-url";

export function ReportPluginPlaceholder() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm text-red-300 hover:underline"
      >
        Report plugin
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="report-placeholder-title"
        >
          <div
            className="absolute inset-0 bg-gray-950/80 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="relative w-full max-w-sm overflow-hidden rounded-xl border border-gray-700 bg-gray-900 shadow-xl">
            <div className="px-5 py-4">
              <h2 id="report-placeholder-title" className="text-base font-semibold text-gray-100">
                Report plugin
              </h2>
              <p className="mt-2 text-sm text-gray-400">
                Need to report this plugin? Please join our Discord support server and open a report with the plugin link and details.
              </p>
              <p className="mt-2 text-sm">
                <a
                  href={SUPPORT_DISCORD_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-brand-400 hover:underline"
                >
                  Join the MCMerchant Discord
                </a>
              </p>
              <div className="mt-5 flex justify-end">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg bg-gray-700 px-4 py-2 text-sm font-medium text-gray-200 hover:bg-gray-600"
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
