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

    try {
      // Fetch profile and subscription in parallel
      const [profileResult, subResult] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", userId).single(),
        supabase.from("subscriptions").select("*").eq("user_id", userId).single(),
      ]);

      if (profileResult.data) {
        setProfile(profileResult.data);
      }

      if (subResult.data) {
        setSubscription(subResult.data);
        // Cache pro status for sync checks
        localStorage.setItem(
          "pdf-tools-pro-cached",
          subResult.data.plan === "pro" || subResult.data.plan === "team" ? "true" : "false"
        );
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
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

    // Safety timeout - ensure loading state resolves even if something hangs
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    const initAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await fetchUserData(session.user.id);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        clearTimeout(timeout);
        setIsLoading(false);
      }
    };

    initAuth();

    const {
      data: { subscription: authSubscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await fetchUserData(session.user.id);
        } else {
          setProfile(null);
          setSubscription(null);
          localStorage.removeItem("pdf-tools-pro-cached");
        }
      } catch (error) {
        console.error("Auth state change error:", error);
      } finally {
        setIsLoading(false);
      }
    });

    return () => {
      authSubscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase]);

  const signOut = async () => {
    // Always clear local state first
    setUser(null);
    setProfile(null);
    setSubscription(null);
    setSession(null);
    localStorage.removeItem("pdf-tools-pro-cached");

    // Then sign out from Supabase if available
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (error) {
        console.error("Error signing out:", error);
      }
    }

    // Force reload to ensure clean state
    window.location.href = "/";
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
