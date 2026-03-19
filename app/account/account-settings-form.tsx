"use client";

import { useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function AccountSettingsForm() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    if (password !== confirm) {
      setMessage({ type: "err", text: "Passwords do not match." });
      return;
    }
    if (password.length < 6) {
      setMessage({ type: "err", text: "Password must be at least 6 characters." });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setMessage({ type: "err", text: error.message });
        return;
      }
      setMessage({ type: "ok", text: "Password updated." });
      setPassword("");
      setConfirm("");
    } catch {
      setMessage({ type: "err", text: "Something went wrong. Try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-medium uppercase tracking-wider text-gray-500">
          New password
        </label>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          autoComplete="new-password"
          className="mt-2 w-full rounded-md border border-gray-800 bg-gray-950 px-3 py-2 text-gray-100"
          placeholder="••••••••"
        />
      </div>
      <div>
        <label className="block text-xs font-medium uppercase tracking-wider text-gray-500">
          Confirm new password
        </label>
        <input
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          type="password"
          autoComplete="new-password"
          className="mt-2 w-full rounded-md border border-gray-800 bg-gray-950 px-3 py-2 text-gray-100"
          placeholder="••••••••"
        />
      </div>
      {message ? (
        <div
          className={
            message.type === "ok"
              ? "text-sm text-green-400"
              : "text-sm text-red-400"
          }
        >
          {message.text}
        </div>
      ) : null}
      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-gray-950 disabled:opacity-50"
      >
        {loading ? "Updating..." : "Update password"}
      </button>
    </form>
  );
}
