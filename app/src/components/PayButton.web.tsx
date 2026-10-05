import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js/pure"; // loads Stripe only when a payment needs it
import { useState } from "react";
import { STRIPE_PUBLISHABLE_KEY } from "../lib/config";
import type { PayButtonProps } from "./PayButton.types";
import { colors } from "./theme";
import { Button, T } from "./ui";

const stripePromise = STRIPE_PUBLISHABLE_KEY ? loadStripe(STRIPE_PUBLISHABLE_KEY) : null;

/**
 * Website: Stripe Payment Element. Shows Apple Pay in Safari and Google Pay in Chrome
 * (once your domain is registered in the Stripe dashboard), plus cards and local methods.
 */
export function PayButton(props: PayButtonProps) {
  return (
    <Elements
      stripe={stripePromise}
      options={{ clientSecret: props.clientSecret, appearance: { theme: "night", variables: { colorPrimary: colors.gold, colorBackground: colors.surface, colorText: colors.text, borderRadius: "12px" } } }}
    >
      <Checkout {...props} />
    </Elements>
  );
}

function Checkout({ amountLabel, onPaid }: PayButtonProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pay() {
    if (!stripe || !elements) return;
    setBusy(true);
    setError(null);
    const result = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
      confirmParams: { return_url: window.location.href },
    });
    if (result.error) {
      setError(result.error.message ?? "Payment failed.");
      setBusy(false);
      return;
    }
    try {
      await onPaid();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <PaymentElement options={{ layout: "tabs", wallets: { applePay: "auto", googlePay: "auto" } }} />
      </div>
      <Button title={`Pay ${amountLabel}`} icon="lock-closed" onPress={pay} loading={busy} disabled={!stripe} />
      {error && <T variant="caption" color="#E5484D" style={{ marginTop: 8 }}>{error}</T>}
    </>
  );
}
