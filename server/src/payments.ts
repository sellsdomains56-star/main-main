import Stripe from "stripe";
import { config } from "./config.js";
import type { Booking } from "./types.js";

// Stripe handles cards, Apple Pay and Google Pay through the same PaymentIntent:
// the mobile PaymentSheet and the web Payment Element both show the wallets
// automatically when the device and Stripe account support them.
export const stripe = config.stripeSecretKey ? new Stripe(config.stripeSecretKey) : undefined;

export const demoPayments = !stripe;

export async function createPaymentIntent(booking: Booking): Promise<{ clientSecret: string; id: string } | null> {
  if (!stripe) return null;
  const intent = await stripe.paymentIntents.create(
    {
      amount: booking.amount,
      currency: booking.currency,
      automatic_payment_methods: { enabled: true },
      metadata: {
        bookingId: booking.id,
        barberId: booking.barberId,
        platformFee: String(Math.round((booking.amount * config.platformFeePercent) / 100)),
      },
    },
    { idempotencyKey: `booking-${booking.id}` },
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
