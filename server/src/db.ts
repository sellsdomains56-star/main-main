import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { DEMO_REELS } from "./reels.js";
import { BARBERS, COUNTRIES } from "./seed.js";
import type { AppNotification, Barber, Block, Booking, Conversation, GiftCard, Hire, Order, Purchase, QueueEntry, Reel, Review, SupportTicket, User, WaitlistEntry, Settings, ShopSettings } from "./types.js";

// Simple JSON-file store. Good enough to run the product end-to-end; swap for
// Postgres (or similar) before going to production — the rest of the code only
// touches the `db` object below.
interface Data {
  users: User[];
  barbers: Barber[];
  bookings: Booking[];
  hires: Hire[]; // private hire of a whole barbershop
  giftCards: GiftCard[];
  purchases: Purchase[]; // Club memberships, gift cards, tips
  waitlist: WaitlistEntry[];
  reviews: Review[];
  orders: Order[];
  reels: Reel[];
  tickets: SupportTicket[];
  conversations: Conversation[];
  notifications: AppNotification[];
  sessions: Record<string, string>; // token -> userId
  settings: Settings; // what the team changed in the admin panel
  blocks: Block[]; // time barbershops blocked in their barbers' calendars
  shopSettings: Record<string, ShopSettings>; // what each barbershop changed in the shop panel
  resetTokens: { hash: string; userId: string; expires: string }[]; // password-reset links (only the hash is kept)
  outbox: { id: string; to: string; subject: string; text: string; sentAt: string; delivered: boolean }[]; // recent emails
  queue: QueueEntry[]; // walk-ins waiting at barbershops
  stock: Record<string, Record<string, number>>; // shop id -> product id -> how many in stock (missing = not counted)
  shopNudges: Record<string, Record<string, string>>; // shop id -> client -> when the shop last messaged them
}

const DATA_DIR = new URL("../data/", import.meta.url);
const DATA_FILE = new URL("db.json", DATA_DIR);
export const UPLOADS_DIR = new URL("uploads/", DATA_DIR);
const persist = process.env.NODE_ENV !== "test";

function load(): Data {
  if (persist) {
    try {
      const data = { orders: [], hires: [], giftCards: [], purchases: [], waitlist: [], reels: structuredClone(DEMO_REELS), tickets: [], conversations: [], notifications: [], settings: {}, blocks: [], shopSettings: {}, resetTokens: [], outbox: [], queue: [], stock: {}, shopNudges: {}, ...JSON.parse(readFileSync(DATA_FILE, "utf8")) } as Data;
      // Fill fields added after this file was first written.
      const defaults = { yearsExperience: 0, languages: [], gallery: [], transformations: [] };
      data.barbers = data.barbers.map((b) => {
        const seeded = BARBERS.find((s) => s.id === b.id);
        const centre = COUNTRIES.find((c) => c.code === b.countryCode)?.cities.find((c) => c.name === b.city);
        // Sample barbers get the new sample photos (the old placeholder portraits came from another site).
        const photoUrl = seeded && b.photoUrl.startsWith("https://i.pravatar.cc/") ? seeded.photoUrl : b.photoUrl;
        // Sample barbers still on the old four-service menu get the full menu (same ids for the four).
        const oldMenu = seeded && b.services.length === 4 && b.services.every((s) => /-(cut|fade|beard|combo)$/.test(s.id));
        const services = oldMenu ? seeded.services.map((s) => ({ ...s, price: b.services.find((o) => o.id === s.id)?.price ?? s.price })) : b.services;
        return { ...defaults, shopId: seeded?.shopId, ...b, services, photoUrl, lat: b.lat ?? seeded?.lat ?? centre?.lat ?? 0, lng: b.lng ?? seeded?.lng ?? centre?.lng ?? 0 };
      });
      // Sample barbers added since the file was written (e.g. new cities).
      for (const s of BARBERS) if (!data.barbers.some((b) => b.id === s.id)) data.barbers.push(structuredClone(s));
      return data;
    } catch {
      // first run
    }
  }
  return { users: [], barbers: structuredClone(BARBERS), bookings: [], hires: [], giftCards: [], purchases: [], waitlist: [], reviews: [], orders: [], reels: structuredClone(DEMO_REELS), tickets: [], conversations: [], notifications: [], sessions: {}, settings: {}, blocks: [], shopSettings: {}, resetTokens: [], outbox: [], queue: [], stock: {}, shopNudges: {} };
}

export const db: Data = load();

export function save() {
  if (!persist) return;
  mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(DATA_FILE, JSON.stringify(db, null, 2));
}

export const newId = () => randomUUID();
