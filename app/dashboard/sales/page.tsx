import { getAuthedUserId } from "@/lib/supabase/server";

export default async function SalesPage() {
  const userId = await getAuthedUserId();
  if (!userId) return null;

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <h1 className="text-2xl font-semibold text-gray-100">Sales history</h1>
      <p className="mt-2 text-sm text-gray-400">Sales analytics panel coming next: purchases, payouts, and trend insights.</p>
    </div>
  );
}

