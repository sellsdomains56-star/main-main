import { useCallback, useEffect, useState } from "react";
import { AppState, Platform, View } from "react-native";
import { askPermission } from "../lib/askPermission";
import { useAuth } from "../lib/auth";
import { PERMISSION_INFO, stateLabel, type PermissionKind, type PermissionState } from "../lib/permissionInfo";
import { getPermission, openPermissionSettings } from "../lib/permissions";
import { enablePush } from "../lib/push";
import { colors } from "./theme";
import { Button, IconBadge, IconLine, Row, Section, T } from "./ui";

const KINDS: PermissionKind[] = ["location", "notifications", "camera", "calendar", "photos"];

/** Settings → Permissions: what's on, what's off, and the way to change each (re-checked when coming back from Settings). */
export function PermissionsList() {
  const [states, setStates] = useState<Partial<Record<PermissionKind, PermissionState>>>({});
  const [busy, setBusy] = useState<PermissionKind | null>(null);
  const web = Platform.OS === "web";
  const { user } = useAuth();

  const load = useCallback(async () => {
    const entries = await Promise.all(KINDS.map(async (k) => [k, await getPermission(k)] as const));
    setStates(Object.fromEntries(entries));
  }, []);
  useEffect(() => {
    load();
    const sub = AppState.addEventListener("change", (s) => s === "active" && load());
    return () => sub.remove();
  }, [load]);

  const allow = async (kind: PermissionKind) => {
    setBusy(kind);
    try {
      if (kind === "notifications" && user) await enablePush(true); // also registers this phone for the account's alerts
      else await askPermission(kind);
    } finally {
      setBusy(null);
      load();
    }
  };

  return (
    <Section title={web ? "This browser" : "Permissions"}>
      <T variant="caption" muted style={{ marginBottom: 6 }}>
        {web ? "The website only asks for your location, and only when you use it." : "Always Fresh asks only when you use a feature that needs it, and explains why first."}
      </T>
      {KINDS.map((k) => {
        const s = states[k];
        const info = PERMISSION_INFO[k];
        const action =
          !s || s === "notNeeded" || s === "unavailable" ? null
          : s === "undetermined" || s === "denied" ? <Button title="Allow" size="sm" variant="secondary" loading={busy === k} onPress={() => allow(k)} />
          : web ? null
          : <Button title={s === "blocked" ? "Open Settings" : "Change"} size="sm" variant="secondary" onPress={() => openPermissionSettings()} />;
        return (
          <Row key={k} gap={12} style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}>
            <IconBadge icon={info.icon} size={36} />
            <View style={{ flex: 1 }}>
              <T variant="strong">{info.title}</T>
              <T variant="caption" muted>{s ? stateLabel(k, s) : "Checking…"}</T>
            </View>
            {action}
          </Row>
        );
      })}
      {!web && (
        <View style={{ marginTop: 10 }}>
          <IconLine icon="lock-closed-outline" muted>Location is only used while the app is open, and the microphone is never used.</IconLine>
        </View>
      )}
    </Section>
  );
}
