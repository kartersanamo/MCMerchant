import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe, getStripeApiMode } from "@/lib/stripe";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireVerifiedUserForApi } from "@/lib/auth/email-verification";
import { enforceCsrfForRequest } from "@/lib/security/csrf";
import { getCanonicalAppOriginForServer } from "@/lib/app-url";

export async function POST(request: Request) {
  const csrf = enforceCsrfForRequest(request);
  if (csrf) return csrf;
  const gate = await requireVerifiedUserForApi();
  if (gate instanceof NextResponse) return gate;
  const { userId } = gate;

  let reset = false;
  const ct = request.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) {
    try {
      const body = (await request.json()) as { reset?: boolean };
      reset = Boolean(body?.reset);
    } catch {
      /* ignore invalid JSON */
    }
  }

  const appUrl = getCanonicalAppOriginForServer();
  if (!appUrl) {
    return NextResponse.json({ error: "missing_public_app_url" }, { status: 500 });
  }
  const mode = getStripeApiMode();

  const supabase = createSupabaseServerClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_account_id, stripe_onboarded")
    .eq("id", userId)
    .maybeSingle();

  let accountId = profile?.stripe_account_id ?? null;

  if (reset) {
    await supabase
      .from("profiles")
      .update({ stripe_account_id: null, stripe_onboarded: false })
      .eq("id", userId);
    accountId = null;
  }

  try {
    const stripe = getStripe();

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

    return NextResponse.json({ url: accountLink.url, stripeMode: mode }, { status: 200 });
  } catch (e: unknown) {
    if (e instanceof Stripe.errors.StripeError) {
      const sc = e.statusCode;
      const status =
        typeof sc === "number" && sc >= 400 && sc < 600 ? sc : 400;
      return NextResponse.json(
        {
          error: e.message,
          stripeType: e.type,
          requestId: e.requestId
        },
        { status }
      );
    }
    console.error("[stripe/connect]", e);
    return NextResponse.json(
      { error: "Unexpected error starting Stripe Connect." },
      { status: 500 }
    );
  }
}

