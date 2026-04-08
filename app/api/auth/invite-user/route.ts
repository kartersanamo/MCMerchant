import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCanonicalAppOriginForServer } from "@/lib/app-url";
import { requireVerifiedUserForApi } from "@/lib/auth/email-verification";
import { enforceCsrfForRequest } from "@/lib/security/csrf";

export const dynamic = "force-dynamic";

function normalizeEmail(input: unknown): string {
  return typeof input === "string" ? input.trim().toLowerCase() : "";
}

export async function POST(req: Request) {
  const csrf = enforceCsrfForRequest(req);
  if (csrf) return csrf;
  const gate = await requireVerifiedUserForApi();
  if (gate instanceof NextResponse) return gate;

  let body: { email?: string };
  try {
    body = (await req.json()) as { email?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const inviteEmail = normalizeEmail(body?.email);
  if (!inviteEmail || !inviteEmail.includes("@")) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const origin = getCanonicalAppOriginForServer();
  if (!origin) {
    return NextResponse.json(
      { error: "Server misconfiguration: set NEXT_PUBLIC_APP_URL to your public site URL." },
      { status: 500 }
    );
  }

  const supabase = createSupabaseServerClient();
  const redirectTo = `${origin}/confirm-email?next=${encodeURIComponent("/email-verified")}`;

  const { error } = await supabase.auth.admin.inviteUserByEmail(inviteEmail, {
    redirectTo
  });

  if (error) {
    // Prevent account enumeration and keep UX consistent.
    const msg = (error.message ?? "").toLowerCase();
    const duplicateLike =
      msg.includes("already") || msg.includes("exists") || msg.includes("registered");
    if (duplicateLike) {
      return NextResponse.json({
        ok: true,
        message:
          "If the address can receive invites, we’ve sent an invitation email. If an account already exists, they can log in directly."
      });
    }
    return NextResponse.json({ error: error.message || "Could not send invite." }, { status: 422 });
  }

  return NextResponse.json({
    ok: true,
    message: "Invitation sent. They’ll receive an email with a sign-up link."
  });
}

