import type { Product, Settings, ShippingZone } from "./types";
import { COUNTRY_LIST, DEFAULT_BLOCKED, type RegionId } from "./countries";
import { CURRENCIES, defaultTax } from "./tax";

const now = () => new Date().toISOString();
const INGREDIENTS = "Shea butter, jojoba oil, beeswax, vitamin E, natural flavour."; // SAMPLE: replace with your real INCI list
type Copy = { tagline: string; paragraphs: string[]; highlights: string[]; notes: string; finish: string };
const P = (slug: string, name: string, color: string, color2: string, price: number, c: Copy, featured = false, stock = 120, size = "4.5 g"): Product => ({
  id: slug, slug, name, tagline: c.tagline, description: c.paragraphs.join("\n\n"),
  highlights: c.highlights, flavourNotes: c.notes, finish: c.finish,
  howToUse: "Twist up and glide over clean, dry lips whenever they need comfort. Reapply as often as you like, and before bed for softer lips in the morning. For external use on the lips only.",
  shelfLife: "12 months after opening",
  price, color, color2, images: [], stock, status: "active", featured, ingredients: INGREDIENTS, size, createdAt: now(),
});

// SAMPLE COPY: written to show how a finished product page reads. Rewrite it so it matches your real formula, flavours
// and claims, then tick "Product copy reviewed" on the launch checklist.
const COPY = {
  strawberry: { tagline: "Juicy, sweet, a little bit dangerous.", notes: "Ripe strawberry, a touch of cream", finish: "Sheer rosy gloss",
    paragraphs: ["Strawberry Kiss is the one people reach for first. A bright, juicy strawberry flavour with a creamy finish, in a balm that melts on contact and leaves lips soft and glossy.", "Slip it in a pocket or a bag: it is made for everyday use, from the morning commute to a night out."],
    highlights: ["Juicy strawberry-and-cream flavour", "Soft, cushiony glide with a glossy finish", "Pocket-size 4.5 g tube", "Shea butter and jojoba oil base"] },
  vanilla: { tagline: "Soft like a cloud, sweet like a hug.", notes: "Warm vanilla bean, whipped cream", finish: "Clear, comfortable gloss",
    paragraphs: ["Vanilla Cloud is comfort in a tube. A warm vanilla flavour wrapped around a rich, soft balm that glides on clear and wears like a second skin.", "Because it is colour-free, it layers under lipstick and over lip colour, and suits anyone who wants simple, lasting comfort."],
    highlights: ["Warm, creamy vanilla flavour", "Clear finish that layers with any lip colour", "Rich base of shea butter and beeswax", "Pocket-size 4.5 g tube"] },
  cherry: { tagline: "Bold cherry colour-tint with a glossy pop.", notes: "Sweet black cherry, a hint of tart", finish: "Sheer cherry tint, high gloss",
    paragraphs: ["Cherry Pop brings a little drama to your balm routine. A sweet-tart cherry flavour and a sheer wash of cherry colour give lips a glossy, just-bitten look.", "Wear one coat for a hint of colour or build it up for more. It is care and colour in one swipe."],
    highlights: ["Sweet-tart cherry flavour", "Sheer, buildable cherry tint", "High-shine finish", "Vitamin E and jojoba oil"] },
  peach: { tagline: "Sun-ripened peach with a sparkle.", notes: "Juicy peach, a fizzy citrus lift", finish: "Peachy sheer gloss",
    paragraphs: ["Peach Fizz tastes like the first bite of a ripe summer peach, with a bright, fizzy lift on top. The balm glides on light and leaves a soft, peachy glow.", "It is the cheerful one: easy to love and easy to reapply."],
    highlights: ["Juicy peach flavour with a citrus lift", "Light, non-heavy feel", "Soft peachy sheen", "Pocket-size 4.5 g tube"] },
  coconut: { tagline: "A holiday for your lips.", notes: "Toasted coconut, a hint of vanilla", finish: "Clear satin gloss",
    paragraphs: ["Coconut Dream is a mini holiday you can keep in your pocket. A creamy toasted-coconut flavour with a smooth, satiny balm that keeps lips feeling cared for.", "A favourite for travel bags and beach days."],
    highlights: ["Creamy toasted-coconut flavour", "Smooth satin finish", "Shea butter and jojoba oil base", "Pocket-size 4.5 g tube"] },
  rose: { tagline: "Pink-tinted, rosy and ultra-hydrating.", notes: "Soft rose petal, a whisper of sweetness", finish: "Sheer rose tint, soft shine",
    paragraphs: ["Rose Petal is a quiet kind of glamour. A delicate rose flavour and a sheer pink tint that flatters every skin tone, in a balm that feels rich without feeling heavy.", "Our newest flavour and an instant favourite for gifting."],
    highlights: ["Delicate rose flavour", "Sheer pink tint that suits every skin tone", "Rich but never heavy", "Vitamin E enriched"] },
  set: { tagline: "Four fan favourites in one set.", notes: "Strawberry, vanilla, cherry and rose", finish: "A mix of clear and sheer-tinted glosses",
    paragraphs: ["The Mwah Set brings together four of our most-loved balms: Strawberry Kiss, Vanilla Cloud, Cherry Pop and Rose Petal. A flavour for every mood, in one order.", "Bought separately these four are AED 122. In the set they are AED 99. A thoughtful gift, or a way to find your favourite."],
    highlights: ["Strawberry Kiss, Vanilla Cloud, Cherry Pop, Rose Petal", "Save AED 23 compared with buying them separately", "4 × 4.5 g tubes", "Great for gifting or sharing"] },
};

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
  tax: Object.fromEntries(COUNTRY_LIST.map((c) => [c.code, defaultTax(c.code)])),
  currencies: Object.fromEntries(Object.entries(CURRENCIES).map(([k, v]) => [k, v.rate])),
  legal: { legalName: "", tradeLicenceNo: "", licensingAuthority: "", vatTrn: "", address: "", email: "", phone: "", jurisdiction: "Dubai" },
  confirmations: {},
};

export function seed() {
  return {
    products: [
      P("strawberry-kiss", "Strawberry Kiss", "#ff5d8f", "#ffb3c7", 29, COPY.strawberry, true),
      P("vanilla-cloud", "Vanilla Cloud", "#f5d6a1", "#fff1d6", 29, COPY.vanilla, true),
      P("cherry-pop", "Cherry Pop", "#d6124a", "#ff6b8e", 32, COPY.cherry, true),
      P("peach-fizz", "Peach Fizz", "#ff9a6b", "#ffd0b3", 29, COPY.peach),
      P("coconut-dream", "Coconut Dream", "#9ed8c8", "#e6fff7", 29, COPY.coconut, false, 12),
      P("rose-petal", "Rose Petal", "#e86aa6", "#ffc6e0", 32, COPY.rose, true),
      P("mwah-set", "The Mwah Set", "#ff3d81", "#cdb4ff", 99, COPY.set, true, 60, "4 × 4.5 g"),
    ],
    orders: [], discounts: [
      { id: "welcome10", code: "WELCOME10", type: "percent", value: 10, minSubtotal: 0, maxUses: 0, uses: 0, active: true, createdAt: now() },
    ],
    influencers: [], clicks: [], payouts: [], settings: [defaultSettings],
  };
}
