import type { TaxRule } from "./tax";
export type Row = { id: string };

export type Product = Row & {
  slug: string; name: string; tagline: string; description: string;
  highlights: string[]; howToUse: string; flavourNotes: string; finish: string; shelfLife: string; // product-page content
  price: number;            // AED, VAT-inclusive
  color: string; color2: string;
  images: string[]; stock: number;
  status: "active" | "draft"; featured: boolean;
  ingredients: string; size: string; createdAt: string;
};

export type Address = { line1: string; line2?: string; city: string; state?: string; postcode?: string; country: string };
export type OrderItem = { productId: string; name: string; qty: number; price: number };
export type OrderStatus = "pending" | "paid" | "packed" | "shipped" | "delivered" | "cancelled" | "refunded";

export type Order = Row & {
  number: number; email: string; name: string; phone: string; address: Address;
  items: OrderItem[];
  subtotal: number; discount: number; shipping: number; vat: number; total: number;
  currency: "AED"; discountCode?: string;
  influencerId?: string; referralCode?: string; commission: number;
  status: OrderStatus; tracking?: string; carrier?: string;
  notes: { at: string; text: string }[];
  stripeSessionId?: string; stripePaymentIntent?: string; refunded: number; testMode: boolean; createdAt: string; paidAt?: string;
  estimatedDelivery?: { from: string; to: string };
  destTax?: { label: string; amount: number; regNo?: string };            // destination VAT/duty collected at checkout
  uaeVat?: number;                                                          // UAE VAT contained in the total (UAE deliveries)
  terms?: { version: string; acceptedAt: string; ip?: string }; // proof the customer accepted the policies at checkout
};

export type Discount = Row & {
  code: string; type: "percent" | "fixed"; value: number; minSubtotal: number;
  maxUses: number; uses: number; active: boolean; expiresAt?: string; createdAt: string;
};

export type InfluencerStatus = "applied" | "active" | "paused" | "rejected";
export type Influencer = Row & {
  name: string; handle: string; platform: string; followers: string; email: string;
  passwordHash?: string; code: string;
  commissionPct: number; customerDiscountPct: number;
  status: InfluencerStatus; createdAt: string; termsAcceptedAt?: string;
};
export type ReferralClick = Row & { influencerId: string; createdAt: string };
export type Payout = Row & { influencerId: string; amount: number; note: string; createdAt: string };

export type ShippingZone = { id: string; name: string; countries: string[]; rate: number; freeOver?: number; minDays: number; maxDays: number };
export type LegalInfo = { legalName: string; tradeLicenceNo: string; licensingAuthority: string; vatTrn: string; address: string; email: string; phone: string; jurisdiction: string };
export type Settings = Row & {
  storeName: string; vatPct: number; exportsZeroRated: boolean;
  zones: ShippingZone[]; blockedCountries: string[];
  processingMinDays: number; processingMaxDays: number;
  defaultCommissionPct: number; defaultCustomerDiscountPct: number; minPayout: number;
  lowStockAt: number;
  tax: Record<string, TaxRule>;                    // destination taxes by country code
  currencies: Record<string, number>;              // display-only exchange rates, units per 1 AED
  currenciesUpdated?: string;
  legal: LegalInfo;
  confirmations: { policiesReviewedAt?: string; shippingReviewedAt?: string; cosmeticsCheckedAt?: string; taxReviewedAt?: string; copyReviewedAt?: string };
};

export type Table = "products" | "orders" | "discounts" | "influencers" | "clicks" | "payouts" | "settings";
