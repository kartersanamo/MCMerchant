export function maskLicenseKey(key: string): string {
  // Expect format PDEX-XXXX-XXXX-XXXX-XXXX; show only last segment.
  const parts = key.split("-");
  if (parts.length < 5) return key;
  const last = parts[parts.length - 1];
  return `PDEX-••••-••••-••••-${last}`;
}

export function LicenseBadge({ licenseKey }: { licenseKey: string }) {
  return (
    <code className="inline-flex items-center rounded-md border border-gray-800 bg-gray-950 px-2 py-1 font-mono text-xs text-gray-100">
      {maskLicenseKey(licenseKey)}
    </code>
  );
}


