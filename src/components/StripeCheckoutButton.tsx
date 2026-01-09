"use client";

export function StripeCheckoutButton() {
  const handleCheckout = async () => {
    // This is a placeholder for Stripe integration
    // In production, this would call your API to create a Stripe Checkout session
    // Example:
    // const response = await fetch('/api/checkout', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ priceId: 'price_xxx' }),
    // });
    // const { url } = await response.json();
    // window.location.href = url;

    alert(
      "Stripe Checkout Integration\n\n" +
        "To enable payments:\n" +
        "1. Create a Stripe account at stripe.com\n" +
        "2. Get your API keys from the Stripe Dashboard\n" +
        "3. Create a product and price in Stripe\n" +
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
