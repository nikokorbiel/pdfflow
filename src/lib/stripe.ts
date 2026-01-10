import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
});

// Price IDs - you'll need to create these in your Stripe Dashboard
// Go to Products > Add Product > Add Price
export const PRICES = {
  PRO_MONTHLY: process.env.STRIPE_PRICE_MONTHLY || "price_monthly_placeholder",
  PRO_ANNUAL: process.env.STRIPE_PRICE_ANNUAL || "price_annual_placeholder",
};
