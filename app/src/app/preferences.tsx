import { router, Stack } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { Button, ErrorBox, Field, Pill, Screen, Section, Segmented, T, Wrap } from "../components/ui";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import type { Preferences } from "../lib/types";

const DRINKS = ["Espresso", "Flat white", "Still water", "Sparkling water", "Arabic coffee", "Mint tea", "Nothing, thanks"];

/** "My chair": how you like your visit. Your barber sees it before every appointment. */
export default function MyChair() {
  const { user, setUser } = useAuth();
  const [p, setP] = useState<Preferences>(user?.preferences ?? { conversation: "either", fragrance: "light" });
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = (patch: Preferences) => {
    setSaved(false);
    setP((x) => ({ ...x, ...patch }));
  };

  async function save() {
    if (!user) return router.push("/login");
    setBusy(true);
    setError(null);
    try {
      setUser(await api.setPreferences(p));
      setSaved(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen footer={<Button title={saved ? "Saved" : "Save my chair"} icon={saved ? "checkmark" : undefined} loading={busy} onPress={save} />}>
      <Stack.Screen options={{ title: "My chair" }} />
      <T variant="display">My chair</T>
      <T muted style={{ marginTop: 6 }}>Tell us once. Your barber sees this before every visit, so it's just how you like it.</T>

      <Section title="Conversation">
        <Segmented
          value={p.conversation ?? "either"}
          onChange={(v) => set({ conversation: v })}
          options={[{ value: "quiet", label: "Quiet, please" }, { value: "either", label: "Either" }, { value: "chatty", label: "Let's talk" }]}
        />
      </Section>

      <Section title="Something to drink">
        <Wrap gap={8}>
          {DRINKS.map((d) => <Pill key={d} label={d} selected={p.drink === d} onPress={() => set({ drink: p.drink === d ? "" : d })} />)}
        </Wrap>
      </Section>

      <Section title="Fragrance">
        <Segmented value={p.fragrance ?? "light"} onChange={(v) => set({ fragrance: v })} options={[{ value: "none", label: "None" }, { value: "light", label: "Light" }, { value: "classic", label: "Classic cologne" }]} />
      </Section>

      <Section title="The details">
        <Field label="My usual cut" value={p.standingCut ?? ""} onChangeText={(v) => set({ standingCut: v })} multiline placeholder="e.g. No. 2 on the sides, scissors on top, square neckline" />
        <Field label="Music" value={p.music ?? ""} onChangeText={(v) => set({ music: v })} placeholder="e.g. 90s R&B, Afrobeats, no preference" />
        <Field label="Allergies or sensitive skin" value={p.allergies ?? ""} onChangeText={(v) => set({ allergies: v })} placeholder="e.g. Sensitive to alcohol-based aftershave" />
      </Section>
      {error && <View style={{ marginTop: 12 }}><ErrorBox message={error} /></View>}
    </Screen>
  );
}
