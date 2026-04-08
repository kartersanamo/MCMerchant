import { NextResponse } from "next/server";
import { requireVerifiedUserForRlsApi } from "@/lib/auth/email-verification";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { sendVersionReleaseNotifications } from "@/lib/notifications/version-release";
import { enforceCsrfForRequest } from "@/lib/security/csrf";
import { validateJarFile } from "@/lib/security/uploads";

function parseMinecraftVersions(input: string) {
  return input
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

function normalizeSemver(input: string): string | null {
  const trimmed = input.trim().replace(/^v/i, "");
  const parts = trimmed.split(".");
  if (parts.length === 1 && /^\d+$/.test(parts[0]))
    return `${parts[0]}.0.0`;
  if (parts.length === 2 && /^\d+$/.test(parts[0]) && /^\d+$/.test(parts[1]))
    return `${parts[0]}.${parts[1]}.0`;
  if (parts.length === 3 && /^\d+$/.test(parts[0]) && /^\d+$/.test(parts[1]) && /^\d+$/.test(parts[2]))
    return trimmed;
  return null;
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const csrf = enforceCsrfForRequest(request);
  if (csrf) return csrf;
  try {
    const gate = await requireVerifiedUserForRlsApi();
    if (gate instanceof NextResponse) return gate;
    const { supabase, userId: sellerId } = gate;

    const formData = await request.formData();
    const version = String(formData.get("version") ?? "");
    const changelog = String(formData.get("changelog") ?? "");
    const minecraftVersionsRaw =
      typeof formData.get("minecraft_versions") === "string"
        ? formData.get("minecraft_versions") as string
        : (formData.getAll("minecraft_versions") as string[]).filter(Boolean).join(",");
    const serverPlatform = String(formData.get("server_platform") ?? "").trim() || null;
    const jarFile = formData.get("jar_file") as File | null;

    const normalizedVersion = version ? normalizeSemver(version) : null;
    if (!normalizedVersion) {
      return NextResponse.json(
        { error: "Version must be semver (e.g. 1.0.0 or 1.0)", code: "invalid_semver" },
        { status: 400 }
      );
    }
    if (!jarFile || jarFile.size === 0) {
      return NextResponse.json(
        { error: "Please select a .jar file", code: "missing_jar" },
        { status: 400 }
      );
    }
    {
      const validationError = validateJarFile(jarFile);
      if (validationError) {
        return NextResponse.json(
          { error: validationError, code: "invalid_jar" },
          { status: 400 }
        );
      }
    }

    const minecraft_versions = parseMinecraftVersions(minecraftVersionsRaw);
    if (!minecraft_versions.length) {
      return NextResponse.json(
        { error: "Enter at least one Minecraft version (e.g. 1.20, 1.21)", code: "missing_minecraft_versions" },
        { status: 400 }
      );
    }

    // Ensure plugin belongs to seller
    const { data: plugin } = await supabase
      .from("plugins")
      .select("id, seller_id, slug, name")
      .eq("id", params.id)
      .maybeSingle();

    if (!plugin || plugin.seller_id !== sellerId) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    // Mark previous versions as not latest
    await supabase
      .from("plugin_versions")
      .update({ is_latest: false })
      .eq("plugin_id", params.id);

    // Upload jar to private bucket — keep original filename (sanitize for path safety only)
    const originalName = jarFile.name.replace(/^.*[/\\]/, "").trim() || "plugin.jar";
    const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `jars/${params.id}/${safeName}`;
    const uploadRes = await supabase.storage
      .from("plugin-files")
      .upload(path, jarFile, { contentType: jarFile.type || "application/java-archive" });

    if (uploadRes.error) {
      const msg =
        uploadRes.error.message?.toLowerCase().includes("bucket")
          ? "Storage bucket 'plugin-files' not found. In Supabase Dashboard go to Storage → New bucket → name it 'plugin-files', set it to Private."
          : `Upload failed: ${uploadRes.error.message}`;
      return NextResponse.json(
        { error: msg, code: "upload_failed" },
        { status: 400 }
      );
    }

    const insertPayload: Record<string, unknown> = {
      plugin_id: params.id,
      version: normalizedVersion,
      changelog,
      file_url: path,
      minecraft_versions,
      is_latest: true
    };
    if (serverPlatform) insertPayload.server_platform = serverPlatform;

    // Some local/dev schemas may not yet have `server_platform` added.
    // If Supabase complains about the missing column, retry without it.
    let inserted: any = null;
    let insertErr: any = null;
    try {
      const res = await supabase
        .from("plugin_versions")
        .insert(insertPayload)
        .select("id")
        .single();
      inserted = res.data;
      insertErr = res.error;
    } catch (err: any) {
      insertErr = err;
      const msg = String(err?.message ?? "").toLowerCase();
      if (serverPlatform && msg.includes("server_platform")) {
        // Retry without `server_platform` to keep uploads working.
        delete insertPayload.server_platform;
        const retry = await supabase
          .from("plugin_versions")
          .insert(insertPayload)
          .select("id")
          .single();
        inserted = retry.data;
        insertErr = retry.error;
      }
    }

    if (insertErr || !inserted) {
      return NextResponse.json(
        { error: insertErr?.message ?? "Failed to save version", code: "insert_failed" },
        { status: 400 }
      );
    }

    // Important event: notify existing buyers/license holders of a new release.
    try {
      const admin = createSupabaseServerClient();
      await sendVersionReleaseNotifications({
        supabase: admin as any,
        pluginId: params.id,
        pluginSlug: String(plugin.slug ?? ""),
        pluginName: String(plugin.name ?? "Plugin"),
        version: normalizedVersion,
        changelog: changelog || null,
        sellerId
      });
    } catch (err) {
      console.error("[versions POST] version-release notifications failed", {
        pluginId: params.id,
        version: normalizedVersion,
        error: err instanceof Error ? err.message : String(err)
      });
    }

    return NextResponse.json({ id: inserted.id }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "internal_error" }, { status: 500 });
  }
}

