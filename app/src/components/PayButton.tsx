import { PaymentSheetError, PlatformPay, PlatformPayButton, PlatformPayError, usePlatformPay, useStripe } from "@stripe/stripe-react-native";
import * as Linking from "expo-linking";
import { useEffect, useState } from "react";
import { Platform, View } from "react-native";
import { APP_NAME, MERCHANT_COUNTRY } from "../lib/config";
import type { PayButtonProps } from "./PayButton.types";
import { Button, T } from "./ui";

/**
 * iOS / Android: the native "Book with Apple Pay" (or Google Pay) button first, then
 * Stripe's PaymentSheet for cards and other wallets.
 */
export function PayButton({ clientSecret, currency, amount, amountLabel, label, onPaid }: PayButtonProps) {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const { isPlatformPaySupported, confirmPlatformPayPayment } = usePlatformPay();
  const [walletReady, setWalletReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    isPlatformPaySupported({ googlePay: { testEnv: __DEV__ } }).then(setWalletReady, () => setWalletReady(false));
  }, [isPlatformPaySupported]);

  async function payWithWallet() {
    setBusy(true);
    setError(null);
    try {
      const major = (amount / 100).toFixed(2); // Apple Pay wants a decimal string
      const result = await confirmPlatformPayPayment(clientSecret, {
        applePay: {
          cartItems: [{ label: `${APP_NAME} · ${label}`, amount: major, paymentType: PlatformPay.PaymentType.Immediate }],
          merchantCountryCode: MERCHANT_COUNTRY,
          currencyCode: currency.toUpperCase(),
        },
        googlePay: { testEnv: __DEV__, merchantName: APP_NAME, merchantCountryCode: MERCHANT_COUNTRY, currencyCode: currency.toUpperCase() },
      });
      if (result.error) {
        if (result.error.code !== PlatformPayError.Canceled) setError(result.error.message);
        return;
      }
      await onPaid();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function payWithSheet() {
    setBusy(true);
    setError(null);
    try {
      const init = await initPaymentSheet({
        merchantDisplayName: APP_NAME,
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
    <View>
      {walletReady && (
        <PlatformPayButton
          type={PlatformPay.ButtonType.Book}
          appearance={PlatformPay.ButtonStyle.Black}
          borderRadius={27}
          disabled={busy}
          onPress={payWithWallet}
          style={{ width: "100%", height: 54, marginBottom: 12 }}
        />
      )}
      <Button
        title={walletReady ? "Other ways to pay" : `Pay ${amountLabel}`}
        variant={walletReady ? "secondary" : "primary"}
        icon={walletReady ? "card-outline" : "lock-closed"}
        onPress={payWithSheet}
        loading={busy && !walletReady}
        disabled={busy}
      />
      <T variant="small" muted center style={{ marginTop: 10 }}>
        {Platform.OS === "ios" ? "Apple Pay" : "Google Pay"}, cards and more · secured by Stripe
      </T>
      {error && <T variant="caption" color="#B42318" style={{ marginTop: 8 }}>{error}</T>}
    </View>
  );
}
