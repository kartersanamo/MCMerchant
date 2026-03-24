import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route-handler";

export const dynamic = "force-dynamic";

export async function POST() {
  const cookieStore = cookies();
  const supabase = createSupabaseRouteHandlerClient();

  // Best effort remote sign out first.
  await supabase.auth.signOut({ scope: "global" });

  // Ensure all Supabase auth cookies are cleared for this origin.
  const authCookieNames = cookieStore
    .getAll()
    .map((cookie) => cookie.name)
    .filter((name) => name.startsWith("sb-"));

  for (const name of authCookieNames) {
    cookieStore.set(name, "", {
      path: "/",
      maxAge: 0,
    });
  }

  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
