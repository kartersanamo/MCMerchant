import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getRequestPublicOrigin } from "@/lib/app-url";

export async function GET(
  request: Request,
  { params }: { params: { pluginId: string } }
) {
  const supabase = createSupabaseServerClient();
  const reqUrl = new URL(request.url);
  const publicOrigin = getRequestPublicOrigin(request);
  const buildUrl = (path: string) => new URL(path, publicOrigin);
  const pluginId = params.pluginId;
  const versionId = reqUrl.searchParams.get("versionId");

  const { data: authData } = await supabase.auth.getUser();
  const userId = authData.user?.id;
  if (!userId) {
    const { data: plugin } = await supabase
      .from("plugins")
      .select("slug")
      .eq("id", pluginId)
      .maybeSingle();
    const slug = plugin?.slug ?? "plugin";
    return NextResponse.redirect(
      buildUrl(
        `/login?redirect=${encodeURIComponent(`/plugin/${slug}/install${versionId ? `?versionId=${versionId}` : ""}`)}`
      ),
      302
    );
  }

  const { data: plugin } = await supabase
    .from("plugins")
    .select("slug, price_cents")
    .eq("id", pluginId)
    .maybeSingle();

  const isFree = (plugin?.price_cents ?? 0) <= 0;

  const { data: license } = await supabase
    .from("license_keys")
    .select("id, key")
    .eq("buyer_id", userId)
    .eq("plugin_id", pluginId)
    .eq("is_active", true)
    .maybeSingle();

  if (!license && !isFree) {
    const slug = plugin?.slug ?? "plugin";
    return NextResponse.redirect(
      buildUrl(`/plugin/${slug}?error=no_license`),
      302
    );
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
    const slug = plugin?.slug ?? "plugin";
    return NextResponse.redirect(
      buildUrl(`/plugin/${slug}?error=no_version`),
      302
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
