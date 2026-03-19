import { getStripe } from "@/lib/stripe";
import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Syncs Stripe Connect onboarding status from Stripe to the profile.
 * Call this when the user loads dashboard/payouts so we persist "connected"
 * even if the webhook didn't fire (e.g. localhost without Stripe CLI).
 * Returns the current stripe_onboarded value (after any update).
 */
export async function syncStripeOnboardingStatus(
  supabase: SupabaseClient,
  userId: string
): Promise<{ stripeOnboarded: boolean; stripeAccountId: string | null }> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_account_id, stripe_onboarded")
    .eq("id", userId)
    .maybeSingle();

  const accountId = profile?.stripe_account_id ?? null;
  if (!accountId) {
    return { stripeOnboarded: false, stripeAccountId: null };
  }

  const alreadyOnboarded = Boolean(profile?.stripe_onboarded);
  if (alreadyOnboarded) {
    return { stripeOnboarded: true, stripeAccountId: accountId };
  }

  try {
    const stripe = getStripe();
    const account = await stripe.accounts.retrieve(accountId);
    const detailsSubmitted = Boolean((account as any).details_submitted);
    if (detailsSubmitted) {
      await supabase
        .from("profiles")
        .update({ stripe_onboarded: true })
        .eq("id", userId);
      return { stripeOnboarded: true, stripeAccountId: accountId };
    }
  } catch {
    // Stripe API error; keep current state
  }

  return { stripeOnboarded: false, stripeAccountId: accountId };
}

export type PayoutInfo = {
  availableCents: number;
  pendingCents: number;
  currency: string;
  payouts: Array<{
    id: string;
    amountCents: number;
    currency: string;
    status: string;
    arrivalDate: number | null;
    created: number;
    method: string;
  }>;
};

/**
 * Fetches balance and recent payouts for a connected Stripe account.
 */
export async function getPayoutInfo(stripeAccountId: string): Promise<PayoutInfo | null> {
  try {
    const stripe = getStripe();
    const [balance, payoutsList] = await Promise.all([
      stripe.balance.retrieve({ stripeAccount: stripeAccountId }),
      stripe.payouts.list({ limit: 20 }, { stripeAccount: stripeAccountId })
    ]);

    const available = (balance as any).available ?? [];
    const pending = (balance as any).pending ?? [];
    const availableCents = available.reduce((sum: number, b: any) => sum + (b.amount ?? 0), 0);
    const pendingCents = pending.reduce((sum: number, b: any) => sum + (b.amount ?? 0), 0);
    const currency = (available[0] ?? pending[0])?.currency ?? "usd";

    const payouts = (payoutsList.data ?? []).map((p: any) => ({
      id: p.id,
      amountCents: p.amount ?? 0,
      currency: (p.currency ?? "usd").toUpperCase(),
      status: String(p.status ?? ""),
      arrivalDate: p.arrival_date ?? null,
      created: p.created ?? 0,
      method: p.method === "instant" ? "Instant" : "Standard"
    }));

    return {
      availableCents,
      pendingCents,
      currency,
      payouts
    };
  } catch {
    return null;
  }
}
