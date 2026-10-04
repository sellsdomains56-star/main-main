import type { Product } from "./types.js";

// JB's Fresh product line. Prices are in minor units per currency, so customers
// pay in the currency of the country they picked.
const charm = (minor: number) => Math.max(99, Math.round(minor / 100) * 100 - 1); // 16.25 -> 15.99
const price = (eur: number) => ({
  eur,
  gbp: charm(eur * 0.86),
  usd: charm(eur * 1.1),
  aed: charm(eur * 4),
});

export const PRODUCTS: Product[] = [
  { id: "p-pomade", name: "JB's Fresh Matte Pomade", category: "Styling", emoji: "🫙", description: "Strong hold, zero shine. Perfect for textured crops and quiffs. 100 ml.", prices: price(1890) },
  { id: "p-wax", name: "JB's Fresh Shine Wax", category: "Styling", emoji: "✨", description: "Medium hold with a classic barbershop shine for side parts and pompadours. 100 ml.", prices: price(1690) },
  { id: "p-powder", name: "JB's Fresh Texture Powder", category: "Styling", emoji: "🧂", description: "Instant volume and grip at the roots. Shake, rub, style. 20 g.", prices: price(1490) },
  { id: "p-wave", name: "JB's Fresh Wave Butter", category: "Styling", emoji: "🌊", description: "Moisturising butter to lay and define 360 waves. 120 g.", prices: price(1590) },
  { id: "p-shampoo", name: "JB's Fresh Daily Shampoo", category: "Hair care", emoji: "🧴", description: "Gentle mint & tea-tree shampoo that keeps your scalp fresh all day. 250 ml.", prices: price(1490) },
  { id: "p-conditioner", name: "JB's Fresh Conditioner", category: "Hair care", emoji: "💧", description: "Lightweight conditioner for soft, manageable hair. 250 ml.", prices: price(1490) },
  { id: "p-beard-oil", name: "JB's Fresh Beard Oil", category: "Beard", emoji: "🧔", description: "Argan & jojoba oil that softens the beard and stops itch. 30 ml.", prices: price(1990) },
  { id: "p-beard-balm", name: "JB's Fresh Beard Balm", category: "Beard", emoji: "🪒", description: "Shapes and tames flyaways with a light cedarwood scent. 50 g.", prices: price(1790) },
  { id: "p-aftershave", name: "JB's Fresh Aftershave Tonic", category: "Shave", emoji: "🌿", description: "Cooling, alcohol-free tonic that calms skin after a fade or shave. 100 ml.", prices: price(1690) },
  { id: "p-brush", name: "JB's Fresh Wave Brush", category: "Tools", emoji: "🪮", description: "Medium-soft boar bristle brush for waves and beard grooming.", prices: price(1290) },
  { id: "p-kit", name: "JB's Fresh Starter Kit", category: "Bundles", emoji: "🎁", description: "Matte Pomade, Daily Shampoo and Beard Oil in a gift box. Save 15%.", prices: price(4490) },
];

/** Flat shipping per order, waived above the free-shipping threshold. Minor units per currency. */
export const SHIPPING: Record<string, { fee: number; freeFrom: number }> = {
  eur: { fee: 495, freeFrom: 5000 },
  gbp: { fee: 399, freeFrom: 4500 },
  usd: { fee: 599, freeFrom: 5500 },
  aed: { fee: 1900, freeFrom: 20000 },
};
