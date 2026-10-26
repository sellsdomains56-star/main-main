import { config } from "./config.js";
import { sendPush } from "./push.js";

/** App-wide events for open browser tabs: reminders firing, chats changing in the background. */
export type AppEvent =
  | { type: "notification"; title: string; body: string; conversationId: string | null }
  | { type: "conversation"; conversationId: string; running: boolean };

type Listener = (event: AppEvent) => void;
const listeners = new Set<Listener>();

export function onAppEvent(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function broadcast(event: AppEvent): void {
  for (const l of listeners) l(event);
}

/** Tells open tabs, your devices through Web Push, and your phone through ntfy if it's set up. */
export async function notify(title: string, body: string, conversationId: string | null): Promise<void> {
  broadcast({ type: "notification", title, body, conversationId });
  // Web Push content is end-to-end encrypted to your device, so the text can go in it.
  void sendPush({ title, body: body.slice(0, 1000), url: conversationId ? `/#/c/${conversationId}` : "/", tag: conversationId ?? undefined }).catch((err) =>
    console.warn("[dizz] push failed:", err instanceof Error ? err.message : err),
  );
  if (!config.ntfyUrl) return;
  try {
    const headers: Record<string, string> = { Title: title.replace(/[^\x20-\x7e]/g, "").slice(0, 200) || "Reminder", Tags: "bell" };
    if (config.publicUrl && conversationId) headers.Click = `${config.publicUrl}/#/c/${conversationId}`;
    // ntfy is a third-party relay, so by default the push says only that something happened.
    const text = config.ntfyShowContent ? body.slice(0, 4000) : `Open ${config.agentName} to see it.`;
    if (!config.ntfyShowContent) headers.Title = title.startsWith("✅") || title.startsWith("⚠️") ? "A scheduled task finished" : "You have a reminder";
    await fetch(config.ntfyUrl, { method: "POST", body: text, headers, signal: AbortSignal.timeout(10_000) });
  } catch (err) {
    console.warn("[dizz] ntfy push failed:", err instanceof Error ? err.message : err);
  }
}
