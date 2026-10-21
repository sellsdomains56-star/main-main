import { router } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Image, Platform, Pressable, useWindowDimensions, View } from "react-native";
import { BeforeAfter } from "../components/BeforeAfter";
import { BarberMap } from "../components/map/BarberMap";
import { barberPins } from "../components/map/types";
import { colors, radius } from "../components/theme";
import { Button, EmptyState, ErrorBox, Field, IconButton, Loading, OptionRow, Photo, Row, Screen, Section, T } from "../components/ui";
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
  const [bio, setBio] = useState("");
  const [specialties, setSpecialties] = useState("");
  const [meetLink, setMeetLink] = useState("");
  const [consults, setConsults] = useState(true);
  const [savedNote, setSavedNote] = useState<string | null>(null);
  const [pair, setPair] = useState<{ before?: string; after?: string; caption: string }>({ caption: "" });
  const [busy, setBusy] = useState<string | null>(null);
  const [address, setAddress] = useState("");
  const [spotSaved, setSpotSaved] = useState(false);
  const spot = useRef<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!user?.barberId) return;
    api.barber(user.barberId).then((b) => {
      setBarber(b);
      setYears(b.yearsExperience ? String(b.yearsExperience) : "");
      setLanguages(b.languages.join(", "));
      setBio(b.bio);
      setSpecialties(b.specialties.join(", "));
      setAddress(b.shopAddress);
    }, (e: Error) => setError(e.message));
    api.myBarberSettings().then((s) => {
      setMeetLink(s.videoLink);
      setConsults(s.offersConsultations);
    }, () => {});
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

      <Section title="About you">
        <Field label="Short bio" value={bio} onChangeText={setBio} multiline maxLength={400} placeholder="e.g. Precision fades and beard sculpting. Ten years behind the chair in Beirut and Dubai." />
        <Field label="Specialties" value={specialties} onChangeText={setSpecialties} placeholder="e.g. skin fade, beard, curly hair" />
        <Field label="Years of experience" value={years} onChangeText={setYears} keyboardType="number-pad" placeholder="e.g. 8" />
        <Field label="Languages you speak" value={languages} onChangeText={setLanguages} placeholder="e.g. English, Arabic, French" />
        <Button
          title="Save"
          size="md"
          loading={busy === "details"}
          onPress={() => run("details", () => api.updateMyBarber({
            bio: bio.trim(),
            specialties: specialties.split(",").map((t) => t.trim()).filter(Boolean).slice(0, 8),
            yearsExperience: Math.max(0, Math.min(70, parseInt(years, 10) || 0)),
            languages: languages.split(",").map((l) => l.trim()).filter(Boolean),
          }))}
          style={{ alignSelf: "flex-start" }}
        />
      </Section>

      <Section title="Your spot on the map">
        {barber.shop ? (
          <T variant="caption" muted>You work at {barber.shop.name}, so customers see the shop's pin at {barber.shopAddress}.</T>
        ) : Platform.OS === "web" && barber.countryCode !== "AE" ? (
          <T variant="caption" muted>Set your exact spot in the JB Always Fresh app on your phone — the website's detailed 3D map covers the UAE.</T>
        ) : (
          <>
            <T variant="caption" muted style={{ marginBottom: 12 }}>Customers see exactly where your chair is, down to the building. Move the map until the pin sits on your door, then save.</T>
            <BarberMap pins={barberPins([barber])} height={300} tilt={false} onCenter={(lat, lng) => (spot.current = { lat, lng })} placeName={barber.city} />
            <View style={{ marginTop: 12 }}>
              <Field label="Address customers see" value={address} onChangeText={setAddress} placeholder="e.g. Shop 4, Bay Avenue, Business Bay" />
            </View>
            <Row gap={12}>
              <Button
                title="Save this spot"
                icon="location-outline"
                size="md"
                loading={busy === "spot"}
                onPress={() => run("spot", async () => {
                  const at = spot.current;
                  if (!at) return;
                  const b = await api.updateMyBarber({ lat: Math.round(at.lat * 1e6) / 1e6, lng: Math.round(at.lng * 1e6) / 1e6, ...(address.trim() ? { shopAddress: address.trim() } : {}) });
                  setSpotSaved(true);
                  return b;
                })}
              />
              {spotSaved && <T variant="caption" muted>Saved — that's your pin now.</T>}
            </Row>
          </>
        )}
      </Section>

      <Section title="Consultations">
        <T variant="caption" muted style={{ marginBottom: 12 }}>
          Customers can book a free 15-minute video call or phone call with you before they book a cut. Paste your Google Meet link so they can join — open meet.google.com, start a meeting and copy its link.
        </T>
        <OptionRow label="Offer free consultations" sublabel="Video call on Google Meet or a phone call" icon="videocam-outline" selected={consults} onPress={() => setConsults(!consults)} />
        <Field label="Your Google Meet link" value={meetLink} onChangeText={setMeetLink} autoCapitalize="none" keyboardType="url" placeholder="https://meet.google.com/abc-defg-hij" />
        <Row gap={10}>
          <Button
            title="Save"
            size="md"
            loading={busy === "consult"}
            onPress={() => run("consult", async () => {
              setSavedNote(null);
              const b = await api.updateMyBarber({ offersConsultations: consults, videoLink: meetLink.trim() });
              setSavedNote("Saved");
              return b;
            })}
          />
          {!!savedNote && <T variant="caption" muted>{savedNote}</T>}
        </Row>
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
            style={{ width: tile, height: tile, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderStyle: "dashed", borderColor: colors.accentLine, alignItems: "center", justifyContent: "center" }}
          >
            {busy === "gallery" ? <Loading /> : <T variant="caption" color={colors.accent}>+ Add photo</T>}
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
