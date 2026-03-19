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
}: {
  pluginId: string;
  pluginName: string;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleClick() {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${pluginName}"? This cannot be undone.`
    );
    if (!confirmed) return;

    setDeleting(true);
    const result = await deletePlugin(pluginId);
    setDeleting(false);

    if (result.error) {
      alert(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={deleting}
      className="rounded-md p-1.5 text-gray-400 transition hover:bg-red-950/50 hover:text-red-400 disabled:opacity-50"
      title="Delete plugin"
      aria-label={`Delete ${pluginName}`}
    >
      <TrashIcon className="h-4 w-4" />
    </button>
  );
}
