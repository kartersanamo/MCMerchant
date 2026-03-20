import { redirect } from "next/navigation";
import { getAuthedUserId } from "@/lib/supabase/server";

export default async function PluginVersionsPage({ params }: { params: { id: string } }) {
  const userId = await getAuthedUserId();
  if (!userId) return null;

  // Backwards-compatible redirect: versions are managed on the plugin edit page.
  redirect(`/dashboard/plugins/${params.id}/edit?tab=versions`);
}

