import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { DEMO_REELS } from "./reels.js";
import { BARBERS, COUNTRIES } from "./seed.js";
import type { AppNotification, Barber, Booking, Conversation, Order, Reel, Review, SupportTicket, User } from "./types.js";

// Simple JSON-file store. Good enough to run the product end-to-end; swap for
// Postgres (or similar) before going to production — the rest of the code only
// touches the `db` object below.
interface Data {
  users: User[];
  barbers: Barber[];
  bookings: Booking[];
  reviews: Review[];
  orders: Order[];
  reels: Reel[];
  tickets: SupportTicket[];
  conversations: Conversation[];
  notifications: AppNotification[];
  sessions: Record<string, string>; // token -> userId
}

const DATA_DIR = new URL("../data/", import.meta.url);
const DATA_FILE = new URL("db.json", DATA_DIR);
export const UPLOADS_DIR = new URL("uploads/", DATA_DIR);
const persist = process.env.NODE_ENV !== "test";

function load(): Data {
  if (persist) {
    try {
      const data = { orders: [], reels: structuredClone(DEMO_REELS), tickets: [], conversations: [], notifications: [], ...JSON.parse(readFileSync(DATA_FILE, "utf8")) } as Data;
      // Fill fields added after this file was first written.
      const defaults = { yearsExperience: 0, languages: [], gallery: [], transformations: [] };
      data.barbers = data.barbers.map((b) => {
        const seeded = BARBERS.find((s) => s.id === b.id);
        const centre = COUNTRIES.find((c) => c.code === b.countryCode)?.cities.find((c) => c.name === b.city);
        return { ...defaults, ...b, lat: b.lat ?? seeded?.lat ?? centre?.lat ?? 0, lng: b.lng ?? seeded?.lng ?? centre?.lng ?? 0 };
      });
      // Sample barbers added since the file was written (e.g. new cities).
      for (const s of BARBERS) if (!data.barbers.some((b) => b.id === s.id)) data.barbers.push(structuredClone(s));
      return data;
    } catch {
      // first run
    }
  }
  return { users: [], barbers: structuredClone(BARBERS), bookings: [], reviews: [], orders: [], reels: structuredClone(DEMO_REELS), tickets: [], conversations: [], notifications: [], sessions: {} };
}

export const db: Data = load();

export function save() {
  if (!persist) return;
  mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(DATA_FILE, JSON.stringify(db, null, 2));
}

export const newId = () => randomUUID();
