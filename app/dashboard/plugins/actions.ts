"use server";

import { createSupabaseServerClient, getAuthedUserId } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function deletePlugin(pluginId: string): Promise<{ error?: string }> {
  const userId = await getAuthedUserId();
  if (!userId) return { error: "Unauthorized" };

  const supabase = createSupabaseServerClient();

  const { data: plugin } = await supabase
    .from("plugins")
    .select("id, seller_id")
    .eq("id", pluginId)
    .maybeSingle();

  if (!plugin || plugin.seller_id !== userId) {
    return { error: "Plugin not found or you don't have permission to delete it" };
  }

  // Purchases may keep a nullable FK to plugin_versions via purchases.version_id.
  // Clear those references first so plugin_versions rows can be deleted safely.
  const { data: pluginVersionRows, error: pluginVersionRowsErr } = await supabase
    .from("plugin_versions")
    .select("id")
    .eq("plugin_id", pluginId);

  if (pluginVersionRowsErr) return { error: pluginVersionRowsErr.message };

  const pluginVersionIds = (pluginVersionRows ?? []).map((r: any) => r.id).filter(Boolean);
  if (pluginVersionIds.length > 0) {
    const { error: purchasesRefClearErr } = await supabase
      .from("purchases")
      .update({ version_id: null })
      .in("version_id", pluginVersionIds);

    if (purchasesRefClearErr) return { error: purchasesRefClearErr.message };
  }

  // Delete dependent rows first (foreign keys reference plugins.id)
  const { error: versionsDelErr } = await supabase
    .from("plugin_versions")
    .delete()
    .eq("plugin_id", pluginId);

  if (versionsDelErr) return { error: versionsDelErr.message };

  const { error: licensesDelErr } = await supabase
    .from("license_keys")
    .delete()
    .eq("plugin_id", pluginId);

  if (licensesDelErr) return { error: licensesDelErr.message };

  const { error: reviewsDelErr } = await supabase
    .from("reviews")
    .delete()
    .eq("plugin_id", pluginId);

  if (reviewsDelErr) return { error: reviewsDelErr.message };

  // Some license_keys rows may still reference purchases via purchase_id even if plugin_id
  // filtering misses them (legacy/manual data). Remove by purchase_id as a safety pass.
  const { data: purchaseRows, error: purchaseRowsErr } = await supabase
    .from("purchases")
    .select("id")
    .eq("plugin_id", pluginId);

  if (purchaseRowsErr) return { error: purchaseRowsErr.message };

  const purchaseIds = (purchaseRows ?? []).map((r: any) => r.id).filter(Boolean);
  if (purchaseIds.length > 0) {
    const { error: licensesByPurchaseDelErr } = await supabase
      .from("license_keys")
      .delete()
      .in("purchase_id", purchaseIds);

    if (licensesByPurchaseDelErr) return { error: licensesByPurchaseDelErr.message };
  }

  // Remove purchase rows that still reference this plugin.
  // This avoids purchases_plugin_id_fkey violations when deleting plugins.
  const { error: purchasesDelErr } = await supabase
    .from("purchases")
    .delete()
    .eq("plugin_id", pluginId);

  if (purchasesDelErr) {
    // Defensive retry path for legacy rows: delete license keys by exact purchase ids
    // and attempt purchases delete one more time.
    const msg = String(purchasesDelErr.message ?? "").toLowerCase();
    if (msg.includes("license_keys_purchase_id_fkey") && purchaseIds.length > 0) {
      const { data: danglingLicenses, error: danglingLicensesErr } = await supabase
        .from("license_keys")
        .select("id")
        .in("purchase_id", purchaseIds);

      if (danglingLicensesErr) return { error: danglingLicensesErr.message };

      const danglingIds = (danglingLicenses ?? []).map((r: any) => r.id).filter(Boolean);
      if (danglingIds.length > 0) {
        const { error: danglingDeleteErr } = await supabase
          .from("license_keys")
          .delete()
          .in("id", danglingIds);
        if (danglingDeleteErr) return { error: danglingDeleteErr.message };
      }

      const { error: purchasesRetryErr } = await supabase
        .from("purchases")
        .delete()
        .eq("plugin_id", pluginId);

      if (purchasesRetryErr) return { error: purchasesRetryErr.message };
    } else {
      return { error: purchasesDelErr.message };
    }
  }

  // Safety: ensure dependent versions are actually gone before deleting the plugin.
  const { count: remainingVersionsCount, error: remainingCountErr } = await supabase
    .from("plugin_versions")
    .select("id", { count: "exact", head: true })
    .eq("plugin_id", pluginId);

  if (remainingCountErr) return { error: remainingCountErr.message };
  if ((remainingVersionsCount ?? 0) > 0) {
    return {
      error:
        `Could not delete plugin_versions for this plugin (still has ${remainingVersionsCount} version(s)). ` +
        `Foreign key constraint likely still active.`
    };
  }

  const { error } = await supabase.from("plugins").delete().eq("id", pluginId);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/plugins");
  revalidatePath("/dashboard");
  return {};
}
