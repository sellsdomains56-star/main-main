import { config } from "./config.js";
import { db } from "./db.js";
import type { AppNotification } from "./types.js";

/** Alerts that also go to WhatsApp for people who switched it on (Account → WhatsApp updates). */
const BY_WHATSAPP = new Set<AppNotification["kind"]>(["booking_confirmed", "reminder", "on_the_way", "cancelled"]);

/** Turns "+971 50 123 4567" into "971501234567", the form WhatsApp wants. */
export const waNumber = (phone: string) => phone.replace(/[^\d]/g, "").replace(/^00/, "");

/**
 * Sends one alert as a WhatsApp message through Meta's WhatsApp Cloud API.
 * Messages a business starts must use an approved template: WHATSAPP_TEMPLATE is a utility
 * template with two body variables ({{1}} the title, {{2}} the text). Without the settings it does nothing.
 */
export async function sendWhatsApp(userId: string, item: Pick<AppNotification, "kind" | "title" | "body">) {
  const user = db.users.find((u) => u.id === userId);
  if (!config.whatsappToken || !config.whatsappPhoneId || !user?.whatsapp || !user.phone || !BY_WHATSAPP.has(item.kind)) return false;
  try {
    const res = await fetch(`https://graph.facebook.com/v21.0/${config.whatsappPhoneId}/messages`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${config.whatsappToken}` },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: waNumber(user.phone),
        type: "template",
        template: {
          name: config.whatsappTemplate,
          language: { code: config.whatsappLanguage },
          components: [{ type: "body", parameters: [{ type: "text", text: item.title.slice(0, 60) }, { type: "text", text: item.body.slice(0, 900) }] }],
        },
      }),
    });
    if (!res.ok) console.warn("WhatsApp send failed:", res.status, await res.text().catch(() => ""));
    return res.ok;
  } catch (e) {
    console.warn("WhatsApp send failed:", (e as Error).message);
    return false;
  }
}
