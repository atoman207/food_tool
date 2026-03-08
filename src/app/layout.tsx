import type { Metadata } from "next";
import { Providers } from "@/components/Providers";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://fbportal.sg";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Singapore F&B Portal | The Kitchen Connection",
    template: "%s | Singapore F&B Portal",
  },
  description:
    "Singapore's premier F&B supplier discovery platform. Connect restaurants, chefs, and trusted food suppliers. Browse the marketplace, read industry news, and source certified suppliers.",
  keywords: [
    "Singapore F&B",
    "food supplier Singapore",
    "restaurant supplier",
    "chef marketplace Singapore",
    "Singapore food industry",
    "halal supplier Singapore",
    "F&B portal",
  ],
  robots: { index: true, follow: true },
  openGraph: {
    title: "Singapore F&B Portal | The Kitchen Connection",
    description:
      "Singapore's premier F&B supplier discovery platform. Connect restaurants, chefs, and trusted food suppliers.",
    type: "website",
    url: siteUrl,
    siteName: "Singapore F&B Portal",
    locale: "en_SG",
  },
  twitter: {
    card: "summary_large_image",
    title: "Singapore F&B Portal | The Kitchen Connection",
    description:
      "Singapore's premier F&B supplier discovery platform. Connect restaurants, chefs, and trusted food suppliers.",
  },
  alternates: {
    canonical: siteUrl,
    languages: {
      "en-SG": siteUrl,
      ja: `${siteUrl}?lang=ja`,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
