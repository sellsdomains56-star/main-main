import { getCalendarPermissions, requestCalendarPermissions } from "expo-calendar";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import { Linking, Platform } from "react-native";
import type { PermissionKind, PermissionState } from "./permissionInfo";

/** iPhone and Android: the system permission behind each feature (the website uses permissions.web.ts). */

type Raw = { granted: boolean; status: string; canAskAgain: boolean };
const toState = (r: Raw, limited = false): PermissionState =>
  r.granted ? (limited ? "limited" : "granted") : r.status === "undetermined" ? "undetermined" : r.canAskAgain ? "denied" : "blocked";

const locationState = (r: Location.LocationPermissionResponse) => toState(r, r.ios?.accuracy === "reduced" || r.android?.accuracy === "coarse");
const notificationState = (r: Notifications.NotificationPermissionsStatus) =>
  r.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL ? "limited" : toState(r);

/** Android 13+ only shows the notifications prompt once a channel exists. */
export async function ensureNotificationChannel() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", { name: "Bookings", importance: Notifications.AndroidImportance.HIGH });
  }
}

/** Where a permission stands, without asking. */
export async function getPermission(kind: PermissionKind): Promise<PermissionState> {
  try {
    switch (kind) {
      case "location":
        return locationState(await Location.getForegroundPermissionsAsync());
      case "notifications":
        return notificationState(await Notifications.getPermissionsAsync());
      case "camera":
        return toState(await ImagePicker.getCameraPermissionsAsync());
      case "calendar":
        return toState(await getCalendarPermissions(true)); // iOS: add-only access, no reading
      case "photos":
        return "notNeeded"; // the system photo picker needs no permission
    }
  } catch {
    return "unavailable";
  }
}

/** Shows the system's own prompt (call through askPermission, which explains first). */
export async function requestPermission(kind: PermissionKind): Promise<PermissionState> {
  try {
    switch (kind) {
      case "location":
        return locationState(await Location.requestForegroundPermissionsAsync());
      case "notifications":
        await ensureNotificationChannel();
        return notificationState(await Notifications.requestPermissionsAsync({ ios: { allowAlert: true, allowBadge: true, allowSound: true } }));
      case "camera":
        return toState(await ImagePicker.requestCameraPermissionsAsync());
      case "calendar":
        return toState(await requestCalendarPermissions(true));
      case "photos":
        return "notNeeded";
    }
  } catch {
    return "unavailable";
  }
}

/** Opens this app's page in the phone's Settings, where people turn permissions back on. */
export async function openPermissionSettings() {
  await Linking.openSettings();
}
