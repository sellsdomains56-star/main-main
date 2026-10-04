import { StripeProvider } from "@stripe/stripe-react-native";
import * as Linking from "expo-linking";
import type { ReactElement } from "react";
import { APPLE_MERCHANT_ID, STRIPE_PUBLISHABLE_KEY } from "../lib/config";

export function PaymentProvider({ children }: { children: ReactElement }) {
  if (!STRIPE_PUBLISHABLE_KEY) return children;
  return (
    <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY} merchantIdentifier={APPLE_MERCHANT_ID} urlScheme={Linking.createURL("/").split(":")[0]}>
      {children}
    </StripeProvider>
  );
}
