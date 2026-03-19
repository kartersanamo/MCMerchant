import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const { license_key, plugin_id, server_ip } = body ?? {};

    if (!license_key || !plugin_id) {
      return NextResponse.json(
        { valid: false, reason: "missing_parameters" },
        { status: 400 }
      );
    }

    const supabase = createSupabaseServerClient();

    const { data: license, error } = await supabase
      .from("license_keys")
      .select("id, key, plugin_id, buyer_id, server_ip, is_active")
      .eq("key", license_key)
      .eq("plugin_id", plugin_id)
      .maybeSingle();

    if (error || !license) {
      return NextResponse.json(
        { valid: false, reason: "license_not_found" },
        { status: 200 }
      );
    }

    if (!license.is_active) {
      return NextResponse.json(
        { valid: false, reason: "license_inactive" },
        { status: 200 }
      );
    }

    if (server_ip && license.server_ip && license.server_ip !== server_ip) {
      return NextResponse.json(
        { valid: false, reason: "ip_mismatch" },
        { status: 200 }
      );
    }

    await supabase
      .from("license_keys")
      .update({ last_verified_at: new Date().toISOString() })
      .eq("id", license.id);

    return NextResponse.json({ valid: true }, { status: 200 });
  } catch {
    return NextResponse.json(
      { valid: false, reason: "internal_error" },
      { status: 200 }
    );
  }
}

