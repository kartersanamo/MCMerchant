import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { issueLicense } from "@/lib/licensing/generate";
import { getResend } from "@/lib/resend";
import PurchaseConfirmationEmail from "@/emails/purchase-confirmation";

async function handleCheckoutSessionCompleted(event: any) {
  const session = event.data.object;

  const plugin_id = session.metadata?.plugin_id as string | undefined;
  const buyer_id = session.metadata?.buyer_id as string | undefined;
  const version_id = session.metadata?.version_id as string | undefined;

  try {
    if (!plugin_id || !buyer_id || !version_id) {
      console.warn("[Stripe webhook] Missing metadata for checkout.session.completed", {
        plugin_id: plugin_id ?? null,
        buyer_id: buyer_id ? buyer_id.slice(-8) : null,
        version_id: version_id ?? null
      });
      return;
    }

    const supabase = createSupabaseServerClient();

    console.info("[Stripe webhook] checkout.session.completed", {
      plugin_id,
      buyer_id: buyer_id.slice(-8),
      version_id
    });

  // Stripe checkout session is already charged; we finalize purchase record.
  const stripe_payment_intent_id = session.payment_intent as string | undefined;
  const amount_cents = typeof session.amount_total === "number" ? session.amount_total : 0;
  const platform_fee_percent = Number(process.env.STRIPE_PLATFORM_FEE_PERCENT ?? 10);
  const platform_fee_cents = Math.round(amount_cents * (platform_fee_percent / 100));

    if (!stripe_payment_intent_id) {
      console.warn("[Stripe webhook] Missing payment_intent for checkout.session.completed", {
        plugin_id,
        buyer_id: buyer_id.slice(-8),
        version_id
      });
      return;
    }

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

    if (!plugin || !profile) {
      console.warn("[Stripe webhook] Plugin or profile not found", {
        plugin_found: Boolean(plugin),
        profile_found: Boolean(profile),
        plugin_id,
        buyer_id: buyer_id.slice(-8)
      });
      return;
    }

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

    if (purchaseErr) {
      console.error("[Stripe webhook] Failed to upsert purchase", {
        message: purchaseErr.message,
        plugin_id,
        buyer_id: buyer_id.slice(-8),
        version_id
      });
      return;
    }

    if (!purchase?.id) {
      console.warn("[Stripe webhook] Upsert returned no purchase row", {
        plugin_id,
        buyer_id: buyer_id.slice(-8),
        version_id
      });
      return;
    }

  // 2) Issue license key record using the new licensing system.
    const license = await issueLicense({
      pluginId: plugin_id,
      purchaseId: purchase.id,
      buyerId: buyer_id
    });

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
  const downloadUrl = `${appUrl}/api/downloads/${license.key}/${plugin_id}`;
  const buyerDashboardUrl = `${appUrl}/account/licenses`;

  try {
    const resend = getResend();
    const fromEmail = process.env.RESEND_FROM_EMAIL;
    if (!fromEmail) return;

    const { data: buyerAuthUser } = await supabase.auth.admin.getUserById(buyer_id);
    const buyerEmail = buyerAuthUser?.user?.email;
    if (!buyerEmail) return;

    const { renderToStaticMarkup } = await import("react-dom/server");

    const doctype =
      '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">';
    const html =
      doctype +
      renderToStaticMarkup(
        PurchaseConfirmationEmail({
          pluginName: plugin.name,
          licenseKey: license.key,
          downloadUrl,
          buyerDashboardUrl
        })
      );

    await resend.emails.send({
      from: fromEmail,
      to: buyerEmail,
      subject: `Your MCMerchant purchase: ${plugin.name}`,
      html
    });
  } catch (err) {
    console.error("[Stripe webhook] Email confirmation failed (best-effort)", {
      plugin_id,
      buyer_id: buyer_id ? buyer_id.slice(-8) : null,
      version_id,
      error: err instanceof Error ? err.message : String(err)
    });
  }
  } catch (err) {
    console.error("[Stripe webhook] Failed processing checkout.session.completed", {
      plugin_id,
      buyer_id: buyer_id ? buyer_id.slice(-8) : null,
      version_id,
      error: err instanceof Error ? err.message : String(err)
    });
  }
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

