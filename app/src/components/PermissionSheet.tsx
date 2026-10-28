import { useEffect, useState } from "react";
import { Modal, Platform, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { setPermissionPresenter, type SheetChoice } from "../lib/askPermission";
import { PERMISSION_INFO, type PermissionKind, type PermissionState } from "../lib/permissionInfo";
import { colors, radius } from "./theme";
import { Button, IconBadge, IconLine, T } from "./ui";

type Pending = { kind: PermissionKind; state: PermissionState; resolve: (c: SheetChoice) => void };

/**
 * The sheet shown before a system permission prompt: what it's for, then the system's own dialog.
 * When it was turned off for good, it offers the phone's Settings instead (a browser can't, so it says where).
 * Mounted once at the root of the app.
 */
export function PermissionSheet() {
  const [pending, setPending] = useState<Pending | null>(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    setPermissionPresenter((req) => new Promise<SheetChoice>((resolve) => setPending({ ...req, resolve })));
    return () => setPermissionPresenter(null);
  }, []);

  if (!pending) return null;
  const info = PERMISSION_INFO[pending.kind];
  const blocked = pending.state === "blocked";
  const web = Platform.OS === "web";
  const close = (choice: SheetChoice) => {
    pending.resolve(choice);
    setPending(null);
  };

  return (
    <Modal visible transparent animationType="slide" onRequestClose={() => close("cancel")} statusBarTranslucent>
      <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.45)" }} onPress={() => close("cancel")} accessibilityLabel="Not now" />
      <View
        accessibilityViewIsModal
        style={{ backgroundColor: colors.card, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: 24, paddingBottom: insets.bottom + 20, width: "100%", maxWidth: 560, alignSelf: "center" }}
      >
        <IconBadge icon={info.icon} size={52} />
        <T variant="title" style={{ marginTop: 16 }}>{blocked ? info.offTitle : info.ask}</T>
        {blocked ? (
          <T muted style={{ marginTop: 8 }}>{info.off}</T>
        ) : (
          <>
            <T muted style={{ marginTop: 6 }}>{info.lead}</T>
            <View style={{ gap: 8, marginTop: 14 }}>
              {info.reasons.map((r) => <IconLine key={r} icon="checkmark-circle-outline">{r}</IconLine>)}
            </View>
            <View style={{ marginTop: 14 }}><IconLine icon="lock-closed-outline" muted>{info.promise}</IconLine></View>
          </>
        )}
        <View style={{ gap: 10, marginTop: 22 }}>
          {blocked ? (
            !web && <Button title="Open Settings" icon="settings-outline" onPress={() => close("settings")} />
          ) : (
            <Button title="Continue" onPress={() => close("continue")} />
          )}
          <Button title="Not now" variant="ghost" onPress={() => close("cancel")} />
        </View>
      </View>
    </Modal>
  );
}
