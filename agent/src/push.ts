import webpush from "web-push";
import { config } from "./config.js";
import { addPushSubscription, getSecretKV, listPushSubscriptions, removePushSubscription, setSecretKV } from "./db.js";
import { isUnlocked } from "./vault.js";

/**
 * Notifications on your phone and computer through Web Push, the browser's own
 * push system. The content is encrypted end to end between this server and your
 * device: the push services that deliver it (Apple, Google, Mozilla) can't read it.
 * On iPhone the app must be added to the Home Screen first (iOS 16.4 or later).
 */

export interface PushSubscriptionJSON {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

/** The server's VAPID key pair, made once and kept encrypted with your other secrets. */
function vapid(): { publicKey: string; privateKey: string } {
  const saved = getSecretKV("vapid");
  if (saved) return JSON.parse(saved) as { publicKey: string; privateKey: string };
  const keys = webpush.generateVAPIDKeys();
  setSecretKV("vapid", JSON.stringify(keys));
  return keys;
}

export function pushPublicKey(): string {
  return vapid().publicKey;
}

/** Who to contact about this server's pushes; push services require one. Apple refuses https://localhost. */
function subject(): string {
  if (process.env.PUSH_CONTACT?.trim()) return process.env.PUSH_CONTACT.trim();
  if (config.publicUrl.startsWith("https://") && !/localhost|127\.0\.0\.1/.test(config.publicUrl)) return config.publicUrl;
  return "mailto:dizz-lab@users.noreply.github.com";
}

export function subscribePush(sub: PushSubscriptionJSON, label: string): void {
  for (const existing of listPushSubscriptions()) if (existing.subscription.endpoint === sub.endpoint) removePushSubscription(existing.id);
  addPushSubscription(sub, label);
}

export function unsubscribePush(endpoint: string): boolean {
  const found = listPushSubscriptions().find((s) => s.subscription.endpoint === endpoint);
  if (found) removePushSubscription(found.id);
  return !!found;
}

export function pushDevices(): { id: string; label: string; createdAt: number }[] {
  return listPushSubscriptions().map(({ id, label, createdAt }) => ({ id, label, createdAt }));
}

/** Sends to every device that turned notifications on. Devices that unsubscribed are forgotten. */
export async function sendPush(payload: { title: string; body: string; url?: string; tag?: string }): Promise<{ sent: number; removed: number }> {
  if (!isUnlocked()) return { sent: 0, removed: 0 };
  const subs = listPushSubscriptions();
  if (!subs.length) return { sent: 0, removed: 0 };
  const keys = vapid();
  let sent = 0;
  let removed = 0;
  await Promise.all(
    subs.map(async (s) => {
      try {
        // web-push encrypts the message and signs the request; we send it ourselves.
        const request = webpush.generateRequestDetails(s.subscription, JSON.stringify(payload), {
          TTL: 24 * 3600,
          urgency: "high",
          vapidDetails: { subject: subject(), publicKey: keys.publicKey, privateKey: keys.privateKey },
        });
        const res = await fetch(request.endpoint, {
          method: request.method,
          headers: request.headers as Record<string, string>,
          body: request.body as Buffer<ArrayBuffer>,
          signal: AbortSignal.timeout(10_000),
        });
        if (res.ok) sent++;
        else if (res.status === 404 || res.status === 410) {
          removePushSubscription(s.id);
          removed++;
        } else console.warn("[dizz] push failed:", res.status, (await res.text()).slice(0, 200));
      } catch (err) {
        console.warn("[dizz] push failed:", err instanceof Error ? err.message : err);
      }
    }),
  );
  return { sent, removed };
}
