import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useRef, useState } from "react";
import { Image, Platform, Pressable, Text, View } from "react-native";
import MapView, { Marker, type Region } from "react-native-maps";
import { resolveMedia } from "../../lib/config";
import { colors, fonts } from "../theme";
import { regionFor, type BarberMapProps, type MapPin } from "./types";

// Android (Google Maps): a dark greyscale style to match the website's night map. iPhone uses Apple's dark map.
const NIGHT_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#1f1f1e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#a19c95" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0b0b0b" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ visibility: "on" }, { color: "#242723" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#3d3c39" }] },
  { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#55524e" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#8e8981" }] },
  { featureType: "transit", stylers: [{ visibility: "simplified" }, { saturation: -100 }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0a0a0b" }] },
  { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#4a4844" }] },
  { featureType: "landscape.man_made", elementType: "geometry", stylers: [{ color: "#2b2a28" }] },
];

const PITCH = 60;
const HEADING = -34; // looking north-west: the Gulf on the horizon

interface Group {
  key: string;
  lead: MapPin;
  members: MapPin[];
  lat: number;
  lng: number;
}

/** Pins closer than ~1/9 of the screen merge into one, showing the first photo and a count. */
function cluster(pins: MapPin[], region: Region | null, selectedId?: string | null): Group[] {
  const cell = region ? Math.max(region.longitudeDelta, region.latitudeDelta) / 9 : 0;
  const order = [...pins].sort((a, b) => Number(b.id === selectedId) - Number(a.id === selectedId) || Number(b.kind === "shop") - Number(a.kind === "shop") || (b.rating ?? 0) - (a.rating ?? 0));
  const out: Group[] = [];
  for (const p of order) {
    const near = cell > 0.0015 ? out.find((g) => Math.abs(g.lat - p.lat) < cell * 0.8 && Math.abs(g.lng - p.lng) < cell) : undefined;
    if (near) near.members.push(p);
    else out.push({ key: p.id, lead: p, members: [p], lat: p.lat, lng: p.lng });
  }
  for (const g of out) if (g.members.length > 1) g.key = `c:${g.members.map((m) => m.id).sort().join(",")}`;
  return out;
}

/** iPhone / Android: Apple Maps / Google Maps in 3D (tilted, real buildings), with a photo pin per barber and barbershop. */
export function BarberMap({
  pins, height, selectedId, onSelect, interactive = true, onPress, tilt = true, onTiltChange, insets, fitKey, focus, radius = 24, onCenter,
}: BarberMapProps) {
  const map = useRef<MapView>(null);
  const [region, setRegion] = useState<Region | null>(null);
  const [is3d, setIs3d] = useState(tilt);
  const key = pins.map((p) => `${p.id}:${p.lat},${p.lng}`).join("|");
  const groups = useMemo(() => cluster(pins, region, selectedId), [pins, region, selectedId]);
  const padding = { top: (insets?.top ?? 0) + 70, right: 60, bottom: (insets?.bottom ?? 0) + 60, left: 60 };

  function frame(list: MapPin[], animated = true) {
    if (!list.length) return;
    if (list.length === 1) {
      const p = list[0]!;
      map.current?.animateCamera(
        { center: { latitude: p.lat, longitude: p.lng }, pitch: is3d ? PITCH : 0, heading: is3d ? HEADING : 0, altitude: 650, zoom: 17 },
        { duration: animated ? 900 : 0 },
      );
      return;
    }
    map.current?.fitToCoordinates(list.map((p) => ({ latitude: p.lat, longitude: p.lng })), { edgePadding: padding, animated });
    if (is3d) setTimeout(() => map.current?.animateCamera({ pitch: PITCH * 0.75, heading: HEADING }, { duration: 700 }), animated ? 650 : 0);
  }

  function frameAll(animated = true) {
    const sel = pins.find((p) => p.id === selectedId);
    frame(sel ? [sel] : pins, animated);
  }

  useEffect(() => {
    const t = setTimeout(() => frameAll(false), 50);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, fitKey]);

  useEffect(() => {
    const sel = pins.find((p) => p.id === selectedId);
    if (sel) map.current?.animateCamera({ center: { latitude: sel.lat, longitude: sel.lng } }, { duration: 600 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  useEffect(() => {
    if (!focus) return;
    // Google zoom levels; Apple Maps on iPhone uses altitude in metres.
    map.current?.animateCamera({ center: { latitude: focus.lat, longitude: focus.lng }, zoom: focus.zoom, altitude: 40_000_000 / 2 ** focus.zoom, pitch: is3d ? PITCH * 0.75 : 0 }, { duration: 1000 });
  }, [focus?.key]); // eslint-disable-line react-hooks/exhaustive-deps

  function toggle3d() {
    const next = !is3d;
    setIs3d(next);
    onTiltChange?.(next);
    map.current?.animateCamera({ pitch: next ? PITCH : 0, heading: next ? HEADING : 0 }, { duration: 700 });
  }

  return (
    <View style={{ height, borderRadius: radius, overflow: "hidden", backgroundColor: "#1F1F1E" }}>
      <MapView
        ref={map}
        style={{ flex: 1 }}
        initialRegion={regionFor(pins)}
        userInterfaceStyle="dark"
        customMapStyle={Platform.OS === "android" ? NIGHT_STYLE : undefined}
        showsBuildings
        showsPointsOfInterests={false}
        showsCompass={interactive}
        pitchEnabled={interactive}
        rotateEnabled={interactive}
        scrollEnabled={interactive}
        zoomEnabled={interactive}
        toolbarEnabled={false}
        onRegionChangeComplete={(r) => {
          setRegion(r);
          onCenter?.(r.latitude, r.longitude);
        }}
        mapPadding={insets ? { top: insets.top ?? 0, bottom: insets.bottom ?? 0, left: 0, right: 0 } : undefined}
      >
        {!onCenter && groups.map((g) => (
          <PinMarker
            key={g.key}
            group={g}
            selected={g.members.some((m) => m.id === selectedId)}
            onPress={() => {
              if (!interactive) return onPress?.();
              if (g.members.length > 1) frame(g.members);
              else onSelect?.(g.lead.id);
            }}
          />
        ))}
      </MapView>
      {onCenter && (
        <View pointerEvents="none" style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, alignItems: "center", justifyContent: "center" }}>
          <Ionicons name="location" size={46} color={colors.onInk} style={{ transform: [{ translateY: -21 }], textShadowColor: "rgba(0,0,0,0.6)", textShadowRadius: 10 }} />
        </View>
      )}
      {!interactive && onPress && <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel="Open the map" style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} />}
      {interactive && (
        <View style={{ position: "absolute", right: 12, top: (insets?.top ?? 0) + 12, gap: 8 }}>
          <MapButton label={is3d ? "Switch to 2D map" : "Switch to 3D map"} onPress={toggle3d}>
            <Text style={{ color: colors.onInk, fontFamily: fonts.bold, fontSize: 13 }}>{is3d ? "2D" : "3D"}</Text>
          </MapButton>
          <MapButton label="Show all" onPress={() => frame(pins)}>
            <Ionicons name="scan-outline" size={18} color={colors.onInk} />
          </MapButton>
        </View>
      )}
    </View>
  );
}

function MapButton({ label, onPress, children }: { label: string; onPress: () => void; children: React.ReactNode }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        { width: 42, height: 42, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(11,11,11,0.85)", borderWidth: 1, borderColor: "rgba(244,242,238,0.16)" },
        pressed && { opacity: 0.75 },
      ]}
    >
      {children}
    </Pressable>
  );
}

/** The photo pin: avatar (round for barbers, square for barbershops) on a short stem, with the price tag. */
function PinMarker({ group, selected, onPress }: { group: Group; selected: boolean; onPress: () => void }) {
  const p = group.lead;
  const count = group.members.length;
  const photo = p.photoUrl && !p.photoUrl.startsWith("brand:") ? resolveMedia(p.photoUrl) : null;
  const [loaded, setLoaded] = useState(!photo);
  const size = selected ? 54 : 44;
  const shop = p.kind === "shop";
  return (
    <Marker
      coordinate={{ latitude: group.lat, longitude: group.lng }}
      onPress={onPress}
      anchor={{ x: 0.5, y: 1 }}
      tracksViewChanges={!loaded || selected}
      zIndex={selected ? 1000 : count > 1 ? 500 : 1}
      accessibilityLabel={count > 1 ? `${count} places here` : `${p.title ?? ""}, ${p.label}`}
    >
      <View style={{ alignItems: "center", paddingTop: 6, paddingHorizontal: 10 }}>
        <View
          style={{
            width: size, height: size, borderRadius: shop ? 14 : size / 2, borderWidth: selected ? 3 : 2.5, borderColor: colors.onInk, backgroundColor: colors.ink,
            overflow: "hidden", alignItems: "center", justifyContent: "center",
            shadowColor: "#000", shadowOpacity: 0.5, shadowRadius: 8, shadowOffset: { width: 0, height: 6 }, elevation: 8,
          }}
        >
          {photo ? <Image source={{ uri: photo }} style={{ width: "100%", height: "100%" }} onLoad={() => setLoaded(true)} onError={() => setLoaded(true)} /> : <Ionicons name={shop ? "storefront" : "cut"} size={18} color={colors.onInk} />}
        </View>
        {count > 1 && (
          <View style={{ position: "absolute", top: 0, right: 2, minWidth: 22, height: 22, borderRadius: 11, paddingHorizontal: 5, backgroundColor: colors.onInk, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ color: colors.ink, fontFamily: fonts.bold, fontSize: 11 }}>{count}</Text>
          </View>
        )}
        <View style={{ marginTop: 5, paddingHorizontal: 9, paddingVertical: 3, borderRadius: 999, backgroundColor: selected ? colors.onInk : "rgba(11,11,11,0.9)", borderWidth: 1, borderColor: selected ? colors.onInk : "rgba(244,242,238,0.25)" }}>
          <Text style={{ color: selected ? colors.ink : colors.onInk, fontFamily: fonts.bold, fontSize: 11 }}>{count > 1 ? `${count} here` : p.label}</Text>
        </View>
        <View style={{ width: 2, height: 10, backgroundColor: colors.onInk, opacity: 0.8 }} />
        <View style={{ width: 8, height: 4, borderRadius: 4, backgroundColor: colors.onInk, opacity: 0.9 }} />
      </View>
    </Marker>
  );
}
