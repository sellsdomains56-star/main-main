import type { MetadataRoute } from "next";
import { activeProducts } from "@/lib/store";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.SITE_URL ?? "http://localhost:3000";
  const fixed = ["", "/shop", "/about", "/faq", "/delivery-times", "/shipping", "/returns", "/terms", "/privacy", "/cookies", "/influencers", "/creator-terms"];
  const products = await activeProducts();
  return [...fixed.map((p) => ({ url: base + p })), ...products.map((p) => ({ url: `${base}/product/${p.slug}`, lastModified: p.createdAt }))];
}
