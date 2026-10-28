import type { PermissionKind, PermissionState } from "./permissionInfo";

/**
 * The website: only location is a browser permission we ask for. Photos and the camera come through the browser's
 * file picker, the calendar through a calendar file or link, and alerts live in the app's own inbox.
 */

async function geoState(): Promise<PermissionState> {
  if (typeof navigator === "undefined" || !navigator.geolocation) return "unavailable";
  try {
    const status = await navigator.permissions?.query({ name: "geolocation" as PermissionName });
    if (!status) return "undetermined";
    return status.state === "granted" ? "granted" : status.state === "denied" ? "blocked" : "undetermined";
  } catch {
    return "undetermined"; // no Permissions API (older Safari): the browser asks when we try
  }
}

export async function getPermission(kind: PermissionKind): Promise<PermissionState> {
  if (kind === "location") return geoState();
  if (kind === "notifications") return "unavailable";
  return "notNeeded";
}

export async function requestPermission(kind: PermissionKind): Promise<PermissionState> {
  if (kind !== "location") return getPermission(kind);
  if (typeof navigator === "undefined" || !navigator.geolocation) return "unavailable";
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      () => resolve("granted"),
      (e) => resolve(e.code === e.PERMISSION_DENIED ? "blocked" : "granted"), // timed out or no fix: allowed, just not found yet
      { maximumAge: 10 * 60_000, timeout: 15_000 },
    );
  });
}

export const ensureNotificationChannel = async () => {};

/** Browsers have no page to open from here; the sheet explains where the setting is instead. */
export async function openPermissionSettings() {}
