"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthModal } from "@/contexts/AuthModalContext";
import { Loader2 } from "lucide-react";

interface StripeCheckoutButtonProps {
  isLifetime?: boolean;
}

export function StripeCheckoutButton({ isLifetime = true }: StripeCheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { openAuthModal } = useAuthModal();

  const handleCheckout = async () => {
    // If not logged in, prompt to sign up
    if (!user) {
      openAuthModal("signup");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceType: isLifetime ? "lifetime" : "monthly",
        }),
      });

      const data = await response.json();

      if (data.error) {
        alert(data.error);
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={isLoading}
      className="flex items-center justify-center rounded-full bg-gradient-to-r from-[#0ea5e9] to-purple-500 px-6 py-4 font-medium text-white shadow-lg shadow-[#0ea5e9]/25 hover:opacity-90 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {isLoading ? (
        <>
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          Loading...
        </>
      ) : isLifetime ? (
        "Get Lifetime Access"
      ) : (
        "Subscribe Monthly"
      )}
    </button>
  );
}
