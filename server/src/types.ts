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
  createdAt: string;
}

export type NotificationKind = "booking_confirmed" | "new_booking" | "on_the_way" | "reminder" | "completed" | "cancelled" | "order_update" | "hire";

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
