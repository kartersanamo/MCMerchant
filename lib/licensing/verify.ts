import type { SupabaseClient } from "@supabase/supabase-js";
import { checkForAbuse } from "./abuse";
import type {
  LicenseKeyRow,
  VerifyRequest,
  VerifyResponse,
  VerificationResult,
} from "./types";

export async function verifyLicense(
  supabase: SupabaseClient,
  req: VerifyRequest,
  requestIp: string
): Promise<VerifyResponse> {
  const serverIp = req.server_ip || requestIp;

  // 1) Look up the license.
  const { data: license, error } = await supabase
    .from("license_keys")
    .select("*")
    .eq("key", req.license_key)
    .eq("plugin_id", req.plugin_id)
    .maybeSingle();

  if (error || !license) {
    // We cannot insert into license_verifications because license_id is required.
    return deny("denied_invalid", "Invalid license key");
  }

  const lic = license as LicenseKeyRow;

  // 2) Status checks.
  if (lic.status === "revoked") {
    await logVerification(supabase, {
      licenseId: lic.id,
      pluginId: req.plugin_id,
      serverIp,
      req,
      result: "denied_revoked",
      reason: "License has been revoked",
    });
    return deny("denied_revoked", "This license has been revoked");
  }

  if (lic.status === "suspended") {
    await logVerification(supabase, {
      licenseId: lic.id,
      pluginId: req.plugin_id,
      serverIp,
      req,
      result: "denied_suspended",
      reason: "License is suspended pending review",
    });
    return deny("denied_suspended", "This license is suspended. Contact support.");
  }

  if (lic.status === "expired" || (lic.expires_at && new Date(lic.expires_at) < new Date())) {
    if (lic.status !== "expired") {
      await supabase.from("license_keys").update({ status: "expired" }).eq("id", lic.id);
    }
    await logVerification(supabase, {
      licenseId: lic.id,
      pluginId: req.plugin_id,
      serverIp,
      req,
      result: "denied_expired",
      reason: "License has expired",
    });
    return deny("denied_expired", "This license has expired");
  }

  // 3) Abuse flag.
  if (lic.flagged_for_abuse) {
    await logVerification(supabase, {
      licenseId: lic.id,
      pluginId: req.plugin_id,
      serverIp,
      req,
      result: "denied_abuse_flag",
      reason: lic.flag_reason || "Flagged for suspicious activity",
    });
    return deny("denied_abuse_flag", "This license has been flagged. Contact support.");
  }

  // 4) IP binding.
  if (lic.ip_binding_enabled && lic.allowed_ips.length > 0) {
    const normalizedServerIp = normalizeIp(serverIp);
    const allowed = lic.allowed_ips.map(normalizeIp);
    if (!allowed.includes(normalizedServerIp)) {
      await logVerification(supabase, {
        licenseId: lic.id,
        pluginId: req.plugin_id,
        serverIp,
        req,
        result: "denied_ip_mismatch",
        reason: `IP ${serverIp} not in allowed list`,
      });
      return deny(
        "denied_ip_mismatch",
        `Server IP ${serverIp} is not authorized for this license`
      );
  }
  }

  // 5) Abuse detection (fire‑and‑forget).
  checkForAbuse(lic, serverIp, supabase).catch(() => {});

  // 6) Update stats.
  await supabase
    .from("license_keys")
    .update({
      total_verifications: lic.total_verifications + 1,
      last_verified_at: new Date().toISOString(),
      last_verified_ip: serverIp,
    })
    .eq("id", lic.id);

  // 7) Log successful verification.
  await logVerification(supabase, {
    licenseId: lic.id,
    pluginId: req.plugin_id,
    serverIp,
    req,
    result: "granted",
  });

  // 8) Optional: check for update.
  let updateAvailable = false;
  let latestVersion: string | undefined;
  if (req.plugin_version) {
    const { data: latest } = await supabase
      .from("plugin_versions")
      .select("version")
      .eq("plugin_id", req.plugin_id)
      .eq("is_latest", true)
      .maybeSingle();

    if (latest?.version) {
      latestVersion = latest.version;
      updateAvailable = isNewerVersion(latest.version, req.plugin_version);
    }
  }

  return {
    valid: true,
    result: "granted",
    plugin_version: latestVersion,
    update_available: updateAvailable,
  };
}

function deny(result: VerificationResult, reason: string): VerifyResponse {
  return { valid: false, result, reason };
}

function normalizeIp(ip: string): string {
  return ip.split(":")[0].trim();
}

export function isNewerVersion(latest: string, current: string): boolean {
  const parse = (v: string) => v.replace(/^v/, "").split(".").map(Number);
  const l = parse(latest);
  const c = parse(current);
  for (let i = 0; i < Math.max(l.length, c.length); i++) {
    const diff = (l[i] ?? 0) - (c[i] ?? 0);
    if (diff !== 0) return diff > 0;
  }
  return false;
}

async function logVerification(
  supabase: SupabaseClient,
  args: {
    licenseId: string;
    pluginId: string;
    serverIp: string;
    req: VerifyRequest;
    result: VerificationResult;
    reason?: string;
  }
): Promise<void> {
  await supabase.from("license_verifications").insert({
    license_id: args.licenseId,
    plugin_id: args.pluginId,
    server_ip: args.serverIp,
    minecraft_version: args.req.minecraft_version,
    plugin_version: args.req.plugin_version,
    server_software: args.req.server_software,
    result: args.result,
    denial_reason: args.reason,
  });
}

