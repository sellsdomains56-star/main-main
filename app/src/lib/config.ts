/** Set only by the self-contained demo page (scripts/build-demo-page.mjs). */
export const DEMO_DATA = (globalThis as { __AF_DEMO__?: import("./demo/server").DemoData }).__AF_DEMO__;

export const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4000").replace(/\/$/, "");

/** Media paths from the API (/media/..., /uploads/...) become loadable URLs. */
export function resolveMedia(path: string | null | undefined): string | null {
  if (!path) return null;
  if (/^(https?|data|blob):/.test(path)) return path;
  if (DEMO_DATA) return DEMO_DATA.media[path] ?? null;
  return API_URL + path;
}
// Sign in with Google: OAuth client IDs from Google Cloud Console (one per platform).
export const GOOGLE_CLIENT_IDS = {
  web: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? "",
  ios: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? "",
  android: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ?? "",
};

export const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";
export const APPLE_MERCHANT_ID = "merchant.com.alwaysfresh.app";
// Country your Stripe account is registered in (needed by Apple Pay / Google Pay).
export const MERCHANT_COUNTRY = process.env.EXPO_PUBLIC_MERCHANT_COUNTRY ?? "DE";

// Brand name shown throughout the app — change it here.
export const APP_NAME = "JB Always Fresh";
export const SHOP_NAME = "JB's Fresh";
