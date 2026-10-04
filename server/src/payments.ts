import Stripe from "stripe";
import { config } from "./config.js";

// Stripe handles cards, Apple Pay and Google Pay through the same PaymentIntent:
// the mobile PaymentSheet and the web Payment Element both show the wallets
// automatically when the device and Stripe account support them.
export const stripe = config.stripeSecretKey ? new Stripe(config.stripeSecretKey) : undefined;

export const demoPayments = !stripe;

/** One PaymentIntent per booking or shop order; `ref` is e.g. "booking-<id>" or "order-<id>". */
export async function createPaymentIntent(
  ref: string,
  amount: number,
  currency: string,
  metadata: Record<string, string>,
): Promise<{ clientSecret: string; id: string } | null> {
  if (!stripe) return null;
  const intent = await stripe.paymentIntents.create(
    { amount, currency, automatic_payment_methods: { enabled: true }, metadata },
    { idempotencyKey: ref },
  );
  return { clientSecret: intent.client_secret!, id: intent.id };
}

export async function clientSecretFor(paymentIntentId: string): Promise<string | null> {
  if (!stripe) return null;
  return (await stripe.paymentIntents.retrieve(paymentIntentId)).client_secret;
}

export async function paymentSucceeded(paymentIntentId: string): Promise<boolean> {
  if (!stripe) return false;
  const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
  return intent.status === "succeeded";
}

export async function refund(paymentIntentId: string): Promise<void> {
  if (!stripe) return;
  await stripe.refunds.create({ payment_intent: paymentIntentId });
}
