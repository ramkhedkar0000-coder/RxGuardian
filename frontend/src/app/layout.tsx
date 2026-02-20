import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '@/context/AuthContext';

/**
 * Inter loaded via next/font (automatically optimized, no layout shift)
 * PADS §2 Typography — Inter as the primary sans-serif family
 */
const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "RXGuardians — AI-Powered Pharmacy Assistant",
  description:
    "Intelligent medication management, refill predictions, and AI-assisted ordering for patients and pharmacists.",
  keywords: ["pharmacy", "medication", "AI assistant", "refill", "prescription", "healthcare"],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      {/*
        inter.variable exposes the CSS variable --font-inter on <html>.
        globals.css references --font-inter via --font-sans fallback chain.
      */}
      <body style={{ fontFamily: "var(--font-inter, var(--font-sans))" }}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
