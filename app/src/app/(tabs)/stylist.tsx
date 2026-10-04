import * as ImagePicker from "expo-image-picker";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import { router } from "expo-router";
import { useState } from "react";
import { Image, Platform, Text, View } from "react-native";
import { BarberCard } from "../../components/BarberCard";
import { useTheme } from "../../components/theme";
import { Button, Card, Chip, ErrorBox, Field, H1, H2, P, Screen } from "../../components/ui";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import { useLocation } from "../../lib/location";
import type { Barber, StyleAdvice } from "../../lib/types";

const LENGTHS = ["very short", "short", "medium", "long"];
const MAINTENANCE = ["low", "medium", "high"];
const VIBES = ["clean & classic", "trendy", "bold", "natural", "professional"];

export default function Stylist() {
  const t = useTheme();
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

  return (
    <Screen>
      <H1>Your AI stylist ✨</H1>
      <P muted>
        Take a clear, front-facing photo of your head (good light, no hat). We'll read your face shape and hair type and suggest the cuts that suit you best.
      </P>

      <Card style={{ marginTop: 14, alignItems: "center" }}>
        {photo ? (
          <Image source={{ uri: photo.uri }} style={{ width: 220, height: 220, borderRadius: 18, marginBottom: 12 }} />
        ) : (
          <Text style={{ fontSize: 64, marginVertical: 10 }}>🧑‍🦱</Text>
        )}
        <View style={{ flexDirection: "row", gap: 10, width: "100%" }}>
          {Platform.OS !== "web" && (
            <View style={{ flex: 1 }}>
              <Button title="Take photo" icon="camera" variant="secondary" onPress={() => pick("camera")} />
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Button title={Platform.OS === "web" ? "Upload photo" : "From library"} icon="image" variant="secondary" onPress={() => pick("library")} />
          </View>
        </View>
      </Card>

      <H2>Your preferences (optional)</H2>
      <P muted style={{ marginBottom: 6 }}>Length</P>
      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        {LENGTHS.map((l) => <Chip key={l} label={l} selected={length === l} onPress={() => setLength(length === l ? "" : l)} />)}
      </View>
      <P muted style={{ marginBottom: 6 }}>Maintenance</P>
      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        {MAINTENANCE.map((m) => <Chip key={m} label={m} selected={maintenance === m} onPress={() => setMaintenance(maintenance === m ? "" : m)} />)}
      </View>
      <P muted style={{ marginBottom: 6 }}>Vibe</P>
      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        {VIBES.map((v) => <Chip key={v} label={v} selected={vibe === v} onPress={() => setVibe(vibe === v ? "" : v)} />)}
      </View>
      <Field label="Anything else?" placeholder="e.g. I'm growing it out, I play sports, I want to hide a cowlick" value={notes} onChangeText={setNotes} />

      {error && <ErrorBox message={error} />}
      <Button title={user ? "Find my perfect cut" : "Sign in to use the AI stylist"} icon="sparkles" onPress={analyse} loading={loading} disabled={!photo} />
      {loading && <P muted style={{ textAlign: "center", marginTop: 10 }}>Studying your hair… this takes a few seconds.</P>}

      {result && (
        <>
          <H2>Your analysis</H2>
          <Card>
            <P><Text style={{ fontWeight: "700" }}>Face shape:</Text> {result.advice.faceShape}</P>
            <P><Text style={{ fontWeight: "700" }}>Hair:</Text> {result.advice.hairType}</P>
            <P><Text style={{ fontWeight: "700" }}>Current cut:</Text> {result.advice.currentStyle}</P>
            <P style={{ marginTop: 8 }}>{result.advice.summary}</P>
          </Card>

          <H2>Cuts that suit you</H2>
          {result.advice.recommendations.map((r, i) => (
            <Card key={r.name} style={i === 0 ? { borderColor: t.primary, borderWidth: 2 } : undefined}>
              <Text style={{ color: t.text, fontSize: 17, fontWeight: "800" }}>{i === 0 ? "🏆 " : ""}{r.name}</Text>
              <P muted style={{ marginTop: 2 }}>{r.length} · {r.maintenance} maintenance</P>
              <P style={{ marginTop: 8 }}>{r.description}</P>
              <P style={{ marginTop: 6 }}><Text style={{ fontWeight: "700" }}>Why it suits you: </Text>{r.whyItSuits}</P>
              <View style={{ backgroundColor: t.chip, borderRadius: 10, padding: 10, marginTop: 10 }}>
                <P style={{ fontWeight: "700" }}>💬 Tell your barber</P>
                <P>"{r.askYourBarber}"</P>
              </View>
            </Card>
          ))}
          {!!result.advice.beardAdvice && (
            <Card>
              <P><Text style={{ fontWeight: "700" }}>Beard: </Text>{result.advice.beardAdvice}</P>
            </Card>
          )}

          <H2>Barbers who nail these cuts{place?.city ? ` in ${place.city}` : ""}</H2>
          {result.barbers.length === 0 && <P muted>Pick your city on the Home tab to see matching barbers near you.</P>}
          {result.barbers.map((b) => <BarberCard key={b.id} barber={b} />)}
        </>
      )}
    </Screen>
  );
}
