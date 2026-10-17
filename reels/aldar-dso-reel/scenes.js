'use strict';
// ---------------------------------------------------------------------------
// "Aldar's new Dubai community near Silicon Oasis" - 100.8 s + 3 s end card, built on the HeyGen avatar take (AI-generated, labelled on screen).
// ONE background per beat, moving from background to background (no layering):
//   MAP    real satellite flights (Esri) with the OSM outlines of Dubai Silicon Oasis / Academic City and the real Blue Line route - only map elements on top
//   PAGE   a real page as the whole picture, big and readable, marker on the words he says: The National, Dubai Media Office, pages of OUR study (Aldar_Dubai_Townhouse_Study.pdf)
//   STAT   dark background with big numbers (size of the community, "+20%")
// The face is the small round bubble top-left; the HUD title sits right of it. Safe zone: x 130-950, y 300-1270.
// Facts: The National 14 Oct 2026; Dubai Media Office / WAM 22 Jan 2026; our study (16 Oct 2026). "Greenwoods", ~43m sq ft / ~8,000 homes, AED 3m start, 2,227 sq ft, 15% below,
// Haven 8.8% / +20% are HIS figures (not confirmed by Aldar) - marked REPORTED / EXPECTED on screen.
// ---------------------------------------------------------------------------
function buildScenes() {
  const cues = [], SCENES = [], tw = (re, n = 0, fb = 0, from = 0) => wt(re, n, fb, from);
  const add = (s) => { SCENES.push(s); return s; };

  // ---- key times (from the spoken words)
  const K = {
    aldar: tw(/^ALDAR$/, 0, 0.14), launch: tw(/^LAUNCH$/, 0, 1.08), comm: tw(/^COMMUNITIES$/, 0, 2.6), dub1: tw(/^DUBAI,$/, 0, 3.5),
    three1: tw(/^THREE-BEDROOM$/, 0, 4.2), townh: tw(/^TOWNHOUSES$/, 0, 4.8), three: tw(/^THREE$/, 0, 6.7), mill1: tw(/^MILLION$/, 0, 7.0), aed1: tw(/^AED\.$/, 0, 7.3),
    proj: tw(/^PROJECT,$/, 0, 8.3), green: tw(/^GREENWOODS,$/, 0, 9.1), part: tw(/^PARTNERSHIP$/, 0, 10.8), holding: tw(/^HOLDING\.$/, 0, 11.8),
    s43: tw(/^43$/, 0, 13.3), feet: tw(/^FEET,$/, 0, 14.7), h8000: tw(/^8,000$/, 0, 15.7), homes: tw(/^HOMES$/, 0, 16.6), apts: tw(/^APARTMENTS,$/, 0, 17.8), villas: tw(/^VILLAS,$/, 0, 18.8), th: tw(/^TOWNHOUSES\.$/, 0, 19.5),
    three2: tw(/^THREE-BEDROOM$/, 1, 20.45), s2227: tw(/^2,227$/, 0, 22.5), space: tw(/^SPACE\.$/, 0, 24.8), p3: tw(/^3$/, 0, 26.4), aed2: tw(/^AED,$/, 0, 26.8), works: tw(/^WORKS$/, 0, 27.8), p1350: tw(/^1,350$/, 0, 28.8), foot: tw(/^FOOT\.$/, 0, 31.1),
    pot: tw(/^POTENTIALLY$/, 0, 31.8), p15: tw(/^15%$/, 0, 32.2), below: tw(/^BELOW$/, 0, 32.9), nearby: tw(/^NEARBY$/, 0, 33.5), comm2: tw(/^COMMUNITIES\.$/, 0, 34.2),
    loc: tw(/^LOCATION$/, 0, 35.84), dsoW: tw(/^SILICON$/, 0, 37.2), acadW: tw(/^ACADEMIC$/, 0, 38.1), conn: tw(/^CONNECTIVITY$/, 0, 39.3), sheikh: tw(/^SHEIKH$/, 0, 40.0), road: tw(/^ROAD\.$/, 0, 41.0),
    dub2: tw(/^DUBAI$/, 0, 41.7, 41.4), announced: tw(/^ANNOUNCED$/, 0, 42.2), b128: tw(/^12\.8$/, 0, 42.7), billion: tw(/^BILLION$/, 0, 43.4, 43.2), expand: tw(/^EXPAND$/, 0, 44.9), tech: tw(/^TECHNOLOGY$/, 0, 46.8, 45.8), hub: tw(/^HUB,$/, 0, 48.3), target: tw(/^TARGETING$/, 0, 49.2), j70: tw(/^70,000$/, 0, 49.9), jobs: tw(/^JOBS\.$/, 0, 51.7),
    acad2: tw(/^ACADEMIC$/, 0, 52.6, 52.3), expanding: tw(/^EXPANDING$/, 0, 54.4), edu: tw(/^EDUCATIONAL$/, 0, 55.2), inst: tw(/^INSTITUTIONS,$/, 0, 55.5),
    by: tw(/^BY$/, 0, 56.8, 56.5), y2029: tw(/^2029,$/, 0, 56.9), metro: tw(/^METRO$/, 0, 58.3), blue: tw(/^BLUE$/, 0, 58.6), sched: tw(/^SCHEDULED$/, 0, 59.3), connect: tw(/^CONNECT$/, 0, 59.7), dso2: tw(/^SILICON$/, 0, 60.2, 60.0), acad3: tw(/^ACADEMIC$/, 0, 61.4, 61.0), wider: tw(/^WIDER$/, 0, 63.0), net: tw(/^NETWORK\.$/, 0, 63.7),
    looking: tw(/^LOOKING$/, 0, 64.3), prev: tw(/^PREVIOUS$/, 0, 65.2), haven1: tw(/^HAVEN,$/, 0, 66.8), athlon: tw(/^ATHLON,$/, 0, 67.2), wilds: tw(/^WILDS$/, 0, 68.2), demand: tw(/^DEMAND$/, 0, 69.8), phases: tw(/^PHASES\.$/, 0, 71.4),
    haven2: tw(/^HAVEN$/, 0, 72.6), report: tw(/^REPORTEDLY$/, 0, 73.2), p88: tw(/^8\.8%$/, 0, 74.2), ret: tw(/^RETURN$/, 0, 75.1), repeat: tw(/^REPEAT$/, 0, 75.7), median: tw(/^MEDIAN$/, 0, 77.5), p20: tw(/^20%$/, 0, 79.0), m13: tw(/^13$/, 0, 80.1), months: tw(/^MONTHS\.$/, 0, 80.4),
    so: tw(/^SO$/, 0, 81.3), major: tw(/^MAJOR$/, 0, 81.8, 81.5), dev: tw(/^DEVELOPMENT$/, 0, 82.1), expected: tw(/^EXPECTED$/, 0, 83.8, 83.5), entry: tw(/^ENTRY$/, 0, 84.1), surr: tw(/^SURROUNDING$/, 0, 85.4), located: tw(/^LOCATED$/, 0, 86.8), billions: tw(/^BILLIONS$/, 0, 87.9), infra: tw(/^INFRASTRUCTURE$/, 0, 88.8), techn: tw(/^TECHNOLOGY$/, 0, 89.7, 89.4), invest: tw(/^INVESTMENT\.$/, 0, 90.1),
    but: tw(/^BUT$/, 0, 91.1), potential: tw(/^POTENTIAL$/, 0, 91.5), final: tw(/^FINAL$/, 0, 93.3), pricing: tw(/^PRICING,$/, 0, 93.6), payment: tw(/^PAYMENT$/, 0, 94.4), future: tw(/^FUTURE$/, 0, 95.4), supply: tw(/^SUPPLY\.$/, 0, 95.5),
    if1: tw(/^IF$/, 0, 96.3), full: tw(/^FULL$/, 0, 96.6), comment: tw(/^COMMENT$/, 0, 98.4), greenW: tw(/^GREEN$/, 0, 98.8), send: tw(/^SEND$/, 0, 99.7), info: tw(/^INFORMATION\.$/, 0, 100.1),
  };

  const FACE_SEGS = [], PUNCHES = [], OVERLAYS = [];
  const IMAGES = { national: 'assets/national.png', dmo: 'assets/dmo.png', st1: 'assets/study_p01.png', st2: 'assets/study_p02.png', st5: 'assets/study_p05.png', st7: 'assets/study_p07.png', st13: 'assets/study_p13.png', st14: 'assets/study_p14.png' };   // st* = pages of our own study (300 dpi)
  const DSOc = [55.3854, 25.1237], MIDc = [55.401, 25.122], ACc = [55.405, 25.113];
  const STN = { dso: [55.3888, 25.1208], acad: [55.4124, 25.0977] };                          // Blue Line station areas on the OSM alignment (indicative)

  // ---- the beats: one background each (times are cut points between backgrounds)
  const T_MAP1 = [0, K.proj - 0.2], T_NAT = [K.proj - 0.2, K.s43 - 0.3], T_STAT1 = [K.s43 - 0.3, K.three2 - 0.2], T_P13 = [K.three2 - 0.2, K.works - 0.2], T_P7 = [K.works - 0.2, K.loc - 0.4],
    T_MLOC = [K.loc - 0.4, K.dub2 - 0.4], T_DMO = [K.dub2 - 0.4, K.acad2 - 0.4], T_MAC = [K.acad2 - 0.4, K.looking - 0.4], T_P5 = [K.looking - 0.4, K.haven2 - 0.4], T_P7B = [K.haven2 - 0.4, K.p20 - 0.45],
    T_STAT2 = [K.p20 - 0.45, K.so - 0.3], T_P2 = [K.so - 0.3, K.located - 0.5], T_MINF = [K.located - 0.5, K.but - 0.45], T_P14 = [K.but - 0.45, K.if1 - 0.35];

  // ---- the satellite flights (keys are seconds into each flight)
  const flight = (id, [a, b], keys) => { SAT_SCENES[id] = { a, b, veil: 'top', keys: keys.map(k => camKey(...k)).sort((p, q) => p[0] - q[0]) }; add({ id, kind: 'sat', a, b, cfg: {} }); return SAT_SCENES[id]; };
  const d1 = T_MAP1[1] - T_MAP1[0];
  flight('m1', T_MAP1, [[0, 55.27, 25.15, 10.7, 105, 0], [d1 * 0.5, 55.31, 25.14, 11.7, 150, 18], [d1 + 0.6, 55.385, 25.125, 12.6, 170, 32]]);
  const dl = T_MLOC[1] - T_MLOC[0];
  flight('mloc', T_MLOC, [[0, 55.40, 25.121, 12.5, 170, 28], [2.0, ...MIDc, 13.0, 160, 33], [dl + 0.6, ...MIDc, 13.3, 160, 35]]);
  const da = T_MAC[1] - T_MAC[0], ra = t => t - T_MAC[0];
  flight('mac', T_MAC, [[0, 55.40, 25.118, 13.0, 170, 30], [ra(K.expanding), ...ACc, 13.4, 170, 33], [ra(K.by) - 0.2, ...ACc, 13.4, 170, 33], [ra(K.metro) + 0.9, 55.3766, 25.164, 11.3, 185, 22], [ra(K.dso2) - 0.2, 55.3766, 25.164, 11.3, 185, 22], [ra(K.acad3) + 0.5, 55.3985, 25.108, 11.9, 165, 28], [da + 0.6, 55.3985, 25.108, 11.9, 165, 28]]);
  const di = T_MINF[1] - T_MINF[0];
  flight('minf', T_MINF, [[0, 55.395, 25.121, 12.9, 165, 30], [di + 0.6, 55.395, 25.121, 12.3, 165, 34]]);

  // ---- the study / news pages as full-screen backgrounds, flown like the map: from the whole page down to the line he is reading, with a 3D tilt; the marker highlights are drawn on the page
  const mk = (b, t0, t1) => ({ bbox: b, t0, t1 });
  const page = (id, img, [a, b], keys, hl) => add({ id, kind: 'page', img, a, b, keys, hl });
  const rel = (T, t) => t - T[0], dur = T => T[1] - T[0];
  page('p_nat', 'national', T_NAT, [[0, 700, 2850, 0.42, 0], [0.85, 840, 2570, 0.82, 18], [dur(T_NAT) + 0.5, 840, 2560, 0.86, 20]], [mk([572, 2470, 478, 36], K.part - 0.1, K.holding)]);
  page('p_p13', 'st13', T_P13, [[0, 1240, 1500, 0.42, 0], [0.9, 740, 830, 0.88, 20], [dur(T_P13) + 0.5, 760, 850, 0.92, 22]],
    [mk([205, 645, 430, 44], K.three2 + 0.2, K.three2 + 1.2), mk([205, 700, 200, 40], K.s2227 - 0.1, K.space), mk([795, 645, 250, 44], K.p3 - 0.1, K.aed2 + 0.6)]);
  page('p_p7', 'st7', T_P7, [[0, 1240, 1500, 0.42, 0], [0.9, 975, 1130, 0.62, 20], [dur(T_P7) + 0.5, 975, 1110, 0.66, 22]],
    [mk([385, 1098, 1010, 50], K.p1350 - 0.1, K.p1350 + 0.9), mk([385, 1288, 1130, 50], K.p1350 + 0.9, K.foot), mk([330, 625, 1440, 48], K.nearby - 0.2, K.nearby + 0.8), mk([340, 720, 1440, 48], K.nearby + 0.3, K.comm2)]);
  page('p_dmo', 'dmo', T_DMO, [[0, 480, 700, 0.5, 0], [rel(T_DMO, K.b128) - 0.35, 480, 2105, 1.12, 18], [rel(T_DMO, K.target) - 0.55, 480, 2105, 1.12, 18], [rel(T_DMO, K.target) + 0.1, 480, 6385, 1.12, 18], [dur(T_DMO) + 0.5, 480, 6385, 1.16, 20]],
    [mk([330, 2080, 226, 48], K.b128 - 0.05, K.billion + 0.9), mk([277, 6390, 442, 48], K.j70 - 0.1, K.jobs + 0.3)]);
  page('p_p5', 'st5', T_P5, [[0, 1240, 1500, 0.42, 0], [0.9, 760, 990, 0.82, 20], [rel(T_P5, K.demand) - 0.6, 760, 990, 0.82, 20], [rel(T_P5, K.demand) - 0.1, 880, 2150, 0.78, 20], [dur(T_P5) + 0.5, 880, 2150, 0.8, 22]],
    [mk([205, 632, 1030, 92], K.haven1 - 0.1, K.haven1 + 0.9), mk([205, 766, 1030, 95], K.athlon - 0.1, K.athlon + 0.9), mk([205, 904, 1030, 95], K.wilds - 0.1, K.wilds + 0.9), mk([235, 2104, 640, 50], K.demand + 0.1, K.phases)]);
  page('p_p7b', 'st7', T_P7B, [[0, 1240, 2300, 0.42, 0], [0.9, 1350, 2290, 0.75, 20], [dur(T_P7B) + 0.5, 1350, 2290, 0.79, 22]], [mk([1230, 2228, 805, 52], K.p88 - 0.2, K.ret + 0.9)]);
  page('p_p2', 'st2', T_P2, [[0, 1240, 1300, 0.42, 0], [0.9, 940, 1210, 0.8, 20], [dur(T_P2) + 0.5, 940, 1210, 0.84, 22]], [mk([780, 1072, 790, 52], K.expected - 0.1, K.surr), mk([630, 1193, 340, 50], K.surr - 0.1, K.surr + 1.0)]);
  page('p_p14', 'st14', T_P14, [[0, 1240, 2200, 0.42, 0], [0.9, 1850, 2760, 0.9, 20], [dur(T_P14) + 0.5, 1850, 2760, 0.94, 22]],
    [mk([1320, 2356, 560, 52], K.final - 0.1, K.pricing + 0.5), mk([1320, 2488, 1000, 52], K.payment - 0.1, K.payment + 1.0), mk([1320, 2746, 1000, 100], K.future - 0.1, K.supply + 0.3)]);

  // ---- the face bubble: small, top-left; grows to the middle for the call to action
  const BUBBLE = { t0: 0.1, src: { cx: 570, cy: 830, size: 640 }, keys: [{ t: 0, cx: 215, cy: 418, r: 78 }, { t: K.if1 - 0.2, cx: 215, cy: 418, r: 78 }, { t: K.if1 + 0.9, cx: 540, cy: 470, r: 125 }] };
  HUD_X = 330;

  // a dashed ring of `meters` radius around a place, projected through the tilt (an ellipse on the tilted ground)
  const ringAt = (t, cam, lon, lat, meters, a0) => {
    const al = ea(t, a0, a0 + 0.5); if (al <= 0.003) return; const pts = [];
    for (let i = 0; i <= 72; i++) { const th = i / 72 * Math.PI * 2; pts.push(satProj(cam, lon + meters * Math.cos(th) / (111320 * Math.cos(lat * Math.PI / 180)), lat + meters * Math.sin(th) / 110540)); }
    ctx.save(); ctx.globalAlpha *= al; ctx.setLineDash([18, 12]); ctx.lineDashOffset = -t * 30; ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.strokeStyle = 'rgba(255,236,190,0.9)'; ctx.lineWidth = 4; ctx.stroke(); ctx.setLineDash([]); ctx.restore();
  };
  // ---- map beats: only map elements (outlines, route, one tag) on top of the imagery
  SCENES.find(s => s.id === 'm1').cfg.top = (t, cam) => {
    mapTag(t, cam, { lon: DSOc[0], lat: DSOc[1], a0: K.dub1, a1: T_MAP1[1], title: 'DUBAI SILICON OASIS', sub: 'NEAR THE NEW COMMUNITY', dx: 0, dy: -95 });
  };
  SCENES.find(s => s.id === 'mloc').cfg.top = (t, cam) => {
    mapIsland(t, cam, 'dso', '#6C63FF', '#A79BFF', [[K.dsoW - 0.4, K.acadW - 0.1], [K.acadW + 0.6, T_MLOC[1]]], ['DUBAI SILICON', 'OASIS']);
    mapIsland(t, cam, 'academic', '#2FD8B5', '#93F3DF', [[K.acadW - 0.1, T_MLOC[1]]], ['ACADEMIC', 'CITY']);
  };
  SCENES.find(s => s.id === 'mac').cfg.top = (t, cam) => {
    mapIsland(t, cam, 'academic', '#2FD8B5', '#93F3DF', [[K.acad2 - 0.1, K.by - 0.1]], ['ACADEMIC', 'CITY'], { base: 0.12 });
    // the Blue Line: the real alignment (OpenStreetMap), drawn on as he says "by 2029, the new Metro Blue Line"
    mapRoute(t, cam, OUTLINES.blue_main, K.metro - 0.2, 0, { dur: 3.4 });
    mapRoute(t, cam, OUTLINES.blue_branch, K.blue + 0.4, 0, { dur: 1.8 });
    mapDot(t, cam, { lon: STN.dso[0], lat: STN.dso[1], a0: K.dso2 - 0.1, text: 'DUBAI SILICON OASIS', side: 'l', size: 26 });
    mapDot(t, cam, { lon: STN.acad[0], lat: STN.acad[1], a0: K.acad3 - 0.1, text: 'ACADEMIC CITY', side: 'r', size: 26, dy: 10 });
  };
  SCENES.find(s => s.id === 'minf').cfg.top = (t, cam) => {
    mapIsland(t, cam, 'dso', '#6C63FF', '#A79BFF', [[T_MINF[0] + 0.2, T_MINF[1]]], ['DUBAI SILICON', 'OASIS']);
    mapIsland(t, cam, 'academic', '#2FD8B5', '#93F3DF', [[T_MINF[0] + 0.5, T_MINF[1]]], ['ACADEMIC', 'CITY']);
    ringAt(t, cam, MIDc[0], MIDc[1], 3400, T_MINF[0] + 0.4);
  };

  // ---- everything that sits above the backgrounds: HUD title, the page / stat of the beat, the call to action
  const overlay = (t) => {
    const cnt = (a, b, v, dec) => numberStr(v * ea(t, a, b, E.out3), dec);

    // HUD title per beat (right of the bubble)
    hudTitle(t, 'ALDAR PROPERTIES', 'NEW COMMUNITY', 'ONE OF ITS LARGEST IN DUBAI', K.aldar - 0.1, K.three1 - 0.2);
    hudTitle(t, 'ALDAR PROPERTIES', '3-BEDROOM TOWNHOUSES', 'EXPECTED STARTING PRICE', K.three1 - 0.1, K.three - 0.3);
    hudTitle(t, '3-BEDROOM TOWNHOUSE · EXPECTED', 'AED ' + cnt(K.three, K.mill1 + 0.5, 3, 0) + ' MILLION', 'FROM · STARTING PRICE', K.three - 0.25, K.proj - 0.15);
    hudTitle(t, 'THE PROJECT', 'GREENWOODS', 'ALDAR × DUBAI HOLDING', K.proj - 0.05, K.s43 - 0.2);
    hudTitle(t, 'THE COMMUNITY · AS REPORTED', 'GREENWOODS', 'ALDAR × DUBAI HOLDING', K.s43 - 0.1, K.three2 - 0.15);
    hudTitle(t, 'ALDAR PROPERTIES', '3-BEDROOM TOWNHOUSES', 'EXPECTED SIZE', K.three2 - 0.05, K.s2227 - 0.25);
    hudTitle(t, '3-BEDROOM TOWNHOUSE', cnt(K.s2227 - 0.2, K.s2227 + 1.4, 2227, 0) + ' SQ FT', 'EXPECTED SIZE · AROUND', K.s2227 - 0.3, K.p3 - 0.3);
    hudTitle(t, 'STARTING PRICE', 'AED ' + cnt(K.p3 - 0.1, K.p3 + 0.7, 3, 0) + ' MILLION', 'EXPECTED', K.p3 - 0.25, K.works - 0.1);
    hudTitle(t, 'WORKS OUT TO ABOUT', 'AED ' + cnt(K.works + 0.05, K.p1350 + 1.2, 1350, 0) + ' / SQ FT', 'AED 3 MILLION ÷ 2,227 SQ FT', K.works - 0.05, K.pot - 0.15);
    hudTitle(t, 'POTENTIALLY', cnt(K.pot, K.p15 + 0.9, 15, 0) + '% BELOW', 'SOME NEARBY COMPETING COMMUNITIES', K.pot - 0.1, K.loc - 0.45);
    hudTitle(t, 'THE LOCATION', 'SILICON OASIS', '& ACADEMIC CITY', K.loc - 0.4, K.conn - 0.1);
    hudTitle(t, 'CONNECTIVITY TO', 'SHEIKH MOHAMMED BIN ZAYED ROAD', 'CLOSE TO BOTH DISTRICTS', K.conn - 0.05, K.dub2 - 0.4);
    hudTitle(t, 'DUBAI · 22 JANUARY 2026', 'SILICON OASIS', 'EXPANSION ANNOUNCED', K.dub2 - 0.35, K.b128 - 0.2);
    hudTitle(t, 'EXPANSION INVESTMENT', 'AED ' + cnt(K.b128 - 0.1, K.b128 + 1.0, 12.8, 1) + ' BILLION', 'SILICON OASIS', K.b128 - 0.15, K.tech - 0.2);
    hudTitle(t, 'SILICON OASIS', 'TECH & AI HUB', 'MAJOR EXPANSION', K.tech - 0.1, K.target - 0.15, '#8CC8FF');
    hudTitle(t, 'TARGETING MORE THAN', cnt(K.target + 0.1, K.j70 + 1.0, 70000, 0) + ' JOBS', 'DIRECT AND INDIRECT', K.target - 0.05, K.acad2 - 0.45);
    hudTitle(t, 'ACADEMIC CITY', 'EDUCATION HUB', 'EXPANDING ITS INSTITUTIONS', K.acad2 - 0.35, K.by - 0.2);
    hudTitle(t, 'METRO BLUE LINE', 'OPENING 2029', 'CONNECTS SILICON OASIS & ACADEMIC CITY', K.by - 0.1, K.looking - 0.45, '#8CC8FF');
    hudTitle(t, 'ALDAR · BEFORE THIS', 'THREE LAUNCHES', 'HAVEN · ATHLON · THE WILDS', K.looking - 0.35, K.haven2 - 0.45);
    hudTitle(t, 'ALDAR · DUBAI', 'HAVEN', 'RESALES · REPORTED', K.haven2 - 0.35, K.p88 - 0.25);
    hudTitle(t, 'HAVEN · REPORTED', cnt(K.p88 - 0.15, K.p88 + 0.8, 8.8, 1) + '% RETURN', 'ON REPEAT SALES', K.p88 - 0.2, K.median - 0.25);
    hudTitle(t, 'HAVEN · REPORTED', 'MEDIAN PRICES', 'OVER 13 MONTHS', K.median - 0.15, K.so - 0.35);
    hudTitle(t, 'THE BIG PICTURE', 'ENTRY PRICE', 'BELOW SOME NEIGHBOURS · EXPECTED', K.so - 0.25, K.located - 0.55);
    hudTitle(t, 'THE BIG PICTURE', 'BILLIONS IN INVESTMENT', 'INFRASTRUCTURE & TECHNOLOGY', K.located - 0.45, K.but - 0.5);
    hudTitle(t, 'BUT', 'IT DEPENDS ON', 'THE INVESTMENT POTENTIAL', K.but - 0.4, K.if1 - 0.4);

    // STAT beat 1: the size of the community, big and calm
    const s1 = ea(t, T_STAT1[0] + 0.05, T_STAT1[0] + 0.4) * (1 - ea(t, T_STAT1[1] - 0.15, T_STAT1[1] + 0.15));
    if (s1 > 0.003) {
      ctx.save(); ctx.globalAlpha *= s1;
      const blk = (y, lab, num, unit, a0, a1, dec) => { T(lab, CX, y - 150, { font: F.d(800, 30), ls: 8, color: C.gold, alpha: ea(t, a0 - 0.1, a0 + 0.3) }); T(num, CX, y + 20, { font: F.d(800, 190), ls: 0, color: C.ink, alpha: ea(t, a0 - 0.1, a0 + 0.3), sx: 1 }); T(unit, CX, y + 100, { font: F.d(800, 66), ls: 6, color: C.ink, alpha: ea(t, a0, a0 + 0.5) }); };
      blk(780, 'APPROXIMATELY', cnt(K.s43 - 0.05, K.s43 + 0.9, 43, 0), 'MILLION SQ FT', K.s43 - 0.1);
      blk(1040, 'AROUND', cnt(K.h8000 - 0.1, K.h8000 + 1.1, 8000, 0), 'NEW HOMES', K.h8000 - 0.15);
      [['APARTMENTS', K.apts], ['VILLAS', K.villas], ['TOWNHOUSES', K.th]].forEach(([txt, a], i) => { const e = ea(t, a - 0.05, a + 0.4, E.out4); if (e <= 0.003) return; const w = [300, 190, 270][i], x0 = [130, 450, 660][i]; ctx.save(); ctx.globalAlpha *= e; rr(x0, 1196, w, 54, 27); ctx.fillStyle = i === 2 ? C.gold : 'rgba(233,196,124,0.16)'; ctx.fill(); T(txt, x0 + w / 2, 1233, { font: F.d(800, 27), ls: 3, color: i === 2 ? '#0A0A0B' : C.ink }); ctx.restore(); });
      ctx.restore();
    }
    // STAT beat 2: "+20%" (his claim, marked REPORTED)
    const s2 = ea(t, T_STAT2[0] + 0.05, T_STAT2[0] + 0.4) * (1 - ea(t, T_STAT2[1] - 0.15, T_STAT2[1] + 0.15));
    if (s2 > 0.003) {
      ctx.save(); ctx.globalAlpha *= s2;
      T('COMMUNITY MEDIAN PRICE', CX, 760, { font: F.d(800, 34), ls: 6, color: C.gold, alpha: ea(t, K.median - 0.1, K.median + 0.3) });
      T('+' + cnt(K.p20 - 0.05, K.p20 + 0.8, 20, 0) + '%', CX, 1000, { font: F.d(800, 280), ls: 0, color: C.ink, alpha: ea(t, K.p20 - 0.15, K.p20 + 0.25) });
      T('OVER 13 MONTHS', CX, 1100, { font: F.d(800, 64), ls: 6, color: C.ink, alpha: ea(t, K.m13 - 0.1, K.m13 + 0.3) });
      { const e = ea(t, K.m13, K.m13 + 0.5, E.out4); ctx.save(); ctx.globalAlpha *= e; rr(CX - 140, 1160, 280, 56, 28); ctx.strokeStyle = C.gold; ctx.lineWidth = 3; ctx.stroke(); T('REPORTED', CX, 1198, { font: F.d(800, 30), ls: 6, color: C.gold }); ctx.restore(); }
      ctx.restore();
    }

    // the call to action: dark background, the bubble grows, the study cover pops up beside it, "green" is typed, sent and answered
    const ce = ea(t, K.if1 + 0.3, K.if1 + 1.0, E.out4);
    if (ce > 0.003) {
      ctx.save(); ctx.globalAlpha *= ce; T('ABDULLAH AHLI', CX, 690, { font: F.d(800, 62), ls: 2, color: C.ink }); T('PORTFOLIO STRATEGIST', CX, 744, { font: F.d(700, 34), ls: 6, color: C.gold }); T('AI-GENERATED AVATAR', CX, 790, { font: F.d(700, 26), ls: 5, color: C.dim }); ctx.restore();
      const send = K.info + 0.4, sent = ea(t, send, send + 0.35), ia = ea(t, K.if1 + 0.8, K.if1 + 1.4, E.out4), iy = 1185, X0 = SAFE.x0, X1 = SAFE.x1, BW = X1 - X0, msg = 'green', typed = msg.slice(0, Math.floor(msg.length * ea(t, K.greenW - 0.05, K.greenW + 0.4, E.lin) + 0.0001));
      ctx.save(); ctx.globalAlpha *= ia; rr(X0, iy - 65, BW, 130, 65); ctx.fillStyle = C.panel; ctx.fill(); ctx.strokeStyle = 'rgba(243,239,230,0.28)'; ctx.lineWidth = 3; ctx.stroke();
      T(typed, X0 + 56, iy + 20, { font: F.d(700, 60), color: C.ink, align: 'left', alpha: 1 - sent }); T('Add a comment…', X0 + 56, iy + 20, { font: F.d(700, 60), color: C.mute, align: 'left', alpha: (1 - ea(t, K.greenW - 0.05, K.greenW + 0.05)) * (1 - sent) });
      dot(X1 - 66, iy, 48, C.gold); icon('plane', X1 - 66, iy, 20, { p: 1, color: '#17181B', w: 4.5, rot: -0.5 + 0.5 * sent }); ctx.restore();
      const b1 = ea(t, send, send + 0.5, E.out4), b2 = ea(t, send + 0.8, send + 1.3, E.out4);
      if (b1 > 0.002) { ctx.save(); ctx.globalAlpha *= b1; ctx.translate(0, (1 - b1) * 36); const w = M(msg, F.d(700, 58)) + 84; rr(X1 - w, 900, w, 112, 56); ctx.fillStyle = C.gold; ctx.fill(); T(msg, X1 - w / 2, 975, { font: F.d(700, 58), color: '#17181B' }); ctx.restore(); }
      if (b2 > 0.002) { ctx.save(); ctx.globalAlpha *= b2; ctx.translate(0, (1 - b2) * 36); const rp = 'Sending you the information', w = M(rp, F.d(700, 48)) + 130; rr(X0, 1030, w, 112, 56); ctx.fillStyle = C.panel; ctx.fill(); ctx.strokeStyle = 'rgba(243,239,230,0.28)'; ctx.lineWidth = 3; ctx.stroke(); icon('check', X0 + 66, 1087, 24, { p: ea(t, send + 1.0, send + 1.4), color: C.gold, w: 5 }); T(rp, X0 + 112, 1103, { font: F.d(700, 48), color: C.ink, align: 'left' }); ctx.restore(); }
    }
    card(t, 'st1', { x: 735, y: 335, w: 205, h: 290, a: K.full + 0.3, from: [60, 0], rot: 4, fit: 'cover', fy: 0, zoom: [1, 1.04], r: 16 });
    { const g = ea(t, K.full + 0.9, K.full + 1.3, E.out3); if (g > 0.01) { ctx.save(); ctx.globalAlpha *= g; ctx.translate(838, 480); ctx.rotate(4 * Math.PI / 180); ctx.scale(1.02, 1.02); rr(-103, -146, 206, 292, 18); ctx.strokeStyle = C.gold; ctx.lineWidth = 4; ctx.stroke(); ctx.restore(); } }

    // the avatar is AI-generated: small label under the bubble for the whole reel (the call to action carries its own line)
    const ai = ea(t, 0.4, 0.9) * (1 - ea(t, K.if1 - 0.1, K.if1 + 0.3));
    if (ai > 0.003) { ctx.save(); ctx.globalAlpha *= ai; const f = F.d(800, 21), w = M('AI-GENERATED AVATAR', f, 3) + 36; glassPill(130, 506, w, 36, 18); T('AI-GENERATED AVATAR', 130 + w / 2, 531, { font: f, ls: 3, color: '#FFFFFF' }); ctx.restore(); }
  };
  OVERLAYS.push(overlay);

  // ---- sound: whooshes on the beat changes (very quiet)
  [T_NAT[0], T_STAT1[0], T_P13[0], T_P7[0], T_MLOC[0], T_DMO[0], T_MAC[0], T_P5[0], T_P7B[0], T_STAT2[0], T_P2[0], T_MINF[0], T_P14[0]].forEach(x => cues.push({ k: 'wh', t: x - 0.1, d: 0.5 }));
  [K.dsoW, K.acadW, K.dso2, K.acad3].forEach(x => cues.push({ k: 'pin', t: x }));
  cues.push({ k: 'send', t: K.info + 0.4 });
  return { FACE_SEGS, PUNCHES, SCENES, OVERLAYS, cues, IMAGES, BUBBLE, FOOT_MAX: 3023 };
}
