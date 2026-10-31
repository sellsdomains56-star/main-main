import { NextRequest, NextResponse } from "next/server";
import { activeProducts, getSettings } from "@/lib/store";
import { quote } from "@/lib/pricing";
import { estimateWindow } from "@/lib/delivery";
import { countryName } from "@/lib/countries";

// "Check delivery to your country" on the product page. One unit of one product, nothing about the shopper.
export async function GET(req: NextRequest) {
  const country = (req.nextUrl.searchParams.get("country") ?? "AE").toUpperCase();
  const productId = req.nextUrl.searchParams.get("productId") ?? "";
  const [products, settings] = await Promise.all([activeProducts(), getSettings()]);
  const p = products.find((x) => x.id === productId) ?? products[0];
  const q = quote({ products, lines: [{ productId: p.id, qty: 1 }], country, settings });
  const w = estimateWindow(settings, q.zone);
  return NextResponse.json({
    country, countryName: countryName(country), blocked: q.blocked, zone: q.zone.name,
    from: w.from.toISOString(), to: w.to.toISOString(),
    shipping: q.shipping, freeOver: q.zone.freeOver ?? null, uaeVatPct: country === "AE" ? settings.vatPct : 0,
    destTax: q.destTax, importEstimate: q.importEstimate,
  });
}
