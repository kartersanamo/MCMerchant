import { randomBytes } from "crypto";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { LicenseKeyRow } from "./types";

// Character set: uppercase letters + digits, removing visually confusable
// characters (0/O, 1/I/L) to prevent copy errors.
const CHARSET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const SEGMENT_LENGTH = 4;
const SEGMENT_COUNT = 4; // PDEX-XXXX-XXXX-XXXX-XXXX

function generateSegment(): string {
  const buf = randomBytes(SEGMENT_LENGTH);
  const chars: string[] = [];
  for (let i = 0; i < buf.length; i++) {
    const idx = buf[i] % CHARSET.length;
    chars.push(CHARSET[idx]);
  }
  return chars.join("");
}

function buildKey(): string {
  const segments = Array.from({ length: SEGMENT_COUNT }, generateSegment);
  return `PDEX-${segments.join("-")}`;
}

/**
 * Generate a license key that is unique in the database.
 */
export async function generateUniqueLicenseKey(): Promise<string> {
  const supabase = createSupabaseServerClient();

  for (let attempt = 0; attempt < 10; attempt++) {
    const key = buildKey();

    const { data } = await supabase
      .from("license_keys")
      .select("id")
      .eq("key", key)
      .maybeSingle();

    if (!data) return key;
  }

  throw new Error("Failed to generate unique license key after 10 attempts");
}

export async function issueLicense(args: {
  pluginId: string;
  purchaseId: string;
  buyerId: string;
}): Promise<LicenseKeyRow> {
  const supabase = createSupabaseServerClient();
  const key = await generateUniqueLicenseKey();

  const { data, error } = await supabase
    .from("license_keys")
    .insert({
      key,
      plugin_id: args.pluginId,
      purchase_id: args.purchaseId,
      buyer_id: args.buyerId,
      status: "active",
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to issue license");
  }

  return data as LicenseKeyRow;
}

