import { NextResponse } from "next/server";
import { createSupabaseServerClient, getAuthedUserId } from "@/lib/supabase/server";

function parseMinecraftVersions(input: string) {
  // Accept either comma-separated or already-comma-joined strings.
  return input
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

function normalizeSemver(input: string): string | null {
  const trimmed = input.trim().replace(/^v/i, "");
  if (!trimmed) return null;
  const parts = trimmed.split(".");
  if (parts.length === 1 && /^\d+$/.test(parts[0])) return `${parts[0]}.0.0`;
  if (parts.length === 2 && /^\d+$/.test(parts[0]) && /^\d+$/.test(parts[1])) return `${parts[0]}.${parts[1]}.0`;
  if (parts.length === 3 && /^\d+$/.test(parts[0]) && /^\d+$/.test(parts[1]) && /^\d+$/.test(parts[2])) return trimmed;
  return null;
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string; versionId: string } }
) {
  try {
    const sellerId = await getAuthedUserId();
    if (!sellerId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const supabase = createSupabaseServerClient();

    const { data: plugin } = await supabase
      .from("plugins")
      .select("id, seller_id")
      .eq("id", params.id)
      .maybeSingle();

    if (!plugin || plugin.seller_id !== sellerId) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    const { data: existingVersion } = await supabase
      .from("plugin_versions")
      .select("id, plugin_id, version, changelog, minecraft_versions, is_latest")
      .eq("id", params.versionId)
      .maybeSingle();

    if (!existingVersion || existingVersion.plugin_id !== params.id) {
      return NextResponse.json({ error: "version_not_found" }, { status: 404 });
    }

    const formData = await request.formData();

    const isLatestRaw = formData.get("is_latest");
    const setLatest = isLatestRaw !== null && String(isLatestRaw) === "true";

    const versionRaw = formData.get("version");
    const changelogRaw = formData.get("changelog");
    const minecraftVersionsRaw = formData.get("minecraft_versions");
    const serverPlatformRaw = formData.get("server_platform");

    const updatePayload: Record<string, unknown> = {};

    if (versionRaw !== null) {
      const normalized = normalizeSemver(String(versionRaw));
      if (!normalized) {
        return NextResponse.json({ error: "invalid_semver" }, { status: 400 });
      }
      updatePayload.version = normalized;
    }

    if (changelogRaw !== null) {
      updatePayload.changelog = String(changelogRaw);
    }

    if (minecraftVersionsRaw !== null) {
      const minecraftVersions = parseMinecraftVersions(String(minecraftVersionsRaw));
      if (!minecraftVersions.length) {
        return NextResponse.json({ error: "missing_minecraft_versions" }, { status: 400 });
      }
      updatePayload.minecraft_versions = minecraftVersions;
    }

    if (serverPlatformRaw !== null) {
      const sp = String(serverPlatformRaw).trim();
      updatePayload.server_platform = sp ? sp : null;
    }

    if (setLatest) {
      // Ensure only one latest version per plugin.
      await supabase.from("plugin_versions").update({ is_latest: false }).eq("plugin_id", params.id);
      updatePayload.is_latest = true;
    }

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json({ error: "nothing_to_update" }, { status: 400 });
    }

    // Handle local/dev schemas where `server_platform` might not exist yet.
    let updated: any = null;
    try {
      const res = await supabase
        .from("plugin_versions")
        .update(updatePayload)
        .eq("id", params.versionId)
        .select("id")
        .maybeSingle();
      updated = res.data;
      if (res.error) throw res.error;
    } catch (err: any) {
      const msg = String(err?.message ?? "").toLowerCase();
      if (serverPlatformRaw !== null && msg.includes("server_platform")) {
        delete updatePayload.server_platform;
        // If the only thing we tried to update was `server_platform` (missing column),
        // treat it as a no-op so version updates can still succeed in local schemas.
        if (Object.keys(updatePayload).length === 0) {
          return NextResponse.json({ id: params.versionId }, { status: 200 });
        }
        const res2 = await supabase
          .from("plugin_versions")
          .update(updatePayload)
          .eq("id", params.versionId)
          .select("id")
          .maybeSingle();
        updated = res2.data;
        if (res2.error) throw res2.error;
      } else {
        throw err;
      }
    }

    if (!updated) {
      return NextResponse.json({ error: "update_failed" }, { status: 400 });
    }

    return NextResponse.json({ id: updated.id ?? params.versionId }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "internal_error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string; versionId: string } }
) {
  try {
    const sellerId = await getAuthedUserId();
    if (!sellerId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const supabase = createSupabaseServerClient();

    const { data: plugin } = await supabase
      .from("plugins")
      .select("id, seller_id")
      .eq("id", params.id)
      .maybeSingle();

    if (!plugin || plugin.seller_id !== sellerId) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    const { data: versionRow } = await supabase
      .from("plugin_versions")
      .select("id, plugin_id, is_latest, file_url")
      .eq("id", params.versionId)
      .maybeSingle();

    if (!versionRow || versionRow.plugin_id !== params.id) {
      return NextResponse.json({ error: "version_not_found" }, { status: 404 });
    }

    // Best-effort: delete the jar from storage.
    if (versionRow.file_url) {
      try {
        await supabase.storage.from("plugin-files").remove([versionRow.file_url]);
      } catch {
        // Ignore storage delete failures; the DB delete should still happen.
      }
    }

    // Clear purchase references that point to this specific version row.
    const { error: purchasesRefClearErr } = await supabase
      .from("purchases")
      .update({ version_id: null })
      .eq("version_id", params.versionId);

    if (purchasesRefClearErr) {
      return NextResponse.json({ error: purchasesRefClearErr.message }, { status: 400 });
    }

    const { error: deleteErr } = await supabase
      .from("plugin_versions")
      .delete()
      .eq("id", params.versionId);

    if (deleteErr) {
      return NextResponse.json({ error: deleteErr.message }, { status: 400 });
    }

    // If we deleted the latest version, promote another one.
    if (versionRow.is_latest) {
      await supabase.from("plugin_versions").update({ is_latest: false }).eq("plugin_id", params.id);
      const { data: remaining } = await supabase
        .from("plugin_versions")
        .select("id")
        .eq("plugin_id", params.id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (remaining && remaining[0]?.id) {
        await supabase.from("plugin_versions").update({ is_latest: true }).eq("id", remaining[0].id);
      }
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "internal_error" }, { status: 500 });
  }
}

