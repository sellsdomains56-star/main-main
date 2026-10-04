import { Ionicons } from "@expo/vector-icons";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useState } from "react";
import { Image, Platform, Pressable, View } from "react-native";
import { BarberCard } from "../components/BarberCard";
import { colors, fonts, radius } from "../components/theme";
import { Button, Card, GoldIcon, Divider, ErrorBox, Field, Pill, Row, Screen, Section, T, Tag, Wrap } from "../components/ui";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import { useLocation } from "../lib/location";
import type { Barber, StyleAdvice } from "../lib/types";

const LENGTHS = ["very short", "short", "medium", "long"];
const MAINTENANCE = ["low", "medium", "high"];
const VIBES = ["clean & classic", "trendy", "bold", "natural", "professional"];

export default function Stylist() {
  const { user } = useAuth();
  const { place } = useLocation();
  const [photo, setPhoto] = useState<{ uri: string; base64: string } | null>(null);
  const [length, setLength] = useState("");
  const [maintenance, setMaintenance] = useState("");
  const [vibe, setVibe] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ advice: StyleAdvice; barbers: Barber[] } | null>(null);

  async function pick(source: "camera" | "library") {
    setError(null);
    if (source === "camera") {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        setError("Camera access is needed to take a photo. You can also choose one from your library.");
        return;
      }
    }
    const options: ImagePicker.ImagePickerOptions = { mediaTypes: ["images"], allowsEditing: true, aspect: [1, 1], quality: 1 };
    const res = source === "camera"
      ? await ImagePicker.launchCameraAsync({ ...options, cameraType: ImagePicker.CameraType.front })
      : await ImagePicker.launchImageLibraryAsync(options);
    if (res.canceled || !res.assets[0]) return;
    // Shrink to keep the upload fast; 1024px is plenty for hair analysis.
    const rendered = await ImageManipulator.manipulate(res.assets[0].uri).resize({ width: 1024 }).renderAsync();
    const saved = await rendered.saveAsync({ compress: 0.75, format: SaveFormat.JPEG, base64: true });
    setPhoto({ uri: saved.uri, base64: saved.base64! });
    setResult(null);
  }

  async function analyse() {
    if (!user) {
      router.push("/login");
      return;
    }
    if (!photo) return;
    setLoading(true);
    setError(null);
    try {
      setResult(
        await api.haircutAdvice({
          imageBase64: photo.base64,
          mediaType: "image/jpeg",
          preferences: { length, maintenance, vibe, notes },
          country: place?.countryCode,
          city: place?.city || undefined,
        }),
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const toggle = (value: string, current: string, set: (v: string) => void) => set(current === value ? "" : value);

  return (
    <Screen
      footer={
        !result ? (
          <Button title={user ? "Find my perfect cut" : "Sign in to use the AI stylist"} icon="sparkles" onPress={analyse} loading={loading} disabled={!!user && !photo} />
        ) : undefined
      }
    >
      <T variant="small" color={colors.goldDeep} style={{ letterSpacing: 2 }}>AI STYLIST</T>
      <T variant="display" style={{ marginTop: 4 }}>Find your perfect cut</T>
      <T muted style={{ marginTop: 6 }}>Upload a clear, front-facing photo. Our AI reads your face shape and hair type and suggests the cuts that suit you.</T>

      <View style={{ marginTop: 20 }}>
        {photo ? (
          <View style={{ alignItems: "center" }}>
            <Image source={{ uri: photo.uri }} style={{ width: 220, height: 220, borderRadius: radius.xl }} />
            <Button title="Change photo" variant="ghost" size="sm" icon="refresh" onPress={() => pick("library")} style={{ marginTop: 8 }} />
          </View>
        ) : (
          <View style={{ borderWidth: 2, borderStyle: "dashed", borderColor: colors.surfaceStrong, borderRadius: radius.xl, padding: 24, alignItems: "center", backgroundColor: colors.surface }}>
            <GoldIcon icon="camera-outline" size={60} />
            <T variant="strong" style={{ marginTop: 8 }}>Add a photo of your head</T>
            <T variant="caption" muted center style={{ marginTop: 4 }}>Good light · no hat · face the camera</T>
            <Row gap={10} style={{ marginTop: 16 }}>
              {Platform.OS !== "web" && <Button title="Take photo" icon="camera" size="md" onPress={() => pick("camera")} />}
              <Button title={Platform.OS === "web" ? "Upload photo" : "Library"} icon="image-outline" size="md" variant={Platform.OS === "web" ? "primary" : "secondary"} onPress={() => pick("library")} />
            </Row>
          </View>
        )}
      </View>

      {!result && (
        <Section title="Preferences (optional)">
          <T variant="caption" muted style={{ marginBottom: 8 }}>Length</T>
          <Wrap>{LENGTHS.map((l) => <Pill key={l} label={l} selected={length === l} onPress={() => toggle(l, length, setLength)} />)}</Wrap>
          <T variant="caption" muted style={{ marginTop: 16, marginBottom: 8 }}>Maintenance</T>
          <Wrap>{MAINTENANCE.map((m) => <Pill key={m} label={m} selected={maintenance === m} onPress={() => toggle(m, maintenance, setMaintenance)} />)}</Wrap>
          <T variant="caption" muted style={{ marginTop: 16, marginBottom: 8 }}>Vibe</T>
          <Wrap>{VIBES.map((v) => <Pill key={v} label={v} selected={vibe === v} onPress={() => toggle(v, vibe, setVibe)} />)}</Wrap>
          <View style={{ marginTop: 16 }}>
            <Field label="Anything else?" placeholder="e.g. growing it out, I play sports, hide a cowlick" value={notes} onChangeText={setNotes} />
          </View>
        </Section>
      )}

      {error && <View style={{ marginTop: 12 }}><ErrorBox message={error} /></View>}
      {loading && <T variant="caption" muted center style={{ marginTop: 12 }}>Studying your hair… this takes a few seconds.</T>}

      {result && (
        <>
          <Card tone="surface" style={{ marginTop: 20 }}>
            <Row gap={8} style={{ flexWrap: "wrap" }}>
              <Tag label={`${result.advice.faceShape} face`} tone="gold" />
              <Tag label={result.advice.hairType} />
            </Row>
            <T style={{ marginTop: 10 }}>{result.advice.summary}</T>
          </Card>

          <Section title="Cuts that suit you">
            {result.advice.recommendations.map((r, i) => (
              <Card key={r.name} style={{ marginBottom: 12, ...(i === 0 ? { borderColor: colors.gold, borderWidth: 1.5 } : {}) }}>
                {i === 0 && <View style={{ marginBottom: 8 }}><Tag label="Best match" tone="gold" icon="trophy" /></View>}
                <T variant="heading">{r.name}</T>
                <T variant="caption" muted style={{ marginTop: 2 }}>{r.length} · {r.maintenance} maintenance</T>
                <T style={{ marginTop: 10 }}>{r.description}</T>
                <T variant="caption" muted style={{ marginTop: 6 }}>{r.whyItSuits}</T>
                <View style={{ backgroundColor: colors.surface, borderRadius: radius.md, padding: 12, marginTop: 12 }}>
                  <Row gap={6}>
                    <Ionicons name="chatbubble-ellipses-outline" size={14} color={colors.gold} />
                    <T variant="small" color={colors.goldDeep}>Tell your barber</T>
                  </Row>
                  <T style={{ marginTop: 4 }}>"{r.askYourBarber}"</T>
                </View>
              </Card>
            ))}
            {!!result.advice.beardAdvice && (
              <Card tone="surface"><T><T variant="strong">Beard: </T>{result.advice.beardAdvice}</T></Card>
            )}
          </Section>

          <Section title={`Barbers who nail these${place?.city ? ` in ${place.city}` : ""}`}>
            {result.barbers.length === 0 && <T muted>Choose your city on the Home tab to see matching barbers.</T>}
            {result.barbers.map((b, i) => (
              <View key={b.id}>
                {i > 0 && <Divider style={{ marginVertical: 0 }} />}
                <BarberCard barber={b} />
              </View>
            ))}
          </Section>
          <Pressable onPress={() => { setResult(null); setPhoto(null); }} style={{ marginTop: 20, alignSelf: "center" }}>
            <T variant="caption" color={colors.goldDeep} style={{ fontFamily: fonts.semibold }}>Try another photo</T>
          </Pressable>
        </>
      )}
    </Screen>
  );
}
