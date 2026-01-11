"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Menu,
  X,
  ChevronDown,
  User,
  LogOut,
  LayoutDashboard,
  Crown,
  Settings,
  Combine,
  Split,
  FileDown,
  Image,
  FileImage,
  RotateCw,
  Droplets,
  FileText,
  ArrowUpDown,
  PenTool,
  Lock,
  Unlock,
  FolderOpen,
  RefreshCw,
  Pencil,
  Shield,
  Sparkles,
  Table,
  Presentation,
  Code,
  Crop,
  Trash2,
  ImageIcon,
  EyeOff,
  Wrench,
  Hash,
  Layers,
  FileCheck,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthModal } from "@/contexts/AuthModalContext";
import { PDFflowLogo } from "./Logo";

const toolCategories = [
  {
    name: "Organize",
    icon: FolderOpen,
    tools: [
      { name: "Merge PDF", href: "/merge", description: "Combine multiple PDFs", icon: Combine },
      { name: "Split PDF", href: "/split", description: "Extract or divide pages", icon: Split },
      { name: "Reorder Pages", href: "/reorder", description: "Drag & drop to rearrange", icon: ArrowUpDown },
      { name: "Delete Pages", href: "/delete-pages", description: "Remove unwanted pages", icon: Trash2 },
      { name: "Page Numbers", href: "/page-numbers", description: "Add page numbering", icon: Hash },
    ],
  },
  {
    name: "Export",
    icon: RefreshCw,
    tools: [
      { name: "PDF to Image", href: "/pdf-to-image", description: "Convert to PNG/JPG", icon: Image },
      { name: "PDF to Word", href: "/pdf-to-word", description: "Convert to DOCX", icon: FileText },
      { name: "PDF to Excel", href: "/pdf-to-excel", description: "Extract to spreadsheet", icon: Table },
      { name: "PDF to PPT", href: "/pdf-to-powerpoint", description: "Convert to slides", icon: Presentation },
      { name: "Extract Images", href: "/extract-images", description: "Pull images out", icon: ImageIcon },
    ],
  },
  {
    name: "Create",
    icon: FileImage,
    tools: [
      { name: "Image to PDF", href: "/image-to-pdf", description: "Images to PDF", icon: FileImage },
      { name: "Word to PDF", href: "/word-to-pdf", description: "DOCX to PDF", icon: FileText },
      { name: "Excel to PDF", href: "/excel-to-pdf", description: "Spreadsheets to PDF", icon: Table },
      { name: "PPT to PDF", href: "/powerpoint-to-pdf", description: "Slides to PDF", icon: Presentation },
      { name: "HTML to PDF", href: "/html-to-pdf", description: "Web page to PDF", icon: Code },
    ],
  },
  {
    name: "Edit",
    icon: Pencil,
    tools: [
      { name: "Compress", href: "/compress", description: "Reduce file size", icon: FileDown },
      { name: "Rotate PDF", href: "/rotate", description: "Rotate pages", icon: RotateCw },
      { name: "Crop PDF", href: "/crop", description: "Trim pages", icon: Crop },
      { name: "Watermark", href: "/watermark", description: "Add watermarks", icon: Droplets },
      { name: "Sign PDF", href: "/sign", description: "Add signatures", icon: PenTool },
      { name: "Flatten PDF", href: "/flatten", description: "Flatten forms", icon: Layers },
    ],
  },
  {
    name: "Security",
    icon: Shield,
    tools: [
      { name: "Protect PDF", href: "/protect", description: "Add password", icon: Lock },
      { name: "Unlock PDF", href: "/unlock", description: "Remove password", icon: Unlock },
      { name: "Redact PDF", href: "/redact", description: "Hide sensitive info", icon: EyeOff },
      { name: "Repair PDF", href: "/repair", description: "Fix corrupted files", icon: Wrench },
      { name: "PDF to PDF/A", href: "/pdf-to-pdfa", description: "Archival format", icon: FileCheck },
    ],
  },
];

// Flat list for mobile menu

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { user, profile, isPro, isLoading, signOut } = useAuth();
  const { openAuthModal } = useAuthModal();

  const getAvatarUrl = (url: string | null | undefined) => {
    if (!url) return null;
    if (url.includes("supabase")) {
      const separator = url.includes("?") ? "&" : "?";
      return `${url}${separator}t=${Date.now()}`;
    }
    return url;
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setUserMenuOpen(false);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "py-2 bg-black/80 backdrop-blur-xl border-b border-[#1e293b]"
            : "py-4 bg-transparent"
        }`}
      >
        <nav className="mx-auto flex max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          {/* Left side - Logo + Navigation */}
          <div className="flex items-center gap-1">
            {/* Logo */}
            <Link href="/" className="flex items-center group mr-6">
              <PDFflowLogo size={32} withWordmark />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex lg:items-center lg:gap-1">
              {/* Tools Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setToolsOpen(true)}
                onMouseLeave={() => setToolsOpen(false)}
              >
                <button className="flex items-center gap-1 px-4 py-2 text-sm text-[#94a3b8] hover:text-white hover:bg-[#1e293b] rounded-lg transition-colors">
                  Tools
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${toolsOpen ? "rotate-180" : ""}`} />
                </button>

                {toolsOpen && (
                  <div className="absolute top-full left-0 mt-2 w-[880px] p-6 rounded-2xl bg-[#0a0a0f] border border-[#1e293b] shadow-2xl">
                    <div className="absolute -top-[6px] left-8 w-3 h-3 rotate-45 bg-[#0a0a0f] border-l border-t border-[#1e293b]" />

                    <div className="grid grid-cols-5 gap-5">
                      {toolCategories.map((category) => (
                        <div key={category.name}>
                          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#1e293b]">
                            <category.icon className="w-4 h-4 text-[#0ea5e9]" />
                            <span className="text-xs font-semibold text-[#64748b] uppercase tracking-wider">
                              {category.name}
                            </span>
                          </div>
                          <div className="space-y-1">
                            {category.tools.map((tool) => (
                              <Link
                                key={tool.name}
                                href={tool.href}
                                className="flex items-center gap-2.5 p-2.5 rounded-lg text-[#94a3b8] hover:text-white hover:bg-[#1e293b] transition-colors group"
                                onClick={() => setToolsOpen(false)}
                              >
                                <tool.icon className="w-4 h-4 text-[#475569] group-hover:text-[#0ea5e9] transition-colors" />
                                <div>
                                  <span className="text-sm font-medium text-white block leading-tight">{tool.name}</span>
                                  <span className="text-[11px] text-[#64748b] leading-tight">{tool.description}</span>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Link href="/pricing" className="px-4 py-2 text-sm text-[#94a3b8] hover:text-white hover:bg-[#1e293b] rounded-lg transition-colors">
                Pricing
              </Link>

              <Link href="/blog" className="px-4 py-2 text-sm text-[#94a3b8] hover:text-white hover:bg-[#1e293b] rounded-lg transition-colors">
                Blog
              </Link>

              <Link href="/changelog" className="px-4 py-2 text-sm text-[#94a3b8] hover:text-white hover:bg-[#1e293b] rounded-lg transition-colors">
                Changelog
              </Link>
            </div>
          </div>

          {/* Right side - spacer + auth */}
          <div className="flex-1" />

          <div className="flex items-center gap-3">
            {isLoading ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-20 h-9 rounded-lg bg-[#1e293b] animate-pulse" />
              </div>
            ) : user ? (
              <div
                className="relative"
                onMouseLeave={() => setUserMenuOpen(false)}
              >
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#1e293b] transition-colors"
                >
                  {getAvatarUrl(profile?.avatar_url) ? (
                    <img
                      src={getAvatarUrl(profile?.avatar_url)!}
                      alt=""
                      className="h-8 w-8 rounded-md object-cover ring-2 ring-[#0ea5e9]/30"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-[#0ea5e9] to-[#06b6d4]">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  )}
                  {isPro && (
                    <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                      PRO
                    </span>
                  )}
                  <ChevronDown className={`w-4 h-4 text-[#94a3b8] transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full pt-2 w-64">
                    <div className="p-2 rounded-xl bg-[#0a0a0f] border border-[#1e293b] shadow-2xl">
                    <div className="px-3 py-3 border-b border-[#1e293b] mb-2">
                      <p className="font-medium text-sm truncate text-white">{profile?.full_name || "User"}</p>
                      <p className="text-xs text-[#64748b] truncate">{profile?.email || user.email}</p>
                    </div>
                    <Link href="/dashboard" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg hover:bg-[#1e293b] text-[#94a3b8] hover:text-white transition-colors">
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Link>
                    <Link href="/workflow" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg hover:bg-[#1e293b] text-[#94a3b8] hover:text-white transition-colors">
                      <ArrowUpDown className="h-4 w-4" />
                      Workflow Builder
                    </Link>
                    <Link href="/settings" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg hover:bg-[#1e293b] text-[#94a3b8] hover:text-white transition-colors">
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>
                    <div className="h-px bg-[#1e293b] my-2" />
                    <Link href="/changelog" onClick={() => setUserMenuOpen(false)} className="flex items-center justify-between px-3 py-2.5 text-sm rounded-lg hover:bg-[#1e293b] text-[#94a3b8] hover:text-white transition-colors">
                      <span className="flex items-center gap-3">
                        <Sparkles className="h-4 w-4" />
                        What&apos;s New
                      </span>
                      <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-[#0ea5e9] text-white">v1.4</span>
                    </Link>
                    {!isPro && (
                      <>
                        <div className="h-px bg-[#1e293b] my-2" />
                        <Link href="/pricing" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg hover:bg-[#1e293b] text-[#0ea5e9] transition-colors">
                          <Crown className="h-4 w-4" />
                          Upgrade to Pro
                        </Link>
                      </>
                    )}
                    <div className="h-px bg-[#1e293b] my-2" />
                    <Link href="/privacy" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg hover:bg-[#1e293b] text-[#94a3b8] hover:text-white transition-colors">
                      <Shield className="h-4 w-4" />
                      Privacy Policy
                    </Link>
                    <Link href="/terms" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg hover:bg-[#1e293b] text-[#94a3b8] hover:text-white transition-colors">
                      <FileText className="h-4 w-4" />
                      Terms of Service
                    </Link>
                    <div className="h-px bg-[#1e293b] my-2" />
                    <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg hover:bg-[#1e293b] text-[#ef4444] transition-colors">
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => openAuthModal("signin")}
                  className="hidden sm:block px-4 py-2 text-sm font-medium text-[#94a3b8] hover:text-white transition-colors"
                >
                  Log in
                </button>
                <button
                  onClick={() => openAuthModal("signup")}
                  className="px-3 sm:px-4 py-2 text-sm font-medium bg-white text-black rounded-lg hover:opacity-90 transition-colors"
                >
                  Sign Up
                </button>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              type="button"
              className="lg:hidden p-2 rounded-lg hover:bg-[#1e293b] transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </nav>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden px-4 py-6 mt-2 mx-4 rounded-xl bg-[#0a0a0f] border border-[#1e293b] max-h-[80vh] overflow-y-auto">
            {user && (
              <>
                <div className="flex items-center gap-3 px-4 py-3 mb-4 rounded-xl bg-[#1e293b]">
                  {getAvatarUrl(profile?.avatar_url) ? (
                    <img src={getAvatarUrl(profile?.avatar_url)!} alt="" className="h-10 w-10 rounded-lg object-cover" />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#0ea5e9] to-[#06b6d4]">
                      <User className="h-5 w-5 text-white" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{profile?.full_name || "User"}</p>
                    <p className="text-xs text-[#64748b] truncate">{profile?.email || user.email}</p>
                  </div>
                  {isPro && (
                    <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-gradient-to-r from-amber-500 to-orange-500 text-white">PRO</span>
                  )}
                </div>
                <div className="h-px bg-[#1e293b] mb-4" />
              </>
            )}

            {/* Mobile Tools by Category */}
            {toolCategories.map((category) => (
              <div key={category.name} className="mb-4">
                <div className="flex items-center gap-2 px-4 py-2">
                  <category.icon className="w-4 h-4 text-[#0ea5e9]" />
                  <span className="text-xs font-semibold text-[#64748b] uppercase tracking-wider">{category.name}</span>
                </div>
                {category.tools.map((tool) => (
                  <Link
                    key={tool.name}
                    href={tool.href}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#1e293b] transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <tool.icon className="w-5 h-5 text-[#64748b]" />
                    <div>
                      <span className="text-sm font-medium">{tool.name}</span>
                      <span className="block text-xs text-[#64748b]">{tool.description}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ))}

            <div className="h-px bg-[#1e293b] my-4" />
            <Link href="/pricing" className="block px-4 py-3 text-sm font-medium rounded-xl hover:bg-[#1e293b] transition-colors" onClick={() => setMobileMenuOpen(false)}>
              Pricing
            </Link>
            <Link href="/blog" className="block px-4 py-3 text-sm font-medium rounded-xl hover:bg-[#1e293b] transition-colors" onClick={() => setMobileMenuOpen(false)}>
              Blog
            </Link>
            <Link href="/changelog" className="block px-4 py-3 text-sm font-medium rounded-xl hover:bg-[#1e293b] transition-colors" onClick={() => setMobileMenuOpen(false)}>
              Changelog
            </Link>

            {user && (
              <>
                <Link href="/dashboard" className="block px-4 py-3 text-sm font-medium rounded-xl hover:bg-[#1e293b] transition-colors" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
                <Link href="/settings" className="block px-4 py-3 text-sm font-medium rounded-xl hover:bg-[#1e293b] transition-colors" onClick={() => setMobileMenuOpen(false)}>Settings</Link>
              </>
            )}

            <div className="pt-4 space-y-2">
              {user ? (
                <button onClick={() => { setMobileMenuOpen(false); handleSignOut(); }} className="w-full py-3 text-sm font-medium text-[#ef4444] rounded-xl border border-[#ef4444]/20 hover:bg-[#ef4444]/10 transition-colors">
                  Sign out
                </button>
              ) : (
                <>
                  <button onClick={() => { setMobileMenuOpen(false); openAuthModal("signin"); }} className="w-full py-3 text-sm font-medium text-white rounded-xl border border-[#1e293b] hover:bg-[#1e293b] transition-colors">
                    Log in
                  </button>
                  <button onClick={() => { setMobileMenuOpen(false); openAuthModal("signup"); }} className="w-full py-3 text-sm font-medium bg-white text-black rounded-xl hover:bg-gray-200 transition-colors">
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <div className="h-16" />
    </>
  );
}
