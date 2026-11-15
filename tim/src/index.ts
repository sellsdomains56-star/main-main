import { reply } from "./brain.js";
import { betweenMs, readDelayMs, sleep, toBubbles, typingDelayMs } from "./humanize.js";
import { dueNudges } from "./jobs.js";
import { getSpeed } from "./state.js";
import { readText, writeText } from "./store.js";
import { accountTransport, botTransport, type Incoming } from "./transport.js";
import { loginViaWeb } from "./weblogin.js";

const apiId = Number(process.env.TELEGRAM_API_ID);
const apiHash = process.env.TELEGRAM_API_HASH ?? "";
const token = process.env.TELEGRAM_BOT_TOKEN;
let session = process.env.TELEGRAM_SESSION?.trim() || readText("session.txt").trim();

if (apiId && apiHash && !session) {
  const pagePassword = process.env.LOGIN_PAGE_PASSWORD;
  if (!pagePassword) throw new Error("Tim isn't logged in yet. Set LOGIN_PAGE_PASSWORD to use the phone login page, or run `npm run login`.");
  session = await loginViaWeb({ port: Number(process.env.PORT ?? 3000), apiId, apiHash, pagePassword });
  writeText("session.txt", session); // keep it on the data volume so restarts stay logged in
}
if (!session && !token) throw new Error("Set TELEGRAM_API_ID + TELEGRAM_API_HASH (real account) or TELEGRAM_BOT_TOKEN (bot). See .env.example.");
const tg = session ? accountTransport(apiId, apiHash, session) : botTransport(token!);
if (!process.env.ANTHROPIC_API_KEY) throw new Error("Set ANTHROPIC_API_KEY (see .env.example)");
const OWNER = process.env.OWNER_TELEGRAM_ID ? Number(process.env.OWNER_TELEGRAM_ID) : null;
let ownerChat: number | null = OWNER; // in this version the chat id is just the boss's user id

/** Say bubbles one by one with "typing…" in between, at the boss's chosen speed. */
async function say(chatId: number, text: string, incoming = ""): Promise<void> {
  const speed = getSpeed();
  await sleep(readDelayMs(incoming, speed));
  const bubbles = toBubbles(text);
  for (let i = 0; i < bubbles.length; i++) {
    const bubble = bubbles[i]!;
    const total = typingDelayMs(bubble, speed);
    for (let spent = 0; spent < total; spent += 4000) {
      await tg.typing(chatId);
      await sleep(Math.min(4000, total - spent));
    }
    await tg.send(chatId, bubble);
    if (i < bubbles.length - 1) await sleep(betweenMs(speed));
  }
}

// One message at a time so replies never overlap.
let queue: Promise<void> = Promise.resolve();
function handle(msg: Incoming): void {
  queue = queue.then(async () => {
    if (!msg.isPrivate) return;
    if (OWNER == null) {
      console.log(`First message from Telegram user id ${msg.senderId}. Put OWNER_TELEGRAM_ID=${msg.senderId} in .env and restart.`);
      return;
    }
    if (msg.senderId !== OWNER) return; // Tim only talks to the boss in this version.
    ownerChat = msg.senderId;
    if (!msg.text) {
      await say(msg.senderId, "can't open that one bro, type it for me");
      return;
    }
    try {
      await say(msg.senderId, await reply(msg.text), msg.text);
    } catch (err) {
      console.error("reply failed:", err);
      await say(msg.senderId, "my signal's trash rn bro, say it again in a minute").catch(() => {});
    }
  });
}

// Reminders and unpaid-job nudges, once a minute.
setInterval(() => {
  if (ownerChat == null) return;
  const nudges = dueNudges();
  if (!nudges.length) return;
  queue = queue.then(async () => {
    try {
      const text = await reply(`[system note, not from the boss: bring this up with him naturally in your own words, one or two short lines. ${nudges.join("; ")}]`);
      await say(ownerChat!, text);
    } catch (err) {
      console.error("nudge failed:", err);
    }
  });
}, 60_000);

console.log("Tim is starting…");
await tg.start(handle);
