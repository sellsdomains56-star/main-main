import { useEffect, useRef } from "react";
import { Platform, Text, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { colors, fonts } from "../theme";
import { regionFor, type BarberMapProps } from "./types";

// Android (Google Maps): a greyscale style to match the black-and-white app. iOS uses Apple's muted map.
const GREYSCALE = [
  { elementType: "geometry", stylers: [{ saturation: -100 }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#5e5a55" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#d5d1cb" }] },
];

/** iPhone / Android: the real map (Apple Maps / Google Maps) with a price pin per barber. */
export function BarberMap({ pins, height, selectedId, onSelect, interactive = true }: BarberMapProps) {
  const map = useRef<MapView>(null);
  const key = pins.map((p) => p.id).join(",");

  useEffect(() => {
    if (pins.length > 1) map.current?.fitToCoordinates(pins.map((p) => ({ latitude: p.lat, longitude: p.lng })), { edgePadding: { top: 60, right: 60, bottom: 60, left: 60 }, animated: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return (
    <View style={{ height, borderRadius: 24, overflow: "hidden", backgroundColor: colors.surface }}>
      <MapView
        ref={map}
        style={{ flex: 1 }}
        initialRegion={regionFor(pins)}
        mapType={Platform.OS === "ios" ? "mutedStandard" : "standard"}
        customMapStyle={Platform.OS === "android" ? GREYSCALE : undefined}
        scrollEnabled={interactive}
        zoomEnabled={interactive}
        rotateEnabled={false}
        pitchEnabled={false}
        showsPointsOfInterests={false}
        toolbarEnabled={false}
      >
        {pins.map((p) => {
          const selected = p.id === selectedId;
          const dark = p.free || selected;
          return (
            <Marker key={p.id} coordinate={{ latitude: p.lat, longitude: p.lng }} onPress={() => onSelect?.(p.id)} tracksViewChanges={false} anchor={{ x: 0.5, y: 1 }}>
              <View style={{ alignItems: "center" }}>
                <View
                  style={{
                    paddingHorizontal: selected ? 12 : 9, paddingVertical: selected ? 7 : 5, borderRadius: 999,
                    backgroundColor: dark ? colors.ink : colors.card, borderWidth: dark ? 0 : 1.5, borderColor: colors.ink,
                  }}
                >
                  <Text style={{ color: dark ? colors.onInk : colors.text, fontFamily: fonts.bold, fontSize: selected ? 13 : 12 }}>{p.label}</Text>
                </View>
                <View style={{ width: 2, height: 6, backgroundColor: colors.ink }} />
              </View>
            </Marker>
          );
        })}
      </MapView>
    </View>
  );
}
