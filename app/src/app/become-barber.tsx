import { router } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { LocationPicker } from "../components/LocationPicker";
import { Button, Card, Chip, ErrorBox, Field, H1, H2, P, Screen } from "../components/ui";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
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

  async function submit() {
    if (!place?.city) {
      setError("Pick the city you work in.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await api.registerBarber({
        name: form.name, email: form.email, password: form.password, bio: form.bio, shopAddress: form.shopAddress,
        countryCode: place.countryCode, city: place.city, specialties, offersHomeVisits: homeVisits,
        haircutPrice: Math.round(parseFloat(form.price.replace(",", ".")) * 100),
      });
      await signIn(res.token, res.user);
      router.replace(`/barber/${res.user.barberId}`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <H1>Join as a barber 💈</H1>
      <P muted>Get booked by customers in your city. They pay upfront through the app — Apple Pay, Google Pay or card.</P>

      <H2>Where do you work?</H2>
      <Card><LocationPicker /></Card>

      <H2>About you</H2>
      <Field label="Name" value={form.name} onChangeText={set("name")} />
      <Field label="Email" value={form.email} onChangeText={set("email")} autoCapitalize="none" keyboardType="email-address" />
      <Field label="Password" value={form.password} onChangeText={set("password")} secureTextEntry />
      <Field label="Short bio" value={form.bio} onChangeText={set("bio")} multiline placeholder="What makes your cuts special?" />
      <Field label="Shop address" value={form.shopAddress} onChangeText={set("shopAddress")} />
      <Field label={`Price for a classic haircut${country ? ` (${country.currency.toUpperCase()})` : ""}`} value={form.price} onChangeText={set("price")} keyboardType="decimal-pad" placeholder="25" />

      <H2>Specialties</H2>
      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        {SPECIALTIES.map((s) => (
          <Chip key={s} label={s} selected={specialties.includes(s)} onPress={() => setSpecialties((list) => (list.includes(s) ? list.filter((x) => x !== s) : [...list, s]))} />
        ))}
      </View>
      <View style={{ flexDirection: "row", marginTop: 6 }}>
        <Chip label="🏠 I do home visits" selected={homeVisits} onPress={() => setHomeVisits(!homeVisits)} />
      </View>

      {error && <ErrorBox message={error} />}
      <Button
        title="Create barber profile"
        onPress={submit}
        loading={busy}
        disabled={!form.name || !form.email || form.password.length < 8 || !form.shopAddress || !(parseFloat(form.price.replace(",", ".")) > 0)}
      />
    </Screen>
  );
}
