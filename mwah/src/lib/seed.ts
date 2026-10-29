import type { Product, Settings } from "./types";

const now = () => new Date().toISOString();
const P = (slug: string, name: string, tagline: string, color: string, color2: string, price: number, featured = false, stock = 120): Product => ({
  id: slug, slug, name, tagline,
  description: `${name} is a soft, glossy balm that melts in and keeps lips plump, smooth and kissable all day. Non-sticky, lightly scented and made to live in your pocket.`,
  price, color, color2, images: [], stock, status: "active", featured,
  ingredients: "Shea butter, jojoba oil, beeswax, vitamin E, natural flavour.",
  size: "4.5 g", createdAt: now(),
});

export const defaultSettings: Settings = {
  id: "main", storeName: "Mwah", vatPct: 5, exportsZeroRated: true,
  zones: [
    { id: "uae", name: "United Arab Emirates", countries: ["AE"], rate: 15, freeOver: 150, days: "1-3 days" },
    { id: "gcc", name: "GCC", countries: ["SA", "KW", "QA", "BH", "OM"], rate: 35, freeOver: 300, days: "3-6 days" },
    { id: "world", name: "Rest of the world", countries: ["*"], rate: 55, freeOver: 450, days: "6-12 days" },
  ],
  defaultCommissionPct: 15, defaultCustomerDiscountPct: 10, lowStockAt: 15,
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
