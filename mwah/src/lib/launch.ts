import "server-only";
import { usingSupabase } from "./db";
import { stripe, stripeMode, stripeWebhookReady } from "./stripe";
import { missingLegal } from "./legal";
import { allProducts, getSettings } from "./store";

export type Check = { id: string; group: string; title: string; ok: boolean; detail: string; fix?: { href?: string; confirm?: "policiesReviewedAt" | "shippingReviewedAt" | "cosmeticsCheckedAt" | "taxReviewedAt" | "copyReviewedAt" } };

/** Everything that has to be true before real customers pay. Computed from live config, so it can't drift from reality. */
export async function launchChecks(): Promise<Check[]> {
  const [s, products] = await Promise.all([getSettings(), allProducts()]);
  const prod = process.env.NODE_ENV === "production";
  const missing = missingLegal(s.legal);
  const noPhoto = products.filter((p) => p.status === "active" && p.images.length === 0).length;
  const sampleCopy = products.filter((p) => p.status === "active" && p.ingredients === "Shea butter, jojoba oil, beeswax, vitamin E, natural flavour.").length;
  const ck = (id: string, group: string, title: string, ok: boolean, detail: string, fix?: Check["fix"]): Check => ({ id, group, title, ok, detail, fix });
  return [
    ck("stripe-key", "Payments", "Stripe secret key", Boolean(stripe), stripe ? "Connected." : "Not set. Orders are created in test mode and nobody is charged.", { href: "/admin/launch" }),
    ck("stripe-live", "Payments", "Stripe is in live mode", stripeMode === "live", stripeMode === "live" ? "Live keys in use." : stripeMode === "test" ? "Test keys. Fine while testing, switch to live keys to launch." : "Not connected."),
    ck("stripe-hook", "Payments", "Stripe webhook", stripeWebhookReady, stripeWebhookReady ? "Signing secret set." : "Add STRIPE_WEBHOOK_SECRET. Events: checkout.session.completed and charge.refunded."),
    ck("db", "Hosting", "Database (Supabase)", usingSupabase, usingSupabase ? "Connected." : "Using the local demo file. Orders would be lost on a normal host."),
    ck("secrets", "Hosting", "Admin password & session secret", !prod || Boolean(process.env.ADMIN_PASSWORD && process.env.SESSION_SECRET), prod ? "Set." : "Only enforced on the live site (dev uses a built-in password)."),
    ck("site", "Hosting", "Site address (SITE_URL)", Boolean(process.env.SITE_URL), process.env.SITE_URL ?? "Set SITE_URL to your https address so Stripe returns customers correctly."),
    ck("legal", "Legal", "Business details filled in", missing.length === 0, missing.length ? `Missing: ${missing.join(", ")}.` : "Complete.", { href: "/admin/settings" }),
    ck("policies", "Legal", "A lawyer has reviewed the policies", Boolean(s.confirmations.policiesReviewedAt), s.confirmations.policiesReviewedAt ? `Confirmed ${new Date(s.confirmations.policiesReviewedAt).toLocaleDateString("en")}.` : "The policy pages are well-structured drafts, not legal advice. Have a UAE lawyer review them and your target markets.", { confirm: "policiesReviewedAt" }),
    ck("cosmetics", "Legal", "Cosmetics compliance checked", Boolean(s.confirmations.cosmeticsCheckedAt), s.confirmations.cosmeticsCheckedAt ? `Confirmed ${new Date(s.confirmations.cosmeticsCheckedAt).toLocaleDateString("en")}.` : "Lip balm is a regulated cosmetic. Confirm UAE product registration, safety assessment and labelling, plus each export market's rules (EU/UK responsible person and notification, US FDA registration and listing, etc.).", { confirm: "cosmeticsCheckedAt" }),
    ck("tax", "Tax", "Destination taxes reviewed", Boolean(s.confirmations.taxReviewedAt), s.confirmations.taxReviewedAt ? `Confirmed ${new Date(s.confirmations.taxReviewedAt).toLocaleDateString("en")}.` : `Check the rate for every country you sell to and decide where to collect VAT/GST at checkout (${Object.values(s.tax).filter((t) => t.collect).length} set to collect). Only collect where you are registered. Changing a rate clears this tick.`, { confirm: "taxReviewedAt", href: "/admin/taxes" }),
    ck("shipping", "Shipping", "Rates & times confirmed with your courier", Boolean(s.confirmations.shippingReviewedAt), s.confirmations.shippingReviewedAt ? `Confirmed ${new Date(s.confirmations.shippingReviewedAt).toLocaleDateString("en")}.` : "The defaults are planning estimates. Compare each zone with real quotes (Aramex, DHL, FedEx, Emirates Post) and adjust. Changing rates clears this tick.", { confirm: "shippingReviewedAt" }),
    ck("copy", "Products", "Product descriptions match your real products", Boolean(s.confirmations.copyReviewedAt), s.confirmations.copyReviewedAt ? `Confirmed ${new Date(s.confirmations.copyReviewedAt).toLocaleDateString("en")}.` : "The descriptions, flavour notes, benefits and About page are sample copy. Rewrite them to match your real formula and make sure every claim (ingredients, finish, tint, where it is made) is true and provable.", { confirm: "copyReviewedAt", href: "/admin/products" }),
    ck("photos", "Products", "Real product photos", noPhoto === 0 && products.length > 0, noPhoto ? `${noPhoto} active product(s) still use the illustrated tube.` : "All active products have photos.", { href: "/admin/products" }),
    ck("ingredients", "Products", "Real ingredient lists", sampleCopy === 0, sampleCopy ? `${sampleCopy} product(s) still carry the sample ingredient text. Customers rely on this for allergies.` : "Edited.", { href: "/admin/products" }),
  ];
}
