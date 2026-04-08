import { NextResponse } from "next/server";
import { getRequestPublicOrigin } from "@/lib/app-url";

/** Free installs point here; delegate to the authenticated download handler (free plugins skip license). */
export async function GET(
  request: Request,
  { params }: { params: { pluginId: string } }
) {
  const u = new URL(request.url);
  const q = u.searchParams.toString();
  const path = `/api/downloads/me/${params.pluginId}${q ? `?${q}` : ""}`;
  const base = getRequestPublicOrigin(request);
  return NextResponse.redirect(new URL(path, base), 302);
}
