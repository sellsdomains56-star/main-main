export interface Service {
  id: string;
  name: string;
  durationMin: number;
  price: number;
}

export interface Barber {
  id: string;
  name: string;
  bio: string;
  photoUrl: string;
  countryCode: string;
  countryName: string;
  city: string;
  timeZone: string;
  shopAddress: string;
  shop?: { id: string; name: string } | null; // the barbershop they work at; independent barbers have none
  lat: number; // shop location, for maps
  lng: number;
  specialties: string[];
  services: Service[];
  offersHomeVisits: boolean;
  homeVisitFee: number;
  offersConsultations: boolean; // free 15-min video (Google Meet) or phone consultation
  hasVideoLink: boolean;
  currency: string;
  rating: number | null;
  ratingCount: number;
  startingPrice: number;
  yearsExperience: number;
  languages: string[];
  gallery: PortfolioPhoto[];
  transformations: Transformation[];
  nextAvailable: string | null;
}

export interface PortfolioPhoto {
  id: string;
  url: string;
  caption: string;
}

export interface Transformation {
  id: string;
  beforeUrl: string;
  afterUrl: string;
  caption: string;
}

export interface Review {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Country {
  code: string;
  name: string;
  currency: string;
  cities: { name: string; barberCount: number; lat: number; lng: number }[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "customer" | "barber";
  barberId?: string;
  countryCode?: string;
  city?: string;
  preferences?: Preferences;
}

/** "My chair": how the customer likes their visit. Barbers see it on every booking. */
export interface Preferences {
  conversation?: "quiet" | "chatty" | "either";
  drink?: string;
  music?: string;
  fragrance?: "none" | "light" | "classic";
  allergies?: string;
  standingCut?: string;
}

export type PlanId = "fresh" | "regular" | "black";

export interface Plan {
  id: PlanId;
  name: string;
  tagline: string;
  price: number;
  cutsPerPeriod: number | null; // null = unlimited
  productDiscount: number;
  freeHomeVisits: boolean;
  perks: string[];
}

export interface Membership {
  plan: PlanId;
  name: string;
  number: string;
  since: string;
  paidUntil: string;
  active: boolean;
  cutsLeft: number | null;
  productDiscount: number;
  freeHomeVisits: boolean;
  perks: string[];
}

export interface GiftCard {
  id: string;
  code: string | null; // shown to the buyer once paid
  amount: number;
  currency: string;
  toName: string;
  toEmail: string;
  message: string;
  design: "noir" | "ivory";
  status: "pending_payment" | "active" | "redeemed";
  createdAt: string;
}

/** A Club membership, gift card or tip waiting for payment. */
export interface Purchase {
  id: string;
  kind: "membership" | "gift" | "tip";
  ref: string;
  label: string;
  amount: number;
  currency: string;
  status: "pending_payment" | "paid";
}

export type VenueKind = "home" | "hotel" | "yacht" | "office";

/** shop / home = an appointment; video / phone = a free consultation. */
export type LocationType = "shop" | "home" | "video" | "phone";

export const CONSULTATION_ID = "consultation";
export const isConsultation = (b: Pick<Booking, "locationType">) => b.locationType === "video" || b.locationType === "phone";

export type NotificationKind = "booking_confirmed" | "new_booking" | "on_the_way" | "reminder" | "completed" | "cancelled" | "order_update" | "hire" | "club" | "gift" | "tip" | "waitlist";

/** An alert in the app's inbox (also sent as a push notification on phones). */
export interface AppNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  bookingId?: string;
  orderId?: string; // delivery order updates
  hireId?: string; // private hire
  read: boolean;
  createdAt: string;
}

export type BookingStatus = "pending_payment" | "confirmed" | "on_the_way" | "completed" | "cancelled";

export interface Booking {
  id: string;
  barberId: string;
  startsAt: string;
  endsAt: string;
  locationType: LocationType;
  address: string;
  phone?: string; // customer's number for phone consultations
  videoLink?: string | null; // barber's Google Meet link, for confirmed video consultations
  notes: string;
  amount: number;
  currency: string;
  status: BookingStatus;
  reviewed: boolean;
  customerName: string;
  barber: { id: string; name: string; photoUrl: string; city: string; timeZone: string };
  shop?: { id: string; name: string } | null; // at a barbershop's chair
  service?: Service;
  coveredBy?: "membership"; // included in the Club plan
  creditUsed?: number; // gift credit applied
  tip?: number;
  cutNotes?: string; // the barber's notes for next time
  venue?: { kind: VenueKind; details: string };
  guest?: { name: string; phone: string }; // booked for someone else
  bookedBy?: string | null;
  customerPreferences?: Preferences | null;
}

/** A barbershop in a list. */
export interface ShopSummary {
  id: string;
  name: string;
  about: string;
  photoUrl: string; // "brand:<name>" = the app's own photography, else a URL
  countryCode: string;
  city: string;
  address: string;
  lat: number;
  lng: number;
  currency: string;
  rating: number | null;
  ratingCount: number;
  teamSize: number;
  startingPrice: number | null;
  offersPrivateHire: boolean;
  offersDelivery: boolean;
}

/** The barbershop page. */
export interface Shop extends ShopSummary {
  phone: string;
  timeZone: string;
  workingDays: number[];
  openHour: number;
  closeHour: number;
  menu: { key: string; name: string; durationMin: number; fromPrice: number }[]; // "any barber" services
  team: Barber[];
  privateHire: { pricePerHour: number; minHours: number; maxHours: number; maxGuests: number } | null;
  delivery: { fee: number; freeFrom: number; etaMin: number; radiusKm: number } | null;
  products: Product[];
}

/** The whole barbershop booked privately. */
export interface Hire {
  id: string;
  shopId: string;
  startsAt: string;
  endsAt: string;
  hours: number;
  guests: number;
  occasion: string;
  notes: string;
  amount: number;
  currency: string;
  status: "pending_payment" | "confirmed" | "completed" | "cancelled";
  customerName: string;
  shop: { id: string; name: string; address: string; city: string; photoUrl: string; timeZone: string };
  createdAt: string;
}

export interface HaircutRecommendation {
  name: string;
  category: "haircut" | "color" | "beard";
  previewPrompt: string;
  description: string;
  whyItSuits: string;
  length: string;
  maintenance: string;
  askYourBarber: string;
  specialtyTags: string[];
}

export interface StyleAdvice {
  faceShape: string;
  hairType: string;
  currentStyle: string;
  summary: string;
  recommendations: HaircutRecommendation[];
  beardAdvice: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  emoji: string;
  description: string;
  price: number;
  currency: string;
}

export interface Catalog {
  currency: string;
  shipping: { fee: number; freeFrom: number };
  products: Product[];
}

export interface Order {
  id: string;
  items: { productId: string; name: string; quantity: number; unitPrice: number }[];
  subtotal: number;
  shipping: number;
  amount: number;
  currency: string;
  shippingName: string;
  shippingAddress: string;
  /** shipping: paid → shipped. delivery (a barbershop's courier): paid → out_for_delivery → delivered. */
  fulfilment: "shipping" | "delivery";
  discount?: number; // Club member discount
  creditUsed?: number;
  shop: { id: string; name: string; address: string; phone: string; etaMin: number } | null;
  status: "pending_payment" | "paid" | "shipped" | "out_for_delivery" | "delivered" | "cancelled";
  createdAt: string;
}

export interface Reel {
  id: string;
  videoUrl: string;
  posterUrl: string | null;
  caption: string;
  likes: number;
  likedByMe: boolean;
  savedByMe: boolean;
  comments: number;
  views: number;
  shares: number;
  createdAt: string;
  barber: Pick<Barber, "id" | "name" | "photoUrl" | "city" | "rating" | "ratingCount" | "startingPrice" | "currency" | "offersHomeVisits">;
}

export interface FaqItem {
  id: string;
  topic: "booking" | "payment" | "account" | "barber" | "shop" | "ai";
  question: string;
  answer: string;
}

export type AssistantAction =
  | { type: "barbers"; barberIds: string[] }
  | { type: "book"; barberId: string; serviceId: string; startsAt: string; locationType: "shop" | "home" }
  | { type: "ticket"; ticketId: string };

export interface ChatMessage {
  role: "user" | "assistant";
  text: string;
  actions?: AssistantAction[];
  at: string;
}

export interface BarberSearch {
  country?: string;
  city?: string;
  search?: string;
  specialty?: string[];
  minRating?: number;
  maxPrice?: number;
  availableToday?: boolean;
  homeVisits?: boolean;
  sort?: "rating" | "price" | "soonest" | "experience";
}

export interface ReelComment {
  id: string;
  name: string;
  text: string;
  likes: number;
  likedByMe: boolean;
  mine: boolean;
  createdAt: string;
}
