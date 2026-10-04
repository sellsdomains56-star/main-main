import { PaymentSheetError, useStripe } from "@stripe/stripe-react-native";
import * as Linking from "expo-linking";
import { useState } from "react";
import { Platform } from "react-native";
import { MERCHANT_COUNTRY } from "../lib/config";
import type { PayButtonProps } from "./PayButton.types";
import { Button, P } from "./ui";

/** iOS / Android: Stripe PaymentSheet with Apple Pay, Google Pay and cards. */
export function PayButton({ clientSecret, currency, amountLabel, onPaid }: PayButtonProps) {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pay() {
    setBusy(true);
    setError(null);
    try {
      const init = await initPaymentSheet({
        merchantDisplayName: "Always Fresh",
        paymentIntentClientSecret: clientSecret,
        applePay: { merchantCountryCode: MERCHANT_COUNTRY },
        googlePay: { merchantCountryCode: MERCHANT_COUNTRY, currencyCode: currency.toUpperCase(), testEnv: __DEV__ },
        returnURL: Linking.createURL("stripe-redirect"),
      });
      if (init.error) throw new Error(init.error.message);
      const result = await presentPaymentSheet();
      if (result.error) {
        if (result.error.code !== PaymentSheetError.Canceled) setError(result.error.message);
        return;
      }
      await onPaid();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Button
        title={`Pay ${amountLabel}`}
        icon={Platform.OS === "ios" ? "logo-apple" : "card"}
        onPress={pay}
        loading={busy}
      />
      <P muted style={{ fontSize: 12, marginTop: 8, textAlign: "center" }}>
        {Platform.OS === "ios" ? "Apple Pay" : "Google Pay"} or card · secured by Stripe
      </P>
      {error && <P style={{ color: "#D64545", marginTop: 8 }}>{error}</P>}
    </>
  );
}
