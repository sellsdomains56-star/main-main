/**
 * In-browser stand-in for the API, used only by the self-contained demo page
 * (scripts/build-demo-page.mjs sets `globalThis.__AF_DEMO__` before the app starts).
 * It mirrors the real server's rules for search, availability, bookings, reviews,
 * reels, the shop and support, and keeps changes on the viewer's device. Its concierge and
 * stylist answer from the demo's own data; the real app uses the server's AI for both.
 */
import type { AssistantAction, ChatMessage } from "../types";

// ---------- Seed data shapes (exported from the server's seed files) ----------

interface SeedService { id: string; name: string; durationMin: number; price: number; category?: string; description?: string }
interface SeedBarber {
  id: string; name: string; bio: string; photoUrl: string; countryCode: string; city: string; shopAddress: string;
  lat: number; lng: number;
  specialties: string[]; services: SeedService[]; offersHomeVisits: boolean; homeVisitFee: number;
  yearsExperience: number; languages: string[];
  gallery: { id: string; url: string; caption: string }[];
  transformations: { id: string; beforeUrl: string; afterUrl: string; caption: string }[];
  workingDays: number[]; openHour: number; closeHour: number; ratingSum: number; ratingCount: number;
  offersConsultations?: boolean; videoLink?: string; shopId?: string;
  status?: "pending" | "live" | "suspended"; verified?: boolean; timeOff?: string[]; joinedAt?: string; pinSetAt?: string;
  offline?: boolean; // switched off in the app by their barbershop
  cancelPolicy?: { freeHours: number; lateFeePercent: number };
  offPeak?: PriceRule | null; peak?: PriceRule | null;
  travelMaxKm?: number; // how far from their pin they go for a home visit (missing = 30 km)
  sharePercent?: number; clientNotes?: Record<string, string>; nudgedAt?: Record<string, string>;
}
interface PriceRule { percent: number; days: number[]; fromHour: number; toHour: number }
interface QueueEntry {
  id: string; shopId: string; name: string; phone: string; userId?: string; service: string;
  status: "waiting" | "called" | "serving" | "done" | "left"; barberId?: string; joinedAt: string; calledAt?: string; doneAt?: string; seeded?: boolean;
}
interface SeedPlan { id: "fresh" | "regular" | "black"; name: string; tagline: string; prices: Record<string, number>; cutsPerPeriod: number | null; productDiscount: number; freeHomeVisits: boolean; perks: string[] }
interface SeedShop {
  id: string; name: string; about: string; photoUrl: string; countryCode: string; city: string; address: string; lat: number; lng: number; phone: string;
  workingDays: number[]; openHour: number; closeHour: number;
  privateHire: { pricePerHour: number; minHours: number; maxHours: number; maxGuests: number } | null;
  delivery: { fee: number; freeFrom: number; etaMin: number; radiusKm: number } | null;
  productIds: string[];
  barberSharePercent?: number;
}
interface SeedCountry { code: string; name: string; currency: string; cities: { name: string; timeZone: string; lat: number; lng: number }[] }
interface SeedReel {
  id: string; barberId: string; videoUrl: string; posterUrl?: string; caption: string; likes: number; createdAt: string;
  views?: number; shares?: number; comments?: { id: string; name: string; text: string; likes: number; createdAt: string }[];
}
interface DemoComment { id: string; userId: string; name: string; text: string; likedBy: string[]; createdAt: string }
interface SeedProduct { id: string; name: string; category: string; emoji: string; description: string; prices: Record<string, number> }
export interface DemoData {
  countries: SeedCountry[];
  barbers: SeedBarber[];
  shops: SeedShop[];
  plans: SeedPlan[];
  campaigns: { id: string; eyebrow: string; title: string; body: string; cta: string; photoUrl: string; link: { pathname: string; params?: Record<string, string> }; countries?: string[]; except?: string[] }[];
  giftAmounts: Record<string, number[]>;
  reels: SeedReel[];
  products: SeedProduct[];
  shipping: Record<string, { fee: number; freeFrom: number }>;
  faq: { id: string; topic: string; question: string; answer: string }[];
  supportEmail: string;
  agreement: { version: string; title: string; intro: string; sections: { heading: string; body: string }[] }; // {company} and {fee} filled in when shown
  sampleDocs: Record<DocKind, string>; // "/media/samples/..." paths for the sample applications
  sampleSignature: string;
  media: Record<string, string>; // "/media/..." path -> data: URI
}

export class DemoError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

// ---------- State (changes are saved on this device) ----------

interface User {
  id: string; name: string; email: string; passwordHash: string; role: "customer" | "barber"; barberId?: string; countryCode?: string; city?: string;
  preferences?: Record<string, string>;
  credit?: Record<string, number>; // gift-card balance per currency
  membership?: { plan: SeedPlan["id"]; number: string; currency: string; since: string; paidUntil: string };
  createdAt?: string;
  manages?: string; // id of the barbershop this person runs in the shop panel
  alerts?: { reminders?: boolean; offers?: boolean; social?: boolean; tips?: boolean };
  deletedAt?: string;
  seeded?: boolean; // a sample account (see seedDemoAccounts)
  photoUrl?: string; phone?: string; whatsapp?: boolean; birthday?: string; birthdayGiftYear?: number;
  favourites?: string[];
  rebook?: { barberId: string; serviceId: string; everyWeeks: number; nextAt: string };
  referralCode?: string; referredBy?: string; referralRewarded?: boolean;
  shopRole?: "owner" | "manager" | "front_desk"; branches?: string[];
}
interface GiftCard { id: string; code: string; amount: number; currency: string; buyerId: string; toName: string; toEmail: string; message: string; design: "noir" | "ivory"; status: "pending_payment" | "active" | "redeemed"; createdAt: string }
interface Purchase { id: string; userId: string; kind: "membership" | "gift" | "tip"; ref: string; label: string; amount: number; currency: string; status: "pending_payment" | "paid" }
interface Booking {
  id: string; customerId: string; barberId: string; serviceId: string; startsAt: string; endsAt: string;
  locationType: "shop" | "home" | "video" | "phone"; address: string; phone?: string; notes: string; amount: number; currency: string;
  remindedDay?: boolean; remindedHour?: boolean;
  demoOnTheWayAt?: number; // demo only: when to play the "barber is on the way" alert
  status: "pending_payment" | "confirmed" | "on_the_way" | "completed" | "cancelled"; reviewed: boolean; createdAt: string;
  coveredBy?: "membership"; creditUsed?: number; tip?: number; cutNotes?: string; extras?: string[];
  venue?: { kind: "home" | "hotel" | "yacht" | "office"; details: string }; guest?: { name: string; phone: string };
  spot?: { lat: number; lng: number; label?: string }; distanceKm?: number; travelFee?: number; // a home visit's point, drive and extra travel
  source?: "app" | "shop"; noShow?: boolean; // "shop": a walk-in or phone booking the barbershop added, paid at the shop
  cutPhotos?: string[]; shareToken?: string;
  priceRule?: number; lateFee?: number; checkedInAt?: string; partnerId?: string; partnerDiscount?: number;
  seeded?: boolean;
}
interface Review { id: string; barberId: string; customerId: string; customerName: string; bookingId: string; rating: number; comment: string; createdAt: string; photoUrl?: string; reply?: { text: string; at: string }; seeded?: boolean }
interface Ticket {
  id: string; topic: string; email: string; message: string; createdAt: string;
  userId?: string; name?: string; status?: "open" | "closed"; reelId?: string; replies?: { at: string; by: string; text: string }[];
}
interface Order {
  id: string; customerId: string; items: { productId: string; name: string; quantity: number; unitPrice: number }[];
  subtotal: number; shipping: number; amount: number; currency: string; shippingName: string; shippingAddress: string;
  fulfilment?: "shipping" | "delivery"; shopId?: string; discount?: number; creditUsed?: number;
  demoOutAt?: number; demoDeliveredAt?: number; // demo only: when the pretend courier leaves and arrives
  seeded?: boolean;
  status: "pending_payment" | "paid" | "out_for_delivery" | "delivered" | "cancelled"; createdAt: string;
}
interface Hire {
  id: string; customerId: string; shopId: string; startsAt: string; endsAt: string; hours: number; guests: number; occasion: string; notes: string;
  amount: number; currency: string; status: "pending_payment" | "confirmed" | "completed" | "cancelled"; createdAt: string;
}
/** Time a barbershop blocked for a barber (a break, training): the app can't book it. */
interface Block { id: string; shopId: string; barberId: string; startsAt: string; endsAt: string; reason: string; createdAt: string; seeded?: boolean }
type ShopSettings = Partial<Pick<SeedShop, "about" | "phone" | "workingDays" | "openHour" | "closeHour" | "barberSharePercent">>;
interface Conversation { id: string; ownerKey: string; turns: { role: "user" | "assistant"; content: string }[]; display: ChatMessage[] }
type AdminRole = "owner" | "operations" | "support" | "finance";
interface Partner { id: string; kind: "hotel" | "corporate"; name: string; code: string; discountPercent: number; commissionPercent: number; emailDomain?: string; contactEmail: string; active: boolean; createdAt: string }
interface DemoChat { id: string; customerId: string; barberId: string; messages: { id: string; from: "customer" | "barber"; text: string; at: string }[]; customerReadAt?: string; barberReadAt?: string; updatedAt: string; demoReplyAt?: number }
interface Saved {
  v: 1;
  users: User[];
  sessions: Record<string, string>;
  bookings: Booking[];
  reviews: Review[];
  orders: Order[];
  tickets: Ticket[];
  conversations: Conversation[];
  likes: Record<string, string[]>; // reelId -> user ids
  saves?: Record<string, string[]>; // reelId -> user ids who saved it
  reelComments?: Record<string, DemoComment[]>; // comments written on this device
  reelStats?: Record<string, { views: number; shares: number }>;
  newBarbers: SeedBarber[];
  barberPatches: Record<string, Partial<SeedBarber>>;
  notifications?: DemoNotification[];
  hires?: Hire[];
  giftCards?: GiftCard[];
  purchases?: Purchase[];
  waitlist?: { id: string; userId: string; barberId: string; date: string; notified: boolean; createdAt: string }[];
  settings?: { platformFeePercent?: number; reviewNewBarbers?: boolean; hiddenCampaigns?: string[]; team?: Record<string, AdminRole>; travelIncludedKm?: number; travelPerKmAed?: number };
  partners?: Partner[];
  chats?: DemoChat[];
  activity?: { id: string; at: string; by: { id: string; name: string; email: string }; action: string; target: string; detail?: string }[];
  removedReels?: string[];
  blocks?: Block[];
  shopSettings?: Record<string, ShopSettings>;
  demoSeededOn?: string; // the Dubai date the sample bookings were last built for
  demoSeedVersion?: number; // bumped when the sample gains something new, so returning visitors get it today
  queue?: QueueEntry[];
  stock?: Record<string, Record<string, number>>;
  shopNudges?: Record<string, Record<string, string>>;
  applications?: DemoApplication[];
}
/** A freelance barber's application: ID, licence and the signed agreement (mirrors server/src/routes/applications.ts). Documents are kept as data: URIs. */
type DocKind = "id_front" | "id_back" | "licence";
interface DemoApplication {
  barberId: string; status: "draft" | "submitted" | "approved" | "rejected";
  legalName?: string; idNumber?: string; idExpiry?: string; licenceNumber?: string; licenceAuthority?: string; licenceExpiry?: string;
  docs: Partial<Record<DocKind, { url: string; contentType: string; uploadedAt: string }>>;
  signature?: { name: string; svg: string; version: string; signedAt: string; ip?: string; userAgent?: string };
  submittedAt?: string; reviewedAt?: string; reviewedBy?: string; rejectionReason?: string; createdAt: string; updatedAt: string;
}
interface DemoNotification { id: string; userId: string; kind: string; title: string; body: string; bookingId?: string; orderId?: string; hireId?: string; read: boolean; createdAt: string }

const KEY = "jb_demo_state_v1";
let seed: DemoData;
let saved: Saved;
const memoryReels: SeedReel[] = []; // reels posted this session (videos can't be saved on the device)

function load(data: DemoData) {
  seed = data;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const s = JSON.parse(raw) as Saved;
      if (s.v === 1) {
        saved = { notifications: [], hires: [], ...s };
        return;
      }
    }
  } catch {
    // private window or blocked storage: start fresh
  }
  saved = { v: 1, users: [], sessions: {}, bookings: [], reviews: [], orders: [], tickets: [], conversations: [], likes: {}, newBarbers: [], barberPatches: {}, notifications: [], hires: [] };
}

function persist() {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(saved));
  } catch {
    // storage full or blocked: keep working in memory
  }
}

const newId = () => (globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`);

async function hash(text: string) {
  const data = new TextEncoder().encode(`jb-demo:${text}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

// ---------- Barbers, availability, search ----------

function allBarbers(): SeedBarber[] {
  return [...seed.barbers, ...saved.newBarbers].map((b) => ({ ...b, ...saved.barberPatches[b.id] }));
}

function getBarber(id: string) {
  const b = allBarbers().find((x) => x.id === id);
  if (!b) throw new DemoError(404, "Barber not found.");
  return b;
}

const country = (code: string) => seed.countries.find((c) => c.code === code);
const timeZoneOf = (b: SeedBarber) => country(b.countryCode)?.cities.find((c) => c.name === b.city)?.timeZone ?? "UTC";

function tzOffset(instant: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" }).formatToParts(instant);
  const get = (t: string) => Number(parts.find((p) => p.type === t)!.value);
  return Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second")) - instant.getTime();
}

function zonedTime(date: string, hour: number, minute: number, timeZone: string) {
  const [y, m, d] = date.split("-").map(Number);
  const guess = Date.UTC(y, m - 1, d, hour, minute);
  return new Date(guess - tzOffset(new Date(guess), timeZone));
}

function slots(b: SeedBarber, date: string, durationMin: number, now = new Date(), ignoreId?: string) {
  const tz = timeZoneOf(b);
  if (b.offline || !b.workingDays.includes(new Date(`${date}T12:00:00Z`).getUTCDay()) || b.timeOff?.includes(date)) return [];
  const taken = [
    ...saved.bookings.filter((x) => x.barberId === b.id && x.status !== "cancelled" && x.id !== ignoreId),
    ...(saved.blocks ?? []).filter((x) => x.barberId === b.id), // time the barbershop blocked
    ...(b.shopId ? (saved.hires ?? []).filter((h) => h.shopId === b.shopId && h.status !== "cancelled") : []), // a private hire books the whole team
  ].map((x) => [Date.parse(x.startsAt), Date.parse(x.endsAt)] as const);
  const out: string[] = [];
  for (let min = b.openHour * 60; min + durationMin <= b.closeHour * 60; min += 30) {
    const start = zonedTime(date, Math.floor(min / 60), min % 60, tz);
    const end = start.getTime() + durationMin * 60_000;
    if (start.getTime() < now.getTime() + 60 * 60_000) continue;
    if (taken.some(([s, e]) => start.getTime() < e && end > s)) continue;
    out.push(start.toISOString());
  }
  return out;
}

const localDates = (tz: string, days: number) => {
  const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: tz });
  return Array.from({ length: days }, (_, i) => fmt.format(new Date(Date.now() + i * 86_400_000)));
};

/** The services you can book on their own (extras only go with one). */
function mainServices(b: SeedBarber) {
  const main = b.services.filter((s) => s.category !== "extras");
  return main.length ? main : b.services;
}

function nextAvailable(b: SeedBarber) {
  const shortest = Math.min(...mainServices(b).map((s) => s.durationMin));
  for (const date of localDates(timeZoneOf(b), 14)) {
    const s = slots(b, date, shortest);
    if (s.length) return s[0];
  }
  return null;
}

function rating(b: SeedBarber) {
  const extra = saved.reviews.filter((r) => r.barberId === b.id);
  const sum = b.ratingSum + extra.reduce((t, r) => t + r.rating, 0);
  const count = b.ratingCount + extra.length;
  return { rating: count ? Math.round((sum / count) * 10) / 10 : null, ratingCount: count, raw: count ? sum / count : 0 };
}

function barberView(b: SeedBarber) {
  const c = country(b.countryCode)!;
  const r = rating(b);
  return {
    id: b.id, name: b.name, bio: b.bio, photoUrl: b.photoUrl, countryCode: b.countryCode, countryName: c.name, city: b.city,
    timeZone: timeZoneOf(b), shopAddress: b.shopAddress, shop: shopRef(b.shopId), lat: b.lat, lng: b.lng, specialties: b.specialties, services: b.services,
    offersHomeVisits: b.offersHomeVisits, homeVisitFee: b.homeVisitFee, offersConsultations: b.offersConsultations !== false, hasVideoLink: !!b.videoLink,
    travel: { includedKm: travelIncludedKm(), perKm: perKmFor(c.currency), maxKm: maxKmOf(b) },
    currency: c.currency, rating: r.rating, ratingCount: r.ratingCount,
    startingPrice: Math.min(...mainServices(b).map((s) => s.price)), yearsExperience: b.yearsExperience, languages: b.languages,
    gallery: b.gallery, transformations: b.transformations, nextAvailable: nextAvailable(b),
    status: b.status ?? "live", verified: !!b.verified,
    level: levelOf(b), cancelPolicy: b.cancelPolicy ?? null, offPeak: b.offPeak ?? null, peak: b.peak ?? null,
  };
}

// ---------- Booking rules, deals and levels (mirrors server/src/pro.ts) ----------

function localDayHour(b: SeedBarber, iso: string | number) {
  const p = Object.fromEntries(new Intl.DateTimeFormat("en-US", { timeZone: timeZoneOf(b), weekday: "short", hour: "2-digit", hourCycle: "h23" }).formatToParts(new Date(iso)).map((x) => [x.type, x.value]));
  return { day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(p.weekday!), hour: Number(p.hour) };
}
const ruleApplies = (r: PriceRule | null | undefined, day: number, hour: number) => !!r && r.days.includes(day) && hour >= r.fromHour && hour < r.toHour;
function priceRuleAt(b: SeedBarber, iso: string | number) {
  const { day, hour } = localDayHour(b, iso);
  if (ruleApplies(b.offPeak, day, hour)) return -Math.abs(b.offPeak!.percent);
  if (ruleApplies(b.peak, day, hour)) return Math.abs(b.peak!.percent);
  return 0;
}
const adjustedPrice = (price: number, percent: number) => (percent ? Math.max(0, Math.round((price * (100 + percent)) / 100 / 100) * 100) : price);
function cancelTerms(b: Booking, now = Date.now()) {
  const policy = allBarbers().find((x) => x.id === b.barberId)?.cancelPolicy;
  const late = !!policy && policy.freeHours > 0 && policy.lateFeePercent > 0 && Date.parse(b.startsAt) - now < policy.freeHours * 3_600_000 && b.status === "confirmed";
  const fee = late ? Math.round((b.amount * policy!.lateFeePercent) / 100) : 0;
  return { freeUntil: policy?.freeHours ? new Date(Date.parse(b.startsAt) - policy.freeHours * 3_600_000).toISOString() : null, lateFeePercent: policy?.lateFeePercent ?? 0, fee };
}
function levelOf(b: SeedBarber) {
  const done = saved.bookings.filter((x) => x.barberId === b.id && x.status === "completed").length;
  const r = rating(b);
  const cuts = Math.max(done, r.ratingCount);
  if (cuts >= 60 && r.raw >= 4.8) return "elite";
  if (cuts >= 25 && r.raw >= 4.5) return "pro";
  if (cuts >= 5) return "rising";
  return "new";
}
const LEVEL_NAME: Record<string, string> = { new: "New", rising: "Rising", pro: "Pro", elite: "Elite" };
const PRODUCT_COMMISSION_PERCENT = 15;
const DEFAULT_BARBER_SHARE = 50;
const inStock = (shopId: string, productId: string) => (saved.stock?.[shopId]?.[productId] ?? 1) > 0;
function takeStock(o: Order) {
  const shelf = o.shopId ? saved.stock?.[o.shopId] : undefined;
  if (!shelf) return;
  for (const i of o.items) if (shelf[i.productId] !== undefined) shelf[i.productId] = Math.max(0, shelf[i.productId]! - i.quantity);
}

interface Filters { country?: string; city?: string; q?: string; specialties?: string[]; minRating?: number; maxPrice?: number; availableToday?: boolean; homeVisits?: boolean; openNow?: boolean; near?: { lat: number; lng: number }; sort?: string; limit?: number }

/** Straight-line distance in km. */
function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const rad = Math.PI / 180;
  const h = Math.sin(((b.lat - a.lat) * rad) / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(((b.lng - a.lng) * rad) / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

/** Working right now in the barber's own time zone. */
function openNow(b: SeedBarber, now = new Date()) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat("en-CA", { timeZone: timeZoneOf(b), year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", hourCycle: "h23", weekday: "short" }).formatToParts(now).map((p) => [p.type, p.value]));
  const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(parts.weekday!);
  const hour = Number(parts.hour);
  return !b.offline && b.workingDays.includes(day) && hour >= b.openHour && hour < b.closeHour && !(b.timeOff ?? []).includes(`${parts.year}-${parts.month}-${parts.day}`);
}

function search(f: Filters) {
  const words = f.q?.toLowerCase().split(/\s+/).filter(Boolean) ?? [];
  const list = allBarbers().filter((b) => {
    if ((b.status ?? "live") !== "live") return false; // waiting for approval or paused by the team
    if (f.country && b.countryCode !== f.country) return false;
    if (f.city && b.city.toLowerCase() !== f.city.toLowerCase()) return false;
    if (f.specialties?.length && !f.specialties.some((s) => b.specialties.includes(s))) return false;
    if (f.minRating && rating(b).raw < f.minRating) return false;
    if (f.maxPrice && Math.min(...mainServices(b).map((s) => s.price)) > f.maxPrice) return false;
    if (f.homeVisits && !b.offersHomeVisits) return false;
    if (words.length) {
      const hay = [b.name, b.city, country(b.countryCode)?.name ?? "", b.bio, ...b.specialties, ...b.languages].join(" ").toLowerCase();
      if (!words.every((w) => hay.includes(w) || hay.includes(w.replace(/s$/, "")))) return false;
    }
    if (f.availableToday) {
      const shortest = Math.min(...mainServices(b).map((s) => s.durationMin));
      if (!slots(b, localDates(timeZoneOf(b), 1)[0], shortest).length) return false;
    }
    if (f.openNow && !openNow(b)) return false;
    return true;
  });
  const near = f.near;
  const views = list.map((b) => ({ ...barberView(b), ...(near ? { distanceKm: Math.round(distanceKm(near, b) * 10) / 10 } : {}) }));
  const byRating = (a: (typeof views)[number], b: (typeof views)[number]) => (b.rating ?? 0) - (a.rating ?? 0) || b.ratingCount - a.ratingCount;
  if (f.sort === "price") views.sort((a, b) => a.startingPrice - b.startingPrice);
  else if (f.sort === "soonest") views.sort((a, b) => (a.nextAvailable ?? "9999").localeCompare(b.nextAvailable ?? "9999") || byRating(a, b));
  else if (f.sort === "experience") views.sort((a, b) => b.yearsExperience - a.yearsExperience || byRating(a, b));
  else if (f.sort === "nearest" && near) views.sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0) || byRating(a, b));
  else views.sort(byRating);
  return f.limit ? views.slice(0, f.limit) : views;
}

// ---------- Barbershops (mirrors server/src/shops.ts) ----------

/** A shop with the changes its owner made in the shop panel. */
const withSettings = (s: SeedShop): SeedShop => ({ ...s, ...saved.shopSettings?.[s.id] });
const allShops = () => seed.shops.map(withSettings);
function getShop(id: string) {
  const s = seed.shops.find((x) => x.id === id);
  if (!s) throw new DemoError(404, "Barbershop not found.");
  return withSettings(s);
}
function shopRef(id?: string) {
  const s = id ? seed.shops.find((x) => x.id === id) : undefined;
  return s ? { id: s.id, name: s.name } : null;
}
const shopTz = (s: SeedShop) => country(s.countryCode)?.cities.find((c) => c.name === s.city)?.timeZone ?? "UTC";
const shopCurrency = (s: SeedShop) => country(s.countryCode)!.currency;
const team = (s: SeedShop) => allBarbers().filter((b) => b.shopId === s.id && (b.status ?? "live") === "live");
const menuKey = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function shopMenu(s: SeedShop) {
  const menu = new Map<string, { key: string; name: string; durationMin: number; fromPrice: number }>();
  for (const b of team(s)) {
    for (const sv of b.services) {
      if (sv.category === "extras") continue; // added to a service, not booked alone
      const key = menuKey(sv.name);
      const item = menu.get(key);
      if (!item) menu.set(key, { key, name: sv.name, durationMin: sv.durationMin, fromPrice: sv.price });
      else {
        item.fromPrice = Math.min(item.fromPrice, sv.price);
        item.durationMin = Math.max(item.durationMin, sv.durationMin);
      }
    }
  }
  return [...menu.values()].sort((a, b) => a.fromPrice - b.fromPrice);
}

function shopSlots(s: SeedShop, date: string, key: string) {
  const all = new Set<string>();
  for (const b of team(s)) {
    const sv = b.services.find((x) => menuKey(x.name) === key);
    if (sv) for (const t of slots(b, date, sv.durationMin)) all.add(t);
  }
  return [...all].sort();
}

function pickBarber(s: SeedShop, key: string, startsAt: string) {
  const date = new Intl.DateTimeFormat("en-CA", { timeZone: shopTz(s) }).format(new Date(startsAt));
  const iso = new Date(startsAt).toISOString();
  return team(s)
    .map((b) => ({ barber: b, service: b.services.find((x) => menuKey(x.name) === key) }))
    .filter((x) => x.service && slots(x.barber, date, x.service.durationMin).includes(iso))
    .sort((x, y) => rating(y.barber).raw - rating(x.barber).raw)[0];
}

function hireSlots(s: SeedShop, date: string, hours: number) {
  if (!s.privateHire || !s.workingDays.includes(new Date(`${date}T12:00:00Z`).getUTCDay())) return [];
  const ids = new Set(team(s).map((b) => b.id));
  const blocked = [
    ...saved.bookings.filter((b) => ids.has(b.barberId) && b.status !== "cancelled"),
    ...(saved.hires ?? []).filter((h) => h.shopId === s.id && h.status !== "cancelled"),
  ].map((x) => [Date.parse(x.startsAt), Date.parse(x.endsAt)] as const);
  const out: string[] = [];
  for (let h = s.openHour; h + hours <= s.closeHour; h++) {
    const start = zonedTime(date, h, 0, shopTz(s)).getTime();
    const end = start + hours * 3_600_000;
    if (start < Date.now() + 24 * 3_600_000) continue; // a day's notice
    if (blocked.some(([a, b]) => start < b && end > a)) continue;
    out.push(new Date(start).toISOString());
  }
  return out;
}

function shopSummary(s: SeedShop) {
  const t = team(s);
  const views = t.map(rating);
  const count = views.reduce((n, r) => n + r.ratingCount, 0);
  const sum = t.reduce((n, b, i) => n + views[i].raw * views[i].ratingCount, 0);
  const menu = shopMenu(s);
  return {
    id: s.id, name: s.name, about: s.about, photoUrl: s.photoUrl, countryCode: s.countryCode, city: s.city, address: s.address, lat: s.lat, lng: s.lng,
    currency: shopCurrency(s), rating: count ? Math.round((sum / count) * 10) / 10 : null, ratingCount: count, teamSize: t.length,
    startingPrice: menu.length ? menu[0].fromPrice : null, offersPrivateHire: !!s.privateHire, offersDelivery: !!s.delivery && s.productIds.length > 0,
  };
}

function shopDetail(s: SeedShop) {
  const cur = shopCurrency(s);
  return {
    ...shopSummary(s), phone: s.phone, timeZone: shopTz(s), workingDays: s.workingDays, openHour: s.openHour, closeHour: s.closeHour,
    menu: shopMenu(s), team: team(s).map(barberView), privateHire: s.privateHire, delivery: s.delivery,
    products: seed.products.filter((p) => s.productIds.includes(p.id) && inStock(s.id, p.id)).map((p) => ({ id: p.id, name: p.name, category: p.category, emoji: p.emoji, description: p.description, price: p.prices[cur] ?? p.prices.eur, currency: cur })),
  };
}

function hireView(h: Hire) {
  const s = getShop(h.shopId);
  return {
    ...h,
    status: h.status === "confirmed" && Date.parse(h.endsAt) < Date.now() ? "completed" : h.status,
    shop: { id: s.id, name: s.name, address: s.address, city: s.city, photoUrl: s.photoUrl, timeZone: shopTz(s) },
    customerName: saved.users.find((u) => u.id === h.customerId)?.name ?? "Customer",
  };
}

function orderView(o: Order) {
  const s = o.shopId ? allShops().find((x) => x.id === o.shopId) : undefined;
  const { demoOutAt: _a, demoDeliveredAt: _b, ...rest } = o;
  return { ...rest, fulfilment: o.fulfilment ?? "shipping", shop: s ? { id: s.id, name: s.name, address: s.address, phone: s.phone, etaMin: s.delivery?.etaMin ?? 60 } : null };
}

function orderAlert(o: Order) {
  const s = o.shopId ? allShops().find((x) => x.id === o.shopId) : undefined;
  if (o.fulfilment !== "delivery" || !s) return;
  const n = o.items.reduce((t, i) => t + i.quantity, 0);
  const demo = " (Demo: in the app the shop taps this when the courier leaves.)";
  if (o.status === "paid") notify(o.customerId, { kind: "order_update", title: "Order received", body: `${s.name} is packing your ${n} ${n === 1 ? "item" : "items"}. Arrives in about ${s.delivery?.etaMin ?? 60} min.`, orderId: o.id });
  if (o.status === "out_for_delivery") notify(o.customerId, { kind: "order_update", title: "Your order is on its way", body: `The courier has left ${s.name} for ${o.shippingAddress}.${demo}`, orderId: o.id });
  if (o.status === "delivered") notify(o.customerId, { kind: "order_update", title: "Delivered", body: `Your ${s.name} order has arrived. Stay fresh.`, orderId: o.id });
}

// ---------- Helpers ----------

const publicUser = (u: User) => ({
  id: u.id, name: u.name, email: u.email, role: u.role, barberId: u.barberId, countryCode: u.countryCode, city: u.city, preferences: u.preferences, alerts: u.alerts,
  photoUrl: u.photoUrl, phone: u.phone, whatsapp: u.whatsapp, birthday: u.birthday, favourites: u.favourites, rebook: u.rebook, credit: u.credit, ...(u.manages ? { manages: u.manages } : {}), ...(isAdmin(u) ? { admin: true, adminRole: adminRole(u) } : {}) });

// ---------- The Club, gift cards (mirrors server/src/club.ts) ----------

const clubCurrency = (code?: string) => {
  const c = (code && country(code)?.currency) || "eur";
  return seed.giftAmounts[c] ? c : "eur";
};
const DAY = 86_400_000;
const activeMembership = (u?: User) => (u?.membership && Date.parse(u.membership.paidUntil) > Date.now() ? u.membership : null);
const planOf = (id: string) => seed.plans.find((p) => p.id === id);

function cutsUsed(u: User) {
  const m = u.membership;
  if (!m) return 0;
  const end = Date.parse(m.paidUntil);
  const periods = Math.max(1, Math.ceil((end - Date.now()) / (30 * DAY)));
  const from = Math.max(end - periods * 30 * DAY, Date.parse(m.since));
  return saved.bookings.filter((b) => b.customerId === u.id && b.coveredBy === "membership" && b.status !== "cancelled" && Date.parse(b.createdAt) >= from && Date.parse(b.createdAt) < from + 30 * DAY).length;
}

function membershipView(u: User) {
  const m = u.membership;
  if (!m) return null;
  const plan = planOf(m.plan)!;
  return {
    plan: plan.id, name: plan.name, number: m.number, since: m.since, paidUntil: m.paidUntil, active: Date.parse(m.paidUntil) > Date.now(),
    cutsLeft: plan.cutsPerPeriod === null ? null : Math.max(0, plan.cutsPerPeriod - cutsUsed(u)),
    productDiscount: plan.productDiscount, freeHomeVisits: plan.freeHomeVisits, perks: plan.perks,
  };
}

const CODE_CHARS = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
const block = () => Array.from({ length: 4 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join("");
const giftView = (g: GiftCard, viewerId?: string) => ({ ...g, code: g.status !== "pending_payment" && g.buyerId === viewerId ? g.code : null, buyerId: undefined });

function fulfil(p: Purchase) {
  if (p.status === "paid") return;
  p.status = "paid";
  const u = saved.users.find((x) => x.id === p.userId);
  if (p.kind === "membership" && u) {
    const plan = planOf(p.ref)!;
    const now = Date.now();
    const cur = u.membership;
    const live = cur && Date.parse(cur.paidUntil) > now;
    const start = live && cur.plan === plan.id ? Date.parse(cur.paidUntil) : now;
    u.membership = {
      plan: plan.id, currency: p.currency,
      number: cur?.number ?? `AF-${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}-${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`,
      since: live ? cur!.since : new Date(now).toISOString(), paidUntil: new Date(start + 30 * DAY).toISOString(),
    };
    notify(u.id, { kind: "club", title: `Welcome to The Club — ${plan.name}`, body: `Your member card is in Account → The Club. ${plan.perks[0]}.` });
  }
  if (p.kind === "gift") {
    const g = (saved.giftCards ?? []).find((x) => x.id === p.ref);
    if (g && g.status === "pending_payment") {
      g.status = "active";
      notify(p.userId, { kind: "gift", title: "Your gift card is ready", body: `Send ${g.toName} the code ${g.code}. They redeem it in Account → Gift cards.` });
    }
  }
  if (p.kind === "tip") {
    const b = saved.bookings.find((x) => x.id === p.ref);
    if (b) b.tip = (b.tip ?? 0) + p.amount;
  }
}

function newPurchase(userId: string, kind: Purchase["kind"], ref: string, label: string, amount: number, currency: string) {
  const p: Purchase = { id: newId(), userId, kind, ref, label, amount, currency, status: "pending_payment" };
  (saved.purchases ??= []).push(p);
  persist();
  return { purchase: p, clientSecret: null, demoPayments: true };
}

function currentUser(token: string | null) {
  const id = token ? saved.sessions[token] : undefined;
  return id ? saved.users.find((u) => u.id === id) : undefined;
}

function requireUser(token: string | null) {
  const u = currentUser(token);
  if (!u) throw new DemoError(401, "Please sign in.");
  return u;
}

// ---------- Alerts (mirrors server/src/notify.ts) ----------

function notify(userId: string, n: { kind: string; title: string; body: string; bookingId?: string; orderId?: string; hireId?: string }) {
  (saved.notifications ??= []).push({ id: newId(), userId, ...n, read: false, createdAt: new Date().toISOString() });
}

function alertDetails(b: Booking) {
  const barber = getBarber(b.barberId);
  const tz = timeZoneOf(barber);
  const fmt = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-GB", { timeZone: tz, ...o }).format(new Date(b.startsAt));
  return {
    barber,
    first: barber.name.split(" ")[0],
    service: findService(barber, b.serviceId)?.name ?? CONSULTATION.name,
    consult: b.serviceId === CONSULTATION.id,
    when: `${fmt({ weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })} (${barber.city} time)`,
    time: fmt({ hour: "2-digit", minute: "2-digit" }),
    where: { shop: `at ${barber.shopAddress}`, home: `at ${b.address}`, video: "by video call", phone: "by phone" }[b.locationType],
  };
}

function bookingConfirmed(b: Booking) {
  const d = alertDetails(b);
  if (Date.parse(b.startsAt) - Date.now() < 24 * 3_600_000) b.remindedDay = true;
  notify(b.customerId, { kind: "booking_confirmed", title: d.consult ? "Consultation booked" : "You're booked", body: `${d.service} with ${d.barber.name}, ${d.when}, ${d.where}.`, bookingId: b.id });
  // The demo's barbers are fictional, so nobody taps "On my way" — play that alert shortly after booking.
  if (b.locationType === "home") b.demoOnTheWayAt = Date.now() + 20_000;
}

function dueReminders(now = new Date()) {
  runPerks(now);
  // The demo's shops are fictional, so play the courier's steps on a timer.
  for (const o of saved.orders) {
    if (o.status === "paid" && o.demoOutAt && now.getTime() >= o.demoOutAt) {
      o.status = "out_for_delivery";
      o.demoOutAt = undefined;
      orderAlert(o);
    }
    if (o.status === "out_for_delivery" && o.demoDeliveredAt && now.getTime() >= o.demoDeliveredAt) {
      o.status = "delivered";
      o.demoDeliveredAt = undefined;
      orderAlert(o);
    }
  }
  for (const b of saved.bookings) {
    if (b.status === "confirmed" && b.demoOnTheWayAt && now.getTime() >= b.demoOnTheWayAt) {
      const d = alertDetails(b);
      b.status = "on_the_way";
      b.demoOnTheWayAt = undefined;
      notify(b.customerId, { kind: "on_the_way", title: `${d.first} is on the way`, body: `Heading to ${b.address} for your ${d.time} ${d.service.toLowerCase()}. (Demo: in the app this arrives when your barber taps "On my way".)`, bookingId: b.id });
      continue;
    }
    if (b.status !== "confirmed") continue;
    const left = Date.parse(b.startsAt) - now.getTime();
    if (left <= 0) continue;
    const d = alertDetails(b);
    if (!b.remindedHour && left <= 60 * 60_000) {
      b.remindedHour = b.remindedDay = true;
      notify(b.customerId, { kind: "reminder", title: `${d.service} in 1 hour`, body: `${d.service} with ${d.barber.name} at ${d.time}, ${d.where}.`, bookingId: b.id });
    } else if (!b.remindedDay && left <= 24 * 3_600_000) {
      b.remindedDay = true;
      notify(b.customerId, { kind: "reminder", title: "Coming up", body: `${d.service} with ${d.barber.name}, ${d.when}, ${d.where}.`, bookingId: b.id });
    }
  }
}

/** The free 15-minute video or phone consultation every barber offers unless they turn it off. */
const CONSULTATION = { id: "consultation", name: "Free consultation", durationMin: 15, price: 0 };
const findService = (b: SeedBarber, id: string) => (id === CONSULTATION.id ? (b.offersConsultations !== false ? CONSULTATION : undefined) : b.services.find((s) => s.id === id));

/** The extras a customer picked (hot towel, massage…), checked against the barber's menu. */
function extrasOf(b: SeedBarber, ids: string[]) {
  const out = [...new Set(ids)].map((id) => b.services.find((s) => s.id === id));
  if (out.some((s) => !s || s.category !== "extras")) throw new DemoError(400, "One of the extras isn't on this barber's menu.");
  return out as SeedService[];
}

function bookingView(b: Booking) {
  const barber = getBarber(b.barberId);
  return {
    ...b,
    shareToken: undefined, // only the customer gets it, through "share my visit"
    cancelTerms: cancelTerms(b),
    extras: (b.extras ?? []).map((id) => barber.services.find((s) => s.id === id)).filter((s): s is SeedService => !!s).map((s) => ({ id: s.id, name: s.name, durationMin: s.durationMin, price: s.price })),
    barber: { id: barber.id, name: barber.name, photoUrl: barber.photoUrl, city: barber.city, timeZone: timeZoneOf(barber) },
    shop: b.locationType === "shop" ? shopRef(barber.shopId) : null,
    customerName: b.guest?.name ?? saved.users.find((u) => u.id === b.customerId)?.name ?? "Customer",
    bookedBy: b.guest ? saved.users.find((u) => u.id === b.customerId)?.name ?? null : null,
    customerPreferences: saved.users.find((u) => u.id === b.customerId)?.preferences ?? null,
    service: findService(barber, b.serviceId) ?? (b.serviceId === CONSULTATION.id ? CONSULTATION : undefined),
    videoLink: b.locationType === "video" && ["confirmed", "on_the_way"].includes(b.status) ? barber.videoLink ?? null : null,
  };
}

// ---------- Invites, birthdays, rebook reminders, share my visit (mirrors server/src/rewards.ts) ----------

const GIFT: Record<string, { referral: number; birthday: number }> = { aed: { referral: 2500, birthday: 2000 }, eur: { referral: 1000, birthday: 500 }, gbp: { referral: 1000, birthday: 500 }, usd: { referral: 1000, birthday: 500 } };
const giftFor = (currency: string) => GIFT[currency] ?? GIFT.eur!;
const currencyOf = (u: User) => (u.countryCode && country(u.countryCode)?.currency) || "aed";
const addCredit = (u: User, currency: string, amount: number) => {
  u.credit = { ...u.credit, [currency]: (u.credit?.[currency] ?? 0) + amount };
};

function referralCode(u: User) {
  if (!u.referralCode) {
    const abc = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
    let code = "";
    do code = `FRESH-${Array.from({ length: 5 }, () => abc[Math.floor(Math.random() * abc.length)]).join("")}`;
    while (saved.users.some((x) => x.referralCode === code));
    u.referralCode = code;
    persist();
  }
  return u.referralCode;
}

function onCompleted(b: Booking) {
  const customer = saved.users.find((u) => u.id === b.customerId);
  if (!customer || customer.deletedAt) return;
  if (customer.referredBy && !customer.referralRewarded) {
    customer.referralRewarded = true;
    const amount = giftFor(b.currency).referral;
    addCredit(customer, b.currency, amount);
    notify(customer.id, { kind: "gift", title: "Your welcome credit is in", body: "Thanks for your first cut with Always Fresh. Your invite credit is ready for the next one." });
    const friend = saved.users.find((u) => u.id === customer.referredBy && !u.deletedAt);
    if (friend) {
      addCredit(friend, b.currency, amount);
      notify(friend.id, { kind: "gift", title: `${customer.name.split(" ")[0]} had their first cut`, body: "You both got credit for your next booking. Thanks for spreading the word." });
    }
  }
  if (customer.rebook && customer.rebook.barberId === b.barberId) {
    customer.rebook.nextAt = new Date(Date.parse(b.startsAt) + (customer.rebook.everyWeeks * 7 - 2) * 86_400_000).toISOString();
  }
}

function runPerks(now = new Date()) {
  for (const u of saved.users) {
    if (u.deletedAt) continue;
    if (u.rebook && Date.parse(u.rebook.nextAt) <= now.getTime()) {
      const r = u.rebook;
      r.nextAt = new Date(now.getTime() + r.everyWeeks * 7 * 86_400_000).toISOString();
      const hasUpcoming = saved.bookings.some((b) => b.customerId === u.id && ["confirmed", "pending_payment"].includes(b.status) && Date.parse(b.startsAt) > now.getTime());
      const barber = allBarbers().find((b) => b.id === r.barberId);
      const service = barber && (findService(barber, r.serviceId) ?? barber.services[0]);
      if (hasUpcoming || !barber || !service || (barber.status ?? "live") !== "live") continue;
      let next: string | undefined;
      for (const date of localDates(timeZoneOf(barber), 10)) if (!next) next = slots(barber, date, service.durationMin, now)[0];
      const when = next ? new Intl.DateTimeFormat("en-GB", { timeZone: timeZoneOf(barber), weekday: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(next)) : null;
      const first = barber.name.split(" ")[0];
      notify(u.id, { kind: "reminder", title: "Time for a fresh cut", body: when ? `It's been ${r.everyWeeks} weeks. ${first} is free ${when} — tap to book your usual.` : `It's been ${r.everyWeeks} weeks. Book your next ${service.name.toLowerCase()} with ${first}.` });
    }
    if (u.birthday && u.birthdayGiftYear !== now.getUTCFullYear()) {
      const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dubai", month: "2-digit", day: "2-digit" }).format(now);
      if (today === u.birthday) {
        u.birthdayGiftYear = now.getUTCFullYear();
        const cur = currencyOf(u);
        addCredit(u, cur, giftFor(cur).birthday);
        notify(u.id, { kind: "gift", title: `Happy birthday, ${u.name.split(" ")[0]}`, body: "A birthday treat from Always Fresh is in your account. Use it on your next cut or our products." });
      }
    }
  }
}

function visitView(b: Booking) {
  const barber = getBarber(b.barberId);
  const customer = saved.users.find((u) => u.id === b.customerId);
  return {
    barber: { name: barber.name, photoUrl: barber.photoUrl, verified: !!barber.verified, phoneSafety: "999" },
    customerFirstName: (b.guest?.name ?? customer?.name ?? "").split(" ")[0],
    status: b.status === "confirmed" && Date.parse(b.endsAt) < Date.now() ? "completed" : b.status,
    startsAt: b.startsAt, endsAt: b.endsAt, timeZone: timeZoneOf(barber),
    service: findService(barber, b.serviceId)?.name ?? "Appointment",
    area: b.locationType === "home" ? (b.address.split(",").slice(-2).join(",").trim() || barber.city) : barber.shopAddress,
    venue: b.venue?.kind ?? null,
    appUrl: typeof location !== "undefined" ? location.origin : "",
  };
}

function reelView(r: SeedReel, viewerId?: string) {
  const b = barberView(getBarber(r.barberId));
  const likedBy = saved.likes[r.id] ?? [];
  const stats = saved.reelStats?.[r.id] ?? { views: 0, shares: 0 };
  return {
    id: r.id, videoUrl: r.videoUrl, posterUrl: r.posterUrl ?? null, caption: r.caption, likes: r.likes + likedBy.length,
    likedByMe: !!viewerId && likedBy.includes(viewerId), createdAt: r.createdAt,
    savedByMe: !!viewerId && (saved.saves?.[r.id] ?? []).includes(viewerId),
    comments: (r.comments?.length ?? 0) + (saved.reelComments?.[r.id]?.length ?? 0),
    views: (r.views ?? 0) + stats.views, shares: (r.shares ?? 0) + stats.shares,
    barber: { id: b.id, name: b.name, photoUrl: b.photoUrl, city: b.city, rating: b.rating, ratingCount: b.ratingCount, startingPrice: b.startingPrice, currency: b.currency, offersHomeVisits: b.offersHomeVisits },
  };
}

const currencyFor = (code?: string) => {
  const cur = (code && country(code)?.currency) || "eur";
  return seed.shipping[cur] ? cur : "eur";
};

const fmtLocal = (iso: string, tz: string) => new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: tz }).format(new Date(iso));

// ---------- Built-in concierge and stylist ----------
// The demo answers from its own barbers, bookings and help centre. The real app uses the server's AI for both.

type Look = { name: string; category: "haircut" | "color" | "beard"; description: string; whyItSuits: string; length: string; maintenance: string; askYourBarber: string; specialtyTags: string[]; vibes: string[] };
const LOOKS: Look[] = [
  { name: "Skin fade with textured top", category: "haircut", description: "Sides faded to the skin, a few centimetres of texture on top.", whyItSuits: "Sharp and modern, and it works with most hair types.", length: "short", maintenance: "high", askYourBarber: "Skin fade on the sides, blended high, keep 4–5 cm on top and texture it with scissors.", specialtyTags: ["skin fade", "textured crop"], vibes: ["trendy", "bold"] },
  { name: "Classic taper", category: "haircut", description: "Gradual taper at the sides and neckline, neat length on top.", whyItSuits: "Clean and timeless — looks right at work and at the weekend.", length: "short", maintenance: "medium", askYourBarber: "Low taper, a number 2 blending up, scissor cut on top and a natural neckline.", specialtyTags: ["taper", "scissor cut"], vibes: ["clean & classic", "professional"] },
  { name: "French crop", category: "haircut", description: "Short sides with a forward fringe cut straight across.", whyItSuits: "Low effort and smart; easy to style in the morning.", length: "short", maintenance: "low", askYourBarber: "Mid fade, crop on top pushed forward with a short blunt fringe.", specialtyTags: ["french crop", "textured crop"], vibes: ["trendy", "natural"] },
  { name: "Side part", category: "haircut", description: "Tapered sides with a hard or soft parting and length to comb over.", whyItSuits: "Polished and professional — a boardroom favourite.", length: "medium", maintenance: "medium", askYourBarber: "Scissor-over-comb sides, a side parting on the left, leave 6–7 cm on top.", specialtyTags: ["side part", "scissor cut"], vibes: ["clean & classic", "professional"] },
  { name: "Buzz cut with sharp line-up", category: "haircut", description: "One length all over, crisp edges at the hairline.", whyItSuits: "The lowest-maintenance cut there is, and very clean.", length: "very short", maintenance: "low", askYourBarber: "Number 2 all over with a sharp line-up at the front and temples.", specialtyTags: ["buzz cut", "line-up"], vibes: ["bold", "natural"] },
  { name: "Curtains", category: "haircut", description: "Middle parting with longer, soft lengths framing the face.", whyItSuits: "Relaxed and on-trend if you're growing it out.", length: "medium", maintenance: "medium", askYourBarber: "Keep the length, middle part, tidy the sides and back with scissors.", specialtyTags: ["curtains", "long hair"], vibes: ["trendy", "natural"] },
  { name: "Waves with a taper", category: "haircut", description: "Short, brushed waves with a low taper.", whyItSuits: "Shows off texture with a neat outline.", length: "very short", maintenance: "high", askYourBarber: "Low taper, keep the top at a number 1.5 for waves, sharp line-up.", specialtyTags: ["waves", "taper", "afro"], vibes: ["bold", "trendy"] },
  { name: "Pompadour", category: "haircut", description: "Volume swept up and back, short sides.", whyItSuits: "A statement cut with classic roots.", length: "medium", maintenance: "high", askYourBarber: "Short faded sides, keep 8 cm at the front graduating back, styled up and back.", specialtyTags: ["pompadour", "quiff"], vibes: ["bold", "clean & classic"] },
  { name: "Natural long layers", category: "haircut", description: "Shoulder-length hair with light layers to remove weight.", whyItSuits: "Keeps the length while giving it shape and movement.", length: "long", maintenance: "low", askYourBarber: "Keep the length, add light layers and a soft finish at the ends.", specialtyTags: ["long hair", "curly hair"], vibes: ["natural"] },
  { name: "Ash or dark-brown tone", category: "color", description: "A subtle colour refresh or grey blending.", whyItSuits: "Adds depth without looking dyed.", length: "any", maintenance: "medium", askYourBarber: "Subtle grey blending, one shade from my natural colour.", specialtyTags: ["hair color"], vibes: ["professional", "clean & classic", "natural"] },
  { name: "Short boxed beard", category: "beard", description: "A trimmed, defined beard with clean cheek and neck lines.", whyItSuits: "Frames the jaw and pairs with almost any cut.", length: "any", maintenance: "medium", askYourBarber: "Trim to 1 cm, define the cheek line and the neckline two fingers above the Adam's apple.", specialtyTags: ["beard", "line-up"], vibes: ["clean & classic", "professional", "bold"] },
  { name: "Hot towel shave", category: "beard", description: "A full traditional shave with hot towels.", whyItSuits: "The cleanest finish for events and big days.", length: "any", maintenance: "high", askYourBarber: "Traditional hot towel shave, against the grain on the second pass.", specialtyTags: ["hot towel shave"], vibes: ["clean & classic", "professional"] },
];

function haircutAdvice(body: { preferences?: Record<string, string>; country?: string; city?: string }) {
  const p = body.preferences ?? {};
  const fits = (l: Look) => (!p.length || l.length === "any" || l.length === p.length ? 2 : 0) + (!p.maintenance || l.maintenance === p.maintenance ? 1 : 0) + (!p.vibe || l.vibes.includes(p.vibe) ? 2 : 0);
  const pick = (cat: Look["category"], n: number) => LOOKS.filter((l) => l.category === cat).sort((a, b) => fits(b) - fits(a)).slice(0, n);
  const recommendations = [...pick("haircut", 4), ...pick("color", 1), ...pick("beard", 1)].map(({ vibes: _v, ...l }) => ({ ...l, previewPrompt: l.name }));
  const wanted = new Set(recommendations.flatMap((r) => r.specialtyTags));
  const barbers = allBarbers()
    .filter((b) => (b.status ?? "live") === "live" && (!body.country || b.countryCode === body.country) && (!body.city || b.city === body.city))
    .map((b) => ({ b, score: b.specialties.filter((s) => wanted.has(s)).length }))
    .filter((x) => x.score > 0)
    .sort((x, y) => y.score - x.score || rating(y.b).raw - rating(x.b).raw)
    .slice(0, 5)
    .map((x) => barberView(x.b));
  const chosen = [p.length, p.maintenance, p.vibe].filter(Boolean).join(", ");
  return {
    advice: {
      faceShape: "", hairType: "", currentStyle: "",
      summary: `${chosen ? `Picked for ${chosen}.` : "A mix of our most-booked looks."} In the full app, the AI stylist also reads your face shape and hair from the photo.`,
      beardAdvice: "",
      recommendations,
    },
    barbers,
  };
}

const words = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s'-]/g, " ").split(/\s+/).filter(Boolean);
/** "cancellation", "cancelled", "cancel" → "cancel": enough to match help-centre questions. */
const stem = (w: string) => w.replace(/(lations?|ations?|ings?|ed|es|s)$/, "").slice(0, 6);
/** Whole dirhams as "AED 120"; other currencies keep their cents. */
const price = (minor: number, currency: string) =>
  new Intl.NumberFormat("en", { style: "currency", currency: currency.toUpperCase(), ...(minor % 100 === 0 ? { minimumFractionDigits: 0, maximumFractionDigits: 0 } : {}) }).format(minor / 100);
const STOP = new Set(["a", "an", "the", "i", "me", "my", "is", "are", "do", "does", "can", "to", "for", "of", "in", "on", "and", "or", "it", "you", "your", "what", "how", "with", "if", "be", "at", "get", "want", "need", "please"]);

function faqAnswer(text: string) {
  const asked = new Set(words(text).filter((w) => !STOP.has(w) && w.length > 2).map(stem));
  let best: { score: number; answer: string } | null = null;
  for (const f of seed.faq) {
    const qw = new Set(words(f.question).filter((w) => !STOP.has(w) && w.length > 2).map(stem));
    const aw = new Set(words(f.answer).map(stem));
    const score = [...asked].reduce((n, w) => n + (qw.has(w) ? 2 : aw.has(w) ? 0.5 : 0), 0);
    if (score > (best?.score ?? 0)) best = { score, answer: f.answer };
  }
  return best && best.score >= 2 ? best.answer : null;
}

function barberLine(v: ReturnType<typeof barberView>) {
  const bits = [v.rating ? `${v.rating.toFixed(1)}★ (${v.ratingCount})` : "new", `from ${price(v.startingPrice, v.currency)}`];
  if (v.nextAvailable) bits.push(`next free ${fmtLocal(v.nextAvailable, v.timeZone)}`);
  if (v.offersHomeVisits) bits.push("comes to you");
  return `• ${v.name} — ${bits.join(" · ")}`;
}

/** Understands the common requests: find a barber, a named barber, my bookings, help-centre questions, talking to a person. */
function localConcierge(message: string, ctx: { country?: string; city?: string }, user: User | undefined, actions: AssistantAction[]) {
  const t = message.toLowerCase();
  const all = allBarbers().filter((b) => (b.status ?? "live") === "live");

  if (/\b(my|upcoming|next)\b.*\b(booking|bookings|appointment|appointments)\b|\bwhen is my\b/.test(t)) {
    if (!user) return "Sign in first (Account tab) and I'll show your bookings.";
    const mine = saved.bookings.filter((b) => b.customerId === user.id && fromApp(b) && b.status !== "cancelled" && Date.parse(b.endsAt) > Date.now()).sort((a, b) => a.startsAt.localeCompare(b.startsAt));
    if (!mine.length) return "You have no upcoming bookings. Want me to find you a barber? Try “skin fade tomorrow”.";
    return `Your upcoming bookings:\n${mine.slice(0, 5).map((bk) => {
      const b = getBarber(bk.barberId);
      return `• ${findService(b, bk.serviceId)?.name ?? CONSULTATION.name} with ${b.name}, ${fmtLocal(bk.startsAt, timeZoneOf(b))} (${b.city} time)`;
    }).join("\n")}\nYou can change or cancel them in the Bookings tab.`;
  }

  if (/\b(human|person|someone|agent|complain|complaint|no.?show|dispute|support)\b/.test(t)) {
    return `I'll get you to the team. Open Account → Help centre → Contact us and they'll reply by email, or write to ${seed.supportEmail}. Tell them your booking date and barber so they can sort it quickly.`;
  }

  if (/\b(suit|suits|recommend a (cut|style)|which (cut|style)|what (cut|style)|try.?on)\b/.test(t)) {
    return "Try the AI Try-On (Home → AI Try-On): pick your length, upkeep and style, and it suggests cuts, colour and beard looks — with barbers who do them.";
  }

  const named = all.find((b) => t.includes(b.name.toLowerCase()) || t.includes(b.name.split(" ")[0]!.toLowerCase()));
  if (named) {
    const v = barberView(named);
    actions.push({ type: "barbers", barberIds: [v.id] });
    const services = v.services.slice(0, 4).map((s) => `${s.name} ${price(s.price, v.currency)}`).join(" · ");
    if (/\bbook\b/.test(t) && v.nextAvailable) {
      const s = [...v.services].sort((a, b) => a.price - b.price)[0]!;
      actions.push({ type: "book", barberId: v.id, serviceId: s.id, startsAt: v.nextAvailable, locationType: "shop" });
      return `${v.name}'s next free time is ${fmtLocal(v.nextAvailable, v.timeZone)} (${v.city} time) for a ${s.name.toLowerCase()} at ${price(s.price, v.currency)}. Tap “Review & book” below to confirm and pay — or open the profile to pick another time.`;
    }
    return `${barberLine(v).slice(2)}\n${services}\n${v.shopAddress}`;
  }

  const policy = faqAnswer(message);
  if (policy && /\b(cancel\w*|refund\w*|pay\w*|apple|google|card|tip\w*|club|member\w*|gift\w*|account|delet\w*|late|safe\w*|fees?|chang\w*|reschedul\w*|polic\w*|rules?|how)\b/.test(t)) return policy;

  // Find barbers
  const specialties = [...new Set(all.flatMap((b) => b.specialties))];
  let wanted = specialties.filter((s) => t.includes(s));
  if (!wanted.length && /\bfade\b/.test(t)) wanted = specialties.filter((s) => s.includes("fade"));
  if (!wanted.length && /\bbeard\b/.test(t)) wanted = ["beard"];
  if (!wanted.length && /\b(kid|kids|son|child|children)\b/.test(t)) wanted = ["kids cut"];
  if (!wanted.length && /\bshave\b/.test(t)) wanted = ["hot towel shave"];
  const cities = seed.countries.flatMap((c) => c.cities.map((x) => ({ country: c.code, city: x.name })));
  const place = cities.find((c) => t.includes(c.city.toLowerCase()));
  const looksLikeSearch = wanted.length || place || /\b(barber|barbers|cut|haircut|fade|trim|today|tonight|tomorrow|now|home|hotel|office|near|best|cheap|price|book)\b/.test(t);
  if (!looksLikeSearch) {
    if (policy) return policy;
    return "I can find you a barber (try “skin fade tonight” or “barber who comes to my hotel”), show your bookings, or answer questions about payments, cancellations, The Club and gift cards.";
  }
  const f: Filters = {
    country: place?.country ?? ctx.country, city: place?.city ?? ctx.city, specialties: wanted.length ? wanted : undefined,
    availableToday: /\b(today|tonight|now|asap)\b/.test(t), homeVisits: /\b(home|hotel|office|villa|yacht|my place|come to me|comes to me)\b/.test(t),
    sort: /\b(cheap|cheapest|budget|affordable|lowest)\b/.test(t) ? "price" : /\b(soon|soonest|earliest|asap|now)\b/.test(t) ? "soonest" : /\b(experience|experienced|senior|master)\b/.test(t) ? "experience" : undefined,
    limit: 3,
  };
  let found = search(f);
  let note = "";
  if (!found.length && f.availableToday) {
    found = search({ ...f, availableToday: false, sort: "soonest" });
    note = "Nobody has a free slot today, so here are the soonest: ";
  }
  if (!found.length && f.city) {
    found = search({ ...f, city: undefined });
    if (found.length) note = `Nothing in ${f.city} for that — here's the best across ${country(f.country ?? "")?.name ?? "the country"}: `;
  }
  if (!found.length) return "I couldn't find a match. Try fewer details, another area, or browse the map on Home.";
  actions.push({ type: "barbers", barberIds: found.map((b) => b.id) });
  const what = [wanted.join(", "), f.homeVisits ? "who come to you" : "", f.availableToday && !note ? "free today" : ""].filter(Boolean).join(" ");
  return `${note || `Top ${what ? `${what} ` : ""}barbers${f.city ? ` in ${f.city}` : ""}: `}\n${found.map(barberLine).join("\n")}\nTap a barber to see their work and book.`;
}

async function chat(body: { conversationId?: string; message: string; country?: string; city?: string }, user: User | undefined, ownerKey: string) {
  let convo = body.conversationId ? saved.conversations.find((c) => c.id === body.conversationId && c.ownerKey === ownerKey) : undefined;
  if (!convo) convo = { id: newId(), ownerKey, turns: [], display: [] };
  const actions: AssistantAction[] = [];
  const text = localConcierge(body.message, { country: body.country, city: body.city }, user, actions);
  const at = new Date().toISOString();
  convo.turns.push({ role: "user", content: body.message }, { role: "assistant", content: text });
  convo.display.push({ role: "user", text: body.message, at }, { role: "assistant", text, actions, at });
  if (!saved.conversations.includes(convo)) saved.conversations.push(convo);
  persist();
  return { conversationId: convo.id, reply: text, actions };
}

// ---------- Router ----------

type Body = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

// ---------- Barbers' business side and the team's admin panel (mirrors server/src/routes/business.ts, admin.ts, demoAccounts.ts) ----------

/** Sample logins shown on the demo's sign-in screen. */
export const DEMO_LOGINS = {
  admin: { email: "admin@demo.alwaysfresh.app", password: "fresh-team-demo" },
  barber: { email: "mateo@demo.alwaysfresh.app", password: "fresh-barber-demo", barberId: "b37" },
  shop: { email: "owner@demo.alwaysfresh.app", password: "fresh-shop-demo", shopId: "s-dubai-downtown" },
};
const adminRole = (u?: User): AdminRole | null => (!u ? null : u.email === DEMO_LOGINS.admin.email ? "owner" : saved.settings?.team?.[u.email] ?? null);
const isAdmin = (u?: User) => adminRole(u) !== null;
/** The admin panel's activity log (what the team did). */
function logActivity(me: User, action: string, target: string, detail?: string) {
  (saved.activity ??= []).push({ id: newId(), at: new Date().toISOString(), by: { id: me.id, name: me.name, email: me.email }, action, target, ...(detail ? { detail } : {}) });
  if (saved.activity.length > 500) saved.activity.splice(0, saved.activity.length - 500);
}
const PAID = new Set<Booking["status"]>(["confirmed", "on_the_way", "completed"]);
/** Booked and paid in the app (not a walk-in the barbershop added): only these carry the Always Fresh fee. */
const fromApp = (b: Booking) => b.source !== "shop";
const feePercent = () => saved.settings?.platformFeePercent ?? 10;
const reviewNewBarbers = () => saved.settings?.reviewNewBarbers ?? true;
const platformFee = (amount: number) => Math.round((amount * feePercent()) / 100);
/** Always Fresh's fee on a booking: not on the extra travel of a far home visit, which is all the barber's (mirrors bookingFee). */
const bookingFee = (b: Booking) => platformFee(Math.max(0, b.amount - (b.travelFee ?? 0)));

// Home visits further away (mirrors server/src/travel.ts): the visit fee covers the first km from the barber's pin,
// each km beyond adds a rate for the barber's taxi there and back, and each barber sets how far they go.
const TRAVEL_PER_KM: Record<string, number> = { sar: 400, eur: 100, gbp: 100, usd: 100, cad: 150, aud: 150, try: 3000, ngn: 50000, brl: 500 };
const travelIncludedKm = () => saved.settings?.travelIncludedKm ?? 10;
const perKmFor = (currency: string) => (currency === "aed" ? saved.settings?.travelPerKmAed ?? 400 : TRAVEL_PER_KM[currency] ?? 100);
const maxKmOf = (b: SeedBarber) => b.travelMaxKm ?? 30;
function roadKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const rad = (d: number) => (d * Math.PI) / 180;
  const h = Math.sin(rad(b.lat - a.lat) / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(rad(b.lng - a.lng) / 2) ** 2;
  return Math.max(1, Math.round(6371 * 2 * Math.asin(Math.sqrt(h)) * 1.3));
}
function travelQuote(b: SeedBarber, spot: { lat: number; lng: number }) {
  const km = roadKm(b, spot);
  const currency = country(b.countryCode)!.currency;
  const includedKm = travelIncludedKm();
  const perKm = perKmFor(currency);
  const extraKm = Math.max(0, km - includedKm);
  const fee = extraKm && perKm ? Math.ceil((extraKm * perKm) / 500) * 500 : 0;
  return { km, minutes: Math.max(10, Math.round((km / 45) * 12) * 5), includedKm, extraKm, perKm, fee, maxKm: maxKmOf(b), tooFar: km > maxKmOf(b), currency, visitFee: b.homeVisitFee };
}
const statusOf = (b: SeedBarber) => b.status ?? "live";
const isLive = (b: SeedBarber) => statusOf(b) === "live";
const removedReels = () => new Set(saved.removedReels ?? []);
const liveReels = () => [...memoryReels, ...seed.reels].filter((r) => !removedReels().has(r.id));

function byCurrency(items: { currency: string; amount: number }[]) {
  const sums = new Map<string, number>();
  for (const i of items) sums.set(i.currency, (sums.get(i.currency) ?? 0) + i.amount);
  return [...sums].map(([currency, amount]) => ({ currency, amount })).sort((a, b) => b.amount - a.amount);
}

function profileChecklist(b: SeedBarber) {
  const reels = liveReels().filter((r) => r.barberId === b.id).length;
  return [
    { key: "photo", label: "Add a profile photo", done: !!b.photoUrl },
    { key: "bio", label: "Write a short bio", done: b.bio.trim().length >= 20 },
    { key: "services", label: "Set your services and prices", done: b.services.length >= 2 },
    { key: "work", label: "Show at least 3 photos or before-and-afters", done: b.gallery.length + b.transformations.length >= 3 },
    { key: "pin", label: "Put your exact pin on the map", done: !!b.pinSetAt || !b.joinedAt },
    { key: "reel", label: "Post your first reel", done: reels > 0 },
  ];
}

function earnings(list: Booking[], since: number, until = Infinity) {
  const within = (b: Booking) => fromApp(b) && Date.parse(b.startsAt) >= since && Date.parse(b.startsAt) < until; // walk-ins are paid at the shop
  const inRange = list.filter((b) => PAID.has(b.status) && within(b));
  const lateFees = list.filter((b) => b.status === "cancelled" && b.lateFee && within(b)).reduce((s, b) => s + b.lateFee!, 0);
  const gross = inRange.reduce((s, b) => s + b.amount, 0) + lateFees;
  const tips = inRange.reduce((s, b) => s + (b.tip ?? 0), 0);
  const fee = inRange.reduce((s, b) => s + bookingFee(b), 0) + platformFee(lateFees);
  return { count: inRange.length, gross, fee, tips, net: gross - fee + tips, lateFees };
}

function localStarts(tz: string) {
  const p = Object.fromEntries(new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit", weekday: "short" }).formatToParts(new Date()).map((x) => [x.type, x.value]));
  const today = `${p.year}-${p.month}-${p.day}`;
  const sinceMonday = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(p.weekday);
  const monday = new Date(Date.parse(`${today}T12:00:00Z`) - Math.max(0, sinceMonday) * DAY).toISOString().slice(0, 10);
  return { day: zonedTime(today, 0, 0, tz).getTime(), week: zonedTime(monday, 0, 0, tz).getTime(), month: zonedTime(`${p.year}-${p.month}-01`, 0, 0, tz).getTime() };
}

function business(b: SeedBarber) {
  const tz = timeZoneOf(b);
  const now = Date.now();
  const starts = localStarts(tz);
  const mine = saved.bookings.filter((x) => x.barberId === b.id);
  const active = mine.filter((x) => PAID.has(x.status));
  const today = active.filter((x) => Date.parse(x.startsAt) >= starts.day && Date.parse(x.startsAt) < starts.day + DAY).sort((a, c) => a.startsAt.localeCompare(c.startsAt));
  const upcoming = active.filter((x) => x.status !== "completed" && Date.parse(x.endsAt) > now).sort((a, c) => a.startsAt.localeCompare(c.startsAt));
  const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: tz });
  const week = Array.from({ length: 7 }, (_, i) => fmt.format(new Date(now + i * DAY))).map((date) => ({
    date,
    count: upcoming.filter((x) => fmt.format(new Date(x.startsAt)) === date).length,
    working: b.workingDays.includes(new Date(`${date}T12:00:00Z`).getUTCDay()) && !b.timeOff?.includes(date),
  }));
  return {
    barber: barberView(b), status: statusOf(b), verified: !!b.verified, currency: country(b.countryCode)!.currency, feePercent: feePercent(),
    application: { status: applicationStatus(b), missing: missingItems(applicationOf(b.id), b).length, rejectionReason: applicationOf(b.id)?.rejectionReason ?? null },
    today: today.map(bookingView), next: upcoming[0] ? bookingView(upcoming[0]) : null, upcomingCount: upcoming.length, week,
    earnings: { today: earnings(mine, starts.day, starts.day + DAY), week: earnings(mine, starts.week), month: earnings(mine, starts.month) },
    completedThisMonth: mine.filter((x) => x.status === "completed" && Date.parse(x.startsAt) >= starts.month).length,
    cancelledThisMonth: mine.filter((x) => x.status === "cancelled" && Date.parse(x.startsAt) >= starts.month).length,
    reviews: saved.reviews.filter((r) => r.barberId === b.id).sort((a, c) => c.createdAt.localeCompare(a.createdAt)).slice(0, 3).map(({ customerId: _c, ...r }) => r),
    checklist: profileChecklist(b),
    hours: { workingDays: b.workingDays, openHour: b.openHour, closeHour: b.closeHour, timeOff: b.timeOff ?? [] },
    level: levelOf(b), link: `${typeof location !== "undefined" ? location.origin : ""}/barber/${b.id}`,
    blocks: (saved.blocks ?? []).filter((k) => k.barberId === b.id && Date.parse(k.endsAt) > Date.now()).length,
  };
}

const barberUser = (barberId: string) => saved.users.find((u) => u.barberId === barberId);

// ---------- Freelance barbers' applications (mirrors server/src/routes/applications.ts) ----------

const applicationOf = (barberId: string) => (saved.applications ?? []).find((a) => a.barberId === barberId);
/** Barbers at a barbershop don't apply: Always Fresh's contract with the shop covers them. */
const needsApplication = (b: SeedBarber) => !b.shopId;
function startApplication(barberId: string) {
  const now = new Date().toISOString();
  const a: DemoApplication = { barberId, status: "draft", docs: {}, createdAt: now, updatedAt: now };
  (saved.applications ??= []).push(a);
  return a;
}
const inUae = (b: SeedBarber) => b.countryCode === "AE";
const todayIso = () => new Date().toISOString().slice(0, 10);
function agreementText() {
  const fill = (t: string) => t.replaceAll("{company}", "Always Fresh").replaceAll("{fee}", String(feePercent()));
  const a = seed.agreement;
  return { version: a.version, title: a.title, intro: fill(a.intro), sections: a.sections.map((x) => ({ heading: x.heading, body: fill(x.body) })) };
}
function missingItems(a: DemoApplication | undefined, b: SeedBarber) {
  const id = inUae(b) ? "Emirates ID" : "passport";
  const m: string[] = [];
  if (!a?.legalName) m.push("Your full name as on your ID");
  if (!a?.idNumber) m.push(`Your ${id} number`);
  if (!a?.idExpiry) m.push(`Your ${id} expiry date`);
  else if (a.idExpiry < todayIso()) m.push(`Your ${id} has expired: renew it first`);
  if (!a?.docs.id_front) m.push(inUae(b) ? "Photo of the front of your Emirates ID" : "Photo of your passport's photo page");
  if (inUae(b) && !a?.docs.id_back) m.push("Photo of the back of your Emirates ID");
  if (!a?.licenceNumber) m.push("Your licence or permit number");
  if (!a?.licenceAuthority) m.push("Who issued your licence or permit");
  if (!a?.licenceExpiry) m.push("Your licence expiry date");
  else if (a.licenceExpiry < todayIso()) m.push("Your licence has expired: renew it first");
  if (!a?.docs.licence) m.push("Photo or PDF of your licence or permit");
  if (!a?.signature || a.signature.version !== seed.agreement.version) m.push("Sign the barber agreement");
  return m;
}
function applicationStatus(b: SeedBarber) {
  if (!needsApplication(b)) return "not_needed";
  return applicationOf(b.id)?.status ?? (statusOf(b) === "pending" ? "draft" : "none");
}
function applicationView(b: SeedBarber, team = false) {
  const a = applicationOf(b.id);
  const status = applicationStatus(b);
  const sig = a?.signature;
  return {
    required: needsApplication(b), status, canEdit: status === "draft" || status === "rejected", uae: inUae(b), idLabel: inUae(b) ? "Emirates ID" : "Passport",
    legalName: a?.legalName ?? "", idNumber: a?.idNumber ?? "", idExpiry: a?.idExpiry ?? "", licenceNumber: a?.licenceNumber ?? "", licenceAuthority: a?.licenceAuthority ?? "", licenceExpiry: a?.licenceExpiry ?? "",
    docs: a?.docs ?? {},
    signature: sig ? { name: sig.name, svg: sig.svg, version: sig.version, signedAt: sig.signedAt, current: sig.version === seed.agreement.version, ...(team ? { ip: sig.ip ?? null, userAgent: sig.userAgent ?? null } : {}) } : null,
    submittedAt: a?.submittedAt ?? null, reviewedAt: a?.reviewedAt ?? null, rejectionReason: a?.rejectionReason ?? null, ...(team ? { reviewedBy: a?.reviewedBy ?? null } : {}),
    missing: needsApplication(b) ? missingItems(a, b) : [], agreement: agreementText(),
  };
}
function idNumberFor(b: SeedBarber, raw: string) {
  if (inUae(b)) {
    const d = raw.replace(/\D/g, "");
    if (d.length !== 15 || !d.startsWith("784")) throw new DemoError(400, "An Emirates ID number has 15 digits and starts with 784.");
    return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7, 14)}-${d.slice(14)}`;
  }
  const v = raw.replace(/\s/g, "").toUpperCase();
  if (!/^[A-Z0-9]{5,20}$/.test(v)) throw new DemoError(400, "Enter your passport number (letters and numbers only).");
  return v;
}
const isIsoDay = (v: unknown) => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v));

function applicationRoutes(method: string, path: string, q: Record<string, string>, body: Body | undefined, token: string | null): { hit: boolean; value?: unknown } {
  const hit = (value: unknown) => ({ hit: true, value });
  let x: RegExpMatchArray | null;
  if (path === "/legal/barber-agreement") return hit(agreementText());
  if (path.startsWith("/barbers/me/application")) {
    const u = requireUser(token);
    if (!u.barberId) throw new DemoError(403, "Only barbers can do this.");
    const b = getBarber(u.barberId);
    if (path === "/barbers/me/application" && method === "GET") return hit(applicationView(b));
    if (!needsApplication(b)) throw new DemoError(400, "Barbers at a barbershop don't apply: Always Fresh's contract with your shop covers you.");
    const a = applicationOf(b.id) ?? startApplication(b.id);
    if (a.status === "submitted") throw new DemoError(409, "Your application is with the Always Fresh team. You can change it if they ask you to.");
    if (a.status === "approved") throw new DemoError(409, "Your application is approved. To update a document, contact support.");
    const touch = () => {
      a.updatedAt = new Date().toISOString();
      persist();
      return hit(applicationView(b));
    };
    if (path === "/barbers/me/application" && method === "PATCH") {
      const v = body ?? {};
      if (v.legalName !== undefined && String(v.legalName).trim().length < 3) throw new DemoError(400, "Enter your full name as on your ID");
      for (const k of ["idExpiry", "licenceExpiry"]) if (v[k] !== undefined && !isIsoDay(v[k])) throw new DemoError(400, "Use a date like 2027-05-31");
      for (const k of ["legalName", "licenceNumber", "licenceAuthority", "idExpiry", "licenceExpiry"] as const) if (v[k] !== undefined) a[k] = String(v[k]).trim();
      if (v.idNumber !== undefined) a.idNumber = idNumberFor(b, String(v.idNumber));
      return touch();
    }
    if ((x = path.match(/^\/barbers\/me\/application\/documents\/([a-z_]+)$/)) && method === "POST") {
      const kind = x[1] as DocKind;
      if (!["id_front", "id_back", "licence"].includes(kind)) throw new DemoError(400, "Unknown document.");
      const type = String(body?.contentType ?? "");
      if (!/^(image\/(jpeg|png|webp|heic)|application\/pdf)$/.test(type) || !String(body?.dataUrl ?? "").startsWith("data:")) throw new DemoError(400, "Attach a photo (JPEG, PNG, WebP) or a PDF.");
      a.docs[kind] = { url: String(body!.dataUrl), contentType: type, uploadedAt: new Date().toISOString() };
      return touch();
    }
    if (path === "/barbers/me/application/sign" && method === "POST") {
      const name = String(body?.name ?? "").trim();
      const svg = String(body?.svg ?? "");
      if (name.length < 3) throw new DemoError(400, "Type your full name to sign");
      if (svg.length < 20 || !/^[MLQCZmlqcz0-9.,\s-]+$/.test(svg)) throw new DemoError(400, "Draw your signature in the box");
      if (body?.agree !== true) throw new DemoError(400, "Tick the box to confirm you've read and agree to the agreement.");
      a.signature = { name, svg, version: seed.agreement.version, signedAt: new Date().toISOString(), userAgent: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 300) : undefined };
      a.legalName ||= name;
      return touch();
    }
    if (path === "/barbers/me/application/submit" && method === "POST") {
      const missing = missingItems(a, b);
      if (missing.length) throw new DemoError(400, `Still needed: ${missing.join("; ")}.`);
      Object.assign(a, { status: "submitted", submittedAt: new Date().toISOString() });
      delete a.rejectionReason;
      for (const t of saved.users.filter((y) => ["owner", "operations"].includes(adminRole(y) ?? ""))) notify(t.id, { kind: "account", title: "New barber application", body: `${a.legalName} (${b.city}) sent their ID, licence and signed agreement for review.` });
      return touch();
    }
    return { hit: false };
  }
  if (!path.startsWith("/admin/")) return { hit: false };
  const me = requireUser(token);
  const role = adminRole(me);
  if (path === "/admin/applications") {
    if (!role || !["owner", "operations", "support"].includes(role)) throw new DemoError(403, "Your team role doesn't include this.");
    const order: Record<string, number> = { submitted: 0, rejected: 1, draft: 2, approved: 3 };
    const f = q.status ?? "all";
    return hit(allBarbers()
      .filter(needsApplication)
      .map((b) => ({ b, a: applicationOf(b.id), status: applicationStatus(b) }))
      .filter((r) => r.status !== "none" && (f === "all" || r.status === f))
      .map(({ b, a, status }) => ({
        barberId: b.id, name: b.name, legalName: a?.legalName ?? null, photoUrl: b.photoUrl, city: b.city, email: barberUser(b.id)?.email ?? null, status, barberStatus: statusOf(b),
        submittedAt: a?.submittedAt ?? null, updatedAt: a?.updatedAt ?? b.joinedAt ?? null, missing: missingItems(a, b).length, idExpiry: a?.idExpiry ?? null, licenceExpiry: a?.licenceExpiry ?? null,
      }))
      .sort((p, r) => order[p.status]! - order[r.status]! || (p.submittedAt ?? p.updatedAt ?? "").localeCompare(r.submittedAt ?? r.updatedAt ?? "")));
  }
  if ((x = path.match(/^\/admin\/barbers\/([^/]+)\/application\/(approve|reject)$/)) && method === "POST") {
    if (role !== "owner" && role !== "operations") throw new DemoError(403, "Your team role doesn't include this.");
    const b = getBarber(x[1]!);
    const a = applicationOf(b.id);
    if (!a || a.status !== "submitted") throw new DemoError(409, `There's no submitted application to ${x[2] === "approve" ? "approve" : "send back"}.`);
    const bu = barberUser(b.id);
    if (x[2] === "approve") {
      const missing = missingItems(a, b);
      if (missing.length) throw new DemoError(400, `This application isn't complete: ${missing.join("; ")}.`);
      Object.assign(a, { status: "approved", reviewedAt: new Date().toISOString(), reviewedBy: me.email, updatedAt: new Date().toISOString() });
      const wentLive = statusOf(b) === "pending";
      saved.barberPatches[b.id] = { ...saved.barberPatches[b.id], verified: true, ...(wentLive ? { status: "live" as const } : {}) };
      logActivity(me, "application.approved", b.name);
      if (bu) notify(bu.id, { kind: "account", title: "You're approved", body: wentLive ? "Your ID, licence and agreement are checked. You're live: clients can find and book you now." : "Your ID, licence and agreement are checked. Your profile now shows the Verified badge." });
    } else {
      const reason = String(body?.reason ?? "").trim();
      if (reason.length < 5) throw new DemoError(400, "Tell the barber what to fix");
      Object.assign(a, { status: "rejected", rejectionReason: reason, reviewedAt: new Date().toISOString(), reviewedBy: me.email, updatedAt: new Date().toISOString() });
      logActivity(me, "application.rejected", b.name, reason);
      if (bu) notify(bu.id, { kind: "account", title: "Your application needs a change", body: `${reason} Open Dashboard → Your application to fix it and send it again.` });
    }
    persist();
    return hit(applicationView(getBarber(b.id), true));
  }
  return { hit: false };
}

function bookingRow(b: Booking) {
  const barber = allBarbers().find((x) => x.id === b.barberId);
  const customer = saved.users.find((u) => u.id === b.customerId);
  const service = barber ? findService(barber, b.serviceId) ?? (b.serviceId === CONSULTATION.id ? CONSULTATION : undefined) : undefined;
  return {
    id: b.id, startsAt: b.startsAt, createdAt: b.createdAt, status: b.status, amount: b.amount, currency: b.currency, locationType: b.locationType,
    fee: PAID.has(b.status) && fromApp(b) ? bookingFee(b) : 0, service: service?.name ?? "Service",
    barber: barber ? { id: barber.id, name: barber.name, photoUrl: barber.photoUrl, city: barber.city } : null,
    customer: customer ? { id: customer.id, name: b.guest?.name ?? customer.name, email: customer.email } : null,
    coveredBy: b.coveredBy ?? null,
  };
}

function barberRow(b: SeedBarber) {
  const paid = saved.bookings.filter((x) => x.barberId === b.id && PAID.has(x.status));
  const shop = shopRef(b.shopId);
  const list = profileChecklist(b);
  const r = rating(b);
  return {
    id: b.id, name: b.name, photoUrl: b.photoUrl, city: b.city, countryCode: b.countryCode, status: statusOf(b), verified: !!b.verified, joinedAt: b.joinedAt ?? null, application: applicationStatus(b),
    rating: r.rating, ratingCount: r.ratingCount, bookings: paid.length, revenue30: byCurrency(paid.filter((x) => Date.parse(x.startsAt) >= Date.now() - 30 * DAY)),
    email: barberUser(b.id)?.email ?? null, shop, profileDone: list.filter((c) => c.done).length, profileTotal: list.length,
  };
}

function ticketRow(t: Ticket) {
  const reel = t.reelId ? liveReels().find((r) => r.id === t.reelId) : undefined;
  const rb = reel ? allBarbers().find((b) => b.id === reel.barberId) : undefined;
  return {
    ...t, name: t.name ?? t.email, status: t.status ?? "open",
    reel: reel ? { id: reel.id, caption: reel.caption, posterUrl: reel.posterUrl ?? null, videoUrl: reel.videoUrl, barber: rb ? { id: rb.id, name: rb.name } : null } : null,
    reelRemoved: !!t.reelId && !reel,
  };
}

/** Deterministic pseudo-random numbers, so every device builds the same sample. */
function rng(seedValue: number) {
  let s = seedValue;
  return () => (s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296;
}

/** Two more chairs at Always Fresh Downtown, so the shop panel's calendar has a full team. */
const EXTRA_TEAM: [string, string, string[]][] = [
  ["demo-dt-1", "Rami Aziz", ["skin fade", "taper", "kids cut"]],
  ["demo-dt-2", "Leo Santos", ["scissor cut", "textured crop", "beard"]],
];
const SEED_VERSION = 8;

/** Requests that arrive together share one run, so the sample accounts are made once. */
let seeding: Promise<void> | null = null;
function seedDemoAccounts() {
  return (seeding ??= buildSample().finally(() => {
    seeding = null;
  }));
}

/** Sample team, barber, barbershop owner and customers with a month of bookings — rebuilt each day so "today" always has clients. */
async function buildSample() {
  const dubaiDay = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dubai" }).format(new Date());
  if (saved.demoSeededOn === dubaiDay && saved.demoSeedVersion === SEED_VERSION) return;
  // The sample logins moved to @demo.alwaysfresh.app: move a returning tester's sample accounts over (same passwords) instead of making them twice.
  for (const u of saved.users) {
    if (!u.seeded || !/@demo\.(?!alwaysfresh\.app$)/.test(u.email)) continue;
    u.email = u.email.replace(/@demo\..+$/, "@demo.alwaysfresh.app");
    if (u.email === DEMO_LOGINS.admin.email) u.name = "Always Fresh team";
    for (const a of saved.activity ?? []) if (a.by.id === u.id) a.by = { id: u.id, name: u.name, email: u.email };
  }
  // Earlier versions could make a sample account twice when the page first loaded; keep the first.
  saved.users = saved.users.filter((u, i, all) => !u.seeded || all.findIndex((x) => x.email === u.email) === i);
  const now = Date.now();
  const ensure = async (name: string, email: string, password: string, extra: Partial<User> = {}, daysAgo = 20) => {
    let u = saved.users.find((x) => x.email === email);
    if (!u) {
      u = { id: newId(), name, email, passwordHash: await hash(password), role: "customer", countryCode: "AE", city: "Dubai", createdAt: new Date(now - daysAgo * DAY).toISOString(), seeded: true, ...extra };
      saved.users.push(u);
    }
    return u;
  };
  await ensure("Always Fresh team", DEMO_LOGINS.admin.email, DEMO_LOGINS.admin.password, {}, 60);
  await ensure("Mateo Silva", DEMO_LOGINS.barber.email, DEMO_LOGINS.barber.password, { role: "barber", barberId: DEMO_LOGINS.barber.barberId }, 90);
  const owner = await ensure("Nadia Haddad", DEMO_LOGINS.shop.email, DEMO_LOGINS.shop.password, { manages: DEMO_LOGINS.shop.shopId }, 120);
  Object.assign(owner, { shopRole: "owner", branches: ["s-dubai-marina"] }); // runs two branches
  await ensure("Omar at the desk", "desk@demo.alwaysfresh.app", "fresh-desk-demo", { manages: DEMO_LOGINS.shop.shopId, shopRole: "front_desk" }, 40);
  // Mateo's booking rules: free cancellation up to 24 hours, then half; 15% off quiet weekday mornings.
  if (!saved.barberPatches.b37?.cancelPolicy) saved.barberPatches.b37 = { ...saved.barberPatches.b37, cancelPolicy: { freeHours: 24, lateFeePercent: 50 }, offPeak: { percent: 15, days: [1, 2, 3], fromHour: 10, toHour: 13 } };
  const base = seed.barbers.find((b) => b.shopId === DEMO_LOGINS.shop.shopId);
  for (const [id, name, specialties] of EXTRA_TEAM) {
    if (!base || allBarbers().some((b) => b.id === id)) continue;
    saved.newBarbers.push({
      ...structuredClone(base), id, name, bio: `${name.split(" ")[0]} works the chairs at Always Fresh Downtown.`, photoUrl: "", specialties,
      services: base.services.map((sv) => ({ ...sv, id: `${id}-${sv.id.split("-").pop()}` })), gallery: [], transformations: [], ratingSum: 0, ratingCount: 0,
      yearsExperience: 4, workingDays: [0, 1, 2, 3, 4, 6], openHour: 10, closeHour: 21, timeOff: [],
    });
  }
  const rand = rng(42);
  const customers: User[] = [];
  for (const n of ["Omar Khalid", "Rashid Al Amiri", "Daniel Moreau", "Ahmed Saleh", "Yusuf Rahman", "Liam Patel", "Faisal Nasser", "Marco Rossi", "Hamdan Ali", "Sami Haddad"]) {
    customers.push(await ensure(n, `${n.split(" ")[0]!.toLowerCase()}@example.com`, "customer-demo", {}, Math.floor(rand() * 30)));
  }

  // Yesterday's sample goes; today's comes in.
  saved.bookings = saved.bookings.filter((b) => !b.seeded);
  saved.reviews = saved.reviews.filter((r) => !r.seeded);
  const dubai = (dayOffset: number, hour: number) => {
    const d = new Date(Date.now() + 4 * 3_600_000); // today's date in Dubai, not in UTC (they differ after 8pm UTC)
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + dayOffset, hour) - 4 * 3_600_000).toISOString();
  };
  const taken = new Set<string>();
  const book = (barberId: string, dayOffset: number, hour: number, status: Booking["status"]) => {
    const barber = allBarbers().find((b) => b.id === barberId);
    const key = `${barberId}:${dayOffset}:${hour}`;
    if (!barber || taken.has(key) || !barber.workingDays.includes(new Date(dubai(dayOffset, 12)).getUTCDay())) return;
    taken.add(key);
    const customer = customers[Math.floor(rand() * customers.length)]!;
    const menu = mainServices(barber); // extras are only added to a service, never booked alone
    const service = menu[Math.floor(rand() * menu.length)]!;
    const startsAt = dubai(dayOffset, hour);
    const b: Booking = {
      id: newId(), customerId: customer.id, barberId, serviceId: service.id, startsAt, endsAt: new Date(Date.parse(startsAt) + service.durationMin * 60_000).toISOString(),
      locationType: "shop", address: barber.shopAddress, notes: "", amount: service.price, currency: country(barber.countryCode)!.currency, status, reviewed: false,
      createdAt: new Date(Date.parse(startsAt) - (1 + Math.floor(rand() * 5)) * DAY).toISOString(), remindedDay: true, remindedHour: true, seeded: true,
    };
    if (status === "completed" && rand() < 0.5) b.tip = Math.round((service.price * 0.1) / 500) * 500 || 1000;
    saved.bookings.push(b);
    return b;
  };
  const DUBAI = ["b37", "b36", "b41", "b19", "b35", "b9", "b38", "b39", "b40", "b20", "demo-dt-1", "demo-dt-2"];
  for (let d = -30; d <= -1; d++) for (const id of DUBAI) if (rand() < (id === "b37" ? 0.75 : 0.35)) book(id, d, 10 + Math.floor(rand() * 8), rand() < 0.08 ? "cancelled" : "completed");
  for (const h of [10, 12, 15, 17, 19]) book("b37", 0, h, Date.parse(dubai(0, h)) + 3_600_000 < now ? "completed" : "confirmed");
  for (let d = 1; d <= 6; d++) for (const id of DUBAI) {
    const n = id === "b37" ? 2 + Math.floor(rand() * 3) : rand() < 0.4 ? 1 : 0;
    for (let i = 0; i < n; i++) book(id, d, 10 + Math.floor(rand() * 9), "confirmed");
  }
  // A busy day at Always Fresh Downtown: app bookings, walk-ins, a lunch break.
  saved.blocks = (saved.blocks ?? []).filter((k) => !k.seeded);
  const walkIns = ["Khalid", "Arjun", "Tom", "Majid", "Pedro", "Ali"];
  ["b36", "b41", "demo-dt-1", "demo-dt-2"].forEach((id, i) => {
    for (const h of [11, 13, 16, 18]) {
      const b = book(id, 0, h + (i % 2 ? 1 : 0), Date.parse(dubai(0, h + 1)) < now ? "completed" : "confirmed");
      if (b && rand() < 0.4) Object.assign(b, { customerId: owner.id, guest: { name: walkIns[Math.floor(rand() * walkIns.length)]!, phone: "" }, source: "shop", reviewed: true });
    }
    const lunch = dubai(0, 14 + (i % 2));
    saved.blocks!.push({ id: newId(), shopId: DEMO_LOGINS.shop.shopId, barberId: id, startsAt: lunch, endsAt: new Date(Date.parse(lunch) + 45 * 60_000).toISOString(), reason: "Lunch", createdAt: new Date(now).toISOString(), seeded: true });
  });

  const comments = ["Sharpest fade I've had in Dubai.", "On time, clean shop, great conversation.", "Exactly what I asked for. Booking again.", "Beard line-up was perfect."];
  saved.bookings.filter((b) => b.seeded && b.barberId === "b37" && b.status === "completed").slice(-4).forEach((b, i) => {
    const c = saved.users.find((u) => u.id === b.customerId)!;
    saved.reviews.push({ id: newId(), barberId: "b37", customerId: c.id, customerName: c.name.split(" ")[0]!, bookingId: b.id, rating: i === 2 ? 4 : 5, comment: comments[i]!, createdAt: b.endsAt, seeded: true });
    b.reviewed = true;
  });

  if (!saved.demoSeededOn) {
    // First visit only: two barbers waiting for approval, two support questions and a reported reel.
    const photo = (p: string) => (seed.media[p] ? p : "");
    ([["Karim Haddad", "Cluster D, Jumeirah Lake Towers, Dubai", "Dubai", 25.0698, 55.1414, photo("/media/demo/av12.jpg")], ["Yusuf Rahman", "Al Nuaimiya, Ajman", "Ajman", 25.3933, 55.4466, ""]] as const).forEach(([name, address, city, lat, lng, photoUrl], i) => {
      const id = `demo-pending-${i + 1}`;
      if (allBarbers().some((b) => b.id === id) || !country("AE")?.cities.some((c) => c.name === city)) return;
      const price = 6000 + i * 1000;
      saved.newBarbers.push({
        id, name, bio: i === 0 ? "Precision fades and beard sculpting in JLT. Ten years behind the chair in Beirut and Dubai." : "", photoUrl, countryCode: "AE", city, shopAddress: address, lat, lng,
        specialties: ["skin fade", "beard"], services: [{ id: `${id}-cut`, name: "Classic haircut", durationMin: 30, price }, { id: `${id}-fade`, name: "Skin fade", durationMin: 45, price: Math.round(price * 1.2) }],
        offersHomeVisits: i === 0, homeVisitFee: i === 0 ? 5000 : 0, yearsExperience: i === 0 ? 10 : 3, languages: ["English", "Arabic"], gallery: [], transformations: [],
        workingDays: [1, 2, 3, 4, 5, 6], openHour: 10, closeHour: 21, ratingSum: 0, ratingCount: 0, status: "pending", joinedAt: new Date(now - (i + 1) * 7 * 3_600_000).toISOString(),
      });
    });
    const ticket = (c: User, topic: string, message: string, hoursAgo: number, reelId?: string) =>
      saved.tickets.push({ id: newId(), userId: c.id, name: c.name, email: c.email, topic, message, status: "open", reelId, createdAt: new Date(now - hoursAgo * 3_600_000).toISOString() });
    ticket(customers[0]!, "booking", "My barber was 20 minutes late yesterday at Business Bay. Can I get something back?", 5);
    ticket(customers[3]!, "payment", "I was charged twice for my Club membership this month — please check.", 26);
    const reel = seed.reels.find((r) => r.id === "r14");
    const by = reel && allBarbers().find((b) => b.id === reel.barberId);
    if (reel && by) ticket(customers[5]!, "other", `Reported reel by ${by.name}: Looks like someone else's photo`, 3, reel.id);
  }
  // The shop floor: a walk-in queue, stock on the shelf, and a few deliveries to send out.
  const minsAgo = (m: number) => new Date(now - m * 60_000).toISOString();
  const downtownShop = DEMO_LOGINS.shop.shopId;
  saved.queue = [
    ...(saved.queue ?? []).filter((e) => !e.seeded),
    { id: newId(), shopId: downtownShop, name: "Hamza", phone: "", service: "Skin fade", status: "serving", barberId: "b36", joinedAt: minsAgo(50), calledAt: minsAgo(15), seeded: true },
    { id: newId(), shopId: downtownShop, name: "Leo", phone: "", service: "Haircut", status: "waiting", joinedAt: minsAgo(25), seeded: true },
    { id: newId(), shopId: downtownShop, name: customers[2]!.name, phone: "", userId: customers[2]!.id, service: "Haircut + beard", status: "waiting", joinedAt: minsAgo(12), seeded: true },
    { id: newId(), shopId: downtownShop, name: "Ibrahim", phone: "", service: "Beard trim", status: "waiting", joinedAt: minsAgo(4), seeded: true },
  ];
  saved.stock = { ...saved.stock, [downtownShop]: saved.stock?.[downtownShop] ?? { "p-pomade": 14, "p-wax": 2, "p-powder": 9, "p-shampoo": 0, "p-beard-oil": 21 } };
  saved.orders = saved.orders.filter((o) => !o.seeded);
  ([[2, "p-pomade", 2, "delivered"], [6, "p-beard-oil", 1, "out_for_delivery"], [26, "p-kit", 1, "paid"]] as const).forEach(([hoursAgo, productId, quantity, status], i) => {
    const product = seed.products.find((p) => p.id === productId);
    if (!product) return;
    const c = customers[(i * 3) % customers.length]!;
    const unit = product.prices.aed ?? product.prices.eur!;
    saved.orders.push({
      id: newId(), customerId: c.id, items: [{ productId, name: product.name, quantity, unitPrice: unit }], subtotal: unit * quantity, shipping: 0, amount: unit * quantity, currency: "aed",
      fulfilment: "delivery", shopId: downtownShop, shippingName: c.name, shippingAddress: ["Burj Views, Downtown Dubai", "Boulevard Point, Downtown Dubai", "29 Boulevard, Downtown Dubai"][i]!,
      status, createdAt: new Date(now - hoursAgo * 3_600_000).toISOString(), seeded: true,
    });
  });

  // Partners: a hotel whose guests book through its QR code, and a company whose people get a discount.
  if (!saved.partners?.length) {
    saved.partners = [
      { id: "demo-partner-atlantis", kind: "hotel", name: "Atlantis The Royal", code: "ATLANTIS", discountPercent: 0, commissionPercent: 10, contactEmail: "concierge@atlantis.example", active: true, createdAt: new Date(now - 40 * DAY).toISOString() },
      { id: "demo-partner-emirates", kind: "corporate", name: "Emirates Group", code: "EMIRATES", discountPercent: 15, commissionPercent: 0, emailDomain: "emirates.example", contactEmail: "people@emirates.example", active: true, createdAt: new Date(now - 25 * DAY).toISOString() },
    ];
  }
  saved.bookings.filter((b) => b.seeded && PAID.has(b.status)).forEach((b, i) => {
    if (i % 9 === 0) b.partnerId = "demo-partner-atlantis";
    else if (i % 13 === 0) b.partnerId = "demo-partner-emirates";
  });
  // The team's recent activity, and a client's question for Mateo.
  if (!saved.activity?.length) {
    const admin = saved.users.find((u) => u.email === DEMO_LOGINS.admin.email)!;
    const at = (h: number) => new Date(now - h * 3_600_000).toISOString();
    saved.activity = [
      { id: newId(), at: at(30), by: { id: admin.id, name: admin.name, email: admin.email }, action: "barber.live", target: "Hassan Farouk" },
      { id: newId(), at: at(20), by: { id: admin.id, name: admin.name, email: admin.email }, action: "partner.added", target: "Emirates Group", detail: "corporate · EMIRATES" },
      { id: newId(), at: at(6), by: { id: admin.id, name: admin.name, email: admin.email }, action: "ticket.replied", target: `Ticket from ${customers[0]!.name}` },
    ];
  }
  if (!saved.chats?.some((c) => c.barberId === "b37")) {
    const c = customers[1]!;
    const at = (m: number) => new Date(now - m * 60_000).toISOString();
    (saved.chats ??= []).push({
      id: newId(), customerId: c.id, barberId: "b37", updatedAt: at(40),
      messages: [
        { id: newId(), from: "customer", text: "Hi Mateo, can you do a textured crop like your last reel?", at: at(55) },
        { id: newId(), from: "barber", text: "For sure. Bring a photo if you have one. See you Thursday!", at: at(48) },
        { id: newId(), from: "customer", text: "Perfect, I'll be 5 minutes early.", at: at(40) },
      ],
    });
  }

  // Applications: Karim's is waiting for the team, Yusuf is still filling his in, Mateo was approved when he joined.
  if (!saved.applications) {
    const stamp = (h: number) => new Date(now - h * 3_600_000).toISOString();
    const doc = (kind: DocKind, h: number) => ({ url: seed.sampleDocs[kind], contentType: "image/jpeg", uploadedAt: stamp(h) });
    const docs = (h: number) => ({ id_front: doc("id_front", h), id_back: doc("id_back", h), licence: doc("licence", h) });
    const signed = (name: string, h: number) => ({ name, svg: seed.sampleSignature, version: seed.agreement.version, signedAt: stamp(h), ip: "203.0.113.24", userAgent: "Sample phone" });
    const pending = (id: string) => allBarbers().some((b) => b.id === id && statusOf(b) === "pending");
    const admin = saved.users.find((u) => u.email === DEMO_LOGINS.admin.email)!;
    saved.applications = [
      { barberId: DEMO_LOGINS.barber.barberId, status: "approved", legalName: "Mateo Silva", idNumber: "784-1989-2468013-5", idExpiry: "2028-11-30", licenceNumber: "BL-2025-118734", licenceAuthority: "Dubai Municipality", licenceExpiry: "2027-12-31", docs: docs(2880), signature: signed("Mateo Silva", 2880), submittedAt: stamp(2880), reviewedAt: stamp(2856), reviewedBy: admin.email, createdAt: stamp(2900), updatedAt: stamp(2856) },
      ...(pending("demo-pending-1") ? [{ barberId: "demo-pending-1", status: "submitted" as const, legalName: "Karim Haddad", idNumber: "784-1990-1234567-1", idExpiry: "2028-06-30", licenceNumber: "BL-2026-004512", licenceAuthority: "Dubai Municipality", licenceExpiry: "2027-09-30", docs: docs(3), signature: signed("Karim Haddad", 3), submittedAt: stamp(3), createdAt: stamp(7), updatedAt: stamp(3) }] : []),
      ...(pending("demo-pending-2") ? [{ barberId: "demo-pending-2", status: "draft" as const, legalName: "Yusuf Rahman", idNumber: "784-1996-7654321-2", idExpiry: "2029-02-28", docs: { id_front: doc("id_front", 13) }, createdAt: stamp(14), updatedAt: stamp(13) }] : []),
    ];
  }

  saved.demoSeededOn = dubaiDay;
  saved.demoSeedVersion = SEED_VERSION;
  persist();
}

// ---------- The shop panel (mirrors server/src/routes/manage.ts) ----------

const addDays = (date: string, n: number) => new Date(Date.parse(`${date}T12:00:00Z`) + n * DAY).toISOString().slice(0, 10);
const localDate = (iso: string | number, tz: string) => new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(new Date(iso));
const shopToday = (s: SeedShop) => localDate(Date.now(), shopTz(s));
const dayStart = (s: SeedShop, date: string) => zonedTime(date, 0, 0, shopTz(s)).getTime();
const isDay = (v: unknown): v is string => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);
/** Everyone on the shop's team, including barbers switched off or waiting for approval. */
const teamOf = (s: SeedShop) => allBarbers().filter((b) => b.shopId === s.id);
const isWorking = (b: SeedBarber, date: string) => !b.offline && b.workingDays.includes(new Date(`${date}T12:00:00Z`).getUTCDay()) && !b.timeOff?.includes(date);
/** Same name → same service: a menu change keeps ids (and so the bookings that use them). */
const nameKey = (s: string) => s.trim().toLowerCase();
const firstName = (name: string) => name.split(" ")[0]!;

function teamBarber(s: SeedShop, id: string) {
  const b = teamOf(s).find((x) => x.id === id);
  if (!b) throw new DemoError(404, "That barber isn't on your team.");
  return b;
}

function shopBooking(s: SeedShop, id: string) {
  const team = new Set(teamOf(s).map((b) => b.id));
  const b = saved.bookings.find((x) => x.id === id && team.has(x.barberId));
  if (!b) throw new DemoError(404, "Booking not found.");
  return b;
}

/** Is the barber free from start to end? Bookings, blocked time and private hires all count; `ignore` skips a booking being moved. */
function isFree(barberId: string, start: number, end: number, ignore?: string) {
  const shopId = allBarbers().find((b) => b.id === barberId)?.shopId;
  const taken = [
    ...saved.bookings.filter((x) => x.barberId === barberId && x.status !== "cancelled" && x.id !== ignore),
    ...(saved.blocks ?? []).filter((x) => x.barberId === barberId),
    ...(shopId ? (saved.hires ?? []).filter((h) => h.shopId === shopId && h.status !== "cancelled") : []),
  ];
  return !taken.some((x) => start < Date.parse(x.endsAt) && end > Date.parse(x.startsAt));
}

function calendarBooking(b: Booking) {
  const v = bookingView(b);
  return {
    id: b.id, barberId: b.barberId, startsAt: b.startsAt, endsAt: b.endsAt, status: b.status, noShow: !!b.noShow,
    source: b.source ?? "app", client: v.customerName, phone: b.guest?.phone || b.phone || "",
    service: `${v.service?.name ?? "Appointment"}${v.extras.length ? ` + ${v.extras.map((e) => e.name.toLowerCase()).join(", ")}` : ""}`, durationMin: Math.round((Date.parse(b.endsAt) - Date.parse(b.startsAt)) / 60_000),
    amount: b.amount, currency: b.currency, paid: fromApp(b) ? "app" : "at the shop", locationType: b.locationType, address: b.address, notes: b.notes,
  };
}

function memberView(b: SeedBarber, date: string) {
  return {
    ...barberView(b),
    status: statusOf(b), offline: !!b.offline, email: barberUser(b.id)?.email ?? null, sharePercent: b.sharePercent ?? null,
    hours: { workingDays: b.workingDays, openHour: b.openHour, closeHour: b.closeHour, timeOff: b.timeOff ?? [] },
    workingToday: isWorking(b, date),
  };
}

const patchBarber = (id: string, patch: Partial<SeedBarber>) => {
  const isNew = saved.newBarbers.find((b) => b.id === id);
  if (isNew) Object.assign(isNew, patch);
  else saved.barberPatches[id] = { ...saved.barberPatches[id], ...patch };
};

const hourOk = (v: unknown, min: number, max: number) => v === undefined || (Number.isInteger(v) && (v as number) >= min && (v as number) <= max);

/** The shop panel: a barbershop's owner or manager runs the shop's day. Everything here changes what customers can book in the app. */
async function manageRoutes(method: string, path: string, q: Record<string, string>, body: Body | undefined, token: string | null, headers: Record<string, string> = {}): Promise<unknown> {
  const me = requireUser(token);
  if (!me.manages) throw new DemoError(403, "Only barbershop owners and managers can open the shop panel.");
  const mine = [me.manages, ...(me.branches ?? [])];
  const shop = getShop(headers["x-shop"] && mine.includes(headers["x-shop"]) ? headers["x-shop"] : me.manages);
  const tz = shopTz(shop);
  const role = me.shopRole ?? "owner";
  const RANK = { front_desk: 0, manager: 1, owner: 2 } as const;
  const need = (r: keyof typeof RANK) => {
    if (RANK[role] < RANK[r]) throw new DemoError(403, r === "owner" ? "Only the shop's owner can do this." : "Ask your manager — front desk accounts can't change this.");
  };
  if (/^\/manage\/(barbers|services|reports|settings|payroll|clients)/.test(path) && !(path === "/manage/barbers" && method === "GET")) need("manager");
  if (path.startsWith("/manage/staff")) need("owner");
  let x: RegExpMatchArray | null;
  const shopOps = await shopOpsRoutes(method, path, q, body, me, shop, role);
  if (shopOps.hit) return shopOps.value;

  if (path === "/manage" && method === "GET") {
    const date = shopToday(shop);
    return {
      shop: {
        id: shop.id, name: shop.name, address: shop.address, city: shop.city, phone: shop.phone, about: shop.about, photoUrl: shop.photoUrl,
        timeZone: tz, currency: shopCurrency(shop), workingDays: shop.workingDays, openHour: shop.openHour, closeHour: shop.closeHour,
        barberSharePercent: shop.barberSharePercent ?? DEFAULT_BARBER_SHARE,
      },
      role, branches: mine.map((id) => getShop(id)).map((s) => ({ id: s.id, name: s.name, city: s.city })),
      links: { page: `${origin()}/barbershop/${shop.id}`, queue: `${origin()}/barbershop/${shop.id}/queue` },
      today: date,
      team: teamOf(shop).map((b) => memberView(b, date)),
    };
  }

  // One day: every barber's bookings, blocked time and the shop's hours.
  if (path === "/manage/calendar" && method === "GET") {
    const date = isDay(q.date) ? q.date : shopToday(shop);
    const from = dayStart(shop, date);
    const to = dayStart(shop, addDays(date, 1));
    const team = teamOf(shop);
    const ids = new Set(team.map((b) => b.id));
    const within = (k: { startsAt: string; endsAt: string }) => Date.parse(k.startsAt) < to && Date.parse(k.endsAt) > from;
    const bookings = saved.bookings.filter((b) => ids.has(b.barberId) && b.status !== "pending_payment" && within(b)).sort((a, b) => a.startsAt.localeCompare(b.startsAt));
    const hires = (saved.hires ?? []).filter((h) => h.shopId === shop.id && h.status !== "cancelled" && h.status !== "pending_payment" && within(h));
    const active = bookings.filter((b) => b.status !== "cancelled");
    return {
      date, timeZone: tz, currency: shopCurrency(shop),
      openHour: Math.min(shop.openHour, ...team.map((b) => b.openHour)), closeHour: Math.max(shop.closeHour, ...team.map((b) => b.closeHour)),
      barbers: team.map((b) => ({ ...memberView(b, date), working: isWorking(b, date), dayOff: !!b.timeOff?.includes(date) })),
      bookings: bookings.map(calendarBooking),
      blocks: (saved.blocks ?? []).filter((k) => ids.has(k.barberId) && within(k)).map(({ seeded: _s, ...k }) => k),
      hires: hires.map((h) => ({ id: h.id, startsAt: h.startsAt, endsAt: h.endsAt, occasion: h.occasion, guests: h.guests })),
      summary: {
        bookings: active.length,
        done: active.filter((b) => b.status === "completed").length,
        walkIns: active.filter((b) => !fromApp(b)).length,
        cancelled: bookings.filter((b) => b.status === "cancelled" && !b.noShow).length,
        noShows: bookings.filter((b) => b.noShow).length,
        takings: active.reduce((s, b) => s + b.amount, 0),
      },
    };
  }

  // A walk-in or a phone booking, added by the shop. Paid at the shop; the app won't offer that time to anyone else.
  if (path === "/manage/bookings" && method === "POST") {
    const barber = teamBarber(shop, String(body?.barberId ?? ""));
    const service = findService(barber, String(body?.serviceId ?? ""));
    if (!service || service.id === CONSULTATION.id) throw new DemoError(404, "Pick one of this barber's services.");
    const name = String(body?.name ?? "").trim().slice(0, 60);
    if (!name) throw new DemoError(400, "Add the client's name");
    const start = Date.parse(String(body?.startsAt ?? ""));
    if (Number.isNaN(start)) throw new DemoError(400, "Pick a time.");
    const end = start + service.durationMin * 60_000;
    if (end < Date.now() - 60 * 60_000) throw new DemoError(400, "That time has already passed.");
    if (!isFree(barber.id, start, end)) throw new DemoError(409, `${firstName(barber.name)} is busy then — pick another time or barber.`);
    const booking: Booking = {
      id: newId(), customerId: me.id, barberId: barber.id, serviceId: service.id,
      startsAt: new Date(start).toISOString(), endsAt: new Date(end).toISOString(), locationType: "shop", address: shop.address,
      notes: String(body?.notes ?? "").trim().slice(0, 500), amount: service.price, currency: shopCurrency(shop), status: "confirmed", reviewed: true,
      remindedDay: true, remindedHour: true, guest: { name, phone: String(body?.phone ?? "").trim().slice(0, 30) }, source: "shop", createdAt: new Date().toISOString(),
    };
    saved.bookings.push(booking);
    const bu = barberUser(barber.id);
    if (bu) {
      const when = new Intl.DateTimeFormat("en-GB", { timeZone: tz, weekday: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(start));
      notify(bu.id, { kind: "new_booking", title: "New booking from the shop", body: `${name}: ${service.name}, ${when}.`, bookingId: booking.id });
    }
    persist();
    return calendarBooking(booking);
  }

  // Move a booking to another time or another barber on the team.
  if ((x = path.match(/^\/manage\/bookings\/([^/]+)\/move$/)) && method === "POST") {
    const b = shopBooking(shop, x[1]!);
    if (b.status === "cancelled" || b.status === "completed") throw new DemoError(400, "Only upcoming bookings can be moved.");
    const from = teamBarber(shop, b.barberId);
    const to = teamBarber(shop, String(body?.barberId ?? ""));
    const service = findService(from, b.serviceId);
    const target = to.id === from.id ? service : to.services.find((s) => service && nameKey(s.name) === nameKey(service.name));
    if (!target) throw new DemoError(400, `${firstName(to.name)} doesn't offer ${service?.name ?? "this service"}. Add it in Services first.`);
    const start = Date.parse(String(body?.startsAt ?? ""));
    if (Number.isNaN(start)) throw new DemoError(400, "Pick a time.");
    const extraMin = Math.max(0, (Date.parse(b.endsAt) - Date.parse(b.startsAt)) / 60_000 - (service?.durationMin ?? 0)); // extras keep their time
    const end = start + (target.durationMin + extraMin) * 60_000;
    if (!isFree(to.id, start, end, b.id)) throw new DemoError(409, `${firstName(to.name)} is busy then.`);
    Object.assign(b, { barberId: to.id, serviceId: target.id, startsAt: new Date(start).toISOString(), endsAt: new Date(end).toISOString(), remindedDay: !fromApp(b), remindedHour: !fromApp(b) });
    if (fromApp(b)) {
      const when = new Intl.DateTimeFormat("en-GB", { timeZone: tz, weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(start));
      notify(b.customerId, { kind: "booking_confirmed", title: "Your booking moved", body: `${shop.name} moved your ${target.name.toLowerCase()} to ${when} (${shop.city} time) with ${to.name}.`, bookingId: b.id });
    }
    persist();
    return calendarBooking(b);
  }

  // Done, no-show or cancel.
  if ((x = path.match(/^\/manage\/bookings\/([^/]+)$/)) && method === "POST") {
    const b = shopBooking(shop, x[1]!);
    const action = String(body?.action ?? "");
    const reason = String(body?.reason ?? "").trim().slice(0, 300);
    if (b.status === "cancelled") throw new DemoError(400, "This booking is already cancelled.");
    const app = fromApp(b);
    if (action === "done") {
      if (b.status === "completed") throw new DemoError(400, "Already marked done.");
      b.status = "completed";
      if (app && b.serviceId !== CONSULTATION.id) notify(b.customerId, { kind: "completed", title: "How was your cut?", body: `Rate ${getBarber(b.barberId).name} — it helps others choose.`, bookingId: b.id });
    } else if (action === "no_show") {
      if (Date.parse(b.startsAt) > Date.now()) throw new DemoError(400, "You can mark a no-show once the appointment time has started.");
      if (b.status === "completed") throw new DemoError(400, "This one is already done.");
      b.status = "cancelled";
      b.noShow = true; // no refund: the client didn't come
      if (app) notify(b.customerId, { kind: "cancelled", title: "Marked as no-show", body: `${shop.name} marked your appointment as missed. Contact support if this is a mistake.`, bookingId: b.id });
    } else if (action === "cancel") {
      if (b.status === "completed") throw new DemoError(400, "A finished booking can't be cancelled.");
      b.status = "cancelled";
      if (app) {
        if (b.creditUsed) {
          const owner = saved.users.find((u) => u.id === b.customerId);
          if (owner) owner.credit = { ...owner.credit, [b.currency]: (owner.credit?.[b.currency] ?? 0) + b.creditUsed };
        }
        const d = alertDetails(b);
        notify(b.customerId, { kind: "cancelled", title: "Booking cancelled", body: `${d.barber.name} cancelled ${d.service}, ${d.when}.${b.amount ? " You'll get a full refund." : ""}`, bookingId: b.id });
        if (reason) notify(b.customerId, { kind: "cancelled", title: `Message from ${shop.name}`, body: reason, bookingId: b.id });
      }
    } else throw new DemoError(400, "Choose done, no-show or cancel.");
    persist();
    return calendarBooking(b);
  }

  // Breaks, training, a barber off for the afternoon: blocked time can't be booked in the app.
  if (path === "/manage/blocks" && method === "POST") {
    const ids = (body?.barberIds ?? []) as string[];
    if (!ids.length) throw new DemoError(400, "Pick at least one barber");
    const start = Date.parse(String(body?.startsAt ?? ""));
    const end = Date.parse(String(body?.endsAt ?? ""));
    if (Number.isNaN(start) || Number.isNaN(end) || end - start < 10 * 60_000) throw new DemoError(400, "Block at least 10 minutes.");
    if (end - start > 14 * DAY) throw new DemoError(400, "For longer than two weeks, use days off instead.");
    const reason = String(body?.reason ?? "").trim().slice(0, 80) || "Blocked";
    const created = ids.map((id) => {
      teamBarber(shop, id);
      const block: Block = { id: newId(), shopId: shop.id, barberId: id, startsAt: new Date(start).toISOString(), endsAt: new Date(end).toISOString(), reason, createdAt: new Date().toISOString() };
      (saved.blocks ??= []).push(block);
      return block;
    });
    persist();
    return created;
  }
  if ((x = path.match(/^\/manage\/blocks\/([^/]+)$/)) && method === "DELETE") {
    const block = (saved.blocks ?? []).find((k) => k.id === x![1] && k.shopId === shop.id);
    if (!block) throw new DemoError(404, "Not found.");
    saved.blocks = (saved.blocks ?? []).filter((k) => k !== block);
    persist();
    return undefined;
  }

  // A barber's week: working days, hours, days off, and whether the app takes bookings for them.
  if ((x = path.match(/^\/manage\/barbers\/([^/]+)$/)) && method === "PATCH") {
    const b = teamBarber(shop, x[1]!);
    const p = (body ?? {}) as { workingDays?: number[]; openHour?: number; closeHour?: number; timeOff?: string[]; offline?: boolean; sharePercent?: number | null };
    if (p.sharePercent !== undefined && role !== "owner") throw new DemoError(403, "Only the shop's owner can change the money split.");
    if (p.workingDays && (!p.workingDays.length || p.workingDays.some((d) => !Number.isInteger(d) || d < 0 || d > 6))) throw new DemoError(400, "Pick at least one working day");
    if (!hourOk(p.openHour, 0, 23) || !hourOk(p.closeHour, 1, 24)) throw new DemoError(400, "Pick hours between 00:00 and 24:00.");
    if ((p.closeHour ?? b.closeHour) - (p.openHour ?? b.openHour) < 1) throw new DemoError(400, "Closing time must be after opening time.");
    if (p.timeOff && p.timeOff.some((d) => !isDay(d))) throw new DemoError(400, "Days off must be dates.");
    const patch: Partial<SeedBarber> = {};
    if (p.workingDays) patch.workingDays = [...new Set(p.workingDays)].sort();
    if (p.openHour !== undefined) patch.openHour = p.openHour;
    if (p.closeHour !== undefined) patch.closeHour = p.closeHour;
    if (p.timeOff) patch.timeOff = [...new Set(p.timeOff)].sort();
    if (p.offline !== undefined) patch.offline = !!p.offline;
    if (p.sharePercent !== undefined) patch.sharePercent = p.sharePercent === null ? undefined : Math.max(0, Math.min(100, Math.round(p.sharePercent)));
    patchBarber(b.id, patch);
    persist();
    return memberView(getBarber(b.id), shopToday(shop));
  }

  // Services, times and prices for the whole team, or for chosen barbers.
  if (path === "/manage/services" && method === "PUT") {
    const list = ((body?.services ?? []) as { name: string; durationMin: number; price: number; category?: string; description?: string }[]).map((s) => ({ name: String(s.name ?? "").trim(), durationMin: Number(s.durationMin), price: Number(s.price), category: s.category, description: s.description }));
    if (!list.length) throw new DemoError(400, "Keep at least one service");
    if (list.length > 40) throw new DemoError(400, "Up to 40 services.");
    if (list.some((s) => s.name.length < 2 || s.name.length > 60)) throw new DemoError(400, "Give every service a name");
    if (list.some((s) => !Number.isInteger(s.durationMin) || s.durationMin < 10 || s.durationMin > 480)) throw new DemoError(400, "Services take between 10 minutes and 8 hours.");
    if (list.some((s) => !Number.isInteger(s.price) || s.price < 0)) throw new DemoError(400, "Check the prices.");
    const names = list.map((s) => nameKey(s.name));
    if (new Set(names).size !== names.length) throw new DemoError(400, "Two services have the same name.");
    const chosen = (body?.barberIds ?? []) as string[];
    const targets = chosen.length ? chosen.map((id) => teamBarber(shop, id)) : teamOf(shop);
    for (const b of targets) {
      for (const old of b.services) {
        if (names.includes(nameKey(old.name))) continue;
        const booked = saved.bookings.some((k) => k.barberId === b.id && k.serviceId === old.id && ["confirmed", "on_the_way"].includes(k.status) && Date.parse(k.endsAt) > Date.now());
        if (booked) throw new DemoError(409, `${firstName(b.name)} has upcoming bookings for "${old.name}" — keep it until they're done.`);
      }
    }
    for (const b of targets) {
      patchBarber(b.id, { services: list.map((s) => {
        const old = b.services.find((o) => nameKey(o.name) === nameKey(s.name));
        return { id: old?.id ?? `${b.id}-${newId().slice(0, 8)}`, ...s, category: s.category ?? old?.category, description: s.description ?? old?.description };
      }) });
    }
    persist();
    return teamOf(shop).map((b) => memberView(b, shopToday(shop)));
  }

  // Add a barber to the team: their app account is created, with a first password to hand over.
  if (path === "/manage/barbers" && method === "POST") {
    const name = String(body?.name ?? "").trim();
    const email = String(body?.email ?? "").trim().toLowerCase();
    if (name.length < 2 || name.length > 60) throw new DemoError(400, "Add their name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new DemoError(400, "Add a valid email.");
    if (saved.users.some((u) => u.email === email)) throw new DemoError(409, "There's already an account with that email.");
    const team = teamOf(shop);
    const id = newId();
    const template = team[0]?.services ?? [{ id: "", name: "Classic haircut", durationMin: 30, price: 8000 }];
    const barber: SeedBarber = {
      id, name, bio: "", photoUrl: "", countryCode: shop.countryCode, city: shop.city, shopAddress: shop.address, shopId: shop.id,
      lat: shop.lat, lng: shop.lng, specialties: [], services: template.map((s) => ({ ...s, id: `${id}-${newId().slice(0, 8)}` })),
      offersHomeVisits: false, homeVisitFee: 0, yearsExperience: 0, languages: [], gallery: [], transformations: [],
      workingDays: [...shop.workingDays], openHour: shop.openHour, closeHour: shop.closeHour, ratingSum: 0, ratingCount: 0,
      status: reviewNewBarbers() ? "pending" : "live", joinedAt: new Date().toISOString(),
    };
    saved.newBarbers.push(barber);
    const password = Array.from(crypto.getRandomValues(new Uint8Array(6)), (n) => CODE_CHARS[n % CODE_CHARS.length]).join("").toLowerCase();
    saved.users.push({ id: newId(), name, email, passwordHash: await hash(password), role: "barber", barberId: id, countryCode: shop.countryCode, city: shop.city, createdAt: new Date().toISOString() });
    persist();
    return { barber: memberView(barber, shopToday(shop)), login: { email, password } };
  }

  // How the shop is doing — today, this week (Monday to Sunday) or this month, including what's already booked.
  if (path === "/manage/reports" && method === "GET") {
    const period = (["today", "week", "month"].includes(q.period ?? "") ? q.period : "week") as "today" | "week" | "month";
    const now = shopToday(shop);
    const first = period === "today" ? now : period === "week" ? addDays(now, -((new Date(`${now}T12:00:00Z`).getUTCDay() + 6) % 7)) : `${now.slice(0, 8)}01`;
    const end = period === "today" ? now : period === "week" ? addDays(first, 6) : addDays(`${addDays(`${now.slice(0, 8)}28`, 4).slice(0, 8)}01`, -1);
    const days = Math.round((Date.parse(`${end}T12:00:00Z`) - Date.parse(`${first}T12:00:00Z`)) / DAY) + 1;
    const from = dayStart(shop, first);
    const to = dayStart(shop, addDays(end, 1));
    const team = teamOf(shop);
    const inRange = saved.bookings.filter((b) => team.some((t) => t.id === b.barberId) && b.status !== "pending_payment" && Date.parse(b.startsAt) >= from && Date.parse(b.startsAt) < to);
    const active = inRange.filter((b) => PAID.has(b.status));
    const dates = Array.from({ length: days }, (_, i) => addDays(first, i));
    const byBarber = team.map((t) => {
      const mine = active.filter((b) => b.barberId === t.id);
      const bookedMin = mine.reduce((m, b) => m + (Date.parse(b.endsAt) - Date.parse(b.startsAt)) / 60_000, 0);
      const workMin = dates.filter((d) => isWorking(t, d)).length * (t.closeHour - t.openHour) * 60;
      return {
        id: t.id, name: t.name, photoUrl: t.photoUrl, bookings: mine.length, completed: mine.filter((b) => b.status === "completed").length,
        walkIns: mine.filter((b) => !fromApp(b)).length, noShows: inRange.filter((b) => b.barberId === t.id && b.noShow).length,
        takings: mine.reduce((s, b) => s + b.amount, 0), busyPercent: workMin ? Math.min(100, Math.round((bookedMin / workMin) * 100)) : 0,
      };
    }).sort((a, b) => b.takings - a.takings);
    const services = new Map<string, number>();
    for (const b of active) {
      const name = findService(team.find((t) => t.id === b.barberId)!, b.serviceId)?.name ?? "Other";
      services.set(name, (services.get(name) ?? 0) + 1);
    }
    return {
      period, from: first, to: end, today: now, currency: shopCurrency(shop),
      totals: {
        bookings: active.length, completed: active.filter((b) => b.status === "completed").length,
        fromApp: active.filter(fromApp).length, walkIns: active.filter((b) => !fromApp(b)).length,
        noShows: inRange.filter((b) => b.noShow).length, cancelled: inRange.filter((b) => b.status === "cancelled" && !b.noShow).length,
        takings: active.reduce((s, b) => s + b.amount, 0), appTakings: active.filter(fromApp).reduce((s, b) => s + b.amount, 0),
      },
      byBarber,
      topServices: [...services].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 6),
      perDay: dates.map((d) => ({ date: d, count: active.filter((b) => localDate(b.startsAt, tz) === d).length })),
    };
  }

  // The shop's own details and opening hours.
  if (path === "/manage/settings" && method === "PATCH") {
    const p = (body ?? {}) as ShopSettings;
    if (!hourOk(p.openHour, 0, 23) || !hourOk(p.closeHour, 1, 24)) throw new DemoError(400, "Pick hours between 00:00 and 24:00.");
    if ((p.closeHour ?? shop.closeHour) - (p.openHour ?? shop.openHour) < 1) throw new DemoError(400, "Closing time must be after opening time.");
    if (p.workingDays && !p.workingDays.length) throw new DemoError(400, "Pick at least one open day.");
    const patch: ShopSettings = {};
    if (p.about !== undefined) patch.about = String(p.about).trim().slice(0, 400);
    if (p.phone !== undefined) patch.phone = String(p.phone).trim().slice(0, 30);
    if (p.workingDays) patch.workingDays = [...new Set(p.workingDays)].sort();
    if (p.openHour !== undefined) patch.openHour = p.openHour;
    if (p.closeHour !== undefined) patch.closeHour = p.closeHour;
    if (p.barberSharePercent !== undefined) {
      if (role !== "owner") throw new DemoError(403, "Only the shop's owner can change the money split.");
      patch.barberSharePercent = Math.max(0, Math.min(100, Math.round(Number(p.barberSharePercent))));
    }
    saved.shopSettings = { ...saved.shopSettings, [shop.id]: { ...saved.shopSettings?.[shop.id], ...patch } };
    persist();
    const s = getShop(shop.id);
    return { about: s.about, phone: s.phone, workingDays: s.workingDays, openHour: s.openHour, closeHour: s.closeHour, barberSharePercent: s.barberSharePercent ?? DEFAULT_BARBER_SHARE };
  }
  throw new DemoError(404, "Not found.");
}

const origin = () => (typeof location !== "undefined" ? location.origin : "");

// ---------- The barber's own tools and the walk-in queue (mirrors server/src/routes/pro.ts and shopOps.ts) ----------

const clientKey = (b: Booking) => (b.guest ? `guest:${b.guest.name.trim().toLowerCase()}` : b.customerId);

function clientsOf(barber: SeedBarber) {
  const mine = saved.bookings.filter((b) => b.barberId === barber.id && PAID.has(b.status) && b.serviceId !== CONSULTATION.id);
  const groups = new Map<string, Booking[]>();
  for (const b of mine) groups.set(clientKey(b), [...(groups.get(clientKey(b)) ?? []), b]);
  const now = Date.now();
  return [...groups].map(([key, list]) => {
    list.sort((a, b) => a.startsAt.localeCompare(b.startsAt));
    const past = list.filter((b) => Date.parse(b.startsAt) <= now);
    const next = list.find((b) => Date.parse(b.startsAt) > now);
    const last = past.at(-1);
    const user = key.startsWith("guest:") ? undefined : saved.users.find((u) => u.id === key);
    return {
      key, name: list.at(-1)!.guest?.name ?? user?.name ?? "Client", photoUrl: user?.photoUrl ?? null,
      visits: past.length, lastVisit: last?.startsAt ?? null, nextVisit: next?.startsAt ?? null,
      spend: list.reduce((s, b) => s + b.amount + (fromApp(b) ? b.tip ?? 0 : 0), 0), currency: list[0]!.currency,
      lastService: last ? findService(barber, last.serviceId)?.name ?? null : null,
      cutNotes: [...past].reverse().find((b) => b.cutNotes)?.cutNotes ?? null, preferences: user?.preferences ?? null,
      note: barber.clientNotes?.[key] ?? "", fromApp: !!user && !user.deletedAt && fromApp(list.at(-1)!), lastMessagedAt: barber.nudgedAt?.[key] ?? null, phone: list.at(-1)!.guest?.phone || "",
    };
  }).sort((a, b) => (b.lastVisit ?? b.nextVisit ?? "").localeCompare(a.lastVisit ?? a.nextVisit ?? ""));
}

function messageClients(fromName: string, nudged: Record<string, string>, keys: string[], text: string, link: string) {
  let sent = 0;
  let skipped = 0;
  for (const key of new Set(keys)) {
    const user = key.startsWith("guest:") ? undefined : saved.users.find((u) => u.id === key && !u.deletedAt);
    const recent = nudged[key] && Date.now() - Date.parse(nudged[key]!) < 7 * DAY;
    if (!user || recent || user.alerts?.offers === false) {
      skipped++;
      continue;
    }
    notify(user.id, { kind: "message", title: `Message from ${fromName}`, body: `${text}\n\nBook: ${link}` });
    nudged[key] = new Date().toISOString();
    sent++;
  }
  return { sent, skipped };
}

function shopOpenNow(s: SeedShop) {
  const p = Object.fromEntries(new Intl.DateTimeFormat("en-US", { timeZone: shopTz(s), weekday: "short", hour: "2-digit", hourCycle: "h23" }).formatToParts(new Date()).map((x) => [x.type, x.value]));
  const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(p.weekday!);
  return s.workingDays.includes(day) && Number(p.hour) >= s.openHour && Number(p.hour) < s.closeHour;
}

function queueOf(s: SeedShop) {
  const since = Date.now() - DAY / 2;
  const list = (saved.queue ?? []).filter((e) => e.shopId === s.id && Date.parse(e.joinedAt) > since).sort((a, b) => a.joinedAt.localeCompare(b.joinedAt));
  const chairs = Math.max(1, teamOf(s).filter((b) => isLive(b) && openNow(b)).length);
  const waiting = list.filter((e) => e.status === "waiting");
  const estimate = (i: number) => Math.ceil(((i + 1) * 30) / chairs / 5) * 5;
  return { list, waiting, chairs, estimate };
}

function queueView(e: QueueEntry, position: number | null, estimateMin: number | null) {
  const barber = e.barberId ? allBarbers().find((b) => b.id === e.barberId) : undefined;
  return { id: e.id, name: e.name, phone: e.phone, service: e.service, status: e.status, joinedAt: e.joinedAt, calledAt: e.calledAt ?? null, fromApp: !!e.userId, barber: barber ? { id: barber.id, name: barber.name } : null, position, estimateMin };
}

async function proRoutes(method: string, path: string, q: Record<string, string>, body: Body | undefined, token: string | null): Promise<{ hit: boolean; value?: unknown }> {
  const hit = (value: unknown) => ({ hit: true, value });
  let x: RegExpMatchArray | null;
  const myBarber = () => {
    const u = requireUser(token);
    if (!u.barberId) throw new DemoError(403, "Only barbers can do this.");
    return getBarber(u.barberId);
  };
  if (path === "/barbers/me/blocks" && method === "GET") {
    const b = myBarber();
    return hit((saved.blocks ?? []).filter((k) => k.barberId === b.id && Date.parse(k.endsAt) > Date.now()).sort((a, c) => a.startsAt.localeCompare(c.startsAt)).map(({ seeded: _s, ...k }) => k));
  }
  if (path === "/barbers/me/blocks" && method === "POST") {
    const b = myBarber();
    const start = Date.parse(String(body?.startsAt));
    const end = Date.parse(String(body?.endsAt));
    if (!(end - start >= 15 * 60_000)) throw new DemoError(400, "Block at least 15 minutes.");
    if (end - start > 3 * DAY) throw new DemoError(400, "For whole days, use Hours & days off.");
    if (end < Date.now()) throw new DemoError(400, "That time has already passed.");
    if (saved.bookings.some((k) => k.barberId === b.id && ["confirmed", "on_the_way"].includes(k.status) && start < Date.parse(k.endsAt) && end > Date.parse(k.startsAt))) throw new DemoError(409, "You have a booking in that time. Move or cancel it first.");
    const block = { id: newId(), shopId: b.shopId ?? "", barberId: b.id, startsAt: new Date(start).toISOString(), endsAt: new Date(end).toISOString(), reason: String(body?.reason ?? "").trim().slice(0, 80) || "Blocked", createdAt: new Date().toISOString() };
    (saved.blocks ??= []).push(block);
    persist();
    return hit(block);
  }
  if ((x = path.match(/^\/barbers\/me\/blocks\/([^/]+)$/)) && method === "DELETE") {
    const b = myBarber();
    const before = saved.blocks?.length ?? 0;
    saved.blocks = (saved.blocks ?? []).filter((k) => !(k.id === x![1] && k.barberId === b.id));
    if (saved.blocks.length === before) throw new DemoError(404, "Not found.");
    persist();
    return hit(undefined);
  }
  if (path === "/barbers/me/rules") {
    const b = myBarber();
    if (method === "PUT") {
      const rule = (r: unknown) => {
        if (r === null || r === undefined) return r as null | undefined;
        const v = r as PriceRule;
        if (!v.days?.length) throw new DemoError(400, "Pick at least one day");
        if (!(v.toHour > v.fromHour)) throw new DemoError(400, "The end time must be after the start time.");
        if (!(v.percent >= 5 && v.percent <= 30)) throw new DemoError(400, "Between 5% and 30%.");
        return { percent: Math.round(v.percent), days: [...new Set(v.days)], fromHour: v.fromHour, toHour: v.toHour };
      };
      const offPeak = rule(body?.offPeak);
      const peak = rule(body?.peak);
      if (offPeak && peak && offPeak.days.some((d) => peak.days.includes(d)) && offPeak.fromHour < peak.toHour && peak.fromHour < offPeak.toHour) throw new DemoError(400, "Off-peak and peak hours overlap. Change one of them.");
      const patch: Partial<SeedBarber> = {};
      if (body?.cancelPolicy) patch.cancelPolicy = { freeHours: Number(body.cancelPolicy.freeHours) || 0, lateFeePercent: Number(body.cancelPolicy.lateFeePercent) || 0 };
      if (offPeak !== undefined) patch.offPeak = offPeak;
      if (peak !== undefined) patch.peak = peak;
      patchBarber(b.id, patch);
      persist();
    }
    const now = getBarber(b.id);
    return hit({ cancelPolicy: now.cancelPolicy ?? { freeHours: 0, lateFeePercent: 0 }, offPeak: now.offPeak ?? null, peak: now.peak ?? null });
  }
  if (path === "/barbers/me/clients" && method === "GET") return hit(clientsOf(myBarber()));
  if (path === "/barbers/me/clients/note" && method === "PUT") {
    const b = myBarber();
    const key = String(body?.key ?? "");
    if (!clientsOf(b).some((c) => c.key === key)) throw new DemoError(404, "Client not found.");
    const notes = { ...b.clientNotes, [key]: String(body?.note ?? "").trim().slice(0, 500) };
    if (!notes[key]) delete notes[key];
    patchBarber(b.id, { clientNotes: notes });
    persist();
    return hit({ key, note: notes[key] ?? "" });
  }
  if (path === "/barbers/me/clients/message" && method === "POST") {
    const b = myBarber();
    const text = String(body?.text ?? "").trim();
    if (text.length < 5) throw new DemoError(400, "Write a short message");
    const known = new Set(clientsOf(b).map((c) => c.key));
    const nudged = { ...b.nudgedAt };
    const r = messageClients(b.name, nudged, ((body?.keys ?? []) as string[]).filter((k) => known.has(k)), text.slice(0, 400), `${origin()}/barber/${b.id}`);
    patchBarber(b.id, { nudgedAt: nudged });
    persist();
    return hit(r);
  }
  if (path === "/barbers/me/link") {
    const b = myBarber();
    const level = levelOf(b);
    return hit({ url: `${origin()}/barber/${b.id}`, name: b.name, level, levelLabel: LEVEL_NAME[level] });
  }
  // Customers and the walk-in queue.
  if ((x = path.match(/^\/shops\/([^/]+)\/queue(\/mine)?$/))) {
    const s = getShop(x[1]!);
    const { list, waiting, estimate } = queueOf(s);
    const u = token && saved.sessions[token] ? saved.users.find((y) => y.id === saved.sessions[token]) : undefined;
    const open = (e: QueueEntry) => ["waiting", "called", "serving"].includes(e.status);
    if (method === "DELETE") {
      const me = requireUser(token);
      const e = list.find((y) => y.userId === me.id && open(y));
      if (e) e.status = "left";
      persist();
      return hit(undefined);
    }
    if (method === "POST") {
      const me = requireUser(token);
      if (!shopOpenNow(s)) throw new DemoError(400, `${s.name} is closed right now. Book a time instead.`);
      if (list.some((y) => y.userId === me.id && open(y))) throw new DemoError(409, "You're already in the queue.");
      const e: QueueEntry = { id: newId(), shopId: s.id, name: me.name, phone: me.phone ?? "", userId: me.id, service: String(body?.service ?? "Haircut").slice(0, 60), status: "waiting", joinedAt: new Date().toISOString() };
      (saved.queue ??= []).push(e);
      persist();
      return hit(queueView(e, null, null));
    }
    const mine = u ? list.find((y) => y.userId === u.id && open(y)) : undefined;
    const pos = mine ? waiting.indexOf(mine) : -1;
    return hit({
      open: shopOpenNow(s), waiting: waiting.length, estimateMin: waiting.length ? estimate(waiting.length - 1) : 0,
      nowServing: list.filter((e) => e.status === "called" || e.status === "serving").map((e) => firstName(e.name)),
      mine: mine ? queueView(mine, pos >= 0 ? pos + 1 : null, pos >= 0 ? estimate(pos) : 0) : null,
    });
  }
  return { hit: false };
}

/** The shop floor in the panel: queue, check-in, deliveries, stock, hires, staff, pay and client messages. */
async function shopOpsRoutes(method: string, path: string, q: Record<string, string>, body: Body | undefined, me: User, shop: SeedShop, role: "owner" | "manager" | "front_desk"): Promise<{ hit: boolean; value?: unknown }> {
  const hit = (value: unknown) => ({ hit: true, value });
  let x: RegExpMatchArray | null;
  const tz = shopTz(shop);
  const cur = shopCurrency(shop);
  if (path === "/manage/queue" && method === "GET") {
    const { list, waiting, chairs, estimate } = queueOf(shop);
    return hit({
      open: shopOpenNow(shop), chairs, waiting: waiting.map((e, i) => queueView(e, i + 1, estimate(i))),
      inChair: list.filter((e) => e.status === "called" || e.status === "serving").map((e) => queueView(e, null, null)),
      doneToday: list.filter((e) => e.status === "done").length,
      team: teamOf(shop).filter(isLive).map((b) => ({ id: b.id, name: b.name, photoUrl: b.photoUrl, working: openNow(b) })),
    });
  }
  if (path === "/manage/queue" && method === "POST") {
    const name = String(body?.name ?? "").trim();
    if (!name) throw new DemoError(400, "Add a name");
    const e: QueueEntry = { id: newId(), shopId: shop.id, name: name.slice(0, 60), phone: String(body?.phone ?? ""), service: String(body?.service ?? "Haircut").slice(0, 60), status: "waiting", joinedAt: new Date().toISOString() };
    (saved.queue ??= []).push(e);
    persist();
    return hit(queueView(e, null, null));
  }
  if ((x = path.match(/^\/manage\/queue\/([^/]+)$/)) && method === "POST") {
    const e = (saved.queue ?? []).find((y) => y.id === x![1] && y.shopId === shop.id);
    if (!e) throw new DemoError(404, "Not in the queue.");
    const action = String(body?.action);
    if (body?.barberId) teamBarber(shop, String(body.barberId));
    if (action === "call") {
      e.status = "called";
      e.calledAt = new Date().toISOString();
      if (body?.barberId) e.barberId = String(body.barberId);
      const who = e.barberId ? allBarbers().find((b) => b.id === e.barberId)?.name.split(" ")[0] : null;
      if (e.userId) notify(e.userId, { kind: "queue", title: "It's your turn", body: `${who ? `${who} is ready for you` : "Your chair is ready"} at ${shop.name}. Head to the desk.` });
    } else if (action === "serve") {
      e.status = "serving";
      if (body?.barberId) e.barberId = String(body.barberId);
    } else if (action === "done") {
      e.status = "done";
      e.doneAt = new Date().toISOString();
    } else e.status = "left";
    persist();
    return hit(queueView(e, null, null));
  }
  if (path === "/manage/check-in" && method === "GET") {
    const day = localDate(Date.now(), tz);
    const team = new Map(teamOf(shop).map((b) => [b.id, b]));
    return hit(saved.bookings
      .filter((b) => team.has(b.barberId) && PAID.has(b.status) && b.locationType === "shop" && localDate(b.startsAt, tz) === day)
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
      .map((b) => {
        const v = calendarBooking(b);
        return { id: b.id, firstName: firstName(v.client), startsAt: b.startsAt, barber: team.get(b.barberId)!.name, service: v.service, checkedIn: !!b.checkedInAt, done: b.status === "completed" };
      }));
  }
  if ((x = path.match(/^\/manage\/check-in\/([^/]+)$/)) && method === "POST") {
    const b = shopBooking(shop, x[1]!);
    b.checkedInAt ??= new Date().toISOString();
    persist();
    return hit({ id: b.id, checkedIn: true });
  }
  const orderRow = (o: Order) => ({
    id: o.id, status: o.status, createdAt: o.createdAt, name: o.shippingName || "Customer", address: o.shippingAddress,
    items: o.items.map((i) => ({ name: i.name, quantity: i.quantity })), subtotal: o.subtotal, amount: o.amount, currency: o.currency,
    commission: Math.round((o.subtotal * PRODUCT_COMMISSION_PERCENT) / 100),
  });
  const monthStart = dayStart(shop, `${shopToday(shop).slice(0, 8)}01`);
  if (path === "/manage/orders" && method === "GET") {
    dueReminders();
    const orders = saved.orders.filter((o) => o.shopId === shop.id && o.status !== "pending_payment").sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const month = orders.filter((o) => o.status !== "cancelled" && Date.parse(o.createdAt) >= monthStart);
    return hit({ commissionPercent: PRODUCT_COMMISSION_PERCENT, currency: cur, month: { orders: month.length, sales: month.reduce((s, o) => s + o.subtotal, 0), commission: month.reduce((s, o) => s + orderRow(o).commission, 0) }, orders: orders.slice(0, 100).map(orderRow) });
  }
  if ((x = path.match(/^\/manage\/orders\/([^/]+)$/)) && method === "POST") {
    const o = saved.orders.find((y) => y.id === x![1] && y.shopId === shop.id);
    if (!o) throw new DemoError(404, "Order not found.");
    if (!["paid", "out_for_delivery"].includes(o.status)) throw new DemoError(400, "Only paid orders can be updated.");
    if (o.status !== body?.status) {
      o.status = body?.status === "delivered" ? "delivered" : "out_for_delivery";
      o.demoOutAt = o.demoDeliveredAt = undefined; // the shop is driving it now
      orderAlert(o);
      persist();
    }
    return hit(orderRow(o));
  }
  if (path === "/manage/stock") {
    if (method === "PUT") {
      if (role === "front_desk") throw new DemoError(403, "Ask your manager — front desk accounts can't change this.");
      const shelf = { ...saved.stock?.[shop.id] };
      for (const [id, n] of Object.entries((body?.counts ?? {}) as Record<string, number | null>)) {
        if (!shop.productIds.includes(id)) throw new DemoError(400, "That product isn't stocked here.");
        if (n === null) delete shelf[id];
        else shelf[id] = Math.max(0, Math.round(n));
      }
      saved.stock = { ...saved.stock, [shop.id]: shelf };
      persist();
      return hit({ ok: true });
    }
    const shelf = saved.stock?.[shop.id] ?? {};
    return hit(seed.products.filter((p) => shop.productIds.includes(p.id)).map((p) => ({ id: p.id, name: p.name, emoji: p.emoji, price: p.prices[cur] ?? p.prices.eur, currency: cur, count: shelf[p.id] ?? null, low: shelf[p.id] !== undefined && shelf[p.id]! <= 3 })));
  }
  if (path === "/manage/hires" && method === "GET") {
    return hit((saved.hires ?? []).filter((h) => h.shopId === shop.id && h.status !== "pending_payment").sort((a, b) => b.startsAt.localeCompare(a.startsAt)).map((h) => ({
      id: h.id, startsAt: h.startsAt, endsAt: h.endsAt, hours: h.hours, guests: h.guests, occasion: h.occasion, notes: h.notes, amount: h.amount, currency: h.currency, status: h.status,
      customer: saved.users.find((u) => u.id === h.customerId)?.name ?? "Customer",
    })));
  }
  const staffView = (u: User) => ({ id: u.id, name: u.name, email: u.email, role: u.shopRole ?? "owner", you: u.id === me.id });
  if (path === "/manage/staff" && method === "GET") return hit(saved.users.filter((u) => !u.deletedAt && (u.manages === shop.id || u.branches?.includes(shop.id))).map(staffView));
  if (path === "/manage/staff" && method === "POST") {
    const email = String(body?.email ?? "").trim().toLowerCase();
    const name = String(body?.name ?? "").trim();
    if (name.length < 2 || !email.includes("@")) throw new DemoError(400, "Add a name and an email.");
    if (saved.users.some((u) => u.email === email)) throw new DemoError(409, "There's already an account with that email.");
    const password = Array.from(crypto.getRandomValues(new Uint8Array(6)), (n) => CODE_CHARS[n % CODE_CHARS.length]).join("").toLowerCase();
    const u: User = { id: newId(), name, email, passwordHash: await hash(password), role: "customer", manages: shop.id, shopRole: body?.role === "manager" ? "manager" : "front_desk", countryCode: shop.countryCode, city: shop.city, createdAt: new Date().toISOString() };
    saved.users.push(u);
    persist();
    return hit({ staff: staffView(u), login: { email, password } });
  }
  if ((x = path.match(/^\/manage\/staff\/([^/]+)$/))) {
    const u = saved.users.find((y) => y.id === x![1] && y.manages === shop.id);
    if (!u || u.id === me.id || (u.shopRole ?? "owner") === "owner") throw new DemoError(404, "Staff member not found.");
    if (method === "PATCH") {
      u.shopRole = body?.role === "manager" ? "manager" : "front_desk";
      persist();
      return hit(staffView(u));
    }
    delete u.manages;
    delete u.shopRole;
    for (const [t, id] of Object.entries(saved.sessions)) if (id === u.id) delete saved.sessions[t];
    persist();
    return hit(null);
  }
  if (path === "/manage/payroll" && method === "GET") {
    const period = (["today", "week", "month"].includes(q.period ?? "") ? q.period : "month") as "today" | "week" | "month";
    const now = shopToday(shop);
    const first = period === "today" ? now : period === "week" ? addDays(now, -((new Date(`${now}T12:00:00Z`).getUTCDay() + 6) % 7)) : `${now.slice(0, 8)}01`;
    const end = period === "today" ? now : period === "week" ? addDays(first, 6) : addDays(`${addDays(`${now.slice(0, 8)}28`, 4).slice(0, 8)}01`, -1);
    const from = dayStart(shop, first);
    const to = dayStart(shop, addDays(end, 1));
    const shopDefault = shop.barberSharePercent ?? DEFAULT_BARBER_SHARE;
    const rows = teamOf(shop).map((t) => {
      const mine = saved.bookings.filter((b) => b.barberId === t.id && Date.parse(b.startsAt) >= from && Date.parse(b.startsAt) < to);
      const done = mine.filter((b) => PAID.has(b.status));
      const services = done.reduce((s, b) => s + b.amount, 0);
      const lateFees = mine.filter((b) => b.status === "cancelled" && b.lateFee).reduce((s, b) => s + b.lateFee!, 0);
      const tips = done.filter(fromApp).reduce((s, b) => s + (b.tip ?? 0), 0);
      const jbFee = done.filter(fromApp).reduce((s, b) => s + bookingFee(b), 0) + platformFee(lateFees);
      const share = t.sharePercent ?? shopDefault;
      const net = services + lateFees - jbFee;
      const barberPay = Math.round((net * share) / 100) + tips;
      return { id: t.id, name: t.name, photoUrl: t.photoUrl, sharePercent: share, customShare: t.sharePercent !== undefined, appointments: done.length, walkIns: done.filter((b) => !fromApp(b)).length, services, lateFees, tips, jbFee, barberPay, shopKeeps: net - (barberPay - tips) };
    }).sort((a, b) => b.services - a.services);
    const productCommission = saved.orders.filter((o) => o.shopId === shop.id && !["pending_payment", "cancelled"].includes(o.status) && Date.parse(o.createdAt) >= from && Date.parse(o.createdAt) < to).reduce((s, o) => s + Math.round((o.subtotal * PRODUCT_COMMISSION_PERCENT) / 100), 0);
    const sum = (k: "services" | "lateFees" | "tips" | "jbFee" | "barberPay" | "shopKeeps") => rows.reduce((s, r) => s + r[k], 0);
    return hit({
      period, from: first, to: end, currency: cur, defaultSharePercent: shopDefault, canEditSplit: role === "owner", rows,
      totals: { services: sum("services"), lateFees: sum("lateFees"), tips: sum("tips"), jbFee: sum("jbFee"), barberPay: sum("barberPay"), shopKeeps: sum("shopKeeps") + productCommission, productCommission },
      note: "Walk-ins are paid at the shop and carry no Always Fresh fee. Tips go to the barber in full. App money is paid out by Always Fresh; walk-in money is already in the shop's till.",
    });
  }
  const lapsed = (weeks: number) => {
    const team = new Set(teamOf(shop).map((b) => b.id));
    const last = new Map<string, number>();
    const upcoming = new Set<string>();
    for (const b of saved.bookings.filter((y) => team.has(y.barberId) && fromApp(y) && PAID.has(y.status) && !y.guest)) {
      const t = Date.parse(b.startsAt);
      if (t > Date.now()) upcoming.add(b.customerId);
      else last.set(b.customerId, Math.max(last.get(b.customerId) ?? 0, t));
    }
    const cutoff = Date.now() - weeks * 7 * DAY;
    return { all: last.size, ids: [...last].filter(([id, t]) => t < cutoff && !upcoming.has(id)).map(([id]) => id) };
  };
  if (path === "/manage/clients" && method === "GET") {
    const weeks = Math.max(2, Math.min(52, Number(q.weeks) || 6));
    const r = lapsed(weeks);
    return hit({ clients: r.all, lapsed: r.ids.length, weeks });
  }
  if (path === "/manage/clients/message" && method === "POST") {
    const text = String(body?.text ?? "").trim();
    if (text.length < 5) throw new DemoError(400, "Write a short message");
    const nudged = ((saved.shopNudges ??= {})[shop.id] ??= {});
    const r = messageClients(shop.name, nudged, lapsed(Number(body?.weeks) || 6).ids, text.slice(0, 400), `${origin()}/barbershop/${shop.id}`);
    persist();
    return hit(r);
  }
  return { hit: false };
}

// ---------- Platform: partners, awards, recommendations, receipts, chat, payouts (mirrors server/src/routes/platform.ts) ----------

const monthOf = (iso: string) => iso.slice(0, 7);
const lastMonth = () => {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() - 1, 1)).toISOString().slice(0, 7);
};
const monthLabel = (m: string) => new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${m}-15T00:00:00Z`));

function partnerFor(code: unknown, customer: User | undefined): Partner | undefined {
  const active = (saved.partners ?? []).filter((p) => p.active);
  if (typeof code === "string" && code) {
    const byCode = active.find((p) => p.code === code.toUpperCase());
    if (byCode) return byCode;
  }
  const domain = customer?.email.split("@")[1]?.toLowerCase();
  return domain ? active.find((p) => p.kind === "corporate" && p.emailDomain === domain) : undefined;
}
const partnerCommission = (b: Booking) => {
  const p = b.partnerId ? (saved.partners ?? []).find((x) => x.id === b.partnerId) : undefined;
  return p && p.kind === "hotel" ? Math.round((b.amount * p.commissionPercent) / 100) : 0;
};

function awardsFor(countryCode: string, city: string, month: string) {
  const cuts = new Map<string, number>();
  for (const b of saved.bookings) if (b.status === "completed" && monthOf(b.startsAt) === month && b.serviceId !== CONSULTATION.id) cuts.set(b.barberId, (cuts.get(b.barberId) ?? 0) + 1);
  return allBarbers()
    .filter((b) => isLive(b) && b.countryCode === countryCode && b.city.toLowerCase() === city.toLowerCase() && rating(b).ratingCount > 0)
    .map((b) => {
      const r = rating(b);
      const n = cuts.get(b.id) ?? 0;
      return { barber: b, cuts: n, score: (n * 2 + Math.min(r.ratingCount, 200) / 10) * r.raw };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
}
function awardOf(b: SeedBarber) {
  const m = lastMonth();
  const i = awardsFor(b.countryCode, b.city, m).findIndex((x) => x.barber.id === b.id);
  return i >= 0 ? { rank: i + 1, month: m, label: `Top 10 in ${b.city} · ${monthLabel(m).split(" ")[0]}` } : null;
}

function chatView(c: DemoChat, side: "customer" | "barber") {
  const b = getBarber(c.barberId);
  const customer = saved.users.find((u) => u.id === c.customerId);
  const readAt = side === "customer" ? c.customerReadAt : c.barberReadAt;
  const other = side === "customer" ? "barber" : "customer";
  return {
    id: c.id,
    with: side === "customer" ? { id: b.id, name: b.name, photoUrl: b.photoUrl } : { id: c.customerId, name: customer?.name ?? "Client", photoUrl: customer?.photoUrl ?? "" },
    last: c.messages.at(-1) ?? null,
    unread: c.messages.filter((m) => m.from === other && (!readAt || m.at > readAt)).length,
    updatedAt: c.updatedAt,
  };
}
/** The demo's barbers are fictional (except the sample barber login): they answer once, a few seconds later. */
function demoReplies() {
  for (const c of saved.chats ?? []) {
    if (c.demoReplyAt && Date.now() >= c.demoReplyAt) {
      c.demoReplyAt = undefined;
      const at = new Date().toISOString();
      c.messages.push({ id: newId(), from: "barber", text: "Thanks for your message! See you at your appointment. (Demo: in the app your barber replies here.)", at });
      c.updatedAt = at;
      notify(c.customerId, { kind: "chat", title: `${getBarber(c.barberId).name.split(" ")[0]} replied`, body: "Thanks for your message! See you at your appointment." });
    }
  }
}

async function platformRoutes(method: string, path: string, q: Record<string, string>, body: Body | undefined, token: string | null): Promise<{ hit: boolean; value?: unknown }> {
  const hit = (value: unknown) => ({ hit: true, value });
  let x: RegExpMatchArray | null;
  if (path === "/awards") {
    const month = /^\d{4}-\d{2}$/.test(q.month ?? "") ? q.month! : lastMonth();
    const city = q.city || "Dubai";
    return hit({ month, label: monthLabel(month), city, list: awardsFor(q.country || "AE", city, month).map((a, i) => ({ rank: i + 1, cuts: a.cuts, barber: barberView(a.barber) })) });
  }
  if (path === "/me/recommendations") {
    const u = requireUser(token);
    const booked = new Set(saved.bookings.filter((b) => b.customerId === u.id && b.status !== "pending_payment").map((b) => b.barberId));
    const liked = [...booked, ...(u.favourites ?? [])].map((id) => allBarbers().find((b) => b.id === id)).filter((b): b is SeedBarber => !!b);
    const tastes = new Map<string, number>();
    for (const b of liked) for (const sp of b.specialties) tastes.set(sp, (tastes.get(sp) ?? 0) + 1);
    const city = liked[0]?.city ?? u.city ?? "Dubai";
    const bonus: Record<string, number> = { new: 0, rising: 0.2, pro: 0.5, elite: 0.8 };
    return hit(allBarbers()
      .filter((b) => isLive(b) && !booked.has(b.id) && !(u.favourites ?? []).includes(b.id) && b.city.toLowerCase() === city.toLowerCase())
      .map((b) => {
        const overlap = b.specialties.filter((sp) => tastes.has(sp));
        const top = [...overlap].sort((a, c) => (tastes.get(c) ?? 0) - (tastes.get(a) ?? 0))[0];
        return { b, score: overlap.length * 1.5 + (rating(b).raw || 4) + bonus[levelOf(b)]!, reason: top ? `Because you like ${top}` : `Top rated in ${b.city}` };
      })
      .sort((a, c) => c.score - a.score)
      .slice(0, 8)
      .map(({ b, reason }) => ({ ...barberView(b), reason })));
  }
  if ((x = path.match(/^\/partners\/([^/]+)$/))) {
    const p = (saved.partners ?? []).find((y) => y.code === decodeURIComponent(x![1]!).toUpperCase() && y.active);
    if (!p) throw new DemoError(404, "That code isn't valid.");
    return hit({ code: p.code, name: p.name, kind: p.kind, discountPercent: p.kind === "corporate" ? p.discountPercent : 0 });
  }
  if ((x = path.match(/^\/bookings\/([^/]+)\/invoice$/))) {
    const u = requireUser(token);
    const b = saved.bookings.find((y) => y.id === x![1] && (y.customerId === u.id || (u.barberId && y.barberId === u.barberId) || isAdmin(u)));
    if (!b) throw new DemoError(404, "Booking not found.");
    if (!PAID.has(b.status) && !b.lateFee) throw new DemoError(400, "There's no invoice until the booking is paid.");
    const barber = getBarber(b.barberId);
    const service = findService(barber, b.serviceId);
    const customer = saved.users.find((y) => y.id === b.customerId);
    const ex = (b.extras ?? []).map((id) => barber.services.find((sv) => sv.id === id)).filter((sv): sv is SeedService => !!sv);
    const charged = b.status === "cancelled" ? b.lateFee ?? 0 : b.amount;
    const travel = b.locationType === "home" ? barber.homeVisitFee : 0;
    const lines = b.status === "cancelled"
      ? [{ description: `Late cancellation — ${service?.name ?? "appointment"} with ${barber.name}`, amount: charged }]
      : [{ description: `${service?.name ?? "Appointment"} with ${barber.name}`, amount: b.amount - ex.reduce((t, e) => t + e.price, 0) - travel - (b.travelFee ?? 0) }, ...ex.map((e) => ({ description: e.name, amount: e.price })), ...(travel ? [{ description: "Home visit travel", amount: travel }] : []), ...(b.travelFee ? [{ description: `Extra travel (about ${b.distanceKm} km)`, amount: b.travelFee }] : [])].filter((l) => l.amount > 0);
    return hit({
      number: `AF-${b.startsAt.slice(0, 7).replace("-", "")}-${b.id.slice(0, 6).toUpperCase()}`, title: "Receipt", issuedAt: b.createdAt, serviceDate: b.startsAt, timeZone: timeZoneOf(barber),
      seller: { name: "Always Fresh", address: "Dubai, United Arab Emirates", trn: null, onBehalfOf: barber.name },
      customer: { name: b.guest?.name ?? customer?.name ?? "Customer", email: customer?.email ?? "" }, lines, currency: b.currency,
      discounts: [...(b.creditUsed ? [{ description: "Gift credit", amount: b.creditUsed }] : []), ...(b.partnerDiscount ? [{ description: "Company discount", amount: b.partnerDiscount }] : [])],
      total: charged, vat: null, tip: b.status === "cancelled" ? 0 : b.tip ?? 0, note: b.coveredBy === "membership" ? "Service included in your Club membership." : "",
    });
  }
  if (path === "/chats" || path.startsWith("/chats/")) {
    const u = requireUser(token);
    demoReplies();
    const side = (c: DemoChat): "customer" | "barber" | null => (c.customerId === u.id ? "customer" : u.barberId && c.barberId === u.barberId ? "barber" : null);
    if (path === "/chats" && method === "GET") {
      return hit((saved.chats ?? []).filter((c) => side(c)).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).map((c) => chatView(c, side(c)!)));
    }
    if (path === "/chats" && method === "POST") {
      const b = getBarber(String(body?.barberId));
      if (!saved.bookings.some((k) => k.customerId === u.id && k.barberId === b.id && k.status !== "pending_payment")) throw new DemoError(403, `Book ${b.name.split(" ")[0]} first, then you can message them.`);
      let c = (saved.chats ?? []).find((y) => y.customerId === u.id && y.barberId === b.id);
      if (!c) {
        c = { id: newId(), customerId: u.id, barberId: b.id, messages: [], updatedAt: new Date().toISOString() };
        (saved.chats ??= []).push(c);
        persist();
      }
      return hit(chatView(c, "customer"));
    }
    if ((x = path.match(/^\/chats\/([^/]+)(\/messages)?$/))) {
      const c = (saved.chats ?? []).find((y) => y.id === x![1]);
      const mySide = c && side(c);
      if (!c || !mySide) throw new DemoError(404, "Conversation not found.");
      if (x[2] && method === "POST") {
        const text = String(body?.text ?? "").trim();
        if (!text) throw new DemoError(400, "Write a message");
        const msg = { id: newId(), from: mySide, text: text.slice(0, 1000), at: new Date().toISOString() };
        c.messages.push(msg);
        c.updatedAt = msg.at;
        if (mySide === "customer") {
          c.customerReadAt = msg.at;
          const bu = barberUser(c.barberId);
          if (bu) notify(bu.id, { kind: "chat", title: `Message from ${u.name.split(" ")[0]}`, body: text.slice(0, 160) });
          if (c.barberId !== DEMO_LOGINS.barber.barberId) c.demoReplyAt = Date.now() + 4000;
        } else {
          c.barberReadAt = msg.at;
          notify(c.customerId, { kind: "chat", title: `${getBarber(c.barberId).name.split(" ")[0]} replied`, body: text.slice(0, 160) });
        }
        persist();
        return hit(msg);
      }
      if (mySide === "customer") c.customerReadAt = new Date().toISOString();
      else c.barberReadAt = new Date().toISOString();
      persist();
      return hit({ ...chatView(c, mySide), side: mySide, messages: c.messages.slice(-200) });
    }
  }
  if (path === "/barbers/me/payouts") {
    const u = requireUser(token);
    if (!u.barberId) throw new DemoError(403, "Only barbers can do this.");
    if (method === "POST") throw new DemoError(503, "Payouts aren't switched on in the demo. In the app, Stripe checks your ID and bank once, then pays you automatically.");
    return hit({ available: false, connected: false, payoutsEnabled: false, note: "Payouts switch on when Always Fresh connects Stripe. Until then Always Fresh pays you by bank transfer every week." });
  }
  return { hit: false };
}

function adminPlatform(method: string, path: string, q: Record<string, string>, body: Body | undefined, me: User): { hit: boolean; value?: unknown } {
  const hit = (value: unknown) => ({ hit: true, value });
  let x: RegExpMatchArray | null;
  const owner = adminRole(me) === "owner";
  if (path === "/admin/team") {
    if (!owner) throw new DemoError(403, "Your team role doesn't include this. Ask an owner.");
    if (method === "PUT") {
      const email = String(body?.email ?? "").trim().toLowerCase();
      if (email === DEMO_LOGINS.admin.email) throw new DemoError(400, "That person is an owner set on the server.");
      if (body?.role && !saved.users.some((u) => u.email === email)) throw new DemoError(404, "No account with that email yet — ask them to sign up in the app first.");
      const team = { ...saved.settings?.team };
      if (body?.role) team[email] = body.role;
      else delete team[email];
      saved.settings = { ...saved.settings, team };
      logActivity(me, body?.role ? "team.role_set" : "team.removed", email, body?.role ?? undefined);
      persist();
      return hit({ email, role: body?.role ?? null });
    }
    return hit([{ email: DEMO_LOGINS.admin.email, role: "owner", fixed: true }, ...Object.entries(saved.settings?.team ?? {}).map(([email, role]) => ({ email, role, fixed: false }))].map((m) => ({ ...m, name: saved.users.find((u) => u.email === m.email)?.name ?? null })));
  }
  if (path === "/admin/activity") {
    const text = (q.q ?? "").trim().toLowerCase();
    return hit((saved.activity ?? []).filter((a) => !text || `${a.action} ${a.target} ${a.by.name} ${a.detail ?? ""}`.toLowerCase().includes(text)).slice(-300).reverse());
  }
  if (path === "/admin/analytics") {
    const days = Math.max(7, Math.min(365, Number(q.days) || 30));
    const from = Date.now() - days * DAY;
    const made = saved.bookings.filter((b) => fromApp(b) && Date.parse(b.createdAt) >= from);
    const paid = made.filter((b) => PAID.has(b.status));
    const cancelled = made.filter((b) => b.status === "cancelled");
    const counts = new Map<string, number>();
    for (const b of saved.bookings.filter((y) => fromApp(y) && PAID.has(y.status))) counts.set(b.customerId, (counts.get(b.customerId) ?? 0) + 1);
    const active = new Set(paid.map((b) => b.customerId));
    const firstTime = [...active].filter((id) => !saved.bookings.some((b) => b.customerId === id && fromApp(b) && PAID.has(b.status) && Date.parse(b.createdAt) < from)).length;
    const lead = paid.map((b) => (Date.parse(b.startsAt) - Date.parse(b.createdAt)) / 3_600_000).filter((h) => h >= 0).sort((a, b) => a - b);
    const cities = new Map<string, { bookings: number; revenue: { currency: string; amount: number }[] }>();
    const services = new Map<string, number>();
    const byHour = Array.from({ length: 24 }, () => 0);
    const byWeekday = Array.from({ length: 7 }, () => 0);
    const top = new Map<string, number>();
    for (const b of paid) {
      const barber = allBarbers().find((y) => y.id === b.barberId);
      if (!barber) continue;
      const row = cities.get(barber.city) ?? { bookings: 0, revenue: [] };
      row.bookings += 1;
      row.revenue.push({ currency: b.currency, amount: b.amount });
      cities.set(barber.city, row);
      const name = findService(barber, b.serviceId)?.name ?? "Consultation";
      services.set(name, (services.get(name) ?? 0) + 1);
      const { day, hour } = localDayHour(barber, b.startsAt);
      byHour[hour % 24]! += 1;
      byWeekday[day]! += 1;
      top.set(b.barberId, (top.get(b.barberId) ?? 0) + 1);
    }
    return hit({
      days,
      bookings: { made: made.length, paid: paid.length, cancelled: cancelled.length, cancelRate: made.length ? Math.round((cancelled.length / made.length) * 100) : 0, conversion: made.length ? Math.round((paid.length / made.length) * 100) : 0 },
      customers: { active: active.size, firstTime, returning: active.size - firstTime, newAccounts: saved.users.filter((u) => u.role === "customer" && u.createdAt && Date.parse(u.createdAt) >= from).length, repeatRate: counts.size ? Math.round(([...counts.values()].filter((n) => n >= 2).length / counts.size) * 100) : 0 },
      averageBooking: byCurrency(paid).map((c) => ({ currency: c.currency, amount: Math.round(c.amount / paid.filter((b) => b.currency === c.currency).length) })),
      leadTimeHours: lead.length ? Math.round(lead[Math.floor(lead.length / 2)]!) : 0,
      byCity: [...cities].map(([city, r]) => ({ city, bookings: r.bookings, revenue: byCurrency(r.revenue) })).sort((a, b) => b.bookings - a.bookings).slice(0, 12),
      byService: [...services].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 8),
      byHour, byWeekday,
      topBarbers: [...top].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([id, n]) => {
        const b = allBarbers().find((y) => y.id === id);
        return { id, name: b?.name ?? "Barber", photoUrl: b?.photoUrl ?? "", city: b?.city ?? "", bookings: n };
      }),
    });
  }
  const financeRows = (month: string) => {
    const rows: { date: string; type: string; ref: string; customer: string; barber: string; currency: string; amount: number; jbFee: number }[] = [];
    const who = (id: string) => saved.users.find((u) => u.id === id)?.name ?? "";
    for (const b of saved.bookings) {
      if (!fromApp(b) || monthOf(b.startsAt) !== month) continue;
      const barber = allBarbers().find((y) => y.id === b.barberId)?.name ?? "";
      if (PAID.has(b.status)) {
        rows.push({ date: b.startsAt, type: "booking", ref: b.id, customer: b.guest?.name ?? who(b.customerId), barber, currency: b.currency, amount: b.amount, jbFee: bookingFee(b) });
        if (b.tip) rows.push({ date: b.startsAt, type: "tip", ref: b.id, customer: who(b.customerId), barber, currency: b.currency, amount: b.tip, jbFee: 0 });
      } else if (b.status === "cancelled" && b.lateFee) rows.push({ date: b.startsAt, type: "late_cancellation", ref: b.id, customer: who(b.customerId), barber, currency: b.currency, amount: b.lateFee, jbFee: platformFee(b.lateFee) });
    }
    for (const o of saved.orders) if (!["pending_payment", "cancelled"].includes(o.status) && monthOf(o.createdAt) === month) rows.push({ date: o.createdAt, type: "products", ref: o.id, customer: who(o.customerId), barber: "", currency: o.currency, amount: o.amount, jbFee: o.amount });
    for (const h of saved.hires ?? []) if (!["pending_payment", "cancelled"].includes(h.status) && monthOf(h.startsAt) === month) rows.push({ date: h.startsAt, type: "private_hire", ref: h.id, customer: who(h.customerId), barber: "", currency: h.currency, amount: h.amount, jbFee: platformFee(h.amount) });
    for (const pu of saved.purchases ?? []) if (pu.status === "paid" && pu.kind !== "tip") rows.push({ date: new Date().toISOString(), type: pu.kind, ref: pu.id, customer: who(pu.userId), barber: "", currency: pu.currency, amount: pu.amount, jbFee: pu.amount });
    return rows.sort((a, b) => a.date.localeCompare(b.date));
  };
  const month = /^\d{4}-\d{2}$/.test(q.month ?? "") ? q.month! : new Date().toISOString().slice(0, 7);
  if (path === "/admin/finance") {
    const rows = financeRows(month);
    const sum = (type: string | null, k: "amount" | "jbFee") => byCurrency(rows.filter((r) => type === null || r.type === type).map((r) => ({ currency: r.currency, amount: r[k] })));
    return hit({
      month, label: monthLabel(month), vatRegistered: false, vatPercent: 5,
      lines: [
        { key: "bookings", label: "Bookings paid in the app", amounts: sum("booking", "amount") },
        { key: "fees", label: "Always Fresh fees on bookings", amounts: sum("booking", "jbFee") },
        { key: "late", label: "Late-cancellation fees kept", amounts: sum("late_cancellation", "amount") },
        { key: "tips", label: "Tips (passed to barbers)", amounts: sum("tip", "amount") },
        { key: "products", label: "Always Fresh products", amounts: sum("products", "amount") },
        { key: "hires", label: "Private hires", amounts: sum("private_hire", "amount") },
        { key: "club", label: "The Club and gift cards", amounts: byCurrency(rows.filter((r) => r.type === "membership" || r.type === "gift")) },
        { key: "refunds", label: "Refunded to customers", amounts: byCurrency(saved.bookings.filter((b) => fromApp(b) && b.status === "cancelled" && !b.seeded && monthOf(b.startsAt) === month).map((b) => ({ currency: b.currency, amount: b.amount + (b.tip ?? 0) - (b.lateFee ?? 0) }))) },
        { key: "partners", label: "Owed to hotel partners", amounts: byCurrency(saved.bookings.filter((b) => b.partnerId && PAID.has(b.status) && monthOf(b.startsAt) === month).map((b) => ({ currency: b.currency, amount: partnerCommission(b) }))) },
        { key: "vat", label: "VAT (add VAT_TRN once registered)", amounts: [] },
      ],
      transactions: rows.length,
    });
  }
  if (path === "/admin/finance.csv") {
    const cell = (v: string | number) => (typeof v === "number" ? (v / 100).toFixed(2) : `"${v.replace(/"/g, '""')}"`);
    return hit(["date,type,reference,customer,barber,currency,amount,always_fresh_fee,vat", ...financeRows(month).map((r) => [cell(r.date.slice(0, 10)), cell(r.type), cell(r.ref), cell(r.customer), cell(r.barber), cell(r.currency.toUpperCase()), cell(r.amount), cell(r.jbFee), cell(0)].join(","))].join("\n"));
  }
  const partnerView = (p: Partner) => {
    const mine = saved.bookings.filter((b) => b.partnerId === p.id && PAID.has(b.status));
    const now = mine.filter((b) => monthOf(b.startsAt) === new Date().toISOString().slice(0, 7));
    return {
      ...p, link: `${origin()}/p/${p.code}`, bookings: mine.length, bookingsThisMonth: now.length, revenueThisMonth: byCurrency(now),
      owedThisMonth: byCurrency(now.map((b) => ({ currency: b.currency, amount: partnerCommission(b) }))), discountsThisMonth: byCurrency(now.map((b) => ({ currency: b.currency, amount: b.partnerDiscount ?? 0 }))),
    };
  };
  if (path === "/admin/partners" && method === "GET") return hit((saved.partners ?? []).map(partnerView).sort((a, b) => b.bookings - a.bookings));
  if (path === "/admin/partners" && method === "POST") {
    const code = String(body?.code ?? "").trim().toUpperCase();
    if (!/^[A-Z0-9-]{3,20}$/.test(code)) throw new DemoError(400, "Code: 3–20 letters, numbers or dashes");
    if ((saved.partners ?? []).some((p) => p.code === code)) throw new DemoError(409, "That code is taken.");
    const p: Partner = { id: newId(), kind: body?.kind === "corporate" ? "corporate" : "hotel", name: String(body?.name ?? "").trim(), code, discountPercent: Number(body?.discountPercent) || 0, commissionPercent: Number(body?.commissionPercent) || 0, emailDomain: String(body?.emailDomain ?? "").trim().toLowerCase() || undefined, contactEmail: String(body?.contactEmail ?? ""), active: true, createdAt: new Date().toISOString() };
    (saved.partners ??= []).push(p);
    logActivity(me, "partner.added", p.name, `${p.kind} · ${p.code}`);
    persist();
    return hit(partnerView(p));
  }
  if ((x = path.match(/^\/admin\/partners\/([^/]+)$/)) && method === "PATCH") {
    const p = (saved.partners ?? []).find((y) => y.id === x![1]);
    if (!p) throw new DemoError(404, "Partner not found.");
    Object.assign(p, body);
    logActivity(me, "partner.changed", p.name, Object.keys(body ?? {}).join(", "));
    persist();
    return hit(partnerView(p));
  }
  return { hit: false };
}

async function teamRoutes(method: string, path: string, q: Record<string, string>, body: Body | undefined, token: string | null, headers: Record<string, string> = {}): Promise<{ hit: boolean; value?: unknown }> {
  const hit = (value: unknown) => ({ hit: true, value });
  let x: RegExpMatchArray | null;
  const applications = applicationRoutes(method, path, q, body, token);
  if (applications.hit) return applications;

  // The barber's business
  if (path === "/barbers/me/business" && method === "GET") {
    const u = requireUser(token);
    if (!u.barberId) throw new DemoError(403, "Only barbers can do this.");
    return hit(business(getBarber(u.barberId)));
  }
  if (path === "/barbers/me/services" && method === "PUT") {
    const u = requireUser(token);
    if (!u.barberId) throw new DemoError(403, "Only barbers can do this.");
    const b = getBarber(u.barberId);
    const list = (body?.services ?? []) as { id?: string; name: string; durationMin: number; price: number; category?: string; description?: string }[];
    if (!list.length) throw new DemoError(400, "Keep at least one service");
    if (list.some((s) => String(s.name ?? "").trim().length < 2)) throw new DemoError(400, "Give every service a name");
    const keep = new Set(list.map((s) => s.id).filter(Boolean));
    for (const old of b.services) {
      if (keep.has(old.id)) continue;
      if (saved.bookings.some((k) => k.barberId === b.id && k.serviceId === old.id && PAID.has(k.status) && k.status !== "completed" && Date.parse(k.endsAt) > Date.now())) {
        throw new DemoError(409, `You have upcoming bookings for "${old.name}" — keep it until they're done.`);
      }
    }
    const services = list.map((s) => {
      const old = s.id ? b.services.find((o) => o.id === s.id) : undefined;
      return { id: old ? old.id : `${b.id}-${newId().slice(0, 8)}`, name: s.name.trim(), durationMin: Number(s.durationMin), price: Number(s.price), category: s.category ?? old?.category, description: s.description ?? old?.description };
    });
    saved.barberPatches[b.id] = { ...saved.barberPatches[b.id], services };
    persist();
    return hit(barberView(getBarber(b.id)));
  }

  const pro = await proRoutes(method, path, q, body, token);
  if (pro.hit) return pro;
  const platform = await platformRoutes(method, path, q, body, token);
  if (platform.hit) return platform;
  if (path === "/manage" || path.startsWith("/manage/")) return hit(await manageRoutes(method, path, q, body, token, headers));
  if (!path.startsWith("/admin/")) return { hit: false };
  const me = requireUser(token);
  if (!isAdmin(me)) throw new DemoError(403, "Only the Always Fresh team can open this.");
  const plat = adminPlatform(method, path, q, body, me);
  if (plat.hit) return plat;
  const since = (days: number) => Date.now() - days * DAY;
  const text = (q.q ?? "").trim().toLowerCase();

  if (path === "/admin/overview") {
    const paid = saved.bookings.filter((b) => PAID.has(b.status) && fromApp(b)); // Always Fresh's numbers: bookings made and paid in the app
    const paid30 = paid.filter((b) => Date.parse(b.createdAt) >= since(30));
    const customers = saved.users.filter((u) => u.role === "customer" && !isAdmin(u));
    const count = (s: string) => allBarbers().filter((b) => statusOf(b) === s).length;
    const days = Array.from({ length: 14 }, (_, i) => new Date(Date.now() - (13 - i) * DAY).toISOString().slice(0, 10));
    return hit({
      feePercent: feePercent(),
      bookings: {
        today: paid.filter((b) => b.startsAt.slice(0, 10) === new Date().toISOString().slice(0, 10)).length,
        last7: paid.filter((b) => Date.parse(b.createdAt) >= since(7)).length, last30: paid30.length,
        upcoming: paid.filter((b) => b.status !== "completed" && Date.parse(b.startsAt) > Date.now()).length,
        cancelled30: saved.bookings.filter((b) => b.status === "cancelled" && Date.parse(b.createdAt) >= since(30)).length,
      },
      revenue30: {
        bookings: byCurrency(paid30), fees: byCurrency(paid30.map((b) => ({ currency: b.currency, amount: bookingFee(b) }))),
        hires: byCurrency((saved.hires ?? []).filter((h) => h.status !== "pending_payment" && h.status !== "cancelled" && Date.parse(h.createdAt) >= since(30))),
        shop: byCurrency(saved.orders.filter((o) => !["pending_payment", "cancelled"].includes(o.status) && Date.parse(o.createdAt) >= since(30))),
        clubAndGifts: byCurrency((saved.purchases ?? []).filter((p) => p.status === "paid" && p.kind !== "tip")),
      },
      customers: { total: customers.length, new7: customers.filter((u) => u.createdAt && Date.parse(u.createdAt) >= since(7)).length, members: customers.filter((u) => activeMembership(u)).length },
      barbers: { live: count("live"), pending: count("pending"), suspended: count("suspended"), total: allBarbers().length },
      pendingBarbers: allBarbers().filter((b) => statusOf(b) === "pending").slice(0, 6).map(barberRow),
      openTickets: saved.tickets.filter((t) => (t.status ?? "open") === "open" && !t.reelId).length,
      openReports: saved.tickets.filter((t) => (t.status ?? "open") === "open" && t.reelId).length,
      ordersToShip: saved.orders.filter((o) => o.status === "paid").length,
      applications: (saved.applications ?? []).filter((a) => a.status === "submitted").length,
      series: days.map((date) => ({ date, count: saved.bookings.filter((b) => b.status !== "pending_payment" && b.createdAt.slice(0, 10) === date).length })),
      recent: [...saved.bookings].filter((b) => b.status !== "pending_payment").sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 8).map(bookingRow),
    });
  }
  if (path === "/admin/barbers") {
    const order: Record<string, number> = { pending: 0, live: 1, suspended: 2 };
    return hit(allBarbers()
      .filter((b) => !q.status || q.status === "all" || statusOf(b) === q.status)
      .filter((b) => !text || `${b.name} ${b.city} ${barberUser(b.id)?.email ?? ""}`.toLowerCase().includes(text))
      .map(barberRow)
      .sort((a, b) => order[a.status]! - order[b.status]! || b.bookings - a.bookings || a.name.localeCompare(b.name)));
  }
  if ((x = path.match(/^\/admin\/barbers\/([^/]+)$/))) {
    const b = getBarber(x[1]!);
    if (method === "PATCH") {
      const before = statusOf(b);
      if (body?.status === "live" && before === "pending" && needsApplication(b) && applicationOf(b.id)?.status !== "approved") throw new DemoError(400, "Check and approve their application first: ID, licence and signed agreement.");
      const patch: Partial<SeedBarber> = {};
      if (body?.status) patch.status = body.status;
      if (body?.verified !== undefined) patch.verified = !!body.verified;
      saved.barberPatches[b.id] = { ...saved.barberPatches[b.id], ...patch };
      if (patch.status && patch.status !== before) logActivity(me, `barber.${patch.status}`, b.name);
      if (patch.verified !== undefined) logActivity(me, patch.verified ? "barber.verified" : "barber.unverified", b.name);
      const bu = barberUser(b.id);
      if (bu && patch.status && patch.status !== before) {
        if (patch.status === "live") notify(bu.id, { kind: "account", title: before === "pending" ? "You're live on Always Fresh" : "Your profile is back", body: "Clients can find and book you now. Keep your hours and prices up to date." });
        if (patch.status === "suspended") notify(bu.id, { kind: "account", title: "Your profile is paused", body: "Clients can't find or book you for now. Contact support to find out why." });
      }
      persist();
      return hit(barberRow(getBarber(b.id)));
    }
    const mine = saved.bookings.filter((k) => k.barberId === b.id);
    return hit({
      ...barberRow(b), profile: barberView(b), checklist: profileChecklist(b), application: applicationView(b, true),
      hours: { workingDays: b.workingDays, openHour: b.openHour, closeHour: b.closeHour, timeOff: b.timeOff ?? [] },
      stats: {
        paid: mine.filter((k) => PAID.has(k.status)).length, completed: mine.filter((k) => k.status === "completed").length, cancelled: mine.filter((k) => k.status === "cancelled").length,
        revenue: byCurrency(mine.filter((k) => PAID.has(k.status))), reels: liveReels().filter((r) => r.barberId === b.id).length,
        reports: saved.tickets.filter((t) => t.reelId && seed.reels.find((r) => r.id === t.reelId)?.barberId === b.id).length,
      },
      recent: [...mine].sort((a, c) => c.startsAt.localeCompare(a.startsAt)).slice(0, 10).map(bookingRow),
    });
  }
  if (path === "/admin/bookings") {
    const f = q.status ?? "all";
    return hit(saved.bookings
      .filter((b) => (f === "all" ? b.status !== "pending_payment" : f === "upcoming" ? ["confirmed", "on_the_way"].includes(b.status) && Date.parse(b.endsAt) > Date.now() : b.status === f))
      .map(bookingRow)
      .filter((r) => !text || `${r.barber?.name ?? ""} ${r.customer?.name ?? ""} ${r.customer?.email ?? ""} ${r.service} ${r.id}`.toLowerCase().includes(text))
      .sort((a, b) => b.startsAt.localeCompare(a.startsAt))
      .slice(0, 300));
  }
  if ((x = path.match(/^\/admin\/bookings\/([^/]+)\/cancel$/))) {
    const bk = saved.bookings.find((b) => b.id === x![1]);
    if (!bk) throw new DemoError(404, "Booking not found.");
    if (bk.status === "completed" || bk.status === "cancelled") throw new DemoError(400, "This booking can't be cancelled.");
    const wasPaid = bk.status !== "pending_payment";
    bk.status = "cancelled";
    if (bk.creditUsed) {
      const owner = saved.users.find((u) => u.id === bk.customerId);
      if (owner) owner.credit = { ...owner.credit, [bk.currency]: (owner.credit?.[bk.currency] ?? 0) + bk.creditUsed };
    }
    const reason = String(body?.reason ?? "").trim();
    logActivity(me, "booking.cancelled", `Booking ${bk.id.slice(0, 8)} with ${getBarber(bk.barberId).name}`, reason || undefined);
    const why = reason ? ` Reason: ${reason}` : "";
    notify(bk.customerId, { kind: "cancelled", title: "Booking cancelled", body: `Always Fresh cancelled your booking.${bk.amount && wasPaid ? " You'll get a full refund." : ""}${why}`, bookingId: bk.id });
    const bu = barberUser(bk.barberId);
    if (bu) notify(bu.id, { kind: "cancelled", title: "Booking cancelled", body: `Always Fresh cancelled a booking with you.${why}`, bookingId: bk.id });
    persist();
    return hit(bookingRow(bk));
  }
  if (path === "/admin/customers") {
    return hit(saved.users
      .filter((u) => u.role === "customer" && !isAdmin(u))
      .filter((u) => !text || `${u.name} ${u.email} ${u.city ?? ""}`.toLowerCase().includes(text))
      .map((u) => {
        const mine = saved.bookings.filter((b) => b.customerId === u.id && fromApp(b));
        const paid = mine.filter((b) => PAID.has(b.status));
        return {
          id: u.id, name: u.name, email: u.email, city: u.city, createdAt: u.createdAt, bookings: paid.length, cancelled: mine.filter((b) => b.status === "cancelled").length,
          spent: byCurrency([...paid, ...saved.orders.filter((o) => o.customerId === u.id && !["pending_payment", "cancelled"].includes(o.status)), ...(saved.purchases ?? []).filter((p) => p.userId === u.id && p.status === "paid")]),
          member: activeMembership(u)?.plan ?? null, lastBooking: mine.map((b) => b.startsAt).sort().at(-1) ?? null,
        };
      })
      .sort((a, b) => b.bookings - a.bookings));
  }
  const managersOf = (shopId: string) => saved.users.filter((u) => u.manages === shopId).map((u) => ({ id: u.id, name: u.name, email: u.email }));
  if ((x = path.match(/^\/admin\/shops\/([^/]+)\/managers$/)) && method === "POST") {
    const s = getShop(x[1]!);
    const email = String(body?.email ?? "").trim().toLowerCase();
    const u = saved.users.find((k) => k.email === email);
    if (!u) throw new DemoError(404, "No account with that email yet — ask them to sign up in the app first.");
    u.manages = s.id;
    notify(u.id, { kind: "account", title: `Your shop panel for ${s.name} is ready`, body: "Open Account → Shop panel to see your barbers' calendar, add walk-ins and set hours." });
    persist();
    return hit({ shopId: s.id, managers: managersOf(s.id) });
  }
  if ((x = path.match(/^\/admin\/shops\/([^/]+)\/managers\/([^/]+)$/)) && method === "DELETE") {
    const u = saved.users.find((k) => k.id === x![2] && k.manages === x![1]);
    if (!u) throw new DemoError(404, "Not found.");
    delete u.manages;
    persist();
    return hit(undefined);
  }
  if (path === "/admin/shops") {
    return hit(allShops().map((s) => {
      const ids = new Set(team(s).map((b) => b.id));
      return {
        id: s.id, name: s.name, city: s.city, address: s.address, photoUrl: s.photoUrl,
        team: allBarbers().filter((b) => b.shopId === s.id).map((b) => ({ id: b.id, name: b.name, photoUrl: b.photoUrl, status: statusOf(b) })),
        bookings30: saved.bookings.filter((b) => ids.has(b.barberId) && PAID.has(b.status) && Date.parse(b.startsAt) >= since(30)).length,
        hires: (saved.hires ?? []).filter((h) => h.shopId === s.id && h.status !== "pending_payment").length,
        deliveries: saved.orders.filter((o) => o.shopId === s.id && o.status !== "pending_payment").length,
        privateHire: !!s.privateHire, delivery: !!s.delivery, managers: managersOf(s.id),
      };
    }));
  }
  if (path === "/admin/orders") {
    return hit(saved.orders.filter((o) => o.status !== "pending_payment").sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map((o) => {
      const c = saved.users.find((u) => u.id === o.customerId);
      return {
        id: o.id, createdAt: o.createdAt, status: o.status, amount: o.amount, currency: o.currency, fulfilment: o.fulfilment ?? "shipping",
        items: o.items.reduce((n, i) => n + i.quantity, 0), customer: c ? { name: c.name, email: c.email } : null, shop: shopRef(o.shopId), address: o.shippingAddress,
      };
    }));
  }
  if (path === "/admin/reports") {
    return hit(saved.tickets.filter((t) => t.reelId).sort((a, b) => Number((b.status ?? "open") === "open") - Number((a.status ?? "open") === "open") || b.createdAt.localeCompare(a.createdAt)).map(ticketRow));
  }
  if ((x = path.match(/^\/admin\/reports\/([^/]+)$/))) {
    const t = saved.tickets.find((k) => k.id === x![1] && k.reelId);
    if (!t) throw new DemoError(404, "Report not found.");
    if (body?.action === "remove") {
      const reel = liveReels().find((r) => r.id === t.reelId);
      if (reel) {
        (saved.removedReels ??= []).push(reel.id);
        const bu = barberUser(reel.barberId);
        if (bu) notify(bu.id, { kind: "account", title: "A reel was removed", body: `"${reel.caption.slice(0, 60)}" broke the community rules and was taken down.` });
      }
      for (const k of saved.tickets) if (k.reelId === t.reelId) k.status = "closed";
    }
    t.status = "closed";
    logActivity(me, body?.action === "remove" ? "reel.removed" : "report.dismissed", `Report ${t.id.slice(0, 8)}`);
    t.replies = [...(t.replies ?? []), { at: new Date().toISOString(), by: me.name, text: body?.action === "remove" ? "Reel removed." : "Report dismissed — the reel stays." }];
    persist();
    return hit(ticketRow(t));
  }
  if (path === "/admin/tickets") {
    const f = q.status ?? "open";
    return hit(saved.tickets.filter((t) => !t.reelId && (f === "all" || (t.status ?? "open") === f)).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(ticketRow));
  }
  if ((x = path.match(/^\/admin\/tickets\/([^/]+)$/))) {
    const t = saved.tickets.find((k) => k.id === x![1]);
    if (!t) throw new DemoError(404, "Ticket not found.");
    const reply = String(body?.reply ?? "").trim();
    if (reply) {
      t.replies = [...(t.replies ?? []), { at: new Date().toISOString(), by: me.name, text: reply }];
      if (t.userId) notify(t.userId, { kind: "account", title: "Reply from Always Fresh support", body: reply.slice(0, 180) });
    }
    if (body?.status) t.status = body.status;
    logActivity(me, reply ? "ticket.replied" : `ticket.${body?.status ?? "updated"}`, `Ticket from ${t.name ?? t.email}`);
    persist();
    return hit(ticketRow(t));
  }
  if (path === "/admin/settings") {
    if (method === "PATCH") {
      const fee = body?.platformFeePercent;
      if (fee !== undefined && (typeof fee !== "number" || fee < 0 || fee > 50)) throw new DemoError(400, "The fee must be between 0% and 50%.");
      if (body?.travelIncludedKm !== undefined && !(body.travelIncludedKm >= 0 && body.travelIncludedKm <= 100)) throw new DemoError(400, "Included km must be between 0 and 100.");
      if (body?.travelPerKmAed !== undefined && !(body.travelPerKmAed >= 0 && body.travelPerKmAed <= 5000)) throw new DemoError(400, "The rate must be between AED 0 and 50 a km.");
      saved.settings = { ...saved.settings, ...body };
      logActivity(me, "settings.changed", "Settings", Object.keys(body ?? {}).join(", "));
      persist();
    }
    const hidden = saved.settings?.hiddenCampaigns ?? [];
    return hit({
      platformFeePercent: feePercent(), reviewNewBarbers: reviewNewBarbers(),
      travelIncludedKm: travelIncludedKm(), travelPerKmAed: perKmFor("aed"),
      campaigns: seed.campaigns.map((c) => ({ id: c.id, eyebrow: c.eyebrow, title: c.title, photoUrl: c.photoUrl, countries: c.countries ?? null, except: c.except ?? null, hidden: hidden.includes(c.id) })),
    });
  }
  throw new DemoError(404, "Not found.");
}

export function createDemoServer(data: DemoData) {
  load(data);

  return async function handle(method: string, url: string, body: Body | undefined, token: string | null, headers: Record<string, string> = {}): Promise<unknown> {
    const [path, query = ""] = url.split("?");
    const q = Object.fromEntries(new URLSearchParams(query));
    const m = (re: RegExp) => path.match(re);
    const user = currentUser(token);
    let x: RegExpMatchArray | null;

    if (path === "/health") return { ok: true, demoPayments: true, aiStylist: true, assistant: true, tryOn: false };
    await seedDemoAccounts();
    const teamRoute = await teamRoutes(method, path, q, body, token, headers);
    if (teamRoute.hit) return teamRoute.value;

    if (path === "/campaigns") {
      return seed.campaigns
        .filter((c) => !(saved.settings?.hiddenCampaigns ?? []).includes(c.id))
        .filter((c) => (!c.countries || (q.country && c.countries.includes(q.country))) && !(q.country && c.except?.includes(q.country)))
        .map(({ countries: _c, except: _e, ...c }) => c);
    }
    if (path === "/locations") {
      return seed.countries.map((c) => ({
        code: c.code, name: c.name, currency: c.currency,
        cities: c.cities.map((city) => ({ name: city.name, lat: city.lat, lng: city.lng, barberCount: allBarbers().filter((b) => b.countryCode === c.code && b.city === city.name).length })),
      }));
    }

    // Auth
    if (path === "/auth/register" && method === "POST") {
      const email = String(body?.email ?? "").trim().toLowerCase();
      if (!body?.name || !email.includes("@")) throw new DemoError(400, "Please enter your name and a valid email.");
      if (String(body.password ?? "").length < 8) throw new DemoError(400, "Password must be at least 8 characters.");
      if (saved.users.some((u) => u.email === email)) throw new DemoError(409, "An account with this email already exists.");
      const invite = String(body.invite ?? "").trim().toUpperCase();
      const friend = invite ? saved.users.find((x) => x.referralCode === invite && !x.deletedAt) : undefined;
      if (invite && !friend) throw new DemoError(400, "That invite code isn't valid. Check it, or leave it empty.");
      const u: User = { id: newId(), name: String(body.name).trim(), email, passwordHash: await hash(body.password), role: "customer", countryCode: body.countryCode, city: body.city, ...(friend ? { referredBy: friend.id } : {}) };
      saved.users.push(u);
      const t = newId();
      saved.sessions[t] = u.id;
      persist();
      return { token: t, user: publicUser(u) };
    }
    if (path === "/auth/login" && method === "POST") {
      const email = String(body?.email ?? "").trim().toLowerCase();
      const u = saved.users.find((x) => x.email === email);
      if (!u || u.passwordHash !== (await hash(String(body?.password ?? "")))) throw new DemoError(401, "Wrong email or password.");
      const t = newId();
      saved.sessions[t] = u.id;
      persist();
      return { token: t, user: publicUser(u) };
    }
    // Demo stand-in for Sign in with Apple / Google: no real provider, just a demo account on this device.
    if ((path === "/auth/apple" || path === "/auth/google") && method === "POST") {
      const provider = path.endsWith("apple") ? "Apple" : "Google";
      const email = `${provider.toLowerCase()}-demo@alwaysfresh.demo`;
      let u = saved.users.find((x) => x.email === email);
      if (!u) {
        u = { id: newId(), name: String(body?.name ?? "").trim() || `${provider} Demo`, email, passwordHash: await hash(newId()), role: "customer" };
        saved.users.push(u);
      }
      const t = newId();
      saved.sessions[t] = u.id;
      persist();
      return { token: t, user: publicUser(u) };
    }
    if (path === "/auth/logout") {
      if (token) delete saved.sessions[token];
      persist();
      return undefined;
    }
    if (path === "/me" && method === "GET") return publicUser(requireUser(token));
    // Password reset: the demo sends no email, so links never arrive (the real app emails one).
    if (path === "/auth/forgot" && method === "POST") return undefined;
    if (path === "/auth/reset" && method === "POST") throw new DemoError(400, "This link has expired. Ask for a new one.");
    if (path === "/me/alerts" && method === "PATCH") {
      const u = requireUser(token);
      u.alerts = { ...u.alerts, ...(body as User["alerts"]) };
      persist();
      return publicUser(u);
    }
    if (path === "/me/export") {
      const u = requireUser(token);
      if (method === "POST") return { sentTo: u.email };
      return {
        exportedAt: new Date().toISOString(), account: publicUser(u),
        bookings: saved.bookings.filter((b) => b.customerId === u.id).map(bookingView),
        reviews: saved.reviews.filter((r) => r.customerId === u.id), orders: saved.orders.filter((o) => o.customerId === u.id),
        purchases: (saved.purchases ?? []).filter((p) => p.userId === u.id), alerts: (saved.notifications ?? []).filter((n) => n.userId === u.id),
      };
    }
    if (path === "/me" && method === "DELETE") {
      const u = requireUser(token);
      if (body?.confirm !== true) throw new DemoError(400, "Confirm to delete your account.");
      for (const b of saved.bookings) {
        if ((b.customerId === u.id || (u.barberId && b.barberId === u.barberId)) && ["pending_payment", "confirmed", "on_the_way"].includes(b.status) && Date.parse(b.startsAt) > Date.now()) b.status = "cancelled";
      }
      if (u.barberId) saved.barberPatches[u.barberId] = { ...saved.barberPatches[u.barberId], status: "suspended", offline: true };
      if (u.barberId) saved.applications = (saved.applications ?? []).filter((a) => a.barberId !== u.barberId); // the ID documents go with the account
      Object.assign(u, { name: "Deleted account", email: `deleted+${u.id}@deleted.alwaysfresh.invalid`, passwordHash: newId(), deletedAt: new Date().toISOString() });
      for (const k of ["preferences", "credit", "manages", "alerts", "membership", "countryCode", "city"] as const) delete u[k];
      for (const r of saved.reviews) if (r.customerId === u.id) r.customerName = "Former customer";
      saved.notifications = (saved.notifications ?? []).filter((n) => n.userId !== u.id);
      for (const [t, id] of Object.entries(saved.sessions)) if (id === u.id) delete saved.sessions[t];
      persist();
      return undefined;
    }
    if (path === "/me/preferences" && method === "PATCH") {
      const u = requireUser(token);
      u.preferences = { ...u.preferences, ...(body as Record<string, string>) };
      persist();
      return publicUser(u);
    }
    if (path === "/me" && method === "PATCH") {
      const u = requireUser(token);
      if (body?.birthday !== undefined && !/^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(String(body.birthday))) throw new DemoError(400, "Birthday as MM-DD");
      if (body?.whatsapp && !(body.phone ?? u.phone)) throw new DemoError(400, "Add your mobile number for WhatsApp.");
      Object.assign(u, { name: body?.name ?? u.name, countryCode: body?.countryCode ?? u.countryCode, city: body?.city ?? u.city });
      if (body?.photoUrl !== undefined) u.photoUrl = String(body.photoUrl);
      if (body?.phone !== undefined) u.phone = String(body.phone).trim();
      if (body?.whatsapp !== undefined) u.whatsapp = !!body.whatsapp;
      if (body?.birthday !== undefined) u.birthday = String(body.birthday);
      persist();
      return publicUser(u);
    }
    if (path === "/auth/register-barber" && method === "POST") {
      const email = String(body?.email ?? "").trim().toLowerCase();
      if (!body?.name || !email.includes("@") || String(body.password ?? "").length < 8) throw new DemoError(400, "Please fill in name, email and a password of at least 8 characters.");
      if (!country(body.countryCode)?.cities.some((c) => c.name === body.city)) throw new DemoError(400, "We don't operate in that city yet.");
      if (saved.users.some((u) => u.email === email)) throw new DemoError(409, "An account with this email already exists.");
      const id = newId();
      const p = Number(body.haircutPrice);
      saved.newBarbers.push({
        id, name: String(body.name).trim(), bio: String(body.bio ?? ""), photoUrl: "", countryCode: body.countryCode, city: body.city,
        shopAddress: String(body.shopAddress ?? ""), specialties: body.specialties ?? [],
        ...(() => {
          const c = country(body.countryCode)?.cities.find((x) => x.name === body.city);
          return { lat: (c?.lat ?? 0) + (Math.random() - 0.5) * 0.04, lng: (c?.lng ?? 0) + (Math.random() - 0.5) * 0.04 };
        })(),
        services: [
          { id: `${id}-cut`, name: "Classic haircut", durationMin: 30, price: p },
          { id: `${id}-fade`, name: "Skin fade", durationMin: 45, price: Math.round(p * 1.2) },
          { id: `${id}-beard`, name: "Beard trim & line-up", durationMin: 20, price: Math.round(p * 0.6) },
          { id: `${id}-combo`, name: "Haircut + beard", durationMin: 60, price: Math.round(p * 1.5) },
        ],
        offersHomeVisits: !!body.offersHomeVisits, homeVisitFee: body.offersHomeVisits ? Math.round(p * 0.5) : 0,
        yearsExperience: Number(body.yearsExperience ?? 0), languages: body.languages ?? [], gallery: [], transformations: [],
        workingDays: [1, 2, 3, 4, 5, 6], openHour: 9, closeHour: 19, ratingSum: 0, ratingCount: 0,
        status: reviewNewBarbers() ? "pending" : "live", joinedAt: new Date().toISOString(),
      });
      startApplication(id); // ID, licence and the signed agreement, checked by the team before going live
      const u: User = { id: newId(), name: String(body.name).trim(), email, passwordHash: await hash(body.password), role: "barber", barberId: id, countryCode: body.countryCode, city: body.city };
      saved.users.push(u);
      const t = newId();
      saved.sessions[t] = u.id;
      persist();
      return { token: t, user: publicUser(u) };
    }

    // Barbers
    if (path === "/barbers" && method === "GET") {
      return search({
        country: q.country, city: q.city, q: q.search, specialties: q.specialty?.split(",").filter(Boolean),
        minRating: q.minRating ? Number(q.minRating) : undefined, maxPrice: q.maxPrice ? Number(q.maxPrice) : undefined,
        availableToday: q.availableToday === "true", homeVisits: q.homeVisits === "true", sort: q.sort, openNow: q.openNow === "true",
        near: q.lat && q.lng ? { lat: Number(q.lat), lng: Number(q.lng) } : undefined,
      });
    }
    if (path === "/specialties") {
      const counts = new Map<string, number>();
      for (const b of allBarbers()) for (const s of b.specialties) counts.set(s, (counts.get(s) ?? 0) + 1);
      return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([s]) => s);
    }
    if ((x = m(/^\/barbers\/me$/)) && method === "PATCH") {
      const u = requireUser(token);
      if (!u.barberId) throw new DemoError(403, "Only barbers can do this.");
      if (body?.videoLink && !/^https:\/\/meet\.google\.com\/[a-z0-9-]+$/i.test(String(body.videoLink).trim())) {
        throw new DemoError(400, "Paste your Google Meet link, e.g. https://meet.google.com/abc-defg-hij");
      }
      const current = getBarber(u.barberId);
      const open = body?.openHour ?? current.openHour;
      const close = body?.closeHour ?? current.closeHour;
      if (close - open < 1) throw new DemoError(400, "Closing time must be after opening time.");
      if (body?.workingDays && !body.workingDays.length) throw new DemoError(400, "Pick at least one working day.");
      const patch = { ...body };
      if (patch.timeOff) patch.timeOff = [...new Set<string>(patch.timeOff)].sort();
      if (patch.lat !== undefined || patch.lng !== undefined) patch.pinSetAt = new Date().toISOString();
      saved.barberPatches[u.barberId] = { ...saved.barberPatches[u.barberId], ...patch };
      persist();
      return barberView(getBarber(u.barberId));
    }
    if (path === "/barbers/me/settings") {
      const u = requireUser(token);
      if (!u.barberId) throw new DemoError(403, "Only barbers can do this.");
      const b = getBarber(u.barberId);
      return { videoLink: b.videoLink ?? "", offersConsultations: b.offersConsultations !== false };
    }
    if ((x = m(/^\/barbers\/me\/(gallery|transformations)(?:\/(.+))?$/))) {
      const u = requireUser(token);
      if (!u.barberId) throw new DemoError(403, "Only barbers can do this.");
      const b = getBarber(u.barberId);
      const patch = (saved.barberPatches[u.barberId] ??= {});
      if (method === "POST" && body?.consent !== true) throw new DemoError(400, "Tick the box to confirm everyone in the photo agreed to it being shared.");
      if (x[1] === "gallery") {
        const list = method === "DELETE" ? b.gallery.filter((p) => p.id !== x![2]) : [{ id: newId(), url: String(body?.url), caption: String(body?.caption ?? "") }, ...b.gallery];
        patch.gallery = list;
      } else {
        const list = method === "DELETE" ? b.transformations.filter((t) => t.id !== x![2]) : [{ id: newId(), beforeUrl: String(body?.beforeUrl), afterUrl: String(body?.afterUrl), caption: String(body?.caption ?? "") }, ...b.transformations];
        patch.transformations = list;
      }
      persist();
      return barberView(getBarber(u.barberId));
    }
    if ((x = m(/^\/barbers\/([^/]+)\/travel$/))) {
      const b = getBarber(x[1]);
      if (!b.offersHomeVisits) throw new DemoError(404, "This barber doesn't do home visits.");
      const lat = Number(q.lat);
      const lng = Number(q.lng);
      if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) throw new DemoError(400, "That place isn't on the map.");
      return travelQuote(b, { lat, lng });
    }
    if ((x = m(/^\/barbers\/([^/]+)\/availability$/))) {
      const b = getBarber(x[1]);
      const s = findService(b, q.serviceId);
      if (!s) throw new DemoError(404, "Service not found.");
      const ex = extrasOf(b, q.extras ? q.extras.split(",").filter(Boolean) : []);
      const free = slots(b, q.date, s.durationMin + ex.reduce((t, e) => t + e.durationMin, 0));
      const deals = s.id === CONSULTATION.id ? {} : Object.fromEntries(free.map((t) => [t, priceRuleAt(b, t)]).filter(([, p]) => p));
      return { timeZone: timeZoneOf(b), slots: free, deals };
    }
    if ((x = m(/^\/barbers\/([^/]+)$/))) {
      const b = getBarber(x[1]);
      if ((b.status ?? "live") !== "live" && user?.barberId !== b.id && !isAdmin(user)) throw new DemoError(404, "Barber not found.");
      const reviews = saved.reviews.filter((r) => r.barberId === b.id).sort((a, c) => c.createdAt.localeCompare(a.createdAt)).map(({ customerId: _c, ...r }) => r);
      return { ...barberView(b), reviews, award: awardOf(b) };
    }

    // Bookings
    if (path === "/bookings" && method === "POST") {
      const u = requireUser(token);
      const b = getBarber(body?.barberId);
      if ((b.status ?? "live") !== "live") throw new DemoError(404, "Barber not found.");
      const s = findService(b, body?.serviceId);
      if (!s) throw new DemoError(404, "Service not found.");
      const consultation = s.id === CONSULTATION.id;
      const locationType: Booking["locationType"] = consultation ? (body?.locationType === "phone" ? "phone" : "video") : body?.locationType === "home" ? "home" : "shop";
      if (locationType === "home" && !String(body?.address ?? "").trim()) throw new DemoError(400, "Please enter the address the barber should come to.");
      // Home visits: how far the barber drives, and the extra for their taxi beyond the included km.
      const spot = body?.spot && Number.isFinite(Number(body.spot.lat)) && Number.isFinite(Number(body.spot.lng)) ? { lat: Number(body.spot.lat), lng: Number(body.spot.lng), ...(body.spot.label ? { label: String(body.spot.label).slice(0, 120) } : {}) } : undefined;
      const trip = locationType === "home" ? (spot ? travelQuote(b, spot) : null) : undefined;
      if (trip === null) throw new DemoError(400, "Tell us where the barber should come: use your location or pick your area.");
      if (trip?.tooFar) throw new DemoError(400, `${b.name.split(" ")[0]} goes up to ${trip.maxKm} km for home visits, and your place is about ${trip.km} km away. Pick a barber nearer you, or book at the shop.`);
      const phone = String(body?.phone ?? "").trim();
      if (locationType === "phone" && phone.replace(/[^\d]/g, "").length < 6) throw new DemoError(400, "Please enter the phone number your barber should call.");
      const ex = consultation ? [] : extrasOf(b, (body?.extras ?? []) as string[]);
      const minutes = s.durationMin + ex.reduce((t, e) => t + e.durationMin, 0);
      const start = new Date(body?.startsAt);
      const date = new Intl.DateTimeFormat("en-CA", { timeZone: timeZoneOf(b) }).format(start);
      if (!slots(b, date, minutes).includes(start.toISOString())) throw new DemoError(409, "That time was just taken — please pick another slot.");
      const bk: Booking = {
        id: newId(), customerId: u.id, barberId: b.id, serviceId: s.id, startsAt: start.toISOString(),
        endsAt: new Date(start.getTime() + minutes * 60_000).toISOString(), locationType,
        ...(ex.length ? { extras: ex.map((e) => e.id) } : {}),
        address: locationType === "home" ? String(body?.address).trim() : locationType === "shop" ? b.shopAddress : locationType === "video" ? "Video call · Google Meet" : "Phone call",
        phone: locationType === "phone" ? phone : undefined, notes: String(body?.notes ?? ""),
        amount: 0, currency: country(b.countryCode)!.currency,
        status: "pending_payment", reviewed: false, createdAt: new Date().toISOString(),
        venue: locationType === "home" && body?.venue ? { kind: body.venue.kind, details: String(body.venue.details ?? "") } : undefined,
        ...(trip ? { spot, distanceKm: trip.km, ...(trip.fee ? { travelFee: trip.fee } : {}) } : {}),
        guest: body?.guest?.name ? { name: String(body.guest.name), phone: String(body.guest.phone ?? "") } : undefined,
      };
      // The Club first, then gift credit (mirrors priceBooking on the server).
      const m = activeMembership(u);
      const plan = m ? planOf(m.plan)! : null;
      const covered = !consultation && !!plan && (plan.cutsPerPeriod === null || cutsUsed(u) < plan.cutsPerPeriod);
      const rule = consultation ? 0 : priceRuleAt(b, bk.startsAt);
      if (rule) bk.priceRule = rule;
      const partner = consultation ? undefined : partnerFor(body?.partner, u);
      let servicePrice = adjustedPrice(s.price, rule);
      if (partner) {
        bk.partnerId = partner.id;
        if (partner.kind === "corporate" && partner.discountPercent) {
          const off = adjustedPrice(servicePrice, -partner.discountPercent);
          bk.partnerDiscount = servicePrice - off;
          servicePrice = off;
        }
      }
      const due = (covered ? 0 : servicePrice) + ex.reduce((t, e) => t + e.price, 0) + (locationType === "home" && !(plan?.freeHomeVisits && !consultation) ? b.homeVisitFee : 0) + (trip?.fee ?? 0);
      const credit = Math.min(u.credit?.[bk.currency] ?? 0, due);
      bk.amount = due - credit;
      if (covered) bk.coveredBy = "membership";
      if (credit) {
        bk.creditUsed = credit;
        u.credit = { ...u.credit, [bk.currency]: (u.credit?.[bk.currency] ?? 0) - credit };
      }
      const tip = Math.max(0, Math.round(Number(body?.tip ?? 0)) || 0);
      if (tip > 0 && bk.amount > 0) bk.tip = tip; // paid with the booking; all of it to the barber
      if (bk.amount === 0) bk.status = "confirmed";
      saved.bookings.push(bk);
      if (bk.status === "confirmed") bookingConfirmed(bk);
      persist();
      return { booking: bookingView(bk), clientSecret: null, demoPayments: true };
    }
    // Alerts inbox
    if (path === "/notifications" && method === "GET") {
      const u = requireUser(token);
      dueReminders();
      persist();
      const mine = (saved.notifications ?? []).filter((n) => n.userId === u.id);
      return { unread: mine.filter((n) => !n.read).length, items: mine.slice(-50).reverse().map(({ userId: _u, ...n }) => n) };
    }
    if (path === "/notifications/read" && method === "POST") {
      const u = requireUser(token);
      const ids: string[] | undefined = body?.ids;
      for (const n of saved.notifications ?? []) if (n.userId === u.id && (!ids || ids.includes(n.id))) n.read = true;
      persist();
      return undefined;
    }
    if (path === "/me/push-tokens") {
      requireUser(token);
      return undefined; // phones only — the demo page has no push
    }
    if (path === "/bookings" && method === "GET") {
      const u = requireUser(token);
      dueReminders();
      return saved.bookings.filter((b) => (b.customerId === u.id && fromApp(b)) || (u.barberId && b.barberId === u.barberId)).sort((a, b) => b.startsAt.localeCompare(a.startsAt)).map(bookingView);
    }
    // Customer extras (mirrors server/src/routes/customer.ts)
    if ((x = m(/^\/bookings\/([^/]+)\/reschedule$/)) && method === "POST") {
      const u = requireUser(token);
      const bk = saved.bookings.find((b) => b.id === x![1] && b.customerId === u.id);
      if (!bk) throw new DemoError(404, "Booking not found.");
      if (!["confirmed", "pending_payment"].includes(bk.status)) throw new DemoError(400, "Only upcoming bookings can be moved.");
      if (Date.parse(bk.startsAt) - Date.now() < 60 * 60_000) throw new DemoError(400, "It's less than an hour away — message your barber, or cancel.");
      const b = getBarber(bk.barberId);
      const minutes = (Date.parse(bk.endsAt) - Date.parse(bk.startsAt)) / 60_000;
      const start = new Date(String(body?.startsAt));
      const date = new Intl.DateTimeFormat("en-CA", { timeZone: timeZoneOf(b) }).format(start);
      if (!slots(b, date, minutes, new Date(), bk.id).includes(start.toISOString())) throw new DemoError(409, "That time was just taken — please pick another.");
      bk.startsAt = start.toISOString();
      bk.endsAt = new Date(start.getTime() + minutes * 60_000).toISOString();
      bk.remindedDay = Date.parse(bk.startsAt) - Date.now() < 24 * 3_600_000;
      bk.remindedHour = false;
      persist();
      return bookingView(bk);
    }
    if ((x = m(/^\/bookings\/([^/]+)\/share$/)) && method === "POST") {
      const u = requireUser(token);
      const bk = saved.bookings.find((b) => b.id === x![1] && b.customerId === u.id);
      if (!bk) throw new DemoError(404, "Booking not found.");
      bk.shareToken ??= newId().replace(/-/g, "").slice(0, 16);
      persist();
      return { token: bk.shareToken, url: `${typeof location !== "undefined" ? location.origin : ""}/visit/${bk.shareToken}` };
    }
    if ((x = m(/^\/visits\/([^/]+)$/))) {
      const bk = saved.bookings.find((b) => b.shareToken && b.shareToken === x![1]);
      if (!bk) throw new DemoError(404, "This link isn't valid any more.");
      return visitView(bk);
    }
    if ((x = m(/^\/bookings\/([^/]+)\/cut-photo$/)) && method === "POST") {
      const u = requireUser(token);
      const bk = saved.bookings.find((b) => b.id === x![1]);
      if (!bk || !u.barberId || bk.barberId !== u.barberId) throw new DemoError(404, "Booking not found.");
      bk.cutPhotos = [...(bk.cutPhotos ?? []), String(body?.url)].slice(-4);
      persist();
      return { cutPhotos: bk.cutPhotos };
    }
    if ((x = m(/^\/barbers\/([^/]+)\/favourite$/)) && method === "POST") {
      const u = requireUser(token);
      const b = getBarber(x[1]);
      const list = new Set(u.favourites ?? []);
      if (list.has(b.id)) list.delete(b.id);
      else list.add(b.id);
      u.favourites = [...list];
      persist();
      return { favourite: list.has(b.id), favourites: u.favourites };
    }
    if (path === "/me/favourites") {
      const u = requireUser(token);
      return (u.favourites ?? []).map((id) => allBarbers().find((b) => b.id === id)).filter((b): b is SeedBarber => !!b && (b.status ?? "live") === "live").map(barberView);
    }
    if (path === "/me/usual") {
      const u = requireUser(token);
      const last = saved.bookings
        .filter((b) => b.customerId === u.id && ["completed", "confirmed", "on_the_way"].includes(b.status) && b.serviceId !== CONSULTATION.id && fromApp(b))
        .sort((a, b) => b.startsAt.localeCompare(a.startsAt))[0];
      if (!last) return null;
      const b = allBarbers().find((x) => x.id === last.barberId);
      const service = b && findService(b, last.serviceId);
      if (!b || !service || (b.status ?? "live") !== "live") return null;
      return { barber: barberView(b), service, extras: (last.extras ?? []).filter((id) => b.services.some((s) => s.id === id)), locationType: last.locationType === "home" ? "home" : "shop", lastAt: last.startsAt };
    }
    if (path === "/me/cuts") {
      const u = requireUser(token);
      return saved.bookings.filter((b) => b.customerId === u.id && b.status === "completed" && b.serviceId !== CONSULTATION.id).sort((a, b) => b.startsAt.localeCompare(a.startsAt)).map((b) => ({ ...bookingView(b), cutPhotos: b.cutPhotos ?? [] }));
    }
    if (path === "/me/rebook" && method === "PATCH") {
      const u = requireUser(token);
      if (body?.everyWeeks === null) delete u.rebook;
      else {
        const weeks = Number(body?.everyWeeks);
        if (!(weeks >= 2 && weeks <= 10)) throw new DemoError(400, "Pick every 2 to 10 weeks.");
        const barberId = body?.barberId ?? u.rebook?.barberId;
        if (!barberId) throw new DemoError(400, "Pick a barber.");
        const b = getBarber(barberId);
        const last = saved.bookings.filter((x) => x.customerId === u.id && x.barberId === barberId && x.status !== "cancelled").sort((a, c) => c.startsAt.localeCompare(a.startsAt))[0];
        const from = last ? Date.parse(last.startsAt) : Date.now();
        u.rebook = { barberId, serviceId: body?.serviceId ?? u.rebook?.serviceId ?? b.services[0]!.id, everyWeeks: weeks, nextAt: new Date(Math.max(Date.now() + 86_400_000, from + (weeks * 7 - 2) * 86_400_000)).toISOString() };
      }
      persist();
      return publicUser(u);
    }
    if (path === "/me/referral") {
      const u = requireUser(token);
      const cur = currencyOf(u);
      const invited = saved.users.filter((x) => x.referredBy === u.id);
      const code = referralCode(u);
      return { code, currency: cur, amount: giftFor(cur).referral, invited: invited.length, rewarded: invited.filter((x) => x.referralRewarded).length, link: `${typeof location !== "undefined" ? location.origin : ""}/login?invite=${code}` };
    }
    if (path === "/business/reviews") {
      const u = requireUser(token);
      if (!u.barberId) throw new DemoError(403, "Only barbers can do this.");
      return saved.reviews.filter((r) => r.barberId === u.barberId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(({ customerId: _c, ...r }) => r);
    }
    if ((x = m(/^\/reviews\/([^/]+)\/reply$/)) && method === "POST") {
      const u = requireUser(token);
      const text = String(body?.text ?? "").trim();
      if (text.length < 2) throw new DemoError(400, "Write a reply");
      const r = saved.reviews.find((y) => y.id === x![1]);
      if (!r || !u.barberId || r.barberId !== u.barberId) throw new DemoError(404, "Review not found.");
      const first = !r.reply;
      r.reply = { text: text.slice(0, 500), at: new Date().toISOString() };
      if (first) notify(r.customerId, { kind: "account", title: `${getBarber(r.barberId).name.split(" ")[0]} replied to your review`, body: text.slice(0, 160), bookingId: r.bookingId });
      persist();
      const { customerId: _c, ...view } = r;
      return view;
    }
    if ((x = m(/^\/bookings\/([^/]+)(?:\/(payment|confirm-payment|cancel|status|review))?$/))) {
      const u = requireUser(token);
      const bk = saved.bookings.find((b) => b.id === x![1] && (b.customerId === u.id || (u.barberId && b.barberId === u.barberId)));
      if (!bk) throw new DemoError(404, "Booking not found.");
      switch (x[2]) {
        case undefined:
          return bookingView(bk);
        case "payment":
          return { booking: bookingView(bk), clientSecret: null, demoPayments: true };
        case "confirm-payment":
          if (bk.status === "pending_payment") {
            bk.status = "confirmed";
            bookingConfirmed(bk);
          }
          break;
        case "cancel":
          if (bk.status === "completed" || bk.status === "cancelled") throw new DemoError(400, "This booking can't be cancelled.");
          if (bk.customerId === u.id && cancelTerms(bk).fee) bk.lateFee = cancelTerms(bk).fee; // the barber's late-cancellation rule
          bk.status = "cancelled";
          if (bk.creditUsed) {
            const owner = saved.users.find((x) => x.id === bk.customerId);
            if (owner) owner.credit = { ...owner.credit, [bk.currency]: (owner.credit?.[bk.currency] ?? 0) + bk.creditUsed };
          }
          break;
        case "status":
          if (u.barberId !== bk.barberId) throw new DemoError(404, "Booking not found.");
          if (body?.status === "on_the_way" && bk.status !== "on_the_way") {
            const d = alertDetails(bk);
            notify(bk.customerId, { kind: "on_the_way", title: `${d.first} is on the way`, body: `Heading to ${bk.address} for your ${d.time} ${d.service.toLowerCase()}.`, bookingId: bk.id });
          }
          if (body?.status === "completed" && bk.status !== "completed" && bk.serviceId !== CONSULTATION.id) {
            notify(bk.customerId, { kind: "completed", title: "How was your cut?", body: `Rate ${getBarber(bk.barberId).name} — it helps others choose.`, bookingId: bk.id });
            onCompleted(bk);
          }
          bk.status = body?.status;
          break;
        case "review": {
          if (bk.status !== "completed") throw new DemoError(400, "You can rate your barber once the appointment is completed.");
          if (bk.serviceId === CONSULTATION.id) throw new DemoError(400, "Consultations can't be rated — rate your barber after your cut.");
          if (bk.reviewed) throw new DemoError(409, "You already rated this appointment.");
          saved.reviews.push({ id: newId(), barberId: bk.barberId, customerId: u.id, customerName: u.name.split(" ")[0], bookingId: bk.id, rating: Number(body?.rating), comment: String(body?.comment ?? "").trim(), createdAt: new Date().toISOString(), ...(body?.photoUrl ? { photoUrl: String(body.photoUrl) } : {}) });
          bk.reviewed = true;
          persist();
          return barberView(getBarber(bk.barberId));
        }
      }
      persist();
      return bookingView(bk);
    }

    // Reels
    if (path === "/reels" && method === "GET") {
      const reels = liveReels().filter((r) => {
        const b = allBarbers().find((b) => b.id === r.barberId);
        return b && (!q.barberId || b.id === q.barberId) && (!q.country || b.countryCode === q.country) && (!q.city || b.city === q.city);
      });
      return reels.map((r) => reelView(r, user?.id));
    }
    if (path === "/reels/saved") {
      const u = requireUser(token);
      return liveReels().filter((r) => (saved.saves?.[r.id] ?? []).includes(u.id)).map((r) => reelView(r, u.id));
    }
    if ((x = m(/^\/reels\/([^/]+)\/(save|view|share|report|comments)(?:\/([^/]+)(?:\/like)?)?$/))) {
      const r = liveReels().find((r) => r.id === x![1]);
      if (!r) throw new DemoError(404, "Reel not found.");
      const stats = ((saved.reelStats ??= {})[r.id] ??= { views: 0, shares: 0 });
      switch (x[2]) {
        case "view":
          stats.views += 1;
          persist();
          return undefined;
        case "share":
          stats.shares += 1;
          persist();
          return undefined;
        case "save": {
          const u = requireUser(token);
          const list = ((saved.saves ??= {})[r.id] ??= []);
          saved.saves[r.id] = list.includes(u.id) ? list.filter((i) => i !== u.id) : [...list, u.id];
          persist();
          return reelView(r, u.id);
        }
        case "report": {
          const u = requireUser(token);
          const by = allBarbers().find((b) => b.id === r.barberId);
          saved.tickets.push({ id: newId(), userId: u.id, name: u.name, topic: "other", email: u.email, message: `Reported reel by ${by?.name ?? "a barber"}: ${String(body?.reason ?? "")}`, status: "open", reelId: r.id, createdAt: new Date().toISOString() });
          persist();
          return { ok: true };
        }
        case "comments": {
          const mineList = ((saved.reelComments ??= {})[r.id] ??= []);
          if (method === "GET" && !x[3]) {
            const seeded = (r.comments ?? []).map((c) => ({ ...c, likedByMe: false, mine: false }));
            const local = mineList.map((c) => ({ id: c.id, name: c.name, text: c.text, likes: c.likedBy.length, likedByMe: !!user && c.likedBy.includes(user.id), mine: c.userId === user?.id, createdAt: c.createdAt }));
            return [...local, ...seeded].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
          }
          const u = requireUser(token);
          if (method === "POST" && !x[3]) {
            const text = String(body?.text ?? "").trim().slice(0, 500);
            if (!text) throw new DemoError(400, "Write a comment first.");
            const c: DemoComment = { id: newId(), userId: u.id, name: u.name.split(" ")[0], text, likedBy: [], createdAt: new Date().toISOString() };
            mineList.push(c);
            persist();
            return { id: c.id, name: c.name, text, likes: 0, likedByMe: false, mine: true, createdAt: c.createdAt };
          }
          const c = mineList.find((c) => c.id === x![3]);
          if (method === "DELETE") {
            if (c && c.userId === u.id) saved.reelComments[r.id] = mineList.filter((y) => y !== c);
            persist();
            return undefined;
          }
          // Liking a comment (sample comments can't be liked on the demo page).
          if (!c) return { likes: 0, likedByMe: false };
          c.likedBy = c.likedBy.includes(u.id) ? c.likedBy.filter((i) => i !== u.id) : [...c.likedBy, u.id];
          persist();
          return { likes: c.likedBy.length, likedByMe: c.likedBy.includes(u.id) };
        }
      }
    }
    if ((x = m(/^\/reels\/([^/]+)$/)) && method === "GET") {
      const r = liveReels().find((r) => r.id === x![1]);
      if (!r) throw new DemoError(404, "Reel not found.");
      return reelView(r, user?.id);
    }
    if ((x = m(/^\/reels\/([^/]+)\/like$/))) {
      const u = requireUser(token);
      const r = liveReels().find((r) => r.id === x![1]);
      if (!r) throw new DemoError(404, "Reel not found.");
      const list = (saved.likes[r.id] ??= []);
      saved.likes[r.id] = list.includes(u.id) ? list.filter((i) => i !== u.id) : [...list, u.id];
      persist();
      return reelView(r, u.id);
    }

    // The Club, gift cards, tips, notes, waitlist
    if (path === "/club/plans") {
      const cur = clubCurrency(q.country);
      return { currency: cur, plans: seed.plans.map(({ prices, ...p }) => ({ ...p, price: prices[cur] })) };
    }
    if (path === "/club/me") {
      const u = requireUser(token);
      return { membership: membershipView(u), credit: u.credit ?? {} };
    }
    if (path === "/club/join" && method === "POST") {
      const u = requireUser(token);
      const plan = planOf(String(body?.plan));
      if (!plan) throw new DemoError(400, "Pick a plan.");
      const cur = u.membership?.currency ?? clubCurrency(body?.countryCode ?? u.countryCode);
      return newPurchase(u.id, "membership", plan.id, `The Club — ${plan.name}, 30 days`, plan.prices[cur], cur);
    }
    if (path === "/gifts/amounts") {
      const cur = clubCurrency(q.country);
      return { currency: cur, amounts: seed.giftAmounts[cur] };
    }
    if (path === "/gifts" && method === "POST") {
      const u = requireUser(token);
      const cur = clubCurrency(body?.countryCode ?? u.countryCode);
      const amount = Number(body?.amount);
      if (!seed.giftAmounts[cur].includes(amount)) throw new DemoError(400, "Pick one of the gift card amounts.");
      if (!String(body?.toName ?? "").trim()) throw new DemoError(400, "Who is it for?");
      if (!/.+@.+\..+/.test(String(body?.toEmail ?? ""))) throw new DemoError(400, "Enter their email so we can send it");
      const g: GiftCard = {
        id: newId(), code: `AFG-${block()}-${block()}`, amount, currency: cur, buyerId: u.id, toName: String(body?.toName).trim(), toEmail: String(body?.toEmail).trim(),
        message: String(body?.message ?? "").slice(0, 300), design: body?.design === "ivory" ? "ivory" : "noir", status: "pending_payment", createdAt: new Date().toISOString(),
      };
      (saved.giftCards ??= []).push(g);
      return { ...newPurchase(u.id, "gift", g.id, `Gift card for ${g.toName}`, amount, cur), gift: giftView(g, u.id) };
    }
    if (path === "/gifts" && method === "GET") {
      const u = requireUser(token);
      return (saved.giftCards ?? []).filter((g) => g.buyerId === u.id && g.status !== "pending_payment").reverse().map((g) => giftView(g, u.id));
    }
    if (path === "/gifts/redeem") {
      const u = requireUser(token);
      const code = String(body?.code ?? "").toUpperCase().replace(/\s+/g, "");
      const g = (saved.giftCards ?? []).find((x) => x.code === code);
      if (!g || g.status === "pending_payment") throw new DemoError(404, "That code isn't valid. Check it and try again.");
      if (g.status === "redeemed") throw new DemoError(409, "This gift card has already been used.");
      g.status = "redeemed";
      u.credit = { ...u.credit, [g.currency]: (u.credit?.[g.currency] ?? 0) + g.amount };
      persist();
      return { credit: u.credit, amount: g.amount, currency: g.currency };
    }
    if ((x = m(/^\/purchases\/([^/]+)\/(payment|confirm-payment)$/))) {
      const u = requireUser(token);
      const p = (saved.purchases ?? []).find((y) => y.id === x![1] && y.userId === u.id);
      if (!p) throw new DemoError(404, "Payment not found.");
      if (x[2] === "payment") return { purchase: p, clientSecret: null, demoPayments: true };
      fulfil(p);
      persist();
      const g = p.kind === "gift" ? (saved.giftCards ?? []).find((y) => y.id === p.ref) : undefined;
      return { purchase: p, gift: g ? giftView(g, u.id) : null, membership: membershipView(u) };
    }
    if ((x = m(/^\/bookings\/([^/]+)\/tip$/))) {
      const u = requireUser(token);
      const b = saved.bookings.find((y) => y.id === x![1] && y.customerId === u.id);
      if (!b) throw new DemoError(404, "Booking not found.");
      if (b.status !== "completed") throw new DemoError(400, "You can tip once the appointment is done.");
      return newPurchase(u.id, "tip", b.id, `Tip for ${getBarber(b.barberId).name}`, Number(body?.amount), b.currency);
    }
    if ((x = m(/^\/bookings\/([^/]+)\/notes$/))) {
      const u = requireUser(token);
      const b = saved.bookings.find((y) => y.id === x![1] && u.barberId === y.barberId);
      if (!b) throw new DemoError(404, "Booking not found.");
      b.cutNotes = String(body?.cutNotes ?? "").slice(0, 500);
      persist();
      return { ok: true, cutNotes: b.cutNotes };
    }
    if (path === "/waitlist" && method === "POST") {
      const u = requireUser(token);
      const e = { id: newId(), userId: u.id, barberId: String(body?.barberId), date: String(body?.date), notified: false, createdAt: new Date().toISOString() };
      (saved.waitlist ??= []).push(e);
      persist();
      return e;
    }
    if (path === "/waitlist" && method === "GET") {
      const u = requireUser(token);
      return (saved.waitlist ?? []).filter((w) => w.userId === u.id && !w.notified).map((w) => ({ ...w, barberName: getBarber(w.barberId).name }));
    }
    if ((x = m(/^\/orders\/([^/]+)\/cancel$/))) {
      const u = requireUser(token);
      const o = saved.orders.find((y) => y.id === x![1] && y.customerId === u.id);
      if (!o) throw new DemoError(404, "Order not found.");
      if (o.status !== "pending_payment") throw new DemoError(400, "Paid orders can't be cancelled here — contact support.");
      o.status = "cancelled";
      if (o.creditUsed) u.credit = { ...u.credit, [o.currency]: (u.credit?.[o.currency] ?? 0) + o.creditUsed };
      persist();
      return orderView(o);
    }

    // Barbershops
    if (path === "/shops") {
      return allShops().filter((s) => (!q.country || s.countryCode === q.country) && (!q.city || s.city === q.city)).map(shopSummary).sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    }
    if ((x = m(/^\/shops\/([^/]+)\/availability$/))) {
      const s = getShop(x[1]);
      return { timeZone: shopTz(s), slots: shopSlots(s, q.date, q.service) };
    }
    if ((x = m(/^\/shops\/([^/]+)\/hire-availability$/))) {
      const s = getShop(x[1]);
      return { timeZone: shopTz(s), slots: hireSlots(s, q.date, Number(q.hours)) };
    }
    if ((x = m(/^\/shops\/([^/]+)\/bookings$/)) && method === "POST") {
      const u = requireUser(token);
      const s = getShop(x[1]);
      const pick = pickBarber(s, String(body?.service), String(body?.startsAt));
      if (!pick?.service) throw new DemoError(409, "That time was just taken — please pick another slot.");
      const start = new Date(String(body?.startsAt));
      const bk: Booking = {
        id: newId(), customerId: u.id, barberId: pick.barber.id, serviceId: pick.service.id, startsAt: start.toISOString(),
        endsAt: new Date(start.getTime() + pick.service.durationMin * 60_000).toISOString(), locationType: "shop", address: pick.barber.shopAddress,
        notes: String(body?.notes ?? ""), amount: pick.service.price, currency: country(pick.barber.countryCode)!.currency,
        status: "pending_payment", reviewed: false, createdAt: new Date().toISOString(),
      };
      saved.bookings.push(bk);
      persist();
      return { booking: bookingView(bk), clientSecret: null, demoPayments: true };
    }
    if ((x = m(/^\/shops\/([^/]+)$/))) return shopDetail(getShop(x[1]));

    if (path === "/hires" && method === "POST") {
      const u = requireUser(token);
      const s = getShop(String(body?.shopId));
      const terms = s.privateHire;
      if (!terms) throw new DemoError(400, `${s.name} doesn't do private hire.`);
      const hours = Number(body?.hours);
      const guests = Number(body?.guests);
      if (hours < terms.minHours || hours > terms.maxHours) throw new DemoError(400, `Private hire is ${terms.minHours}–${terms.maxHours} hours.`);
      if (guests < 1 || guests > terms.maxGuests) throw new DemoError(400, `${s.name} fits up to ${terms.maxGuests} guests.`);
      const start = new Date(String(body?.startsAt));
      const date = new Intl.DateTimeFormat("en-CA", { timeZone: shopTz(s) }).format(start);
      if (!hireSlots(s, date, hours).includes(start.toISOString())) throw new DemoError(409, "The shop isn't free for that whole time — please pick another start.");
      const h: Hire = {
        id: newId(), customerId: u.id, shopId: s.id, startsAt: start.toISOString(), endsAt: new Date(start.getTime() + hours * 3_600_000).toISOString(),
        hours, guests, occasion: String(body?.occasion ?? ""), notes: String(body?.notes ?? ""), amount: terms.pricePerHour * hours, currency: shopCurrency(s),
        status: "pending_payment", createdAt: new Date().toISOString(),
      };
      (saved.hires ??= []).push(h);
      persist();
      return { hire: hireView(h), clientSecret: null, demoPayments: true };
    }
    if (path === "/hires" && method === "GET") {
      const u = requireUser(token);
      return (saved.hires ?? []).filter((h) => h.customerId === u.id).sort((a, b) => b.startsAt.localeCompare(a.startsAt)).map(hireView);
    }
    if ((x = m(/^\/hires\/([^/]+)\/(payment|confirm-payment|cancel)$/))) {
      const u = requireUser(token);
      const h = (saved.hires ?? []).find((h) => h.id === x![1] && h.customerId === u.id);
      if (!h) throw new DemoError(404, "Booking not found.");
      if (x[2] === "payment") return { hire: hireView(h), clientSecret: null, demoPayments: true };
      if (x[2] === "confirm-payment" && h.status === "pending_payment") {
        h.status = "confirmed";
        const s = getShop(h.shopId);
        notify(u.id, { kind: "hire", title: `${s.name} is yours`, body: `Private hire for ${h.guests} ${h.guests === 1 ? "guest" : "guests"}, ${fmtLocal(h.startsAt, shopTz(s))} (${s.city} time), ${h.hours} hours.`, hireId: h.id });
      }
      if (x[2] === "cancel") {
        if (h.status === "completed" || h.status === "cancelled") throw new DemoError(400, "This booking can't be cancelled.");
        h.status = "cancelled";
      }
      persist();
      return hireView(h);
    }

    // Shop
    if (path === "/products") {
      const cur = currencyFor(q.country);
      return { currency: cur, shipping: seed.shipping[cur], products: seed.products.map((p) => ({ id: p.id, name: p.name, category: p.category, emoji: p.emoji, description: p.description, price: p.prices[cur], currency: cur })) };
    }
    if (path === "/orders" && method === "POST") {
      const u = requireUser(token);
      const shop = body?.fulfilment === "delivery" ? getShop(String(body?.shopId ?? "")) : undefined;
      if (shop && (!shop.delivery || shop.countryCode !== body?.countryCode)) throw new DemoError(400, `${shop.name} doesn't deliver there.`);
      const cur = shop ? shopCurrency(shop) : currencyFor(body?.countryCode);
      const items = (body?.items ?? []).map((i: { productId: string; quantity: number }) => {
        const p = seed.products.find((p) => p.id === i.productId);
        if (!p) throw new DemoError(404, "One of the products is no longer available.");
        if (shop && !shop.productIds.includes(p.id)) throw new DemoError(400, `${shop.name} doesn't stock ${p.name}.`);
        if (shop && !inStock(shop.id, p.id)) throw new DemoError(409, `${p.name} is sold out at ${shop.name} right now.`);
        return { productId: p.id, name: p.name, quantity: Number(i.quantity), unitPrice: p.prices[cur] };
      });
      if (String(body?.shippingAddress ?? "").trim().length < 5) throw new DemoError(400, "Please enter your delivery address.");
      const subtotal = items.reduce((t: number, i: { unitPrice: number; quantity: number }) => t + i.unitPrice * i.quantity, 0);
      const terms = shop?.delivery ?? seed.shipping[cur];
      const shipping = subtotal >= terms.freeFrom ? 0 : terms.fee;
      const member = activeMembership(u);
      const discount = member ? Math.round((subtotal * planOf(member.plan)!.productDiscount) / 100) : 0;
      const due = subtotal - discount + shipping;
      const creditUsed = Math.min(u.credit?.[cur] ?? 0, due);
      if (creditUsed) u.credit = { ...u.credit, [cur]: (u.credit?.[cur] ?? 0) - creditUsed };
      const o: Order = {
        id: newId(), customerId: u.id, items, subtotal, shipping, amount: due - creditUsed, currency: cur,
        ...(discount ? { discount } : {}), ...(creditUsed ? { creditUsed } : {}),
        fulfilment: shop ? "delivery" : "shipping", shopId: shop?.id,
        shippingName: String(body?.shippingName ?? ""), shippingAddress: String(body?.shippingAddress), status: "pending_payment", createdAt: new Date().toISOString(),
      };
      if (o.amount === 0) {
        // Paid in full with gift credit.
        o.status = "paid";
        takeStock(o);
        if (o.fulfilment === "delivery") {
          o.demoOutAt = Date.now() + 20_000;
          o.demoDeliveredAt = Date.now() + 50_000;
        }
        orderAlert(o);
      }
      saved.orders.push(o);
      persist();
      return { order: orderView(o), clientSecret: null, demoPayments: true };
    }
    if (path === "/orders" && method === "GET") {
      const u = requireUser(token);
      dueReminders();
      persist();
      return saved.orders.filter((o) => o.customerId === u.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(orderView);
    }
    if (path === "/shop-orders") {
      requireUser(token);
      return []; // the demo's shops have no staff accounts
    }
    if ((x = m(/^\/orders\/([^/]+)\/(payment|confirm-payment)$/))) {
      const u = requireUser(token);
      const o = saved.orders.find((o) => o.id === x![1] && o.customerId === u.id);
      if (!o) throw new DemoError(404, "Order not found.");
      if (x[2] === "payment") return { order: orderView(o), clientSecret: null, demoPayments: true };
      if (o.status === "pending_payment") {
        o.status = "paid";
        takeStock(o);
        o.createdAt = new Date().toISOString(); // the delivery clock starts when it's paid
        if (o.fulfilment === "delivery") {
          o.demoOutAt = Date.now() + 20_000;
          o.demoDeliveredAt = Date.now() + 50_000;
        }
        orderAlert(o);
      }
      persist();
      return orderView(o);
    }

    // Support
    if (path === "/support/faq") return { email: seed.supportEmail, faq: seed.faq };
    if (path === "/support/tickets" && method === "POST") {
      const email = user?.email ?? String(body?.email ?? "");
      if (!email.includes("@")) throw new DemoError(400, "Please enter your email so we can reply.");
      if (String(body?.message ?? "").trim().length < 10) throw new DemoError(400, "Please describe the problem (at least 10 characters).");
      const t: Ticket = { id: newId(), userId: user?.id, name: user?.name ?? (String(body?.name ?? "").trim() || email), topic: String(body?.topic), email, message: String(body?.message), status: "open", createdAt: new Date().toISOString() };
      saved.tickets.push(t);
      persist();
      return { ...t, status: "open" };
    }

    // AI
    if (path === "/ai/haircut-advice") {
      requireUser(token);
      return haircutAdvice(body as never);
    }
    if (path === "/ai/tryon/preview") {
      requireUser(token);
      throw new DemoError(503, "Picture previews need the OpenAI connection, which this demo doesn't include.");
    }
    if (path === "/assistant/chat") {
      const ownerKey = user ? `user:${user.id}` : `guest:${headers["x-guest-key"] ?? "anon"}`;
      return chat(body as never, user, ownerKey);
    }
    if ((x = m(/^\/assistant\/conversations\/([^/]+)$/))) {
      const ownerKey = user ? `user:${user.id}` : `guest:${headers["x-guest-key"] ?? "anon"}`;
      const c = saved.conversations.find((c) => c.id === x![1] && c.ownerKey === ownerKey);
      if (!c) throw new DemoError(404, "Conversation not found.");
      return { id: c.id, display: c.display };
    }

    throw new DemoError(404, "Not available in the demo.");
  };
}

/** Uploaded photos become embedded images, kept on this device when there's room. */
export function demoUpload(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new DemoError(400, "Couldn't read that photo."));
    reader.readAsDataURL(blob);
  });
}

export function demoPostReel(token: string | null, video: Blob, caption: string) {
  const u = currentUser(token);
  if (!u?.barberId) throw new DemoError(403, "Only barbers can post reels.");
  const reel: SeedReel = { id: newId(), barberId: u.barberId, videoUrl: URL.createObjectURL(video), caption, likes: 0, createdAt: new Date().toISOString() };
  memoryReels.unshift(reel);
  return reelView(reel, u.id);
}
