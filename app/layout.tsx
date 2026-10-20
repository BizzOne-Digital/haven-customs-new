import type { Metadata, Viewport } from "next";
import { Anton, Inter, Oswald, Roboto_Condensed } from "next/font/google";
import "./globals.css";

// Display headings: Anton (italic is a synthesised slant). Service titles: Roboto Condensed.
// Card numbers: Oswald. UI and body: Inter.
const anton = Anton({ subsets: ["latin"], weight: "400", variable: "--font-anton", display: "swap" });
const robotoCondensed = Roboto_Condensed({ subsets: ["latin"], weight: ["700"], variable: "--font-roboto-condensed", display: "swap" });
const oswald = Oswald({ subsets: ["latin"], weight: ["500"], variable: "--font-oswald", display: "swap" });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-inter", display: "swap" });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Haven Customs | Tint, Protection & Custom Upgrades in Scarborough", template: "%s | Haven Customs" },
  description:
    "Window tint, paint protection, dashcams, CarPlay, lighting, exterior styling and tire services in Scarborough, ON.",
  icons: { icon: [{ url: "/favicon.svg", type: "image/svg+xml" }, { url: "/favicon.ico" }], apple: "/apple-touch-icon.png" },
  openGraph: { type: "website", siteName: "Haven Customs", locale: "en_CA" },
};

export const viewport: Viewport = { themeColor: "#ffffff" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${anton.variable} ${robotoCondensed.variable} ${oswald.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
