import { NextResponse } from "next/server";
import { getCanonicalAppOriginForServer } from "@/lib/app-url";
import { sanitizeAuthNextParam } from "@/lib/auth/email-verification";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route-handler";
import { enforceCsrfForRequest } from "@/lib/security/csrf";

export const dynamic = "force-dynamic";

function friendlyEmailChangeError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("sending") && m.includes("email")) {
    return (
      "We couldn’t send the confirmation email. In Supabase: Authentication → Emails, enable/configure " +
      "custom SMTP (or check rate limits). Also add your redirect URL under Authentication → URL Configuration " +
      "(see .env.local.example)."
    );
  }
  if (m.includes("redirect") || m.includes("redirect_uri")) {
    return (
      "Email redirect URL not allowed. In Supabase Dashboard → Authentication → URL Configuration, add: " +
      "`{your site}/auth/callback` to Redirect URLs."
    );
  }
  return message;
}

export async function POST(req: Request) {
  const csrf = enforceCsrfForRequest(req);
  if (csrf) return csrf;
  let body: { email?: string };
  try {
    body = (await req.json()) as { email?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const newEmail = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!newEmail || !newEmail.includes("@")) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const origin = getCanonicalAppOriginForServer();
  if (!origin) {
    return NextResponse.json(
      { error: "Server misconfiguration: set NEXT_PUBLIC_APP_URL to your public site URL." },
      { status: 500 }
    );
  }

  const nextPath = sanitizeAuthNextParam("/account?notice=email_change", "/account");
  const emailRedirectTo = `${origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;

  try {
    const supabase = createSupabaseRouteHandlerClient();
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();

    if (userError || !user?.id) {
      return NextResponse.json({ error: "You must be signed in to change your email." }, { status: 401 });
    }

    const { error } = await supabase.auth.updateUser({ email: newEmail }, { emailRedirectTo });

    if (error) {
      return NextResponse.json(
        { error: friendlyEmailChangeError(error.message ?? "Could not request email change.") },
        { status: 422 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Check your new inbox for a confirmation link. You may also need to confirm from your current email if your project uses double confirmation."
    });
  } catch (e) {
    console.error("request-email-change:", e);
    return NextResponse.json({ error: "Something went wrong. Try again later." }, { status: 500 });
  }
}
