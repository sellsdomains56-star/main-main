import { router } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { LocationPill } from "../components/LocationSheet";
import { Button, Card, ErrorBox, Field, Pill, Screen, Section, T, Timeline, Wrap } from "../components/ui";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import { APP_NAME } from "../lib/config";
import { useLocation } from "../lib/location";

const SPECIALTIES = ["skin fade", "taper", "line-up", "beard", "hot towel shave", "textured crop", "french crop", "scissor cut", "pompadour", "side part", "buzz cut", "afro", "waves", "curly hair", "long hair", "mullet", "curtains", "hair design"];

export default function BecomeBarber() {
  const { signIn } = useAuth();
  const { place, country } = useLocation();
  const [form, setForm] = useState({ name: "", email: "", password: "", bio: "", shopAddress: "", price: "" });
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [homeVisits, setHomeVisits] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = (key: keyof typeof form) => (value: string) => setForm((f) => ({ ...f, [key]: value }));
  const price = parseFloat(form.price.replace(",", "."));

  async function submit() {
    if (!place?.city) {
      setError("Pick the city you work in (tap the location above).");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await api.registerBarber({
        name: form.name, email: form.email, password: form.password, bio: form.bio, shopAddress: form.shopAddress,
        countryCode: place.countryCode, city: place.city, specialties, offersHomeVisits: homeVisits,
        haircutPrice: Math.round(price * 100),
      });
      await signIn(res.token, res.user);
      router.replace("/business/apply"); // next: ID, licence and the signed agreement
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen
      footer={
        <Button
          title="Create profile and continue"
          onPress={submit}
          loading={busy}
          disabled={!form.name || !form.email || form.password.length < 8 || !form.shopAddress || !(price > 0)}
        />
      }
    >
      <T variant="display">Grow your chair</T>
      <T muted style={{ marginTop: 6 }}>Join {APP_NAME}: get booked by customers in your city, get paid upfront, post reels of your best cuts.</T>

      <Card style={{ marginTop: 18, padding: 18 }}>
        <T variant="eyebrow" muted style={{ marginBottom: 12 }}>How joining works</T>
        <Timeline
          active={0}
          steps={[
            { title: "Your profile", body: "Your city, prices and specialties (this page)" },
            { title: "Your ID and licence", body: "Photos of your Emirates ID and your barber licence or permit" },
            { title: "The agreement", body: "Read the barber agreement and sign it in the app", onPress: () => router.push("/business/agreement") },
            { title: "Approval", body: "The JB team checks everything, then you go live" },
          ]}
        />
        <T variant="small" muted style={{ marginTop: 14 }}>Work at a barbershop? You don't need to apply: JB signs a contract with your shop and the shop adds you.</T>
      </Card>

      <Section title="Where do you work?">
        <LocationPill label="City" />
      </Section>

      <Section title="About you">
        <Field label="Name" value={form.name} onChangeText={set("name")} />
        <Field label="Email" value={form.email} onChangeText={set("email")} autoCapitalize="none" keyboardType="email-address" />
        <Field label="Password" value={form.password} onChangeText={set("password")} secureTextEntry placeholder="At least 8 characters" />
        <Field label="Short bio" value={form.bio} onChangeText={set("bio")} multiline placeholder="What makes your cuts special?" />
        <Field label="Shop address" value={form.shopAddress} onChangeText={set("shopAddress")} />
        <Field label={`Classic haircut price${country ? ` (${country.currency.toUpperCase()})` : ""}`} value={form.price} onChangeText={set("price")} keyboardType="decimal-pad" placeholder="25" />
      </Section>

      <Section title="Specialties">
        <Wrap>
          {SPECIALTIES.map((s) => (
            <Pill key={s} label={s} selected={specialties.includes(s)} onPress={() => setSpecialties((list) => (list.includes(s) ? list.filter((x) => x !== s) : [...list, s]))} />
          ))}
        </Wrap>
        <View style={{ marginTop: 14 }}>
          <Pill label="I do home visits" icon="home-outline" selected={homeVisits} onPress={() => setHomeVisits(!homeVisits)} />
        </View>
      </Section>
      {error && <View style={{ marginTop: 12 }}><ErrorBox message={error} /></View>}
    </Screen>
  );
}
