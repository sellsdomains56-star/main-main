/** Menu sections; "extras" (hot towel, massage…) are added to a service. */
export type ServiceCategory = "hair" | "beard" | "face" | "colour" | "kids" | "packages" | "extras";

export interface Service {
  id: string;
  name: string;
  durationMin: number;
  price: number;
  category?: ServiceCategory;
  description?: string;
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
  distanceKm?: number; // when searching near the customer
  reason?: string; // recommendations: why it was picked
  level?: Level;
  cancelPolicy?: CancelPolicy | null;
  offPeak?: PriceRule | null;
  peak?: PriceRule | null;
  status?: BarberStatus; // pending = waiting for approval, suspended = paused by the team
  verified?: boolean; // ID and licence checked by the team
}

export type BarberStatus = "pending" | "live" | "suspended";

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
  bookingId?: string;
  photoUrl?: string; // the customer's photo of the cut
  reply?: { text: string; at: string }; // the barber's answer
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
  admin?: boolean; // on the JB Always Fresh team: can open the admin panel
  adminRole?: AdminRole;
  manages?: string; // id of the barbershop this person runs in the shop panel
  barberId?: string;
  countryCode?: string;
  city?: string;
  preferences?: Preferences;
  alerts?: AlertSettings;
  photoUrl?: string;
  phone?: string;
  whatsapp?: boolean; // also send booking updates by WhatsApp
  birthday?: string; // MM-DD
  favourites?: string[]; // barber ids
  rebook?: { barberId: string; serviceId: string; everyWeeks: number; nextAt: string }; // "time for a fresh cut" reminders
  credit?: Record<string, number>;
}

/** "Your usual": the last thing booked, ready to book again. */
export interface Usual {
  barber: Barber;
  service: Service;
  extras: string[];
  locationType: "shop" | "home";
  lastAt: string;
}

export interface Referral {
  code: string;
  currency: string;
  amount: number; // what each side gets, minor units
  invited: number;
  rewarded: number;
  link: string;
}

/** What a friend sees through "share my visit". */
export interface SharedVisit {
  barber: { name: string; photoUrl: string; verified: boolean; phoneSafety: string };
  customerFirstName: string;
  status: BookingStatus;
  startsAt: string;
  endsAt: string;
  timeZone: string;
  service: string;
  area: string;
  venue: VenueKind | null;
  appUrl: string;
}

/** Which alerts reach the phone (missing = on). Bookings, payments and account messages always do. */
export interface AlertSettings {
  reminders?: boolean;
  offers?: boolean;
  social?: boolean;
  tips?: boolean;
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

export type NotificationKind = "booking_confirmed" | "new_booking" | "on_the_way" | "reminder" | "completed" | "cancelled" | "order_update" | "hire" | "club" | "gift" | "tip" | "waitlist" | "account";

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
  extras?: Pick<Service, "id" | "name" | "durationMin" | "price">[];
  coveredBy?: "membership"; // included in the Club plan
  creditUsed?: number; // gift credit applied
  tip?: number;
  cutNotes?: string; // the barber's notes for next time
  cutPhotos?: string[]; // photos of the finished cut, from the barber
  priceRule?: number; // off-peak (< 0) or peak (> 0) percent applied
  lateFee?: number; // kept by the barber after a late cancellation
  cancelTerms?: { freeUntil: string | null; lateFeePercent: number; fee: number };
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
  openNow?: boolean;
  near?: { lat: number; lng: number }; // the customer's position, for "nearest"
  sort?: "rating" | "price" | "soonest" | "experience" | "nearest";
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

/** A campaign banner on Home (offers, seasonal highlights). */
export interface Campaign {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  cta: string;
  photoUrl: string;
  link: { pathname: string; params?: Record<string, string> };
}

/** One sum per currency (amounts in minor units), largest first. */
export type Money = { currency: string; amount: number }[];

export interface Earnings {
  count: number;
  gross: number;
  fee: number;
  tips: number;
  net: number;
  lateFees?: number; // kept from late cancellations (included in gross)
}

export interface WorkingHours {
  workingDays: number[]; // 0 = Sunday
  openHour: number;
  closeHour: number;
  timeOff: string[]; // YYYY-MM-DD
}

/** The barber's business dashboard. */
export interface BusinessDashboard {
  barber: Barber;
  status: BarberStatus;
  verified: boolean;
  currency: string;
  feePercent: number;
  today: Booking[];
  next: Booking | null;
  upcomingCount: number;
  week: { date: string; count: number; working: boolean }[];
  earnings: { today: Earnings; week: Earnings; month: Earnings };
  completedThisMonth: number;
  cancelledThisMonth: number;
  reviews: Review[];
  checklist: { key: string; label: string; done: boolean }[];
  hours: WorkingHours;
  level: Level;
  link: string;
  blocks: number; // upcoming blocked times
}

// ---------- Admin panel ----------

export interface AdminBookingRow {
  id: string;
  startsAt: string;
  createdAt: string;
  status: BookingStatus;
  amount: number;
  currency: string;
  fee: number;
  locationType: LocationType;
  service: string;
  barber: { id: string; name: string; photoUrl: string; city: string } | null;
  customer: { id: string; name: string; email: string } | null;
  coveredBy: "membership" | null;
}

export interface AdminBarberRow {
  id: string;
  name: string;
  photoUrl: string;
  city: string;
  countryCode: string;
  status: BarberStatus;
  verified: boolean;
  joinedAt: string | null;
  rating: number | null;
  ratingCount: number;
  bookings: number;
  revenue30: Money;
  email: string | null;
  shop: { id: string; name: string } | null;
  profileDone: number;
  profileTotal: number;
}

export interface AdminBarberDetail extends AdminBarberRow {
  profile: Barber;
  checklist: { key: string; label: string; done: boolean }[];
  hours: WorkingHours;
  stats: { paid: number; completed: number; cancelled: number; revenue: Money; reels: number; reports: number };
  recent: AdminBookingRow[];
}

export interface AdminOverview {
  feePercent: number;
  bookings: { today: number; last7: number; last30: number; upcoming: number; cancelled30: number };
  revenue30: { bookings: Money; fees: Money; hires: Money; shop: Money; clubAndGifts: Money };
  customers: { total: number; new7: number; members: number };
  barbers: { live: number; pending: number; suspended: number; total: number };
  pendingBarbers: AdminBarberRow[];
  openTickets: number;
  openReports: number;
  ordersToShip: number;
  series: { date: string; count: number }[];
  recent: AdminBookingRow[];
}

export interface AdminCustomerRow {
  id: string;
  name: string;
  email: string;
  city?: string;
  createdAt?: string;
  bookings: number;
  cancelled: number;
  spent: Money;
  member: PlanId | null;
  lastBooking: string | null;
}

export interface AdminShopRow {
  id: string;
  name: string;
  city: string;
  address: string;
  photoUrl: string;
  team: { id: string; name: string; photoUrl: string; status: BarberStatus }[];
  bookings30: number;
  hires: number;
  deliveries: number;
  privateHire: boolean;
  delivery: boolean;
  managers: { id: string; name: string; email: string }[];
}

export interface AdminOrderRow {
  id: string;
  createdAt: string;
  status: Order["status"];
  amount: number;
  currency: string;
  fulfilment: "shipping" | "delivery";
  items: number;
  customer: { name: string; email: string } | null;
  shop: { id: string; name: string } | null;
  address: string;
}

export interface AdminTicket {
  id: string;
  userId?: string;
  name: string;
  email: string;
  topic: string;
  message: string;
  status: "open" | "closed";
  createdAt: string;
  reelId?: string;
  replies?: { at: string; by: string; text: string }[];
  reel: { id: string; caption: string; posterUrl: string | null; videoUrl: string; barber: { id: string; name: string } | null } | null;
  reelRemoved: boolean;
}

export interface AdminSettings {
  platformFeePercent: number;
  reviewNewBarbers: boolean;
  campaigns: { id: string; eyebrow: string; title: string; photoUrl: string; countries: string[] | null; except: string[] | null; hidden: boolean }[];
}

// ---------- Shop panel (a barbershop runs its day) ----------

export interface ShopMember extends Barber {
  sharePercent: number | null; // the barber's own split (null = the shop's default)
  status: BarberStatus;
  offline: boolean; // switched off in the app by the shop
  email: string | null;
  hours: WorkingHours;
  workingToday: boolean;
}

export interface ShopPanel {
  shop: { id: string; name: string; address: string; city: string; phone: string; about: string; photoUrl: string; timeZone: string; currency: string; workingDays: number[]; openHour: number; closeHour: number; barberSharePercent: number };
  role: ShopRole;
  branches: { id: string; name: string; city: string }[];
  links: { page: string; queue: string };
  today: string;
  team: ShopMember[];
}

/** Owner: everything. Manager: everything but staff. Front desk: calendar, walk-ins, queue, check-in and orders. */
export type ShopRole = "owner" | "manager" | "front_desk";

export interface ShopStaff {
  id: string;
  name: string;
  email: string;
  role: ShopRole;
  you: boolean;
}

export interface QueueItem {
  id: string;
  name: string;
  phone: string;
  service: string;
  status: "waiting" | "called" | "serving" | "done" | "left";
  joinedAt: string;
  calledAt: string | null;
  fromApp: boolean;
  barber: { id: string; name: string } | null;
  position: number | null;
  estimateMin: number | null;
}

export interface ShopQueue {
  open: boolean;
  chairs: number;
  waiting: QueueItem[];
  inChair: QueueItem[];
  doneToday: number;
  team: { id: string; name: string; photoUrl: string; working: boolean }[];
}

/** What a customer sees about a shop's queue. */
export interface QueueStatus {
  open: boolean;
  waiting: number;
  estimateMin: number;
  nowServing: string[];
  mine: QueueItem | null;
}

export interface CheckInRow {
  id: string;
  firstName: string;
  startsAt: string;
  barber: string;
  service: string;
  checkedIn: boolean;
  done: boolean;
}

export interface ShopOrderRow {
  id: string;
  status: Order["status"];
  createdAt: string;
  name: string;
  address: string;
  items: { name: string; quantity: number }[];
  subtotal: number;
  amount: number;
  currency: string;
  commission: number;
}

export interface StockRow {
  id: string;
  name: string;
  emoji: string;
  price: number;
  currency: string;
  count: number | null; // null = not counted
  low: boolean;
}

export interface ShopHireRow {
  id: string;
  startsAt: string;
  endsAt: string;
  hours: number;
  guests: number;
  occasion: string;
  notes: string;
  amount: number;
  currency: string;
  status: Hire["status"];
  customer: string;
}

export interface Payroll {
  period: "today" | "week" | "month";
  from: string;
  to: string;
  currency: string;
  defaultSharePercent: number;
  canEditSplit: boolean;
  rows: { id: string; name: string; photoUrl: string; sharePercent: number; customShare: boolean; appointments: number; walkIns: number; services: number; lateFees: number; tips: number; jbFee: number; barberPay: number; shopKeeps: number }[];
  totals: { services: number; lateFees: number; tips: number; jbFee: number; barberPay: number; shopKeeps: number; productCommission: number };
  note: string;
}

/** A client in a barber's client book. */
export interface Client {
  key: string;
  name: string;
  photoUrl: string | null;
  visits: number;
  lastVisit: string | null;
  nextVisit: string | null;
  spend: number;
  currency: string;
  lastService: string | null;
  cutNotes: string | null;
  preferences: Preferences | null;
  note: string;
  fromApp: boolean;
  lastMessagedAt: string | null;
  phone: string;
}

/** Quiet-hour discounts (off-peak) and busy-hour premiums (peak), in the barber's local time. */
export interface PriceRule {
  percent: number;
  days: number[];
  fromHour: number;
  toHour: number;
}
export interface CancelPolicy {
  freeHours: number; // 0 = always free
  lateFeePercent: number;
}
export interface BookingRules {
  cancelPolicy: CancelPolicy;
  offPeak: PriceRule | null;
  peak: PriceRule | null;
}
export type Level = "new" | "rising" | "pro" | "elite";

/** Owner: everything. Operations: barbers, shops, bookings, partners. Support: tickets, reels, bookings, customers. Finance: money and reports. */
export type AdminRole = "owner" | "operations" | "support" | "finance";

export interface TeamMember { email: string; role: AdminRole; fixed: boolean; name: string | null }
export interface ActivityEntry { id: string; at: string; by: { id: string; name: string; email: string }; action: string; target: string; detail?: string }

export interface AdminAnalytics {
  days: number;
  bookings: { made: number; paid: number; cancelled: number; cancelRate: number; conversion: number };
  customers: { active: number; firstTime: number; returning: number; newAccounts: number; repeatRate: number };
  averageBooking: Money;
  leadTimeHours: number;
  byCity: { city: string; bookings: number; revenue: Money }[];
  byService: { name: string; count: number }[];
  byHour: number[];
  byWeekday: number[];
  topBarbers: { id: string; name: string; photoUrl: string; city: string; bookings: number }[];
}

export interface AdminFinance {
  month: string;
  label: string;
  vatRegistered: boolean;
  vatPercent: number;
  lines: { key: string; label: string; amounts: Money }[];
  transactions: number;
}

export interface Partner {
  id: string;
  kind: "hotel" | "corporate";
  name: string;
  code: string;
  discountPercent: number;
  commissionPercent: number;
  emailDomain?: string;
  contactEmail: string;
  active: boolean;
  createdAt: string;
  link: string;
  bookings: number;
  bookingsThisMonth: number;
  revenueThisMonth: Money;
  owedThisMonth: Money;
  discountsThisMonth: Money;
}

/** A hotel or company code a customer arrived with (QR link /p/CODE). */
export interface PartnerWelcome { code: string; name: string; kind: "hotel" | "corporate"; discountPercent: number }

export interface Award { month: string; label: string; city: string; list: { rank: number; cuts: number; barber: Barber }[] }

export interface Invoice {
  number: string;
  title: string;
  issuedAt: string;
  serviceDate: string;
  timeZone: string;
  seller: { name: string; address: string; trn: string | null; onBehalfOf: string };
  customer: { name: string; email: string };
  lines: { description: string; amount: number }[];
  currency: string;
  discounts: { description: string; amount: number }[];
  total: number;
  vat: { percent: number; amount: number } | null;
  tip: number;
  note: string;
}

export interface ChatSummary {
  id: string;
  with: { id: string; name: string; photoUrl: string };
  last: ChatMessage2 | null;
  unread: number;
  updatedAt: string;
}
export interface ChatMessage2 { id: string; from: "customer" | "barber"; text: string; at: string }
export interface ChatThread extends ChatSummary { side: "customer" | "barber"; messages: ChatMessage2[] }

export interface Payouts { available: boolean; connected: boolean; payoutsEnabled: boolean; missing?: string[]; note?: string }

export interface CalBooking {
  id: string;
  barberId: string;
  startsAt: string;
  endsAt: string;
  status: BookingStatus;
  noShow: boolean;
  source: "app" | "shop";
  client: string;
  phone: string;
  service: string;
  durationMin: number;
  amount: number;
  currency: string;
  paid: string; // "app" or "at the shop"
  locationType: LocationType;
  address: string;
  notes: string;
}

export interface CalBlock { id: string; barberId: string; startsAt: string; endsAt: string; reason: string }

export interface ShopCalendar {
  date: string;
  timeZone: string;
  currency: string;
  openHour: number;
  closeHour: number;
  barbers: (ShopMember & { working: boolean; dayOff: boolean })[];
  bookings: CalBooking[];
  blocks: CalBlock[];
  hires: { id: string; startsAt: string; endsAt: string; occasion: string; guests: number }[];
  summary: { bookings: number; done: number; walkIns: number; cancelled: number; noShows: number; takings: number };
}

export interface ShopReport {
  period: "today" | "week" | "month";
  from: string;
  to: string;
  today: string;
  currency: string;
  totals: { bookings: number; completed: number; fromApp: number; walkIns: number; noShows: number; cancelled: number; takings: number; appTakings: number };
  byBarber: { id: string; name: string; photoUrl: string; bookings: number; completed: number; walkIns: number; noShows: number; takings: number; busyPercent: number }[];
  topServices: { name: string; count: number }[];
  perDay: { date: string; count: number }[];
}
