import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { DEMO_REELS } from "./reels.js";
import { BARBERS } from "./seed.js";
import type { Barber, Booking, Order, Reel, Review, User } from "./types.js";

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
  sessions: Record<string, string>; // token -> userId
}

const DATA_DIR = new URL("../data/", import.meta.url);
const DATA_FILE = new URL("db.json", DATA_DIR);
export const UPLOADS_DIR = new URL("uploads/", DATA_DIR);
const persist = process.env.NODE_ENV !== "test";

function load(): Data {
  if (persist) {
    try {
      return { orders: [], reels: structuredClone(DEMO_REELS), ...JSON.parse(readFileSync(DATA_FILE, "utf8")) } as Data;
    } catch {
      // first run
    }
  }
  return { users: [], barbers: structuredClone(BARBERS), bookings: [], reviews: [], orders: [], reels: structuredClone(DEMO_REELS), sessions: {} };
}

export const db: Data = load();

export function save() {
  if (!persist) return;
  mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(DATA_FILE, JSON.stringify(db, null, 2));
}

export const newId = () => randomUUID();
