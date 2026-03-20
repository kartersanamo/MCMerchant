"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deletePlugin } from "@/app/dashboard/plugins/actions";

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  );
}

export function DeletePluginButton({
  pluginId,
  pluginName,
  username,
}: {
  pluginId: string;
  pluginName: string;
  username: string;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [open, setOpen] = useState(false);
  const [confirmValue, setConfirmValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  const confirmExpected = `${username}/${pluginName}`;
  const canDelete = confirmValue.trim() === confirmExpected && !deleting;

  async function handleDelete() {
    if (!canDelete) return;
    setDeleting(true);
    setError(null);
    const result = await deletePlugin(pluginId);
    setDeleting(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setConfirmValue("");
          setError(null);
        }}
        disabled={deleting}
        className="rounded-md p-1.5 text-gray-400 transition hover:bg-red-950/50 hover:text-red-400 disabled:opacity-50"
        title="Delete plugin"
        aria-label={`Delete ${pluginName}`}
      >
        <TrashIcon className="h-4 w-4" />
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`delete-plugin-title-${pluginId}`}
        >
          <div
            className="absolute inset-0 bg-gray-950/80 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-red-900/50 bg-gray-900 shadow-2xl shadow-red-500/10">
            <div className="border-b border-red-900/40 bg-red-500/5 px-6 py-4">
              <h2
                id={`delete-plugin-title-${pluginId}`}
                className="text-lg font-semibold text-red-200"
              >
                Delete {pluginName}?
              </h2>
              <p className="mt-1 text-sm text-gray-300">
                This action is permanent and cannot be undone.
              </p>
            </div>

            <div className="px-6 py-5">
              <p className="text-sm text-gray-400">
                Type{" "}
                <span className="font-mono font-medium text-red-300">{confirmExpected}</span>{" "}
                to confirm.
              </p>

              <input
                type="text"
                value={confirmValue}
                onChange={(e) => {
                  setConfirmValue(e.target.value);
                  setError(null);
                }}
                placeholder={confirmExpected}
                className="mt-3 w-full rounded-lg border border-red-900/50 bg-gray-950 px-3 py-2.5 font-mono text-sm text-gray-100 placeholder-gray-500 focus:border-red-500/50 focus:outline-none focus:ring-1 focus:ring-red-500/50"
              />

              {error ? <p className="mt-3 text-sm text-red-400">{error}</p> : null}

              <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm font-medium text-gray-200 transition hover:border-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={!canDelete}
                  className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-500 disabled:opacity-50 disabled:hover:bg-red-600"
                >
                  {deleting ? "Deleting…" : "Delete plugin"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
