import { reply } from "./brain.js";
import { betweenMs, readDelayMs, sleep, toBubbles, typingDelayMs } from "./humanize.js";
import { dueNudges } from "./jobs.js";
import { getSpeed } from "./state.js";
import { getUpdates, sendText, sendTyping, type TgMessage } from "./telegram.js";

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) throw new Error("Set TELEGRAM_BOT_TOKEN (see .env.example)");
if (!process.env.ANTHROPIC_API_KEY) throw new Error("Set ANTHROPIC_API_KEY (see .env.example)");
const OWNER = process.env.OWNER_TELEGRAM_ID ? Number(process.env.OWNER_TELEGRAM_ID) : null;
let ownerChat: number | null = OWNER;

/** Say bubbles one by one with "typing…" in between, at the boss's chosen speed. */
async function say(chatId: number, text: string, incoming = ""): Promise<void> {
  const speed = getSpeed();
  await sleep(readDelayMs(incoming, speed));
  const bubbles = toBubbles(text);
  for (let i = 0; i < bubbles.length; i++) {
    const bubble = bubbles[i]!;
    const total = typingDelayMs(bubble, speed);
    for (let spent = 0; spent < total; spent += 4000) {
      await sendTyping(token!, chatId);
      await sleep(Math.min(4000, total - spent));
    }
    await sendText(token!, chatId, bubble);
    if (i < bubbles.length - 1) await sleep(betweenMs(speed));
  }
}

// One message at a time so replies never overlap.
let queue: Promise<void> = Promise.resolve();
function handle(msg: TgMessage): void {
  queue = queue.then(async () => {
    if (msg.chat.type !== "private" || !msg.from || msg.from.is_bot) return;
    if (OWNER == null) {
      console.log(`First message from Telegram user id ${msg.from.id}. Put OWNER_TELEGRAM_ID=${msg.from.id} in .env and restart.`);
      return;
    }
    if (msg.from.id !== OWNER) return; // Tim only talks to the boss in this version.
    ownerChat = msg.chat.id;
    if (!msg.text) {
      await say(msg.chat.id, "can't open that one bro, type it for me");
      return;
    }
    try {
      await say(msg.chat.id, await reply(msg.text), msg.text);
    } catch (err) {
      console.error("reply failed:", err);
      await say(msg.chat.id, "my signal's trash rn bro, say it again in a minute").catch(() => {});
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

console.log("Tim is up. Message him on Telegram.");
let offset = 0;
for (;;) {
  try {
    for (const u of await getUpdates(token, offset)) {
      offset = u.update_id + 1;
      if (u.message) handle(u.message);
    }
  } catch (err) {
    console.error("polling error:", (err as Error).message);
    await sleep(3000);
  }
}
