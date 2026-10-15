import { Ionicons } from "@expo/vector-icons";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Pressable, View } from "react-native";
import { resolveMedia } from "../../lib/config";
import { fonts } from "../theme";
import { T } from "../ui";
import { buildingAt, covered, drawFrame, latToY, lngToX, MAX_PITCH, NIGHT, scaleBar, stats, View as MapView, xToLng, yToLat, type Camera } from "./engine";
import type { BarberMapProps, MapPin } from "./types";

const PIN_CSS = `
.jb-map3d { position: absolute; inset: 0; overflow: hidden; outline: none; font-family: ${fonts.medium}, Inter, system-ui, sans-serif; }
.jb-map3d canvas { position: absolute; inset: 0; width: 100%; height: 100%; touch-action: none; }
.jb-map3d.still canvas { touch-action: auto; }
.jb-map3d:focus-visible { box-shadow: inset 0 0 0 3px #F4F2EE; }
.jb-pins { position: absolute; inset: 0; pointer-events: none; }
.jb-pin { position: absolute; left: 0; top: 0; width: 1px; height: 1px; will-change: transform; }
.jb-body:focus-visible .jb-head { outline: 3px solid #F4F2EE; outline-offset: 3px; }
.jb-shadow { position: absolute; left: -18px; top: -7px; width: 36px; height: 14px; border-radius: 50%; background: radial-gradient(closest-side, rgba(244,242,238,0.55), rgba(244,242,238,0.12) 55%, rgba(244,242,238,0)); }
.jb-shadow::after { content: ""; position: absolute; left: 15px; top: 4.5px; width: 6px; height: 5px; border-radius: 50%; background: #F4F2EE; }
.jb-ground { position: absolute; left: -22px; top: -9px; width: 44px; height: 18px; border-radius: 50%; border: 2px solid rgba(244,242,238,0.9); opacity: 0; }
.jb-pin.selected .jb-ground { animation: jb-ring 1.8s ease-out infinite; }
@keyframes jb-ring { 0% { transform: scale(0.4); opacity: 0.9; } 100% { transform: scale(1.6); opacity: 0; } }
.jb-body { position: absolute; left: 0; bottom: 0; pointer-events: auto; cursor: pointer; border: 0; padding: 0; margin: 0; background: none; font: inherit; color: inherit; display: flex; flex-direction: column; align-items: center; transform: translateX(-50%); animation: jb-drop 0.65s cubic-bezier(.2,1.4,.4,1) both; transition: transform 0.18s ease; }
@keyframes jb-drop { from { transform: translate(-50%, -46px); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }
.jb-body:hover { transform: translate(-50%, -4px); }
.jb-head { position: relative; width: 46px; height: 46px; border-radius: 50%; border: 2.5px solid #F4F2EE; background: #0B0B0B center / cover no-repeat; box-shadow: 0 14px 22px rgba(0,0,0,0.55), 0 3px 6px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.4); display: flex; align-items: center; justify-content: center; color: #F4F2EE; transition: width .2s, height .2s; }
.jb-head::after { content: ""; position: absolute; inset: 0; border-radius: inherit; background: linear-gradient(160deg, rgba(255,255,255,0.28), rgba(255,255,255,0) 45%); pointer-events: none; }
.jb-pin.shop .jb-head { border-radius: 14px; }
.jb-pin.selected .jb-head { width: 58px; height: 58px; border-width: 3px; box-shadow: 0 0 0 5px rgba(244,242,238,0.22), 0 18px 28px rgba(0,0,0,0.6); }
.jb-stack { position: absolute; top: 4px; width: 38px; height: 38px; border-radius: 50%; border: 2px solid #F4F2EE; background: #262523 center / cover no-repeat; box-shadow: 0 8px 14px rgba(0,0,0,0.5); }
.jb-count { position: absolute; right: -8px; top: -6px; min-width: 22px; height: 22px; padding: 0 6px; border-radius: 11px; background: #F4F2EE; color: #0B0B0B; font: 700 11px/22px ${fonts.bold}, Inter, system-ui, sans-serif; text-align: center; box-shadow: 0 3px 8px rgba(0,0,0,0.45); }
.jb-free { position: absolute; right: -1px; bottom: -1px; width: 12px; height: 12px; border-radius: 50%; background: #F4F2EE; border: 2.5px solid #0B0B0B; }
.jb-free::before { content: ""; position: absolute; inset: -6px; border-radius: 50%; border: 2px solid rgba(244,242,238,0.8); animation: jb-ping 2.2s ease-out infinite; }
@keyframes jb-ping { 0% { transform: scale(0.5); opacity: 1; } 80%, 100% { transform: scale(1.4); opacity: 0; } }
.jb-tag { margin-top: 6px; white-space: nowrap; border-radius: 999px; padding: 4px 9px; font: 700 11.5px ${fonts.bold}, Inter, system-ui, sans-serif; letter-spacing: 0.2px; background: rgba(11,11,11,0.86); color: #F4F2EE; border: 1px solid rgba(244,242,238,0.22); box-shadow: 0 6px 14px rgba(0,0,0,0.45); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); }
.jb-pin.selected .jb-tag { background: #F4F2EE; color: #0B0B0B; border-color: #F4F2EE; font-size: 12.5px; padding: 5px 11px; }
.jb-stem { width: 2px; background: linear-gradient(#F4F2EE, rgba(244,242,238,0.15)); border-radius: 1px; }
.jb-pin.dim { opacity: 0.55; }
.jb-pin.dim:hover, .jb-pin.dim:focus-within { opacity: 1; }
@media (prefers-reduced-motion: reduce) { .jb-body, .jb-free::before, .jb-pin.selected .jb-ground { animation: none; } }
`;

let styled = false;
function injectStyle() {
  if (styled || typeof document === "undefined") return;
  styled = true;
  const tag = document.createElement("style");
  tag.textContent = PIN_CSS;
  document.head.appendChild(tag);
}

const FONTS = { regular: fonts.regular, medium: fonts.medium, semibold: fonts.semibold, bold: fonts.bold };
const TILT_PITCH = 56;
const PIN_LIFT = 36;
const TILT_BEARING = -34; // looking north-west: the Gulf on the horizon, the city in front
const MIN_ZOOM = 5.4;
const MAX_ZOOM = 17.6;
const UAE_CAMERA: Camera = { x: lngToX(54.6), y: latToY(24.35), zoom: 6.6, bearing: 0, pitch: 0 };

interface Item {
  key: string;
  lead: MapPin;
  members: MapPin[];
  x: number;
  y: number;
  depth: number;
  dx: number; // fan-out offset for pins at the same address
}

const pinWorld = (p: MapPin): [number, number] => [lngToX(p.lng), latToY(p.lat)];
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const reduceMotion = () => typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Website (and the demo page): the offline 3D map of the UAE, with a photo pin per barber and barbershop. */
export function BarberMap({
  pins, height, selectedId, onSelect, interactive = true, onPress, placeName, tilt = true, onTiltChange, orbit = false,
  insets, fitKey, focus, scrollZoom = false, radius = 24, onCenter,
}: BarberMapProps) {
  const host = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const pinEls = useRef(new Map<string, HTMLElement>());
  const compass = useRef<HTMLDivElement>(null);
  const scale = useRef<HTMLDivElement>(null);
  const scaleText = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [is3d, setIs3d] = useState(tilt);
  const [outside, setOutside] = useState(false);
  const top = insets?.top ?? 0;
  const bottom = insets?.bottom ?? 0;

  const st = useRef({
    cam: { ...UAE_CAMERA } as Camera,
    w: 0,
    h: 0,
    raf: 0,
    anim: null as null | { from: Camera; to: Camera; t0: number; dur: number; bump: number },
    vel: null as null | { x: number; y: number; t: number },
    pointers: new Map<number, { x: number; y: number }>(),
    gesture: null as null | { mode: "pan" | "rotate" | "pinch"; world?: [number, number]; x: number; y: number; dist?: number; angle?: number; zoom?: number; bearing?: number; pitch?: number },
    moved: 0,
    sig: "",
    items: [] as Item[],
    fitted: false,
    lastMove: [] as { x: number; y: number; t: number }[],
  }).current;

  const props = useRef({ pins, selectedId, onSelect, interactive, orbit, top, bottom, is3d, onCenter });
  props.current = { pins, selectedId, onSelect, interactive, orbit, top, bottom, is3d, onCenter };

  const selected = useMemo(() => pins.find((p) => p.id === selectedId) ?? null, [pins, selectedId]);
  const highlight = useMemo(() => (selected ? buildingAt(...pinWorld(selected)) : null), [selected]);
  const hl = useRef(highlight);
  hl.current = highlight;

  function view(cam = st.cam) {
    // Pins stand up from their spot, so the spot sits a little below the middle.
    return new MapView(cam, st.w, st.h, (props.current.top - props.current.bottom) / 2 + (props.current.onCenter ? 0 : PIN_LIFT));
  }

  function invalidate() {
    if (!st.raf) st.raf = requestAnimationFrame(frame);
  }

  function frame(t: number) {
    st.raf = 0;
    if (!st.w || !st.h) return;
    let again = false;
    if (st.anim) {
      const a = st.anim;
      const k = Math.min(1, (t - a.t0) / a.dur);
      const e = ease(k);
      st.cam = {
        x: a.from.x + (a.to.x - a.from.x) * e,
        y: a.from.y + (a.to.y - a.from.y) * e,
        zoom: a.from.zoom + (a.to.zoom - a.from.zoom) * e - a.bump * Math.sin(Math.PI * e),
        bearing: a.from.bearing + (a.to.bearing - a.from.bearing) * e,
        pitch: a.from.pitch + (a.to.pitch - a.from.pitch) * e,
      };
      if (k >= 1) st.anim = null;
      else again = true;
    } else if (st.vel) {
      const dt = 16;
      const decay = 0.92;
      st.cam.x -= st.vel.x * dt;
      st.cam.y -= st.vel.y * dt;
      st.vel = { x: st.vel.x * decay, y: st.vel.y * decay, t };
      if (Math.hypot(st.vel.x, st.vel.y) * st.w * 256 * 2 ** st.cam.zoom < 0.02) st.vel = null;
      else again = true;
    } else if (props.current.orbit && !reduceMotion()) {
      st.cam.bearing += 0.08;
      again = true;
    }
    clampCamera();
    render();
    if (again) invalidate();
  }

  function clampCamera() {
    const c = st.cam;
    c.zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, c.zoom));
    c.pitch = Math.max(0, Math.min(MAX_PITCH, c.pitch));
    c.bearing = ((((c.bearing + 180) % 360) + 360) % 360) - 180;
    c.x = Math.max(lngToX(40), Math.min(lngToX(68), c.x));
    c.y = Math.max(latToY(32), Math.min(latToY(16), c.y));
  }

  function render() {
    const el = canvas.current;
    const ctx = el?.getContext("2d");
    if (!el || !ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    if (el.width !== Math.round(st.w * dpr) || el.height !== Math.round(st.h * dpr)) {
      el.width = Math.round(st.w * dpr);
      el.height = Math.round(st.h * dpr);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const v = view();
    const placed = layoutPins(v);
    drawFrame(ctx, v, { theme: NIGHT, fonts: FONTS, highlight: hl.current, avoid: placed, grid: false, margins: { top: props.current.top, bottom: props.current.bottom + 30 } });
    (globalThis as { __jbMap?: unknown }).__jbMap = { ...stats, zoom: st.cam.zoom, pitch: st.cam.pitch, bearing: st.cam.bearing };
    props.current.onCenter?.(yToLat(st.cam.y), xToLng(st.cam.x));
    const isOut = !covered(st.cam.x, st.cam.y);
    setOutside((o) => (o === isOut ? o : isOut));
    if (compass.current) compass.current.style.transform = `rotate(${-st.cam.bearing}deg) rotateX(${st.cam.pitch * 0.6}deg)`;
    if (scale.current && scaleText.current) {
      const s = scaleBar(v, 84);
      scale.current.style.width = `${Math.round(s.px)}px`;
      scaleText.current.textContent = s.label;
    }
  }

  /** Clusters pins that overlap on screen, positions their DOM nodes and returns their boxes. */
  function layoutPins(v: MapView) {
    const { pins: list, selectedId: sel } = props.current;
    const z = st.cam.zoom;
    const order = [...list].sort((a, b) =>
      Number(b.id === sel) - Number(a.id === sel) || Number(b.kind === "shop") - Number(a.kind === "shop") || Number(b.free) - Number(a.free) || (b.rating ?? 0) - (a.rating ?? 0),
    );
    // Pins at the same address fan out side by side once you're close.
    const fan = new Map<string, number>();
    if (z >= 15) {
      const groups = new Map<string, MapPin[]>();
      for (const p of order) {
        const k = `${p.lat.toFixed(4)},${p.lng.toFixed(4)}`;
        groups.set(k, [...(groups.get(k) ?? []), p]);
      }
      for (const g of groups.values()) if (g.length > 1) g.forEach((p, i) => fan.set(p.id, (i - (g.length - 1) / 2) * 86));
    }
    const out: Item[] = [];
    const R = 84;
    for (const p of order) {
      const [wx, wy] = pinWorld(p);
      const [sx, sy, depth] = v.project(wx, wy);
      if (depth <= 0) continue;
      const dx = fan.get(p.id) ?? 0;
      const near = fan.has(p.id) ? undefined : out.find((c) => !c.dx && Math.abs(c.x - sx) < R && Math.abs(c.y - sy) < R * 0.85);
      if (near) near.members.push(p);
      else out.push({ key: p.id, lead: p, members: [p], x: sx, y: sy, depth, dx });
    }
    for (const c of out) c.key = c.members.length > 1 ? `c:${c.members.map((m) => m.id).sort().join(",")}` : c.lead.id;
    const sig = out.map((c) => c.key).join("|");
    if (sig !== st.sig) {
      st.sig = sig;
      st.items = out;
      setItems(out);
    } else {
      st.items.forEach((c, i) => Object.assign(c, out[i]));
    }
    const placed: { x0: number; y0: number; x1: number; y1: number }[] = [];
    const stem = 8 + 30 * v.sP;
    for (const c of st.items) {
      const el = pinEls.current.get(c.key);
      const off = c.x + c.dx < -80 || c.x + c.dx > st.w + 80 || c.y < -20 || c.y > st.h + 160;
      const k = Math.max(0.62, Math.min(1.12, v.f / c.depth));
      if (el) {
        el.style.display = off ? "none" : "";
        el.style.transform = `translate3d(${(c.x + c.dx).toFixed(1)}px, ${c.y.toFixed(1)}px, 0) scale(${k.toFixed(3)})`;
        el.style.zIndex = String((c.lead.id === props.current.selectedId ? 100000 : 0) + Math.round(1e6 / c.depth));
        el.style.setProperty("--stem", `${stem}px`);
        const shadow = el.firstElementChild as HTMLElement | null;
        if (shadow) shadow.style.transform = `scale(1, ${(0.45 + 0.55 * v.cP).toFixed(2)})`;
      }
      const hw = 32 * k;
      placed.push({ x0: c.x + c.dx - hw, y0: c.y - (stem + 80) * k, x1: c.x + c.dx + hw, y1: c.y + 4 });
    }
    return placed;
  }

  // ---- Camera moves -------------------------------------------------------------------------

  function flyTo(to: Partial<Camera>, dur = 900) {
    const from = { ...st.cam };
    const target: Camera = { ...from, ...to };
    let db = target.bearing - from.bearing;
    if (db > 180) target.bearing -= 360;
    if (db < -180) target.bearing += 360;
    db = Math.abs(target.bearing - from.bearing);
    const px = Math.hypot(target.x - from.x, target.y - from.y) * 256 * 2 ** Math.min(from.zoom, target.zoom);
    const bump = px > st.w * 1.5 ? Math.min(3, Math.log2(px / st.w)) * 0.6 : 0;
    st.vel = null;
    if (reduceMotion() || !st.w) {
      st.cam = target;
      st.anim = null;
    } else st.anim = { from, to: target, t0: performance.now(), dur: dur + bump * 250 + db * 2, bump };
    invalidate();
  }

  /** The camera that shows every pin, clear of the overlays. */
  function cameraFor(list: MapPin[], threeD: boolean): Camera {
    const pitch = threeD ? TILT_PITCH : 0;
    const bearing = threeD ? TILT_BEARING : 0;
    if (!list.length) return { ...UAE_CAMERA, pitch, bearing };
    const xs = list.map((p) => lngToX(p.lng)), ys = list.map((p) => latToY(p.lat));
    const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
    const w = Math.max(st.w - 90, 120);
    const h = Math.max(st.h - props.current.top - props.current.bottom - 120, 100);
    // Rotation makes the box's footprint bigger; tilt squashes it vertically.
    const rad = (bearing * Math.PI) / 180;
    const bw = Math.abs((x1 - x0) * Math.cos(rad)) + Math.abs((y1 - y0) * Math.sin(rad));
    const bh = Math.abs((x1 - x0) * Math.sin(rad)) + Math.abs((y1 - y0) * Math.cos(rad));
    const zoom = list.length === 1 || (bw < 1e-7 && bh < 1e-7) ? 16.3 : Math.min(16.3, Math.log2(Math.min(w / (bw * 256), h / (bh * 256 * (threeD ? 1.5 : 1)))));
    let z = Math.max(MIN_ZOOM, zoom - (threeD ? 0.15 : 0));
    let cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
    if (!props.current.interactive && list.length > 1 && z < 11.4) {
      // A small still preview: show the city in 3D around where most barbers are, not dots on a country.
      const mid = (v: number[]) => [...v].sort((a, b) => a - b)[Math.floor(v.length / 2)]!;
      [cx, cy, z] = [mid(xs), mid(ys), 11.4];
    }
    // A country-wide view reads better a little less tilted.
    return { x: cx, y: cy, zoom: z, bearing, pitch: threeD && z < 8.5 ? 44 : pitch };
  }

  /** Frame every pin — or the selected one, when there is one, unless `all`. */
  function fit(animate: boolean, all = false) {
    const sel = all ? undefined : props.current.pins.find((p) => p.id === props.current.selectedId);
    const cam = cameraFor(sel ? [sel] : props.current.pins, props.current.is3d);
    if (animate) flyTo(cam, 1100);
    else {
      st.cam = cam;
      invalidate();
    }
  }

  // ---- Setup --------------------------------------------------------------------------------

  useEffect(() => {
    injectStyle();
    const el = host.current;
    if (!el) return;
    const size = () => {
      const r = el.getBoundingClientRect();
      st.w = r.width;
      st.h = r.height;
      if (!st.fitted && st.w > 0) {
        st.fitted = true;
        const sel = props.current.pins.find((p) => p.id === props.current.selectedId);
        const cam = cameraFor(sel ? [sel] : props.current.pins, props.current.is3d);
        // Arrive with a short, smooth glide down into the city.
        st.cam = { ...cam, zoom: cam.zoom - 1.2, bearing: cam.bearing + 18, pitch: Math.max(0, cam.pitch - 20) };
        flyTo(cam, 1400);
      }
      invalidate();
    };
    const ro = new ResizeObserver(size);
    ro.observe(el);
    size();
    // React's wheel listener is passive; zooming has to stop the page from scrolling.
    const wheel = (e: WheelEvent) => onWheelRef.current(e);
    el.addEventListener("wheel", wheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", wheel);
      ro.disconnect();
      cancelAnimationFrame(st.raf);
      st.raf = 0;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pinKey = pins.map((p) => `${p.id}:${p.lat},${p.lng}`).join("|");
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    st.sig = "";
    if (st.w) fit(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pinKey, fitKey]);

  useEffect(() => {
    if (focus && st.w) flyTo({ x: lngToX(focus.lng), y: latToY(focus.lat), zoom: focus.zoom, ...(props.current.is3d ? { pitch: TILT_PITCH } : {}) }, 1200);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus?.key]);

  // Fly to the selected pin when it's off screen or hidden in a cluster.
  useEffect(() => {
    if (!selected || !st.w) return invalidate();
    const v = view();
    const [sx, sy] = v.project(...pinWorld(selected));
    const inCluster = st.items.some((c) => c.members.length > 1 && c.members.some((m) => m.id === selected.id));
    const offScreen = sx < 40 || sx > st.w - 40 || sy < top + 60 || sy > st.h - bottom - 20;
    if (inCluster || offScreen) flyTo({ x: lngToX(selected.lng), y: latToY(selected.lat), zoom: Math.max(st.cam.zoom, inCluster ? 15.6 : 13.5) });
    else invalidate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  useEffect(() => {
    setIs3d(tilt);
  }, [tilt]);

  useEffect(() => invalidate(), [orbit, top, bottom]); // eslint-disable-line react-hooks/exhaustive-deps

  // Position fresh pin nodes before the browser paints them.
  useLayoutEffect(() => {
    if (st.w) layoutPins(view());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, selectedId]);

  function toggle3d() {
    const next = !is3d;
    setIs3d(next);
    props.current.is3d = next;
    onTiltChange?.(next);
    flyTo(next ? { pitch: TILT_PITCH, bearing: TILT_BEARING, zoom: st.cam.zoom } : { pitch: 0, bearing: 0 }, 800);
  }

  function zoomBy(d: number) {
    flyTo({ zoom: Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, st.cam.zoom + d)) }, 350);
  }

  // ---- Gestures -----------------------------------------------------------------------------

  function local(e: { clientX: number; clientY: number }) {
    const r = host.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  function onPointerDown(e: React.PointerEvent) {
    if (!interactive) return;
    if ((e.target as HTMLElement).closest(".jb-pin")) return;
    host.current?.focus({ preventScroll: true });
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    const p = local(e);
    st.pointers.set(e.pointerId, p);
    st.anim = null;
    st.vel = null;
    st.moved = 0;
    st.lastMove = [{ ...p, t: performance.now() }];
    startGesture(e.button === 2 || e.ctrlKey || e.shiftKey ? "rotate" : "pan");
  }

  function startGesture(mode: "pan" | "rotate") {
    const pts = [...st.pointers.values()];
    if (pts.length >= 2) {
      const [a, b] = pts as [{ x: number; y: number }, { x: number; y: number }];
      const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      st.gesture = { mode: "pinch", x: mid.x, y: mid.y, dist: Math.hypot(b.x - a.x, b.y - a.y), angle: Math.atan2(b.y - a.y, b.x - a.x), zoom: st.cam.zoom, bearing: st.cam.bearing, pitch: st.cam.pitch, world: view().unproject(mid.x, mid.y) ?? undefined };
    } else if (pts.length === 1) {
      const p = pts[0]!;
      st.gesture = { mode, x: p.x, y: p.y, world: view().unproject(p.x, p.y) ?? undefined, bearing: st.cam.bearing, pitch: st.cam.pitch };
    }
  }

  /** Move the camera so that `world` sits under screen point (x, y). */
  function anchor(world: [number, number], x: number, y: number) {
    const now = view().unproject(x, y);
    if (!now) return;
    st.cam.x += world[0] - now[0];
    st.cam.y += world[1] - now[1];
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!st.pointers.has(e.pointerId)) return;
    const p = local(e);
    const prev = st.pointers.get(e.pointerId)!;
    st.moved += Math.hypot(p.x - prev.x, p.y - prev.y);
    st.pointers.set(e.pointerId, p);
    const g = st.gesture;
    if (!g) return;
    if (g.mode === "pan" && g.world) {
      anchor(g.world, p.x, p.y);
      st.lastMove.push({ ...p, t: performance.now() });
      if (st.lastMove.length > 5) st.lastMove.shift();
    } else if (g.mode === "rotate") {
      st.cam.bearing = g.bearing! + (p.x - g.x) * 0.35;
      st.cam.pitch = Math.max(0, Math.min(MAX_PITCH, g.pitch! - (p.y - g.y) * 0.3));
      if (st.cam.pitch > 5 !== is3d) setIs3d(st.cam.pitch > 5);
    } else if (g.mode === "pinch") {
      const [a, b] = [...st.pointers.values()] as [{ x: number; y: number }, { x: number; y: number }];
      const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      const dist = Math.hypot(b.x - a.x, b.y - a.y);
      const angle = Math.atan2(b.y - a.y, b.x - a.x);
      st.cam.zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, g.zoom! + Math.log2(dist / g.dist!)));
      st.cam.bearing = g.bearing! - ((angle - g.angle!) * 180) / Math.PI;
      // Two fingers moving up together tilt the map.
      st.cam.pitch = Math.max(0, Math.min(MAX_PITCH, g.pitch! - (mid.y - g.y) * 0.25));
      if (g.world) anchor(g.world, mid.x, mid.y);
    }
    clampCamera();
    invalidate();
  }

  function onPointerUp(e: React.PointerEvent) {
    if (!st.pointers.has(e.pointerId)) return;
    st.pointers.delete(e.pointerId);
    const g = st.gesture;
    if (g?.mode === "pan" && st.pointers.size === 0 && st.lastMove.length >= 2) {
      const a = st.lastMove[0]!, b = st.lastMove[st.lastMove.length - 1]!;
      const dt = b.t - a.t;
      if (dt > 0 && dt < 120 && performance.now() - b.t < 60) {
        const v = view();
        const wa = v.unproject(a.x, a.y), wb = v.unproject(b.x, b.y);
        if (wa && wb) {
          st.vel = { x: (wa[0] - wb[0]) / dt, y: (wa[1] - wb[1]) / dt, t: performance.now() };
          invalidate();
        }
      }
    }
    st.gesture = null;
    if (st.pointers.size) startGesture("pan");
  }

  function onWheel(e: WheelEvent) {
    if (!interactive) return;
    if (!scrollZoom && !e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    const p = local(e);
    const world = view().unproject(p.x, p.y);
    st.anim = null;
    st.vel = null;
    st.cam.zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, st.cam.zoom - e.deltaY * (e.deltaMode ? 0.05 : 0.0022)));
    if (world) anchor(world, p.x, p.y);
    clampCamera();
    invalidate();
  }

  const onWheelRef = useRef(onWheel);
  onWheelRef.current = onWheel;

  function onDoubleClick(e: React.MouseEvent) {
    if (!interactive) return;
    const p = local(e);
    const world = view().unproject(p.x, p.y);
    if (world) flyTo({ x: world[0], y: world[1], zoom: st.cam.zoom + 1.2 }, 450);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!interactive) return;
    const step = 90 / (256 * 2 ** st.cam.zoom);
    const r = (st.cam.bearing * Math.PI) / 180;
    const move = (dx: number, dy: number) => flyTo({ x: st.cam.x + (dx * Math.cos(r) - dy * Math.sin(r)) * step, y: st.cam.y + (dx * Math.sin(r) + dy * Math.cos(r)) * step }, 200);
    const keys: Record<string, () => void> = {
      "+": () => zoomBy(1), "=": () => zoomBy(1), "-": () => zoomBy(-1),
      ArrowLeft: () => move(-1, 0), ArrowRight: () => move(1, 0), ArrowUp: () => move(0, -1), ArrowDown: () => move(0, 1),
    };
    const fn = keys[e.key];
    if (fn) {
      e.preventDefault();
      fn();
    }
  }

  function pressPin(item: Item) {
    if (st.moved > 6) return;
    if (!interactive) return onPress?.();
    if (item.members.length > 1) {
      const cam = cameraFor(item.members, props.current.is3d);
      flyTo({ ...cam, zoom: Math.max(cam.zoom, st.cam.zoom + 1.5), bearing: st.cam.bearing, pitch: st.cam.pitch });
      return;
    }
    onSelect?.(item.lead.id);
  }

  const label = `3D map of ${placeName ?? "the UAE"}: ${pins.length} ${pins.length === 1 ? "place" : "places"}. Drag to move, pinch or Ctrl+scroll to zoom, right-drag to turn and tilt.`;

  return (
    <View style={{ height, borderRadius: radius, overflow: "hidden", backgroundColor: NIGHT.land }}>
      <div
        ref={host}
        className={`jb-map3d${interactive ? "" : " still"}`}
        tabIndex={interactive ? 0 : -1}
        aria-label={label}
        role="application"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onDoubleClick={onDoubleClick}
        onKeyDown={onKeyDown}
        onContextMenu={(e) => interactive && e.preventDefault()}
        onClick={(e) => {
          if (!interactive && onPress && !(e.target as HTMLElement).closest(".jb-pin")) onPress();
        }}
        style={{ cursor: interactive ? "grab" : onPress ? "pointer" : "default" }}
      >
        <canvas ref={canvas} aria-hidden />
        <div className="jb-pins">
          {!onCenter && items.map((item, i) => (
            <PinNode
              key={item.key}
              item={item}
              index={i}
              selected={item.members.some((m) => m.id === selectedId)}
              dim={!!selectedId && !item.members.some((m) => m.id === selectedId)}
              refFn={(el) => {
                if (el) pinEls.current.set(item.key, el);
                else pinEls.current.delete(item.key);
              }}
              onPress={() => pressPin(item)}
              focusable={interactive || !!onPress}
            />
          ))}
        </div>
      </div>

      {interactive && (
        <View style={{ position: "absolute", right: 12, top: top + 12, gap: 8 }}>
          <MapButton label={is3d ? "Switch to 2D map" : "Switch to 3D map"} onPress={toggle3d}>
            <T variant="small" color="#F4F2EE" style={{ fontFamily: fonts.bold, fontSize: 13, letterSpacing: 0.5 }}>{is3d ? "2D" : "3D"}</T>
          </MapButton>
          <MapButton label="Point north" onPress={() => flyTo({ bearing: 0 }, 600)}>
            <div ref={compass} style={{ width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="12" height="22" viewBox="0 0 12 22" aria-hidden>
                <path d="M6 0 L12 11 L0 11 Z" fill="#F4F2EE" />
                <path d="M0 11 L12 11 L6 22 Z" fill="rgba(244,242,238,0.35)" />
              </svg>
            </div>
          </MapButton>
          <View style={{ borderRadius: 16, overflow: "hidden", backgroundColor: "rgba(11,11,11,0.82)", borderWidth: 1, borderColor: "rgba(244,242,238,0.16)" }}>
            <MapButton label="Zoom in" onPress={() => zoomBy(1)} flat>
              <Ionicons name="add" size={20} color="#F4F2EE" />
            </MapButton>
            <View style={{ height: 1, backgroundColor: "rgba(244,242,238,0.14)", marginHorizontal: 8 }} />
            <MapButton label="Zoom out" onPress={() => zoomBy(-1)} flat>
              <Ionicons name="remove" size={20} color="#F4F2EE" />
            </MapButton>
          </View>
          <MapButton label="Show all" onPress={() => fit(true, true)}>
            <Ionicons name="scan-outline" size={18} color="#F4F2EE" />
          </MapButton>
        </View>
      )}

      {interactive && (
        <View pointerEvents="none" style={{ position: "absolute", left: 14, bottom: bottom + 12 }}>
          <div ref={scaleText} style={{ color: "rgba(244,242,238,0.75)", font: `600 10px ${fonts.semibold}, Inter, sans-serif`, marginBottom: 3 }} />
          <div ref={scale} style={{ height: 5, borderLeft: "1.5px solid rgba(244,242,238,0.75)", borderRight: "1.5px solid rgba(244,242,238,0.75)", borderBottom: "1.5px solid rgba(244,242,238,0.75)" }} />
        </View>
      )}
      <View pointerEvents="none" style={{ position: "absolute", right: 10, bottom: (interactive ? bottom : 0) + 6 }}>
        <T variant="small" color="rgba(244,242,238,0.45)" style={{ fontSize: 9.5 }}>© OpenStreetMap</T>
      </View>
      {onCenter && <CenterPin />}
      {outside && (
        <View pointerEvents="none" style={{ position: "absolute", left: 12, top: top + 12, backgroundColor: "rgba(11,11,11,0.82)", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: "rgba(244,242,238,0.16)" }}>
          <T variant="small" color="rgba(244,242,238,0.8)">{placeName ? `${placeName} · ` : ""}detailed 3D map covers the UAE</T>
        </View>
      )}
    </View>
  );
}

/** The fixed pin for picking a spot: its tip marks the middle of the map. */
function CenterPin() {
  return (
    <View pointerEvents="none" style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, alignItems: "center", justifyContent: "center" }}>
      <View style={{ alignItems: "center", transform: [{ translateY: -27 }] }}>
        <Ionicons name="location" size={46} color="#F4F2EE" style={{ textShadowColor: "rgba(0,0,0,0.6)", textShadowRadius: 10, textShadowOffset: { width: 0, height: 4 } }} />
      </View>
      <View style={{ position: "absolute", width: 10, height: 5, borderRadius: 5, backgroundColor: "rgba(244,242,238,0.8)" }} />
    </View>
  );
}

function MapButton({ label, onPress, children, flat }: { label: string; onPress: () => void; children: React.ReactNode; flat?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => [
        { width: 42, height: 42, alignItems: "center", justifyContent: "center", cursor: "pointer" } as object,
        !flat && { borderRadius: 16, backgroundColor: "rgba(11,11,11,0.82)", borderWidth: 1, borderColor: "rgba(244,242,238,0.16)", boxShadow: "0 8px 20px rgba(0,0,0,0.35)", backdropFilter: "blur(8px)" } as object,
        hovered && { backgroundColor: "rgba(38,37,35,0.92)" },
        pressed && { opacity: 0.75 },
      ]}
    >
      {children}
    </Pressable>
  );
}

function PinNode({ item, index, selected, dim, refFn, onPress, focusable }: { item: Item; index: number; selected: boolean; dim: boolean; refFn: (el: HTMLDivElement | null) => void; onPress: () => void; focusable: boolean }) {
  const p = item.lead;
  const count = item.members.length;
  const photo = p.photoUrl && !p.photoUrl.startsWith("brand:") ? resolveMedia(p.photoUrl) : null;
  const others = item.members.slice(1, 3);
  const what = count > 1 ? `${count} places here, including ${p.title ?? p.label}. Zoom in` : `${p.title ?? ""}${p.kind === "shop" ? ", barbershop" : ""}, ${p.label}${p.rating ? `, rated ${p.rating.toFixed(1)}` : ""}${p.free ? ", free today" : ""}${p.address ? `, ${p.address}` : ""}`;
  return (
    <div ref={refFn} className={`jb-pin${p.kind === "shop" ? " shop" : ""}${selected ? " selected" : ""}${dim ? " dim" : ""}`} style={{ transform: "translate3d(-999px,-999px,0)" }}>
      <span className="jb-shadow" />
      <span className="jb-ground" />
      <button
        type="button"
        className="jb-body"
        aria-label={what}
        aria-pressed={selected}
        tabIndex={focusable ? 0 : -1}
        onClick={(e) => {
          e.stopPropagation();
          onPress();
        }}
        style={{ animationDelay: `${Math.min(index, 14) * 45}ms` }}
      >
        <span style={{ position: "relative", display: "flex", justifyContent: "center" }}>
          {others.map((o, i) => {
            const ph = o.photoUrl && !o.photoUrl.startsWith("brand:") ? resolveMedia(o.photoUrl) : null;
            return <span key={o.id} className="jb-stack" style={{ transform: `translateX(${(i === 0 ? -1 : 1) * 16}px)`, backgroundImage: ph ? `url("${ph}")` : undefined }} />;
          })}
          <span className="jb-head" style={{ backgroundImage: photo ? `url("${photo}")` : undefined }}>
            {!photo && <ScissorsGlyph />}
            {count > 1 ? <span className="jb-count">{count}</span> : p.free && p.kind !== "shop" ? <span className="jb-free" /> : null}
          </span>
        </span>
        <span className="jb-tag">{count > 1 ? (item.members.every((m) => m.kind === "shop") ? `${count} barbershops` : `${count} here`) : p.label}</span>
        <span className="jb-stem" style={{ height: "var(--stem, 10px)" }} />
      </button>
    </div>
  );
}

function ScissorsGlyph() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F4F2EE" strokeWidth="1.8" aria-hidden>
      <circle cx="6" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <path d="M20 4 8.1 15.9M14.5 14.5 20 20M8.1 8.1 12 12" />
    </svg>
  );
}
