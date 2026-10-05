import { Ionicons } from "@expo/vector-icons";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { router, Stack } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Platform, useWindowDimensions, View } from "react-native";
import { BarberCard } from "../components/BarberCard";
import { BeforeAfter } from "../components/BeforeAfter";
import { colors, radius } from "../components/theme";
import { Button, Card, Divider, ErrorBox, Field, IconLine, Pill, Row, Screen, Segmented, StepCard, StepConnector, T, Tag, Wrap } from "../components/ui";
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

  const step1 = photo ? "done" : "active";
  const step2 = result ? "done" : photo ? "active" : "upcoming";
  const step3 = result ? "active" : "upcoming";

  return (
    <Screen
      footer={
        !result ? (
          <Button title={user ? "Analyse my photo" : "Sign in to start"} icon="sparkles" onPress={analyse} loading={loading} disabled={!!user && !photo} />
        ) : undefined
      }
    >
      <Stack.Screen options={{ title: "AI Try-On" }} />
      <T variant="eyebrow">AI hairstyle try-on</T>
      <T variant="display" style={{ marginTop: 8 }}>See it before{"\n"}you book it</T>
      <T muted style={{ marginTop: 8 }}>We read your face shape and hair, recommend cuts, colours and beards, and show you how they'd look on you.</T>

      <View style={{ marginTop: 24 }}>
        <StepCard step={1} title="Your photo" state={step1}>
          {photo ? (
            <Row gap={16}>
              <Image source={{ uri: photo.uri }} style={{ width: 96, height: 96, borderRadius: radius.lg }} accessibilityLabel="Your photo" />
              <View style={{ flex: 1 }}>
                <T variant="caption" muted>Looking good. Want a different angle?</T>
                <Button title="Change photo" variant="secondary" size="sm" icon="refresh" onPress={() => pick("library")} style={{ alignSelf: "flex-start", marginTop: 10 }} />
              </View>
            </Row>
          ) : (
            <>
              <T muted>Face the camera · good light · no hat or sunglasses</T>
              <Row gap={10} style={{ marginTop: 16, flexWrap: "wrap" }}>
                {Platform.OS !== "web" && <Button title="Take selfie" icon="camera-outline" size="md" onPress={() => pick("camera")} />}
                <Button title={Platform.OS === "web" ? "Upload photo" : "Library"} icon="image-outline" size="md" variant={Platform.OS === "web" ? "primary" : "secondary"} onPress={() => pick("library")} />
              </Row>
            </>
          )}
          <View style={{ marginTop: 14 }}>
            <IconLine icon="lock-closed-outline" muted>Only used to create your recommendations and previews. Never stored.</IconLine>
          </View>
        </StepCard>

        <StepConnector lit={!!photo} />

        <StepCard step={2} title="Your preferences" state={step2}>
          {!result ? (
            <>
              <T variant="caption" muted style={{ marginBottom: 8 }}>Length</T>
              <Wrap>{LENGTHS.map((l) => <Pill key={l} label={l} selected={length === l} onPress={() => toggle(l, length, setLength)} />)}</Wrap>
              <T variant="caption" muted style={{ marginTop: 16, marginBottom: 8 }}>Maintenance</T>
              <Wrap>{MAINTENANCE.map((m) => <Pill key={m} label={m} selected={maintenance === m} onPress={() => toggle(m, maintenance, setMaintenance)} />)}</Wrap>
              <T variant="caption" muted style={{ marginTop: 16, marginBottom: 8 }}>Vibe</T>
              <Wrap>{VIBES.map((v) => <Pill key={v} label={v} selected={vibe === v} onPress={() => toggle(v, vibe, setVibe)} />)}</Wrap>
              <View style={{ marginTop: 16 }}>
                <Field label="Anything else? (optional)" placeholder="e.g. growing it out, I play sports" value={notes} onChangeText={setNotes} style={{ marginBottom: 0 }} />
              </View>
              {loading && <T variant="caption" color={colors.gold} style={{ marginTop: 12 }}>Studying your face shape and hair…</T>}
            </>
          ) : (
            <T variant="caption" muted>{[length, maintenance, vibe].filter(Boolean).join(" · ") || "No preferences — open to anything"}</T>
          )}
        </StepCard>

        {error && <View style={{ marginTop: 12 }}><ErrorBox message={error} /></View>}

        <StepConnector lit={!!result} side="right" />

        <StepCard step={3} title="Looks for you" state={step3}>
          {result ? (
            <>
              <Row gap={8} style={{ flexWrap: "wrap" }}>
                <Tag label={`${result.advice.faceShape} face`} tone="gold" />
                <Tag label={result.advice.hairType} />
              </Row>
              <T style={{ marginTop: 12 }}>{result.advice.summary}</T>
              {!tryOnEnabled && (
                <View style={{ marginTop: 12 }}>
                  <IconLine icon="information-circle-outline" muted>Picture previews aren't switched on yet — the recommendations and booking still work.</IconLine>
                </View>
              )}
              <View style={{ marginTop: 16 }}>
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
              </View>
            </>
          ) : (
            <T variant="caption" muted>Cuts, fades, colours and beard styles picked for your face — each one you can preview on your own photo.</T>
          )}
        </StepCard>

        {result && (
          <View style={{ marginTop: 14 }}>
            {looks.length === 0 && <T muted>No suggestions in this category for you.</T>}
            {looks.map((r, i) => {
              const p = previews[r.name];
              const best = i === 0 && category === "all";
              return (
                <Card key={r.name} glowing={best || p?.status === "done"} style={{ marginTop: 12, padding: 18 }}>
                  <Row gap={8} style={{ flexWrap: "wrap" }}>
                    {best && <Tag label="Best match" tone="dark" icon="trophy-outline" />}
                    <Tag label={r.category === "color" ? "Colour" : r.category === "beard" ? "Beard" : "Haircut"} />
                    <Tag label={`${r.maintenance} maintenance`} />
                  </Row>
                  <T variant="title" style={{ marginTop: 12, fontSize: 21, lineHeight: 27 }}>{r.name}</T>
                  <T muted style={{ marginTop: 6 }}>{r.description}</T>
                  <T variant="caption" color={colors.goldDeep} style={{ marginTop: 6 }}>{r.whyItSuits}</T>

                  {p?.status === "done" && p.image && photo && (
                    <View style={{ marginTop: 14 }}>
                      <BeforeAfter beforeUri={photo.uri} afterUri={p.image} beforeLabel="You now" afterLabel="New look" height={compareSize - 36} />
                      <T variant="small" muted style={{ marginTop: 6 }}>AI preview — the real result depends on your hair. Show it to your barber.</T>
                    </View>
                  )}
                  {p?.status === "loading" && (
                    <View style={{ marginTop: 14, height: 120, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.goldLine, alignItems: "center", justifyContent: "center", padding: 16 }}>
                      <Ionicons name="sparkles" size={22} color={colors.gold} />
                      <T variant="caption" muted center style={{ marginTop: 8 }}>Creating your preview… usually 15–30 seconds.</T>
                    </View>
                  )}
                  {p?.status === "error" && <View style={{ marginTop: 12 }}><ErrorBox message={p.error ?? "Preview failed."} onRetry={() => preview(r.name, r.previewPrompt)} /></View>}

                  <View style={{ backgroundColor: colors.surface, borderRadius: radius.md, padding: 14, marginTop: 14, borderWidth: 1, borderColor: colors.border }}>
                    <T variant="eyebrow">Tell your barber</T>
                    <T style={{ marginTop: 6 }}>"{r.askYourBarber}"</T>
                  </View>

                  <Row gap={10} style={{ marginTop: 14, flexWrap: "wrap" }}>
                    {tryOnEnabled && p?.status !== "done" && (
                      <Button title="Preview on me" icon="sparkles" size="md" loading={p?.status === "loading"} onPress={() => preview(r.name, r.previewPrompt)} />
                    )}
                    <Button title="Find barbers" icon="search" size="md" variant={tryOnEnabled && p?.status !== "done" ? "secondary" : "primary"} onPress={() => findBarbers(r.specialtyTags)} />
                  </Row>
                </Card>
              );
            })}

            {tryOnEnabled && (
              <Card style={{ marginTop: 12, padding: 18 }}>
                <T variant="eyebrow">Your own idea</T>
                <View style={{ marginTop: 10 }}>
                  <Field label="Describe a look" value={customLook} onChangeText={setCustomLook} placeholder="e.g. platinum blonde buzz cut" />
                </View>
                <Button title="Preview on me" icon="sparkles" size="md" disabled={customLook.trim().length < 3} loading={previews.custom?.status === "loading"} onPress={() => preview("custom", customLook.trim())} style={{ alignSelf: "flex-start" }} />
                {previews.custom?.status === "done" && previews.custom.image && photo && (
                  <View style={{ marginTop: 14 }}>
                    <BeforeAfter beforeUri={photo.uri} afterUri={previews.custom.image} beforeLabel="You now" afterLabel="Your idea" height={compareSize - 36} />
                  </View>
                )}
                {previews.custom?.status === "error" && <View style={{ marginTop: 12 }}><ErrorBox message={previews.custom.error ?? "Preview failed."} /></View>}
              </Card>
            )}

            {!!result.advice.beardAdvice && (
              <Card tone="surface" style={{ marginTop: 12 }}>
                <T variant="eyebrow">Beard tip</T>
                <T style={{ marginTop: 6 }}>{result.advice.beardAdvice}</T>
              </Card>
            )}
          </View>
        )}

        <StepConnector lit={!!result} />

        <StepCard step={4} title="Book the look" state={result ? "active" : "upcoming"}>
          {result ? (
            <>
              <T variant="caption" muted>Barbers who specialise in these styles{place?.city ? ` in ${place.city}` : ""}:</T>
              {result.barbers.length === 0 && <T muted style={{ marginTop: 8 }}>Choose your city on Home to see matching barbers near you.</T>}
              {result.barbers.map((b, i) => (
                <View key={b.id}>
                  {i > 0 && <Divider style={{ marginVertical: 0 }} />}
                  <BarberCard barber={b} />
                </View>
              ))}
            </>
          ) : (
            <T variant="caption" muted>Pick a look and we'll show barbers who nail it, with their next free time.</T>
          )}
        </StepCard>

        {result && (
          <Button title="Start over with a new photo" variant="ghost" size="sm" onPress={() => { setResult(null); setPhoto(null); setPreviews({}); }} style={{ marginTop: 16, alignSelf: "center" }} />
        )}
      </View>
    </Screen>
  );
}
