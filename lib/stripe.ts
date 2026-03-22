import Stripe from "stripe";

/**
 * Stripe mode is determined only by your secret key prefix — there is no separate
 * "test Connect" API. Use sk_live_* / pk_live_* in production for real onboarding and payouts.
 */
export function getStripeApiMode(): "live" | "test" | "unknown" {
  const k = (process.env.STRIPE_SECRET_KEY ?? "").trim();
  if (k.startsWith("sk_live_") || k.startsWith("rk_live_")) return "live";
  if (k.startsWith("sk_test_") || k.startsWith("rk_test_")) return "test";
  return "unknown";
}

export function isStripeLiveMode(): boolean {
  return getStripeApiMode() === "live";
}

export function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) throw new Error("Missing STRIPE_SECRET_KEY");
  const mode = getStripeApiMode();
  if (mode === "unknown") {
    console.warn(
      "[stripe] STRIPE_SECRET_KEY should start with sk_test_/sk_live_ or rk_test_/rk_live_ (restricted keys)."
    );
  }
  return new Stripe(secretKey, {
    apiVersion: "2024-06-20"
  });
}

