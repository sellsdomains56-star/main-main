/**
 * Writes the seed data the self-contained demo page needs (see app/scripts/build-demo-page.mjs),
 * with demo media inlined as data: URIs so the page works without the API.
 *   npx tsx scripts/export-demo-data.ts > ../app/demo-data.json
 */
import { readFileSync } from "node:fs";
import { CAMPAIGNS } from "../src/campaigns.js";
import { GIFT_AMOUNTS, PLANS } from "../src/club.js";
import { FAQ, SUPPORT_EMAIL } from "../src/faq.js";
import { PRODUCTS, SHIPPING } from "../src/products.js";
import { DEMO_REELS } from "../src/reels.js";
import { BARBERS, COUNTRIES, SHOPS } from "../src/seed.js";

const MEDIA = new URL("../media/", import.meta.url);
const TYPES: Record<string, string> = { jpg: "image/jpeg", png: "image/png", mp4: "video/mp4" };

// Each file is inlined once; records keep their /media/... paths and the app looks them up.
const media: Record<string, string> = {};
function inline(path: string | undefined) {
  if (!path?.startsWith("/media/")) return path ?? "";
  const ext = path.split(".").pop()!;
  media[path] ??= `data:${TYPES[ext]};base64,${readFileSync(new URL(path.slice("/media/".length), MEDIA)).toString("base64")}`;
  return path;
}

const data = {
  countries: COUNTRIES,
  barbers: BARBERS.map((b) => ({
    ...b,
    photoUrl: inline(b.photoUrl),
    gallery: b.gallery.map((g) => ({ ...g, url: inline(g.url) })),
    transformations: b.transformations.map((t) => ({ ...t, beforeUrl: inline(t.beforeUrl), afterUrl: inline(t.afterUrl) })),
  })),
  reels: DEMO_REELS.map((r) => ({ id: r.id, barberId: r.barberId, videoUrl: inline(r.videoUrl), posterUrl: inline(r.posterUrl), caption: r.caption, likes: r.likedBy.length, views: r.views ?? 0, shares: r.shares ?? 0, comments: (r.comments ?? []).map((c) => ({ id: c.id, name: c.name, text: c.text, likes: c.likedBy.length, createdAt: c.createdAt })), createdAt: r.createdAt })),
  shops: SHOPS.map((s) => ({ ...s, photoUrl: inline(s.photoUrl) })),
  campaigns: CAMPAIGNS.map((c) => ({ ...c, photoUrl: inline(c.photoUrl) })),
  plans: PLANS,
  giftAmounts: GIFT_AMOUNTS,
  products: PRODUCTS,
  shipping: SHIPPING,
  faq: FAQ,
  supportEmail: SUPPORT_EMAIL,
  media,
};

process.stdout.write(JSON.stringify(data));
