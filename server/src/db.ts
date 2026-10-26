import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { config } from "./config.js";
import { DEMO_REELS } from "./reels.js";
import { BARBERS, COUNTRIES } from "./seed.js";
import type { ActivityEntry, BarberApplication, AppNotification, Barber, Chat, Partner, Block, Booking, Conversation, GiftCard, Hire, Order, Purchase, QueueEntry, Reel, Review, SupportTicket, User, WaitlistEntry, Settings, ShopSettings } from "./types.js";

// The data store: a JSON file by default, or Postgres when DATABASE_URL is set (see connectDatabase).
// The rest of the code only touches the `db` object below.
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
  partners: Partner[]; // hotels and companies
  chats: Chat[]; // customer <-> barber messages
  activity: ActivityEntry[]; // what the team did in the admin panel (latest 2,000)
  applications: BarberApplication[]; // freelance barbers' ID, licence and signed agreement
}

const DATA_DIR = new URL("../data/", import.meta.url);
const DATA_FILE = new URL("db.json", DATA_DIR);
export const UPLOADS_DIR = new URL("uploads/", DATA_DIR);
/** ID documents and licences: only reachable through short-lived signed links (see applications.ts). */
export const PRIVATE_DIR = new URL("private/", DATA_DIR);
const persist = process.env.NODE_ENV !== "test";

const empty = (): Data => ({ users: [], barbers: structuredClone(BARBERS), bookings: [], hires: [], giftCards: [], purchases: [], waitlist: [], reviews: [], orders: [], reels: structuredClone(DEMO_REELS), tickets: [], conversations: [], notifications: [], sessions: {}, settings: {}, blocks: [], shopSettings: {}, resetTokens: [], outbox: [], queue: [], stock: {}, shopNudges: {}, partners: [], chats: [], activity: [], applications: [] });

/** Saved data (from the file or the database), with fields added since it was first written filled in. */
function fromSaved(saved: Partial<Data>): Data {
  const data = { ...empty(), ...saved } as Data;
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
  // Sample barbers added since the data was written (e.g. new cities).
  for (const s of BARBERS) if (!data.barbers.some((b) => b.id === s.id)) data.barbers.push(structuredClone(s));
  return data;
}

function load(): Data {
  if (persist && !config.databaseUrl) {
    try {
      return fromSaved(JSON.parse(readFileSync(DATA_FILE, "utf8")));
    } catch {
      // first run
    }
  }
  return empty();
}

export const db: Data = load();

// Postgres: with DATABASE_URL set, everything lives in one JSONB row (table jb_state) instead of the file.
// It keeps data safe on any managed Postgres; move to proper tables before you have thousands of bookings a day.
let pool: import("pg").Pool | undefined;
let timer: ReturnType<typeof setTimeout> | undefined;
let writing: Promise<unknown> = Promise.resolve();

/** Connects to Postgres and loads the saved data (call once before the server starts). */
export async function connectDatabase() {
  if (!config.databaseUrl || !persist) return false;
  const { default: pg } = await import("pg");
  pool = new pg.Pool({ connectionString: config.databaseUrl, ssl: /sslmode=disable|localhost|127\.0\.0\.1/.test(config.databaseUrl) ? false : { rejectUnauthorized: false } });
  await pool.query("CREATE TABLE IF NOT EXISTS jb_state (id text PRIMARY KEY, data jsonb NOT NULL, updated_at timestamptz NOT NULL DEFAULT now())");
  const { rows } = await pool.query("SELECT data FROM jb_state WHERE id = 'main'");
  if (rows[0]) Object.assign(db, fromSaved(rows[0].data as Partial<Data>));
  else await writeNow();
  return true;
}

const writeNow = () => (writing = writing.then(() => pool!.query("INSERT INTO jb_state (id, data, updated_at) VALUES ('main', $1, now()) ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = now()", [JSON.stringify(db)])).catch((e: Error) => console.error("Saving to Postgres failed:", e.message)));

/** Writes everything still waiting (on shutdown). */
export async function flush() {
  if (timer) clearTimeout(timer);
  timer = undefined;
  if (pool) await writeNow();
}

export function save() {
  if (!persist) return;
  if (pool) {
    // Many changes in a row become one write.
    if (!timer) timer = setTimeout(() => {
      timer = undefined;
      void writeNow();
    }, 300);
    return;
  }
  mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(DATA_FILE, JSON.stringify(db, null, 2));
}

export const newId = () => randomUUID();
