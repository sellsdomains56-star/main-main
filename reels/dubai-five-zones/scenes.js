'use strict';
// ---------------------------------------------------------------------------
// "Five Dubai zones before you invest" - built on the HeyGen take (90 s, English), Abdullah Ahli's twin.
// ONE background per beat, moving from background to background: MAP flights (Esri satellite, OSM outlines of the named communities, 3D tilt) - one per zone - then the price ladder (dark) and the call to action.
// The communities, the roads (E11 / E311 / E611) and the price ranges are exactly what he says; nothing else is claimed on screen.
// His face is the small round bubble top-left (live video, gold ring); the HUD title sits right of it. Safe zone: x 130-950, y 300-1270.
// ---------------------------------------------------------------------------
function buildScenes() {
  const cues = [], SCENES = [], tw = (re, n = 0, fb = 0, from = 0) => wt(re, n, fb, from);
  const add = (s) => { SCENES.push(s); return s; };

  // ---- key times (from the spoken words)
  const K = {
    five: tw(/^FIVE$/, 0, 2.2), wrong: tw(/^WRONG$/, 0, 4.3),
    z1: tw(/^ZONE$/, 0, 5.25), sheikh: tw(/^SHEIKH$/, 0, 6.1), coast: tw(/^COASTLINE,$/, 0, 7.2), marina: tw(/^MARINA,$/, 0, 8.12) - 0.1, jbr: tw(/^JBR,$/, 0, 8.89), palm1: tw(/^PALM$/, 0, 9.78), down: tw(/^DOWNTOWN,$/, 0, 10.71), bbay: tw(/^BUSINESS$/, 0, 11.7),
    prime: tw(/^PRIME$/, 0, 12.32), lux: tw(/^LUXURY$/, 0, 13.55), strong: tw(/^STRONG$/, 0, 14.9), price1: tw(/^PRICES$/, 0, 16.24), p2000: tw(/^2,000$/, 0, 17.0), p4000: tw(/^4,000,$/, 0, 17.78), p5000: tw(/^5,000$/, 0, 18.48), foot1: tw(/^FOOT\.$/, 0, 19.72),
    z2: tw(/^ZONE$/, 1, 20.16), e11: tw(/^E11$/, 0, 21.4), e311a: tw(/^E311,$/, 0, 22.32), dhills: tw(/^HILLS,$/, 0, 23.76) - 0.15, tilal: tw(/^TILAL$/, 0, 24.58), arjan: tw(/^ARJAN,$/, 0, 25.66), motor: tw(/^MOTOR$/, 0, 26.52),
    family: tw(/^FAMILY$/, 0, 27.02), stable: tw(/^STABLE$/, 0, 28.26), growth: tw(/^GROWTH$/, 0, 29.6), price2: tw(/^PRICES$/, 1, 30.16), p1200: tw(/^1,200$/, 0, 31.32), p1800: tw(/^1,800$/, 0, 32.46), foot2: tw(/^FOOT\.$/, 1, 34.4),
    z3: tw(/^ZONE$/, 2, 34.7), e311b: tw(/^E311$/, 0, 36.18), e611: tw(/^E611\.$/, 0, 37.4), valley: tw(/^VALLEY,$/, 0, 38.9), ar3: tw(/^ARABIAN$/, 0, 39.57), damac: tw(/^DAMAC$/, 0, 40.42), dland1: tw(/^LAND\.$/, 0, 42.34) - 0.15,
    villas: tw(/^VILLAS,$/, 0, 43.08), townh: tw(/^TOWNHOUSES,$/, 0, 43.56), living: tw(/^LIVING\.$/, 0, 45.08), price3: tw(/^PRICES$/, 2, 45.3), p900: tw(/^900$/, 0, 46.42), p1400: tw(/^1,400$/, 0, 47.24), foot3: tw(/^FOOT\.$/, 2, 48.86),
    z4: tw(/^ZONE$/, 3, 49.16), afford: tw(/^AFFORDABLE$/, 0, 50.34), majan: tw(/^MAJAN,$/, 0, 52.13), liwan: tw(/^LIWAN,$/, 0, 52.64), emerging: tw(/^EMERGING$/, 0, 53.7), price4: tw(/^PRICES$/, 3, 54.92), p700: tw(/^700$/, 0, 56.18), p1100: tw(/^1100$/, 0, 57.02), foot4: tw(/^FOOT\.$/, 3, 58.7),
    lower: tw(/^LOWER$/, 0, 59.1), invest2: tw(/^INVESTING$/, 1, 60.66), growth2: tw(/^GROWTH\.$/, 0, 62.14),
    z5: tw(/^ZONE$/, 4, 62.72), dsouth: tw(/^SOUTH$/, 0, 63.84), corr1: tw(/^CORRIDOR\.$/, 0, 64.94), expo: tw(/^EXPO$/, 0, 65.56), maktoum: tw(/^MAKTOUM$/, 0, 66.86), palm2: tw(/^PALM$/, 1, 69.08), corr2: tw(/^CORRIDOR\.$/, 1, 69.88),
    major: tw(/^MAJOR$/, 0, 70.88), longterm: tw(/^LONG-TERM$/, 0, 72.4), selected: tw(/^SELECTED$/, 0, 74.03), p1100b: tw(/^1100$/, 1, 75.52), p1500: tw(/^1500$/, 0, 77.02), foot5: tw(/^FOOT\.$/, 4, 79.52),
    so: tw(/^SO$/, 0, 80.28), dev: tw(/^DEVELOPER$/, 0, 81.08), ask2: tw(/^ASK$/, 1, 82.36), zone6: tw(/^ZONE$/, 5, 82.72), budget: tw(/^BUDGET\.$/, 0, 83.8),
    if1: tw(/^IF$/, 0, 84.08), comment: tw(/^COMMENT$/, 0, 87.52), consult: tw(/^CONSULTATION$/, 0, 87.66), send: tw(/^SEND$/, 0, 89.06), details: tw(/^DETAILS\.$/, 0, 89.4),
  };

  const FACE_SEGS = [], PUNCHES = [], OVERLAYS = [], IMAGES = {};
  const ZC = [null, ['#FF6B5A', '#FFA896'], ['#FFB020', '#FFDB86'], ['#2FD8B5', '#93F3DF'], ['#6C63FF', '#A79BFF'], ['#3D8BFF', '#9CCBFF']];   // per-zone colours (fill gradient)
  const ZH = [null, '#FF8A7A', '#FFC24D', '#4FE3C4', '#9A93FF', '#6FAEFF'];                                                                 // per-zone accent for text
  const DLm = [55.343, 25.027];                                                                                                            // "Dubai Land" (Bayut community centre)
  const PJA = [54.988, 25.0], DSO = [55.164, 24.925], APT = [55.165, 24.93];

  // ---- the beats: one background each
  const T_M0 = [0, K.z1 - 0.15], T_Z1 = [K.z1 - 0.15, K.z2 - 0.2], T_Z2 = [K.z2 - 0.2, K.z3 - 0.2], T_Z3 = [K.z3 - 0.2, K.z4 - 0.2], T_Z4 = [K.z4 - 0.2, K.z5 - 0.2], T_Z5 = [K.z5 - 0.2, K.so - 0.25], T_LAD = [K.so - 0.25, K.if1 - 0.15];
  const rel = (T, t) => t - T[0], dur = T => T[1] - T[0];

  // ---- the satellite flights (keys are seconds into each flight)
  const flight = (id, [a, b], keys) => { SAT_SCENES[id] = { a, b, veil: 'top', keys: keys.map(k => camKey(...k)).sort((p, q) => p[0] - q[0]) }; add({ id, kind: 'sat', a, b, cfg: {} }); return SAT_SCENES[id]; };
  const d0 = dur(T_M0);
  flight('m0', T_M0, [[0, 55.08, 25.17, 10.9, 130, 8], [2.4, 55.2, 25.08, 11.5, 160, 26], [d0 + 0.6, 55.27, 25.04, 11.75, 170, 32]]);
  flight('z1', T_Z1, [[0, 55.19, 25.12, 11.6, 150, 22], [rel(T_Z1, K.marina) - 0.6, 55.138, 25.100, 13.25, 150, 32], [rel(T_Z1, K.down) - 0.9, 55.138, 25.100, 13.25, 150, 32], [rel(T_Z1, K.down) + 0.25, 55.274, 25.19, 13.0, 150, 30], [dur(T_Z1) + 0.6, 55.274, 25.19, 12.7, 150, 30]]);
  flight('z2', T_Z2, [[0, 55.235, 25.09, 11.9, 150, 22], [rel(T_Z2, K.e311a) + 0.2, 55.236, 25.066, 12.9, 160, 30], [dur(T_Z2) + 0.6, 55.236, 25.066, 13.05, 160, 33]]);
  flight('z3', T_Z3, [[0, 55.34, 25.05, 11.8, 150, 18], [rel(T_Z3, K.e611) + 0.4, 55.388, 25.03, 12.5, 160, 28], [dur(T_Z3) + 0.6, 55.388, 25.03, 12.72, 160, 31]]);
  flight('z4', T_Z4, [[0, 55.30, 25.06, 11.9, 150, 20], [rel(T_Z4, K.afford) + 0.4, 55.34, 25.068, 12.8, 160, 30], [dur(T_Z4) + 0.6, 55.34, 25.068, 12.95, 160, 33]]);
  flight('z5', T_Z5, [[0, 55.12, 24.95, 11.7, 150, 20], [rel(T_Z5, K.expo) - 0.5, 55.155, 24.945, 12.5, 150, 30], [rel(T_Z5, K.palm2) - 0.3, 55.155, 24.945, 12.3, 150, 30], [rel(T_Z5, K.palm2) + 1.0, 55.07, 24.965, 11.75, 150, 26], [dur(T_Z5) + 0.6, 55.075, 24.965, 11.9, 150, 28]]);

  // ---- the face bubble (live video, small, top-left; grows for the call to action)
  const BUBBLE = { t0: 0.1, src: { cx: 550, cy: 830, size: 620 }, keys: [{ t: 0, cx: 215, cy: 418, r: 78 }, { t: K.if1 - 0.2, cx: 215, cy: 418, r: 78 }, { t: K.if1 + 0.9, cx: 540, cy: 470, r: 125 }] };
  HUD_X = 330;

  // ---- map beats: outlines of the communities named, filled in the zone colour as he says each name; places without an OSM outline get a pulse + pin
  const isl = (t, cam, key, z, wins, label, o) => mapIsland(t, cam, key, ZC[z][0], ZC[z][1], wins, label, o);
  const S = id => SCENES.find(s => s.id === id).cfg;
  S('m0').top = (t, cam) => {
    [[1, 55.17, 25.145, 'THE COAST', 2.35], [2, 55.24, 25.07, 'E11 – E311', 2.75], [3, 55.395, 25.03, 'E311 – E611', 3.15], [4, 55.335, 25.115, 'FRONTIER', 3.55], [5, 55.16, 24.935, 'AIRPORT', 3.95]]
      .forEach(([n, lo, la, name, a0]) => islandBadge(t, cam, n, lo, la, name, a0, 0));
  };
  S('z1').top = (t, cam) => {
    isl(t, cam, 'marina', 1, [[K.marina, K.jbr - 0.1]], ['DUBAI', 'MARINA']);
    isl(t, cam, 'jbr', 1, [[K.jbr - 0.1, K.palm1 - 0.1]], 'JBR');
    isl(t, cam, 'palm', 1, [[K.palm1 - 0.1, K.down - 0.2]], ['PALM', 'JUMEIRAH']);
    isl(t, cam, 'downtown', 1, [[K.down - 0.15, K.bbay - 0.1]], 'DOWNTOWN');
    isl(t, cam, 'bbay', 1, [[K.bbay - 0.1, K.prime + 0.6]], ['BUSINESS', 'BAY']);
  };
  S('z2').top = (t, cam) => {
    isl(t, cam, 'dhills', 2, [[K.dhills, K.tilal - 0.1]], ['DUBAI', 'HILLS']);
    isl(t, cam, 'tilal', 2, [[K.tilal - 0.1, K.arjan - 0.1]], ['TILAL', 'AL GHAF']);
    isl(t, cam, 'arjan', 2, [[K.arjan - 0.1, K.motor - 0.1]], 'ARJAN');
    isl(t, cam, 'motor', 2, [[K.motor - 0.1, K.family + 0.4]], ['MOTOR', 'CITY']);
  };
  S('z3').top = (t, cam) => {
    isl(t, cam, 'valley', 3, [[K.valley - 0.15, K.ar3 - 0.1]], ['THE', 'VALLEY']);
    isl(t, cam, 'ar3', 3, [[K.ar3 - 0.1, K.damac - 0.1]], ['ARABIAN', 'RANCHES 3']);
    isl(t, cam, 'damac2', 3, [[K.damac - 0.1, K.dland1 - 0.1]], ['DAMAC', 'HILLS 2']);
    mapPulse(t, cam, DLm[0], DLm[1], 2300, K.dland1, 0);
    mapDot(t, cam, { lon: DLm[0], lat: DLm[1], a0: K.dland1, text: 'DUBAI LAND', side: 'l', size: 26 });
  };
  S('z4').top = (t, cam) => {
    isl(t, cam, 'majan', 4, [[K.majan - 0.1, K.liwan - 0.1]], 'MAJAN');
    isl(t, cam, 'liwan', 4, [[K.liwan - 0.1, K.emerging - 0.1]], 'LIWAN');
    mapPulse(t, cam, DLm[0], DLm[1], 2800, K.emerging - 0.1, 0);
    mapDot(t, cam, { lon: DLm[0], lat: DLm[1], a0: K.emerging - 0.1, text: 'EMERGING · DUBAI LAND', side: 'r', size: 26 });
  };
  S('z5').top = (t, cam) => {
    mapPulse(t, cam, DSO[0], DSO[1], 3200, K.dsouth - 0.2, K.expo - 0.1);
    mapDot(t, cam, { lon: DSO[0], lat: DSO[1], a0: K.dsouth - 0.1, a1: K.expo - 0.1, text: 'DUBAI SOUTH', side: 'r', size: 26 });
    isl(t, cam, 'expo', 5, [[K.expo - 0.1, K.maktoum - 0.15]], ['EXPO', 'CITY'], { base: 0.28 });
    isl(t, cam, 'airport', 5, [[K.maktoum - 0.15, K.palm2 - 0.2]], ['AL MAKTOUM', 'INTL AIRPORT'], { base: 0.16 });
    mapFlow(t, cam, APT, PJA, K.palm2 - 0.7, 0, { dur: 2.2, bend: 0.12 });
    mapPulse(t, cam, PJA[0], PJA[1], 2600, K.palm2 - 0.1, 0);
    mapDot(t, cam, { lon: PJA[0], lat: PJA[1], a0: K.palm2, text: 'PALM JEBEL ALI', side: 'r', size: 26 });
  };

  // ---- the price panel: "AED 2,000 – 5,000" counts up as he says the two numbers
  const pricePanel = (t, o) => {
    const al = ea(t, o.a0, o.a0 + 0.4, E.out3) * (1 - ea(t, o.a1, o.a1 + 0.4)); if (al <= 0.003) return;
    const X = SAFE.x0, Wd = SAFE.w, y0 = 1062, h = 200;
    ctx.save(); ctx.globalAlpha *= al; ctx.translate(0, (1 - ea(t, o.a0, o.a0 + 0.5, E.out4)) * 36);
    glassPill(X, y0, Wd, h, 28);
    T('ZONE ' + o.n + ' · PRICE PER SQ FT', X + 34, y0 + 46, { font: F.d(800, 28), ls: 6, color: ZH[o.n], align: 'left' });
    line(X + 30, y0 + 62, X + Wd - 30, y0 + 62, { color: 'rgba(243,239,230,0.22)', w: 2 });
    const fN = F.d(800, 92), fA = F.d(800, 48), fin = [numberStr(o.lo, 0), numberStr(o.hi, 0)], wA = M('AED', fA, 4), w1 = numberWidth(fin[0], fN, 0), w2 = numberWidth(fin[1], fN, 0), dash = 56, gap = 26, tot = wA + gap + w1 + dash + w2, x0 = CX - tot / 2, by = y0 + 160;
    T('AED', x0 + wA / 2, by - 4, { font: fA, ls: 4, color: ZH[o.n] });
    drawNumber(numberStr(o.lo * ea(t, o.aLo - 0.05, o.aLo + 0.65, E.out3), 0), fin[0], x0 + wA + gap, by, { font: fN, ls: 0, color: C.ink, alpha: ea(t, o.aLo - 0.1, o.aLo + 0.2) });
    const da = ea(t, o.aHi - 0.1, o.aHi + 0.3); line(x0 + wA + gap + w1 + 14, by - 30, x0 + wA + gap + w1 + dash - 14, by - 30, { color: C.ink, w: 7, alpha: da });
    drawNumber(numberStr(o.hi * ea(t, o.aHi - 0.05, o.aHi + (o.hiDur ?? 0.7), E.out3), 0), fin[1], x0 + wA + gap + w1 + dash, by, { font: fN, ls: 0, color: C.ink, alpha: da });
    ctx.restore();
  };
  const ladder = [[1, 'THE COAST', 2000, 5000], [2, 'E11 – E311', 1200, 1800], [3, 'E311 – E611', 900, 1400], [4, 'THE FRONTIER', 700, 1100], [5, 'AIRPORT CORRIDOR', 1100, 1500]];

  const overlay = (t) => {
    // HUD title per beat (right of the bubble)
    hudTitle(t, 'BEFORE YOU INVEST IN DUBAI', '5 ZONES', 'DON\'T BUY IN THE WRONG LOCATION', 0.5, K.z1 - 0.35);
    hudTitle(t, 'ZONE 1', 'THE COAST', 'SHEIKH ZAYED ROAD', T_Z1[0] + 0.1, K.price1 - 0.1, ZH[1]);
    hudTitle(t, 'ZONE 1 · THE COAST', 'PRICE PER SQ FT', 'AED 2,000 – 5,000', K.price1 - 0.05, T_Z1[1] - 0.1, ZH[1]);
    hudTitle(t, 'ZONE 2', 'E11 TO E311', 'FAMILY COMMUNITIES', T_Z2[0] + 0.1, K.price2 - 0.1, ZH[2]);
    hudTitle(t, 'ZONE 2 · E11 TO E311', 'PRICE PER SQ FT', 'AED 1,200 – 1,800', K.price2 - 0.05, T_Z2[1] - 0.1, ZH[2]);
    hudTitle(t, 'ZONE 3', 'E311 TO E611', 'VILLAS & TOWNHOUSES', T_Z3[0] + 0.1, K.price3 - 0.1, ZH[3]);
    hudTitle(t, 'ZONE 3 · E311 TO E611', 'PRICE PER SQ FT', 'AED 900 – 1,400', K.price3 - 0.05, T_Z3[1] - 0.1, ZH[3]);
    hudTitle(t, 'ZONE 4', 'AFFORDABLE FRONTIER', 'EMERGING AREAS', T_Z4[0] + 0.1, K.price4 - 0.1, ZH[4]);
    hudTitle(t, 'ZONE 4 · THE FRONTIER', 'PRICE PER SQ FT', 'AED 700 – 1,100', K.price4 - 0.05, K.lower - 0.2, ZH[4]);
    hudTitle(t, 'ZONE 4 · THE FRONTIER', 'LOWER ENTRY PRICES', 'FUTURE INFRASTRUCTURE & GROWTH', K.lower - 0.15, T_Z4[1] - 0.1, ZH[4]);
    hudTitle(t, 'ZONE 5', 'DUBAI SOUTH', 'AIRPORT CORRIDOR', T_Z5[0] + 0.1, K.major - 0.2, ZH[5]);
    hudTitle(t, 'ZONE 5 · AIRPORT CORRIDOR', 'LONG-TERM POTENTIAL', 'MAJOR INFRASTRUCTURE INVESTMENT', K.major - 0.15, K.selected - 0.25, ZH[5]);
    hudTitle(t, 'ZONE 5 · SELECTED PROPERTIES', 'PRICE PER SQ FT', 'AED 1,100 – 1,500', K.selected - 0.2, T_Z5[1] - 0.1, ZH[5]);
    hudTitle(t, 'THE BIG PICTURE', 'WHICH ZONE FITS?', 'YOUR BUDGET DECIDES', T_LAD[0] + 0.1, K.if1 - 0.35);

    // the descriptors he lists, as a frosted checklist that fills row by row
    breakdown(t, { title: 'ZONE 1 · WHAT YOU GET', a0: K.prime - 0.2, a1: K.price1 - 0.15, items: [{ txt: 'PRIME LOCATIONS', a: K.prime }, { txt: 'LUXURY PROPERTIES', a: K.lux }, { txt: 'STRONG RENTAL DEMAND', a: K.strong, gold: true }] });
    breakdown(t, { title: 'ZONE 2 · WHAT YOU GET', a0: K.family - 0.2, a1: K.price2 - 0.15, items: [{ txt: 'FAMILY COMMUNITIES', a: K.family }, { txt: 'STABLE RENTAL DEMAND', a: K.stable }, { txt: 'GROWTH POTENTIAL', a: K.growth, gold: true }] });
    breakdown(t, { title: 'ZONE 3 · WHAT YOU GET', a0: K.villas - 0.25, a1: K.price3 - 0.15, items: [{ txt: 'MORE VILLAS', a: K.villas }, { txt: 'TOWNHOUSES', a: K.townh }, { txt: 'FAMILY LIVING', a: K.living, gold: true }] });
    breakdown(t, { title: 'ZONE 4 · THE TRADE-OFF', a0: K.lower - 0.2, a1: T_Z4[1] - 0.15, items: [{ txt: 'LOWER ENTRY PRICES', a: K.lower }, { txt: 'FUTURE INFRASTRUCTURE', a: K.invest2 }, { txt: 'AND GROWTH', a: K.growth2 - 0.3, gold: true }] });
    breakdown(t, { title: 'ZONE 5 · WHAT YOU GET', a0: K.major - 0.2, a1: K.selected - 0.3, items: [{ txt: 'MAJOR INFRASTRUCTURE INVESTMENT', a: K.major }, { txt: 'LONG-TERM DEVELOPMENT POTENTIAL', a: K.longterm, gold: true }] });

    // the price of each zone, counting up as he says the two numbers
    pricePanel(t, { n: 1, lo: 2000, hi: 5000, a0: K.price1, aLo: K.p2000, aHi: K.p4000, hiDur: 1.1, a1: T_Z1[1] - 0.15 });
    pricePanel(t, { n: 2, lo: 1200, hi: 1800, a0: K.price2, aLo: K.p1200, aHi: K.p1800, a1: T_Z2[1] - 0.15 });
    pricePanel(t, { n: 3, lo: 900, hi: 1400, a0: K.price3, aLo: K.p900, aHi: K.p1400, a1: T_Z3[1] - 0.15 });
    pricePanel(t, { n: 4, lo: 700, hi: 1100, a0: K.price4, aLo: K.p700, aHi: K.p1100, a1: K.lower - 0.25 });
    pricePanel(t, { n: 5, lo: 1100, hi: 1500, a0: K.selected, aLo: K.p1100b, aHi: K.p1500, a1: T_Z5[1] - 0.15 });

    // the ladder: all five ranges on one scale (dark background)
    const la = ea(t, T_LAD[0] + 0.05, T_LAD[0] + 0.4) * (1 - ea(t, T_LAD[1] - 0.15, T_LAD[1] + 0.15));
    if (la > 0.003) {
      ctx.save(); ctx.globalAlpha *= la;
      T('PRICE PER SQ FT · AED', SAFE.x0, 640, { font: F.d(800, 28), ls: 6, color: C.gold, align: 'left', alpha: ea(t, T_LAD[0] + 0.2, T_LAD[0] + 0.6) });
      const BX0 = 440, BX1 = SAFE.x1, SC = (BX1 - BX0) / 5000;
      [0, 1000, 2000, 3000, 4000, 5000].forEach(v => { const x = BX0 + v * SC; line(x, 690, x, 1192, { color: 'rgba(243,239,230,0.10)', w: 2 }); T(v ? numberStr(v, 0) : '0', x, 1232, { font: F.d(700, 24), color: C.mute, ls: 1 }); });
      ladder.forEach(([n, name, lo, hi], i) => {
        const a = T_LAD[0] + 0.3 + i * 0.42, e = enter(t, a, 0.5, 26); if (e.a <= 0.003) return;
        const y = 740 + i * 100, g = ea(t, a + 0.1, a + 0.9, E.out4), x0 = BX0 + lo * SC, w = Math.max(18, (hi - lo) * SC * g);
        ctx.save(); ctx.globalAlpha *= e.a; ctx.translate(0, e.dy);
        T('ZONE ' + n, SAFE.x0, y - 8, { font: F.d(800, 40), ls: 3, color: ZH[n], align: 'left' });
        T(numberStr(lo, 0) + ' – ' + numberStr(hi, 0), SAFE.x0, y + 32, { font: F.d(700, 32), ls: 1, color: C.ink, align: 'left' });
        rr(BX0, y - 30, BX1 - BX0, 52, 26); ctx.fillStyle = 'rgba(243,239,230,0.06)'; ctx.fill();
        const gr = ctx.createLinearGradient(x0, 0, x0 + w, 0); gr.addColorStop(0, ZC[n][0]); gr.addColorStop(1, ZC[n][1]); rr(x0, y - 30, w, 52, 26); ctx.fillStyle = gr; ctx.fill();
        ctx.restore();
      });
      ctx.restore();
    }

    // the call to action: dark background, the bubble grows, "consultation" is typed, sent and answered
    const ce = ea(t, K.if1 + 0.3, K.if1 + 1.0, E.out4);
    if (ce > 0.003) {
      ctx.save(); ctx.globalAlpha *= ce; T('ABDULLAH AHLI', CX, 690, { font: F.d(800, 62), ls: 2, color: C.ink }); T('PORTFOLIO STRATEGIST', CX, 744, { font: F.d(700, 34), ls: 6, color: C.gold }); ctx.restore();
      const send = K.details + 0.45, sent = ea(t, send, send + 0.35), ia = ea(t, K.if1 + 0.8, K.if1 + 1.4, E.out4), iy = 1185, X0 = SAFE.x0, X1 = SAFE.x1, BW = X1 - X0, msg = 'consultation', typed = msg.slice(0, Math.floor(msg.length * ea(t, K.consult - 0.05, K.consult + 0.75, E.lin) + 0.0001));
      ctx.save(); ctx.globalAlpha *= ia; rr(X0, iy - 65, BW, 130, 65); ctx.fillStyle = C.panel; ctx.fill(); ctx.strokeStyle = 'rgba(243,239,230,0.28)'; ctx.lineWidth = 3; ctx.stroke();
      T(typed, X0 + 56, iy + 20, { font: F.d(700, 60), color: C.ink, align: 'left', alpha: 1 - sent }); T('Add a comment…', X0 + 56, iy + 20, { font: F.d(700, 60), color: C.mute, align: 'left', alpha: (1 - ea(t, K.consult - 0.05, K.consult + 0.05)) * (1 - sent) });
      dot(X1 - 66, iy, 48, C.gold); icon('plane', X1 - 66, iy, 20, { p: 1, color: '#17181B', w: 4.5, rot: -0.5 + 0.5 * sent }); ctx.restore();
      const b1 = ea(t, send, send + 0.5, E.out4), b2 = ea(t, send + 0.8, send + 1.3, E.out4);
      if (b1 > 0.002) { ctx.save(); ctx.globalAlpha *= b1; ctx.translate(0, (1 - b1) * 36); const w = M(msg, F.d(700, 58)) + 84; rr(X1 - w, 900, w, 112, 56); ctx.fillStyle = C.gold; ctx.fill(); T(msg, X1 - w / 2, 975, { font: F.d(700, 58), color: '#17181B' }); ctx.restore(); }
      if (b2 > 0.002) { ctx.save(); ctx.globalAlpha *= b2; ctx.translate(0, (1 - b2) * 36); const rp = 'Sending you the details', w = M(rp, F.d(700, 48)) + 130; rr(X0, 1030, w, 112, 56); ctx.fillStyle = C.panel; ctx.fill(); ctx.strokeStyle = 'rgba(243,239,230,0.28)'; ctx.lineWidth = 3; ctx.stroke(); icon('check', X0 + 66, 1087, 24, { p: ea(t, send + 1.0, send + 1.4), color: C.gold, w: 5 }); T(rp, X0 + 112, 1103, { font: F.d(700, 48), color: C.ink, align: 'left' }); ctx.restore(); }
    }
    // name chip under the bubble while he is introduced
    const nm = ea(t, 0.5, 1.0) * (1 - ea(t, 3.6, 4.0));
    if (nm > 0.003) { ctx.save(); ctx.globalAlpha *= nm; const f = F.d(800, 26), w = M('ABDULLAH AHLI', f, 3) + 44; glassPill(130, 514, w, 46, 23); T('ABDULLAH AHLI', 130 + w / 2, 547, { font: f, ls: 3, color: '#FFFFFF' }); ctx.restore(); }
  };
  OVERLAYS.push(overlay);

  // ---- sound: whooshes on the beat changes (very quiet) + soft pins on each community name
  [T_Z1[0], T_Z2[0], T_Z3[0], T_Z4[0], T_Z5[0], T_LAD[0]].forEach(x => cues.push({ k: 'wh', t: x - 0.1, d: 0.5 }));
  [K.marina, K.jbr, K.palm1, K.down, K.bbay, K.dhills, K.tilal, K.arjan, K.motor, K.valley, K.ar3, K.damac, K.majan, K.liwan, K.expo, K.maktoum].forEach(x => cues.push({ k: 'pin', t: x }));
  cues.push({ k: 'send', t: K.details + 0.45 });
  return { FACE_SEGS, PUNCHES, SCENES, OVERLAYS, cues, IMAGES, BUBBLE, FOOT_MAX: 2700 };
}
