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
  specialties: string[];
  services: Service[];
  offersHomeVisits: boolean;
  homeVisitFee: number;
  currency: string;
  rating: number | null;
  ratingCount: number;
  startingPrice: number;
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
  cities: { name: string; barberCount: number }[];
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

export type BookingStatus = "pending_payment" | "confirmed" | "on_the_way" | "completed" | "cancelled";

export interface Booking {
  id: string;
  barberId: string;
  startsAt: string;
  endsAt: string;
  locationType: "shop" | "home";
  address: string;
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
