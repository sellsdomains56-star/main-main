import "server-only";
import Stripe from "stripe";

export const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

/** "test" for sk_test_/rk_test_ keys, "live" for sk_live_/rk_live_ keys, null when Stripe is not configured. */
export const stripeMode: "test" | "live" | null = !process.env.STRIPE_SECRET_KEY ? null : /_test_/.test(process.env.STRIPE_SECRET_KEY) ? "test" : "live";
export const stripeWebhookReady = Boolean(process.env.STRIPE_WEBHOOK_SECRET);
