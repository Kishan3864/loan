import type { Metadata, Viewport } from "next";
import "./globals.css";
import { PWARegister } from "@/components/PWARegister";
import { SplashGate } from "@/components/SplashGate";

export const metadata: Metadata = {
  title: "EMI Dashboard — Debt & Repayment Analytics",
  description: "A detailed personal EMI, debt and repayment analytics dashboard.",
  manifest: "/manifest.json",
  applicationName: "EMI Dashboard",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "EMI Dashboard",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="apple-touch-startup-image" href="/icons/splash.png" />
      </head>
      <body>
        <PWARegister />
        <SplashGate>{children}</SplashGate>
      </body>
    </html>
  );
}
