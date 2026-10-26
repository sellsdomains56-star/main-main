import { sendMessage } from "./agent/chat.js";
import { config } from "./config.js";
import { addMessage, createConversation, dueReminders, getConversation, rescheduleReminder } from "./db.js";
import { broadcast, notify } from "./events.js";
import { isRunning } from "./runs.js";
import { nextOccurrence } from "./tools/schedule.js";
import type { Reminder } from "./types.js";
import { isUnlocked } from "./vault.js";
import { tr } from "./i18n.js";

/** Fires due reminders: a ping for plain ones, a full agent run for tasks. */
export async function fireReminder(reminder: Reminder, now = Date.now()): Promise<void> {
  let conversationId = reminder.conversationId && getConversation(reminder.conversationId) ? reminder.conversationId : null;
  // Wait for a reply that's still being written in that chat; we'll try again on the next tick.
  if (conversationId && isRunning(conversationId)) return;
  if (!conversationId) conversationId = createConversation(reminder.task ? `⏰ ${reminder.message}` : tr("Reminders", "التذكيرات")).id;

  rescheduleReminder(reminder.id, nextOccurrence(reminder.nextRun, reminder.repeat, now), now);

  if (!reminder.task) {
    addMessage(conversationId, "assistant", { text: tr(`⏰ **Reminder:** ${reminder.message}`, `⏰ **تذكير:** ${reminder.message}`), provider: "system", status: "complete" });
    broadcast({ type: "conversation", conversationId, running: false });
    await notify(tr("⏰ Reminder", "⏰ تذكير"), reminder.message, conversationId);
    return;
  }

  // The task runs in the background; the notification goes out when the reply is done.
  const run = sendMessage({ conversationId, text: reminder.task, scheduled: true });
  run.subscribe((event) => {
    if (event.type !== "done") return;
    const text = event.message.text.replace(/[#*_`>]/g, "").replace(/\s+/g, " ").trim();
    const title = event.message.status === "complete" ? `✅ ${reminder.message}` : `⚠️ ${reminder.message}`;
    void notify(title, text.slice(0, 300) || event.message.error || tr("Open the chat for details.", "افتح المحادثة للتفاصيل."), conversationId);
  });
}

let timer: NodeJS.Timeout | null = null;
let ticking = false;

export async function tick(now = Date.now()): Promise<void> {
  // After a restart the data stays locked until you sign in; reminders that came due meanwhile fire then.
  if (ticking || !isUnlocked()) return;
  ticking = true;
  try {
    for (const reminder of dueReminders(now)) {
      try {
        await fireReminder(reminder, now);
      } catch (err) {
        console.error(`[dizz] reminder ${reminder.id} failed:`, err);
      }
    }
  } finally {
    ticking = false;
  }
}

export function startScheduler(): void {
  if (timer) return;
  timer = setInterval(() => void tick(), 15_000);
  void tick();
  console.log(`[dizz] scheduler running (${config.timezone})`);
}

export function stopScheduler(): void {
  if (timer) clearInterval(timer);
  timer = null;
}
