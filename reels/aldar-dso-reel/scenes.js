'use strict';
// ---------------------------------------------------------------------------
// "Aldar's new Dubai community near Silicon Oasis" - MAP version, ~101 s + 3 s end card. One continuous satellite journey over east Dubai is the whole background;
// Abdullah Ahli is a small round live-video bubble (top-left). Every number he says is shown the moment he says it (HUD title right of the bubble, frosted checklist
// panels that grow row by row), real pages are the proof (The National 14 Oct 2026, Dubai Media Office 22 Jan 2026, RTA release 9 Nov 2025), real OSM outlines of
// Dubai Silicon Oasis and Academic City, the real Blue Line alignment. Safe zone: x 130-950, y 300-1270.
// Facts: The National (Aldar's 4th Dubai project, with Dubai Holding, near Dubai Silicon Oasis, "above the Blue Line extension"); Dubai Media Office / WAM 22 Jan 2026
// (AED12.8bn DSO expansion, 70,000+ jobs); RTA 9 Nov 2025 (Blue Line opening targeted 9.9.2029). Name "Greenwoods", ~43m sq ft / ~8,000 homes, AED 3m start, 2,227 sq ft,
// 15% below, Haven 8.8% / +20% are HIS figures (not confirmed by Aldar) - the screen marks them REPORTED / EXPECTED.
// ---------------------------------------------------------------------------
function buildScenes() {
  const cues = [], SCENES = [], tw = (re, n = 0, fb = 0, from = 0) => wt(re, n, fb, from);
  const add = (s) => { SCENES.push(s); return s; };

  // ---- key times (from the spoken words)
  const K = {
    aldar: tw(/^ALDAR$/, 0, 0.17), launch: tw(/^LAUNCH$/, 0, 1.14), comm: tw(/^COMMUNITIES$/, 0, 2.5), dub1: tw(/^DUBAI,$/, 0, 3.34),
    three1: tw(/^THREE-BEDROOM$/, 0, 4.02), townh: tw(/^TOWNHOUSES$/, 0, 4.6), three: tw(/^THREE$/, 0, 6.38), mill1: tw(/^MILLION$/, 0, 6.68), dirh1: tw(/^DIRHAMS\.$/, 0, 7.06),
    proj: tw(/^PROJECT,$/, 0, 7.98), green: tw(/^GREENWOODS,$/, 0, 8.88), part: tw(/^PARTNERSHIP$/, 0, 10.62), holding: tw(/^HOLDING\.$/, 0, 11.5),
    s43: tw(/^43$/, 0, 13.12), feet: tw(/^FEET,$/, 0, 14.42), h8000: tw(/^8,000$/, 0, 15.58), homes: tw(/^HOMES$/, 0, 16.54), apts: tw(/^APARTMENTS,$/, 0, 17.94), villas: tw(/^VILLAS,$/, 0, 18.88), th: tw(/^TOWNHOUSES\.$/, 0, 19.56),
    three2: tw(/^THREE-BEDROOM$/, 1, 20.41), s2227: tw(/^2,227$/, 0, 22.52), space: tw(/^SPACE\.$/, 0, 24.9), p3: tw(/^3$/, 0, 26.44), dirh2: tw(/^DIRHAMS,$/, 0, 26.94), works: tw(/^WORKS$/, 0, 27.92), p1350: tw(/^1,350$/, 0, 28.88), foot: tw(/^FOOT\.$/, 0, 31.06),
    pot: tw(/^POTENTIALLY$/, 0, 31.9), p15: tw(/^15%$/, 0, 32.2), below: tw(/^BELOW$/, 0, 33.14), nearby: tw(/^NEARBY$/, 0, 33.82), comm2: tw(/^COMMUNITIES\.$/, 0, 34.6),
    loc: tw(/^LOCATION$/, 0, 36.22), dsoW: tw(/^SILICON$/, 0, 37.52), acadW: tw(/^ACADEMIC$/, 0, 38.5), conn: tw(/^CONNECTIVITY$/, 0, 39.72), sheikh: tw(/^SHEIKH$/, 0, 40.44), road: tw(/^ROAD\.$/, 0, 41.52),
    dub2: tw(/^DUBAI$/, 0, 42.16, 41.8), announced: tw(/^ANNOUNCED$/, 0, 42.74), b128: tw(/^12\.8$/, 0, 43.24), billion: tw(/^BILLION$/, 0, 43.86, 43.5), expand: tw(/^EXPAND$/, 0, 45.42), tech: tw(/^TECHNOLOGY$/, 0, 47.28, 46), hub: tw(/^HUB,$/, 0, 48.8), target: tw(/^TARGETING$/, 0, 49.36), j70: tw(/^70,000$/, 0, 50.16), jobs: tw(/^JOBS\.$/, 0, 52.3),
    acad2: tw(/^ACADEMIC$/, 0, 52.74, 52.5), expanding: tw(/^EXPANDING$/, 0, 54.96), edu: tw(/^EDUCATIONAL$/, 0, 55.68), inst: tw(/^INSTITUTIONS,$/, 0, 56.0),
    by: tw(/^BY$/, 0, 57.34, 57), y2029: tw(/^2029,$/, 0, 57.46), metro: tw(/^METRO$/, 0, 58.72), blue: tw(/^BLUE$/, 0, 59.0), sched: tw(/^SCHEDULED$/, 0, 59.74), connect: tw(/^CONNECT$/, 0, 60.22), dso2: tw(/^SILICON$/, 0, 60.74, 60.5), acad3: tw(/^ACADEMIC$/, 0, 61.82, 61.5), wider: tw(/^WIDER$/, 0, 63.34), net: tw(/^NETWORK\.$/, 0, 63.98),
    looking: tw(/^LOOKING$/, 0, 64.78), prev: tw(/^PREVIOUS$/, 0, 65.5), haven1: tw(/^HAVEN,$/, 0, 67.25), athlon: tw(/^ATHLON,$/, 0, 67.6), wilds: tw(/^WILDS$/, 0, 68.86), demand: tw(/^DEMAND$/, 0, 70.4), phases: tw(/^PHASES\.$/, 0, 71.96),
    haven2: tw(/^HAVEN$/, 0, 72.84), report: tw(/^REPORTEDLY$/, 0, 73.8), p88: tw(/^8\.8%$/, 0, 74.88), ret: tw(/^RETURN$/, 0, 75.8), repeat: tw(/^REPEAT$/, 0, 76.44), median: tw(/^MEDIAN$/, 0, 77.96), p20: tw(/^20%$/, 0, 79.8), m13: tw(/^13$/, 0, 80.8), months: tw(/^MONTHS\.$/, 0, 81.1),
    so: tw(/^SO$/, 0, 81.48), major: tw(/^MAJOR$/, 0, 82.38, 82), dev: tw(/^DEVELOPMENT$/, 0, 82.7), expected: tw(/^EXPECTED$/, 0, 84.3, 84), entry: tw(/^ENTRY$/, 0, 84.58), surr: tw(/^SURROUNDING$/, 0, 85.82), located: tw(/^LOCATED$/, 0, 87.31), billions: tw(/^BILLIONS$/, 0, 88.5), infra: tw(/^INFRASTRUCTURE$/, 0, 89.38), techn: tw(/^TECHNOLOGY$/, 0, 90.3, 89.8), invest: tw(/^INVESTMENT\.$/, 0, 90.64),
    but: tw(/^BUT$/, 0, 91.58), potential: tw(/^POTENTIAL$/, 0, 92.04), final: tw(/^FINAL$/, 0, 93.96), pricing: tw(/^PRICING,$/, 0, 94.22), payment: tw(/^PAYMENT$/, 0, 95.02), future: tw(/^FUTURE$/, 0, 95.92), supply: tw(/^SUPPLY\.$/, 0, 96.08),
    if1: tw(/^IF$/, 0, 96.8), full: tw(/^FULL$/, 0, 97.12), comment: tw(/^COMMENT$/, 0, 99.0), greenW: tw(/^GREEN$/, 0, 99.4), send: tw(/^SEND$/, 0, 100.4), info: tw(/^INFORMATION\.$/, 0, 100.8),
  };

  const FACE_SEGS = [], PUNCHES = [], OVERLAYS = [];
  const IMAGES = { national: 'assets/national.png', dmo: 'assets/dmo.png', rta: 'assets/rta.png', st1: 'assets/study_p01.png', st2: 'assets/study_p02.png', st4: 'assets/study_p04.png', st5: 'assets/study_p05.png', st7: 'assets/study_p07.png', st13: 'assets/study_p13.png', st14: 'assets/study_p14.png' };   // st* = pages of our own study (Aldar_Dubai_Townhouse_Study.pdf, 300 dpi)
  const DSOc = [55.3854, 25.1237], MIDc = [55.401, 25.122], ACc = [55.405, 25.113];
  const STN = { dso: [55.3888, 25.1208], acad: [55.4124, 25.0977] };                          // Blue Line station areas on the OSM alignment (indicative)

  // ---- the camera: ONE satellite journey for the whole reel
  const OV = [55.27, 25.15, 10.7, 105], OV2 = [55.26, 25.11, 10.6, 120];
  const keys = [
    camKey(0, ...OV), camKey(K.three1 - 0.2, 55.30, 25.14, 11.3, 150), camKey(K.proj + 1.6, 55.385, 25.125, 12.2, 170),
    camKey(K.loc - 0.5, 55.395, 25.121, 12.6, 170), camKey(K.dsoW + 1.2, ...MIDc, 13.1, 160),
    camKey(K.dub2 + 0.5, ...DSOc, 13.6, 170), camKey(K.acad2 - 0.2, ...DSOc, 13.7, 170), camKey(K.acad2 + 1.3, ...ACc, 13.3, 170), camKey(K.by - 0.2, ...ACc, 13.3, 170),
    camKey(K.metro + 0.9, 55.3766, 25.164, 11.3, 185), camKey(K.dso2 - 0.2, 55.3766, 25.164, 11.3, 185), camKey(K.acad3 + 0.5, 55.3985, 25.108, 11.9, 165), camKey(K.net, 55.3985, 25.108, 11.9, 165),
    camKey(K.looking + 0.9, ...OV2), camKey(K.haven2 + 1.0, 55.28, 25.11, 10.9, 120), camKey(K.so, 55.31, 25.12, 11.4, 120),
    camKey(K.but - 0.3, 55.37, 25.122, 12.2, 150), camKey(DUR, 55.395, 25.122, 12.7, 105),
  ].sort((a, b) => a[0] - b[0]);
  SAT_SCENES.journey = { a: 0, b: DUR, veil: 'top', keys };

  // ---- the face bubble: small, top-left; grows to the middle for the call to action
  const BUBBLE = { t0: 0.1, src: { cx: 570, cy: 830, size: 640 }, keys: [{ t: 0, cx: 215, cy: 418, r: 78 }, { t: K.if1 - 0.2, cx: 215, cy: 418, r: 78 }, { t: K.if1 + 0.9, cx: 540, cy: 470, r: 125 }] };
  HUD_X = 330;

  // ---- frosted checklist panels (rows tick as he says each point)
  const P = (title, a0, a1, items, o = {}) => ({ title, a0, a1, items, ...o });
  const panels = [
    P('THE COMMUNITY · AS REPORTED', K.s43 - 0.35, K.three2 - 0.15, [{ txt: 'APPROX. 43 MILLION SQ FT', a: K.s43 }, { txt: 'AROUND 8,000 NEW HOMES', a: K.h8000 }, { txt: 'APARTMENTS', a: K.apts }, { txt: 'VILLAS', a: K.villas }, { txt: 'TOWNHOUSES', a: K.th, gold: true }]),
    P('ACADEMIC CITY · EXPECTED', K.acad2 - 0.05, K.by - 0.15, [{ txt: 'CONTINUES TO EXPAND', a: K.expanding }, { txt: 'MORE EDUCATIONAL INSTITUTIONS', a: K.edu, gold: true }]),
    P('HAVEN · REPORTED', K.p20 - 0.35, K.so - 0.15, [{ txt: '8.8% RETURN ON REPEAT SALES', a: K.p88 }, { txt: 'MEDIAN PRICES +20% IN 13 MONTHS', a: K.p20, gold: true }], { size: 32 }),
  ];

  // ---- everything that is drawn over the map
  const top = (t, cam) => {
    // real outlines of the two districts (OpenStreetMap), filled and labelled as he names them
    mapIsland(t, cam, 'dso', '#6C63FF', '#A79BFF', [[K.dsoW - 0.4, K.acadW - 0.1], [K.dub2 + 0.6, K.acad2 - 0.1]], ['DUBAI SILICON', 'OASIS']);
    mapTag(t, cam, { lon: DSOc[0], lat: DSOc[1], a0: K.proj + 1.4, a1: K.s43 + 1.0, title: 'DUBAI SILICON OASIS', sub: 'NEAR THE NEW COMMUNITY', dx: 0, dy: -95 });
    mapIsland(t, cam, 'academic', '#2FD8B5', '#93F3DF', [[K.acadW - 0.1, K.conn + 1.2], [K.acad2 - 0.1, K.by - 0.1]], ['ACADEMIC', 'CITY']);
    // the Blue Line: the real alignment (OpenStreetMap), drawn on as he says "by 2029, the new Metro Blue Line"
    mapRoute(t, cam, OUTLINES.blue_main, K.metro - 0.2, K.looking - 0.3, { dur: 3.4 });
    mapRoute(t, cam, OUTLINES.blue_branch, K.blue + 0.4, K.looking - 0.3, { dur: 1.8 });
    mapDot(t, cam, { lon: STN.dso[0], lat: STN.dso[1], a0: K.dso2 - 0.1, a1: K.looking - 0.3, text: 'DUBAI SILICON OASIS', side: 'l', size: 26 });
    mapDot(t, cam, { lon: STN.acad[0], lat: STN.acad[1], a0: K.acad3 - 0.1, a1: K.looking - 0.3, text: 'ACADEMIC CITY', side: 'r', size: 26, dy: 10 });

    // HUD title per beat (right of the bubble)
    const cnt = (a, b, v, dec) => numberStr(v * ea(t, a, b, E.out3), dec);
    hudTitle(t, 'ALDAR PROPERTIES', 'NEW COMMUNITY', 'ONE OF ITS LARGEST IN DUBAI', K.aldar - 0.1, K.three1 - 0.2);
    hudTitle(t, 'ALDAR PROPERTIES', '3-BEDROOM TOWNHOUSES', 'EXPECTED STARTING PRICE', K.three1 - 0.1, K.three - 0.3);
    hudTitle(t, '3-BEDROOM TOWNHOUSE · EXPECTED', 'DH ' + cnt(K.three, K.mill1 + 0.5, 3, 0) + ' MILLION', 'FROM · STARTING PRICE', K.three - 0.25, K.proj - 0.15);
    hudTitle(t, 'THE PROJECT', 'GREENWOODS', 'ALDAR × DUBAI HOLDING', K.proj - 0.05, K.s43 - 0.2);
    hudTitle(t, 'SIZE · APPROXIMATELY', cnt(K.s43, K.s43 + 0.9, 43, 0) + ' MILLION SQ FT', null, K.s43 - 0.1, K.h8000 - 0.25);
    hudTitle(t, 'HOUSING · AROUND', cnt(K.h8000 - 0.1, K.h8000 + 1.2, 8000, 0) + ' NEW HOMES', 'APARTMENTS · VILLAS · TOWNHOUSES', K.h8000 - 0.15, K.three2 - 0.15);
    hudTitle(t, 'ALDAR PROPERTIES', '3-BEDROOM TOWNHOUSES', 'EXPECTED SIZE', K.three2 - 0.05, K.s2227 - 0.25);
    hudTitle(t, '3-BEDROOM TOWNHOUSE', cnt(K.s2227 - 0.2, K.s2227 + 1.4, 2227, 0) + ' SQ FT', 'EXPECTED SIZE · AROUND', K.s2227 - 0.3, K.p3 - 0.3);
    hudTitle(t, 'STARTING PRICE', 'DH ' + cnt(K.p3 - 0.1, K.p3 + 0.7, 3, 0) + ' MILLION', 'EXPECTED', K.p3 - 0.25, K.works - 0.1);
    hudTitle(t, 'WORKS OUT TO ABOUT', 'DH ' + cnt(K.works + 0.05, K.p1350 + 1.2, 1350, 0) + ' / SQ FT', 'DH 3 MILLION ÷ 2,227 SQ FT', K.works - 0.05, K.pot - 0.15);
    hudTitle(t, 'POTENTIALLY', cnt(K.pot, K.p15 + 0.9, 15, 0) + '% BELOW', 'SOME NEARBY COMPETING COMMUNITIES', K.pot - 0.1, K.loc - 0.15);
    hudTitle(t, 'THE LOCATION', 'SILICON OASIS', '& ACADEMIC CITY', K.loc - 0.05, K.conn - 0.1);
    hudTitle(t, 'CONNECTIVITY TO', 'SHEIKH MOHAMMED BIN ZAYED ROAD', 'CLOSE TO BOTH DISTRICTS', K.conn - 0.05, K.dub2 - 0.15);
    hudTitle(t, 'DUBAI · 22 JANUARY 2026', 'SILICON OASIS', 'EXPANSION ANNOUNCED', K.dub2 - 0.05, K.b128 - 0.2);
    hudTitle(t, 'EXPANSION INVESTMENT', 'DH ' + cnt(K.b128 - 0.1, K.b128 + 1.0, 12.8, 1) + ' BILLION', 'SILICON OASIS', K.b128 - 0.15, K.tech - 0.2);
    hudTitle(t, 'SILICON OASIS', 'TECH & AI HUB', 'MAJOR EXPANSION', K.tech - 0.1, K.target - 0.15, '#8CC8FF');
    hudTitle(t, 'TARGETING MORE THAN', cnt(K.target + 0.1, K.j70 + 1.0, 70000, 0) + ' JOBS', 'DIRECT AND INDIRECT', K.target - 0.05, K.acad2 - 0.15);
    hudTitle(t, 'ACADEMIC CITY', 'EDUCATION HUB', 'EXPANDING ITS INSTITUTIONS', K.acad2 - 0.05, K.by - 0.2);
    hudTitle(t, 'METRO BLUE LINE', 'OPENING 2029', 'CONNECTS SILICON OASIS & ACADEMIC CITY', K.by - 0.1, K.looking - 0.25, '#8CC8FF');
    hudTitle(t, 'ALDAR · BEFORE THIS', 'THREE LAUNCHES', 'HAVEN · ATHLON · THE WILDS', K.looking - 0.05, K.haven2 - 0.2);
    hudTitle(t, 'ALDAR · DUBAI', 'HAVEN', 'RESALES · REPORTED', K.haven2 - 0.1, K.p88 - 0.25);
    hudTitle(t, 'HAVEN · REPORTED', cnt(K.p88 - 0.15, K.p88 + 0.8, 8.8, 1) + '% RETURN', 'ON REPEAT SALES', K.p88 - 0.2, K.median - 0.25);
    hudTitle(t, 'COMMUNITY MEDIAN PRICE', 'UP 20%+', 'OVER 13 MONTHS · REPORTED', K.median - 0.15, K.so - 0.15);
    hudTitle(t, 'THE BIG PICTURE', 'ENTRY PRICE', 'BELOW SOME NEIGHBOURS · EXPECTED', K.so - 0.05, K.but - 0.2);
    hudTitle(t, 'BUT', 'IT DEPENDS ON', 'THE INVESTMENT POTENTIAL', K.but - 0.05, K.if1 - 0.25);

    // lower area: real pages (proof)
    const mk = (b, t0, t1) => ({ bbox: b, t0, t1 });
    card(t, 'national', { x: 150, y: 890, w: 780, h: 340, a: 0.45, out: K.proj - 0.15, from: [0, 90], rot: -1.2, fit: 'cover', fy: 0, zoom: [1, 1.03], chip: 'THE NATIONAL · 14 OCT',
      focus: [{ bbox: [30, 1150, 1150, 250], t0: 0.55, t1: 1.05, zoom: 1.0 }],
      hl: [mk([290, 1174, 740, 70], K.launch - 0.1, K.comm), mk([38, 1246, 558, 70], K.townh - 0.2, K.three - 0.4)] });
    card(t, 'national', { x: 150, y: 890, w: 780, h: 340, a: K.proj - 0.05, out: K.s43 - 0.1, from: [0, 90], rot: 1.2, fit: 'cover', fy: 0, zoom: [1, 1.03], chip: 'THE NATIONAL · CEO QUOTE',
      focus: [{ bbox: [372, 2600, 930, 60], t0: K.proj - 0.05, t1: K.proj + 0.6, zoom: 1.0 }],
      hl: [mk([572, 2470, 478, 36], K.part - 0.1, K.holding)] });
    card(t, 'dmo', { x: 150, y: 890, w: 780, h: 340, a: K.dub2 - 0.1, out: K.acad2 - 0.4, from: [0, 90], rot: -1.2, fit: 'cover', fy: 0, zoom: [1, 1.03], chip: 'DUBAI MEDIA OFFICE · 22 JAN',
      focus: [{ bbox: [23, 345, 914, 260], t0: K.dub2 - 0.05, t1: K.dub2 + 0.4, zoom: 1.0 }, { bbox: [23, 2040, 914, 140], t0: K.b128 - 0.6, t1: K.b128 - 0.1, zoom: 1.0 }, { bbox: [23, 6340, 914, 100], t0: K.target - 0.2, t1: K.target + 0.4, zoom: 1.0 }],
      hl: [mk([330, 2080, 226, 48], K.b128 - 0.05, K.billion + 0.9), mk([277, 6390, 442, 48], K.j70 - 0.1, K.jobs + 0.3)] });
    card(t, 'rta', { x: 150, y: 890, w: 780, h: 340, a: K.by - 0.15, out: K.looking - 0.1, from: [0, 90], rot: 1.2, fit: 'cover', fy: 0, zoom: [1, 1.03], chip: 'RTA · DUBAI MEDIA OFFICE',
      focus: [{ bbox: [30, 3740, 1380, 120], t0: K.by - 0.1, t1: K.by + 0.45, zoom: 1.0 }, { bbox: [30, 4020, 1380, 130], t0: K.wider - 0.9, t1: K.wider - 0.4, zoom: 1.0 }],
      hl: [mk([600, 3786, 196, 52], K.y2029 - 0.05, K.y2029 + 0.9), mk([34, 4054, 1270, 46], K.connect - 0.1, K.net)] });


    // pages of OUR study as proof cards, with markers on the numbers he says (boxes measured with study_boxes.py, px at 300 dpi)
    const SC = { x: 140, y: 880, w: 800, h: 360, from: [0, 90], fit: 'cover', fy: 0, zoom: [1, 1.03] }, chipT = (n) => 'ALDAR STUDY · P.' + n;
    card(t, 'st13', { ...SC, a: K.three2 + 0.45, out: K.works - 0.3, rot: -1.0, chip: chipT(13),
      focus: [{ bbox: [188, 540, 1040, 200], t0: K.three2 + 0.45, t1: K.three2 + 1.0, zoom: 1.0 }],
      hl: [mk([205, 645, 430, 44], K.three2 + 0.6, K.three2 + 1.6), mk([205, 700, 200, 40], K.s2227 - 0.1, K.space), mk([795, 645, 250, 44], K.p3 - 0.1, K.dirh2 + 0.6)] });
    card(t, 'st7', { ...SC, a: K.works, out: K.loc - 0.15, rot: 1.0, chip: chipT(7),
      focus: [{ bbox: [225, 700, 1500, 640], t0: K.works, t1: K.works + 0.5, zoom: 1.0 }, { bbox: [225, 545, 1500, 640], t0: K.nearby - 0.7, t1: K.nearby - 0.2, zoom: 1.0 }],
      hl: [mk([385, 1098, 1010, 50], K.p1350 - 0.1, K.p1350 + 0.9), mk([385, 1288, 1130, 50], K.p1350 + 0.9, K.foot), mk([330, 625, 1440, 48], K.nearby - 0.2, K.nearby + 0.8), mk([340, 720, 1440, 48], K.nearby + 0.3, K.comm2)] });
    card(t, 'st4', { ...SC, a: K.loc - 0.2, out: K.dub2 - 0.4, rot: -1.0, chip: chipT(4),
      focus: [{ bbox: [790, 700, 1500, 600], t0: K.loc - 0.2, t1: K.loc + 0.4, zoom: 1.0 }],
      hl: [mk([960, 930, 700, 140], K.dsoW - 0.1, K.acadW + 0.4)] });
    card(t, 'st5', { ...SC, a: K.looking + 0.2, out: K.haven2 - 0.35, rot: 1.0, chip: chipT(5),
      focus: [{ bbox: [188, 520, 1112, 520], t0: K.looking + 0.2, t1: K.looking + 0.75, zoom: 1.0 }, { bbox: [188, 2060, 1250, 180], t0: K.demand - 0.5, t1: K.demand - 0.05, zoom: 1.0 }],
      hl: [mk([205, 632, 1030, 92], K.haven1 - 0.1, K.haven1 + 0.9), mk([205, 766, 1030, 95], K.athlon - 0.1, K.athlon + 0.9), mk([205, 904, 1030, 95], K.wilds - 0.1, K.wilds + 0.9), mk([235, 2104, 640, 50], K.demand + 0.1, K.phases)] });
    card(t, 'st7', { ...SC, a: K.haven2 - 0.2, out: K.p20 - 0.4, rot: -1.0, chip: chipT(7),
      focus: [{ bbox: [600, 2210, 1400, 170], t0: K.haven2 - 0.2, t1: K.haven2 + 0.35, zoom: 1.0 }],
      hl: [mk([1230, 2228, 805, 52], K.p88 - 0.2, K.ret + 0.9)] });
    card(t, 'st2', { ...SC, a: K.so + 0.05, out: K.located - 0.45, rot: 1.0, chip: chipT(2),
      focus: [{ bbox: [238, 1040, 1300, 300], t0: K.so + 0.05, t1: K.so + 0.6, zoom: 1.0 }],
      hl: [mk([780, 1072, 790, 52], K.expected - 0.1, K.surr), mk([630, 1193, 340, 50], K.surr - 0.1, K.surr + 1.0)] });
    card(t, 'st2', { ...SC, a: K.located - 0.1, out: K.but - 0.35, rot: -1.0, chip: chipT(2),
      focus: [{ bbox: [238, 1990, 1400, 220], t0: K.located - 0.1, t1: K.located + 0.5, zoom: 1.0 }],
      hl: [mk([235, 2040, 1340, 52], K.infra - 0.4, K.invest)] });
    card(t, 'st14', { ...SC, a: K.but - 0.05, out: K.if1 - 0.25, rot: 1.0, chip: chipT(14),
      focus: [{ bbox: [1230, 2258, 1260, 596], t0: K.but - 0.05, t1: K.but + 0.55, zoom: 1.0 }],
      hl: [mk([1320, 2356, 560, 52], K.final - 0.1, K.pricing + 0.5), mk([1320, 2488, 1000, 52], K.payment - 0.1, K.payment + 1.0), mk([1320, 2746, 1000, 100], K.future - 0.1, K.supply + 0.3)] });
    // the call to action: the study cover pops up next to the bubble ("I'll send you the information")
    card(t, 'st1', { x: 735, y: 335, w: 205, h: 290, a: K.full + 0.3, from: [60, 0], rot: 4, fit: 'cover', fy: 0, zoom: [1, 1.04], r: 16 });
    { const g = ea(t, K.full + 0.9, K.full + 1.3, E.out3); if (g > 0.01) { ctx.save(); ctx.globalAlpha *= g; ctx.translate(838, 480); ctx.rotate(4 * Math.PI / 180); ctx.scale(1.02, 1.02); rr(-103, -146, 206, 292, 18); ctx.strokeStyle = C.gold; ctx.lineWidth = 4; ctx.stroke(); ctx.restore(); } }
    panels.forEach(pn => breakdown(t, pn));

    // the end: the map dims, the bubble grows, "green" is typed, sent and answered
    const dim = ea(t, K.if1 - 0.2, K.if1 + 0.6); if (dim > 0.002) { ctx.save(); ctx.fillStyle = `rgba(8,8,10,${0.62 * dim})`; ctx.fillRect(0, 0, W, H); ctx.restore(); }
    const ce = ea(t, K.if1 + 0.3, K.if1 + 1.0, E.out4);
    if (ce > 0.003) {
      ctx.save(); ctx.globalAlpha *= ce; T('ABDULLAH AHLI', CX, 690, { font: F.d(800, 62), ls: 2, color: C.ink }); T('PORTFOLIO STRATEGIST', CX, 744, { font: F.d(700, 34), ls: 6, color: C.gold }); ctx.restore();
      const send = K.info + 0.4, sent = ea(t, send, send + 0.35), ia = ea(t, K.if1 + 0.8, K.if1 + 1.4, E.out4), iy = 1185, X0 = SAFE.x0, X1 = SAFE.x1, BW = X1 - X0, msg = 'green', typed = msg.slice(0, Math.floor(msg.length * ea(t, K.greenW - 0.05, K.greenW + 0.4, E.lin) + 0.0001));
      ctx.save(); ctx.globalAlpha *= ia; rr(X0, iy - 65, BW, 130, 65); ctx.fillStyle = C.panel; ctx.fill(); ctx.strokeStyle = 'rgba(243,239,230,0.28)'; ctx.lineWidth = 3; ctx.stroke();
      T(typed, X0 + 56, iy + 20, { font: F.d(700, 60), color: C.ink, align: 'left', alpha: 1 - sent }); T('Add a comment…', X0 + 56, iy + 20, { font: F.d(700, 60), color: C.mute, align: 'left', alpha: (1 - ea(t, K.greenW - 0.05, K.greenW + 0.05)) * (1 - sent) });
      dot(X1 - 66, iy, 48, C.gold); icon('plane', X1 - 66, iy, 20, { p: 1, color: '#17181B', w: 4.5, rot: -0.5 + 0.5 * sent }); ctx.restore();
      const b1 = ea(t, send, send + 0.5, E.out4), b2 = ea(t, send + 0.8, send + 1.3, E.out4);
      if (b1 > 0.002) { ctx.save(); ctx.globalAlpha *= b1; ctx.translate(0, (1 - b1) * 36); const w = M(msg, F.d(700, 58)) + 84; rr(X1 - w, 835, w, 112, 56); ctx.fillStyle = C.gold; ctx.fill(); T(msg, X1 - w / 2, 910, { font: F.d(700, 58), color: '#17181B' }); ctx.restore(); }
      if (b2 > 0.002) { ctx.save(); ctx.globalAlpha *= b2; ctx.translate(0, (1 - b2) * 36); const rp = "Sending you the information", w = M(rp, F.d(700, 48)) + 130; rr(X0, 965, w, 112, 56); ctx.fillStyle = C.panel; ctx.fill(); ctx.strokeStyle = 'rgba(243,239,230,0.28)'; ctx.lineWidth = 3; ctx.stroke(); icon('check', X0 + 66, 1022, 24, { p: ea(t, send + 1.0, send + 1.4), color: C.gold, w: 5 }); T(rp, X0 + 112, 1038, { font: F.d(700, 48), color: C.ink, align: 'left' }); ctx.restore(); }
    }
  };
  add({ id: 'journey', kind: 'sat', a: 0, b: DUR, last: true, cfg: { top } });
  // name chip under the bubble while he is introduced
  OVERLAYS.push(t => { const a = ea(t, 0.5, 1.0) * (1 - ea(t, 3.6, 4.0)); if (a <= 0.003) return; ctx.save(); ctx.globalAlpha *= a; const w = M('ABDULLAH AHLI', F.d(800, 26), 3) + 44; glassPill(130, 514, w, 46, 23); T('ABDULLAH AHLI', 130 + w / 2, 547, { font: F.d(800, 26), ls: 3, color: '#FFFFFF' }); ctx.restore(); });

  // ---- sound: whooshes on the beat changes and call-outs (very quiet)
  [K.three1, K.proj, K.s43, K.three2, K.p3, K.pot, K.loc, K.dub2, K.acad2, K.by, K.looking, K.haven2, K.so, K.but].forEach(x => cues.push({ k: 'wh', t: x - 0.1, d: 0.5 }));
  [K.dsoW, K.acadW, K.dso2, K.acad3].forEach(x => cues.push({ k: 'pin', t: x }));
  cues.push({ k: 'send', t: K.info + 0.4 });
  return { FACE_SEGS, PUNCHES, SCENES, OVERLAYS, cues, IMAGES, BUBBLE, FOOT_MAX: 3041 };
}
