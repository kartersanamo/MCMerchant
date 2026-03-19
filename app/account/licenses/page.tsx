import { getAuthedUserId } from "@/lib/supabase/server";
import { LicenseBadge } from "@/components/license-badge";

export default async function LicensesPage() {
  const userId = await getAuthedUserId();
  if (!userId) return null;

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <h1 className="text-2xl font-semibold text-gray-100">Your licenses</h1>
      <p className="mt-2 text-sm text-gray-400">
        MVP placeholder. Query `license_keys` where `buyer_id = current user`.
      </p>

      <div className="mt-6 space-y-3">
        {[
          { key: "PDEX-AAAA-BBBB-CCCC" },
          { key: "PDEX-DDDD-EEEE-FFFF" }
        ].map((l) => (
          <div key={l.key} className="rounded-xl border border-gray-800 bg-gray-900/30 p-4">
            <div className="text-sm text-gray-400">License key</div>
            <div className="mt-2">
              <LicenseBadge licenseKey={l.key} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

