import { router } from "expo-router";
import { Pressable, View } from "react-native";
import { useTapGuard } from "../lib/pressGuard";
import { money } from "../lib/format";
import type { Barber } from "../lib/types";
import { colors, fonts, radius } from "./theme";
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

/** " · 1.2 km" when the search knows where the customer is. */
const distance = (b: Barber) => (b.distanceKm === undefined ? "" : ` · ${b.distanceKm < 1 ? `${Math.round(b.distanceKm * 1000)} m` : `${b.distanceKm < 100 ? b.distanceKm.toFixed(1) : Math.round(b.distanceKm)} km`}`);

/** List row: photo left, details right. */
export function BarberCard({ barber, showCountry, onPress }: { barber: Barber; showCountry?: boolean; onPress?: () => void }) {
  const next = nextFreeLabel(barber.nextAvailable, barber.timeZone);
  const tap = useTapGuard(onPress ?? (() => open(barber.id)));
  return (
    <Pressable
      {...tap}
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
            <T variant="caption" muted numberOfLines={1}>{barber.city}, {barber.countryName}{distance(barber)}</T>
          </>
        ) : (
          <Row gap={6} style={{ marginTop: 3 }}>
            <Rating value={barber.rating} count={barber.ratingCount} />
            <T variant="caption" muted>· {barber.city}{distance(barber)}</T>
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

/** The solid-gold "#1" badge for the city's top-rated barber. */
export function RankBadge() {
  return (
    <View accessibilityLabel="Number 1 in the city" style={{ height: 28, paddingHorizontal: 10, borderRadius: 14, backgroundColor: colors.gold, justifyContent: "center" }}>
      <T variant="small" color={colors.ink} style={{ fontFamily: fonts.bold }}>#1</T>
    </View>
  );
}

/** Carousel tile: big photo on top. */
export function BarberTile({ barber, rank }: { barber: Barber; rank?: number }) {
  const tap = useTapGuard(() => open(barber.id));
  return (
    <Pressable {...tap} accessibilityRole="button" accessibilityLabel={barber.name} style={({ pressed }) => [{ width: 168 }, pressed && styles.pressed]}>
      <Photo uri={barber.photoUrl} name={barber.name} style={{ width: 168, height: 168 }} rounded={radius.lg} />
      <Row gap={6} style={{ position: "absolute", top: 10, left: 10, right: 10 }}>
        {rank === 1 && <RankBadge />}
        {barber.offersHomeVisits && <Tag label="Comes to you" tone="light" icon="home-outline" />}
      </Row>
      <T variant="strong" numberOfLines={1} style={{ marginTop: 10 }}>{barber.name}</T>
      <Row gap={6} style={{ marginTop: 2 }}>
        <Rating value={barber.rating} />
        <T variant="caption" muted>· from {money(barber.startingPrice, barber.currency)}</T>
      </Row>
    </Pressable>
  );
}

