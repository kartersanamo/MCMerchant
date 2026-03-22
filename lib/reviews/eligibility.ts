import type { SupabaseClient } from "@supabase/supabase-js";

export type PluginForReview = {
  id: string;
  seller_id: string;
  price_cents: number | null;
};

/**
 * Who may leave a star review: verified users who are not the seller, and who either
 * got the plugin free (anyone) or have a completed purchase / active license for paid plugins.
 */
export async function userCanReviewPlugin(
  supabase: SupabaseClient,
  userId: string,
  plugin: PluginForReview
): Promise<boolean> {
  if (!userId || plugin.seller_id === userId) return false;

  const price = plugin.price_cents ?? 0;
  if (price <= 0) return true;

  const { data: purchase } = await supabase
    .from("purchases")
    .select("id")
    .eq("plugin_id", plugin.id)
    .eq("buyer_id", userId)
    .eq("status", "completed")
    .limit(1)
    .maybeSingle();

  if (purchase) return true;

  const { data: license } = await supabase
    .from("license_keys")
    .select("id")
    .eq("plugin_id", plugin.id)
    .eq("buyer_id", userId)
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();

  return Boolean(license);
}
