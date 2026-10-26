import { API_URL, DEMO_DATA, resolveMedia } from "./config";
import { createDemoServer, demoPostReel, demoUpload, DemoError } from "./demo/server";
import type { ActivityEntry, Agreement, ApplicationDocKind, ApplicationRow, BarberApplication, AdminAnalytics, AdminFinance, AdminRole, Award, ChatMessage2, ChatSummary, ChatThread, Invoice, Partner, PartnerWelcome, Payouts, TeamMember, BookingRules, CheckInRow, Client, Level, Payroll, QueueItem, QueueStatus, ShopHireRow, ShopOrderRow, ShopQueue, ShopStaff, StockRow, AdminBarberDetail, AlertSettings, AdminBarberRow, AdminBookingRow, AdminCustomerRow, AdminOrderRow, AdminOverview, AdminSettings, AdminShopRow, AdminTicket, AppNotification, AssistantAction, Barber, BarberSearch, BarberStatus, Booking, BusinessDashboard, CalBlock, CalBooking, Campaign, Catalog, ChatMessage, Country, FaqItem, GiftCard, Hire, LocationType, Membership, Order, Plan, Preferences, Purchase, Reel, ReelComment, Referral, Review, SharedVisit, ServiceCategory, Shop, ShopCalendar, ShopMember, ShopPanel, ShopReport, ShopSummary, StyleAdvice, User, Usual, VenueKind, WorkingHours } from "./types";

let authToken: string | null = null;
export const setAuthToken = (token: string | null) => {
  authToken = token;
};
export const currentToken = () => authToken;

// Screens opened straight from a link (a review, a payment) can ask before the saved sign-in is read:
// requests wait for it, so they go out signed in. Never longer than 3 seconds.
let markAuthLoaded: () => void = () => {};
const authLoaded = new Promise<void>((resolve) => {
  markAuthLoaded = resolve;
  setTimeout(resolve, 3000);
});
export const savedSignInRead = () => markAuthLoaded();

// Owners of several barbershops: which branch the shop panel is showing.
let shopBranch: string | null = null;
export const setShopBranch = (id: string | null) => {
  shopBranch = id;
};

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

const demo = DEMO_DATA ? createDemoServer(DEMO_DATA) : null;

async function request<T>(path: string, init: { method?: string; body?: unknown; headers?: Record<string, string> } = {}): Promise<T> {
  await authLoaded;
  if (shopBranch && path.startsWith("/manage")) init = { ...init, headers: { ...init.headers, "x-shop": shopBranch } };
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

/** Like request(), for endpoints that answer with plain text (CSV). */
async function requestText(path: string): Promise<string> {
  await authLoaded;
  if (demo) return String(await demo("GET", path, undefined as never, authToken));
  const res = await fetch(API_URL + path, { headers: authToken ? { authorization: `Bearer ${authToken}` } : {} }).catch(() => {
    throw new ApiError(0, "Can't reach JB Always Fresh right now. Check your connection.");
  });
  const text = await res.text();
  if (!res.ok) throw new ApiError(res.status, (() => { try { return JSON.parse(text).error; } catch { return "Something went wrong."; } })());
  return text;
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
  saveReel: (id: string) => request<Reel>(`/reels/${id}/save`, { method: "POST" }),
  savedReels: () => request<Reel[]>("/reels/saved"),
  reel: (id: string) => request<Reel>(`/reels/${id}`),
  viewReel: (id: string) => request<void>(`/reels/${id}/view`, { method: "POST" }),
  shareReel: (id: string) => request<void>(`/reels/${id}/share`, { method: "POST" }),
  reportReel: (id: string, reason: string) => request<{ ok: boolean }>(`/reels/${id}/report`, { body: { reason } }),
  reelComments: (id: string) => request<ReelComment[]>(`/reels/${id}/comments`),
  addReelComment: (id: string, text: string) => request<ReelComment>(`/reels/${id}/comments`, { body: { text } }),
  likeReelComment: (id: string, cid: string) => request<{ likes: number; likedByMe: boolean }>(`/reels/${id}/comments/${cid}/like`, { method: "POST" }),
  deleteReelComment: (id: string, cid: string) => request<void>(`/reels/${id}/comments/${cid}`, { method: "DELETE" }),
  deleteReel: (id: string) => request<void>(`/reels/${id}`, { method: "DELETE" }),
  async postReel(video: Blob, contentType: string, caption: string): Promise<Reel> {
    if (demo) {
      try {
        return demoPostReel(authToken, video, caption) as Reel;
      } catch (e) {
        throw new ApiError((e as DemoError).status ?? 500, (e as Error).message);
      }
    }
    const res = await fetch(`${API_URL}/reels?consent=1&caption=${encodeURIComponent(caption)}`, {
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
  campaigns: (country?: string) => request<Campaign[]>("/campaigns" + qs({ country })),
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
          openNow: f.openNow ? "true" : undefined,
          lat: f.near ? String(f.near.lat) : undefined,
          lng: f.near ? String(f.near.lng) : undefined,
          sort: f.sort,
        }),
    ),
  specialties: () => request<string[]>("/specialties"),
  barber: (id: string) => request<Barber & { reviews: Review[]; award?: { rank: number; month: string; label: string } | null }>(`/barbers/${id}`),
  awards: (country?: string, city?: string) => request<Award>("/awards" + qs({ country, city })),
  recommendations: () => request<Barber[]>("/me/recommendations"),
  partner: (code: string) => request<PartnerWelcome>(`/partners/${encodeURIComponent(code)}`),
  invoice: (bookingId: string) => request<Invoice>(`/bookings/${bookingId}/invoice`),
  chats: () => request<ChatSummary[]>("/chats"),
  startChat: (barberId: string) => request<ChatSummary>("/chats", { body: { barberId } }),
  chatThread: (id: string) => request<ChatThread>(`/chats/${id}`),
  sendChat: (id: string, text: string) => request<ChatMessage2>(`/chats/${id}/messages`, { body: { text } }),
  payouts: () => request<Payouts>("/barbers/me/payouts"),
  startPayouts: () => request<{ url: string }>("/barbers/me/payouts", { method: "POST" }),
  availability: (id: string, date: string, serviceId: string, extras: string[] = []) =>
    request<{ timeZone: string; slots: string[]; deals?: Record<string, number> }>(`/barbers/${id}/availability` + qs({ date, serviceId, extras: extras.length ? extras.join(",") : undefined })),

  register: (body: { name: string; email: string; password: string; countryCode?: string; city?: string; invite?: string }) =>
    request<{ token: string; user: User }>("/auth/register", { body }),
  registerBarber: (body: Record<string, unknown>) => request<{ token: string; user: User }>("/auth/register-barber", { body }),
  login: (email: string, password: string) => request<{ token: string; user: User }>("/auth/login", { body: { email, password } }),
  /** Sign in with Apple / Google using the identity token from the provider. */
  socialSignIn: (provider: "apple" | "google", idToken: string, name?: string) =>
    request<{ token: string; user: User }>(`/auth/${provider}`, { body: { idToken, name } }),
  logout: () => request<void>("/auth/logout", { method: "POST" }),
  me: () => request<User>("/me"),
  forgotPassword: (email: string) => request<void>("/auth/forgot", { body: { email } }),
  resetPassword: (token: string, password: string) => request<{ token: string; user: User }>("/auth/reset", { body: { token, password } }),
  updateAlerts: (body: Partial<AlertSettings>) => request<User>("/me/alerts", { method: "PATCH", body }),
  myData: () => request<Record<string, unknown>>("/me/export"),
  emailMyData: () => request<{ sentTo: string }>("/me/export", { method: "POST" }),
  deleteAccount: () => request<void>("/me", { method: "DELETE", body: { confirm: true } }),
  updateMe: (body: Partial<Pick<User, "name" | "countryCode" | "city" | "photoUrl" | "phone" | "whatsapp" | "birthday">>) => request<User>("/me", { method: "PATCH", body }),
  toggleFavourite: (barberId: string) => request<{ favourite: boolean; favourites: string[] }>(`/barbers/${barberId}/favourite`, { method: "POST" }),
  favourites: () => request<Barber[]>("/me/favourites"),
  usual: () => request<Usual | null>("/me/usual"),
  cuts: () => request<Booking[]>("/me/cuts"),
  setRebook: (body: { everyWeeks: number | null; barberId?: string; serviceId?: string }) => request<User>("/me/rebook", { method: "PATCH", body }),
  referral: () => request<Referral>("/me/referral"),
  shareVisit: (bookingId: string) => request<{ token: string; url: string }>(`/bookings/${bookingId}/share`, { method: "POST" }),
  visit: (token: string) => request<SharedVisit>(`/visits/${token}`),
  reschedule: (bookingId: string, startsAt: string) => request<Booking>(`/bookings/${bookingId}/reschedule`, { body: { startsAt } }),

  createBooking: (body: {
    barberId: string; serviceId: string; startsAt: string; locationType: LocationType; address?: string; phone?: string; notes?: string;
    venue?: { kind: VenueKind; details: string }; guest?: { name: string; phone: string }; extras?: string[]; tip?: number; partner?: string;
  }) =>
    request<{ booking: Booking; clientSecret: string | null; demoPayments: boolean }>("/bookings", { body }),
  bookings: () => request<Booking[]>("/bookings"),
  booking: (id: string) => request<Booking>(`/bookings/${id}`),
  payment: (id: string) => request<{ booking: Booking; clientSecret: string | null; demoPayments: boolean }>(`/bookings/${id}/payment`),
  confirmPayment: (id: string) => request<Booking>(`/bookings/${id}/confirm-payment`, { method: "POST" }),
  cancelBooking: (id: string) => request<Booking>(`/bookings/${id}/cancel`, { method: "POST" }),
  setBookingStatus: (id: string, status: "on_the_way" | "completed") => request<Booking>(`/bookings/${id}/status`, { body: { status } }),
  review: (id: string, rating: number, comment: string, photoUrl?: string) => request<Barber>(`/bookings/${id}/review`, { body: { rating, comment, ...(photoUrl ? { photoUrl } : {}) } }),
  addCutPhoto: (bookingId: string, url: string) => request<{ cutPhotos: string[] }>(`/bookings/${bookingId}/cut-photo`, { body: { url } }),
  myReviews: () => request<Review[]>("/business/reviews"),
  replyToReview: (reviewId: string, text: string) => request<Review>(`/reviews/${reviewId}/reply`, { body: { text } }),

  // Barbershops: book any barber, hire the whole shop, order for delivery
  shops: (f: { country?: string; city?: string }) => request<ShopSummary[]>("/shops" + qs(f)),
  shop: (id: string) => request<Shop>(`/shops/${id}`),
  shopAvailability: (id: string, date: string, service: string) => request<{ timeZone: string; slots: string[] }>(`/shops/${id}/availability` + qs({ date, service })),
  bookShop: (id: string, body: { service: string; startsAt: string; notes?: string }) =>
    request<{ booking: Booking; clientSecret: string | null; demoPayments: boolean }>(`/shops/${id}/bookings`, { body }),
  hireAvailability: (id: string, date: string, hours: number) => request<{ timeZone: string; slots: string[] }>(`/shops/${id}/hire-availability` + qs({ date, hours: String(hours) })),
  createHire: (body: { shopId: string; startsAt: string; hours: number; guests: number; occasion: string; notes?: string }) =>
    request<{ hire: Hire; clientSecret: string | null; demoPayments: boolean }>("/hires", { body }),
  hires: () => request<Hire[]>("/hires"),
  hirePayment: (id: string) => request<{ hire: Hire; clientSecret: string | null; demoPayments: boolean }>(`/hires/${id}/payment`),
  confirmHirePayment: (id: string) => request<Hire>(`/hires/${id}/confirm-payment`, { method: "POST" }),
  cancelHire: (id: string) => request<Hire>(`/hires/${id}/cancel`, { method: "POST" }),
  shopOrders: () => request<Order[]>("/shop-orders"),
  setOrderStatus: (id: string, status: "out_for_delivery" | "delivered") => request<Order>(`/orders/${id}/status`, { body: { status } }),

  // The Club, gift cards, tips, preferences, cut notes, waitlist
  clubPlans: (country?: string) => request<{ currency: string; plans: Plan[] }>("/club/plans" + qs({ country })),
  clubMe: () => request<{ membership: Membership | null; credit: Record<string, number> }>("/club/me"),
  joinClub: (plan: string, countryCode?: string) => request<{ purchase: Purchase; clientSecret: string | null; demoPayments: boolean }>("/club/join", { body: { plan, countryCode } }),
  giftAmounts: (country?: string) => request<{ currency: string; amounts: number[] }>("/gifts/amounts" + qs({ country })),
  buyGift: (body: { amount: number; countryCode?: string; toName: string; toEmail: string; message: string; design: "noir" | "ivory" }) =>
    request<{ purchase: Purchase; gift: GiftCard; clientSecret: string | null; demoPayments: boolean }>("/gifts", { body }),
  gifts: () => request<GiftCard[]>("/gifts"),
  redeemGift: (code: string) => request<{ credit: Record<string, number>; amount: number; currency: string }>("/gifts/redeem", { body: { code } }),
  purchasePayment: (id: string) => request<{ purchase: Purchase; clientSecret: string | null; demoPayments: boolean }>(`/purchases/${id}/payment`),
  confirmPurchase: (id: string) => request<{ purchase: Purchase; gift: GiftCard | null; membership: Membership | null }>(`/purchases/${id}/confirm-payment`, { method: "POST" }),
  tip: (bookingId: string, amount: number) => request<{ purchase: Purchase; clientSecret: string | null; demoPayments: boolean }>(`/bookings/${bookingId}/tip`, { body: { amount } }),
  setPreferences: (body: Preferences) => request<User>("/me/preferences", { method: "PATCH", body }),
  setCutNotes: (bookingId: string, cutNotes: string) => request<{ ok: boolean }>(`/bookings/${bookingId}/notes`, { body: { cutNotes } }),
  joinWaitlist: (barberId: string, date: string) => request<{ id: string }>("/waitlist", { body: { barberId, date } }),
  cancelOrder: (id: string) => request<Order>(`/orders/${id}/cancel`, { method: "POST" }),

  products: (country?: string) => request<Catalog>("/products" + qs({ country })),
  createOrder: (body: { countryCode: string; items: { productId: string; quantity: number }[]; shippingName: string; shippingAddress: string; fulfilment?: "shipping" | "delivery"; shopId?: string }) =>
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
  updateMyBarber: (body: Partial<Pick<Barber, "photoUrl" | "bio" | "yearsExperience" | "languages" | "specialties" | "offersConsultations" | "offersHomeVisits" | "homeVisitFee" | "lat" | "lng" | "shopAddress"> & { videoLink: string } & Partial<WorkingHours>>) =>
    request<Barber>("/barbers/me", { method: "PATCH", body }),
  notifications: () => request<{ unread: number; items: AppNotification[] }>("/notifications"),
  markNotificationsRead: (ids?: string[]) => request<void>("/notifications/read", { body: { ids } }),
  addPushToken: (token: string) => request<void>("/me/push-tokens", { body: { token } }),
  removePushToken: (token: string) => request<void>("/me/push-tokens", { method: "DELETE", body: { token } }),
  myBarberSettings: () => request<{ videoLink: string; offersConsultations: boolean }>("/barbers/me/settings"),
  business: () => request<BusinessDashboard>("/barbers/me/business"),
  // Joining as a freelance barber: ID, licence and the signed agreement
  application: () => request<BarberApplication>("/barbers/me/application"),
  barberAgreement: () => request<Agreement>("/legal/barber-agreement"),
  saveApplication: (body: Partial<Pick<BarberApplication, "legalName" | "idNumber" | "idExpiry" | "licenceNumber" | "licenceAuthority" | "licenceExpiry">>) =>
    request<BarberApplication>("/barbers/me/application", { method: "PATCH", body }),
  async uploadApplicationDoc(kind: ApplicationDocKind, file: Blob, contentType: string): Promise<BarberApplication> {
    if (demo) return request<BarberApplication>(`/barbers/me/application/documents/${kind}`, { body: { dataUrl: await demoUpload(file), contentType } });
    await authLoaded;
    const res = await fetch(`${API_URL}/barbers/me/application/documents/${kind}`, {
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
  signApplication: (body: { name: string; svg: string; agree: boolean }) => request<BarberApplication>("/barbers/me/application/sign", { body }),
  submitApplication: () => request<BarberApplication>("/barbers/me/application/submit", { method: "POST" }),
  myBlocks: () => request<CalBlock[]>("/barbers/me/blocks"),
  addMyBlock: (body: { startsAt: string; endsAt: string; reason: string }) => request<CalBlock>("/barbers/me/blocks", { body }),
  removeMyBlock: (id: string) => request<void>(`/barbers/me/blocks/${id}`, { method: "DELETE" }),
  myRules: () => request<BookingRules>("/barbers/me/rules"),
  saveMyRules: (body: Partial<BookingRules>) => request<BookingRules>("/barbers/me/rules", { method: "PUT", body }),
  myClients: () => request<Client[]>("/barbers/me/clients"),
  saveClientNote: (key: string, note: string) => request<{ key: string; note: string }>("/barbers/me/clients/note", { method: "PUT", body: { key, note } }),
  messageClients: (keys: string[], text: string) => request<{ sent: number; skipped: number }>("/barbers/me/clients/message", { body: { keys, text } }),
  myLink: () => request<{ url: string; name: string; level: Level; levelLabel: string }>("/barbers/me/link"),
  queueStatus: (shopId: string) => request<QueueStatus>(`/shops/${shopId}/queue`),
  joinQueue: (shopId: string, service: string) => request<QueueItem>(`/shops/${shopId}/queue`, { body: { service } }),
  leaveQueue: (shopId: string) => request<void>(`/shops/${shopId}/queue/mine`, { method: "DELETE" }),
  saveServices: (services: { id?: string; name: string; durationMin: number; price: number; category?: ServiceCategory; description?: string }[]) => request<Barber>("/barbers/me/services", { method: "PUT", body: { services } }),

  // Admin panel (the JB Always Fresh team)
  admin: {
    overview: () => request<AdminOverview>("/admin/overview"),
    barbers: (f: { status?: string; q?: string }) => request<AdminBarberRow[]>("/admin/barbers" + qs(f)),
    barber: (id: string) => request<AdminBarberDetail>(`/admin/barbers/${id}`),
    updateBarber: (id: string, body: { status?: BarberStatus; verified?: boolean }) => request<AdminBarberRow>(`/admin/barbers/${id}`, { method: "PATCH", body }),
    applications: (status: string) => request<ApplicationRow[]>("/admin/applications" + qs({ status })),
    approveApplication: (barberId: string) => request<BarberApplication>(`/admin/barbers/${barberId}/application/approve`, { method: "POST" }),
    rejectApplication: (barberId: string, reason: string) => request<BarberApplication>(`/admin/barbers/${barberId}/application/reject`, { body: { reason } }),
    bookings: (f: { status?: string; q?: string }) => request<AdminBookingRow[]>("/admin/bookings" + qs(f)),
    cancelBooking: (id: string, reason: string) => request<AdminBookingRow>(`/admin/bookings/${id}/cancel`, { body: { reason } }),
    customers: (q?: string) => request<AdminCustomerRow[]>("/admin/customers" + qs({ q })),
    shops: () => request<AdminShopRow[]>("/admin/shops"),
    orders: () => request<AdminOrderRow[]>("/admin/orders"),
    reports: () => request<AdminTicket[]>("/admin/reports"),
    resolveReport: (id: string, action: "remove" | "dismiss") => request<AdminTicket>(`/admin/reports/${id}`, { body: { action } }),
    tickets: (status: "open" | "closed" | "all") => request<AdminTicket[]>("/admin/tickets" + qs({ status })),
    updateTicket: (id: string, body: { reply?: string; status?: "open" | "closed" }) => request<AdminTicket>(`/admin/tickets/${id}`, { method: "PATCH", body }),
    settings: () => request<AdminSettings>("/admin/settings"),
    updateSettings: (body: Partial<{ platformFeePercent: number; reviewNewBarbers: boolean; hiddenCampaigns: string[] }>) => request<AdminSettings>("/admin/settings", { method: "PATCH", body }),
    addManager: (shopId: string, email: string) => request<{ shopId: string; managers: { id: string; name: string; email: string }[] }>(`/admin/shops/${shopId}/managers`, { body: { email } }),
    removeManager: (shopId: string, userId: string) => request<null>(`/admin/shops/${shopId}/managers/${userId}`, { method: "DELETE" }),
    team: () => request<TeamMember[]>("/admin/team"),
    setTeamRole: (email: string, role: AdminRole | null) => request<{ email: string; role: AdminRole | null }>("/admin/team", { method: "PUT", body: { email, role } }),
    activity: (q?: string) => request<ActivityEntry[]>("/admin/activity" + qs({ q })),
    analytics: (days: number) => request<AdminAnalytics>("/admin/analytics" + qs({ days: String(days) })),
    finance: (month: string) => request<AdminFinance>("/admin/finance" + qs({ month })),
    /** The month's transactions as CSV text (for the accountant). */
    financeCsv: (month: string) => requestText("/admin/finance.csv" + qs({ month })),
    partners: () => request<Partner[]>("/admin/partners"),
    addPartner: (body: Omit<Partner, "id" | "createdAt" | "link" | "bookings" | "bookingsThisMonth" | "revenueThisMonth" | "owedThisMonth" | "discountsThisMonth">) => request<Partner>("/admin/partners", { body }),
    updatePartner: (id: string, body: Partial<Pick<Partner, "active" | "discountPercent" | "commissionPercent" | "name" | "contactEmail">>) => request<Partner>(`/admin/partners/${id}`, { method: "PATCH", body }),
  },
  // The shop panel: a barbershop's owner or manager runs the shop's day.
  manage: {
    panel: () => request<ShopPanel>("/manage"),
    calendar: (date?: string) => request<ShopCalendar>("/manage/calendar" + qs({ date })),
    addBooking: (body: { barberId: string; serviceId: string; startsAt: string; name: string; phone?: string; notes?: string }) => request<CalBooking>("/manage/bookings", { body }),
    act: (id: string, action: "done" | "no_show" | "cancel", reason = "") => request<CalBooking>(`/manage/bookings/${id}`, { body: { action, reason } }),
    move: (id: string, barberId: string, startsAt: string) => request<CalBooking>(`/manage/bookings/${id}/move`, { body: { barberId, startsAt } }),
    block: (body: { barberIds: string[]; startsAt: string; endsAt: string; reason: string }) => request<CalBlock[]>("/manage/blocks", { body }),
    unblock: (id: string) => request<null>(`/manage/blocks/${id}`, { method: "DELETE" }),
    updateBarber: (id: string, body: Partial<WorkingHours> & { offline?: boolean; sharePercent?: number | null }) => request<ShopMember>(`/manage/barbers/${id}`, { method: "PATCH", body }),
    saveServices: (services: { name: string; durationMin: number; price: number; category?: ServiceCategory; description?: string }[], barberIds?: string[]) => request<ShopMember[]>("/manage/services", { method: "PUT", body: { services, barberIds } }),
    addBarber: (name: string, email: string) => request<{ barber: ShopMember; login: { email: string; password: string } }>("/manage/barbers", { body: { name, email } }),
    reports: (period: "today" | "week" | "month") => request<ShopReport>("/manage/reports" + qs({ period })),
    updateSettings: (body: Partial<{ about: string; phone: string; workingDays: number[]; openHour: number; closeHour: number; barberSharePercent: number }>) =>
      request<{ about: string; phone: string; workingDays: number[]; openHour: number; closeHour: number; barberSharePercent: number }>("/manage/settings", { method: "PATCH", body }),
    queue: () => request<ShopQueue>("/manage/queue"),
    addToQueue: (body: { name: string; phone?: string; service?: string }) => request<QueueItem>("/manage/queue", { body }),
    queueAction: (id: string, action: "call" | "serve" | "done" | "remove", barberId?: string) => request<QueueItem>(`/manage/queue/${id}`, { body: { action, barberId } }),
    checkIns: () => request<CheckInRow[]>("/manage/check-in"),
    checkIn: (id: string) => request<{ id: string; checkedIn: boolean }>(`/manage/check-in/${id}`, { method: "POST" }),
    orders: () => request<{ commissionPercent: number; currency: string; month: { orders: number; sales: number; commission: number }; orders: ShopOrderRow[] }>("/manage/orders"),
    setOrderStatus: (id: string, status: "out_for_delivery" | "delivered") => request<ShopOrderRow>(`/manage/orders/${id}`, { body: { status } }),
    stock: () => request<StockRow[]>("/manage/stock"),
    saveStock: (counts: Record<string, number | null>) => request<{ ok: boolean }>("/manage/stock", { method: "PUT", body: { counts } }),
    hires: () => request<ShopHireRow[]>("/manage/hires"),
    staff: () => request<ShopStaff[]>("/manage/staff"),
    addStaff: (body: { name: string; email: string; role: "manager" | "front_desk" }) => request<{ staff: ShopStaff; login: { email: string; password: string } }>("/manage/staff", { body }),
    setStaffRole: (id: string, role: "manager" | "front_desk") => request<ShopStaff>(`/manage/staff/${id}`, { method: "PATCH", body: { role } }),
    removeStaff: (id: string) => request<null>(`/manage/staff/${id}`, { method: "DELETE" }),
    payroll: (period: "today" | "week" | "month") => request<Payroll>("/manage/payroll" + qs({ period })),
    lapsedClients: (weeks: number) => request<{ clients: number; lapsed: number; weeks: number }>("/manage/clients" + qs({ weeks: String(weeks) })),
    messageLapsed: (weeks: number, text: string) => request<{ sent: number; skipped: number }>("/manage/clients/message", { body: { weeks, text } }),
  },
  addGalleryPhoto: (url: string, caption: string) => request<Barber>("/barbers/me/gallery", { body: { url, caption, consent: true } }),
  removeGalleryPhoto: (id: string) => request<Barber>(`/barbers/me/gallery/${id}`, { method: "DELETE" }),
  addTransformation: (beforeUrl: string, afterUrl: string, caption: string) =>
    request<Barber>("/barbers/me/transformations", { body: { beforeUrl, afterUrl, caption, consent: true } }),
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
