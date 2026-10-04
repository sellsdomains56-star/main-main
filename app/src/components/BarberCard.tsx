import { router } from "expo-router";
import { Pressable, View } from "react-native";
import { money } from "../lib/format";
import type { Barber } from "../lib/types";
import { radius } from "./theme";
import { Photo, Rating, Row, styles, T, Tag } from "./ui";

const open = (id: string) => router.push({ pathname: "/barber/[id]", params: { id } });

/** List row: photo left, details right. */
export function BarberCard({ barber }: { barber: Barber }) {
  return (
    <Pressable onPress={() => open(barber.id)} style={({ pressed }) => [{ flexDirection: "row", gap: 14, paddingVertical: 12 }, pressed && styles.pressed]}>
      <Photo uri={barber.photoUrl} name={barber.name} style={{ width: 84, height: 84 }} rounded={radius.lg} />
      <View style={{ flex: 1, justifyContent: "center" }}>
        <T variant="heading" numberOfLines={1}>{barber.name}</T>
        <Row gap={6} style={{ marginTop: 3 }}>
          <Rating value={barber.rating} count={barber.ratingCount} />
          <T variant="caption" muted>· {barber.city}</T>
        </Row>
        <T variant="caption" muted numberOfLines={1} style={{ marginTop: 3 }}>{barber.specialties.slice(0, 3).join(" · ")}</T>
        <Row gap={6} style={{ marginTop: 8 }}>
          <Tag label={`from ${money(barber.startingPrice, barber.currency)}`} />
          {barber.offersHomeVisits && <Tag label="Comes to you" tone="gold" icon="home" />}
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
          <Tag label="Comes to you" tone="gold" icon="home" />
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

