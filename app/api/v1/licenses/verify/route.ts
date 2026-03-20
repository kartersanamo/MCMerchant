import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { verifyLicense } from "@/lib/licensing/verify";
import type { VerifyRequest } from "@/lib/licensing/types";

type RateEntry = { count: number; resetAt: number };
const rateLimitMap = new Map<string, RateEntry>();
const RATE_LIMIT = 60;
const RATE_WINDOW_MS = 60 * 1000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

export async function POST(request: Request) {
  const ipHeader =
    request.headers.get("x-real-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    "";
  const clientIp = ipHeader || "0.0.0.0";

  if (!checkRateLimit(clientIp)) {
    return NextResponse.json(
      {
        valid: false,
        result: "rate_limited",
        reason: "Too many requests. Please slow down.",
      },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

  let body: VerifyRequest | null = null;
  try {
    body = await request.json().catch(() => null);
  } catch {
    // fall through
  }

  const { license_key, plugin_id } = body ?? {};
  if (!license_key || !plugin_id) {
    return NextResponse.json(
      {
        valid: false,
        result: "denied_invalid",
        reason: "license_key and plugin_id are required",
      },
      { status: 400 }
    );
  }

  const keyPattern = /^PDEX-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
  if (!keyPattern.test(license_key)) {
    return NextResponse.json(
      {
        valid: false,
        result: "denied_invalid",
        reason: "Malformed license key",
      },
      { status: 400 }
    );
  }

  try {
    const supabase = createSupabaseServerClient();
    const result = await verifyLicense(supabase, body as VerifyRequest, clientIp);
    const status = result.valid ? 200 : 403;
    return NextResponse.json(result, {
      status,
      headers: {
        "Cache-Control": "no-store",
        "X-MCMerchant-Version": "1",
      },
    });
  } catch {
    return NextResponse.json(
      {
        valid: false,
        result: "error",
        reason: "Internal server error. Try again later.",
      },
      { status: 500 }
    );
  }
}

