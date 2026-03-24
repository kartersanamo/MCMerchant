import { randomUUID, createHmac } from "node:crypto";
import { cookies } from "next/headers";
import { getCanonicalAppOriginForServer } from "@/lib/app-url";

const STATE_COOKIE = "discord_sync_state";
const STATE_COOKIE_MAX_AGE_SECONDS = 10 * 60;

export type DiscordUserIdentity = {
  id: string;
  username: string;
  discriminator?: string;
  global_name?: string | null;
};

export function getDiscordOauthConfig() {
  const clientId = process.env.DISCORD_CLIENT_ID?.trim() ?? "";
  const clientSecret = process.env.DISCORD_CLIENT_SECRET?.trim() ?? "";
  const botWebhookUrl = process.env.MERCHANTBOT_WEBHOOK_URL?.trim() ?? "";
  const botWebhookSecret = process.env.MERCHANTBOT_WEBHOOK_SECRET?.trim() ?? "";
  const appOrigin = getCanonicalAppOriginForServer();
  const redirectUri = process.env.DISCORD_REDIRECT_URI?.trim() || `${appOrigin}/api/auth/discord/callback`;
  return {
    clientId,
    clientSecret,
    redirectUri,
    botWebhookUrl,
    botWebhookSecret,
    appOrigin,
  };
}

export function createAndStoreDiscordState(): string {
  const state = randomUUID();
  const cookieStore = cookies();
  cookieStore.set(STATE_COOKIE, state, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: STATE_COOKIE_MAX_AGE_SECONDS,
  });
  return state;
}

export function consumeAndValidateDiscordState(received: string | null): boolean {
  const cookieStore = cookies();
  const expected = cookieStore.get(STATE_COOKIE)?.value ?? "";
  cookieStore.set(STATE_COOKIE, "", { path: "/", maxAge: 0 });
  if (!received || !expected) return false;
  return received === expected;
}

export async function exchangeDiscordCodeForUser(args: {
  code: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}): Promise<DiscordUserIdentity | null> {
  const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: args.clientId,
      client_secret: args.clientSecret,
      grant_type: "authorization_code",
      code: args.code,
      redirect_uri: args.redirectUri,
    }),
    cache: "no-store",
  });

  if (!tokenRes.ok) return null;
  const tokenJson = (await tokenRes.json().catch(() => null)) as
    | { access_token?: string }
    | null;
  const accessToken = tokenJson?.access_token;
  if (!accessToken) return null;

  const meRes = await fetch("https://discord.com/api/users/@me", {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (!meRes.ok) return null;
  const me = (await meRes.json().catch(() => null)) as DiscordUserIdentity | null;
  if (!me?.id || !me?.username) return null;
  return me;
}

export async function sendBotWebhook(args: {
  webhookUrl: string;
  sharedSecret: string;
  eventType: "verify.synced" | "verify.unsynced";
  data: Record<string, unknown>;
}) {
  if (!args.webhookUrl || !args.sharedSecret) return;
  const eventId = randomUUID();
  const timestamp = String(Math.floor(Date.now() / 1000));
  const payload = JSON.stringify({ type: args.eventType, data: args.data });
  const signature = createHmac("sha256", args.sharedSecret)
    .update(`${timestamp}.${payload}`)
    .digest("hex");
  await fetch(args.webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-MCMerchant-Timestamp": timestamp,
      "X-MCMerchant-Signature": `sha256=${signature}`,
      "X-MCMerchant-Event-Id": eventId,
    },
    body: payload,
    cache: "no-store",
  }).catch(() => {
    // Best-effort webhook: account sync should still complete locally.
  });
}

