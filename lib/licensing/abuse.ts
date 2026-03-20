import type { SupabaseClient } from "@supabase/supabase-js";
import type { LicenseKeyRow } from "./types";

const DEFAULT_MAX_UNIQUE_IPS_PER_DAY = 5;
const DEFAULT_MAX_VERIFICATIONS_PER_HOUR = 30;
const DEFAULT_MAX_TOTAL_VERIFICATIONS_REVIEW = 5000;

function getThreshold(name: string, fallback: number): number {
  const raw = process.env[name];
  const parsed = raw ? Number(raw) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

const ABUSE_THRESHOLDS = {
  MAX_UNIQUE_IPS_PER_DAY: getThreshold(
    "ABUSE_MAX_UNIQUE_IPS_PER_DAY",
    DEFAULT_MAX_UNIQUE_IPS_PER_DAY
  ),
  MAX_VERIFICATIONS_PER_HOUR: getThreshold(
    "ABUSE_MAX_VERIFICATIONS_PER_HOUR",
    DEFAULT_MAX_VERIFICATIONS_PER_HOUR
  ),
  MAX_TOTAL_VERIFICATIONS_REVIEW: DEFAULT_MAX_TOTAL_VERIFICATIONS_REVIEW,
};

export async function checkForAbuse(
  license: LicenseKeyRow,
  currentIp: string,
  supabase: SupabaseClient
): Promise<void> {
  const oneDayAgo = new Date(Date.now() - 86400000).toISOString();
  const oneHourAgo = new Date(Date.now() - 3600000).toISOString();

  // Too many unique IPs in the last 24 hours.
  const { data: recentVerifications } = await supabase
    .from("license_verifications")
    .select("server_ip")
    .eq("license_id", license.id)
    .eq("result", "granted")
    .gte("verified_at", oneDayAgo);

  if (recentVerifications) {
    const uniqueIps = new Set(
      recentVerifications.map((v: any) => v.server_ip).filter(Boolean)
    );
    if (uniqueIps.size > ABUSE_THRESHOLDS.MAX_UNIQUE_IPS_PER_DAY) {
      await flagLicense(
        license.id,
        `Verified from ${uniqueIps.size} unique IPs in 24 hours (threshold: ${ABUSE_THRESHOLDS.MAX_UNIQUE_IPS_PER_DAY}). Possible key sharing.`,
        supabase
      );
      return;
    }
  }

  // Too many verifications in the last hour.
  const { count: hourlyCount } = await supabase
    .from("license_verifications")
    .select("*", { count: "exact", head: true })
    .eq("license_id", license.id)
    .gte("verified_at", oneHourAgo);

  if (hourlyCount && hourlyCount > ABUSE_THRESHOLDS.MAX_VERIFICATIONS_PER_HOUR) {
    await flagLicense(
      license.id,
      `${hourlyCount} verifications in the past hour (threshold: ${ABUSE_THRESHOLDS.MAX_VERIFICATIONS_PER_HOUR}). Possible bot/automation abuse.`,
      supabase
    );
    return;
  }

  // Extremely high lifetime verifications: soft flag for review.
  if (license.total_verifications > ABUSE_THRESHOLDS.MAX_TOTAL_VERIFICATIONS_REVIEW) {
    await supabase
      .from("license_keys")
      .update({
        flagged_for_abuse: true,
        flag_reason: `High lifetime verifications (${license.total_verifications}). Flagged for manual review — not automatically suspended.`,
        flagged_at: new Date().toISOString(),
      })
      .eq("id", license.id)
      .eq("flagged_for_abuse", false);
  }
}

async function flagLicense(
  licenseId: string,
  reason: string,
  supabase: SupabaseClient
): Promise<void> {
  await supabase
    .from("license_keys")
    .update({
      status: "suspended",
      flagged_for_abuse: true,
      flag_reason: reason,
      flagged_at: new Date().toISOString(),
    })
    .eq("id", licenseId);

  // Post‑MVP we’d notify seller/admins here.
  console.warn(`[AbuseDetection] License ${licenseId} suspended: ${reason}`);
}

