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

/** Menu sections; "extras" (hot towel, massage…) can be added to any booking. */
export type ServiceCategory = "hair" | "beard" | "face" | "colour" | "kids" | "packages" | "extras";

export interface Service {
  id: string;
  name: string;
  durationMin: number;
  price: number; // minor units (cents) in the barber's currency
  category?: ServiceCategory; // missing on older services: placed by name (see services.ts)
  description?: string;
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
  travelMaxKm?: number; // how far from their pin they go for a home visit (missing = 30 km)
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
  /** pending = waiting for the team to approve (hidden), live = bookable, suspended = hidden by the team. Missing = live. */
  status?: BarberStatus;
  verified?: boolean; // ID and trade licence checked by the team: shows a "Verified" badge
  timeOff?: string[]; // local dates (YYYY-MM-DD) the barber isn't working
  joinedAt?: string; // ISO
  pinSetAt?: string; // when the barber last placed their exact pin
  offline?: boolean; // the barbershop switched them off in the app for now (sick, holiday): no free times
  cancelPolicy?: CancelPolicy; // missing = free cancellation up to the start
  offPeak?: PriceRule | null; // a discount for quiet hours
  peak?: PriceRule | null; // a premium for the busiest hours
  sharePercent?: number; // at a barbershop: the barber's share of service takings (else the shop's default)
  clientNotes?: Record<string, string>; // the barber's private notes per client (key: customer id or "guest:<name>")
  nudgedAt?: Record<string, string>; // when each client last got a "we miss you" message
  stripeAccountId?: string; // Stripe Connect account that receives their payouts
  payoutsEnabled?: boolean; // Stripe says the account can be paid
}

/** Cancelling late: the barber keeps part of the price. freeHours 0 = always free. */
export interface CancelPolicy {
  freeHours: number;
  lateFeePercent: number;
}

/** A price change for some hours of the week, in the barber's local time. percent < 0 is a discount. */
export interface PriceRule {
  percent: number;
  days: number[]; // 0 = Sunday
  fromHour: number;
  toHour: number;
}

/** A walk-in waiting at a barbershop (or on their way, joined from the app). */
export interface QueueEntry {
  id: string;
  shopId: string;
  name: string;
  phone: string;
  userId?: string; // joined from the app
  service: string;
  status: "waiting" | "called" | "serving" | "done" | "left";
  barberId?: string; // who is cutting
  joinedAt: string;
  calledAt?: string;
  doneAt?: string;
}

export type BarberStatus = "pending" | "live" | "suspended";

/**
 * A freelance barber's application to join: their ID, their licence to work as a barber and the signed
 * barber agreement. The team checks it before the barber goes live. Barbers at a barbershop don't apply:
 * JB signs a contract with the shop itself.
 */
export type ApplicationStatus = "draft" | "submitted" | "approved" | "rejected";
export type ApplicationDocKind = "id_front" | "id_back" | "licence";
export interface ApplicationDoc {
  file: string; // in the private documents folder, never served publicly
  contentType: string;
  uploadedAt: string;
}
export interface BarberApplication {
  barberId: string;
  status: ApplicationStatus;
  legalName?: string; // as on the ID
  idNumber?: string; // Emirates ID (784-YYYY-NNNNNNN-N) or passport number outside the UAE
  idExpiry?: string; // YYYY-MM-DD
  licenceNumber?: string;
  licenceAuthority?: string; // who issued the licence or permit
  licenceExpiry?: string; // YYYY-MM-DD
  docs: Partial<Record<ApplicationDocKind, ApplicationDoc>>;
  signature?: { name: string; svg: string; version: string; signedAt: string; ip?: string; userAgent?: string };
  submittedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string; // team member's email
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

/** Settings the team changes from the admin panel (otherwise the server's defaults apply). */
export interface Settings {
  platformFeePercent?: number;
  reviewNewBarbers?: boolean; // new barbers wait for approval before they appear
  hiddenCampaigns?: string[]; // campaign ids switched off on Home
  team?: Record<string, AdminRole>; // email -> role, for team members added in the admin panel
  travelIncludedKm?: number; // home visits: km the barber's visit fee covers
  travelPerKmAed?: number; // home visits: what each km beyond that adds, AED minor units
}

/** Owner: everything. Operations: barbers, shops, bookings, orders, partners. Support: tickets, reels, bookings, customers. Finance: money and reports. */
export type AdminRole = "owner" | "operations" | "support" | "finance";

/** Something the team did in the admin panel, for the activity log. */
export interface ActivityEntry {
  id: string;
  at: string;
  by: { id: string; name: string; email: string };
  action: string; // e.g. "barber.suspended"
  target: string; // what it was done to, in words
  detail?: string;
}

/** A hotel (guests book through its QR code; it earns a commission) or a company (staff get a discount). */
export interface Partner {
  id: string;
  kind: "hotel" | "corporate";
  name: string;
  code: string; // e.g. ATLANTIS, in the QR link /p/ATLANTIS
  discountPercent: number; // corporate: off the service for their people
  commissionPercent: number; // hotel: of the booking value, paid by JB
  emailDomain?: string; // corporate: staff with this email domain get the discount automatically
  contactEmail: string;
  active: boolean;
  createdAt: string;
}

/** Messages between a customer and a barber. */
export interface Chat {
  id: string;
  customerId: string;
  barberId: string;
  messages: { id: string; from: "customer" | "barber"; text: string; at: string }[];
  customerReadAt?: string;
  barberReadAt?: string;
  updatedAt: string;
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
  barberSharePercent?: number; // barbers' share of service takings (owner sets it; default in pro.ts)
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
  createdAt?: string; // ISO (accounts from before this field have none)
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
  manages?: string; // id of the barbershop this person runs in the shop panel (owner or manager)
  shopRole?: ShopRole; // what they may do in the shop panel (missing = owner)
  branches?: string[]; // more barbershops they run (multi-branch owners)
  alerts?: AlertSettings; // which alerts they get on their phone (missing = all on)
  photoUrl?: string; // profile photo (uploaded first)
  phone?: string; // mobile number, for WhatsApp messages when they opt in
  whatsapp?: boolean; // booking confirmations and reminders on WhatsApp too
  favourites?: string[]; // barber ids
  rebook?: { barberId: string; serviceId: string; everyWeeks: number; nextAt: string }; // "remind me to rebook every N weeks"
  referralCode?: string; // their invite code
  referredBy?: string; // user id of the friend who invited them
  referralRewarded?: boolean; // both sides got their credit
  birthday?: string; // MM-DD, for a birthday treat
  birthdayGiftYear?: number;
  deletedAt?: string; // the account was deleted: personal details removed, bookings kept for the barber's records
}

/** Which alerts reach the phone. Bookings, payments and account messages always do. */
export interface AlertSettings {
  reminders?: boolean; // "tomorrow" and "in an hour" before a booking
  offers?: boolean; // The Club, gift cards, offers from JB
  social?: boolean; // likes, comments and replies on reels
  tips?: boolean; // barbers: "You got a tip"
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
  tip?: number; // minor units, all for the barber: chosen when booking (charged with it) or paid after the cut
  extras?: string[]; // ids of extras added to the service (hot towel, massage…): in the time and the amount
  cutPhotos?: string[]; // the barber's photos of the finished cut, for the customer's cut card
  shareToken?: string; // "share my visit": a read-only link a friend can open
  cutNotes?: string; // the barber's notes for next time: guards, products, length
  venue?: { kind: "home" | "hotel" | "yacht" | "office"; details: string }; // where a home visit happens
  spot?: { lat: number; lng: number; label?: string }; // a home visit's point on the map (the customer's location or area)
  distanceKm?: number; // a home visit: about how far the drive is from the barber's pin
  travelFee?: number; // a home visit beyond the included km: extra for the barber's taxi (minor units, all for the barber, no JB fee)
  guest?: { name: string; phone: string }; // booked for someone else; for shop bookings, the client
  source?: "app" | "shop"; // "shop" = added by the barbershop (walk-in or phone), paid at the shop, no JB fee
  noShow?: boolean; // cancelled because the client didn't come (no refund)
  priceRule?: number; // off-peak (< 0) or peak (> 0) percent applied to the service
  lateFee?: number; // kept by the barber when cancelled late (minor units)
  checkedInAt?: string; // arrived at the shop (tablet check-in)
  partnerId?: string; // booked through a hotel's QR code or with a company's code
  partnerDiscount?: number; // what the company code took off (minor units)
  createdAt: string;
}

/** Time a barbershop blocks in a barber's calendar (break, training, personal): no one can book it. */
export interface Block {
  id: string;
  shopId: string;
  barberId: string;
  startsAt: string; // ISO UTC
  endsAt: string;
  reason: string;
  createdAt: string;
}

/** Owner: everything. Manager: everything but staff. Front desk: calendar, walk-ins, queue, check-in and orders. */
export type ShopRole = "owner" | "manager" | "front_desk";

/** What a barbershop changed about itself in the shop panel. */
export type ShopSettings = Partial<Pick<Shop, "about" | "phone" | "workingDays" | "openHour" | "closeHour" | "barberSharePercent">>;

export type NotificationKind = "booking_confirmed" | "new_booking" | "on_the_way" | "reminder" | "completed" | "cancelled" | "order_update" | "hire" | "club" | "gift" | "tip" | "waitlist" | "account" | "message" | "queue" | "chat";

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
  photoUrl?: string; // the customer's photo of the result
  reply?: { text: string; at: string }; // the barber's answer
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
  reelId?: string; // a reported reel, for the moderation queue
  replies?: { at: string; by: string; text: string }[]; // the team's replies and notes
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
