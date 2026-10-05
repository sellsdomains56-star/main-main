import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Image, Pressable, useWindowDimensions, View } from "react-native";
import { BeforeAfter } from "../components/BeforeAfter";
import { colors, radius } from "../components/theme";
import { Button, EmptyState, ErrorBox, Field, IconButton, Loading, Photo, Row, Screen, Section, T } from "../components/ui";
import { api, mediaUrl } from "../lib/api";
import { useAuth } from "../lib/auth";
import { pickAndUploadImage } from "../lib/upload";
import type { Barber } from "../lib/types";

/** Barbers build their professional profile: photo, experience, languages, work photos and before/afters. */
export default function Portfolio() {
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const [barber, setBarber] = useState<Barber | null>(null);
  const [years, setYears] = useState("");
  const [languages, setLanguages] = useState("");
  const [pair, setPair] = useState<{ before?: string; after?: string; caption: string }>({ caption: "" });
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!user?.barberId) return;
    api.barber(user.barberId).then((b) => {
      setBarber(b);
      setYears(b.yearsExperience ? String(b.yearsExperience) : "");
      setLanguages(b.languages.join(", "));
    }, (e: Error) => setError(e.message));
  }, [user]);
  useEffect(load, [load]);

  if (user?.role !== "barber") {
    return <Screen><EmptyState icon="cut-outline" title="For barbers" body="Create a barber profile to show your work." action={{ label: "Join as a barber", onPress: () => router.replace("/become-barber") }} /></Screen>;
  }
  if (!barber) return <Screen>{error ? <ErrorBox message={error} onRetry={load} /> : <Loading />}</Screen>;

  const run = async (key: string, fn: () => Promise<Barber | void>) => {
    setBusy(key);
    setError(null);
    try {
      const next = await fn();
      if (next) setBarber(next);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const tile = (Math.min(width, 760) - 40 - 12) / 3;

  return (
    <Screen>
      <T variant="title">Your professional profile</T>
      <T muted style={{ marginTop: 4 }}>Customers decide from your work. Profiles with before-and-after photos get the most bookings.</T>
      {error && <View style={{ marginTop: 12 }}><ErrorBox message={error} /></View>}

      <Section title="Profile photo">
        <Row gap={16}>
          <Photo uri={mediaUrl(barber.photoUrl)} name={barber.name} style={{ width: 84, height: 84 }} rounded={42} />
          <Button
            title={barber.photoUrl ? "Change photo" : "Add photo"}
            icon="camera-outline"
            variant="secondary"
            size="md"
            loading={busy === "photo"}
            onPress={() => run("photo", async () => {
              const url = await pickAndUploadImage({ square: true });
              if (url) return api.updateMyBarber({ photoUrl: url });
            })}
          />
        </Row>
      </Section>

      <Section title="Experience">
        <Field label="Years of experience" value={years} onChangeText={setYears} keyboardType="number-pad" placeholder="e.g. 8" />
        <Field label="Languages you speak" value={languages} onChangeText={setLanguages} placeholder="e.g. English, Arabic, French" />
        <Button
          title="Save"
          size="md"
          loading={busy === "details"}
          onPress={() => run("details", () => api.updateMyBarber({
            yearsExperience: Math.max(0, Math.min(70, parseInt(years, 10) || 0)),
            languages: languages.split(",").map((l) => l.trim()).filter(Boolean),
          }))}
          style={{ alignSelf: "flex-start" }}
        />
      </Section>

      <Section title="Before & after">
        <T variant="caption" muted style={{ marginBottom: 12 }}>Add the same client's photo before and after the cut, from the same angle.</T>
        <Row gap={12}>
          {(["before", "after"] as const).map((side) => (
            <Pressable
              key={side}
              accessibilityLabel={`Choose ${side} photo`}
              onPress={() => run(side, async () => {
                const url = await pickAndUploadImage({ square: true });
                if (url) setPair((p) => ({ ...p, [side]: url }));
              })}
              style={{ flex: 1, aspectRatio: 1, borderRadius: radius.lg, overflow: "hidden", backgroundColor: colors.surface, borderWidth: 1.5, borderStyle: "dashed", borderColor: colors.surfaceStrong, alignItems: "center", justifyContent: "center" }}
            >
              {pair[side] ? (
                <Image source={{ uri: mediaUrl(pair[side])! }} style={{ width: "100%", height: "100%" }} />
              ) : busy === side ? (
                <Loading />
              ) : (
                <T variant="caption" muted>{side === "before" ? "Before photo" : "After photo"}</T>
              )}
            </Pressable>
          ))}
        </Row>
        <View style={{ marginTop: 12 }}>
          <Field label="Style name" value={pair.caption} onChangeText={(caption) => setPair((p) => ({ ...p, caption }))} placeholder="e.g. Mid skin fade + beard sculpt" />
        </View>
        <Button
          title="Add transformation"
          size="md"
          disabled={!pair.before || !pair.after}
          loading={busy === "pair"}
          onPress={() => run("pair", async () => {
            const next = await api.addTransformation(pair.before!, pair.after!, pair.caption);
            setPair({ caption: "" });
            return next;
          })}
          style={{ alignSelf: "flex-start" }}
        />
        {barber.transformations.map((t) => (
          <View key={t.id} style={{ marginTop: 16 }}>
            <BeforeAfter beforeUri={mediaUrl(t.beforeUrl)!} afterUri={mediaUrl(t.afterUrl)!} height={260} />
            <Row style={{ justifyContent: "space-between", marginTop: 6 }}>
              <T variant="caption" muted>{t.caption || "Untitled"}</T>
              <Button title="Remove" variant="ghost" size="sm" onPress={() => run(`t-${t.id}`, () => api.removeTransformation(t.id))} />
            </Row>
          </View>
        ))}
      </Section>

      <Section title="Photos of your work">
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
          <Pressable
            accessibilityLabel="Add a photo"
            onPress={() => run("gallery", async () => {
              const url = await pickAndUploadImage({ square: true });
              if (url) return api.addGalleryPhoto(url, "");
            })}
            style={{ width: tile, height: tile, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderStyle: "dashed", borderColor: colors.goldLine, alignItems: "center", justifyContent: "center" }}
          >
            {busy === "gallery" ? <Loading /> : <T variant="caption" color={colors.gold}>+ Add photo</T>}
          </Pressable>
          {barber.gallery.map((p) => (
            <View key={p.id}>
              <Image source={{ uri: mediaUrl(p.url)! }} style={{ width: tile, height: tile, borderRadius: radius.md, backgroundColor: colors.surface }} />
              <View style={{ position: "absolute", top: 4, right: 4 }}>
                <IconButton icon="trash-outline" label="Remove photo" onPress={() => run(`g-${p.id}`, () => api.removeGalleryPhoto(p.id))} />
              </View>
            </View>
          ))}
        </View>
      </Section>

      <Button title="View my public profile" variant="secondary" style={{ marginTop: 28 }} onPress={() => router.push({ pathname: "/barber/[id]", params: { id: barber.id } })} />
    </Screen>
  );
}
