export type Role = "customer" | "barber";

export interface Country {
  code: string; // ISO 3166-1 alpha-2
  name: string;
  currency: string; // ISO 4217, lowercase as Stripe expects
  cities: City[];
}

export interface City {
  name: string;
  timeZone: string; // IANA zone, used to build bookable slots in local time
  lat: number; // city centre, for maps
  lng: number;
}

export interface Service {
  id: string;
  name: string;
  durationMin: number;
  price: number; // minor units (cents) in the barber's currency
}

export interface Barber {
  id: string;
  name: string;
  bio: string;
  photoUrl: string;
  countryCode: string;
  city: string;
  shopAddress: string;
  lat: number; // where the shop is (or roughly where the barber works), for maps
  lng: number;
  specialties: string[];
  services: Service[];
  offersHomeVisits: boolean;
  homeVisitFee: number; // minor units
  offersConsultations?: boolean; // free 15-min video/phone consultations; on unless set to false
  videoLink?: string; // the barber's Google Meet link for video consultations
  yearsExperience: number;
  languages: string[];
  gallery: PortfolioPhoto[];
  transformations: Transformation[];
  workingDays: number[]; // 0 = Sunday
  openHour: number; // local time, inclusive
  closeHour: number; // local time, exclusive
  ratingSum: number;
  ratingCount: number;
  shopId?: string; // the barbershop they work at; independent barbers have none
}

/** A barbershop: its team are the barbers with this `shopId`. */
export interface Shop {
  id: string;
  name: string;
  about: string;
  photoUrl: string;
  countryCode: string;
  city: string;
  address: string;
  lat: number;
  lng: number;
  phone: string;
  workingDays: number[]; // 0 = Sunday
  openHour: number; // local time
  closeHour: number;
  /** Hire the whole shop for a party, a wedding morning or a team day. Null = not offered. */
  privateHire: { pricePerHour: number; minHours: number; maxHours: number; maxGuests: number } | null;
  /** Courier delivery of the products this shop stocks. Null = not offered. */
  delivery: { fee: number; freeFrom: number; etaMin: number; radiusKm: number } | null;
  productIds: string[]; // JB's Fresh products in stock
}

export type HireStatus = "pending_payment" | "confirmed" | "completed" | "cancelled";

/** The whole barbershop booked privately. */
export interface Hire {
  id: string;
  customerId: string;
  shopId: string;
  startsAt: string; // ISO UTC
  endsAt: string;
  hours: number;
  guests: number;
  occasion: string;
  notes: string;
  amount: number; // minor units
  currency: string;
  status: HireStatus;
  paymentIntentId?: string;
  createdAt: string;
}

export interface PortfolioPhoto {
  id: string;
  url: string; // served by this API (/media/..., /uploads/...) or a full URL
  caption: string;
}

/** A before-and-after pair from the barber's work. */
export interface Transformation {
  id: string;
  beforeUrl: string;
  afterUrl: string;
  caption: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  appleSub?: string; // "Sign in with Apple" user id
  googleSub?: string; // "Sign in with Google" user id
  pushTokens?: string[]; // Expo push tokens of the user's phones
  barberId?: string;
  countryCode?: string;
  city?: string;
  preferences?: Preferences; // "My chair": what the barber should know before every visit
  credit?: Record<string, number>; // gift-card balance per currency, minor units
  membership?: Membership; // The Club
}

/** How the customer likes their visit, shown to the barber on each booking. */
export interface Preferences {
  conversation?: "quiet" | "chatty" | "either";
  drink?: string; // e.g. "Espresso", "Still water"
  music?: string;
  fragrance?: "none" | "light" | "classic";
  allergies?: string;
  standingCut?: string; // "No. 2 on the sides, scissors on top"
}

export type PlanId = "fresh" | "regular" | "black";

export interface Membership {
  plan: PlanId;
  number: string; // member number on the card, e.g. "JB-0427-118"
  currency: string;
  since: string; // ISO
  paidUntil: string; // ISO; renewed by paying again (Stripe Billing in production)
}

export type BookingStatus = "pending_payment" | "confirmed" | "on_the_way" | "completed" | "cancelled";

export interface Booking {
  id: string;
  customerId: string;
  barberId: string;
  serviceId: string;
  startsAt: string; // ISO UTC
  endsAt: string; // ISO UTC
  locationType: "shop" | "home" | "video" | "phone"; // video/phone = free consultation
  address: string;
  phone?: string; // the customer's number, for phone consultations
  notes: string;
  amount: number; // minor units, total charged
  currency: string;
  status: BookingStatus;
  paymentIntentId?: string;
  reviewed: boolean;
  remindedDay?: boolean; // "tomorrow" reminder sent
  remindedHour?: boolean; // "in an hour" reminder sent
  coveredBy?: "membership"; // the service was included in the customer's Club plan
  creditUsed?: number; // gift-card balance applied, minor units
  tip?: number; // paid after the cut, minor units
  cutNotes?: string; // the barber's notes for next time: guards, products, length
  venue?: { kind: "home" | "hotel" | "yacht" | "office"; details: string }; // where a home visit happens
  guest?: { name: string; phone: string }; // booked for someone else
  createdAt: string;
}

export type NotificationKind = "booking_confirmed" | "new_booking" | "on_the_way" | "reminder" | "completed" | "cancelled" | "order_update" | "hire" | "club" | "gift" | "tip" | "waitlist";

/** An alert shown in the app's inbox and, when the user has a phone registered, sent as a push notification. */
export interface AppNotification {
  id: string;
  userId: string;
  kind: NotificationKind;
  title: string;
  body: string;
  bookingId?: string;
  orderId?: string;
  hireId?: string;
  read: boolean;
  createdAt: string;
}

export interface Review {
  id: string;
  barberId: string;
  customerId: string;
  customerName: string;
  bookingId: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  emoji: string;
  description: string;
  prices: Record<string, number>; // currency -> minor units
}

/** Shipped orders: paid → shipped. Delivery orders: paid → out_for_delivery → delivered. */
export type OrderStatus = "pending_payment" | "paid" | "shipped" | "out_for_delivery" | "delivered" | "cancelled";

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  customerId: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number; // shipping or delivery fee
  discount?: number; // Club member discount on the products, minor units
  creditUsed?: number; // gift-card balance applied
  fulfilment?: "shipping" | "delivery"; // missing = shipping (orders from before delivery existed)
  shopId?: string; // delivery orders: the barbershop that delivers
  amount: number; // total charged, minor units
  currency: string;
  shippingName: string;
  shippingAddress: string;
  countryCode: string;
  status: OrderStatus;
  paymentIntentId?: string;
  createdAt: string;
}

export interface Reel {
  id: string;
  barberId: string;
  videoUrl: string; // path served by this API (/media/... or /uploads/...) or a full URL
  posterUrl?: string;
  caption: string;
  likedBy: string[]; // user ids
  savedBy?: string[]; // user ids who saved it to their collection
  comments?: ReelComment[];
  views?: number;
  shares?: number;
  createdAt: string;
}

export interface ReelComment {
  id: string;
  userId: string;
  name: string; // first name, as shown
  text: string;
  likedBy: string[];
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  userId?: string;
  name: string;
  email: string;
  topic: "booking" | "payment" | "account" | "barber" | "shop" | "other";
  message: string;
  bookingId?: string;
  source: "form" | "assistant";
  status: "open" | "closed";
  createdAt: string;
}

/**
 * One AI assistant conversation. `messages` holds the exact Claude API message
 * params, append-only, so thinking blocks stay valid across turns.
 */
export interface Conversation {
  id: string;
  ownerKey: string; // user id, or an anonymous key the client keeps
  messages: unknown[];
  /** What the chat screen shows: plain text bubbles plus the actions attached to replies. */
  display: { role: "user" | "assistant"; text: string; actions?: unknown[]; at: string }[];
  createdAt: string;
  updatedAt: string;
}

/** A gift card someone bought; the recipient redeems the code into their credit. */
export interface GiftCard {
  id: string;
  code: string; // e.g. "JBF-7K2Q-9MXA"
  amount: number;
  currency: string;
  buyerId: string;
  toName: string;
  toEmail: string;
  message: string;
  design: "noir" | "ivory";
  status: "pending_payment" | "active" | "redeemed";
  redeemedBy?: string;
  paymentIntentId?: string;
  createdAt: string;
}

/** A payment that isn't a booking or an order: Club membership, gift card or tip. */
export interface Purchase {
  id: string;
  userId: string;
  kind: "membership" | "gift" | "tip";
  ref: string; // plan id, gift card id or booking id
  label: string;
  amount: number;
  currency: string;
  status: "pending_payment" | "paid";
  paymentIntentId?: string;
  createdAt: string;
}

/** "Tell me if a time opens up" for a fully booked barber on one day. */
export interface WaitlistEntry {
  id: string;
  userId: string;
  barberId: string;
  date: string; // barber-local YYYY-MM-DD
  notified: boolean;
  createdAt: string;
}
