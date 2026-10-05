import { useEffect, useState } from "react";
import { useWindowDimensions, View } from "react-native";
import { LocationPill } from "../components/LocationSheet";
import { BarberMap } from "../components/map/BarberMap";
import type { MapPin } from "../components/map/types";
import { ShopCard } from "../components/ShopCard";
import { Divider, EmptyState, ErrorBox, Loading, Pill, Row, Screen, T } from "../components/ui";
import { api } from "../lib/api";
import { useLocation } from "../lib/location";
import type { ShopSummary } from "../lib/types";

/** Barbershops in the chosen city: book a chair with any barber, hire the shop, or order for delivery. */
export default function Shops() {
  const { place, country } = useLocation();
  const { height } = useWindowDimensions();
  const [list, setList] = useState<ShopSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"list" | "map">("list");
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    setList(null);
    setError(null);
    api.shops({ country: place?.countryCode, city: place?.city || undefined }).then(setList, (e: Error) => setError(e.message));
  }, [place?.countryCode, place?.city]);

  const where = place?.city || country?.name || "the world";
  const pins: MapPin[] = (list ?? []).map((s) => ({ id: s.id, lat: s.lat, lng: s.lng, label: s.name.split(" ").slice(0, 2).join(" "), free: s.offersDelivery }));

  return (
    <Screen>
      <LocationPill label="Barbershops in" />
      <T variant="caption" muted style={{ marginTop: 10 }}>Book a chair with whoever's free, hire the whole shop for your event, or get products delivered today.</T>
      <View style={{ marginTop: 14 }}>
        {error && <ErrorBox message={error} />}
        {!list && !error && <Loading />}
        {list?.length === 0 && (
          <EmptyState icon="storefront-outline" title={`No barbershops in ${where} yet`} body="Independent barbers here still take bookings and come to you." />
        )}
        {!!list?.length && (
          <Row style={{ justifyContent: "space-between" }}>
            <T variant="caption" muted style={{ flex: 1 }}>{list.length} {list.length === 1 ? "barbershop" : "barbershops"} in {where}</T>
            <Row gap={6}>
              <Pill label="List" icon="list-outline" selected={view === "list"} onPress={() => setView("list")} />
              <Pill label="Map" icon="map-outline" selected={view === "map"} onPress={() => setView("map")} />
            </Row>
          </Row>
        )}
        {view === "map" && !!list?.length && (
          <View style={{ marginTop: 12 }}>
            <BarberMap pins={pins} height={Math.max(300, Math.min(height * 0.45, 480))} selectedId={selected} onSelect={setSelected} placeName={place?.city || country?.name} />
            {(() => {
              const s = list.find((x) => x.id === selected);
              return s ? <ShopCard shop={s} /> : <T variant="caption" muted style={{ marginTop: 12 }}>Tap a pin to see the shop. Filled pins deliver.</T>;
            })()}
          </View>
        )}
        {view === "list" && list?.map((s, i) => (
          <View key={s.id}>
            {i > 0 && <Divider style={{ marginVertical: 0 }} />}
            <ShopCard shop={s} />
          </View>
        ))}
      </View>
    </Screen>
  );
}

