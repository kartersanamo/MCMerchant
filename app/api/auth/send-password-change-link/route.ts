import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getCanonicalAppOriginForServer } from "@/lib/app-url";
import PasswordChangeEmail from "@/emails/password-change";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route-handler";

export const dynamic = "force-dynamic";

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "MCMerchant";
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "hello@mcmerchant.net";

export async function POST() {
  const origin = getCanonicalAppOriginForServer();
  if (!origin) {
    return NextResponse.json(
      { error: "Server misconfiguration: set NEXT_PUBLIC_APP_URL to your public site URL." },
      { status: 500 }
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const resendKey = process.env.RESEND_API_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { error: "Missing Supabase service configuration (SUPABASE_SERVICE_ROLE_KEY)." },
      { status: 500 }
    );
  }
  if (!resendKey) {
    return NextResponse.json(
      { error: "Missing RESEND_API_KEY — cannot send password change email." },
      { status: 500 }
    );
  }

  try {
    const supabase = createSupabaseRouteHandlerClient();
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();

    if (userError || !user?.id || !user.email) {
      return NextResponse.json({ error: "You must be signed in to change your password." }, { status: 401 });
    }

    const redirectTo = `${origin}/auth/update-password`;

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const { data, error: linkError } = await admin.auth.admin.generateLink({
      type: "recovery",
      email: user.email,
      options: { redirectTo }
    });

    if (linkError) {
      console.error("generateLink recovery:", linkError);
      return NextResponse.json(
        { error: linkError.message ?? "Could not create password reset link." },
        { status: 422 }
      );
    }

    const props = data?.properties as { action_link?: string } | undefined;
    const resetUrl = props?.action_link;
    if (!resetUrl) {
      return NextResponse.json({ error: "Could not build reset link. Check Supabase Auth settings." }, { status: 500 });
    }

    const resend = new Resend(resendKey);
    await resend.emails.send({
      from: `${APP_NAME} <${FROM_EMAIL}>`,
      to: user.email,
      subject: `Change your ${APP_NAME} password`,
      react: PasswordChangeEmail({ resetUrl, appName: APP_NAME })
    });

    return NextResponse.json({
      ok: true,
      message: `We sent a link to ${user.email}. Open it to set a new password on ${origin.replace(/^https?:\/\//, "")}.`
    });
  } catch (e) {
    console.error("send-password-change-link:", e);
    return NextResponse.json({ error: "Something went wrong sending the email. Try again later." }, { status: 500 });
  }
}
