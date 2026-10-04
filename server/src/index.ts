import { config } from "./config.js";
import { createApp } from "./app.js";
import { demoPayments } from "./payments.js";

createApp().listen(config.port, () => {
  console.log(`GP Always Fresh API listening on http://localhost:${config.port}`);
  if (demoPayments) console.log("STRIPE_SECRET_KEY not set — payments run in demo mode.");
  if (!config.anthropicConfigured) console.log("ANTHROPIC_API_KEY not set — AI stylist disabled.");
});
