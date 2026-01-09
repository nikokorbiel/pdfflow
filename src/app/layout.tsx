import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { AuthModalProvider } from "@/contexts/AuthModalContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Background } from "@/components/Background";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
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
  openGraph: {
    type: "website",
    locale: "en_US",
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
        <link rel="apple-touch-icon" href="/icon.svg" />
        <meta name="theme-color" content="#0f172a" />
      </head>
      <body className={`${inter.variable} font-sans antialiased min-h-screen flex flex-col`}>
        <ThemeProvider>
          <AuthProvider>
            <AuthModalProvider>
              <Background />
              <Header />
              <main className="flex-1 relative z-10">{children}</main>
              <Footer />
            </AuthModalProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
