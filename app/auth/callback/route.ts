import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { sanitizeAuthNextParam } from "@/lib/auth/email-verification";

export const dynamic = "force-dynamic";

function redirectOrigin(requestUrl: URL): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim() || process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (raw) {
    try {
      return new URL(raw.replace(/\/$/, "")).origin;
    } catch {
      // fall through
    }
  }
  return requestUrl.origin;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const origin = redirectOrigin(requestUrl);
  const code = requestUrl.searchParams.get("code");
  const nextRaw = requestUrl.searchParams.get("next");
  const nextPath = sanitizeAuthNextParam(nextRaw, "/email-verified");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.redirect(new URL("/check-email?error=config", origin));
  }

  if (!code) {
    return NextResponse.redirect(new URL("/check-email?error=missing_code", origin));
  }

  const cookieStore = cookies();

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options as any);
          });
        } catch {
          // ignore if called from an unsupported context
        }
      }
    }
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const fail = new URL("/check-email", origin);
    fail.searchParams.set("error", "callback_failed");
    fail.searchParams.set(
      "error_description",
      encodeURIComponent(error.message ?? "Could not complete sign-in")
    );
    return NextResponse.redirect(fail);
  }

  return NextResponse.redirect(new URL(nextPath, origin));
}
