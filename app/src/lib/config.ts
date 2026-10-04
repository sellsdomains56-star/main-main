export const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4000").replace(/\/$/, "");
export const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";
export const APPLE_MERCHANT_ID = "merchant.com.alwaysfresh.app";
// Country your Stripe account is registered in (needed by Apple Pay / Google Pay).
export const MERCHANT_COUNTRY = process.env.EXPO_PUBLIC_MERCHANT_COUNTRY ?? "DE";

// Brand name shown throughout the app — change it here.
export const APP_NAME = "GP Always Fresh";
export const SHOP_NAME = "GP's Fresh";
