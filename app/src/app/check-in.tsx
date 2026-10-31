import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, fonts, radius } from "../components/theme";
import { Button, EmptyState, Field, Loading, Pill, Screen, T, Wrap } from "../components/ui";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import type { CheckInRow, ShopPanel } from "../lib/types";

const SERVICES = ["Haircut", "Skin fade", "Beard trim", "Haircut + beard"];
type Step = "home" | "booking" | "walkin" | "done";

/** A tablet at the door: clients with a booking tap their name; walk-ins join the queue. */
export default function CheckIn() {
  const { user, loading } = useAuth();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [panel, setPanel] = useState<ShopPanel | null>(null);
  const [rows, setRows] = useState<CheckInRow[] | null>(null);
  const [step, setStep] = useState<Step>("home");
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [service, setService] = useState(SERVICES[0]!);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    api.manage.checkIns().then(setRows, (e: Error) => setError(e.message));
  }, []);
  useEffect(() => {
    if (!user?.manages) return;
    api.manage.panel().then(setPanel, () => {});
    load();
  }, [user, load]);
  // Back to the welcome screen a few seconds after each check-in, ready for the next person.
  useEffect(() => {
    if (step !== "done") return;
    const t = setTimeout(() => {
      setStep("home");
      load();
    }, 5000);
    return () => clearTimeout(t);
  }, [step, load]);

  if (loading) return <Screen><Loading /></Screen>;
  if (!user?.manages) return <Screen><EmptyState icon="tablet-portrait-outline" title="Check-in tablet" body="Sign in with your shop's account on the tablet." action={{ label: "Sign in", onPress: () => router.push("/login") }} /></Screen>;

  const tz = panel?.shop.timeZone;
  const time = (iso: string) => new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: tz }).format(new Date(iso));
  const soon = (rows ?? []).filter((r) => !r.done && Date.parse(r.startsAt) > Date.now() - 45 * 60_000);
  const big = width >= 700;

  const checkIn = async (r: CheckInRow) => {
    try {
      await api.manage.checkIn(r.id);
      setMessage(`Welcome, ${r.firstName}. ${r.barber.split(" ")[0]} knows you're here — take a seat.`);
      setStep("done");
    } catch (e) {
      setError((e as Error).message);
    }
  };
  const joinQueue = async () => {
    try {
      const entry = await api.manage.addToQueue({ name: name.trim(), service });
      const q = await api.manage.queue();
      const pos = q.waiting.findIndex((w) => w.id === entry.id);
      setMessage(`Thanks, ${name.trim().split(" ")[0]}. You're number ${pos + 1} — about ${q.waiting[pos]?.estimateMin ?? 15} minutes.`);
      setName("");
      setStep("done");
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const tile = (icon: "calendar-outline" | "walk-outline", title: string, body: string, onPress: () => void) => (
    <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => ({ flex: 1, minHeight: big ? 260 : 170, borderRadius: radius.xl, backgroundColor: colors.onInk, padding: 28, justifyContent: "space-between", opacity: pressed ? 0.85 : 1 })}>
      <Ionicons name={icon} size={big ? 40 : 30} color={colors.ink} />
      <View>
        <T color={colors.ink} style={{ fontSize: big ? 32 : 24, fontFamily: fonts.semibold }}>{title}</T>
        <T color={colors.muted} style={{ marginTop: 6, fontSize: big ? 18 : 15 }}>{body}</T>
      </View>
    </Pressable>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.ink, paddingTop: insets.top + 24, paddingHorizontal: big ? 48 : 20, paddingBottom: 24 }}>
      <Pressable onPress={() => router.back()} accessibilityLabel="Close check-in" hitSlop={10} style={{ alignSelf: "flex-start" }}>
        <T variant="eyebrow" color={colors.inkMuted}>{panel?.shop.name ?? "Always Fresh"}</T>
      </Pressable>

      {step === "home" && (
        <View style={{ flex: 1, justifyContent: "center" }}>
          <T color={colors.onInk} style={{ fontSize: big ? 52 : 34, lineHeight: big ? 60 : 40, fontFamily: fonts.semibold }}>Welcome in.</T>
          <T color={colors.inkMuted} style={{ fontSize: big ? 22 : 17, marginTop: 8, marginBottom: 32 }}>Tap to let us know you're here.</T>
          <View style={{ flexDirection: big ? "row" : "column", gap: 16 }}>
            {tile("calendar-outline", "I have a booking", "Find your name and check in", () => setStep("booking"))}
            {tile("walk-outline", "Walk in", "Join the queue for the next free chair", () => setStep("walkin"))}
          </View>
        </View>
      )}

      {step === "booking" && (
        <View style={{ flex: 1, marginTop: 24 }}>
          <T color={colors.onInk} style={{ fontSize: big ? 36 : 26, fontFamily: fonts.semibold }}>Tap your name</T>
          <ScrollView style={{ marginTop: 18 }} contentContainerStyle={{ gap: 12 }}>
            {!rows && <Loading color={colors.onInk} />}
            {rows && soon.length === 0 && <T color={colors.inkMuted} style={{ fontSize: 18 }}>No more bookings today. Walk in instead?</T>}
            {soon.map((r) => (
              <Pressable key={r.id} disabled={r.checkedIn} onPress={() => checkIn(r)} accessibilityRole="button" accessibilityLabel={`${r.firstName}, ${time(r.startsAt)}`} style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 16, padding: 20, borderRadius: radius.lg, backgroundColor: r.checkedIn ? colors.inkRaised : colors.onInk, opacity: pressed ? 0.85 : 1 })}>
                <T color={r.checkedIn ? colors.inkMuted : colors.ink} style={{ fontSize: big ? 26 : 20, fontFamily: fonts.semibold, width: big ? 110 : 80 }}>{time(r.startsAt)}</T>
                <View style={{ flex: 1 }}>
                  <T color={r.checkedIn ? colors.onInk : colors.ink} style={{ fontSize: big ? 26 : 20, fontFamily: fonts.semibold }}>{r.firstName}</T>
                  <T color={colors.muted}>{r.service} · {r.barber.split(" ")[0]}</T>
                </View>
                {r.checkedIn && <T color={colors.inkMuted}>Checked in</T>}
              </Pressable>
            ))}
          </ScrollView>
          <Button title="Back" variant="light" onPress={() => setStep("home")} style={{ marginTop: 16, alignSelf: "flex-start" }} />
        </View>
      )}

      {step === "walkin" && (
        <View style={{ flex: 1, marginTop: 24, maxWidth: 640 }}>
          <T color={colors.onInk} style={{ fontSize: big ? 36 : 26, fontFamily: fonts.semibold, marginBottom: 18 }}>Join the queue</T>
          <View style={{ backgroundColor: colors.onInk, borderRadius: radius.xl, padding: 22 }}>
            <Field label="Your first name" value={name} onChangeText={setName} autoFocus />
            <Wrap>{SERVICES.map((s) => <Pill key={s} label={s} selected={service === s} onPress={() => setService(s)} />)}</Wrap>
            <Button title="Join the queue" icon="people" style={{ marginTop: 18 }} disabled={!name.trim()} onPress={joinQueue} />
          </View>
          <Button title="Back" variant="light" onPress={() => setStep("home")} style={{ marginTop: 16, alignSelf: "flex-start" }} />
        </View>
      )}

      {step === "done" && (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 18 }}>
          <Ionicons name="checkmark-circle" size={big ? 96 : 72} color={colors.onInk} />
          <T color={colors.onInk} center style={{ fontSize: big ? 34 : 24, lineHeight: big ? 42 : 30, fontFamily: fonts.semibold, maxWidth: 720 }}>{message}</T>
        </View>
      )}
      {error && <T color={colors.onInk} style={{ marginTop: 10 }}>{error}</T>}
    </View>
  );
}
