import Stripe from "stripe";

let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      typescript: true,
    });
  }
  return stripeInstance;
}

// Legacy export for backwards compatibility
export const stripe = {
  get customers() { return getStripe().customers; },
  get checkout() { return getStripe().checkout; },
  get subscriptions() { return getStripe().subscriptions; },
  get webhooks() { return getStripe().webhooks; },
  get billingPortal() { return getStripe().billingPortal; },
};

// Price IDs - you'll need to create these in your Stripe Dashboard
// Go to Products > Add Product > Add Price
// Monthly: $4.99/month recurring subscription
// Lifetime: $24.99 one-time payment
export const PRICES = {
  PRO_MONTHLY: process.env.STRIPE_PRICE_MONTHLY || "price_monthly_placeholder",
  PRO_LIFETIME: process.env.STRIPE_PRICE_LIFETIME || "price_lifetime_placeholder",
};
