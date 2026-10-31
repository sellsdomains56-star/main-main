"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ADMIN_EMAIL, hashPassword, loginAdmin, logout, randomPassword, requireAdmin } from "@/lib/auth";
import { uid } from "@/lib/db";
import * as S from "@/lib/store";
import type { OrderStatus, Product, ShippingZone } from "@/lib/types";
import { COUNTRY_LIST } from "@/lib/countries";
import { CURRENCIES } from "@/lib/tax";
import { stripe } from "@/lib/stripe";
import { r2 } from "@/lib/money";

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const num = (fd: FormData, k: string, d = 0) => { const n = Number(str(fd, k)); return Number.isFinite(n) ? n : d; };
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export async function adminLogin(_: { error?: string; email?: string }, fd: FormData) {
  if (!(await loginAdmin(str(fd, "email"), String(fd.get("password") ?? "")))) return { error: "Wrong email or password.", email: str(fd, "email") };
  redirect("/admin");
}
export async function adminLogout() { await logout("admin"); redirect("/admin/login"); }

/* ---------- orders ---------- */
export async function updateOrderStatus(id: string, status: OrderStatus) {
  await requireAdmin(); await S.setStatus(id, status); revalidatePath("/admin", "layout");
}
export async function saveShipment(id: string, fd: FormData) {
  await requireAdmin();
  const o = await S.orderById(id); if (!o) return;
  o.carrier = str(fd, "carrier"); o.tracking = str(fd, "tracking");
  if (o.tracking && ["paid", "packed"].includes(o.status)) { o.status = "shipped"; o.notes.push({ at: new Date().toISOString(), text: `Shipped with ${o.carrier} ${o.tracking}` }); }
  await S.saveOrder(o); revalidatePath("/admin", "layout");
}
export async function addNote(id: string, fd: FormData) {
  await requireAdmin();
  const o = await S.orderById(id), text = str(fd, "text"); if (!o || !text) return;
  o.notes.push({ at: new Date().toISOString(), text }); await S.saveOrder(o); revalidatePath(`/admin/orders/${id}`);
}

export type RefundState = { ok?: boolean; error?: string };
/** Refunds the customer's card through Stripe (full or partial), then updates the order. */
export async function refundOrder(id: string, _: RefundState, fd: FormData): Promise<RefundState> {
  await requireAdmin();
  const o = await S.orderById(id);
  if (!o) return { error: "Order not found." };
  if (!stripe) return { error: "Stripe isn't connected, so no card refund can be made from here." };
  if (!o.stripePaymentIntent) return { error: "This order has no Stripe payment on record. Refund it in the Stripe dashboard." };
  const left = r2(o.total - o.refunded);
  const amount = r2(num(fd, "amount", left));
  if (amount <= 0 || amount > left) return { error: `Enter an amount between 0.01 and ${left.toFixed(2)}.` };
  try {
    const r = await stripe.refunds.create({ payment_intent: o.stripePaymentIntent, amount: Math.round(amount * 100), reason: "requested_by_customer", metadata: { orderId: o.id } }, { idempotencyKey: `refund-${o.id}-${Math.round((o.refunded + amount) * 100)}` });
    o.refunded = r2(o.refunded + amount);
    o.notes.push({ at: new Date().toISOString(), text: `Refunded AED ${amount.toFixed(2)} via Stripe (${r.id})` });
    await S.saveOrder(o);
    if (o.refunded >= o.total) await S.setStatus(o.id, "refunded");
  } catch (e) { return { error: e instanceof Error ? e.message : "Stripe refused the refund." }; }
  revalidatePath("/admin", "layout");
  return { ok: true };
}

/* ---------- products ---------- */
export async function saveProduct(id: string | null, fd: FormData) {
  await requireAdmin();
  const name = str(fd, "name"); if (!name) return;
  const existing = id ? await S.productById(id) : null;
  const slug = slugify(str(fd, "slug") || name);
  const taken = (await S.allProducts()).some((p) => p.slug === slug && p.id !== id);
  const p: Product = {
    id: existing?.id ?? uid(), createdAt: existing?.createdAt ?? new Date().toISOString(),
    slug: taken ? `${slug}-${Date.now().toString(36)}` : slug, name, tagline: str(fd, "tagline"), description: str(fd, "description"),
    price: Math.max(0, num(fd, "price")), stock: Math.max(0, Math.floor(num(fd, "stock"))),
    color: str(fd, "color") || "#ff5d8f", color2: str(fd, "color2") || "#ffb3c7",
    images: str(fd, "images").split("\n").map((s) => s.trim()).filter(Boolean),
    status: str(fd, "status") === "draft" ? "draft" : "active", featured: fd.get("featured") === "on",
    ingredients: str(fd, "ingredients"), size: str(fd, "size") || "4.5 g",
    highlights: str(fd, "highlights").split("\n").map((x) => x.trim()).filter(Boolean).slice(0, 8),
    howToUse: str(fd, "howToUse"), flavourNotes: str(fd, "flavourNotes"), finish: str(fd, "finish"), shelfLife: str(fd, "shelfLife"),
  };
  await S.saveProduct(p); revalidatePath("/", "layout"); redirect("/admin/products");
}
export async function removeProduct(id: string) { await requireAdmin(); await S.deleteProduct(id); revalidatePath("/", "layout"); redirect("/admin/products"); }
export async function adjustStock(id: string, fd: FormData) {
  await requireAdmin(); const p = await S.productById(id);
  if (p) await S.saveProduct({ ...p, stock: Math.max(0, Math.floor(num(fd, "stock"))) });
  revalidatePath("/", "layout");
}

/* ---------- discounts ---------- */
export async function createDiscount(fd: FormData) {
  await requireAdmin();
  const code = str(fd, "code").toUpperCase().replace(/[^A-Z0-9]/g, ""); if (!code) return;
  if ((await S.discountByCode(code)) || (await S.influencerByCode(code))) return; // codes must be unique
  await S.saveDiscount({
    id: uid(), code, type: str(fd, "type") === "fixed" ? "fixed" : "percent", value: Math.max(0, num(fd, "value")),
    minSubtotal: Math.max(0, num(fd, "minSubtotal")), maxUses: Math.max(0, Math.floor(num(fd, "maxUses"))), uses: 0, active: true,
    expiresAt: str(fd, "expiresAt") || undefined, createdAt: new Date().toISOString(),
  });
  revalidatePath("/admin/discounts");
}
export async function toggleDiscount(id: string) {
  await requireAdmin(); const d = (await S.allDiscounts()).find((x) => x.id === id);
  if (d) await S.saveDiscount({ ...d, active: !d.active }); revalidatePath("/admin/discounts");
}
export async function removeDiscount(id: string) { await requireAdmin(); await S.deleteDiscount(id); revalidatePath("/admin/discounts"); }

/* ---------- influencers ---------- */
export type InfState = { message?: string; password?: string };
export async function approveInfluencer(id: string, _: InfState): Promise<InfState> {
  await requireAdmin();
  const i = await S.influencerById(id); if (!i) return { message: "Not found" };
  const pw = randomPassword();
  await S.saveInfluencer({ ...i, status: "active", code: i.code || (await S.uniqueCode(i.handle)), passwordHash: hashPassword(pw) });
  // no revalidate here: the list would re-render and hide the one-time password. The client refreshes on "Done".
  return { message: `Approved. Send ${i.name} these login details (shown once):`, password: pw };
}
export async function resetInfluencerPassword(id: string, _: InfState): Promise<InfState> {
  await requireAdmin();
  const i = await S.influencerById(id); if (!i) return { message: "Not found" };
  const pw = randomPassword(); await S.saveInfluencer({ ...i, passwordHash: hashPassword(pw) });
  return { message: "New password (shown once):", password: pw };
}
export async function setInfluencerStatus(id: string, status: "active" | "paused" | "rejected") {
  await requireAdmin(); const i = await S.influencerById(id); if (i) await S.saveInfluencer({ ...i, status }); revalidatePath("/admin/influencers");
}
export async function updateInfluencer(id: string, fd: FormData) {
  await requireAdmin(); const i = await S.influencerById(id); if (!i) return;
  let code = str(fd, "code").toUpperCase().replace(/[^A-Z0-9]/g, "") || i.code;
  const clash = (await S.discountByCode(code)) || (await S.allInfluencers()).find((x) => x.code === code && x.id !== id);
  if (clash) code = i.code;
  await S.saveInfluencer({ ...i, code, commissionPct: Math.min(80, Math.max(0, num(fd, "commissionPct"))), customerDiscountPct: Math.min(50, Math.max(0, num(fd, "customerDiscountPct"))) });
  revalidatePath("/admin/influencers");
}
export async function recordPayout(id: string, fd: FormData) {
  await requireAdmin(); const amount = num(fd, "amount"); if (amount <= 0) return;
  await S.addPayout(id, amount, str(fd, "note") || "Payout"); revalidatePath("/admin/influencers");
}

/* ---------- settings ---------- */
const codes = (v: string) => v.toUpperCase().split(/[\s,]+/).filter((c) => /^[A-Z]{2}$/.test(c));
export async function saveSettings(fd: FormData) {
  await requireAdmin();
  const s = await S.getSettings();
  const zones: ShippingZone[] = s.zones.map((z) => {
    const min = Math.max(0, Math.floor(num(fd, `min_${z.id}`, z.minDays)));
    return {
      ...z, rate: Math.max(0, num(fd, `rate_${z.id}`)),
      minDays: min, maxDays: Math.max(min, Math.floor(num(fd, `max_${z.id}`, z.maxDays))),
      freeOver: str(fd, `free_${z.id}`) === "" ? undefined : Math.max(0, num(fd, `free_${z.id}`)),
      countries: codes(str(fd, `countries_${z.id}`)),
    };
  });
  const pmin = Math.max(0, Math.floor(num(fd, "processingMinDays", 1)));
  const rateChanged = JSON.stringify(zones.map((z) => [z.rate, z.minDays, z.maxDays, z.freeOver])) !== JSON.stringify(s.zones.map((z) => [z.rate, z.minDays, z.maxDays, z.freeOver]));
  await S.saveSettings({
    ...s, storeName: str(fd, "storeName") || s.storeName, vatPct: Math.max(0, num(fd, "vatPct", 5)), exportsZeroRated: fd.get("exportsZeroRated") === "on",
    defaultCommissionPct: Math.max(0, num(fd, "defaultCommissionPct")), defaultCustomerDiscountPct: Math.max(0, num(fd, "defaultCustomerDiscountPct")),
    minPayout: Math.max(0, num(fd, "minPayout", 100)), lowStockAt: Math.max(0, Math.floor(num(fd, "lowStockAt"))),
    processingMinDays: pmin, processingMaxDays: Math.max(pmin, Math.floor(num(fd, "processingMaxDays", 2))),
    blockedCountries: codes(str(fd, "blockedCountries")), zones,
    legal: {
      legalName: str(fd, "legalName"), tradeLicenceNo: str(fd, "tradeLicenceNo"), licensingAuthority: str(fd, "licensingAuthority"),
      vatTrn: str(fd, "vatTrn"), address: str(fd, "address"), email: str(fd, "email"), phone: str(fd, "phone"), jurisdiction: str(fd, "jurisdiction") || "Dubai",
    },
    confirmations: rateChanged ? { ...s.confirmations, shippingReviewedAt: undefined } : s.confirmations, // changed rates need re-confirming
  });
  revalidatePath("/", "layout");
}

/** One-click sign-offs on the launch checklist. Stored with a date so you can see when you confirmed it. */
export async function confirmItem(key: "policiesReviewedAt" | "shippingReviewedAt" | "cosmeticsCheckedAt" | "taxReviewedAt" | "copyReviewedAt", on: boolean) {
  await requireAdmin();
  const s = await S.getSettings();
  await S.saveSettings({ ...s, confirmations: { ...s.confirmations, [key]: on ? new Date().toISOString() : undefined } });
  revalidatePath("/admin", "layout");
}

/** Destination taxes. One form, one row per country. Changing any rate or collect flag clears the "taxes reviewed" tick. */
export async function saveTaxes(fd: FormData) {
  await requireAdmin();
  const s = await S.getSettings();
  const pct = (v: string) => { if (v.trim() === "") return null; const n = Number(v); return Number.isFinite(n) && n >= 0 && n <= 100 ? n : null; };
  const tax = { ...s.tax };
  for (const c of COUNTRY_LIST) {
    const cur = tax[c.code];
    tax[c.code] = { name: str(fd, `name_${c.code}`) || cur.name, rate: pct(str(fd, `rate_${c.code}`)), duty: pct(str(fd, `duty_${c.code}`)), collect: fd.get(`collect_${c.code}`) === "on", regNo: str(fd, `reg_${c.code}`) || undefined };
  }
  const changed = JSON.stringify(tax) !== JSON.stringify(s.tax);
  await S.saveSettings({ ...s, tax, confirmations: changed ? { ...s.confirmations, taxReviewedAt: undefined } : s.confirmations });
  revalidatePath("/", "layout");
}
export async function saveCurrencies(fd: FormData) {
  await requireAdmin();
  const s = await S.getSettings();
  const currencies = { ...s.currencies };
  for (const k of Object.keys(CURRENCIES)) { const n = Number(str(fd, `fx_${k}`)); if (k !== "AED" && Number.isFinite(n) && n > 0) currencies[k] = n; }
  await S.saveSettings({ ...s, currencies, currenciesUpdated: new Date().toISOString() });
  revalidatePath("/", "layout");
}
export const adminEmail = async () => ADMIN_EMAIL;
