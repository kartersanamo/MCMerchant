import { PluginCard, type PluginCardData } from "@/components/plugin-card";

export function PluginGrid({ plugins }: { plugins: PluginCardData[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {plugins.map((p) => (
        <PluginCard key={p.id} plugin={p} />
      ))}
    </div>
  );
}

