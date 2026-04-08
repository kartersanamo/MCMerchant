import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createSupabaseServerClient, getAuthedUserId } from "@/lib/supabase/server";
import { enforceCsrfForRequest } from "@/lib/security/csrf";
import { getCanonicalAppOriginForServer } from "@/lib/app-url";

export async function GET(request: Request) {
  const csrf = enforceCsrfForRequest(request, { protectSafeMethods: true });
  if (csrf) return csrf;
  const url = new URL(request.url);
  const pluginId = url.searchParams.get("pluginId");
  const versionId = url.searchParams.get("versionId");
  const slug = url.searchParams.get("slug");

  if (!pluginId || !versionId || !slug) {
    return NextResponse.json({ error: "missing_parameters" }, { status: 400 });
  }

  const buyerId = await getAuthedUserId();
  if (!buyerId) {
    return NextResponse.redirect(`/login?redirect=/plugin/${slug}`);
  }

  const supabase = createSupabaseServerClient();

  const { data: plugin } = await supabase
    .from("plugins")
    .select("id, name, price_cents, seller_id")
    .eq("id", pluginId)
    .maybeSingle();

  if (!plugin || (plugin.price_cents ?? 0) <= 0) {
    return NextResponse.json({ error: "invalid_plugin" }, { status: 400 });
  }

  const { data: seller } = await supabase
    .from("profiles")
    .select("stripe_account_id")
    .eq("id", plugin.seller_id)
    .maybeSingle();

  const sellerStripeAccountId = seller?.stripe_account_id;
  if (!sellerStripeAccountId) {
    return NextResponse.json({ error: "seller_not_connected" }, { status: 400 });
  }

  const appUrl = getCanonicalAppOriginForServer();
  if (!appUrl) {
    return NextResponse.json({ error: "missing_public_app_url" }, { status: 500 });
  }
  const stripe = getStripe();

  // Destination charges require the connected account to have transfers (or legacy_payments) capability.
  let account: any;
  try {
    account = await stripe.accounts.retrieve(sellerStripeAccountId);
  } catch {
    return NextResponse.redirect(`${appUrl}/plugin/${slug}?error=checkout_unavailable`);
  }
  const canReceiveTransfers =
    account?.capabilities?.transfers === "active" ||
    account?.capabilities?.legacy_payments === "active";
  if (!canReceiveTransfers) {
    return NextResponse.redirect(`${appUrl}/plugin/${slug}?error=checkout_unavailable`);
  }

  const feePercent = Number(process.env.STRIPE_PLATFORM_FEE_PERCENT ?? 10);
  const applicationFeeAmount = Math.round((plugin.price_cents ?? 0) * (feePercent / 100));

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          product_data: {
            name: plugin.name
          },
          unit_amount: plugin.price_cents
        }
      }
    ],
    // Connect platform fee logic.
    payment_intent_data: {
      application_fee_amount: applicationFeeAmount,
      transfer_data: {
        destination: sellerStripeAccountId
      }
    },
    success_url: `${appUrl}/account/purchases?checkout=success`,
    cancel_url: `${appUrl}/plugin/${slug}`,
    metadata: {
      plugin_id: pluginId,
      buyer_id: buyerId,
      version_id: versionId
    }
  });

  const redirectUrl = checkoutSession.url;
  if (!redirectUrl) {
    return NextResponse.json({ error: "stripe_no_url" }, { status: 500 });
  }

  return NextResponse.redirect(redirectUrl);
}

