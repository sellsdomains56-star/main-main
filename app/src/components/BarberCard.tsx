import { router } from "expo-router";
import { Pressable, View } from "react-native";
import { money } from "../lib/format";
import type { Barber } from "../lib/types";
import { radius } from "./theme";
import { Photo, Rating, Row, styles, T, Tag } from "./ui";

const open = (id: string) => router.push({ pathname: "/barber/[id]", params: { id } });

/** "Today 14:30" / "Tue 09:00" in the barber's local time. */
export function nextFreeLabel(iso: string | null, timeZone: string) {
  if (!iso) return null;
  const today = new Intl.DateTimeFormat("en-CA", { timeZone }).format(new Date());
  const day = new Intl.DateTimeFormat("en-CA", { timeZone }).format(new Date(iso));
  const t = new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit", timeZone }).format(new Date(iso));
  if (day === today) return `Today ${t}`;
  return `${new Intl.DateTimeFormat(undefined, { weekday: "short", timeZone }).format(new Date(iso))} ${t}`;
}

/** List row: photo left, details right. */
export function BarberCard({ barber, showCountry, onPress }: { barber: Barber; showCountry?: boolean; onPress?: () => void }) {
  const next = nextFreeLabel(barber.nextAvailable, barber.timeZone);
  return (
    <Pressable
      onPress={onPress ?? (() => open(barber.id))}
      accessibilityRole="button"
      accessibilityLabel={`${barber.name}, ${barber.rating ?? "new"} stars, ${barber.city}`}
      style={({ pressed }) => [{ flexDirection: "row", gap: 14, paddingVertical: 14, cursor: "pointer" } as object, pressed && styles.pressed]}
    >
      <Photo uri={barber.photoUrl} name={barber.name} style={{ width: 88, height: 88 }} rounded={radius.lg} />
      <View style={{ flex: 1, justifyContent: "center" }}>
        <T variant="heading" numberOfLines={1}>{barber.name}</T>
        {showCountry ? (
          <>
            <Rating value={barber.rating} count={barber.ratingCount} />
            <T variant="caption" muted numberOfLines={1}>{barber.city}, {barber.countryName}</T>
          </>
        ) : (
          <Row gap={6} style={{ marginTop: 3 }}>
            <Rating value={barber.rating} count={barber.ratingCount} />
            <T variant="caption" muted>· {barber.city}</T>
          </Row>
        )}
        <T variant="caption" muted numberOfLines={1} style={{ marginTop: 3 }}>
          {barber.yearsExperience ? `${barber.yearsExperience} yrs · ` : ""}{barber.specialties.slice(0, 3).join(" · ")}
        </T>
        <Row gap={6} style={{ marginTop: 8, flexWrap: "wrap" }}>
          <Tag label={`from ${money(barber.startingPrice, barber.currency)}`} />
          {next && <Tag label={next} tone="accent" icon="time-outline" />}
          {barber.offersHomeVisits && <Tag label="Comes to you" tone="neutral" icon="home-outline" />}
        </Row>
      </View>
    </Pressable>
  );
}

/** Carousel tile: big photo on top. */
export function BarberTile({ barber }: { barber: Barber }) {
  return (
    <Pressable onPress={() => open(barber.id)} style={({ pressed }) => [{ width: 168 }, pressed && styles.pressed]}>
      <Photo uri={barber.photoUrl} name={barber.name} style={{ width: 168, height: 168 }} rounded={radius.lg} />
      {barber.offersHomeVisits && (
        <View style={{ position: "absolute", top: 10, left: 10 }}>
          <Tag label="Comes to you" tone="light" icon="home-outline" />
        </View>
      )}
      <T variant="strong" numberOfLines={1} style={{ marginTop: 10 }}>{barber.name}</T>
      <Row gap={6} style={{ marginTop: 2 }}>
        <Rating value={barber.rating} />
        <T variant="caption" muted>· from {money(barber.startingPrice, barber.currency)}</T>
      </Row>
    </Pressable>
  );
}

