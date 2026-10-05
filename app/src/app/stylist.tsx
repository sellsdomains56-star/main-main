import { Ionicons } from "@expo/vector-icons";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { router, Stack } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Platform, useWindowDimensions, View } from "react-native";
import { BarberCard } from "../components/BarberCard";
import { BeforeAfter } from "../components/BeforeAfter";
import { colors, fonts, radius } from "../components/theme";
import { Button, Card, Divider, ErrorBox, Field, GoldIcon, IconLine, Pill, Row, Screen, Section, Segmented, T, Tag, Wrap } from "../components/ui";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import { useLocation } from "../lib/location";
import type { Barber, HaircutRecommendation, StyleAdvice } from "../lib/types";

const LENGTHS = ["very short", "short", "medium", "long"];
const MAINTENANCE = ["low", "medium", "high"];
const VIBES = ["clean & classic", "trendy", "bold", "natural", "professional"];
type Category = "all" | HaircutRecommendation["category"];

interface Preview {
  status: "loading" | "done" | "error";
  image?: string;
  error?: string;
}

/**
 * AI Hairstyle Try-On: Claude analyses the photo and recommends looks; OpenAI image editing
 * renders each look on the customer's own face. Photos stay on the device except while a
 * request is being processed.
 */
export default function TryOn() {
  const { user } = useAuth();
  const { place } = useLocation();
  const { width } = useWindowDimensions();
  const [photo, setPhoto] = useState<{ uri: string; base64: string } | null>(null);
  const [length, setLength] = useState("");
  const [maintenance, setMaintenance] = useState("");
  const [vibe, setVibe] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ advice: StyleAdvice; barbers: Barber[] } | null>(null);
  const [category, setCategory] = useState<Category>("all");
  const [previews, setPreviews] = useState<Record<string, Preview>>({});
  const [customLook, setCustomLook] = useState("");
  const [tryOnEnabled, setTryOnEnabled] = useState(true);

  useEffect(() => {
    api.health().then((h) => setTryOnEnabled(h.tryOn), () => {});
  }, []);

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
    // 1024px square is what the image model works at, and keeps uploads fast.
    const rendered = await ImageManipulator.manipulate(res.assets[0].uri).resize({ width: 1024 }).renderAsync();
    const saved = await rendered.saveAsync({ compress: 0.85, format: SaveFormat.JPEG, base64: true });
    setPhoto({ uri: saved.uri, base64: saved.base64! });
    setResult(null);
    setPreviews({});
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

  async function preview(key: string, look: string) {
    if (!photo) return;
    setPreviews((p) => ({ ...p, [key]: { status: "loading" } }));
    try {
      const { image } = await api.tryOnPreview({ imageBase64: photo.base64, mediaType: "image/jpeg", look });
      setPreviews((p) => ({ ...p, [key]: { status: "done", image } }));
    } catch (e) {
      setPreviews((p) => ({ ...p, [key]: { status: "error", error: (e as Error).message } }));
    }
  }

  const findBarbers = (tags: string[]) =>
    router.push({ pathname: "/explore", params: { specialty: tags.join(","), ...(place ? {} : { anywhere: "1" }) } });

  const toggle = (value: string, current: string, set: (v: string) => void) => set(current === value ? "" : value);
  const looks = result?.advice.recommendations.filter((r) => category === "all" || r.category === category) ?? [];
  const compareSize = Math.min(width - 40, 520);

  return (
    <Screen
      footer={
        !result ? (
          <Button title={user ? "Analyse my photo" : "Sign in to start"} icon="sparkles" onPress={analyse} loading={loading} disabled={!!user && !photo} />
        ) : undefined
      }
    >
      <Stack.Screen options={{ title: "AI Try-On" }} />
      <T variant="small" color={colors.goldDeep} style={{ letterSpacing: 2, fontFamily: fonts.semibold }}>AI HAIRSTYLE TRY-ON</T>
      <T variant="display" style={{ marginTop: 4 }}>See it before you book it</T>
      <T muted style={{ marginTop: 6 }}>
        Upload a photo. We read your face shape and hair, recommend cuts, colours and beard styles, and show you how they'd look on you.
      </T>

      <Row gap={8} style={{ marginTop: 14, flexWrap: "wrap" }}>
        <Step n={1} label="Photo" done={!!photo} />
        <Step n={2} label="Analysis" done={!!result} />
        <Step n={3} label="Try looks" done={Object.values(previews).some((p) => p.status === "done")} />
        <Step n={4} label="Book" />
      </Row>

      <View style={{ marginTop: 20 }}>
        {photo ? (
          <View style={{ alignItems: "center" }}>
            <Image source={{ uri: photo.uri }} style={{ width: 200, height: 200, borderRadius: radius.xl }} accessibilityLabel="Your photo" />
            <Button title="Change photo" variant="ghost" size="sm" icon="refresh" onPress={() => pick("library")} style={{ marginTop: 6 }} />
          </View>
        ) : (
          <View style={{ borderWidth: 1.5, borderStyle: "dashed", borderColor: colors.surfaceStrong, borderRadius: radius.xl, padding: 24, alignItems: "center", backgroundColor: colors.card }}>
            <GoldIcon icon="person-circle-outline" size={64} />
            <T variant="strong" style={{ marginTop: 12 }}>Add a clear photo of your face</T>
            <T variant="caption" muted center style={{ marginTop: 4 }}>Face the camera · good light · no hat or sunglasses</T>
            <Row gap={10} style={{ marginTop: 16 }}>
              {Platform.OS !== "web" && <Button title="Take selfie" icon="camera-outline" size="md" onPress={() => pick("camera")} />}
              <Button title={Platform.OS === "web" ? "Upload photo" : "Library"} icon="image-outline" size="md" variant={Platform.OS === "web" ? "primary" : "secondary"} onPress={() => pick("library")} />
            </Row>
          </View>
        )}
        <View style={{ marginTop: 12 }}>
          <IconLine icon="lock-closed-outline" muted>Your photo is only used to create your recommendations and previews. We don't store it.</IconLine>
        </View>
      </View>

      {!result && (
        <Section title="Your preferences (optional)">
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
      {loading && <T variant="caption" muted center style={{ marginTop: 12 }}>Studying your face shape and hair… a few seconds.</T>}

      {result && (
        <>
          <Card style={{ marginTop: 22 }}>
            <Row gap={8} style={{ flexWrap: "wrap" }}>
              <Tag label={`${result.advice.faceShape} face`} tone="gold" />
              <Tag label={result.advice.hairType} />
              <Tag label={`Now: ${result.advice.currentStyle}`} />
            </Row>
            <T style={{ marginTop: 12 }}>{result.advice.summary}</T>
          </Card>

          {!tryOnEnabled && (
            <View style={{ marginTop: 12 }}>
              <IconLine icon="information-circle-outline" muted>Picture previews aren't switched on yet — you can still use the recommendations and book.</IconLine>
            </View>
          )}

          <Section title="Looks for you">
            <Segmented<Category>
              value={category}
              onChange={setCategory}
              options={[
                { value: "all", label: "All" },
                { value: "haircut", label: "Cuts" },
                { value: "color", label: "Colour" },
                { value: "beard", label: "Beard" },
              ]}
            />
            {looks.length === 0 && <T muted style={{ marginTop: 14 }}>No suggestions in this category for you.</T>}
            {looks.map((r, i) => {
              const p = previews[r.name];
              return (
                <Card key={r.name} style={{ marginTop: 14, ...(i === 0 && category === "all" ? { borderColor: colors.gold, borderWidth: 1.5 } : {}) }}>
                  <Row gap={8} style={{ flexWrap: "wrap" }}>
                    {i === 0 && category === "all" && <Tag label="Best match" tone="dark" icon="trophy-outline" />}
                    <Tag label={r.category === "color" ? "Colour" : r.category === "beard" ? "Beard" : "Haircut"} />
                    <Tag label={`${r.maintenance} maintenance`} />
                  </Row>
                  <T variant="heading" style={{ marginTop: 10 }}>{r.name}</T>
                  <T style={{ marginTop: 6 }}>{r.description}</T>
                  <T variant="caption" muted style={{ marginTop: 6 }}>{r.whyItSuits}</T>

                  {p?.status === "done" && p.image && photo && (
                    <View style={{ marginTop: 14 }}>
                      <BeforeAfter beforeUri={photo.uri} afterUri={p.image} beforeLabel="You now" afterLabel="New look" height={compareSize - 32} />
                      <T variant="small" muted style={{ marginTop: 6 }}>AI preview — the real result depends on your hair. Show it to your barber.</T>
                    </View>
                  )}
                  {p?.status === "loading" && (
                    <View style={{ marginTop: 14, height: 120, borderRadius: radius.lg, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center", padding: 16 }}>
                      <Ionicons name="sparkles" size={22} color={colors.gold} />
                      <T variant="caption" muted center style={{ marginTop: 8 }}>Creating your preview… usually 15–30 seconds.</T>
                    </View>
                  )}
                  {p?.status === "error" && <View style={{ marginTop: 12 }}><ErrorBox message={p.error ?? "Preview failed."} onRetry={() => preview(r.name, r.previewPrompt)} /></View>}

                  <View style={{ backgroundColor: colors.surface, borderRadius: radius.md, padding: 12, marginTop: 14 }}>
                    <T variant="small" color={colors.goldDeep} style={{ fontFamily: fonts.semibold }}>TELL YOUR BARBER</T>
                    <T style={{ marginTop: 4 }}>"{r.askYourBarber}"</T>
                  </View>

                  <Row gap={10} style={{ marginTop: 14, flexWrap: "wrap" }}>
                    {tryOnEnabled && p?.status !== "done" && (
                      <Button title="Preview on me" icon="sparkles" size="md" variant="gold" loading={p?.status === "loading"} onPress={() => preview(r.name, r.previewPrompt)} />
                    )}
                    <Button title="Find barbers for this look" icon="search" size="md" variant={tryOnEnabled && p?.status !== "done" ? "secondary" : "primary"} onPress={() => findBarbers(r.specialtyTags)} />
                  </Row>
                </Card>
              );
            })}
          </Section>

          {tryOnEnabled && (
            <Section title="Try your own idea">
              <Field label="Describe a look" value={customLook} onChangeText={setCustomLook} placeholder="e.g. platinum blonde buzz cut, or full beard with sharp line-up" />
              <Button title="Preview on me" icon="sparkles" size="md" variant="gold" disabled={customLook.trim().length < 3} loading={previews.custom?.status === "loading"} onPress={() => preview("custom", customLook.trim())} style={{ alignSelf: "flex-start" }} />
              {previews.custom?.status === "done" && previews.custom.image && photo && (
                <View style={{ marginTop: 14 }}>
                  <BeforeAfter beforeUri={photo.uri} afterUri={previews.custom.image} beforeLabel="You now" afterLabel="Your idea" height={compareSize} />
                </View>
              )}
              {previews.custom?.status === "error" && <View style={{ marginTop: 12 }}><ErrorBox message={previews.custom.error ?? "Preview failed."} /></View>}
            </Section>
          )}

          {!!result.advice.beardAdvice && (
            <Card tone="surface" style={{ marginTop: 20 }}>
              <T variant="strong">Beard tip</T>
              <T style={{ marginTop: 4 }}>{result.advice.beardAdvice}</T>
            </Card>
          )}

          <Section title={`Barbers who nail these${place?.city ? ` in ${place.city}` : ""}`}>
            {result.barbers.length === 0 && <T muted>Choose your city on Home to see matching barbers near you.</T>}
            {result.barbers.map((b, i) => (
              <View key={b.id}>
                {i > 0 && <Divider style={{ marginVertical: 0 }} />}
                <BarberCard barber={b} />
              </View>
            ))}
          </Section>
          <Button title="Start over with a new photo" variant="ghost" size="sm" onPress={() => { setResult(null); setPhoto(null); setPreviews({}); }} style={{ marginTop: 16, alignSelf: "center" }} />
        </>
      )}
    </Screen>
  );
}

function Step({ n, label, done }: { n: number; label: string; done?: boolean }) {
  return (
    <Row gap={6}>
      <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: done ? colors.ink : colors.surface, alignItems: "center", justifyContent: "center" }}>
        {done ? <Ionicons name="checkmark" size={13} color={colors.gold} /> : <T variant="small" muted>{n}</T>}
      </View>
      <T variant="caption" muted={!done}>{label}</T>
    </Row>
  );
}
