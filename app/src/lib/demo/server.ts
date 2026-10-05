/**
 * In-browser stand-in for the API, used only by the self-contained demo page
 * (scripts/build-demo-page.mjs sets `globalThis.__AF_DEMO__` before the app starts).
 * It mirrors the real server's rules for search, availability, bookings, reviews,
 * reels, the shop and support, keeps changes on the viewer's device, and asks
 * Claude through the page's `sample` capability for the concierge and photo analysis.
 * Try-on images need the OpenAI connection, which only the real server has.
 */
import type { AssistantAction, ChatMessage } from "../types";

// ---------- Seed data shapes (exported from the server's seed files) ----------

interface SeedService { id: string; name: string; durationMin: number; price: number }
interface SeedBarber {
  id: string; name: string; bio: string; photoUrl: string; countryCode: string; city: string; shopAddress: string;
  lat: number; lng: number;
  specialties: string[]; services: SeedService[]; offersHomeVisits: boolean; homeVisitFee: number;
  yearsExperience: number; languages: string[];
  gallery: { id: string; url: string; caption: string }[];
  transformations: { id: string; beforeUrl: string; afterUrl: string; caption: string }[];
  workingDays: number[]; openHour: number; closeHour: number; ratingSum: number; ratingCount: number;
  offersConsultations?: boolean; videoLink?: string;
}
interface SeedCountry { code: string; name: string; currency: string; cities: { name: string; timeZone: string; lat: number; lng: number }[] }
interface SeedReel { id: string; barberId: string; videoUrl: string; posterUrl?: string; caption: string; likes: number; createdAt: string }
interface SeedProduct { id: string; name: string; category: string; emoji: string; description: string; prices: Record<string, number> }
export interface DemoData {
  countries: SeedCountry[];
  barbers: SeedBarber[];
  reels: SeedReel[];
  products: SeedProduct[];
  shipping: Record<string, { fee: number; freeFrom: number }>;
  faq: { id: string; topic: string; question: string; answer: string }[];
  supportEmail: string;
  media: Record<string, string>; // "/media/..." path -> data: URI
}

export class DemoError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

// ---------- State (changes are saved on this device) ----------

interface User { id: string; name: string; email: string; passwordHash: string; role: "customer" | "barber"; barberId?: string; countryCode?: string; city?: string }
interface Booking {
  id: string; customerId: string; barberId: string; serviceId: string; startsAt: string; endsAt: string;
  locationType: "shop" | "home" | "video" | "phone"; address: string; phone?: string; notes: string; amount: number; currency: string;
  remindedDay?: boolean; remindedHour?: boolean;
  demoOnTheWayAt?: number; // demo only: when to play the "barber is on the way" alert
  status: "pending_payment" | "confirmed" | "on_the_way" | "completed" | "cancelled"; reviewed: boolean; createdAt: string;
}
interface Review { id: string; barberId: string; customerId: string; customerName: string; bookingId: string; rating: number; comment: string; createdAt: string }
interface Order {
  id: string; customerId: string; items: { productId: string; name: string; quantity: number; unitPrice: number }[];
  subtotal: number; shipping: number; amount: number; currency: string; shippingName: string; shippingAddress: string;
  status: "pending_payment" | "paid"; createdAt: string;
}
interface Conversation { id: string; ownerKey: string; turns: { role: "user" | "assistant"; content: string }[]; display: ChatMessage[] }
interface Saved {
  v: 1;
  users: User[];
  sessions: Record<string, string>;
  bookings: Booking[];
  reviews: Review[];
  orders: Order[];
  tickets: { id: string; topic: string; email: string; message: string; createdAt: string }[];
  conversations: Conversation[];
  likes: Record<string, string[]>; // reelId -> user ids
  newBarbers: SeedBarber[];
  barberPatches: Record<string, Partial<SeedBarber>>;
  notifications?: DemoNotification[];
}
interface DemoNotification { id: string; userId: string; kind: string; title: string; body: string; bookingId?: string; read: boolean; createdAt: string }

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
        saved = { notifications: [], ...s };
        return;
      }
    }
  } catch {
    // private window or blocked storage: start fresh
  }
  saved = { v: 1, users: [], sessions: {}, bookings: [], reviews: [], orders: [], tickets: [], conversations: [], likes: {}, newBarbers: [], barberPatches: {}, notifications: [] };
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

function slots(b: SeedBarber, date: string, durationMin: number, now = new Date()) {
  const tz = timeZoneOf(b);
  if (!b.workingDays.includes(new Date(`${date}T12:00:00Z`).getUTCDay())) return [];
  const taken = saved.bookings.filter((x) => x.barberId === b.id && x.status !== "cancelled").map((x) => [Date.parse(x.startsAt), Date.parse(x.endsAt)] as const);
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

function nextAvailable(b: SeedBarber) {
  const shortest = Math.min(...b.services.map((s) => s.durationMin));
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
    timeZone: timeZoneOf(b), shopAddress: b.shopAddress, lat: b.lat, lng: b.lng, specialties: b.specialties, services: b.services,
    offersHomeVisits: b.offersHomeVisits, homeVisitFee: b.homeVisitFee, offersConsultations: b.offersConsultations !== false, hasVideoLink: !!b.videoLink,
    currency: c.currency, rating: r.rating, ratingCount: r.ratingCount,
    startingPrice: Math.min(...b.services.map((s) => s.price)), yearsExperience: b.yearsExperience, languages: b.languages,
    gallery: b.gallery, transformations: b.transformations, nextAvailable: nextAvailable(b),
  };
}

interface Filters { country?: string; city?: string; q?: string; specialties?: string[]; minRating?: number; maxPrice?: number; availableToday?: boolean; homeVisits?: boolean; sort?: string; limit?: number }

function search(f: Filters) {
  const words = f.q?.toLowerCase().split(/\s+/).filter(Boolean) ?? [];
  const list = allBarbers().filter((b) => {
    if (f.country && b.countryCode !== f.country) return false;
    if (f.city && b.city.toLowerCase() !== f.city.toLowerCase()) return false;
    if (f.specialties?.length && !f.specialties.some((s) => b.specialties.includes(s))) return false;
    if (f.minRating && rating(b).raw < f.minRating) return false;
    if (f.maxPrice && Math.min(...b.services.map((s) => s.price)) > f.maxPrice) return false;
    if (f.homeVisits && !b.offersHomeVisits) return false;
    if (words.length) {
      const hay = [b.name, b.city, country(b.countryCode)?.name ?? "", b.bio, ...b.specialties, ...b.languages].join(" ").toLowerCase();
      if (!words.every((w) => hay.includes(w) || hay.includes(w.replace(/s$/, "")))) return false;
    }
    if (f.availableToday) {
      const shortest = Math.min(...b.services.map((s) => s.durationMin));
      if (!slots(b, localDates(timeZoneOf(b), 1)[0], shortest).length) return false;
    }
    return true;
  });
  const views = list.map(barberView);
  const byRating = (a: (typeof views)[number], b: (typeof views)[number]) => (b.rating ?? 0) - (a.rating ?? 0) || b.ratingCount - a.ratingCount;
  if (f.sort === "price") views.sort((a, b) => a.startingPrice - b.startingPrice);
  else if (f.sort === "soonest") views.sort((a, b) => (a.nextAvailable ?? "9999").localeCompare(b.nextAvailable ?? "9999") || byRating(a, b));
  else if (f.sort === "experience") views.sort((a, b) => b.yearsExperience - a.yearsExperience || byRating(a, b));
  else views.sort(byRating);
  return f.limit ? views.slice(0, f.limit) : views;
}

// ---------- Helpers ----------

const publicUser = (u: User) => ({ id: u.id, name: u.name, email: u.email, role: u.role, barberId: u.barberId, countryCode: u.countryCode, city: u.city });

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

function notify(userId: string, n: { kind: string; title: string; body: string; bookingId?: string }) {
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

function bookingView(b: Booking) {
  const barber = getBarber(b.barberId);
  return {
    ...b,
    barber: { id: barber.id, name: barber.name, photoUrl: barber.photoUrl, city: barber.city, timeZone: timeZoneOf(barber) },
    customerName: saved.users.find((u) => u.id === b.customerId)?.name ?? "Customer",
    service: findService(barber, b.serviceId) ?? (b.serviceId === CONSULTATION.id ? CONSULTATION : undefined),
    videoLink: b.locationType === "video" && ["confirmed", "on_the_way"].includes(b.status) ? barber.videoLink ?? null : null,
  };
}

function reelView(r: SeedReel, viewerId?: string) {
  const b = barberView(getBarber(r.barberId));
  const likedBy = saved.likes[r.id] ?? [];
  return {
    id: r.id, videoUrl: r.videoUrl, posterUrl: r.posterUrl ?? null, caption: r.caption, likes: r.likes + likedBy.length,
    likedByMe: !!viewerId && likedBy.includes(viewerId), createdAt: r.createdAt,
    barber: { id: b.id, name: b.name, photoUrl: b.photoUrl, city: b.city, rating: b.rating, ratingCount: b.ratingCount, startingPrice: b.startingPrice, currency: b.currency, offersHomeVisits: b.offersHomeVisits },
  };
}

const currencyFor = (code?: string) => {
  const cur = (code && country(code)?.currency) || "eur";
  return seed.shipping[cur] ? cur : "eur";
};

const fmtMoney = (minor: number, currency: string) => new Intl.NumberFormat("en", { style: "currency", currency: currency.toUpperCase() }).format(minor / 100);
const fmtLocal = (iso: string, tz: string) => new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: tz }).format(new Date(iso));

// ---------- Claude (the page's `sample` capability) ----------

type Sample = ((input: unknown, opts?: unknown) => Promise<{ text: string }>) & {
  json: (input: unknown, opts?: unknown) => Promise<unknown>;
  limits: () => Promise<{ images?: { maxCount: number }; tools?: { maxCount: number } }>;
};

let samplePromise: Promise<Sample | null> | undefined;
function getSample(): Promise<Sample | null> {
  const claude = (globalThis as { claude?: { use: (name: string) => Promise<unknown> } }).claude;
  samplePromise ??= claude ? (claude.use("sample") as Promise<Sample | null>).catch(() => null) : Promise.resolve(null);
  return samplePromise;
}

const OPEN_IN_CLAUDE = "The AI features in this demo run on Claude. Open the demo link in the Claude app or on claude.ai to use them.";

function sampleError(e: unknown): DemoError {
  const code = (e as { code?: string })?.code;
  switch (code) {
    case "not_granted":
    case "sampling_disabled":
    case "capability_disabled":
    case "not_declared":
      return new DemoError(503, "Claude isn't allowed for this page. Allow it when asked (or in the page's permissions) to use the AI features.");
    case "rate_limited":
      return new DemoError(429, "Lots of questions at once — please wait a minute and try again.");
    case "refused":
      return new DemoError(422, "Claude couldn't help with that one. Try asking another way.");
    case "image_rejected":
    case "images_unavailable":
      return new DemoError(422, "That photo couldn't be used. Try a clear JPEG or PNG of your face.");
    case "session_expired":
      return new DemoError(401, "Please sign in to Claude again.");
    case "invalid_json":
      return new DemoError(502, "The analysis came back incomplete. Please try again.");
    default:
      return new DemoError(502, "Claude couldn't answer just now. Please try again.");
  }
}

function base64ToBlob(b64: string, type: string) {
  const bin = atob(b64.replace(/^data:[^,]+,/, ""));
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type });
}

async function haircutAdvice(body: { imageBase64: string; mediaType?: string; preferences?: Record<string, string>; country?: string; city?: string }) {
  const sample = await getSample();
  if (!sample) throw new DemoError(503, OPEN_IN_CLAUDE);
  const limits = await sample.limits().catch(() => null);
  if (!limits?.images) throw new DemoError(503, "Photo analysis isn't available in this view of Claude. Try the Claude app or claude.ai in a browser.");
  const specialties = [...new Set(allBarbers().flatMap((b) => b.specialties))].sort();
  const p = body.preferences ?? {};
  const prompt = `You are the JB Always Fresh AI stylist — a master barber who gives honest, specific, flattering advice from a photo.
Look at the person's face shape, hairline, hair texture, density and current cut in the attached photo. Recommend looks a barber can actually do with their hair. Never comment on attractiveness, age, ethnicity or anything other than hair, head shape and grooming. If the photo doesn't clearly show a head or face, say so in "summary" and give general recommendations.

Preferences — length: ${p.length || "any"}, maintenance: ${p.maintenance || "any"}, vibe: ${p.vibe || "any"}.${p.notes ? `\nCustomer notes: ${p.notes}` : ""}
Barber specialties on the platform (use these exact strings for specialtyTags): ${specialties.join(", ")}.

Reply with only a JSON object:
{"faceShape": string, "hairType": string, "currentStyle": string, "summary": "2-3 friendly sentences",
 "recommendations": [ 4 to 6 items, best match first: mostly haircuts plus one hair-colour idea and one beard style when they suit the person —
   {"name": string, "category": "haircut"|"color"|"beard", "description": string, "whyItSuits": string,
    "length": "very short"|"short"|"medium"|"long", "maintenance": "low"|"medium"|"high",
    "askYourBarber": "exact words to tell the barber", "specialtyTags": [strings from the list], "previewPrompt": "one-sentence description of the hair/beard result"} ],
 "beardAdvice": string (empty if not relevant)}`;
  let advice: Record<string, unknown>;
  try {
    advice = (await sample.json(prompt, { images: [base64ToBlob(body.imageBase64, body.mediaType ?? "image/jpeg")] })) as Record<string, unknown>;
  } catch (e) {
    throw sampleError(e);
  }
  const recs = Array.isArray(advice?.recommendations) ? (advice.recommendations as Record<string, unknown>[]) : [];
  const recommendations = recs
    .filter((r) => r && typeof r.name === "string")
    .map((r) => ({
      name: String(r.name),
      category: ["haircut", "color", "beard"].includes(String(r.category)) ? String(r.category) : "haircut",
      description: String(r.description ?? ""),
      whyItSuits: String(r.whyItSuits ?? ""),
      length: String(r.length ?? ""),
      maintenance: String(r.maintenance ?? ""),
      askYourBarber: String(r.askYourBarber ?? ""),
      specialtyTags: Array.isArray(r.specialtyTags) ? r.specialtyTags.map(String) : [],
      previewPrompt: String(r.previewPrompt ?? r.name),
    }));
  if (!recommendations.length) throw new DemoError(502, "The analysis came back incomplete. Please try again.");
  const result = {
    faceShape: String(advice.faceShape ?? "—"),
    hairType: String(advice.hairType ?? "—"),
    currentStyle: String(advice.currentStyle ?? "—"),
    summary: String(advice.summary ?? ""),
    beardAdvice: String(advice.beardAdvice ?? ""),
    recommendations,
  };
  const wanted = new Set(recommendations.flatMap((r) => r.specialtyTags));
  const barbers = allBarbers()
    .filter((b) => (!body.country || b.countryCode === body.country) && (!body.city || b.city === body.city))
    .map((b) => ({ b, score: b.specialties.filter((s) => wanted.has(s)).length }))
    .filter((x) => x.score > 0)
    .sort((x, y) => y.score - x.score || rating(y.b).raw - rating(x.b).raw)
    .slice(0, 5)
    .map((x) => barberView(x.b));
  return { advice: result, barbers };
}

function concierge(context: string, signedInAs?: User) {
  const where = context;
  return `You are the JB Always Fresh concierge — the in-app assistant for a global barber and hairstyling platform where people discover, compare and book barbers anywhere in the world, shop JB's Fresh grooming products, and preview hairstyles with the AI Try-On.

How to help:
- Find and recommend barbers with search_barbers. Recommend at most 3 and say briefly why each fits (rating, specialty, price, next availability, home visits).
- Use get_barber for services, prices, reviews and address, and check_availability for free times. Times are in the barber's local time zone — always say so.
- To book: once the customer has chosen barber, service, time and shop-or-home, call prepare_booking. It does NOT book or charge — it shows a "Review & book" button so they confirm and pay. Never claim a booking is made.
- Their appointments: list_my_bookings (they must be signed in).
- If something needs a human (refund dispute, no-show, account deletion, complaint), offer a support ticket and call create_support_ticket once they agree. Support email: ${seed.supportEmail}.
- For hairstyle ideas, suggest AI Try-On (Home → AI Try-On).

Style: warm, confident, brief — a phone chat. Short paragraphs or a few bullets, no tables or headings. Use the tools silently: don't narrate what you're about to do, just give the final answer. Prices always with the currency from the tools. Never invent barbers, prices, times, policies or reviews.

Customer context: ${where}; signed in: ${signedInAs ? `yes, as ${signedInAs.name.split(" ")[0]}` : "no"}. Today is ${new Date().toISOString().slice(0, 10)}.

Help centre (official policies):
${seed.faq.map((f) => `Q: ${f.question}\nA: ${f.answer}`).join("\n")}`;
}

function conciergeTools(user: User | undefined, actions: AssistantAction[]) {
  const summary = (v: ReturnType<typeof barberView>) => ({
    id: v.id, name: v.name, location: `${v.city}, ${v.countryName}`,
    rating: v.rating ? `${v.rating} (${v.ratingCount} reviews)` : "new", from: fmtMoney(v.startingPrice, v.currency),
    specialties: v.specialties, years_experience: v.yearsExperience, home_visits: v.offersHomeVisits,
    next_available: v.nextAvailable ? `${fmtLocal(v.nextAvailable, v.timeZone)} (${v.city} time)` : "nothing in the next 2 weeks",
  });
  return [
    {
      name: "search_barbers",
      description: "Search barbers worldwide; returns up to 8 with id, rating, starting price, specialties, next free time and home visits.",
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string", description: "Free text: style, name, city or country" },
          country_code: { type: "string", description: "ISO code, e.g. GB" },
          city: { type: "string" },
          specialties: { type: "array", items: { type: "string" } },
          min_rating: { type: "number" },
          available_today: { type: "boolean" },
          home_visits: { type: "boolean" },
          sort: { type: "string", enum: ["rating", "price", "soonest", "experience"] },
        },
      },
      execute(i: Record<string, unknown>) {
        const res = search({
          q: i.query ? String(i.query) : undefined,
          country: i.country_code ? String(i.country_code).toUpperCase() : undefined,
          city: i.city ? String(i.city) : undefined,
          specialties: Array.isArray(i.specialties) ? i.specialties.map(String) : undefined,
          minRating: i.min_rating ? Number(i.min_rating) : undefined,
          availableToday: !!i.available_today,
          homeVisits: !!i.home_visits,
          sort: i.sort ? String(i.sort) : undefined,
          limit: 8,
        });
        if (res.length) actions.push({ type: "barbers", barberIds: res.slice(0, 3).map((b) => b.id) });
        return res.length ? res.map(summary) : "No barbers match. Try fewer filters or a nearby city.";
      },
    },
    {
      name: "get_barber",
      description: "Full profile of one barber: bio, services with ids and prices, address, languages, experience, next free time.",
      inputSchema: { type: "object", properties: { barber_id: { type: "string" } }, required: ["barber_id"] },
      execute(i: Record<string, unknown>) {
        const v = barberView(getBarber(String(i.barber_id)));
        actions.push({ type: "barbers", barberIds: [v.id] });
        return {
          ...summary(v), bio: v.bio, languages: v.languages, shop_address: v.shopAddress, time_zone: v.timeZone,
          home_visit_fee: v.offersHomeVisits ? fmtMoney(v.homeVisitFee, v.currency) : null,
          services: v.services.map((s) => ({ id: s.id, name: s.name, minutes: s.durationMin, price: fmtMoney(s.price, v.currency) })),
        };
      },
    },
    {
      name: "check_availability",
      description: "Free start times (ISO, with local labels) for a barber's service on a date (YYYY-MM-DD, barber's local time).",
      inputSchema: { type: "object", properties: { barber_id: { type: "string" }, service_id: { type: "string" }, date: { type: "string" } }, required: ["barber_id", "service_id", "date"] },
      execute(i: Record<string, unknown>) {
        const b = getBarber(String(i.barber_id));
        const s = b.services.find((x) => x.id === String(i.service_id));
        if (!s) throw new Error("Unknown service id — call get_barber for the list.");
        const free = slots(b, String(i.date), s.durationMin);
        const tz = timeZoneOf(b);
        return free.length ? { time_zone: tz, free_times: free.map((t) => ({ starts_at: t, local: fmtLocal(t, tz) })) } : "No free times that day.";
      },
    },
    {
      name: "list_my_bookings",
      description: "The signed-in customer's bookings.",
      execute() {
        if (!user) return "The customer is not signed in. Ask them to sign in (Account tab).";
        const mine = saved.bookings.filter((b) => b.customerId === user.id).slice(-10);
        return mine.length
          ? mine.map((bk) => {
              const b = getBarber(bk.barberId);
              return { booking_id: bk.id, barber: b.name, service: findService(b, bk.serviceId)?.name ?? CONSULTATION.name, when: `${fmtLocal(bk.startsAt, timeZoneOf(b))} (${b.city} time)`, status: bk.status };
            })
          : "No bookings yet.";
      },
    },
    {
      name: "prepare_booking",
      description: "Shows the customer a 'Review & book' button pre-filled with this choice. Does not book or charge.",
      inputSchema: {
        type: "object",
        properties: { barber_id: { type: "string" }, service_id: { type: "string" }, starts_at: { type: "string", description: "Exact ISO time from check_availability" }, location_type: { type: "string", enum: ["shop", "home"] } },
        required: ["barber_id", "service_id", "starts_at", "location_type"],
      },
      execute(i: Record<string, unknown>) {
        const b = getBarber(String(i.barber_id));
        const s = b.services.find((x) => x.id === String(i.service_id));
        if (!s) throw new Error("Unknown service id.");
        const start = new Date(String(i.starts_at));
        const date = new Intl.DateTimeFormat("en-CA", { timeZone: timeZoneOf(b) }).format(start);
        if (!slots(b, date, s.durationMin).includes(start.toISOString())) throw new Error("That time is no longer free — check availability again.");
        const locationType = String(i.location_type) === "home" && b.offersHomeVisits ? "home" : "shop";
        actions.push({ type: "book", barberId: b.id, serviceId: s.id, startsAt: start.toISOString(), locationType });
        return "A 'Review & book' button is now shown under your message.";
      },
    },
    {
      name: "create_support_ticket",
      description: "Open a ticket for the human support team, only after the customer agrees.",
      inputSchema: {
        type: "object",
        properties: { topic: { type: "string", enum: ["booking", "payment", "account", "barber", "shop", "other"] }, message: { type: "string" }, email: { type: "string" } },
        required: ["topic", "message"],
      },
      execute(i: Record<string, unknown>) {
        const email = user?.email ?? (i.email ? String(i.email) : "");
        if (!email.includes("@")) return "Need the customer's email address first — ask for it.";
        const ticket = { id: newId(), topic: String(i.topic), email, message: String(i.message), createdAt: new Date().toISOString() };
        saved.tickets.push(ticket);
        persist();
        actions.push({ type: "ticket", ticketId: ticket.id });
        return { ticket_id: ticket.id, reply_to: email };
      },
    },
  ];
}

async function chat(body: { conversationId?: string; message: string; country?: string; city?: string }, user: User | undefined, ownerKey: string) {
  const sample = await getSample();
  if (!sample) throw new DemoError(503, OPEN_IN_CLAUDE);
  const limits = await sample.limits().catch(() => null);
  let convo = body.conversationId ? saved.conversations.find((c) => c.id === body.conversationId && c.ownerKey === ownerKey) : undefined;
  if (!convo) convo = { id: newId(), ownerKey, turns: [], display: [] };
  const where = body.city ? `chosen city ${body.city}, ${country(body.country ?? "")?.name ?? ""}` : body.country ? `chosen country ${country(body.country)?.name}` : "no city chosen";
  const actions: AssistantAction[] = [];
  const turns = [{ role: "user" as const, content: concierge(where, user) }, ...convo.turns.slice(-16), { role: "user" as const, content: body.message }];
  let text: string;
  try {
    const res = await sample(turns, { tools: limits?.tools ? conciergeTools(user, actions) : undefined, modelTier: "quick", cache: false });
    text = res.text.trim();
  } catch (e) {
    throw sampleError(e);
  }
  const at = new Date().toISOString();
  const deduped = [...[...actions].reverse().filter((a) => a.type === "barbers").slice(0, 1), ...actions.filter((a) => a.type !== "barbers")];
  convo.turns.push({ role: "user", content: body.message }, { role: "assistant", content: text });
  convo.display.push({ role: "user", text: body.message, at }, { role: "assistant", text, actions: deduped, at });
  if (!saved.conversations.includes(convo)) saved.conversations.push(convo);
  persist();
  return { conversationId: convo.id, reply: text, actions: deduped };
}

// ---------- Router ----------

type Body = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

export function createDemoServer(data: DemoData) {
  load(data);

  return async function handle(method: string, url: string, body: Body | undefined, token: string | null, headers: Record<string, string> = {}): Promise<unknown> {
    const [path, query = ""] = url.split("?");
    const q = Object.fromEntries(new URLSearchParams(query));
    const m = (re: RegExp) => path.match(re);
    const user = currentUser(token);
    let x: RegExpMatchArray | null;

    if (path === "/health") return { ok: true, demoPayments: true, aiStylist: true, assistant: true, tryOn: false };

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
      const u: User = { id: newId(), name: String(body.name).trim(), email, passwordHash: await hash(body.password), role: "customer", countryCode: body.countryCode, city: body.city };
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
      const email = `${provider.toLowerCase()}-demo@jbalwaysfresh.demo`;
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
    if (path === "/me" && method === "PATCH") {
      const u = requireUser(token);
      Object.assign(u, { name: body?.name ?? u.name, countryCode: body?.countryCode ?? u.countryCode, city: body?.city ?? u.city });
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
      });
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
        availableToday: q.availableToday === "true", homeVisits: q.homeVisits === "true", sort: q.sort,
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
      saved.barberPatches[u.barberId] = { ...saved.barberPatches[u.barberId], ...body };
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
    if ((x = m(/^\/barbers\/([^/]+)\/availability$/))) {
      const b = getBarber(x[1]);
      const s = findService(b, q.serviceId);
      if (!s) throw new DemoError(404, "Service not found.");
      return { timeZone: timeZoneOf(b), slots: slots(b, q.date, s.durationMin) };
    }
    if ((x = m(/^\/barbers\/([^/]+)$/))) {
      const b = getBarber(x[1]);
      const reviews = saved.reviews.filter((r) => r.barberId === b.id).sort((a, c) => c.createdAt.localeCompare(a.createdAt)).map(({ customerId: _c, ...r }) => r);
      return { ...barberView(b), reviews };
    }

    // Bookings
    if (path === "/bookings" && method === "POST") {
      const u = requireUser(token);
      const b = getBarber(body?.barberId);
      const s = findService(b, body?.serviceId);
      if (!s) throw new DemoError(404, "Service not found.");
      const consultation = s.id === CONSULTATION.id;
      const locationType: Booking["locationType"] = consultation ? (body?.locationType === "phone" ? "phone" : "video") : body?.locationType === "home" ? "home" : "shop";
      if (locationType === "home" && !String(body?.address ?? "").trim()) throw new DemoError(400, "Please enter the address the barber should come to.");
      const phone = String(body?.phone ?? "").trim();
      if (locationType === "phone" && phone.replace(/[^\d]/g, "").length < 6) throw new DemoError(400, "Please enter the phone number your barber should call.");
      const start = new Date(body?.startsAt);
      const date = new Intl.DateTimeFormat("en-CA", { timeZone: timeZoneOf(b) }).format(start);
      if (!slots(b, date, s.durationMin).includes(start.toISOString())) throw new DemoError(409, "That time was just taken — please pick another slot.");
      const bk: Booking = {
        id: newId(), customerId: u.id, barberId: b.id, serviceId: s.id, startsAt: start.toISOString(),
        endsAt: new Date(start.getTime() + s.durationMin * 60_000).toISOString(), locationType,
        address: locationType === "home" ? String(body?.address).trim() : locationType === "shop" ? b.shopAddress : locationType === "video" ? "Video call · Google Meet" : "Phone call",
        phone: locationType === "phone" ? phone : undefined, notes: String(body?.notes ?? ""),
        amount: s.price + (locationType === "home" ? b.homeVisitFee : 0), currency: country(b.countryCode)!.currency,
        status: consultation ? "confirmed" : "pending_payment", reviewed: false, createdAt: new Date().toISOString(),
      };
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
      return saved.bookings.filter((b) => b.customerId === u.id || (u.barberId && b.barberId === u.barberId)).sort((a, b) => b.startsAt.localeCompare(a.startsAt)).map(bookingView);
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
          bk.status = "cancelled";
          break;
        case "status":
          if (u.barberId !== bk.barberId) throw new DemoError(404, "Booking not found.");
          if (body?.status === "on_the_way" && bk.status !== "on_the_way") {
            const d = alertDetails(bk);
            notify(bk.customerId, { kind: "on_the_way", title: `${d.first} is on the way`, body: `Heading to ${bk.address} for your ${d.time} ${d.service.toLowerCase()}.`, bookingId: bk.id });
          }
          if (body?.status === "completed" && bk.status !== "completed" && bk.serviceId !== CONSULTATION.id) {
            notify(bk.customerId, { kind: "completed", title: "How was your cut?", body: `Rate ${getBarber(bk.barberId).name} — it helps others choose.`, bookingId: bk.id });
          }
          bk.status = body?.status;
          break;
        case "review": {
          if (bk.status !== "completed") throw new DemoError(400, "You can rate your barber once the appointment is completed.");
          if (bk.serviceId === CONSULTATION.id) throw new DemoError(400, "Consultations can't be rated — rate your barber after your cut.");
          if (bk.reviewed) throw new DemoError(409, "You already rated this appointment.");
          saved.reviews.push({ id: newId(), barberId: bk.barberId, customerId: u.id, customerName: u.name.split(" ")[0], bookingId: bk.id, rating: Number(body?.rating), comment: String(body?.comment ?? "").trim(), createdAt: new Date().toISOString() });
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
      const reels = [...memoryReels, ...seed.reels].filter((r) => {
        const b = allBarbers().find((b) => b.id === r.barberId);
        return b && (!q.barberId || b.id === q.barberId) && (!q.country || b.countryCode === q.country) && (!q.city || b.city === q.city);
      });
      return reels.map((r) => reelView(r, user?.id));
    }
    if ((x = m(/^\/reels\/([^/]+)\/like$/))) {
      const u = requireUser(token);
      const r = [...memoryReels, ...seed.reels].find((r) => r.id === x![1]);
      if (!r) throw new DemoError(404, "Reel not found.");
      const list = (saved.likes[r.id] ??= []);
      saved.likes[r.id] = list.includes(u.id) ? list.filter((i) => i !== u.id) : [...list, u.id];
      persist();
      return reelView(r, u.id);
    }

    // Shop
    if (path === "/products") {
      const cur = currencyFor(q.country);
      return { currency: cur, shipping: seed.shipping[cur], products: seed.products.map((p) => ({ id: p.id, name: p.name, category: p.category, emoji: p.emoji, description: p.description, price: p.prices[cur], currency: cur })) };
    }
    if (path === "/orders" && method === "POST") {
      const u = requireUser(token);
      const cur = currencyFor(body?.countryCode);
      const items = (body?.items ?? []).map((i: { productId: string; quantity: number }) => {
        const p = seed.products.find((p) => p.id === i.productId);
        if (!p) throw new DemoError(404, "One of the products is no longer available.");
        return { productId: p.id, name: p.name, quantity: Number(i.quantity), unitPrice: p.prices[cur] };
      });
      if (String(body?.shippingAddress ?? "").trim().length < 5) throw new DemoError(400, "Please enter your delivery address.");
      const subtotal = items.reduce((t: number, i: { unitPrice: number; quantity: number }) => t + i.unitPrice * i.quantity, 0);
      const shipping = subtotal >= seed.shipping[cur].freeFrom ? 0 : seed.shipping[cur].fee;
      const o: Order = { id: newId(), customerId: u.id, items, subtotal, shipping, amount: subtotal + shipping, currency: cur, shippingName: String(body?.shippingName ?? ""), shippingAddress: String(body?.shippingAddress), status: "pending_payment", createdAt: new Date().toISOString() };
      saved.orders.push(o);
      persist();
      return { order: o, clientSecret: null, demoPayments: true };
    }
    if (path === "/orders" && method === "GET") {
      const u = requireUser(token);
      return saved.orders.filter((o) => o.customerId === u.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
    if ((x = m(/^\/orders\/([^/]+)\/(payment|confirm-payment)$/))) {
      const u = requireUser(token);
      const o = saved.orders.find((o) => o.id === x![1] && o.customerId === u.id);
      if (!o) throw new DemoError(404, "Order not found.");
      if (x[2] === "payment") return { order: o, clientSecret: null, demoPayments: true };
      o.status = "paid";
      persist();
      return o;
    }

    // Support
    if (path === "/support/faq") return { email: seed.supportEmail, faq: seed.faq };
    if (path === "/support/tickets" && method === "POST") {
      const email = user?.email ?? String(body?.email ?? "");
      if (!email.includes("@")) throw new DemoError(400, "Please enter your email so we can reply.");
      if (String(body?.message ?? "").trim().length < 10) throw new DemoError(400, "Please describe the problem (at least 10 characters).");
      const t = { id: newId(), topic: String(body?.topic), email, message: String(body?.message), createdAt: new Date().toISOString() };
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
