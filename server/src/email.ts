import { config } from "./config.js";
import { db, newId, save } from "./db.js";

export interface Email {
  to: string;
  subject: string;
  text: string;
  attachments?: { filename: string; content: string }[]; // content: base64
}

const KEEP = 200;

/**
 * Sends an email through Resend when RESEND_API_KEY is set (EMAIL_FROM is the sender, on a domain
 * verified in Resend). Without a key the email is only logged, so sign-up and booking still work.
 * Every email is also kept in a short outbox the team can see while setting this up.
 */
export async function sendEmail(email: Email): Promise<boolean> {
  db.outbox.push({ id: newId(), to: email.to, subject: email.subject, text: email.text, sentAt: new Date().toISOString(), delivered: false });
  if (db.outbox.length > KEEP) db.outbox = db.outbox.slice(-KEEP);
  save();
  if (!config.resendApiKey) {
    if (process.env.NODE_ENV !== "test") console.log(`[email not sent — set RESEND_API_KEY] to ${email.to}: ${email.subject}`);
    return false;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { authorization: `Bearer ${config.resendApiKey}`, "content-type": "application/json" },
      body: JSON.stringify({ from: config.emailFrom, to: [email.to], subject: email.subject, text: email.text, attachments: email.attachments }),
    });
    if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
    db.outbox[db.outbox.length - 1]!.delivered = true;
    save();
    return true;
  } catch (err) {
    console.warn("Email failed:", (err as Error).message);
    return false;
  }
}

/** A plain, readable email body: greeting, lines, sign-off. */
export function letter(name: string, lines: string[]) {
  return [`Hi ${name.split(" ")[0]},`, "", ...lines, "", "Stay fresh,", "JB Always Fresh"].join("\n");
}
