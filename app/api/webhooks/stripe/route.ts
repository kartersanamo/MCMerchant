import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { generateLicenseKey } from "@/lib/license";
import { getResend } from "@/lib/resend";
import PurchaseConfirmationEmail from "@/emails/purchase-confirmation";
import { render } from "@react-email/render";

async function handleCheckoutSessionCompleted(event: any) {
  const session = event.data.object;

  const plugin_id = session.metadata?.plugin_id as string | undefined;
  const buyer_id = session.metadata?.buyer_id as string | undefined;
  const version_id = session.metadata?.version_id as string | undefined;

  if (!plugin_id || !buyer_id || !version_id) return;

  const supabase = createSupabaseServerClient();

  // Stripe checkout session is already charged; we finalize purchase record.
  const stripe_payment_intent_id = session.payment_intent as string | undefined;
  const amount_cents = typeof session.amount_total === "number" ? session.amount_total : 0;
  const platform_fee_percent = Number(process.env.STRIPE_PLATFORM_FEE_PERCENT ?? 10);
  const platform_fee_cents = Math.round(amount_cents * (platform_fee_percent / 100));

  if (!stripe_payment_intent_id) return;

  const { data: plugin } = await supabase
    .from("plugins")
    .select("id, name")
    .eq("id", plugin_id)
    .maybeSingle();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", buyer_id)
    .maybeSingle();

  if (!plugin || !profile) return;

  // 1) Upsert purchase to completed
  const { data: purchase, error: purchaseErr } = await supabase
    .from("purchases")
    .upsert(
      {
        buyer_id,
        plugin_id,
        version_id,
        stripe_payment_intent_id,
        amount_cents,
        platform_fee_cents,
        status: "completed"
      },
      { onConflict: "stripe_payment_intent_id" }
    )
    .select("id, status")
    .maybeSingle();

  if (purchaseErr) return;

  if (!purchase?.id) return;

  // 2) Generate license key
  const key = generateLicenseKey();
  const { error: licenseErr } = await supabase.from("license_keys").insert({
    purchase_id: purchase.id,
    plugin_id,
    buyer_id,
    key,
    is_active: true
  });

  if (licenseErr) return;

  // 3) Increment sales on plugin
  // Supabase JS can't "increment" without depending on RPC; do a safe fetch+update MVP.
  const { data: pluginRow } = await supabase
    .from("plugins")
    .select("total_sales")
    .eq("id", plugin_id)
    .maybeSingle();

  if (pluginRow) {
    await supabase
      .from("plugins")
      .update({ total_sales: (pluginRow.total_sales ?? 0) + 1 })
      .eq("id", plugin_id);
  }

  // 4) Email confirmation (best-effort)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const downloadUrl = `${appUrl}/api/downloads/${key}/${plugin_id}`;
  const buyerDashboardUrl = `${appUrl}/account/licenses`;

  const resend = getResend();
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  if (!fromEmail) return;

  const { data: buyerAuthUser } = await supabase.auth.admin.getUserById(buyer_id);
  const buyerEmail = buyerAuthUser?.email;
  if (!buyerEmail) return;

  const html = render(
    PurchaseConfirmationEmail({
      pluginName: plugin.name,
      licenseKey: key,
      downloadUrl,
      buyerDashboardUrl
    })
  );

  await resend.emails.send({
    from: fromEmail,
    to: buyerEmail,
    subject: `Your Plugdex purchase: ${plugin.name}`,
    html
  });
}

async function handleAccountUpdated(event: any) {
  const acct = event.data.object;
  const stripe_account_id = acct?.id as string | undefined;
  const payouts_enabled = Boolean(acct?.payouts_enabled);

  if (!stripe_account_id || !payouts_enabled) return;

  const supabase = createSupabaseServerClient();
  await supabase
    .from("profiles")
    .update({ stripe_onboarded: true })
    .eq("stripe_account_id", stripe_account_id);
}

export async function POST(request: Request) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "missing_webhook_secret" }, { status: 500 });
  }

  const sig = request.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "missing_signature" }, { status: 400 });
  }

  const body = await request.text();

  let event: any;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  // Per prompt: never block the webhook.
  void Promise.resolve()
    .then(async () => {
      if (event.type === "checkout.session.completed") {
        await handleCheckoutSessionCompleted(event);
      }
      if (event.type === "account.updated") {
        await handleAccountUpdated(event);
      }
    })
    .catch(() => {});

  return NextResponse.json({ received: true }, { status: 200 });
}

