import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import Stripe from "stripe";

// Lazy initialization for supabase admin client
let supabaseAdminInstance: SupabaseClient | null = null;

function getSupabaseAdmin(): SupabaseClient {
  if (!supabaseAdminInstance) {
    supabaseAdminInstance = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return supabaseAdminInstance;
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        if (userId) {
          // Update stripe_customer_id in profiles table
          await getSupabaseAdmin()
            .from("profiles")
            .update({ stripe_customer_id: customerId })
            .eq("id", userId);

          // Upsert subscription in subscriptions table
          await getSupabaseAdmin()
            .from("subscriptions")
            .upsert({
              user_id: userId,
              plan: "pro",
              status: "active",
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
              current_period_end: null, // Will be set by subscription.updated event
            }, { onConflict: "user_id" });
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Find user by stripe_customer_id in profiles
        const { data: profile } = await getSupabaseAdmin()
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (profile) {
          const status = subscription.status;
          const plan = status === "active" ? "pro" : "free";
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const periodEndTimestamp = (subscription as any).current_period_end;
          const periodEnd = periodEndTimestamp
            ? new Date(periodEndTimestamp * 1000).toISOString()
            : null;

          // Update subscriptions table
          await getSupabaseAdmin()
            .from("subscriptions")
            .upsert({
              user_id: profile.id,
              plan,
              status: status as "active" | "canceled" | "past_due" | "trialing",
              stripe_customer_id: customerId,
              stripe_subscription_id: subscription.id,
              current_period_end: periodEnd,
            }, { onConflict: "user_id" });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Find user by stripe_customer_id
        const { data: profile } = await getSupabaseAdmin()
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (profile) {
          // Update subscription to free/canceled
          await getSupabaseAdmin()
            .from("subscriptions")
            .upsert({
              user_id: profile.id,
              plan: "free",
              status: "canceled",
              stripe_customer_id: customerId,
              stripe_subscription_id: null,
              current_period_end: null,
            }, { onConflict: "user_id" });
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        // Find user and update subscription status
        const { data: profile } = await getSupabaseAdmin()
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (profile) {
          await getSupabaseAdmin()
            .from("subscriptions")
            .update({ status: "past_due" })
            .eq("user_id", profile.id);
        }

        console.log(`Payment failed for customer: ${customerId}`);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
