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
};
