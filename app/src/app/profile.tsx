import { router } from "expo-router";
import { useState } from "react";
import { Platform, Pressable, Switch, View } from "react-native";
import { colors } from "../components/theme";
import { Avatar, Button, EmptyState, ErrorBox, Field, IconLine, Loading, Pill, Row, Screen, Section, T, Wrap } from "../components/ui";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import { pickAndUploadImage } from "../lib/upload";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Your photo, name, mobile number, WhatsApp updates and birthday. */
export default function Profile() {
  const { user, loading } = useAuth();
  if (loading) return <Screen><Loading /></Screen>;
  if (!user) return <Screen><EmptyState icon="person-outline" title="Your profile" body="Sign in to add your photo and details." action={{ label: "Sign in", onPress: () => router.push("/login") }} /></Screen>;
  return <ProfileForm key={user.id} />;
}

function ProfileForm() {
  const { user: signedIn, setUser } = useAuth();
  const user = signedIn!;
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone ?? "");
  const [whatsapp, setWhatsapp] = useState(!!user.whatsapp);
  const [month, setMonth] = useState(user.birthday ? Number(user.birthday.slice(0, 2)) : 0);
  const [day, setDay] = useState(user.birthday ? String(Number(user.birthday.slice(3))) : "");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const dayNum = Number(day);
  const birthday = month && dayNum >= 1 && dayNum <= 31 ? `${String(month).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}` : undefined;
  const changed = name.trim() !== user.name || phone.trim() !== (user.phone ?? "") || whatsapp !== !!user.whatsapp || (birthday ?? "") !== (user.birthday ?? "");

  const run = (key: string, fn: () => Promise<void>) => async () => {
    setBusy(key);
    setError(null);
    setSaved(false);
    try {
      await fn();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const save = run("save", async () => {
    setUser(await api.updateMe({ name: name.trim(), phone: phone.trim(), whatsapp, ...(birthday ? { birthday } : {}) }));
    setSaved(true);
  });

  return (
    <Screen footer={<Button title="Save" onPress={save} loading={busy === "save"} disabled={!changed || !name.trim() || (whatsapp && !phone.trim())} />}>
      <View style={{ alignItems: "center", marginTop: 8 }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Change profile photo"
          disabled={!!busy}
          onPress={run("photo", async () => {
            const url = await pickAndUploadImage({ square: true });
            if (url) setUser(await api.updateMe({ photoUrl: url }));
          })}
        >
          <Avatar uri={user.photoUrl} name={user.name} size={96} />
        </Pressable>
        <Button title={user.photoUrl ? "Change photo" : "Add a photo"} icon="camera-outline" size="sm" variant="ghost" loading={busy === "photo"} onPress={run("photo", async () => {
          const url = await pickAndUploadImage({ square: true });
          if (url) setUser(await api.updateMe({ photoUrl: url }));
        })} />
        <T variant="caption" muted center>Your barber sees it on the booking, so they know who to look for.</T>
      </View>

      <Section title="Details">
        <Field label="Name" value={name} onChangeText={setName} autoComplete="name" />
        <Field label="Mobile number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" autoComplete="tel" placeholder="+971 50 123 4567" />
        <Row gap={12} style={{ paddingVertical: 10 }}>
          <View style={{ flex: 1 }}>
            <T variant="strong">WhatsApp updates</T>
            <T variant="caption" muted>Booking confirmations, reminders and "on the way" on WhatsApp too</T>
          </View>
          <Switch
            value={whatsapp}
            onValueChange={setWhatsapp}
            accessibilityLabel="WhatsApp updates"
            trackColor={{ true: colors.ink, false: colors.surface }}
            thumbColor={Platform.OS === "android" ? colors.card : undefined}
            {...(Platform.OS === "web" ? ({ activeThumbColor: colors.card } as object) : {})}
          />
        </Row>
        {whatsapp && !phone.trim() && <IconLine icon="information-circle-outline" muted>Add your mobile number to get WhatsApp updates.</IconLine>}
      </Section>

      <Section title="Birthday">
        <T variant="caption" muted style={{ marginBottom: 10 }}>We'll send a little treat on the day. No year needed.</T>
        <Wrap gap={6}>{MONTHS.map((m, i) => <Pill key={m} label={m} selected={month === i + 1} onPress={() => setMonth(i + 1)} />)}</Wrap>
        <Field label="Day" value={day} onChangeText={(v) => setDay(v.replace(/[^\d]/g, "").slice(0, 2))} keyboardType="number-pad" placeholder="e.g. 14" style={{ marginTop: 12 }} />
      </Section>

      {error && <ErrorBox message={error} />}
      {saved && <IconLine icon="checkmark-circle-outline">Saved.</IconLine>}
    </Screen>
  );
}
