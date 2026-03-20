import { LoaderInstallFlow } from "@/components/loader-install-flow";

export default function LoaderInstallPage() {
  return (
    <LoaderInstallFlow
      loaderName="MCMerchantLoader"
      downloadUrl="/api/downloads/loader"
      backHref="/docs/loader"
    />
  );
}

