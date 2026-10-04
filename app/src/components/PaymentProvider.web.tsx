import type { ReactElement } from "react";

// On the web, Stripe Elements are mounted per payment inside PayButton.web.tsx.
export function PaymentProvider({ children }: { children: ReactElement }) {
  return children;
}
