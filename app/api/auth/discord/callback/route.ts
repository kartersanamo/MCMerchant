import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCanonicalAppOriginForServer } from "@/lib/app-url";
import {
  consumeAndValidateDiscordState,
  exchangeDiscordCodeForUser,
  getDiscordOauthConfig,
  sendBotWebhook,
} from "@/lib/discord-sync";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const origin = getCanonicalAppOriginForServer() || requestUrl.origin;
  const code = requestUrl.searchParams.get("code");
  const state = requestUrl.searchParams.get("state");

  if (!code || !consumeAndValidateDiscordState(state)) {
    return NextResponse.redirect(new URL("/account?notice=discord_sync_failed", origin));
  }

  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL("/login?redirect=/account/connections/discord/sync", origin));
  }

  const config = getDiscordOauthConfig();
  if (!config.clientId || !config.clientSecret || !config.redirectUri) {
    return NextResponse.redirect(new URL("/account?notice=discord_config_error", origin));
  }

  const discordUser = await exchangeDiscordCodeForUser({
    code,
    clientId: config.clientId,
    clientSecret: config.clientSecret,
    redirectUri: config.redirectUri,
  });
  if (!discordUser) {
    return NextResponse.redirect(new URL("/account?notice=discord_sync_failed", origin));
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .maybeSingle();
  const appUsername =
    profile?.username ||
    (typeof user.user_metadata?.name === "string" ? user.user_metadata.name : "") ||
    user.email?.split("@")[0] ||
    "User";

  const metadata = (user.user_metadata ?? {}) as Record<string, unknown>;
  const nextMetadata: Record<string, unknown> = {
    ...metadata,
    discord_connection: {
      id: discordUser.id,
      username: discordUser.username,
      global_name: discordUser.global_name ?? null,
      connected_at: new Date().toISOString(),
    },
  };

  await supabase.auth.admin.updateUserById(user.id, {
    user_metadata: nextMetadata,
  });

  await sendBotWebhook({
    webhookUrl: config.botWebhookUrl,
    sharedSecret: config.botWebhookSecret,
    eventType: "verify.synced",
    data: {
      discord_user_id: Number(discordUser.id),
      username: appUsername,
    },
  });

  return NextResponse.redirect(new URL("/account?notice=discord_synced", origin));
}

