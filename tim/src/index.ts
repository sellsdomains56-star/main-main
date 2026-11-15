import { reply } from "./brain.js";
import { betweenMs, readDelayMs, sleep, toBubbles, typingDelayMs } from "./humanize.js";
import { dueNudges } from "./jobs.js";
import { getSpeed } from "./state.js";
import { accountTransport, botTransport, type Incoming } from "./transport.js";

const session = process.env.TELEGRAM_SESSION;
const token = process.env.TELEGRAM_BOT_TOKEN;
if (!session && !token) throw new Error("Set TELEGRAM_SESSION (real account, run `npm run login`) or TELEGRAM_BOT_TOKEN (bot). See .env.example.");
const tg = session
  ? accountTransport(Number(process.env.TELEGRAM_API_ID), process.env.TELEGRAM_API_HASH ?? "", session)
  : botTransport(token!);
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
