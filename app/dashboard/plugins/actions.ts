export async function deletePlugin(pluginId: string): Promise<{ error?: string }> {
  const res = await fetch(`/api/v1/dashboard/plugins/${pluginId}`, {
    method: "DELETE",
    credentials: "same-origin"
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { error: (data.error as string) ?? "Failed to delete plugin" };
  }

  return {};
}
