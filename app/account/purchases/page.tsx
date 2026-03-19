import { getAuthedUserId } from "@/lib/supabase/server";

export default async function PurchasesPage() {
  const userId = await getAuthedUserId();
  if (!userId) return null;

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <h1 className="text-2xl font-semibold text-gray-100">Your purchases</h1>
      <p className="mt-2 text-sm text-gray-400">
        MVP placeholder. Implement purchases table -> plugins mapping.
      </p>
    </div>
  );
}

