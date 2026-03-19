import Link from "next/link";
import { getAuthedUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AccountSettingsForm } from "./account-settings-form";

export default async function AccountPage() {
  const user = await getAuthedUser();
  if (!user) redirect("/login?redirect=/account");

  return (
    <div className="mx-auto w-full max-w-lg px-6 py-10">
      <Link href="/browse" className="text-sm text-gray-400 hover:text-gray-200">
        ← Back to browse
      </Link>
      <h1 className="mt-4 text-2xl font-semibold text-gray-100">Account settings</h1>
      <p className="mt-2 text-sm text-gray-400">
        Update your display name and password. Email is managed by your auth provider.
      </p>

      <div className="mt-6 space-y-6 rounded-xl border border-gray-800 bg-gray-900/30 p-6">
        <div>
          <label className="block text-xs font-medium uppercase tracking-wider text-gray-500">
            Name
          </label>
          <div className="mt-2 text-gray-100">{user.displayName}</div>
          <p className="mt-1 text-xs text-gray-500">From your profile (username) or email.</p>
        </div>
        <div>
          <label className="block text-xs font-medium uppercase tracking-wider text-gray-500">
            Email
          </label>
          <div className="mt-2 text-gray-100 break-all">{user.email}</div>
        </div>
        <AccountSettingsForm />
      </div>
    </div>
  );
}
