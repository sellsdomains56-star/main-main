import { config } from "./config.js";
import { createApp } from "./app.js";
import { startReminderLoop } from "./notify.js";
import { startPerksLoop } from "./rewards.js";
import { demoPayments } from "./payments.js";
import { seedDemoAccounts } from "./demoAccounts.js";
import { connectDatabase, flush } from "./db.js";

if (await connectDatabase()) console.log("Data is kept in Postgres (DATABASE_URL).");
if (config.demoAccounts) seedDemoAccounts(); // sample logins for the barber side and the admin panel

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    void flush().finally(() => process.exit(0));
  });
}

createApp().listen(config.port, () => {
  console.log(`Always Fresh API listening on http://localhost:${config.port}`);
  if (demoPayments) console.log("STRIPE_SECRET_KEY not set — payments run in demo mode.");
  if (!config.anthropicConfigured) console.log("ANTHROPIC_API_KEY not set — AI stylist disabled.");
  if (!config.adminEmails.length && !config.demoAccounts) console.log("ADMIN_EMAILS not set — nobody can open the admin panel.");
});
startReminderLoop(); // "tomorrow" and "in 1 hour" alerts
startPerksLoop(); // "time for your next cut" and birthday treats
