import { NextResponse } from "next/server";

/** Free installs point here; delegate to the authenticated download handler (free plugins skip license). */
export async function GET(
  request: Request,
  { params }: { params: { pluginId: string } }
) {
  const u = new URL(request.url);
  const q = u.searchParams.toString();
  const path = `/api/downloads/me/${params.pluginId}${q ? `?${q}` : ""}`;
  return NextResponse.redirect(new URL(path, request.url), 302);
}
