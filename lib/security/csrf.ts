import { NextResponse } from "next/server";
import { getCanonicalAppOriginForServer } from "@/lib/app-url";

type CsrfOptions = {
  /** Also enforce on GET/HEAD for sensitive routes. */
  protectSafeMethods?: boolean;
};

function parseOrigin(value: string | null): URL | null {
  if (!value) return null;
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

function getRequestOrigin(request: Request): URL {
  const reqUrl = new URL(request.url);
  const host = request.headers.get("x-forwarded-host")?.trim() || reqUrl.host;
  const proto = request.headers.get("x-forwarded-proto")?.trim() || reqUrl.protocol.replace(":", "");
  return new URL(`${proto}://${host}`);
}

/**
 * Basic CSRF defense for cookie-authenticated endpoints.
 * - Blocks explicit cross-site fetch contexts.
 * - Requires Origin or Referer to match app/request origin.
 */
export function enforceCsrfForRequest(
  request: Request,
  options: CsrfOptions = {}
): NextResponse | null {
  const method = request.method.toUpperCase();
  const safe = method === "GET" || method === "HEAD" || method === "OPTIONS";
  if (safe && !options.protectSafeMethods) return null;

  const fetchSite = (request.headers.get("sec-fetch-site") || "").toLowerCase();
  if (fetchSite === "cross-site") {
    return NextResponse.json({ error: "csrf_blocked" }, { status: 403 });
  }

  const expected = parseOrigin(getCanonicalAppOriginForServer()) || getRequestOrigin(request);
  const origin = parseOrigin(request.headers.get("origin"));
  const referer = parseOrigin(request.headers.get("referer"));
  const candidate = origin || referer;
  if (!candidate) {
    return NextResponse.json({ error: "csrf_origin_missing" }, { status: 403 });
  }

  if (candidate.origin !== expected.origin) {
    return NextResponse.json({ error: "csrf_origin_mismatch" }, { status: 403 });
  }
  return null;
}
