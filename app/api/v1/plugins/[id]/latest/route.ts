import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSemverGreater } from "@/lib/semver";

const MAX_REQUESTS_PER_HOUR = 100;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const rateBuckets = new Map<string, { count: number; resetAt: number }>();

function getClientIp(request: Request) {
  const xf = request.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0]?.trim() ?? "unknown";
  return request.headers.get("x-real-ip") ?? "unknown";
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Simple in-memory rate limiter (MVP).
    const ip = getClientIp(request);
    const now = Date.now();
    const existing = rateBuckets.get(ip);
    if (!existing || now >= existing.resetAt) {
      rateBuckets.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    } else {
      existing.count += 1;
      if (existing.count > MAX_REQUESTS_PER_HOUR) {
        return NextResponse.json(
          { error: "rate_limited" },
          { status: 429 }
        );
      }
    }

    const licenseKey = request.headers.get("X-License-Key");
    // Current installed version for logging; MVP doesn't store it yet.
    const pluginVersion = request.headers.get("X-Plugin-Version");
    void pluginVersion;

    const supabase = createSupabaseServerClient();

    // 1) Look up plugin
    const { data: plugin, error: pluginErr } = await supabase
      .from("plugins")
      .select("id, price_cents")
      .eq("id", params.id)
      .single();

    if (pluginErr || !plugin) {
      return NextResponse.json({ error: "plugin_not_found" }, { status: 404 });
    }

    // 2) For paid plugins, verify license key exists + active + belongs to plugin
    if ((plugin.price_cents ?? 0) > 0) {
      if (!licenseKey) {
        return NextResponse.json({ error: "missing_license_key" }, { status: 403 });
      }

      const { data: license, error: licenseErr } = await supabase
        .from("license_keys")
        .select("id, key, is_active, plugin_id")
        .eq("key", licenseKey)
        .eq("plugin_id", params.id)
        .eq("is_active", true)
        .maybeSingle();

      if (licenseErr || !license) {
        return NextResponse.json({ error: "invalid_license" }, { status: 403 });
      }
    }

    // 3) Fetch candidate versions and pick max semver (MVP correctness).
    const { data: versions, error: versionsErr } = await supabase
      .from("plugin_versions")
      .select("id, version, changelog, file_url, minecraft_versions, created_at")
      .eq("plugin_id", params.id);

    if (versionsErr || !versions?.length) {
      return NextResponse.json({ error: "no_latest_version" }, { status: 404 });
    }

    const latest = versions.reduce((max: any, v: any) => {
      if (!max) return v;
      if (!v?.version || !max?.version) return max;
      return isSemverGreater(v.version, max.version) ? v : max;
    }, null);

    if (!latest?.file_url) {
      return NextResponse.json({ error: "no_latest_version" }, { status: 404 });
    }

    // 4) Generate signed URL from private bucket
    const signed = await supabase.storage
      .from("plugin-files")
      .createSignedUrl(latest.file_url, 60 * 60);

    if (!signed?.data?.signedUrl) {
      return NextResponse.json(
        { error: "signed_url_failed" },
        { status: 500 }
      );
    }

    // 5) Return payload
    return NextResponse.json({
      version: latest.version,
      download_url: signed.data.signedUrl,
      changelog: latest.changelog,
      minecraft_versions: latest.minecraft_versions ?? [],
      released_at: latest.created_at
        ? new Date(latest.created_at).toISOString()
        : null
    });
  } catch (e) {
    return NextResponse.json(
      { error: "internal_error" },
      { status: 500 }
    );
  }
}

