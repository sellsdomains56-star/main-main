"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ADMIN_EMAIL, hashPassword, loginAdmin, logout, randomPassword, requireAdmin } from "@/lib/auth";
import { uid } from "@/lib/db";
import * as S from "@/lib/store";
import type { OrderStatus, Product, ShippingZone } from "@/lib/types";

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
export async function saveSettings(fd: FormData) {
  await requireAdmin();
  const s = await S.getSettings();
  const zones: ShippingZone[] = s.zones.map((z) => ({
    ...z, rate: Math.max(0, num(fd, `rate_${z.id}`)), days: str(fd, `days_${z.id}`) || z.days,
    freeOver: str(fd, `free_${z.id}`) === "" ? undefined : Math.max(0, num(fd, `free_${z.id}`)),
    countries: z.id === "world" ? ["*"] : str(fd, `countries_${z.id}`).toUpperCase().split(/[\s,]+/).filter(Boolean),
  }));
  await S.saveSettings({
    ...s, storeName: str(fd, "storeName") || s.storeName, vatPct: Math.max(0, num(fd, "vatPct", 5)), exportsZeroRated: fd.get("exportsZeroRated") === "on",
    defaultCommissionPct: Math.max(0, num(fd, "defaultCommissionPct")), defaultCustomerDiscountPct: Math.max(0, num(fd, "defaultCustomerDiscountPct")),
    lowStockAt: Math.max(0, Math.floor(num(fd, "lowStockAt"))), zones,
  });
  revalidatePath("/", "layout");
}
export const adminEmail = async () => ADMIN_EMAIL;
