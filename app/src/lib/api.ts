import { API_URL } from "./config";
import type { Barber, Booking, Country, Review, StyleAdvice, User } from "./types";

let authToken: string | null = null;
export const setAuthToken = (token: string | null) => {
  authToken = token;
};

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function request<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(API_URL + path, {
      method: init.method ?? (init.body !== undefined ? "POST" : "GET"),
      headers: {
        "content-type": "application/json",
        ...(authToken ? { authorization: `Bearer ${authToken}` } : {}),
      },
      body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
    });
  } catch {
    throw new ApiError(0, "Can't reach Always Fresh right now. Check your connection.");
  }
  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data.error ?? "Something went wrong.");
  return data as T;
}

const qs = (params: Record<string, string | undefined>) => {
  const entries = Object.entries(params).filter((e): e is [string, string] => !!e[1]);
  return entries.length ? "?" + new URLSearchParams(entries).toString() : "";
};

export const api = {
  locations: () => request<Country[]>("/locations"),
  barbers: (f: { country?: string; city?: string; search?: string; specialty?: string; homeVisits?: boolean; sort?: "rating" | "price" }) =>
    request<Barber[]>("/barbers" + qs({ ...f, homeVisits: f.homeVisits ? "true" : undefined })),
  barber: (id: string) => request<Barber & { reviews: Review[] }>(`/barbers/${id}`),
  availability: (id: string, date: string, serviceId: string) =>
    request<{ timeZone: string; slots: string[] }>(`/barbers/${id}/availability` + qs({ date, serviceId })),

  register: (body: { name: string; email: string; password: string; countryCode?: string; city?: string }) =>
    request<{ token: string; user: User }>("/auth/register", { body }),
  registerBarber: (body: Record<string, unknown>) => request<{ token: string; user: User }>("/auth/register-barber", { body }),
  login: (email: string, password: string) => request<{ token: string; user: User }>("/auth/login", { body: { email, password } }),
  logout: () => request<void>("/auth/logout", { method: "POST" }),
  me: () => request<User>("/me"),
  updateMe: (body: Partial<Pick<User, "name" | "countryCode" | "city">>) => request<User>("/me", { method: "PATCH", body }),

  createBooking: (body: { barberId: string; serviceId: string; startsAt: string; locationType: "shop" | "home"; address?: string; notes?: string }) =>
    request<{ booking: Booking; clientSecret: string | null; demoPayments: boolean }>("/bookings", { body }),
  bookings: () => request<Booking[]>("/bookings"),
  booking: (id: string) => request<Booking>(`/bookings/${id}`),
  payment: (id: string) => request<{ booking: Booking; clientSecret: string | null; demoPayments: boolean }>(`/bookings/${id}/payment`),
  confirmPayment: (id: string) => request<Booking>(`/bookings/${id}/confirm-payment`, { method: "POST" }),
  cancelBooking: (id: string) => request<Booking>(`/bookings/${id}/cancel`, { method: "POST" }),
  setBookingStatus: (id: string, status: "on_the_way" | "completed") => request<Booking>(`/bookings/${id}/status`, { body: { status } }),
  review: (id: string, rating: number, comment: string) => request<Barber>(`/bookings/${id}/review`, { body: { rating, comment } }),

  haircutAdvice: (body: { imageBase64: string; mediaType: string; preferences: Record<string, string>; country?: string; city?: string }) =>
    request<{ advice: StyleAdvice; barbers: Barber[] }>("/ai/haircut-advice", { body }),
};
