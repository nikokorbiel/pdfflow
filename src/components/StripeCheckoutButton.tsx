"use client";

interface StripeCheckoutButtonProps {
  isAnnual?: boolean;
}

export function StripeCheckoutButton({ isAnnual = true }: StripeCheckoutButtonProps) {
  const handleCheckout = async () => {
    // This is a placeholder for Stripe integration
    // In production, this would call your API to create a Stripe Checkout session
    // Example:
    // const priceId = isAnnual ? 'price_annual_xxx' : 'price_monthly_xxx';
    // const response = await fetch('/api/checkout', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ priceId }),
    // });
    // const { url } = await response.json();
    // window.location.href = url;

    const plan = isAnnual ? "Annual (£59.88/year)" : "Monthly (£7.99/month)";

    alert(
      `Stripe Checkout Integration\n\n` +
        `Selected Plan: Pro ${plan}\n\n` +
        "To enable payments:\n" +
        "1. Create a Stripe account at stripe.com\n" +
        "2. Get your API keys from the Stripe Dashboard\n" +
        "3. Create products and prices in Stripe (monthly + annual)\n" +
        "4. Add STRIPE_SECRET_KEY to your environment variables\n" +
        "5. Create an API route at /api/checkout to create sessions\n\n" +
        "See the README for detailed setup instructions."
    );
  };

  return (
    <button
      onClick={handleCheckout}
      className="flex items-center justify-center rounded-full bg-gradient-to-r from-[var(--accent)] to-purple-500 px-6 py-4 font-medium text-white shadow-lg shadow-[var(--accent)]/25 hover:opacity-90 transition-all press-effect"
    >
      Upgrade to Pro
    </button>
  );
}
