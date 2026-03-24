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
    versionReleaseEmails: boolean;
    marketingEmails: boolean;
  };
  discordConnection: {
    id: string;
    username: string | null;
    globalName: string | null;
  } | null;
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
  initialPrefs,
  discordConnection
}: Props) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [profileUsername, setProfileUsername] = useState(username);
  const [profileDisplayName, setProfileDisplayName] = useState(displayName);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileNotice, setProfileNotice] = useState<Notice>(null);

  const [newEmail, setNewEmail] = useState("");
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailNotice, setEmailNotice] = useState<Notice>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteSending, setInviteSending] = useState(false);
  const [inviteNotice, setInviteNotice] = useState<Notice>(null);

  const [passwordLinkSending, setPasswordLinkSending] = useState(false);
  const [reauthSending, setReauthSending] = useState(false);
  const [reauthCode, setReauthCode] = useState("");
  const [secureNewPassword, setSecureNewPassword] = useState("");
  const [secureConfirmPassword, setSecureConfirmPassword] = useState("");
  const [securePasswordSubmitting, setSecurePasswordSubmitting] = useState(false);
  const [securityNotice, setSecurityNotice] = useState<Notice>(null);

  const [productUpdates, setProductUpdates] = useState(initialPrefs.productUpdates);
  const [versionReleaseEmails, setVersionReleaseEmails] = useState(initialPrefs.versionReleaseEmails);
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

  async function sendReauthEmail() {
    setSecurityNotice(null);
    setReauthSending(true);
    try {
      const result = await supabase.auth.reauthenticate();
      if (result.error) {
        setSecurityNotice({
          type: "err",
          text: result.error.message || "Could not send reauthentication email."
        });
        setReauthSending(false);
        return;
      }
      setSecurityNotice({
        type: "ok",
        text: "Reauthentication email sent. Enter the 6-digit code from your inbox below."
      });
    } catch {
      setSecurityNotice({ type: "err", text: "Network error. Try again." });
    }
    setReauthSending(false);
  }

  async function updatePasswordWithReauth(e: React.FormEvent) {
    e.preventDefault();
    setSecurityNotice(null);

    const nonce = reauthCode.trim();
    if (!/^\d{6}$/.test(nonce)) {
      setSecurityNotice({ type: "err", text: "Enter the 6-digit reauthentication code from your email." });
      return;
    }
    if (secureNewPassword.length < 8) {
      setSecurityNotice({ type: "err", text: "New password must be at least 8 characters." });
      return;
    }
    if (secureNewPassword !== secureConfirmPassword) {
      setSecurityNotice({ type: "err", text: "New password and confirmation do not match." });
      return;
    }

    setSecurePasswordSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: secureNewPassword,
        nonce
      });
      if (error) {
        setSecurityNotice({ type: "err", text: error.message || "Could not update password." });
        setSecurePasswordSubmitting(false);
        return;
      }

      setSecurityNotice({ type: "ok", text: "Password updated successfully." });
      setReauthCode("");
      setSecureNewPassword("");
      setSecureConfirmPassword("");
    } catch {
      setSecurityNotice({ type: "err", text: "Network error. Try again." });
    }
    setSecurePasswordSubmitting(false);
  }

  async function inviteUser(e: React.FormEvent) {
    e.preventDefault();
    setInviteNotice(null);
    const target = inviteEmail.trim().toLowerCase();
    if (!target || !target.includes("@")) {
      setInviteNotice({ type: "err", text: "Enter a valid email address." });
      return;
    }
    setInviteSending(true);
    try {
      const res = await fetch("/api/auth/invite-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ email: target })
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string; message?: string };
      if (!res.ok) {
        setInviteNotice({ type: "err", text: data.error || "Could not send invite." });
        setInviteSending(false);
        return;
      }
      setInviteNotice({
        type: "ok",
        text:
          data.message ||
          "If that address can receive invites, they’ll get an invitation email shortly."
      });
      setInviteEmail("");
    } catch {
      setInviteNotice({ type: "err", text: "Network error. Try again." });
    }
    setInviteSending(false);
  }

  async function savePreferences(e: React.FormEvent) {
    e.preventDefault();
    setPrefsNotice(null);
    setPrefsSaving(true);
    const { error } = await supabase.auth.updateUser({
      data: {
        preferences: {
          product_updates: productUpdates,
          version_release_emails: versionReleaseEmails,
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
          For secure password changes, request a reauthentication code and enter it with your new password.
          You can also use a standard password reset link.
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
          <button
            type="button"
            disabled={reauthSending}
            onClick={() => void sendReauthEmail()}
            className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm font-medium text-gray-200 disabled:opacity-60"
          >
            {reauthSending ? "Sending…" : "Send reauthentication code"}
          </button>

          <form onSubmit={updatePasswordWithReauth} className="space-y-3 rounded-xl border border-gray-800 bg-gray-950/40 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Secure password change
            </p>
            <div>
              <label className="block text-xs text-gray-400">Reauthentication code</label>
              <input
                value={reauthCode}
                onChange={(e) => setReauthCode(e.target.value)}
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                className="mt-1 w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-sm text-gray-100"
                placeholder="123456"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400">New password</label>
              <input
                type="password"
                value={secureNewPassword}
                onChange={(e) => setSecureNewPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-sm text-gray-100"
                placeholder="At least 8 characters"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400">Confirm new password</label>
              <input
                type="password"
                value={secureConfirmPassword}
                onChange={(e) => setSecureConfirmPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-sm text-gray-100"
                placeholder="Re-enter new password"
              />
            </div>
            <button
              type="submit"
              disabled={securePasswordSubmitting}
              className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-gray-950 disabled:opacity-60"
            >
              {securePasswordSubmitting ? "Updating…" : "Update password with code"}
            </button>
          </form>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-800 bg-gray-900/30 p-6">
        <h2 className="text-lg font-semibold text-gray-100">Invite user</h2>
        <p className="mt-1 text-sm text-gray-400">
          Send an account invitation email. They&apos;ll get a sign-up link from Supabase.
        </p>
        <form onSubmit={inviteUser} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500">
              Invite by email
            </label>
            <input
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              type="email"
              className="mt-2 w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-sm text-gray-100"
              placeholder="friend@example.com"
            />
          </div>
          {inviteNotice ? (
            <p className={inviteNotice.type === "ok" ? "text-sm text-emerald-300" : "text-sm text-red-300"}>
              {inviteNotice.text}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={inviteSending}
            className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm font-medium text-gray-200 disabled:opacity-60"
          >
            {inviteSending ? "Sending invite…" : "Send invite"}
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-gray-800 bg-gray-900/30 p-6">
        <h2 className="text-lg font-semibold text-gray-100">Discord Connection</h2>
        <p className="mt-1 text-sm text-gray-400">
          Sync your Discord account to unlock the verified role in the community server.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          {discordConnection ? (
            <>
              <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-200">
                Connected: {discordConnection.globalName || discordConnection.username || discordConnection.id}
              </span>
              <a
                href="/account/connections/discord/unsync"
                className="rounded-lg border border-amber-600/40 bg-amber-600/10 px-4 py-2 text-sm font-medium text-amber-100 hover:bg-amber-600/20"
              >
                Unsync Discord
              </a>
            </>
          ) : (
            <a
              href="/account/connections/discord/sync"
              className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-gray-950 hover:brightness-110"
            >
              Sync Discord
            </a>
          )}
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
              checked={versionReleaseEmails}
              onChange={(e) => setVersionReleaseEmails(e.target.checked)}
              className="h-4 w-4 rounded border-gray-700 bg-gray-950 text-brand-500"
            />
            New version notifications for plugins I own
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

