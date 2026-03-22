"use client";

import { useMemo, useState } from "react";
import { SUPPORT_DISCORD_URL } from "@/lib/app-url";
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

  const [passwordLinkSending, setPasswordLinkSending] = useState(false);
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
    try {
      const res = await fetch("/api/auth/request-email-change", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ email: next })
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string; message?: string };
      if (!res.ok) {
        setEmailNotice({
          type: "err",
          text: data.error || "Could not request email change."
        });
        setEmailSaving(false);
        return;
      }
      setEmailNotice({
        type: "ok",
        text:
          data.message ||
          "Check your new inbox for a confirmation link. You may also need to confirm from your current email."
      });
      setNewEmail("");
    } catch {
      setEmailNotice({ type: "err", text: "Network error. Try again." });
    }
    setEmailSaving(false);
  }

  async function sendPasswordChangeEmail() {
    setSecurityNotice(null);
    setPasswordLinkSending(true);
    try {
      const res = await fetch("/api/auth/send-password-change-link", {
        method: "POST",
        credentials: "same-origin"
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string; message?: string };
      if (!res.ok) {
        setSecurityNotice({
          type: "err",
          text: data.error || "Could not send password email."
        });
        setPasswordLinkSending(false);
        return;
      }
      setSecurityNotice({
        type: "ok",
        text: data.message || "Check your email for a link to set a new password."
      });
    } catch {
      setSecurityNotice({ type: "err", text: "Network error. Try again." });
    }
    setPasswordLinkSending(false);
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
        <p className="mt-1 text-sm text-gray-400">
          We&apos;ll email you a secure link. Open it on this site, then enter your new password twice (minimum 8
          characters; both fields must match).
        </p>
        <div className="mt-5 space-y-4">
          {securityNotice ? (
            <p className={securityNotice.type === "ok" ? "text-sm text-emerald-300" : "text-sm text-red-300"}>
              {securityNotice.text}
            </p>
          ) : null}
          <button
            type="button"
            disabled={passwordLinkSending}
            onClick={() => void sendPasswordChangeEmail()}
            className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm font-medium text-gray-200 disabled:opacity-60"
          >
            {passwordLinkSending ? "Sending…" : "Email me a password reset link"}
          </button>
        </div>
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
          Need account deletion or data export? Open a ticket in our Discord server and we&apos;ll help from there.
        </p>
        <a
          href={SUPPORT_DISCORD_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex rounded-lg border border-red-700/60 bg-red-900/20 px-4 py-2 text-sm font-medium text-red-100 hover:bg-red-900/35"
        >
          Discord support
        </a>
      </section>
    </div>
  );
}

