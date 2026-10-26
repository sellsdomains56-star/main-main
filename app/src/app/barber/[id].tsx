import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Image, Linking, Modal, Platform, Pressable, useWindowDimensions, View } from "react-native";
import { BeforeAfter } from "../../components/BeforeAfter";
import { BarberMap } from "../../components/map/BarberMap";
import { barberPins, directionsUrl } from "../../components/map/types";
import { ReelThumb } from "../../components/ReelThumb";
import { colors, radius } from "../../components/theme";
import { Avatar, Button, Divider, EmptyState, ErrorBox, IconButton, IconLine, Loading, Photo, Rating, Row, Screen, Segmented, T, Tag, Wrap } from "../../components/ui";
import { api, mediaUrl } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import { dateTime, money } from "../../lib/format";
import { minutes, sections } from "../../lib/menu";
import { flag } from "../../lib/location";
import type { Barber, Reel, Review } from "../../lib/types";

type TabKey = "portfolio" | "services" | "reels" | "reviews";

export default function BarberProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, setUser } = useAuth();
  const [favBusy, setFavBusy] = useState(false);
  const [barber, setBarber] = useState<(Barber & { reviews: Review[] }) | null>(null);
  const [reels, setReels] = useState<Reel[]>([]);
  const [tab, setTab] = useState<TabKey>("portfolio");
  const [viewer, setViewer] = useState<string | null>(null);
  const { width } = useWindowDimensions();
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
  const favourite = !!user?.favourites?.includes(barber.id);
  const toggleFavourite = async () => {
    if (!user) return router.push("/login");
    setFavBusy(true);
    try {
      const r = await api.toggleFavourite(barber.id);
      setUser({ ...user, favourites: r.favourites });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setFavBusy(false);
    }
  };

  return (
    <Screen
      footer={
        isMe ? (
          <Button title="Post a new reel" icon="videocam" onPress={() => router.push("/post-reel")} />
        ) : (
          <Row gap={10}>
            {barber.offersConsultations && (
              <Button
                title="Consult"
                icon="videocam-outline"
                variant="secondary"
                onPress={() => router.push({ pathname: "/book/[barberId]", params: { barberId: barber.id, mode: "consult" } })}
              />
            )}
            <Button
              title={service ? `Book · ${money(service.price, barber.currency)}` : "Book now"}
              onPress={() => router.push({ pathname: "/book/[barberId]", params: { barberId: barber.id, ...(service ? { serviceId: service.id } : {}) } })}
              style={{ flex: 1 }}
            />
          </Row>
        )
      }
    >
      <Stack.Screen
        options={{
          title: "",
          headerRight: isMe || user?.role === "barber" ? undefined : () => (
            <Pressable onPress={toggleFavourite} disabled={favBusy} hitSlop={10} accessibilityRole="button" accessibilityLabel={favourite ? "Remove from favourites" : "Save to favourites"} accessibilityState={{ selected: favourite }} style={{ paddingHorizontal: 8 }}>
              <Ionicons name={favourite ? "heart" : "heart-outline"} size={24} color={colors.text} />
            </Pressable>
          ),
        }}
      />
      <View style={{ alignItems: "center" }}>
        <Photo uri={barber.photoUrl} name={barber.name} style={{ width: 112, height: 112 }} rounded={56} />
        <Row gap={6} style={{ marginTop: 14 }}>
          <T variant="title">{barber.name}</T>
          {barber.verified && <Ionicons name="shield-checkmark" size={18} color={colors.text} accessibilityLabel="Verified by JB" />}
        </Row>
        <T variant="caption" muted style={{ marginTop: 2 }}>{flag(barber.countryCode)} {barber.city}, {barber.countryName}{barber.verified ? " · Verified by JB" : ""}</T>
        {isMe && barber.status && barber.status !== "live" && (
          <Pressable onPress={() => router.push("/business")} style={{ marginTop: 10 }}>
            <Tag label={barber.status === "pending" ? "In review — only you can see this" : "Paused — customers can't see this"} tone={barber.status === "pending" ? "neutral" : "danger"} icon={barber.status === "pending" ? "time-outline" : "pause"} />
          </Pressable>
        )}
      </View>

      <Row gap={10} style={{ marginTop: 18 }}>
        <Stat value={barber.rating ? barber.rating.toFixed(1) : "New"} label={`${barber.ratingCount} reviews`} icon="star" />
        <Stat value={barber.yearsExperience ? `${barber.yearsExperience} yrs` : "New"} label="experience" icon="ribbon" />
        <Stat value={money(barber.startingPrice, barber.currency)} label="from" icon="pricetag" />
      </Row>

      <View style={{ marginTop: 16, gap: 8 }}>
        <IconLine icon="time-outline">
          {barber.nextAvailable ? `Next free: ${dateTime(barber.nextAvailable, barber.timeZone)} (${barber.city} time)` : "Fully booked for the next two weeks"}
        </IconLine>
        <IconLine icon={barber.offersHomeVisits ? "home-outline" : "storefront-outline"}>
          {barber.offersHomeVisits ? `Comes to you (+${money(barber.homeVisitFee, barber.currency)}) or at the shop` : "Appointments at the shop"}
        </IconLine>
        {barber.offersConsultations && <IconLine icon="videocam-outline">Free 15-min consultation · Google Meet or phone</IconLine>}
        {barber.languages.length > 0 && <IconLine icon="chatbubbles-outline">Speaks {barber.languages.join(", ")}</IconLine>}
        <IconLine icon="location-outline" muted>{barber.shopAddress}</IconLine>
      </View>

      <T style={{ marginTop: 18 }}>{barber.bio}</T>
      <View style={{ marginTop: 12 }}>
        <Wrap gap={6}>{barber.specialties.map((s) => <Tag key={s} label={s} />)}</Wrap>
      </View>

      {/* Where to find them */}
      <View style={{ marginTop: 22 }}>
        <T variant="heading" style={{ marginBottom: 10 }}>Location</T>
        <BarberMap
          pins={barberPins([barber])}
          selectedId={barber.id}
          height={230}
          interactive={false}
          orbit
          onPress={() => router.push({ pathname: "/map", params: { focus: barber.id, country: barber.countryCode } })}
          placeName={barber.city}
        />
        <Row style={{ justifyContent: "space-between", marginTop: 10 }} gap={10}>
          <View style={{ flex: 1 }}>
            <T variant="strong">{barber.shop ? barber.shop.name : barber.shopAddress}</T>
            <T variant="caption" muted>
              {barber.shop ? `${barber.shopAddress}${barber.offersHomeVisits ? " · also comes to you" : ""}` : barber.offersHomeVisits ? `Shop in ${barber.city} · also comes to you` : `Shop in ${barber.city}`}
            </T>
          </View>
          <Button title="Directions" icon="navigate-outline" size="sm" variant="secondary" onPress={() => Linking.openURL(directionsUrl(barber.lat, barber.lng, Platform.OS === "ios"))} />
        </Row>
        {barber.shop && (
          <Button
            title={`See ${barber.shop.name}`}
            icon="storefront-outline"
            size="sm"
            variant="ghost"
            style={{ alignSelf: "flex-start", marginTop: 6 }}
            onPress={() => router.push({ pathname: "/barbershop/[shopId]", params: { shopId: barber.shop!.id } })}
          />
        )}
      </View>

      <View style={{ marginTop: 22 }}>
        <Segmented<TabKey>
          value={tab}
          onChange={setTab}
          options={[
            { value: "portfolio", label: "Work" },
            { value: "services", label: "Services" },
            { value: "reels", label: "Reels" },
            { value: "reviews", label: "Reviews" },
          ]}
        />
      </View>

      {tab === "portfolio" && (
        <View style={{ marginTop: 16 }}>
          {barber.transformations.length === 0 && barber.gallery.length === 0 && (
            <EmptyState
              icon="images-outline"
              title="No work posted yet"
              body={isMe ? "Add photos and before-and-after transformations to win more bookings." : undefined}
              action={isMe ? { label: "Add your work", onPress: () => router.push("/portfolio") } : undefined}
            />
          )}
          {barber.transformations.length > 0 && (
            <>
              <T variant="heading" style={{ marginBottom: 10 }}>Transformations</T>
              {barber.transformations.map((t) => (
                <View key={t.id} style={{ marginBottom: 16 }}>
                  <BeforeAfter beforeUri={mediaUrl(t.beforeUrl)!} afterUri={mediaUrl(t.afterUrl)!} height={Math.min(width - 40, 420)} />
                  {!!t.caption && <T variant="caption" muted style={{ marginTop: 6 }}>{t.caption}</T>}
                </View>
              ))}
            </>
          )}
          {barber.gallery.length > 0 && (
            <>
              <T variant="heading" style={{ marginTop: 8, marginBottom: 10 }}>Photos</T>
              <Wrap gap={6}>
                {barber.gallery.map((p) => {
                  const size = (Math.min(width, 760) - 40 - 12) / 3;
                  return (
                    <Pressable key={p.id} onPress={() => setViewer(mediaUrl(p.url))} accessibilityLabel={p.caption || "Open photo"}>
                      <Image source={{ uri: mediaUrl(p.url)! }} style={{ width: size, height: size, borderRadius: radius.md, backgroundColor: colors.surface }} />
                    </Pressable>
                  );
                })}
              </Wrap>
            </>
          )}
        </View>
      )}

      {tab === "services" && (
        <View style={{ marginTop: 8 }}>
          {sections(barber.services).map((sec) => (
            <View key={sec.id} style={{ marginBottom: 6 }}>
              <T variant="eyebrow" muted style={{ marginTop: 14, marginBottom: 2 }}>{sec.id === "extras" ? "Extras · add to any service" : sec.label}</T>
              {sec.items.map((s, i) => {
                const extra = sec.id === "extras";
                const selected = s.id === serviceId;
                return (
                  <View key={s.id}>
                    {i > 0 && <Divider style={{ marginVertical: 0 }} />}
                    <Pressable disabled={extra} onPress={() => setServiceId(s.id)} style={{ flexDirection: "row", alignItems: "center", paddingVertical: 14, gap: 12 }} accessibilityRole={extra ? undefined : "radio"} accessibilityState={{ selected }}>
                      <View style={{ flex: 1 }}>
                        <T variant="strong">{s.name}</T>
                        <T variant="caption" muted>{extra ? "+" : ""}{minutes(s.durationMin)}{s.description ? ` · ${s.description}` : ""}</T>
                      </View>
                      <T variant="strong">{extra ? "+" : ""}{money(s.price, barber.currency)}</T>
                      {!extra && <Ionicons name={selected ? "radio-button-on" : "radio-button-off"} size={22} color={selected ? colors.accent : colors.faint} />}
                    </Pressable>
                  </View>
                );
              })}
            </View>
          ))}
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
                {!!r.photoUrl && (
                  <Pressable onPress={() => setViewer(mediaUrl(r.photoUrl!))} accessibilityLabel="Open the customer's photo" style={{ marginTop: 10, alignSelf: "flex-start" }}>
                    <Photo uri={r.photoUrl} name={r.customerName} style={{ width: 96, height: 96 }} />
                  </Pressable>
                )}
                {r.reply && (
                  <View style={{ marginTop: 10, marginLeft: 12, paddingLeft: 12, borderLeftWidth: 2, borderLeftColor: colors.border }}>
                    <T variant="caption" muted>Reply from {barber.name.split(" ")[0]}</T>
                    <T variant="caption" style={{ marginTop: 2 }}>{r.reply.text}</T>
                  </View>
                )}
                {isMe && !r.reply && (
                  <Button title="Reply" icon="chatbubble-outline" size="sm" variant="ghost" style={{ alignSelf: "flex-start", marginTop: 6 }} onPress={() => router.push("/business/reviews")} />
                )}
              </View>
            </View>
          ))}
        </View>
      )}
      <Modal visible={!!viewer} transparent animationType="fade" onRequestClose={() => setViewer(null)}>
        <Pressable onPress={() => setViewer(null)} style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.92)", alignItems: "center", justifyContent: "center", padding: 16 }} accessibilityLabel="Close photo">
          {viewer && <Image source={{ uri: viewer }} style={{ width: Math.min(width - 32, 720), height: Math.min(width - 32, 720), borderRadius: radius.lg }} resizeMode="contain" />}
          <View style={{ position: "absolute", top: 48, right: 20 }}>
            <IconButton icon="close" label="Close" onPress={() => setViewer(null)} />
          </View>
        </Pressable>
      </Modal>
    </Screen>
  );
}

function Stat({ value, label, icon }: { value: string; label: string; icon: "star" | "pricetag" | "ribbon" }) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.surface, borderRadius: radius.md, paddingVertical: 12, alignItems: "center" }}>
      <Row gap={4}>
        <Ionicons name={icon} size={13} color={icon === "star" ? colors.accent : colors.accent} />
        <T variant="strong" numberOfLines={1}>{value}</T>
      </Row>
      <T variant="small" muted>{label}</T>
    </View>
  );
}
