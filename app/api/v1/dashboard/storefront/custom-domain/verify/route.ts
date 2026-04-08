import { NextResponse } from "next/server";
import dns from "node:dns/promises";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireVerifiedUserForApi } from "@/lib/auth/email-verification";
import { isMissingColumnError } from "@/lib/storefront-profile";
import { enforceCsrfForRequest } from "@/lib/security/csrf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function normalizeDomain(raw: string): string {
  return raw.trim().toLowerCase().replace(/\.$/, "");
}

function getExpectedCnameTarget(): string | null {
  const explicit = process.env.MCMERCHANT_CUSTOM_DOMAIN_CNAME_TARGET?.trim();
  if (explicit) return normalizeDomain(explicit);
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl) return null;
    return normalizeDomain(new URL(appUrl).hostname);
  } catch {
    return null;
  }
}

async function hasExpectedTxt(domain: string, token: string): Promise<boolean> {
  const host = `_mcmmerchant-challenge.${domain}`;
  try {
    const txt = await dns.resolveTxt(host);
    const flattened = txt.map((parts) => parts.join("")).map((s) => s.trim());
    return flattened.includes(token);
  } catch {
    return false;
  }
}

async function hasExpectedCname(domain: string, expectedTarget: string): Promise<boolean> {
  try {
    const cnames = await dns.resolveCname(domain);
    const normalized = cnames.map((v) => normalizeDomain(v));
    return normalized.includes(expectedTarget);
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  const csrf = enforceCsrfForRequest(request);
  if (csrf) return csrf;
  const gate = await requireVerifiedUserForApi();
  if (gate instanceof NextResponse) return gate;
  const { userId } = gate;

  const supabase = createSupabaseServerClient();
  const { data: profile, error } = await supabase
    .from("profiles")
    .select(
      "id, username, store_slug, custom_domain, custom_domain_status, custom_domain_verification_token"
    )
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    if (isMissingColumnError(error)) {
      return NextResponse.json(
        {
          error:
            "Storefront custom-domain columns are missing. Run docs/STOREFRONT_PLATFORM.md SQL first.",
          upgradeRequired: true
        },
        { status: 422 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!profile) {
    return NextResponse.json({ error: "Profile not found." }, { status: 404 });
  }

  const domain = (profile.custom_domain ?? "").trim().toLowerCase();
  const token = (profile.custom_domain_verification_token ?? "").trim();
  if (!domain || !token) {
    return NextResponse.json(
      {
        error: "Set your custom domain first in Storefront settings.",
        code: "custom_domain_not_set"
      },
      { status: 400 }
    );
  }

  const expectedCname = getExpectedCnameTarget();
  if (!expectedCname) {
    return NextResponse.json(
      {
        error: "Missing app domain configuration for custom domain verification.",
        code: "missing_cname_target"
      },
      { status: 500 }
    );
  }

  const [txtOk, cnameOk] = await Promise.all([
    hasExpectedTxt(domain, token),
    hasExpectedCname(domain, expectedCname)
  ]);

  const now = new Date().toISOString();
  const handle = profile.store_slug?.trim() || profile.username;
  if (txtOk && cnameOk) {
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        custom_domain_status: "verified",
        custom_domain_verified_at: now,
        custom_domain_last_checked_at: now
      })
      .eq("id", userId);
    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
    return NextResponse.json({
      ok: true,
      status: "verified",
      domain,
      storefrontPath: `/store/${encodeURIComponent(handle)}`
    });
  }

  const { error: pendingError } = await supabase
    .from("profiles")
    .update({
      custom_domain_status: "pending",
      custom_domain_last_checked_at: now
    })
    .eq("id", userId);
  if (pendingError) {
    return NextResponse.json({ error: pendingError.message }, { status: 500 });
  }

  return NextResponse.json(
    {
      ok: false,
      status: "pending",
      domain,
      expected: {
        txtHost: `_mcmmerchant-challenge.${domain}`,
        txtValue: token,
        cnameHost: domain,
        cnameTarget: expectedCname
      },
      checks: {
        txt: txtOk,
        cname: cnameOk
      }
    },
    { status: 409 }
  );
}
