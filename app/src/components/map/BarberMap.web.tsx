import Lib from "leaflet";
import type * as Leaflet from "leaflet";
import { useEffect, useRef } from "react";
import { View } from "react-native";
import { DEMO_DATA } from "../../lib/config";
import { colors } from "../theme";
import { T } from "../ui";
import { LEAFLET_CSS } from "./leafletCss";
import type { BarberMapProps, MapPin } from "./types";

// Street tiles: OpenStreetMap by default. For a busy site use a tile provider (MapTiler, Mapbox, Stadia…)
// and set EXPO_PUBLIC_MAP_TILES_URL — OSM's own servers are for light use only.
const TILES = process.env.EXPO_PUBLIC_MAP_TILES_URL ?? "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const ATTRIBUTION = process.env.EXPO_PUBLIC_MAP_TILES_ATTRIBUTION ?? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
// The demo page can't load images from other sites, so it shows the pins on a plain grid.
const STREET_TILES = !DEMO_DATA;

const STYLE = `${LEAFLET_CSS}
.jb-map { font-family: Inter_500Medium, system-ui, sans-serif; }
.jb-map .leaflet-tile-pane { filter: grayscale(1) contrast(1.05); }
.jb-map.jb-grid { background-color: #E5E2DD; background-image: linear-gradient(rgba(11,11,11,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(11,11,11,0.06) 1px, transparent 1px); background-size: 32px 32px; }
.jb-pin { transform: translate(-50%, -100%); display: flex; flex-direction: column; align-items: center; cursor: pointer; }
.jb-pin span { white-space: nowrap; border-radius: 999px; padding: 5px 9px; font: 700 12px Inter_700Bold, system-ui, sans-serif; background: #fff; color: #0B0B0B; border: 1.5px solid #0B0B0B; box-shadow: 0 4px 12px rgba(0,0,0,0.18); }
.jb-pin.free span { background: #0B0B0B; color: #F4F2EE; border-color: #0B0B0B; }
.jb-pin.selected span { background: #0B0B0B; color: #F4F2EE; padding: 7px 12px; font-size: 13px; outline: 3px solid rgba(11,11,11,0.18); }
.jb-pin i { width: 2px; height: 6px; background: #0B0B0B; }
.jb-map .leaflet-control-zoom a { color: #0B0B0B; }
`;

let styled = false;
function injectStyle() {
  if (styled) return;
  styled = true;
  const tag = document.createElement("style");
  tag.textContent = STYLE;
  document.head.appendChild(tag);
}

const pinHtml = (p: MapPin, selected: boolean) =>
  `<div class="jb-pin${p.free ? " free" : ""}${selected ? " selected" : ""}" role="button" aria-label="${p.label.replace(/"/g, "")}"><span>${p.label.replace(/[<>&]/g, "")}</span><i></i></div>`;

/** Website: Leaflet map (greyscale street tiles) with a price pin per barber. */
export function BarberMap({ pins, height, selectedId, onSelect, interactive = true, placeName }: BarberMapProps) {
  const host = useRef<View>(null);
  const map = useRef<Leaflet.Map | null>(null);
  const layer = useRef<Leaflet.LayerGroup | null>(null);
  const L = useRef<typeof Leaflet | null>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  const key = pins.map((p) => `${p.id}:${p.lat},${p.lng}`).join("|");

  // Create the map once.
  useEffect(() => {
    let cancelled = false;
    (() => {
      const lib = Lib as unknown as typeof Leaflet;
      const el = host.current as unknown as HTMLElement | null;
      if (cancelled || !el) return;
      injectStyle();
      L.current = lib;
      el.classList.add("jb-map");
      if (!STREET_TILES) el.classList.add("jb-grid");
      const m = lib.map(el, {
        zoomControl: interactive,
        dragging: interactive,
        scrollWheelZoom: false,
        doubleClickZoom: interactive,
        touchZoom: interactive,
        boxZoom: false,
        keyboard: interactive,
        attributionControl: STREET_TILES,
      });
      if (STREET_TILES) lib.tileLayer(TILES, { maxZoom: 19, attribution: ATTRIBUTION }).addTo(m);
      map.current = m;
      layer.current = lib.layerGroup().addTo(m);
      draw(true);
    })();
    return () => {
      cancelled = true;
      map.current?.remove();
      map.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function draw(fit: boolean) {
    const lib = L.current;
    const m = map.current;
    if (!lib || !m || !layer.current) return;
    layer.current.clearLayers();
    for (const p of pins) {
      const marker = lib.marker([p.lat, p.lng], {
        icon: lib.divIcon({ className: "", html: pinHtml(p, p.id === selectedId), iconSize: undefined }),
        zIndexOffset: p.id === selectedId ? 1000 : p.free ? 500 : 0,
        keyboard: interactive,
        title: p.label,
      });
      marker.on("click", () => onSelectRef.current?.(p.id));
      marker.addTo(layer.current);
    }
    if (!fit) return;
    if (pins.length > 1) m.fitBounds(lib.latLngBounds(pins.map((p) => [p.lat, p.lng] as [number, number])), { padding: [48, 48], maxZoom: 15 });
    else if (pins.length === 1) m.setView([pins[0].lat, pins[0].lng], 15);
    else m.setView([25.2048, 55.2708], 10);
  }

  useEffect(() => draw(true), [key]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => draw(false), [selectedId]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <View style={{ height, borderRadius: 24, overflow: "hidden", backgroundColor: colors.surface }}>
      <View ref={host} style={{ flex: 1 }} accessibilityLabel={`Map of ${pins.length} barbers`} />
      {!STREET_TILES && (
        <View pointerEvents="none" style={{ position: "absolute", left: 12, bottom: 10, backgroundColor: "rgba(255,255,255,0.85)", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 }}>
          <T variant="small" muted>{placeName ? `${placeName} · ` : ""}map preview — street map in the app</T>
        </View>
      )}
    </View>
  );
}
