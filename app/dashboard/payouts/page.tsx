import { createSupabaseServerClient, getAuthedUserId } from "@/lib/supabase/server";
import { StripeConnectButton } from "@/components/stripe-connect-button";
import { getStripeApiMode } from "@/lib/stripe";
import { syncStripeOnboardingStatus, getPayoutInfo } from "@/lib/stripe-connect";

function formatPayoutDate(ts: number | null): string {
  if (ts == null) return "—";
  const d = new Date(ts * 1000);
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function formatAmount(cents: number, currency: string): string {
  const code = currency.toUpperCase() === "USD" ? "$" : `${currency} `;
  return `${code}${(cents / 100).toFixed(2)}`;
}

export default async function PayoutsPage() {
  const userId = await getAuthedUserId();
  if (!userId) return null;

  const supabase = createSupabaseServerClient();
  const { stripeOnboarded, stripeAccountId } = await syncStripeOnboardingStatus(supabase, userId);

  const payoutInfo =
    stripeOnboarded && stripeAccountId ? await getPayoutInfo(stripeAccountId) : null;

  const stripeMode = getStripeApiMode();

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <h1 className="text-2xl font-semibold text-gray-100">Payouts</h1>
      <p className="mt-2 text-sm text-gray-400">
        {stripeOnboarded
          ? "Your Stripe account is connected. Balance and payout history are below."
          : "Connect your Stripe account to receive payouts from plugin sales."}
      </p>

      {stripeMode === "test" ? (
        <div className="mt-6 rounded-xl border border-amber-500/35 bg-amber-500/10 px-4 py-3 text-sm text-amber-100/95">
          <p className="font-medium text-amber-100">Stripe is in test mode</p>
          <p className="mt-2 text-amber-100/85">
            Your server is using a <code className="rounded bg-black/20 px-1">sk_test_…</code> key. Connect
            onboarding still opens real Stripe screens, but only{" "}
            <strong className="text-amber-50">test</strong> connected accounts and balances are created — no real
            payouts. For production, set <code className="rounded bg-black/20 px-1">STRIPE_SECRET_KEY</code> and{" "}
            <code className="rounded bg-black/20 px-1">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code> to your{" "}
            <strong className="text-amber-50">live</strong> keys and add a <strong className="text-amber-50">live</strong>{" "}
            webhook signing secret. See <code className="rounded bg-black/20 px-1">docs/stripe-live.md</code> in the repo.
          </p>
          {stripeAccountId ? (
            <div className="mt-3">
              <p className="text-xs text-amber-200/80">
                After switching to live keys, reset here once so you don&apos;t keep a test account ID in the database.
              </p>
              <div className="mt-2">
                <StripeConnectButton
                  resetBeforeConnect
                  label="Reset & reconnect Stripe"
                  loadingLabel="Opening Stripe…"
                />
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {stripeMode === "live" ? (
        <div className="mt-6 rounded-xl border border-emerald-500/25 bg-emerald-500/5 px-4 py-2 text-xs text-emerald-200/90">
          Live Stripe keys detected — Connect onboarding creates a real Express account for payouts.
        </div>
      ) : null}

      {stripeOnboarded ? (
        <>
          <div className="mt-6 flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/20">
              <svg className="h-4 w-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-sm font-medium text-emerald-200">Stripe connected</span>
          </div>

          <div className="mt-4 rounded-xl border border-gray-800 bg-gray-900/30 p-4">
            <p className="text-sm text-gray-300">
              If buyers see &quot;temporarily unavailable for purchase,&quot; your Stripe account may be restricted. Open Stripe to complete any pending requirements (e.g. identity or bank details).
            </p>
            <div className="mt-3">
              <StripeConnectButton
                label="Complete setup in Stripe"
                loadingLabel="Opening..."
              />
            </div>
          </div>

          {payoutInfo ? (
            <>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-gray-800 bg-gray-900/30 p-4">
                  <div className="text-xs text-gray-400">Available balance</div>
                  <div className="mt-2 text-xl font-semibold text-gray-100">
                    {formatAmount(payoutInfo.availableCents, payoutInfo.currency)}
                  </div>
                  <div className="mt-1 text-xs text-gray-500">Ready to pay out</div>
                </div>
                <div className="rounded-xl border border-gray-800 bg-gray-900/30 p-4">
                  <div className="text-xs text-gray-400">Pending balance</div>
                  <div className="mt-2 text-xl font-semibold text-gray-100">
                    {formatAmount(payoutInfo.pendingCents, payoutInfo.currency)}
                  </div>
                  <div className="mt-1 text-xs text-gray-500">From recent sales (before payout)</div>
                </div>
              </div>

              <section className="mt-8">
                <h2 className="text-lg font-semibold text-gray-100">Recent payouts</h2>
                <p className="mt-1 text-sm text-gray-400">History of payouts to your bank account.</p>
                {payoutInfo.payouts.length > 0 ? (
                  <div className="mt-4 overflow-hidden rounded-xl border border-gray-800">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-800 bg-gray-900/50">
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Date</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Amount</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Type</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800">
                        {payoutInfo.payouts.map((p) => (
                          <tr key={p.id} className="bg-gray-900/20">
                            <td className="px-4 py-3 text-gray-300">{formatPayoutDate(p.arrivalDate ?? p.created)}</td>
                            <td className="px-4 py-3 font-medium text-gray-100">
                              {formatAmount(p.amountCents, p.currency)}
                            </td>
                            <td className="px-4 py-3 text-gray-300">{p.method}</td>
                            <td className="px-4 py-3">
                              <span
                                className={
                                  p.status === "paid"
                                    ? "text-emerald-400"
                                    : p.status === "pending"
                                      ? "text-amber-400"
                                      : p.status === "failed"
                                        ? "text-red-400"
                                        : "text-gray-400"
                                }
                              >
                                {p.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="mt-4 rounded-xl border border-gray-800 bg-gray-900/20 px-4 py-8 text-center text-sm text-gray-400">
                    No payouts yet. Payouts are sent automatically based on your Stripe schedule.
                  </div>
                )}
              </section>
            </>
          ) : (
            <div className="mt-6 rounded-xl border border-gray-800 bg-gray-900/30 p-4 text-sm text-gray-400">
              Unable to load balance and payout history. Check your connection and try again later.
            </div>
          )}
        </>
      ) : (
        <div className="mt-6">
          <StripeConnectButton />
        </div>
      )}
    </div>
  );
}

