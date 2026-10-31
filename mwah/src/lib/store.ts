import "server-only";
import { get, list, put, remove, uid } from "./db";
import { defaultSettings } from "./seed";
import { r2 } from "./money";
import type { Discount, Influencer, Order, OrderStatus, Payout, Product, ReferralClick, Settings } from "./types";

export async function getSettings(): Promise<Settings> {
  const s = await get<Settings>("settings", "main");
  if (!s) return defaultSettings;
  const zonesOk = Array.isArray(s.zones) && s.zones.every((z) => typeof z.minDays === "number");
  return { ...defaultSettings, ...s, zones: zonesOk ? s.zones : defaultSettings.zones,
    legal: { ...defaultSettings.legal, ...s.legal }, confirmations: { ...defaultSettings.confirmations, ...s.confirmations } };
}
export const saveSettings = (s: Settings) => put("settings", s);

/* ---------- products ---------- */
export const allProducts = async () => (await list<Product>("products")).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
export const activeProducts = async () => (await allProducts()).filter((p) => p.status === "active");
export const productBySlug = async (slug: string) => (await allProducts()).find((p) => p.slug === slug && p.status === "active") ?? null;
export const productById = (id: string) => get<Product>("products", id);
export const saveProduct = (p: Product) => put("products", p);
export const deleteProduct = (id: string) => remove("products", id);

/* ---------- discounts ---------- */
export const allDiscounts = async () => (await list<Discount>("discounts")).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
export async function discountByCode(code: string) {
  const c = code.trim().toUpperCase();
  return c ? (await allDiscounts()).find((d) => d.code === c) ?? null : null;
}
export const saveDiscount = (d: Discount) => put("discounts", d);
export const deleteDiscount = (id: string) => remove("discounts", id);

/* ---------- influencers & referrals ---------- */
export const allInfluencers = async () => (await list<Influencer>("influencers")).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
export const influencerById = (id: string) => get<Influencer>("influencers", id);
export const influencerByEmail = async (email: string) => (await allInfluencers()).find((i) => i.email === email.trim().toLowerCase()) ?? null;
export async function influencerByCode(code?: string | null) {
  const c = (code ?? "").trim().toUpperCase();
  return c ? (await allInfluencers()).find((i) => i.code === c && i.status === "active") ?? null : null;
}
export const saveInfluencer = (i: Influencer) => put("influencers", i);

export async function uniqueCode(base: string) {
  const existing = new Set((await allInfluencers()).map((i) => i.code));
  const stem = base.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12) || "MWAH";
  let code = stem, n = 1;
  while (existing.has(code)) code = `${stem}${++n}`;
  return code;
}
export const recordClick = (influencerId: string) =>
  put<ReferralClick>("clicks", { id: uid(), influencerId, createdAt: new Date().toISOString() });

export async function influencerStats(inf: Influencer) {
  const [orders, clicks, payouts] = await Promise.all([allOrders(), list<ReferralClick>("clicks"), list<Payout>("payouts")]);
  const mine = orders.filter((o) => o.influencerId === inf.id);
  const counted = mine.filter((o) => ["paid", "packed", "shipped", "delivered"].includes(o.status));
  const myClicks = clicks.filter((c) => c.influencerId === inf.id).length;
  const myPayouts = payouts.filter((p) => p.influencerId === inf.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const earned = r2(counted.reduce((t, o) => t + o.commission, 0));
  const paidOut = r2(myPayouts.reduce((t, p) => t + p.amount, 0));
  const revenue = r2(counted.reduce((t, o) => t + o.total, 0));
  return {
    clicks: myClicks, orders: counted.length, revenue, earned, paidOut, balance: r2(earned - paidOut),
    conversion: myClicks ? (counted.length / myClicks) * 100 : 0, recent: counted.slice(0, 10), payouts: myPayouts,
  };
}
export const addPayout = (influencerId: string, amount: number, note: string) =>
  put<Payout>("payouts", { id: uid(), influencerId, amount: r2(amount), note, createdAt: new Date().toISOString() });

/* ---------- orders ---------- */
export const allOrders = async () => (await list<Order>("orders")).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
export const orderById = (id: string) => get<Order>("orders", id);
export const saveOrder = (o: Order) => put("orders", o);
export async function nextOrderNumber() {
  const all = await list<Order>("orders");
  return all.reduce((m, o) => Math.max(m, o.number), 1000) + 1;
}

/** Public "orders so far" number: only orders that were really paid and not cancelled or refunded. */
export async function orderCount() {
  return (await allOrders()).filter((o) => ["paid", "packed", "shipped", "delivered"].includes(o.status)).length;
}

/** Idempotent: marks an order paid, takes stock, counts the discount code and fixes the creator's commission. */
export async function finalizePaid(orderId: string) {
  const o = await orderById(orderId);
  if (!o || o.status !== "pending") return o;
  o.status = "paid"; o.paidAt = new Date().toISOString();
  for (const it of o.items) {
    const p = await productById(it.productId);
    if (p) await saveProduct({ ...p, stock: Math.max(0, p.stock - it.qty) });
  }
  if (o.discountCode) {
    const d = await discountByCode(o.discountCode);
    if (d) await saveDiscount({ ...d, uses: d.uses + 1 });
  }
  await saveOrder(o);
  return o;
}

export async function setStatus(id: string, status: OrderStatus) {
  const o = await orderById(id);
  if (!o) return;
  const wasCounted = o.status !== "pending" && o.status !== "cancelled" && o.status !== "refunded";
  o.status = status;
  if (["cancelled", "refunded"].includes(status) && wasCounted) {
    for (const it of o.items) { // put the stock back
      const p = await productById(it.productId);
      if (p) await saveProduct({ ...p, stock: p.stock + it.qty });
    }
  }
  o.notes.push({ at: new Date().toISOString(), text: `Status changed to ${status}` });
  await saveOrder(o);
}

export async function dashboard() {
  const [orders, products, settings] = await Promise.all([allOrders(), allProducts(), getSettings()]);
  const paid = orders.filter((o) => ["paid", "packed", "shipped", "delivered"].includes(o.status));
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (13 - i));
    const key = d.toISOString().slice(0, 10);
    const day = paid.filter((o) => o.createdAt.slice(0, 10) === key);
    return { key, label: d.toLocaleDateString("en", { day: "numeric", month: "short" }), revenue: r2(day.reduce((t, o) => t + o.total, 0)), orders: day.length };
  });
  const month = new Date().toISOString().slice(0, 7);
  const monthRev = r2(paid.filter((o) => o.createdAt.startsWith(month)).reduce((t, o) => t + o.total, 0));
  const totalRev = r2(paid.reduce((t, o) => t + o.total, 0));
  const sold = new Map<string, number>();
  paid.forEach((o) => o.items.forEach((i) => sold.set(i.name, (sold.get(i.name) ?? 0) + i.qty)));
  const today = new Date().toISOString().slice(0, 10);
  return {
    totalRev, monthRev, orderCount: paid.length, ordersToday: paid.filter((o) => o.createdAt.slice(0, 10) === today).length, aov: paid.length ? r2(totalRev / paid.length) : 0,
    toShip: orders.filter((o) => ["paid", "packed"].includes(o.status)).length,
    days, recent: orders.slice(0, 6),
    low: products.filter((p) => p.status === "active" && p.stock <= settings.lowStockAt),
    top: [...sold.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5),
  };
}
