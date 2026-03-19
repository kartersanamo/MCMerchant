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

  // Delete dependent rows first (foreign keys reference plugins.id)
  await supabase.from("plugin_versions").delete().eq("plugin_id", pluginId);
  await supabase.from("license_keys").delete().eq("plugin_id", pluginId);
  await supabase.from("reviews").delete().eq("plugin_id", pluginId);

  const { error } = await supabase.from("plugins").delete().eq("id", pluginId);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/plugins");
  revalidatePath("/dashboard");
  return {};
}
