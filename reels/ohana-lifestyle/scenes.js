'use strict';
// ---------------------------------------------------------------------------
// scenes.js TEMPLATE (Abu Dhabi look). Copy of the beat types used in the delivered reels - delete what the script does not need.
// buildScenes() runs once after timeline.json is loaded; every scene is a pure function of time t.
//
//   * Anchor each scene to what is SAID:  wt(/^REGEX$/, nth, fallbackSeconds)  -> start time of the nth word whose (upper-cased) text matches.
//     Display tokens come from script.txt ({60%|sixty percent} shows "60%"), so match what the CAPTION shows: /^60%/ , /^1,852/ , /^DIRHAMS$/.
//   * A scene is { id, a, b, box: [330, 1270], fn(t) }: it is centred at y=800 inside the Reels safe zone (x 130-950, y 330-1270). Never draw outside.
//     Scene b = start of the next scene (minus ~0.05 s). The last scene has last: true and b: DUR.
//   * FACE beats: FACE_SEGS = [[0, hookEnd]] puts him full-screen (build/footage frames) for those seconds; everything else is graphics.
//   * cues = sound cues for audio.py: 'cut' (added automatically at each scene start), 'wh' whoosh, 'stamp', 'pin', 'send'. Keep them sparse - the mix is whoosh-only and very quiet.
// ---------------------------------------------------------------------------
function buildScenes() {
  const cues = [], SCENES = [], tw = (re, n = 0, fb = 0, from = 0) => wt(re, n, fb, from);
  const add = (s, cutCue = true) => { SCENES.push(s); if (cutCue && s.a > 0.5) cues.push({ k: 'cut', t: s.a }); return s; };
  const wh = (t, d = 0.4, g, up = true) => cues.push({ k: 'wh', t, d, g, up });

  // ---- 1. key times: the spoken words the graphics hang on (fallback seconds keep the file renderable on any timeline)
  const K = {
    hookA: tw(/^BILLION$/, 0, 1.4), hookB: tw(/^HOURS\??$/, 0, 3.6),
    place: tw(/^YAS$/, 0, 6.0), fig: tw(/^1,852/, 0, 9.0), unit: tw(/^DIRHAMS$/, 0, 11.0),
    cmp: tw(/^CHEAPER/, 0, 15.0), art: tw(/^PROGRAMME/, 0, 20.0), pct1: tw(/^30%/, 0, 24.0), pct2: tw(/^35%/, 0, 26.0), msg: tw(/^MESSAGE$/, 0, 28.0),
  };
  const HOOK_END = 4.17;                                              // end of his on-camera hook (build/cutmap.json: hook_end); [] = no face beat at all
  const FACE_SEGS = [[0, HOOK_END]], PUNCHES = [[K.hookA, 0.06], [K.hookB, 0.06]];
  const IMAGES = { photo: 'assets/photo.jpg', article: 'assets/article.png' };      // id -> file in assets/ (real pictures, screenshots, logos)

  // ---- 2. satellite flight: outline an island/district, pin the project  (outlines.json from scripts/outline_from_osm.py)
  const s1a = HOOK_END, s1b = 7.0;
  SAT_SCENES.map = { a: s1a, b: s1b + 0.6, veil: 'top', keys: [[0, 54.605, 24.474, 12.55], [1.5, 54.616, 24.4725, 13.45], [(s1b - s1a) + 0.4, 54.6222, 24.4715, 14.35]] };   // [seconds into the scene, lon, lat, zoom]
  add({ id: 'map', kind: 'sat', a: s1a, b: s1b, cfg: {
    outlines: [{ key: 'yas', t0: s1a + 0.15, t1: K.place + 0.5 }],
    pins: [{ lon: 54.6220, lat: 24.4720, t: K.place, title: 'PROJECT NAME', sub: 'AREA · EMIRATE' }],
    top(t) { bw(t, 'AREA · EMIRATE', 375, s1a + 0.1, { size: 42, ls: 6, color: C.dim, w: 700 }); bw(t, 'PROJECT NAME', 455, K.place - 0.1, { size: 74, ls: 2, hl: true }); } } });
  cues.push({ k: 'pin', t: K.place }, { k: 'wh', t: s1a - 0.1, d: 0.7 });

  // ---- 3. real picture + a counting number
  const s2b = 12.0;
  add({ id: 'price', a: s1b, b: s2b, box: [330, 1270], fn(t) {
    card(t, 'photo', { x: 140, y: 345, w: 800, h: 420, a: s1b + 0.04, out: s2b - 0.3, from: [-260, 40], rot: -2, fit: 'cover', fy: 0.35, zoom: [1, 1.05], chip: 'SOURCE · DATE' });
    bw(t, 'WHAT THE NUMBER IS', 880, K.fig - 0.8, { size: 52, ls: 4, color: C.dim, w: 700 });
    bigNumber(t, { val: 1852, dec: 0, fin: '1,852', suffix: '', a0: K.fig, a1: K.fig + 1.2, y: 1010, sc: 0.9 });
    bw(t, 'DIRHAMS PER SQ FT', 1235, K.unit - 0.05, { size: 60, ls: 8, color: C.gold });
  } });

  // ---- 4. two bars + the gap between them (barRow comes from scenes_lib.js; hang a dashed ghost on the returned { by, len })
  const s3b = 17.0;
  add({ id: 'bars', a: s2b, b: s3b, box: [330, 1270], fn(t) {
    bw(t, 'DIRHAMS PER SQ FT', 392, s2b + 0.05, { size: 46, ls: 8, color: C.dim, w: 700 });
    barRow(t, { label: 'OURS', sub: 'WHAT IT IS', y: 520, a: s2b + 0.1, g0: s2b + 0.25, g1: s2b + 1.0, val: 1852, max: 2470, gold: true });
    barRow(t, { label: 'THE OTHER ONE', sub: 'WHAT IT IS', y: 800, a: s2b + 1.5, g0: s2b + 1.7, g1: s2b + 3.0, val: 2470, max: 2470 });
    bw(t, '25% CHEAPER', 1160, K.cmp - 0.15, { size: 112, ls: 2, hl: true, maxW: 740 });
  } });

  // ---- 5. a real article as a card: glide onto a line (focus) and mark it (hl). bbox = [x, y, w, h] in IMAGE pixels - measure with scripts/textlines.py
  const s4b = 23.0;
  add({ id: 'article', a: s3b, b: s4b, box: [330, 1270], fn(t) {
    bw(t, 'THE HEADLINE IN CAPS', 385, K.art - 0.1, { size: 62, ls: 2, hl: true });
    card(t, 'article', { x: 140, y: 495, w: 800, h: 510, a: s3b + 0.04, out: s4b - 0.3, from: [-250, 50], rot: -1.6, fit: 'cover', fy: 0, zoom: [1, 1.03], chip: 'PUBLICATION NAME',
      focus: [{ bbox: [72, 690, 1270, 170], t0: s3b + 0.6, t1: s3b + 1.3, zoom: 1.12 }], hl: [{ bbox: [74, 789, 630, 69], t0: K.art, t1: K.art + 0.6 }] });
    pillRow(t, 'flag', 'FIRST POINT', 1100, K.art + 1.0, { w: 820, h: 104 });
    pillRow(t, 'check', 'SECOND POINT', 1220, K.art + 2.0, { w: 820, h: 104 });
  } });

  // ---- 6. two gauges
  const s5b = 28.0 - 0.04;
  add({ id: 'split', a: s4b, b: s5b, box: [330, 1270], fn(t) {
    bw(t, 'HEADER IN CAPS', 410, s4b + 0.1, { size: 50, ls: 7, color: C.dim, w: 700 });
    gauge(t, { cx: 340, pct: 30, a0: K.pct1 - 0.1, a1: K.pct1 + 0.8, gold: true, l1: 'UAE', l2: 'NATIONALS' });
    gauge(t, { cx: 740, pct: 35, a0: K.pct2 - 0.1, a1: K.pct2 + 0.8, l1: 'EVERYONE', l2: 'ELSE' });
  } });

  // ---- 7. call to action: a typed chat message that is sent and answered (always the last scene)
  const send = K.msg + 1.4;
  add({ id: 'cta', a: s5b, b: DUR, last: true, box: [440, 1280], fn(t) {
    sceneChat(t, { head: 'Price list?', sub: 'Project · Area', show: s5b + 0.25, typeA: K.msg - 0.1, typeB: send - 0.2, send, msg: 'Keyword', reply: 'Price list' });
  } });
  cues.push({ k: 'send', t: send });

  // ---- overlay on the face beat: the hook words slam in as he says them (gold box = readable on any wall)
  const OVERLAYS = [ovHook([['LINE ONE', K.hookA - 0.05, 'box'], ['LINE TWO', K.hookB - 0.05, 'ivory']], { out: HOOK_END - 0.2, size: 100, y: 400 })];
  cues.push({ k: 'stamp', t: K.hookA - 0.05 }, { k: 'stamp', t: K.hookB - 0.05 });
  return { FACE_SEGS, PUNCHES, SCENES, OVERLAYS, cues, IMAGES, PIV: [540, 1500], FOOT_MAX: 124 };   // PIV = zoom pivot (keep his face in frame); FOOT_MAX = last footage frame
}
