import type { SupabaseClient, User } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route-handler";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/** Supabase may set `email_confirmed_at` and/or legacy `confirmed_at`. */
export function userEmailIsVerified(user: User | null | undefined): boolean {
  if (!user) return false;
  return !!(user.email_confirmed_at ?? user.confirmed_at);
}

/**
 * For API route handlers: require a logged-in user with a verified email.
 * Returns JSON 401/403 responses on failure.
 */
export async function requireVerifiedUserForApi(): Promise<
  { userId: string } | NextResponse
> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user?.id) {
    return NextResponse.json({ error: "unauthorized", code: "unauthorized" }, { status: 401 });
  }
  if (!userEmailIsVerified(data.user)) {
    return NextResponse.json(
      {
        error: "email_not_verified",
        code: "email_not_verified",
        message: "Verify your email to use this feature."
      },
      { status: 403 }
    );
  }
  return { userId: data.user.id };
}

/**
 * For dashboard routes that must respect Postgres RLS (`plugins`, `plugin_versions`, storage).
 * Uses the anon key + session cookies so `auth.uid()` matches the seller in policies.
 */
export async function requireVerifiedUserForRlsApi(): Promise<
  { supabase: SupabaseClient; userId: string } | NextResponse
> {
  const supabase = createSupabaseRouteHandlerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user?.id) {
    return NextResponse.json({ error: "unauthorized", code: "unauthorized" }, { status: 401 });
  }
  if (!userEmailIsVerified(data.user)) {
    return NextResponse.json(
      {
        error: "email_not_verified",
        code: "email_not_verified",
        message: "Verify your email to use this feature."
      },
      { status: 403 }
    );
  }
  return { supabase, userId: data.user.id };
}

/**
 * For server actions: require verified email or return a user-facing error string.
 */
export async function requireVerifiedUserIdForAction(): Promise<
  { userId: string } | { error: string }
> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user?.id) {
    return { error: "Unauthorized" };
  }
  if (!userEmailIsVerified(data.user)) {
    return { error: "Verify your email to use this feature." };
  }
  return { userId: data.user.id };
}

/** Internal redirect target after auth (open redirect safe). */
export function sanitizeAuthNextParam(raw: string | null, fallback = "/email-verified"): string {
  if (!raw || typeof raw !== "string") return fallback;
  const t = raw.trim();
  if (!t.startsWith("/") || t.startsWith("//")) return fallback;
  return t;
}
