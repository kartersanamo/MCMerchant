import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCanonicalAppOriginForServer } from "@/lib/app-url";
import { getDiscordOauthConfig, sendBotWebhook } from "@/lib/discord-sync";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const origin = getCanonicalAppOriginForServer() || requestUrl.origin;
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login?redirect=/account", origin));
  }

  const metadata = (user.user_metadata ?? {}) as Record<string, unknown>;
  const discordConnection =
    (metadata.discord_connection as { id?: string; username?: string } | undefined) ?? undefined;
  const discordUserId = discordConnection?.id ? Number(discordConnection.id) : null;

  const nextMetadata: Record<string, unknown> = { ...metadata };
  delete nextMetadata.discord_connection;

  await supabase.auth.admin.updateUserById(user.id, {
    user_metadata: nextMetadata,
  });

  const config = getDiscordOauthConfig();
  if (discordUserId) {
    await sendBotWebhook({
      webhookUrl: config.botWebhookUrl,
      sharedSecret: config.botWebhookSecret,
      eventType: "verify.unsynced",
      data: { discord_user_id: discordUserId },
    });
  }

  return NextResponse.redirect(new URL("/account?notice=discord_unsynced", origin));
}

