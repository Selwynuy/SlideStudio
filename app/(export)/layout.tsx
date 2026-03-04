import type { Metadata } from "next";
import { Bebas_Neue, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "../globals.css";

const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-bebas-neue",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "Slide Export",
  robots: "noindex, nofollow", // Don't index export pages
};

/**
 * Minimal layout for export pages - no auth required.
 * These pages are token-protected instead, so Puppeteer can access them
 * without needing session cookies.
 * 
 * Note: We skip UserProvider and ProjectsProvider here since export pages
 * don't need auth context. The root layout still provides fonts/CSS.
 */
export default function ExportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Just render children - root layout provides html/body/fonts
  // We skip auth providers to avoid any redirects
  return <>{children}</>;
}
