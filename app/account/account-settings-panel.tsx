"use client";

import { useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Props = {
  userId: string;
  email: string;
  emailVerified: boolean;
  username: string;
  displayName: string;
  initialPrefs: {
    productUpdates: boolean;
    marketingEmails: boolean;
  };
};

type Notice = { type: "ok" | "err"; text: string } | null;

function normalizeUsername(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 32);
}

export function AccountSettingsPanel({
  userId,
  email,
  emailVerified,
  username,
  displayName,
  initialPrefs
}: Props) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [profileUsername, setProfileUsername] = useState(username);
  const [profileDisplayName, setProfileDisplayName] = useState(displayName);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileNotice, setProfileNotice] = useState<Notice>(null);

  const [newEmail, setNewEmail] = useState("");
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailNotice, setEmailNotice] = useState<Notice>(null);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [securitySaving, setSecuritySaving] = useState(false);
  const [securityNotice, setSecurityNotice] = useState<Notice>(null);

  const [productUpdates, setProductUpdates] = useState(initialPrefs.productUpdates);
  const [marketingEmails, setMarketingEmails] = useState(initialPrefs.marketingEmails);
  const [prefsSaving, setPrefsSaving] = useState(false);
  const [prefsNotice, setPrefsNotice] = useState<Notice>(null);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileNotice(null);
    const nextUsername = normalizeUsername(profileUsername);
    if (nextUsername.length < 3) {
      setProfileNotice({
        type: "err",
        text: "Username must be at least 3 characters and use letters, numbers, or underscores."
      });
      return;
    }

    setProfileSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        username: nextUsername,
        display_name: profileDisplayName.trim().slice(0, 64) || nextUsername
      })
      .eq("id", userId);

    if (error) {
      const msg =
        error.message?.toLowerCase().includes("duplicate") ||
        error.message?.toLowerCase().includes("unique")
          ? "That username is already taken."
          : error.message;
      setProfileNotice({ type: "err", text: msg || "Could not save profile settings." });
      setProfileSaving(false);
      return;
    }
    setProfileUsername(nextUsername);
    setProfileNotice({ type: "ok", text: "Profile updated." });
    setProfileSaving(false);
  }

  async function saveEmail(e: React.FormEvent) {
    e.preventDefault();
    setEmailNotice(null);
    const next = newEmail.trim().toLowerCase();
    if (!next || !next.includes("@")) {
      setEmailNotice({ type: "err", text: "Enter a valid email address." });
      return;
    }
    setEmailSaving(true);
    const { error } = await supabase.auth.updateUser({ email: next });
    if (error) {
      setEmailNotice({ type: "err", text: error.message || "Could not request email change." });
      setEmailSaving(false);
      return;
    }
    setEmailNotice({
      type: "ok",
      text: "Email change requested. Check your inbox to confirm the new address."
    });
    setNewEmail("");
    setEmailSaving(false);
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    setSecurityNotice(null);
    if (password.length < 8) {
      setSecurityNotice({ type: "err", text: "Password must be at least 8 characters." });
      return;
    }
    if (password !== confirmPassword) {
      setSecurityNotice({ type: "err", text: "Passwords do not match." });
      return;
    }
    setSecuritySaving(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setSecurityNotice({ type: "err", text: error.message || "Could not update password." });
      setSecuritySaving(false);
      return;
    }
    setPassword("");
    setConfirmPassword("");
    setSecurityNotice({ type: "ok", text: "Password updated." });
    setSecuritySaving(false);
  }

  async function savePreferences(e: React.FormEvent) {
    e.preventDefault();
    setPrefsNotice(null);
    setPrefsSaving(true);
    const { error } = await supabase.auth.updateUser({
      data: {
        preferences: {
          product_updates: productUpdates,
          marketing_emails: marketingEmails
        }
      }
    });
    if (error) {
      setPrefsNotice({ type: "err", text: error.message || "Could not save preferences." });
      setPrefsSaving(false);
      return;
    }
    setPrefsNotice({ type: "ok", text: "Preferences saved." });
    setPrefsSaving(false);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-gray-800 bg-gray-900/30 p-6">
        <h2 className="text-lg font-semibold text-gray-100">Profile</h2>
        <p className="mt-1 text-sm text-gray-400">Control your public identity across MCMerchant.</p>
        <form onSubmit={saveProfile} className="mt-5 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500">Username</label>
              <input
                value={profileUsername}
                onChange={(e) => setProfileUsername(e.target.value)}
                className="mt-2 w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-sm text-gray-100"
                placeholder="yourname"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500">Display name</label>
              <input
                value={profileDisplayName}
                onChange={(e) => setProfileDisplayName(e.target.value)}
                className="mt-2 w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-sm text-gray-100"
                placeholder="Your Name"
              />
            </div>
          </div>
          {profileNotice ? (
            <p className={profileNotice.type === "ok" ? "text-sm text-emerald-300" : "text-sm text-red-300"}>
              {profileNotice.text}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={profileSaving}
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-gray-950 disabled:opacity-60"
          >
            {profileSaving ? "Saving..." : "Save profile"}
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-gray-800 bg-gray-900/30 p-6">
        <h2 className="text-lg font-semibold text-gray-100">Email</h2>
        <p className="mt-1 text-sm text-gray-400">
          Current email: <span className="text-gray-200">{email}</span>{" "}
          {!emailVerified ? <span className="text-amber-300">(unverified)</span> : null}
        </p>
        <form onSubmit={saveEmail} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500">New email</label>
            <input
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              type="email"
              className="mt-2 w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-sm text-gray-100"
              placeholder="you@domain.com"
            />
          </div>
          {emailNotice ? (
            <p className={emailNotice.type === "ok" ? "text-sm text-emerald-300" : "text-sm text-red-300"}>
              {emailNotice.text}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={emailSaving}
            className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm font-medium text-gray-200 disabled:opacity-60"
          >
            {emailSaving ? "Requesting..." : "Request email change"}
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-gray-800 bg-gray-900/30 p-6">
        <h2 className="text-lg font-semibold text-gray-100">Security</h2>
        <p className="mt-1 text-sm text-gray-400">Use a strong password and rotate it regularly.</p>
        <form onSubmit={savePassword} className="mt-5 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500">New password</label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                className="mt-2 w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-sm text-gray-100"
                placeholder="Minimum 8 characters"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500">Confirm password</label>
              <input
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                type="password"
                className="mt-2 w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-sm text-gray-100"
                placeholder="Re-enter password"
              />
            </div>
          </div>
          {securityNotice ? (
            <p className={securityNotice.type === "ok" ? "text-sm text-emerald-300" : "text-sm text-red-300"}>
              {securityNotice.text}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={securitySaving}
            className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm font-medium text-gray-200 disabled:opacity-60"
          >
            {securitySaving ? "Updating..." : "Update password"}
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-gray-800 bg-gray-900/30 p-6">
        <h2 className="text-lg font-semibold text-gray-100">Preferences</h2>
        <p className="mt-1 text-sm text-gray-400">Manage communications and product update preferences.</p>
        <form onSubmit={savePreferences} className="mt-5 space-y-4">
          <label className="flex items-center gap-3 text-sm text-gray-300">
            <input
              type="checkbox"
              checked={productUpdates}
              onChange={(e) => setProductUpdates(e.target.checked)}
              className="h-4 w-4 rounded border-gray-700 bg-gray-950 text-brand-500"
            />
            Product updates and release announcements
          </label>
          <label className="flex items-center gap-3 text-sm text-gray-300">
            <input
              type="checkbox"
              checked={marketingEmails}
              onChange={(e) => setMarketingEmails(e.target.checked)}
              className="h-4 w-4 rounded border-gray-700 bg-gray-950 text-brand-500"
            />
            Marketplace promotions and featured plugins
          </label>
          {prefsNotice ? (
            <p className={prefsNotice.type === "ok" ? "text-sm text-emerald-300" : "text-sm text-red-300"}>
              {prefsNotice.text}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={prefsSaving}
            className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm font-medium text-gray-200 disabled:opacity-60"
          >
            {prefsSaving ? "Saving..." : "Save preferences"}
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-red-900/40 bg-red-950/20 p-6">
        <h2 className="text-lg font-semibold text-red-100">Danger zone</h2>
        <p className="mt-1 text-sm text-red-200/90">
          Need account deletion or data export? Contact support from the email address on this account.
        </p>
        <a
          href="mailto:support@mcmmerchant.net?subject=Account%20Support%20Request"
          className="mt-4 inline-flex rounded-lg border border-red-700/60 bg-red-900/20 px-4 py-2 text-sm font-medium text-red-100 hover:bg-red-900/35"
        >
          Contact support
        </a>
      </section>
    </div>
  );
}

