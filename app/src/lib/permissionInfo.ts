import { Platform } from "react-native";
import type { IconName } from "../components/ui";

/** The phone (or browser) permissions the app uses. Photos need none: people pick each photo in the system picker. */
export type PermissionKind = "location" | "notifications" | "camera" | "calendar" | "photos";

/**
 * granted / limited (approximate location, quiet notifications): the feature works.
 * undetermined / denied: we can still ask. blocked: only the phone's Settings can turn it on.
 * notNeeded: nothing to allow. unavailable: this device or browser can't do it.
 */
export type PermissionState = "granted" | "limited" | "undetermined" | "denied" | "blocked" | "notNeeded" | "unavailable";

export const isAllowed = (s: PermissionState) => s === "granted" || s === "limited" || s === "notNeeded";

const web = Platform.OS === "web";
const where = Platform.OS === "ios" ? "Settings → JB Always Fresh" : Platform.OS === "android" ? "Settings → Apps → JB Always Fresh → Permissions" : "your browser's site settings (the icon next to the address)";

/** What each permission is for, in the words the pre-permission sheet and Settings use. */
export const PERMISSION_INFO: Record<PermissionKind, { title: string; icon: IconName; ask: string; lead: string; reasons: string[]; promise: string; offTitle: string; off: string; settingsName: string }> = {
  location: {
    title: "Location",
    icon: "location-outline",
    ask: "Find barbers near you",
    lead: "JB Always Fresh uses your location only while you're using the app.",
    reasons: ["Show the barbers and barbershops closest to you", "Work out how far a barber travels to you, and any extra travel cost, before you pay"],
    promise: "Never in the background. Rather not? You can pick your area instead.",
    offTitle: "Location is off",
    off: `Location is off for JB Always Fresh. Turn it on in ${where}, or pick your area instead.`,
    settingsName: "Location",
  },
  notifications: {
    title: "Notifications",
    icon: "notifications-outline",
    ask: "Get alerts about your bookings",
    lead: "So you never miss an appointment.",
    reasons: ["Your confirmation and receipt", "Reminders a day and an hour before", "When your barber is on the way, and messages from them"],
    promise: "Choose which alerts you get in Settings at any time.",
    offTitle: "Notifications are off",
    off: `Notifications are off for JB Always Fresh. Turn them on in ${where}. Your alerts still wait for you in the app.`,
    settingsName: "Notifications",
  },
  camera: {
    title: "Camera",
    icon: "camera-outline",
    ask: "Use the camera",
    lead: "Only when you tap to take a photo.",
    reasons: ["A selfie for the AI try-on", "Photos of your Emirates ID and licence when you apply as a barber", "Your profile photo and photos of your work"],
    promise: "Nothing is recorded without you tapping, and no sound is ever recorded.",
    offTitle: "The camera is off",
    off: `The camera is off for JB Always Fresh. Turn it on in ${where}, or choose a photo you already have.`,
    settingsName: "Camera",
  },
  calendar: {
    title: "Calendar",
    icon: "calendar-outline",
    ask: "Add it to your calendar",
    lead: "Your appointment goes in your calendar with alerts a day and an hour before.",
    reasons: ["Adds the appointments you choose, one at a time"],
    promise: Platform.OS === "ios" ? "JB Always Fresh can only add events. It can't read your calendar." : "JB Always Fresh only adds the appointments you choose.",
    offTitle: "Calendar access is off",
    off: `Calendar access is off for JB Always Fresh. Turn it on in ${where}.`,
    settingsName: "Calendar",
  },
  photos: {
    title: "Photos",
    icon: "images-outline",
    ask: "Choose a photo",
    lead: "You pick each photo yourself.",
    reasons: [],
    promise: "JB Always Fresh only sees the photos you pick, never the rest of your library.",
    offTitle: "",
    off: "",
    settingsName: "Photos",
  },
};

/** One line for the Settings list. */
export function stateLabel(kind: PermissionKind, s: PermissionState): string {
  switch (s) {
    case "granted":
      return kind === "calendar" && Platform.OS === "ios" ? "On · add events only" : "On";
    case "limited":
      return kind === "location" ? "On · approximate" : "On · delivered quietly";
    case "undetermined":
      return "Not asked yet · asked when you first use it";
    case "denied":
      return "Off";
    case "blocked":
      return web ? "Blocked in this browser" : "Off · change it in Settings";
    case "notNeeded":
      return kind === "photos" ? "Not needed · you pick each photo" : web ? "Your browser asks when needed" : "Not needed";
    case "unavailable":
      return kind === "notifications" && web ? "In the app: your alerts are in the bell on Home" : "Not available on this device";
  }
}
