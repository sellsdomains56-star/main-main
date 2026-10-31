import type { Product, Settings, ShippingZone } from "./types";
import { COUNTRY_LIST, DEFAULT_BLOCKED, type RegionId } from "./countries";

const now = () => new Date().toISOString();
const P = (slug: string, name: string, tagline: string, color: string, color2: string, price: number, featured = false, stock = 120): Product => ({
  id: slug, slug, name, tagline,
  description: `${name} is a soft, glossy balm that melts in and keeps lips plump, smooth and kissable all day. Non-sticky, lightly scented and made to live in your pocket.`,
  price, color, color2, images: [], stock, status: "active", featured,
  ingredients: "Shea butter, jojoba oil, beeswax, vitamin E, natural flavour.",
  size: "4.5 g", createdAt: now(),
});

// Courier transit in business days after dispatch (express courier, customs clearance not included). Planning estimates, not
// carrier quotes: confirm rates and times with your courier before launch (Admin → Launch checklist).
const ZONES: [RegionId, string, number, number | undefined, number, number][] = [
  ["uae", "United Arab Emirates", 15, 150, 1, 3],
  ["gcc", "GCC countries", 35, 300, 2, 5],
  ["mena", "Middle East, North Africa & Türkiye", 55, 400, 4, 8],
  ["europe", "Europe (EU, EFTA & neighbours)", 70, 450, 3, 7],
  ["uk", "United Kingdom & Crown Dependencies", 70, 450, 3, 7],
  ["na", "United States & Canada", 80, 500, 4, 8],
  ["southasia", "South Asia", 55, 400, 4, 8],
  ["eastasia", "East & South-East Asia", 65, 450, 4, 8],
  ["oceania", "Australia & New Zealand", 85, 500, 5, 10],
  ["central", "Eastern Europe, Caucasus & Central Asia", 75, 450, 5, 10],
  ["latam", "Latin America & Caribbean", 95, 500, 6, 12],
  ["africa", "Sub-Saharan Africa", 90, 500, 6, 12],
  ["remote", "Remote islands & territories", 120, 600, 8, 16],
];
export const defaultZones: ShippingZone[] = ZONES.map(([id, name, rate, freeOver, minDays, maxDays]) => ({
  id, name, rate, freeOver, minDays, maxDays, countries: COUNTRY_LIST.filter((c) => c.region === id).map((c) => c.code),
}));

export const defaultSettings: Settings = {
  id: "main", storeName: "Mwah", vatPct: 5, exportsZeroRated: true,
  zones: defaultZones, blockedCountries: DEFAULT_BLOCKED,
  processingMinDays: 1, processingMaxDays: 2,
  defaultCommissionPct: 15, defaultCustomerDiscountPct: 10, minPayout: 100, lowStockAt: 15,
  legal: { legalName: "", tradeLicenceNo: "", licensingAuthority: "", vatTrn: "", address: "", email: "", phone: "", jurisdiction: "Dubai" },
  confirmations: {},
};

export function seed() {
  return {
    products: [
      P("strawberry-kiss", "Strawberry Kiss", "Juicy, sweet, a little bit dangerous.", "#ff5d8f", "#ffb3c7", 29, true),
      P("vanilla-cloud", "Vanilla Cloud", "Soft like a cloud, sweet like a hug.", "#f5d6a1", "#fff1d6", 29, true),
      P("cherry-pop", "Cherry Pop", "Bold cherry colour-tint with a glossy pop.", "#d6124a", "#ff6b8e", 32, true),
      P("peach-fizz", "Peach Fizz", "Sun-ripened peach with a sparkle.", "#ff9a6b", "#ffd0b3", 29),
      P("coconut-dream", "Coconut Dream", "A holiday for your lips.", "#9ed8c8", "#e6fff7", 29, false, 12),
      P("rose-petal", "Rose Petal", "Pink-tinted, rosy and ultra-hydrating.", "#e86aa6", "#ffc6e0", 32, true),
      { ...P("mwah-set", "The Mwah Set", "All the flavours. Zero regrets. 4 balms.", "#ff3d81", "#cdb4ff", 99, true, 60), size: "4 × 4.5 g" },
    ],
    orders: [], discounts: [
      { id: "welcome10", code: "WELCOME10", type: "percent", value: 10, minSubtotal: 0, maxUses: 0, uses: 0, active: true, createdAt: now() },
    ],
    influencers: [], clicks: [], payouts: [], settings: [defaultSettings],
  };
}
