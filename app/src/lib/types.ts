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
}

/** shop / home = an appointment; video / phone = a free consultation. */
export type LocationType = "shop" | "home" | "video" | "phone";

export const CONSULTATION_ID = "consultation";
export const isConsultation = (b: Pick<Booking, "locationType">) => b.locationType === "video" || b.locationType === "phone";

export type NotificationKind = "booking_confirmed" | "new_booking" | "on_the_way" | "reminder" | "completed" | "cancelled";

/** An alert in the app's inbox (also sent as a push notification on phones). */
export interface AppNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  bookingId?: string;
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
  service?: Service;
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
  status: "pending_payment" | "paid" | "shipped" | "cancelled";
  createdAt: string;
}

export interface Reel {
  id: string;
  videoUrl: string;
  posterUrl: string | null;
  caption: string;
  likes: number;
  likedByMe: boolean;
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
