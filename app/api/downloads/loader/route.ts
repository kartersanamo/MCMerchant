import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { userEmailIsVerified } from "@/lib/auth/email-verification";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createSupabaseServerClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user?.id) {
    return NextResponse.json(
      { error: "unauthorized", code: "unauthorized", message: "Log in to download the loader." },
      { status: 401 }
    );
  }
  if (!userEmailIsVerified(authData.user)) {
    return NextResponse.json(
      {
        error: "email_not_verified",
        code: "email_not_verified",
        message: "Verify your email to download MCMerchantLoader."
      },
      { status: 403 }
    );
  }

  // Hosted loader download:
  // - Override with `MCMERCHANT_LOADER_DOWNLOAD_URL`
  // - Default: official GitHub release asset
  const downloadUrl =
    process.env.MCMERCHANT_LOADER_DOWNLOAD_URL ??
    "https://github.com/kartersanamo/MCMerchant-Loader/releases/download/v1.0.0/MCMerchantLoader-1.0.0.jar";

  try {
    const target = new URL(downloadUrl);
    return NextResponse.redirect(target, 307);
  } catch {
    return NextResponse.json(
      {
        error: "invalid_loader_download_url",
        downloadUrl,
        hint: "Set MCMERCHANT_LOADER_DOWNLOAD_URL to a valid absolute URL."
      },
      { status: 500 }
    );
  }
}

