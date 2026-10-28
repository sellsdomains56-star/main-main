import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { useEffect } from "react";
import { api } from "./api";
import { askPermission } from "./askPermission";
import { ensureNotificationChannel } from "./permissions";
import { storage } from "./storage";

const TOKEN_KEY = "af_push_token";

// Show alerts while the app is open too.
Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: true }),
});

export type PushState = "on" | "off" | "ask" | "unsupported";

export async function pushState(): Promise<PushState> {
  const s = await Notifications.getPermissionsAsync();
  return s.granted ? "on" : s.canAskAgain ? "ask" : "off";
}

/**
 * Asks for permission (only when `ask` is true — e.g. after a booking, or from the alerts screen),
 * then registers this phone with the API so booking alerts arrive as push notifications.
 */
export async function enablePush(ask: boolean): Promise<PushState> {
  await ensureNotificationChannel(); // Android 13+ shows the prompt only once a channel exists
  let state = await pushState();
  // Explained first ("Get alerts about your bookings"), then the system's prompt; Settings if it was turned off.
  if (state !== "on" && ask) state = (await askPermission("notifications")) ? "on" : await pushState();
  if (state !== "on") return state;
  // Push tokens come from Expo's push service and need the EAS project id (run `eas init`).
  const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  if (!projectId) return "on";
  try {
    const { data } = await Notifications.getExpoPushTokenAsync({ projectId });
    await api.addPushToken(data);
    await storage.set(TOKEN_KEY, data);
  } catch (err) {
    console.warn("Couldn't register for push notifications:", (err as Error).message);
  }
  return "on";
}

/** On sign-out, stop sending this account's alerts to this phone. */
export async function disablePush() {
  const token = await storage.get(TOKEN_KEY);
  if (token) await api.removePushToken(token).catch(() => {});
  await storage.remove(TOKEN_KEY);
}

/** Tapping an alert opens the booking it's about. */
export function usePushNavigation() {
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as { kind?: string; bookingId?: string };
      if (data.kind === "completed" && data.bookingId) router.push({ pathname: "/review/[bookingId]", params: { bookingId: data.bookingId } });
      else router.push("/bookings");
    });
    return () => sub.remove();
  }, []);
}
