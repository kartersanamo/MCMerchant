import { getResend } from "@/lib/resend";
import NewVersionNotificationEmail from "@/emails/new-version-notification";

type SupabaseLike = {
  from: (table: string) => any;
  auth: {
    admin: {
      getUserById: (id: string) => Promise<{ data?: { user?: any } }>;
    };
  };
};

function appOrigin() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export async function sendVersionReleaseNotifications(args: {
  supabase: SupabaseLike;
  pluginId: string;
  pluginSlug: string;
  pluginName: string;
  version: string;
  changelog: string | null;
  sellerId: string;
}) {
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  if (!fromEmail) return;

  const resend = getResend();
  const pluginUrl = `${appOrigin()}/plugin/${args.pluginSlug}`;
  const downloadUrl = `${pluginUrl}/install`;
  const managePrefsUrl = `${appOrigin()}/account`;

  // Recipients: anyone who bought the plugin or has an active license.
  const [{ data: purchases }, { data: licenses }] = await Promise.all([
    args.supabase
      .from("purchases")
      .select("buyer_id")
      .eq("plugin_id", args.pluginId)
      .eq("status", "completed"),
    args.supabase
      .from("license_keys")
      .select("buyer_id")
      .eq("plugin_id", args.pluginId)
      .eq("is_active", true)
  ]);

  const userIds = Array.from(
    new Set([
      ...((purchases ?? []).map((r: any) => r.buyer_id).filter(Boolean) as string[]),
      ...((licenses ?? []).map((r: any) => r.buyer_id).filter(Boolean) as string[])
    ])
  ).filter((id) => id && id !== args.sellerId);

  if (!userIds.length) return;

  for (const uid of userIds) {
    try {
      const { data } = await args.supabase.auth.admin.getUserById(uid);
      const user = data?.user;
      const to = user?.email as string | undefined;
      if (!to) continue;

      const prefs = (user?.user_metadata?.preferences ?? {}) as {
        product_updates?: boolean;
        version_release_emails?: boolean;
      };
      const wantsVersionEmails = prefs.version_release_emails ?? prefs.product_updates ?? true;
      if (!wantsVersionEmails) continue;

      await resend.emails.send({
        from: fromEmail,
        to,
        subject: `${args.pluginName} updated to v${args.version}`,
        react: NewVersionNotificationEmail({
          pluginName: args.pluginName,
          version: args.version,
          changelog: args.changelog,
          downloadUrl,
          pluginUrl,
          managePrefsUrl
        })
      });
    } catch (err) {
      console.error("[notifications/version-release] email failed", {
        pluginId: args.pluginId,
        userIdSuffix: uid.slice(-8),
        error: err instanceof Error ? err.message : String(err)
      });
    }
  }
}

