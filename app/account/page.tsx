import Link from "next/link";
import { getAuthedUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AccountSettingsPanel } from "./account-settings-panel";

type AccountPageProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const user = await getAuthedUser();
  if (!user) redirect("/login?redirect=/account");

  const noticeRaw = searchParams.notice;
  const notice = typeof noticeRaw === "string" ? noticeRaw : Array.isArray(noticeRaw) ? noticeRaw[0] : undefined;
  const supabase = createSupabaseServerClient();

  const [{ data: profile }, { data: authData }] = await Promise.all([
    supabase
      .from("profiles")
      .select("username, display_name")
      .eq("id", user.id)
      .maybeSingle(),
    supabase.auth.getUser()
  ]);

  const metadata = (authData.user?.user_metadata ?? {}) as {
    preferences?: {
      product_updates?: boolean;
      version_release_emails?: boolean;
      marketing_emails?: boolean;
    };
    discord_connection?: { id?: string; username?: string; global_name?: string | null };
  };
  const preferences = metadata.preferences ?? {};
  const discordConnection = metadata.discord_connection;
  const username = profile?.username ?? user.displayName;
  const displayName = profile?.display_name ?? user.displayName;

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <Link href="/browse" className="text-sm text-gray-400 hover:text-gray-200">
        ← Back to browse
      </Link>
      {notice === "password_updated" ? (
        <div className="mt-4 rounded-xl border border-emerald-500/35 bg-emerald-500/10 p-4 text-sm text-emerald-100/90">
          Your password was updated successfully.
        </div>
      ) : null}
      {notice === "email_change" ? (
        <div className="mt-4 rounded-xl border border-emerald-500/35 bg-emerald-500/10 p-4 text-sm text-emerald-100/90">
          Email change confirmed. You&apos;re all set.
        </div>
      ) : null}
      {notice === "discord_synced" ? (
        <div className="mt-4 rounded-xl border border-emerald-500/35 bg-emerald-500/10 p-4 text-sm text-emerald-100/90">
          Discord account connected successfully.
        </div>
      ) : null}
      {notice === "discord_unsynced" ? (
        <div className="mt-4 rounded-xl border border-amber-500/35 bg-amber-500/10 p-4 text-sm text-amber-100/90">
          Discord account disconnected.
        </div>
      ) : null}
      {notice === "discord_sync_failed" ? (
        <div className="mt-4 rounded-xl border border-red-500/35 bg-red-500/10 p-4 text-sm text-red-100/90">
          Could not complete Discord sync. Please try again.
        </div>
      ) : null}
      {notice === "discord_config_error" ? (
        <div className="mt-4 rounded-xl border border-red-500/35 bg-red-500/10 p-4 text-sm text-red-100/90">
          Discord sync is not configured yet. Contact support.
        </div>
      ) : null}
      {!user.emailVerified ? (
        <div className="mt-4 rounded-xl border border-amber-500/35 bg-amber-500/10 p-4 text-sm text-amber-100/90">
          <p className="font-medium text-amber-100">Email not verified</p>
          <p className="mt-1 text-amber-100/80">
            Confirm your email to use seller tools, download the loader, and post reviews.
          </p>
          <Link
            href={`/check-email?email=${encodeURIComponent(user.email)}&reason=verify_email`}
            className="mt-3 inline-block font-medium text-brand-300 hover:underline"
          >
            Resend confirmation email
          </Link>
        </div>
      ) : null}
      <h1 className="mt-4 text-2xl font-semibold text-gray-100">Account settings</h1>
      <p className="mt-2 text-sm text-gray-400">
        Manage your profile, security, communications, and account preferences in one place.
      </p>

      <div className="mt-6">
        <AccountSettingsPanel
          userId={user.id}
          email={user.email}
          emailVerified={user.emailVerified}
          username={username}
          displayName={displayName}
          initialPrefs={{
            productUpdates: !!preferences.product_updates,
            versionReleaseEmails: preferences.version_release_emails ?? !!preferences.product_updates,
            marketingEmails: !!preferences.marketing_emails
          }}
          discordConnection={
            discordConnection?.id
              ? {
                  id: discordConnection.id,
                  username: discordConnection.username ?? null,
                  globalName: discordConnection.global_name ?? null
                }
              : null
          }
        />
      </div>
    </div>
  );
}
