import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { verifyLicense } from "@/lib/licensing/verify";
import type { VerifyRequest } from "@/lib/licensing/types";

export async function GET(
  request: Request,
  { params }: { params: { licenseKey: string; pluginId: string } }
) {
  const supabase = createSupabaseServerClient();
  const { licenseKey, pluginId } = params;
  const versionId = new URL(request.url).searchParams.get("versionId");

  // Shortcut for free plugins.
  if (licenseKey === "free") {
    const { data: plugin } = await supabase
      .from("plugins")
      .select("id, price_cents")
      .eq("id", pluginId)
      .maybeSingle();

    if (!plugin || (plugin.price_cents ?? 0) > 0) {
      return NextResponse.json({ error: "not_free" }, { status: 403 });
    }
  }

  if (licenseKey !== "free") {
    const ipHeader =
      request.headers.get("x-real-ip") ||
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      "";
    const clientIp = ipHeader || "0.0.0.0";

    const verifyReq: VerifyRequest = {
      license_key: licenseKey,
      plugin_id: pluginId,
      server_ip: clientIp,
    };

    const verifyRes = await verifyLicense(supabase, verifyReq, clientIp);
    if (!verifyRes.valid) {
      return NextResponse.json(
        { error: "invalid_license", reason: verifyRes.reason, result: verifyRes.result },
        { status: 403 }
      );
    }
  }

  let fileUrl: string | null = null;
  let servedVersionId: string | null = null;
  if (versionId) {
    const { data: version } = await supabase
      .from("plugin_versions")
      .select("id, file_url")
      .eq("id", versionId)
      .eq("plugin_id", pluginId)
      .maybeSingle();
    fileUrl = version?.file_url ?? null;
    servedVersionId = version?.id ?? null;
  }
  if (!fileUrl) {
    const { data: latest } = await supabase
      .from("plugin_versions")
      .select("id, file_url")
      .eq("plugin_id", pluginId)
      .eq("is_latest", true)
      .maybeSingle();
    fileUrl = latest?.file_url ?? null;
    servedVersionId = latest?.id ?? null;
  }

  if (!fileUrl) {
    return NextResponse.json(
      { error: versionId ? "version_not_found" : "no_latest_version" },
      { status: 404 }
    );
  }

  if (servedVersionId) {
    const { data: vRow } = await supabase
      .from("plugin_versions")
      .select("download_count")
      .eq("id", servedVersionId)
      .single();
    await supabase
      .from("plugin_versions")
      .update({ download_count: ((vRow?.download_count as number) ?? 0) + 1 })
      .eq("id", servedVersionId);
    const { data: pRow } = await supabase
      .from("plugins")
      .select("total_downloads")
      .eq("id", pluginId)
      .single();
    await supabase
      .from("plugins")
      .update({ total_downloads: ((pRow?.total_downloads as number) ?? 0) + 1 })
      .eq("id", pluginId);
  }

  const signed = await supabase.storage
    .from("plugin-files")
    .createSignedUrl(fileUrl, 60 * 60);

  const signedUrl = signed?.data?.signedUrl;
  if (!signedUrl) {
    return NextResponse.json({ error: "signed_url_failed" }, { status: 500 });
  }

  // Fetch the file and stream it back with Content-Disposition: attachment so the browser downloads it
  const fileRes = await fetch(signedUrl);
  if (!fileRes.ok) {
    return NextResponse.json({ error: "download_failed" }, { status: 502 });
  }
  const contentType = fileRes.headers.get("content-type") ?? "application/java-archive";
  const filename = fileUrl.split("/").pop()?.replace(/[^a-zA-Z0-9._-]/g, "_") ?? "plugin.jar";
  return new NextResponse(fileRes.body, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

