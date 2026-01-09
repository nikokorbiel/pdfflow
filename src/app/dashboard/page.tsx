import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardContent } from "@/components/DashboardContent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Manage your PDFflow account and view your usage statistics.",
};

export default async function Dashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .single();

  const today = new Date().toISOString().split("T")[0];
  const { data: usage } = await supabase
    .from("usage")
    .select("*")
    .eq("user_id", user.id)
    .eq("date", today)
    .single();

  return (
    <DashboardContent
      profile={profile}
      subscription={subscription}
      usage={usage}
    />
  );
}
