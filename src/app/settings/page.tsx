"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Camera,
  Save,
  Trash2,
  Shield,
  Bell,
  Palette,
  Crown,
  Check,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function SettingsPage() {
  const router = useRouter();
  const { user, profile, subscription, isPro, isLoading: authLoading, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Profile form state
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supabase = createClient();

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setAvatarUrl(profile.avatar_url || "");
    }
  }, [profile]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
    }
  }, [authLoading, user, router]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatarFile || !user) return avatarUrl;

    const fileExt = avatarFile.name.split(".").pop();
    const filePath = `${user.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, avatarFile, {
        upsert: true,
        cacheControl: '3600',
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      setMessage({ type: "error", text: `Upload failed: ${uploadError.message}` });
      return null;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsLoading(true);
    setMessage(null);

    try {
      let newAvatarUrl = avatarUrl;

      if (avatarFile) {
        const uploadedUrl = await uploadAvatar();
        if (uploadedUrl) {
          newAvatarUrl = uploadedUrl;
        }
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          avatar_url: newAvatarUrl,
        })
        .eq("id", user.id);

      if (error) throw error;

      await refreshUser();
      setMessage({ type: "success", text: "Profile updated successfully!" });
      setAvatarFile(null);
      setAvatarPreview(null);
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage({ type: "error", text: "Failed to update profile. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      return;
    }
    // Account deletion would require server-side implementation
    setMessage({ type: "error", text: "Please contact support to delete your account." });
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

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "account", label: "Account", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "appearance", label: "Appearance", icon: Palette },
  ];

  return (
    <div className="min-h-[80vh]">
      <div className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-r from-[var(--accent)]/20 to-purple-500/20 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 animate-fade-in-up">
            <h1 className="text-3xl font-semibold">Settings</h1>
            <p className="mt-2 text-[var(--muted-foreground)]">
              Manage your account settings and preferences
            </p>
          </div>

          {/* Message */}
          {message && (
            <div
              className={`mb-6 p-4 rounded-2xl flex items-center gap-3 animate-fade-in ${
                message.type === "success"
                  ? "bg-green-500/10 text-green-500 border border-green-500/20"
                  : "bg-red-500/10 text-red-500 border border-red-500/20"
              }`}
            >
              {message.type === "success" ? (
                <Check className="h-5 w-5" />
              ) : (
                <AlertCircle className="h-5 w-5" />
              )}
              {message.text}
            </div>
          )}

          <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
            {/* Sidebar */}
            <nav className="space-y-1 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? "bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent)]/25"
                      : "hover:bg-[var(--muted)] text-[var(--muted-foreground)]"
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  {tab.label}
                </button>
              ))}
            </nav>

            {/* Content */}
            <div className="animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              {activeTab === "profile" && (
                <div className="rounded-3xl border bg-[var(--card)] p-6 sm:p-8">
                  <h2 className="text-xl font-semibold mb-6">Profile Information</h2>

                  {/* Avatar */}
                  <div className="flex items-center gap-6 mb-8">
                    <div className="relative">
                      {avatarPreview || avatarUrl ? (
                        <img
                          src={avatarPreview || avatarUrl}
                          alt="Avatar"
                          className="h-24 w-24 rounded-full object-cover border-4 border-[var(--border)]"
                        />
                      ) : (
                        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[var(--accent)] to-purple-500">
                          <User className="h-12 w-12 text-white" />
                        </div>
                      )}
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent)] text-white shadow-lg hover:opacity-90 transition-all"
                      >
                        <Camera className="h-4 w-4" />
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </div>
                    <div>
                      <p className="font-medium">Profile Photo</p>
                      <p className="text-sm text-[var(--muted-foreground)]">
                        JPG, PNG or GIF. Max 2MB.
                      </p>
                    </div>
                  </div>

                  {/* Form */}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--muted-foreground)]" />
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full pl-12 pr-4 py-3 rounded-xl bg-[var(--muted)] border-0 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                          placeholder="Your name"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--muted-foreground)]" />
                        <input
                          type="email"
                          value={user.email || ""}
                          disabled
                          className="w-full pl-12 pr-4 py-3 rounded-xl bg-[var(--muted)] border-0 opacity-60 cursor-not-allowed"
                        />
                      </div>
                      <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                        Email cannot be changed
                      </p>
                    </div>

                    <button
                      onClick={handleSaveProfile}
                      disabled={isLoading}
                      className="flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--accent)] text-white font-medium hover:opacity-90 transition-all disabled:opacity-50"
                    >
                      {isLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Save className="h-5 w-5" />
                      )}
                      Save Changes
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "account" && (
                <div className="space-y-6">
                  {/* Subscription */}
                  <div className="rounded-3xl border bg-[var(--card)] p-6 sm:p-8">
                    <h2 className="text-xl font-semibold mb-6">Subscription</h2>
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-[var(--muted)]">
                      <div className="flex items-center gap-4">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${isPro ? "bg-gradient-to-br from-yellow-400 to-orange-500" : "bg-gradient-to-br from-[var(--accent)] to-purple-500"}`}>
                          <Crown className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold capitalize">{subscription?.plan || "Free"} Plan</p>
                          <p className="text-sm text-[var(--muted-foreground)]">
                            {isPro ? "Unlimited access to all features" : "2 files per day, 10MB max"}
                          </p>
                        </div>
                      </div>
                      {!isPro && (
                        <Link
                          href="/pricing"
                          className="px-4 py-2 rounded-full bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90 transition-all"
                        >
                          Upgrade
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div className="rounded-3xl border border-red-500/20 bg-[var(--card)] p-6 sm:p-8">
                    <h2 className="text-xl font-semibold text-red-500 mb-4">Danger Zone</h2>
                    <p className="text-[var(--muted-foreground)] mb-6">
                      Once you delete your account, there is no going back. Please be certain.
                    </p>
                    <button
                      onClick={handleDeleteAccount}
                      className="flex items-center gap-2 px-6 py-3 rounded-full border-2 border-red-500 text-red-500 font-medium hover:bg-red-500/10 transition-all"
                    >
                      <Trash2 className="h-5 w-5" />
                      Delete Account
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "notifications" && (
                <div className="rounded-3xl border bg-[var(--card)] p-6 sm:p-8">
                  <h2 className="text-xl font-semibold mb-6">Notification Preferences</h2>
                  <div className="space-y-4">
                    {[
                      { label: "Email notifications", description: "Receive updates about your account" },
                      { label: "Product updates", description: "New features and improvements" },
                      { label: "Marketing emails", description: "Tips, offers, and promotions" },
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-4 rounded-2xl bg-[var(--muted)]">
                        <div>
                          <p className="font-medium">{item.label}</p>
                          <p className="text-sm text-[var(--muted-foreground)]">{item.description}</p>
                        </div>
                        <label className="relative inline-flex cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked={index === 0} />
                          <div className="w-11 h-6 bg-[var(--border)] peer-checked:bg-[var(--accent)] rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "appearance" && (
                <div className="rounded-3xl border bg-[var(--card)] p-6 sm:p-8">
                  <h2 className="text-xl font-semibold mb-6">Appearance</h2>
                  <p className="text-[var(--muted-foreground)] mb-6">
                    Customize how PDFflow looks on your device. You can toggle between light and dark mode using the sun/moon icon in the header.
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="p-6 rounded-2xl border-2 border-[var(--border)] bg-white text-gray-900 cursor-pointer hover:border-[var(--accent)] transition-all">
                      <div className="h-20 mb-4 rounded-xl bg-gray-100 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-lg bg-blue-500"></div>
                      </div>
                      <p className="font-medium">Light Mode</p>
                    </div>
                    <div className="p-6 rounded-2xl border-2 border-[var(--border)] bg-gray-900 text-white cursor-pointer hover:border-[var(--accent)] transition-all">
                      <div className="h-20 mb-4 rounded-xl bg-gray-800 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-lg bg-blue-500"></div>
                      </div>
                      <p className="font-medium">Dark Mode</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
