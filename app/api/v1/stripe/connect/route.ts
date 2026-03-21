import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireVerifiedUserForApi } from "@/lib/auth/email-verification";

export async function POST() {
  const gate = await requireVerifiedUserForApi();
  if (gate instanceof NextResponse) return gate;
  const { userId } = gate;

  const stripe = getStripe();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const supabase = createSupabaseServerClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_account_id, stripe_onboarded")
    .eq("id", userId)
    .maybeSingle();

  let accountId = profile?.stripe_account_id ?? null;

  if (!accountId) {
    const account = await stripe.accounts.create({
      type: "express",
      email: undefined,
      metadata: { userId },
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true }
      }
    });
    accountId = account.id;
    await supabase
      .from("profiles")
      .update({
        stripe_account_id: account.id,
        stripe_onboarded: false
      })
      .eq("id", userId);
  }

  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${appUrl}/dashboard/payouts`,
    return_url: `${appUrl}/dashboard/payouts`,
    type: "account_onboarding"
  });

  return NextResponse.json({ url: accountLink.url }, { status: 200 });
}

