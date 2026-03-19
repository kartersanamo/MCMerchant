export function LicenseBadge({ licenseKey }: { licenseKey: string }) {
  return (
    <code className="inline-flex items-center rounded-md border border-gray-800 bg-gray-950 px-2 py-1 font-mono text-xs text-gray-100">
      {licenseKey}
    </code>
  );
}

