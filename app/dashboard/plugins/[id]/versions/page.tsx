import { VersionUploader } from "@/components/version-uploader";

export default function PluginVersionsPage({ params }: { params: { id: string } }) {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <h1 className="text-2xl font-semibold text-gray-100">Upload new version</h1>
      <p className="mt-2 text-sm text-gray-400">
        MVP: .jar upload + version metadata. Store jar files in private Supabase bucket and mark this as latest.
      </p>

      <div className="mt-6">
        <VersionUploader pluginId={params.id} />
      </div>
    </div>
  );
}

