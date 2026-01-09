"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useMemo,
} from "react";
import { User, Session, SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
}

interface Subscription {
  plan: "free" | "pro" | "team";
  status: "active" | "canceled" | "past_due" | "trialing";
  current_period_end: string | null;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  subscription: Subscription | null;
  session: Session | null;
  isPro: boolean;
  isLoading: boolean;
  isConfigured: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Check if Supabase is configured
const isSupabaseConfigured = () => {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isConfigured = isSupabaseConfigured();

  const supabase = useMemo<SupabaseClient | null>(() => {
    if (!isConfigured) return null;
    try {
      return createClient();
    } catch {
      return null;
    }
  }, [isConfigured]);

  const fetchUserData = async (userId: string) => {
    if (!supabase) return;

    // Fetch profile
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (profileData) {
      setProfile(profileData);
    }

    // Fetch subscription
    const { data: subData } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (subData) {
      setSubscription(subData);
      // Cache pro status for sync checks
      localStorage.setItem(
        "pdf-tools-pro-cached",
        subData.plan === "pro" || subData.plan === "team" ? "true" : "false"
      );
    }
  };

  const refreshUser = async () => {
    if (!supabase) return;

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.user) {
      await fetchUserData(session.user.id);
    }
  };

  useEffect(() => {
    // If Supabase is not configured, just set loading to false
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    const initAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        await fetchUserData(session.user.id);
      }

      setIsLoading(false);
    };

    initAuth();

    const {
      data: { subscription: authSubscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        await fetchUserData(session.user.id);
      } else {
        setProfile(null);
        setSubscription(null);
        localStorage.removeItem("pdf-tools-pro-cached");
      }

      setIsLoading(false);
    });

    return () => {
      authSubscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase]);

  const signOut = async () => {
    if (!supabase) return;

    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSubscription(null);
    setSession(null);
    localStorage.removeItem("pdf-tools-pro-cached");
  };

  const isPro = subscription?.plan === "pro" || subscription?.plan === "team";

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        subscription,
        session,
        isPro,
        isLoading,
        isConfigured,
        signOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
