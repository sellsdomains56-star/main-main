import { API_URL, DEMO_DATA, resolveMedia } from "./config";
import { createDemoServer, demoPostReel, demoUpload, DemoError } from "./demo/server";
import type { AssistantAction, Barber, BarberSearch, Booking, Catalog, ChatMessage, Country, FaqItem, Order, Reel, Review, StyleAdvice, User } from "./types";

let authToken: string | null = null;
export const setAuthToken = (token: string | null) => {
  authToken = token;
};

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

const demo = DEMO_DATA ? createDemoServer(DEMO_DATA) : null;

async function request<T>(path: string, init: { method?: string; body?: unknown; headers?: Record<string, string> } = {}): Promise<T> {
  if (demo) {
    try {
      return (await demo(init.method ?? (init.body !== undefined ? "POST" : "GET"), path, init.body as never, authToken, init.headers)) as T;
    } catch (e) {
      if (e instanceof DemoError) throw new ApiError(e.status, e.message);
      throw e;
    }
  }
  let res: Response;
  try {
    res = await fetch(API_URL + path, {
      method: init.method ?? (init.body !== undefined ? "POST" : "GET"),
      headers: {
        "content-type": "application/json",
        ...(authToken ? { authorization: `Bearer ${authToken}` } : {}),
        ...init.headers,
      },
      body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
    });
  } catch {
    throw new ApiError(0, "Can't reach JB Always Fresh right now. Check your connection.");
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

/** Media paths from the API (/media/..., /uploads/...) become absolute URLs. */
export const mediaUrl = resolveMedia;

export const api = {
  reels: (f: { country?: string; city?: string; barberId?: string }) => request<Reel[]>("/reels" + qs(f)),
  likeReel: (id: string) => request<Reel>(`/reels/${id}/like`, { method: "POST" }),
  deleteReel: (id: string) => request<void>(`/reels/${id}`, { method: "DELETE" }),
  async postReel(video: Blob, contentType: string, caption: string): Promise<Reel> {
    if (demo) {
      try {
        return demoPostReel(authToken, video, caption) as Reel;
      } catch (e) {
        throw new ApiError((e as DemoError).status ?? 500, (e as Error).message);
      }
    }
    const res = await fetch(`${API_URL}/reels?caption=${encodeURIComponent(caption)}`, {
      method: "POST",
      headers: { "content-type": contentType, ...(authToken ? { authorization: `Bearer ${authToken}` } : {}) },
      body: video,
    }).catch(() => {
      throw new ApiError(0, "Upload failed. Check your connection.");
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new ApiError(res.status, data.error ?? "Upload failed.");
    return data as Reel;
  },

  locations: () => request<Country[]>("/locations"),
  barbers: (f: BarberSearch) =>
    request<Barber[]>(
      "/barbers" +
        qs({
          country: f.country,
          city: f.city,
          search: f.search,
          specialty: f.specialty?.length ? f.specialty.join(",") : undefined,
          minRating: f.minRating ? String(f.minRating) : undefined,
          maxPrice: f.maxPrice ? String(f.maxPrice) : undefined,
          availableToday: f.availableToday ? "true" : undefined,
          homeVisits: f.homeVisits ? "true" : undefined,
          sort: f.sort,
        }),
    ),
  specialties: () => request<string[]>("/specialties"),
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

  products: (country?: string) => request<Catalog>("/products" + qs({ country })),
  createOrder: (body: { countryCode: string; items: { productId: string; quantity: number }[]; shippingName: string; shippingAddress: string }) =>
    request<{ order: Order; clientSecret: string | null; demoPayments: boolean }>("/orders", { body }),
  orders: () => request<Order[]>("/orders"),
  orderPayment: (id: string) => request<{ order: Order; clientSecret: string | null; demoPayments: boolean }>(`/orders/${id}/payment`),
  confirmOrderPayment: (id: string) => request<Order>(`/orders/${id}/confirm-payment`, { method: "POST" }),

  // Barber portfolio
  async uploadImage(file: Blob, contentType: string): Promise<{ url: string }> {
    if (demo) return { url: await demoUpload(file) };
    const res = await fetch(`${API_URL}/uploads/image`, {
      method: "POST",
      headers: { "content-type": contentType, ...(authToken ? { authorization: `Bearer ${authToken}` } : {}) },
      body: file,
    }).catch(() => {
      throw new ApiError(0, "Upload failed. Check your connection.");
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new ApiError(res.status, data.error ?? "Upload failed.");
    return data;
  },
  updateMyBarber: (body: Partial<Pick<Barber, "photoUrl" | "bio" | "yearsExperience" | "languages" | "specialties">>) =>
    request<Barber>("/barbers/me", { method: "PATCH", body }),
  addGalleryPhoto: (url: string, caption: string) => request<Barber>("/barbers/me/gallery", { body: { url, caption } }),
  removeGalleryPhoto: (id: string) => request<Barber>(`/barbers/me/gallery/${id}`, { method: "DELETE" }),
  addTransformation: (beforeUrl: string, afterUrl: string, caption: string) =>
    request<Barber>("/barbers/me/transformations", { body: { beforeUrl, afterUrl, caption } }),
  removeTransformation: (id: string) => request<Barber>(`/barbers/me/transformations/${id}`, { method: "DELETE" }),

  // Help centre & assistant
  faq: () => request<{ email: string; faq: FaqItem[] }>("/support/faq"),
  createTicket: (body: { topic: string; message: string; email?: string; name?: string; bookingId?: string }) =>
    request<{ id: string }>("/support/tickets", { body }),
  chat: (body: { conversationId?: string; message: string; country?: string; city?: string }, guestKey: string) =>
    request<{ conversationId: string; reply: string; actions: AssistantAction[] }>("/assistant/chat", { body, headers: { "x-guest-key": guestKey } }),
  conversation: (id: string, guestKey: string) =>
    request<{ id: string; display: ChatMessage[] }>(`/assistant/conversations/${id}`, { headers: { "x-guest-key": guestKey } }),

  // AI try-on
  tryOnPreview: (body: { imageBase64: string; mediaType: string; look: string }) =>
    request<{ image: string; remainingToday: number }>("/ai/tryon/preview", { body }),
  health: () => request<{ ok: boolean; demoPayments: boolean; aiStylist: boolean; assistant: boolean; tryOn: boolean }>("/health"),

  haircutAdvice: (body: { imageBase64: string; mediaType: string; preferences: Record<string, string>; country?: string; city?: string }) =>
    request<{ advice: StyleAdvice; barbers: Barber[] }>("/ai/haircut-advice", { body }),
};
