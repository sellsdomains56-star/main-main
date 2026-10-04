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
  specialties: string[];
  services: Service[];
  offersHomeVisits: boolean;
  homeVisitFee: number; // minor units
  workingDays: number[]; // 0 = Sunday
  openHour: number; // local time, inclusive
  closeHour: number; // local time, exclusive
  ratingSum: number;
  ratingCount: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
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
  locationType: "shop" | "home";
  address: string;
  notes: string;
  amount: number; // minor units, total charged
  currency: string;
  status: BookingStatus;
  paymentIntentId?: string;
  reviewed: boolean;
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

export type OrderStatus = "pending_payment" | "paid" | "shipped" | "cancelled";

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
  shipping: number;
  amount: number; // total charged, minor units
  currency: string;
  shippingName: string;
  shippingAddress: string;
  countryCode: string;
  status: OrderStatus;
  paymentIntentId?: string;
  createdAt: string;
}
