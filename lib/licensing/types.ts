export type LicenseStatus =
  | "active"
  | "suspended"
  | "revoked"
  | "expired"
  | "transferred";

export type VerificationResult =
  | "granted"
  | "denied_invalid"
  | "denied_revoked"
  | "denied_ip_mismatch"
  | "denied_expired"
  | "denied_suspended"
  | "denied_abuse_flag";

/**
 * Shape of a row in public.license_keys that we care about in TypeScript.
 * Keep in sync (loosely) with the Supabase schema; we don't need every column.
 */
export interface LicenseKeyRow {
  id: string;
  key: string;
  plugin_id: string;
  purchase_id: string;
  buyer_id: string;
  status: LicenseStatus;
  ip_binding_enabled: boolean;
  allowed_ips: string[];
  transfer_count: number;
  max_transfers: number;
  last_transferred_at: string | null;
  total_verifications: number;
  last_verified_at: string | null;
  last_verified_ip: string | null;
  flagged_for_abuse: boolean;
  flag_reason: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface VerifyRequest {
  license_key: string;
  plugin_id: string;
  server_ip?: string;
  minecraft_version?: string;
  plugin_version?: string;
  server_software?: string;
}

export interface VerifyResponse {
  valid: boolean;
  result: VerificationResult | "error" | "rate_limited";
  reason?: string;
  // Only returned on granted — gives the server useful metadata
  plugin_version?: string;
  update_available?: boolean;
}

