import { readFileSync } from "node:fs";

// Minimal .env loader so the server runs with `npm start` and no extra deps.
try {
  for (const line of readFileSync(new URL("../.env", import.meta.url), "utf8").split("\n")) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (match && process.env[match[1]] === undefined) process.env[match[1]] = match[2];
  }
} catch {
  // no .env file — rely on the real environment
}

export const config = {
  port: Number(process.env.PORT ?? 4000),
  corsOrigin: process.env.CORS_ORIGIN ?? "*",
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || undefined,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || undefined,
  platformFeePercent: Number(process.env.PLATFORM_FEE_PERCENT ?? 10),
  anthropicConfigured: Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN),
  // AI Try-On previews (OpenAI image editing)
  openaiConfigured: Boolean(process.env.OPENAI_API_KEY),
  openaiImageModel: process.env.OPENAI_IMAGE_MODEL || "gpt-image-2",
  tryOnDailyLimit: Number(process.env.TRYON_DAILY_LIMIT ?? 20),
  // Push notifications go through Expo's push service; an access token is optional (enable "enhanced security" in Expo).
  pushEnabled: process.env.NODE_ENV !== "test",
  expoAccessToken: process.env.EXPO_ACCESS_TOKEN || undefined,
  // Sign in with Apple: the app's bundle ID (iOS) plus an optional Services ID for the website.
  appleAudiences: [process.env.APPLE_BUNDLE_ID || "com.alwaysfresh.app", process.env.APPLE_SERVICE_ID].filter((a): a is string => !!a),
  // Sign in with Google: OAuth client IDs (web, iOS, Android), comma-separated.
  googleClientIds: (process.env.GOOGLE_CLIENT_IDS ?? "").split(",").map((s) => s.trim()).filter(Boolean),
};
