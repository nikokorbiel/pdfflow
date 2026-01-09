import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const error_description = searchParams.get("error_description");
  const next = searchParams.get("next") ?? "/";

  // Handle OAuth errors from provider
  if (error_description) {
    console.error("OAuth error:", error_description);
    return NextResponse.redirect(`${origin}/?auth_error=${encodeURIComponent(error_description)}`);
  }

  if (code) {
    const supabase = await createClient();
    const { error, data } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("Session exchange error:", error.message);
      return NextResponse.redirect(`${origin}/?auth_error=${encodeURIComponent(error.message)}`);
    }

    if (data.user) {
      // Check if user has completed onboarding (has a name set)
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", data.user.id)
        .single();

      // If no name, redirect to onboarding
      if (!profile?.full_name) {
        return NextResponse.redirect(`${origin}/onboarding`);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Return to homepage on error
  return NextResponse.redirect(`${origin}/?auth_error=no_code`);
}
