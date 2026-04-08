import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createAndStoreDiscordState, getDiscordOauthConfig } from "@/lib/discord-sync";
import { enforceCsrfForRequest } from "@/lib/security/csrf";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const csrf = enforceCsrfForRequest(request, { protectSafeMethods: true });
  if (csrf) return csrf;
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const requestUrl = new URL(request.url);
    return NextResponse.redirect(
      new URL("/login?redirect=/account/connections/discord/sync", requestUrl.origin)
    );
  }

  const config = getDiscordOauthConfig();
  if (!config.clientId || !config.clientSecret || !config.redirectUri || !config.appOrigin) {
    const requestUrl = new URL(request.url);
    return NextResponse.redirect(
      new URL("/account?notice=discord_config_error", config.appOrigin || requestUrl.origin)
    );
  }

  const state = createAndStoreDiscordState();
  const authorizeUrl = new URL("https://discord.com/oauth2/authorize");
  authorizeUrl.searchParams.set("client_id", config.clientId);
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("redirect_uri", config.redirectUri);
  authorizeUrl.searchParams.set("scope", "identify");
  authorizeUrl.searchParams.set("state", state);
  authorizeUrl.searchParams.set("prompt", "consent");

  return NextResponse.redirect(authorizeUrl);
}

