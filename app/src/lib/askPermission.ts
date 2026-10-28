import { isAllowed, type PermissionKind, type PermissionState } from "./permissionInfo";
import { getPermission, openPermissionSettings, requestPermission } from "./permissions";

/**
 * Asking for a permission the right way, from anywhere in the app: only when the feature is used, with a short
 * explanation first (the system prompt can only be shown once), and a way to Settings when it was turned off.
 * The sheet itself lives in components/PermissionSheet.tsx and registers here when the app starts.
 */

export type SheetChoice = "continue" | "settings" | "cancel";
type Presenter = (req: { kind: PermissionKind; state: PermissionState }) => Promise<SheetChoice>;

let presenter: Presenter | null = null;
export const setPermissionPresenter = (p: Presenter | null) => {
  presenter = p;
};

/** Resolves true once the feature can be used; false if the person said no (they can still use the alternative). */
export async function askPermission(kind: PermissionKind): Promise<boolean> {
  const state = await getPermission(kind);
  if (isAllowed(state)) return true;
  if (state === "unavailable") return false;
  if (!presenter) return isAllowed(await requestPermission(kind));
  const choice = await presenter({ kind, state });
  if (choice === "continue") return isAllowed(await requestPermission(kind));
  if (choice === "settings") await openPermissionSettings();
  return false;
}
