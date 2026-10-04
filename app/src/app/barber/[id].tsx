import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import { ReelThumb } from "../../components/ReelThumb";
import { colors, radius } from "../../components/theme";
import { Avatar, Button, Divider, EmptyState, ErrorBox, Loading, Photo, Rating, Row, Screen, Segmented, T, Tag, Wrap } from "../../components/ui";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import { money } from "../../lib/format";
import { flag } from "../../lib/location";
import type { Barber, Reel, Review } from "../../lib/types";

type TabKey = "services" | "reels" | "reviews";

export default function BarberProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [barber, setBarber] = useState<(Barber & { reviews: Review[] }) | null>(null);
  const [reels, setReels] = useState<Reel[]>([]);
  const [tab, setTab] = useState<TabKey>("services");
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setError(null);
    api.barber(id).then((b) => {
      setBarber(b);
      setServiceId((s) => s ?? b.services[0]?.id ?? null);
    }, (e: Error) => setError(e.message));
    api.reels({ barberId: id }).then(setReels, () => {});
  }, [id]);
  useEffect(load, [load]);

  if (error) return <Screen><ErrorBox message={error} onRetry={load} /></Screen>;
  if (!barber) return <Screen><Loading /></Screen>;

  const service = barber.services.find((s) => s.id === serviceId);
  const isMe = user?.barberId === barber.id;

  return (
    <Screen
      footer={
        isMe ? (
          <Button title="Post a new reel" icon="videocam" onPress={() => router.push("/post-reel")} />
        ) : (
          <Button
            title={service ? `Book ${service.name} · ${money(service.price, barber.currency)}` : "Book now"}
            onPress={() => router.push({ pathname: "/book/[barberId]", params: { barberId: barber.id, ...(service ? { serviceId: service.id } : {}) } })}
          />
        )
      }
    >
      <Stack.Screen options={{ title: "" }} />
      <View style={{ alignItems: "center" }}>
        <Photo uri={barber.photoUrl} name={barber.name} style={{ width: 112, height: 112 }} rounded={56} />
        <T variant="title" style={{ marginTop: 14 }}>{barber.name}</T>
        <T variant="caption" muted style={{ marginTop: 2 }}>{flag(barber.countryCode)} {barber.city}, {barber.countryName}</T>
      </View>

      <Row gap={10} style={{ marginTop: 18 }}>
        <Stat value={barber.rating ? barber.rating.toFixed(1) : "New"} label={`${barber.ratingCount} reviews`} icon="star" />
        <Stat value={money(barber.startingPrice, barber.currency)} label="from" icon="pricetag" />
        <Stat value={barber.offersHomeVisits ? "Yes" : "Shop only"} label="Home visits" icon="home" />
      </Row>

      <T style={{ marginTop: 18 }}>{barber.bio}</T>
      <View style={{ marginTop: 12 }}>
        <Wrap gap={6}>{barber.specialties.map((s) => <Tag key={s} label={s} />)}</Wrap>
      </View>
      <Row gap={6} style={{ marginTop: 12 }}>
        <Ionicons name="location-outline" size={15} color={colors.muted} />
        <T variant="caption" muted>{barber.shopAddress}</T>
      </Row>

      <View style={{ marginTop: 22 }}>
        <Segmented<TabKey>
          value={tab}
          onChange={setTab}
          options={[
            { value: "services", label: "Services" },
            { value: "reels", label: `Reels${reels.length ? ` (${reels.length})` : ""}` },
            { value: "reviews", label: "Reviews" },
          ]}
        />
      </View>

      {tab === "services" && (
        <View style={{ marginTop: 8 }}>
          {barber.services.map((s, i) => {
            const selected = s.id === serviceId;
            return (
              <View key={s.id}>
                {i > 0 && <Divider style={{ marginVertical: 0 }} />}
                <Pressable onPress={() => setServiceId(s.id)} style={{ flexDirection: "row", alignItems: "center", paddingVertical: 16, gap: 12 }} accessibilityState={{ selected }}>
                  <View style={{ flex: 1 }}>
                    <T variant="strong">{s.name}</T>
                    <T variant="caption" muted>{s.durationMin} min</T>
                  </View>
                  <T variant="strong">{money(s.price, barber.currency)}</T>
                  <Ionicons name={selected ? "radio-button-on" : "radio-button-off"} size={22} color={selected ? colors.gold : colors.faint} />
                </Pressable>
              </View>
            );
          })}
          {barber.offersHomeVisits && <T variant="caption" muted>Home visit: +{money(barber.homeVisitFee, barber.currency)} travel fee</T>}
        </View>
      )}

      {tab === "reels" && (
        <View style={{ marginTop: 14 }}>
          {reels.length === 0 ? (
            <EmptyState icon="videocam-outline" title="No reels yet" body={isMe ? "Show off your best cuts — post your first reel." : undefined} action={isMe ? { label: "Post a reel", onPress: () => router.push("/post-reel") } : undefined} />
          ) : (
            <Wrap gap={8}>
              {reels.map((r) => (
                <ReelThumb key={r.id} reel={r} width={108} showBarber={false} onPress={() => router.push({ pathname: "/barber-reels/[barberId]", params: { barberId: barber.id, start: r.id } })} />
              ))}
            </Wrap>
          )}
        </View>
      )}

      {tab === "reviews" && (
        <View style={{ marginTop: 8 }}>
          {barber.reviews.length === 0 && <EmptyState icon="chatbubble-ellipses-outline" title="No reviews yet" body={`Be the first to rate ${barber.name.split(" ")[0]} after your cut.`} />}
          {barber.reviews.map((r, i) => (
            <View key={r.id}>
              {i > 0 && <Divider style={{ marginVertical: 0 }} />}
              <View style={{ paddingVertical: 14 }}>
                <Row gap={10}>
                  <Avatar name={r.customerName} size={36} />
                  <View style={{ flex: 1 }}>
                    <T variant="strong">{r.customerName}</T>
                    <T variant="small" muted>{new Date(r.createdAt).toLocaleDateString()}</T>
                  </View>
                  <Rating value={r.rating} />
                </Row>
                {!!r.comment && <T style={{ marginTop: 8 }}>{r.comment}</T>}
              </View>
            </View>
          ))}
        </View>
      )}
    </Screen>
  );
}

function Stat({ value, label, icon }: { value: string; label: string; icon: "star" | "pricetag" | "home" }) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.surface, borderRadius: radius.md, paddingVertical: 12, alignItems: "center" }}>
      <Row gap={4}>
        <Ionicons name={icon} size={13} color={icon === "star" ? colors.gold : colors.gold} />
        <T variant="strong" numberOfLines={1}>{value}</T>
      </Row>
      <T variant="small" muted>{label}</T>
    </View>
  );
}
