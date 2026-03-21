import { NextResponse } from "next/server";
import { Resend } from "resend";
import ConfirmEmail from "@/emails/confirm-email";

const resend = new Resend(process.env.RESEND_API_KEY);
const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "MCMerchant";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://mcmerchant.net";
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "hello@mcmerchant.net";

export async function POST(req: Request) {
  const { email, confirmUrl } = await req.json();
  if (!email || !confirmUrl) {
    return NextResponse.json({ error: "Missing email or confirmUrl" }, { status: 400 });
  }

  try {
    await resend.emails.send({
      from: `${APP_NAME} <${FROM_EMAIL}>`,
      to: email,
      subject: `Confirm your email for ${APP_NAME}`,
      react: ConfirmEmail({ confirmUrl }),
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
