import type { Metadata, Viewport } from "next";
import "./globals.css";
import { CartProvider } from "@/components/Cart";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HideInAdmin } from "@/components/HideInAdmin";
import { CookieConsent } from "@/components/CookieConsent";
import { LocaleProvider } from "@/components/Locale";
import { COUNTRIES } from "@/lib/countries";
import { getSettings } from "@/lib/store";

export const dynamic = "force-dynamic"; // shop data changes from the admin panel, so never cache pages

const site = process.env.SITE_URL ?? "http://localhost:3000";
const title = "Mwah: lip balm you'll want to kiss";
const description = "Glossy, comfortable lip balms in flavours like Strawberry Kiss, Vanilla Cloud and Cherry Pop. Shipping from the UAE to the GCC and worldwide.";
export const metadata: Metadata = {
  metadataBase: new URL(site),
  title: { default: title, template: "%s · Mwah" },
  description,
  openGraph: { type: "website", siteName: "Mwah", title, description, url: site },
  twitter: { card: "summary_large_image", title, description },
  alternates: { canonical: "/" },
};
export const viewport: Viewport = { themeColor: "#fff6ee" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { currencies, blockedCountries, legal } = await getSettings();
  const countries = COUNTRIES.filter(([c]) => !blockedCountries.includes(c));
  const org = { "@context": "https://schema.org", "@type": "Organization", name: "Mwah", url: site, ...(legal.legalName && { legalName: legal.legalName }), ...(legal.email && { email: legal.email }), ...(legal.phone && { telephone: legal.phone }), areaServed: "Worldwide" };
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,800&family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(org) }} />
      </head>
      <body>
        <LocaleProvider rates={currencies} allowed={countries.map(([c]) => c)}>
          <CartProvider>
            <Header countries={countries} />
            <main>{children}</main>
            <HideInAdmin><Footer /><CookieConsent /></HideInAdmin>
          </CartProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
