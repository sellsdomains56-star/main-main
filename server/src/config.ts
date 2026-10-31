import { randomBytes } from "node:crypto";
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
  // The team: anyone who signs in with one of these emails gets the admin panel.
  adminEmails: (process.env.ADMIN_EMAILS ?? "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean),
  // New barbers wait for the team's approval before they appear (switchable in the admin panel).
  reviewNewBarbers: process.env.REVIEW_NEW_BARBERS ? process.env.REVIEW_NEW_BARBERS === "true" : process.env.NODE_ENV !== "test",
  // Sample logins and bookings for trying the barber side and the admin panel. Never in production.
  demoAccounts: process.env.DEMO_ACCOUNTS === "1",
  // Email (receipts, password reset, your data) through Resend; without a key emails are only logged.
  resendApiKey: process.env.RESEND_API_KEY || undefined,
  emailFrom: process.env.EMAIL_FROM || "Always Fresh <hello@alwaysfresh.app>",
  // WhatsApp updates (Meta WhatsApp Cloud API): token, the business phone number's id and an approved template.
  whatsappToken: process.env.WHATSAPP_TOKEN || undefined,
  whatsappPhoneId: process.env.WHATSAPP_PHONE_ID || undefined,
  whatsappTemplate: process.env.WHATSAPP_TEMPLATE || "jb_update",
  whatsappLanguage: process.env.WHATSAPP_LANGUAGE || "en",
  // Where links in emails open (the website), e.g. https://alwaysfresh.app
  appUrl: (process.env.APP_URL || "http://localhost:8081").replace(/\/$/, ""),
  // On tax invoices and receipts. VAT_TRN is the company's UAE tax registration number; without it receipts carry no VAT line.
  companyName: process.env.COMPANY_LEGAL_NAME || "Always Fresh",
  companyAddress: process.env.COMPANY_ADDRESS || "Dubai, United Arab Emirates",
  vatTrn: process.env.VAT_TRN || undefined,
  vatPercent: Number(process.env.VAT_PERCENT ?? 5), // UAE standard rate, applied to AED prices (which include VAT)
  // Postgres: when set, all data is kept in the database instead of server/data/db.json.
  databaseUrl: process.env.DATABASE_URL || undefined,
  // Signs the short-lived links to barbers' ID documents. Without it a new key is made at each start (old links stop working).
  fileUrlSecret: process.env.FILE_URL_SECRET || randomBytes(32).toString("hex"),
};
