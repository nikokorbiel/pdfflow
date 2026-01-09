"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Camera,
  ArrowRight,
  Sparkles,
  Check,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";

const defaultAvatars = [
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=b6e3f4",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka&backgroundColor=c0aede",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Bella&backgroundColor=d1d4f9",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie&backgroundColor=ffd5dc",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Diego&backgroundColor=ffdfbf",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma&backgroundColor=c0f0e8",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Frank&backgroundColor=b6e3f4",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Grace&backgroundColor=c0aede",
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, profile, isLoading: authLoading, refreshUser } = useAuth();
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [customAvatar, setCustomAvatar] = useState<File | null>(null);
  const [customAvatarPreview, setCustomAvatarPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supabase = createClient();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
    }
    if (profile?.full_name) {
      setFullName(profile.full_name);
    }
  }, [authLoading, user, profile, router]);

  const handleCustomAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCustomAvatar(file);
      setSelectedAvatar(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectAvatar = (url: string) => {
    setSelectedAvatar(url);
    setCustomAvatar(null);
    setCustomAvatarPreview(null);
  };

  const uploadCustomAvatar = async (): Promise<string | null> => {
    if (!customAvatar || !user) return null;

    const fileExt = customAvatar.name.split(".").pop();
    const filePath = `${user.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, customAvatar, {
        upsert: true,
        cacheControl: '3600',
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      alert(`Upload failed: ${uploadError.message}`);
      return null;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleComplete = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      let avatarUrl = selectedAvatar;

      if (customAvatar) {
        const uploadedUrl = await uploadCustomAvatar();
        if (uploadedUrl) {
          avatarUrl = uploadedUrl;
        }
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          avatar_url: avatarUrl,
        })
        .eq("id", user.id);

      if (error) throw error;

      // Send welcome email (fire and forget)
      fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "welcome",
          email: user.email,
          name: fullName,
        }),
      }).catch(console.error);

      await refreshUser();
      router.push("/dashboard");
    } catch (error) {
      console.error("Error completing onboarding:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--accent)]" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg">
        {/* Background effects */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-gradient-to-br from-[var(--accent)] to-purple-500 rounded-full opacity-20 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-gradient-to-br from-pink-500 to-orange-500 rounded-full opacity-20 blur-3xl" />

        <div className="relative rounded-3xl border bg-[var(--card)] p-8 shadow-glass-lg animate-scale-in">
          {/* Progress indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className={`h-2 w-16 rounded-full transition-colors ${step >= 1 ? "bg-[var(--accent)]" : "bg-[var(--muted)]"}`} />
            <div className={`h-2 w-16 rounded-full transition-colors ${step >= 2 ? "bg-[var(--accent)]" : "bg-[var(--muted)]"}`} />
          </div>

          {step === 1 && (
            <div className="animate-fade-in">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--accent)] to-purple-500 mb-4 shadow-lg shadow-[var(--accent)]/25">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl font-semibold">Welcome to PDFflow!</h1>
                <p className="mt-2 text-[var(--muted-foreground)]">
                  Let&apos;s set up your profile
                </p>
              </div>

              {/* Name input */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  What should we call you?
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--muted-foreground)]" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-[var(--muted)] border-0 text-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                    placeholder="Your name"
                    autoFocus
                  />
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!fullName.trim()}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-[var(--accent)] text-white font-medium hover:opacity-90 transition-all disabled:opacity-50"
              >
                Continue
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="animate-fade-in">
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="text-2xl font-semibold">Choose your avatar</h1>
                <p className="mt-2 text-[var(--muted-foreground)]">
                  Pick one or upload your own
                </p>
              </div>

              {/* Custom upload */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  {customAvatarPreview ? (
                    <img
                      src={customAvatarPreview}
                      alt="Custom avatar"
                      className="h-24 w-24 rounded-full object-cover border-4 border-[var(--accent)]"
                    />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[var(--muted)] border-2 border-dashed border-[var(--border)]">
                      <Camera className="h-8 w-8 text-[var(--muted-foreground)]" />
                    </div>
                  )}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent)] text-white shadow-lg hover:opacity-90 transition-all"
                  >
                    <Camera className="h-5 w-5" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleCustomAvatarChange}
                    className="hidden"
                  />
                </div>
              </div>

              <p className="text-center text-sm text-[var(--muted-foreground)] mb-4">
                Or choose from these
              </p>

              {/* Default avatars */}
              <div className="grid grid-cols-4 gap-3 mb-8">
                {defaultAvatars.map((avatar, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectAvatar(avatar)}
                    className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all hover:scale-105 ${
                      selectedAvatar === avatar
                        ? "border-[var(--accent)] ring-2 ring-[var(--accent)]/50"
                        : "border-[var(--border)]"
                    }`}
                  >
                    <img
                      src={avatar}
                      alt={`Avatar ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {selectedAvatar === avatar && (
                      <div className="absolute inset-0 bg-[var(--accent)]/20 flex items-center justify-center">
                        <Check className="h-6 w-6 text-[var(--accent)]" />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-4 rounded-xl border-2 border-[var(--border)] font-medium hover:bg-[var(--muted)] transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handleComplete}
                  disabled={isLoading || (!selectedAvatar && !customAvatarPreview)}
                  className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl bg-[var(--accent)] text-white font-medium hover:opacity-90 transition-all disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      Complete
                      <Check className="h-5 w-5" />
                    </>
                  )}
                </button>
              </div>

              <button
                onClick={handleComplete}
                className="w-full mt-4 py-2 text-sm text-[var(--muted-foreground)] hover:text-foreground transition-colors"
              >
                Skip for now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
