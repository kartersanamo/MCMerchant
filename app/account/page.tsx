import Link from "next/link";
import { getAuthedUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AccountSettingsPanel } from "./account-settings-panel";

export default async function AccountPage() {
  const user = await getAuthedUser();
  if (!user) redirect("/login?redirect=/account");
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
    preferences?: { product_updates?: boolean; marketing_emails?: boolean };
  };
  const preferences = metadata.preferences ?? {};
  const username = profile?.username ?? user.displayName;
  const displayName = profile?.display_name ?? user.displayName;

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <Link href="/browse" className="text-sm text-gray-400 hover:text-gray-200">
        ← Back to browse
      </Link>
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
            marketingEmails: !!preferences.marketing_emails
          }}
        />
      </div>
    </div>
  );
}
