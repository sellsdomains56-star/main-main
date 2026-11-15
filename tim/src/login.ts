// Run this yourself, on your own machine: `npm run login`.
// It asks for the phone number of Tim's account and the code Telegram sends to it,
// then prints a session string to paste into .env as TELEGRAM_SESSION.
// The number and the code never leave your machine except to Telegram itself.
import { createInterface } from "node:readline/promises";
import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";

const apiId = Number(process.env.TELEGRAM_API_ID);
const apiHash = process.env.TELEGRAM_API_HASH;
if (!apiId || !apiHash) throw new Error("Set TELEGRAM_API_ID and TELEGRAM_API_HASH in .env first (from https://my.telegram.org, API development tools).");

const rl = createInterface({ input: process.stdin, output: process.stdout });
const ask = (q: string) => rl.question(q);
const client = new TelegramClient(new StringSession(""), apiId, apiHash, { connectionRetries: 5 });
await client.start({
  phoneNumber: () => ask("Tim's phone number (with country code): "),
  phoneCode: () => ask("Code Telegram sent: "),
  password: () => ask("Two-step password (if you set one): "),
  onError: (e) => console.error(e.message),
});
console.log("\nLogged in. Put this line in .env (keep it secret: it is full access to the account):\n");
console.log(`TELEGRAM_SESSION=${client.session.save()}\n`);
rl.close();
await client.disconnect();
process.exit(0);
