import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/components/Cart";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HideInAdmin } from "@/components/HideInAdmin";

export const dynamic = "force-dynamic"; // shop data changes from the admin panel, so never cache pages

export const metadata: Metadata = {
  title: { default: "Mwah — lip balm you'll want to kiss", template: "%s · Mwah" },
  description: "Glossy, hydrating lip balms in dreamy flavours. Made in the UAE, shipped worldwide.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,800&family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <CartProvider><Header /><main>{children}</main><HideInAdmin><Footer /></HideInAdmin></CartProvider>
      </body>
    </html>
  );
}
