import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { timingSafeEqual } from "node:crypto";

const keyPattern = /^PDEX-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;

function maskLicense(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.length < 9) return "****";
  return `${trimmed.slice(0, 9)}...${trimmed.slice(-4)}`;
}

export async function POST(request: Request) {
  const expectedKey = process.env.MERCHANTBOT_LICENSE_LOOKUP_KEY?.trim() ?? "";
  if (!expectedKey) {
    return NextResponse.json({ error: "server_misconfigured" }, { status: 503 });
  }
  const got = request.headers.get("x-mcmerchant-bot-key")?.trim() ?? "";
  if (!got) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const expectedBuf = Buffer.from(expectedKey);
  const gotBuf = Buffer.from(got);
  if (expectedBuf.length !== gotBuf.length || !timingSafeEqual(expectedBuf, gotBuf)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: unknown = null;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const licenseKey = String((body as Record<string, unknown>)?.license_key ?? "").trim();
  if (!licenseKey) {
    return NextResponse.json({ error: "license_key is required", found: false }, { status: 400 });
  }
  if (!keyPattern.test(licenseKey)) {
    return NextResponse.json({ found: false, reason: "Malformed license key" }, { status: 200 });
  }

  const supabase = createSupabaseServerClient();
  const { data: license, error } = await supabase
    .from("license_keys")
    .select("id, key, plugin_id, status, is_active, expires_at, issued_at, buyer_id")
    .eq("key", licenseKey)
    .maybeSingle();

  if (error || !license) {
    return NextResponse.json({ found: false }, { status: 200 });
  }

  const [{ data: plugin }, { data: buyer }] = await Promise.all([
    supabase
      .from("plugins")
      .select("id, name, slug")
      .eq("id", license.plugin_id)
      .maybeSingle(),
    supabase
      .from("profiles")
      .select("id, username")
      .eq("id", license.buyer_id)
      .maybeSingle(),
  ]);

  return NextResponse.json(
    {
      found: true,
      status: license.status ?? (license.is_active ? "active" : "inactive"),
      is_active: !!license.is_active,
      expires_at: license.expires_at ?? null,
      issued_at: license.issued_at ?? null,
      plugin_id: license.plugin_id,
      plugin_name: plugin?.name ?? "Unknown",
      plugin_slug: plugin?.slug ?? "",
      buyer_id: license.buyer_id ?? null,
      buyer_username: buyer?.username ?? "Unknown",
      license_key_preview: maskLicense(license.key),
    },
    { status: 200, headers: { "Cache-Control": "no-store" } }
  );
}

