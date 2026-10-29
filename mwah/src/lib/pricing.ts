import type { Discount, Influencer, OrderItem, Product, Settings, ShippingZone } from "./types";
import { r2 } from "./money";

export function zoneFor(s: Settings, country: string): ShippingZone {
  return s.zones.find((z) => z.countries.includes(country)) ?? s.zones.find((z) => z.countries.includes("*")) ?? s.zones[s.zones.length - 1];
}

export type Quote = {
  items: OrderItem[]; subtotal: number; discount: number; shipping: number; vat: number; total: number;
  zone: ShippingZone; discountLabel?: string; free: boolean;
};

/** Prices are VAT-inclusive. Orders shipped outside the UAE are treated as zero-rated exports (VAT removed) when enabled. */
export function quote(opts: {
  products: Product[]; lines: { productId: string; qty: number }[]; country: string; settings: Settings;
  discount?: Discount | null; influencer?: Influencer | null;
}): Quote {
  const { products, lines, country, settings: s } = opts;
  const items: OrderItem[] = [];
  for (const l of lines) {
    const p = products.find((x) => x.id === l.productId && x.status === "active");
    const qty = Math.max(0, Math.min(Math.floor(l.qty), p?.stock ?? 0, 20));
    if (p && qty > 0) items.push({ productId: p.id, name: p.name, qty, price: p.price });
  }
  const gross = r2(items.reduce((t, i) => t + i.price * i.qty, 0));
  const zone = zoneFor(s, country);

  let discount = 0, discountLabel: string | undefined;
  const d = opts.discount;
  if (d && d.active && gross >= d.minSubtotal && (!d.expiresAt || new Date(d.expiresAt) > new Date()) && (d.maxUses === 0 || d.uses < d.maxUses)) {
    discount = d.type === "percent" ? gross * d.value / 100 : Math.min(d.value, gross);
    discountLabel = d.code;
  }
  const inf = opts.influencer;
  if (inf && inf.status === "active") {
    const infDisc = gross * inf.customerDiscountPct / 100;
    if (infDisc > discount) { discount = infDisc; discountLabel = `${inf.code} (creator)`; } // codes never stack: best one wins
  }
  discount = r2(Math.min(discount, gross));
  const afterDiscount = r2(gross - discount);

  const free = zone.freeOver !== undefined && gross >= zone.freeOver;
  const shipping = items.length === 0 || free ? 0 : zone.rate;

  const exportZero = s.exportsZeroRated && country !== "AE";
  const net = exportZero ? r2(afterDiscount / (1 + s.vatPct / 100)) : afterDiscount;
  const vat = exportZero ? 0 : r2(afterDiscount * s.vatPct / (100 + s.vatPct));
  return { items, subtotal: gross, discount, shipping, vat, total: r2(net + shipping), zone, discountLabel, free };
}
