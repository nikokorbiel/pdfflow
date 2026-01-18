import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { AuthModalProvider } from "@/contexts/AuthModalContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { FileTrayProvider } from "@/contexts/FileTrayContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Background } from "@/components/Background";
import { FileTray } from "@/components/FileTray";
import { GlobalFeatures } from "@/components/GlobalFeatures";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const viewport: Viewport = {
  themeColor: "#0ea5e9",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://pdfflow.space"),
  title: {
    default: "PDFflow - PDF Tools That Just Flow",
    template: "%s | PDFflow",
  },
  description:
    "Fast, free, and secure PDF editing in your browser. Merge, split, compress, and convert PDFs with ease. All processing happens locally.",
  keywords: [
    "PDF tools",
    "merge PDF",
    "split PDF",
    "compress PDF",
    "PDF to image",
    "image to PDF",
    "free PDF tools",
    "online PDF editor",
  ],
  authors: [{ name: "PDFflow" }],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://pdfflow.space",
    siteName: "PDFflow",
    title: "PDFflow - PDF Tools That Just Flow",
    description:
      "Fast, free, and secure PDF editing in your browser. Merge, split, compress, and convert PDFs with ease.",
  },
  twitter: {
    card: "summary_large_image",
    title: "PDFflow - PDF Tools That Just Flow",
    description:
      "Fast, free, and secure PDF editing in your browser. Merge, split, compress, and convert PDFs with ease.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icons/icon.svg" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="PDFflow" />
      </head>
      <body className={`${inter.variable} font-sans antialiased min-h-screen flex flex-col`}>
        <ThemeProvider>
          <AuthProvider>
            <AuthModalProvider>
              <FileTrayProvider>
                <Background />
                <Header />
                <main className="flex-1 relative z-10">{children}</main>
                <Footer />
                <FileTray />
                <GlobalFeatures />
                <ServiceWorkerRegistration />
              </FileTrayProvider>
            </AuthModalProvider>
          </AuthProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
