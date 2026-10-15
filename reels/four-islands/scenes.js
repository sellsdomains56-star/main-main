'use strict';
// ---------------------------------------------------------------------------
// Scenes for "4 key islands in Abu Dhabi" (Abu Dhabi look + real material). 126 s.
// FACE (him, on camera): 0-6.2 hook, 100.8-103.6 "which of these four would I choose?", 116.8-119.7 name. Everything else: one hero per beat -
// a real satellite flyover + outline for each island, real pages as cards with marker highlights (Wikipedia: Louvre / Guggenheim; Finance Middle East: ADGM x Al Reem;
// Khaleej Times: Hudayriyat), pills, kinetic type, a message call-to-action.  Content stays in SAFE (x 130-950, y 330-1270); captions at y~1352.
// ---------------------------------------------------------------------------
function buildScenes() {
  const cues = [], SCENES = [], tw = (re, n = 0, fb = 0, from = 0) => wt(re, n, fb, from);
  const add = (s, cutCue = true) => { SCENES.push(s); if (cutCue && s.a > 0.5) cues.push({ k: 'cut', t: s.a }); return s; };

  // ---- key times (from the spoken words)
  const K = {
    four: tw(/^FOUR$/, 0, 0.6), abu: tw(/^ABU$/, 0, 1.5),
    num1: tw(/^NUMBER$/, 0, 6.3), saad: tw(/^SAADIYAT$/, 0, 7.0), lux: tw(/^LUXURY$/, 0, 9.0), youve: tw(/^YOU'VE$/, 0, 10.4), louvre: tw(/^LOUVRE$/, 0, 10.8), gugg: tw(/^GUGGENHEIM$/, 0, 12.0), project: tw(/^PROJECT,$/, 0, 12.5),
    beach: tw(/^BEACHFRONT$/, 0, 13.6), excl: tw(/^EXCLUSIVE$/, 0, 15.7), saad2: tw(/^SAADIYAT$/, 1, 17.7), wealthy: tw(/^WEALTHY$/, 0, 18.2), intl: tw(/^INTERNATIONAL$/, 0, 18.7), privacy: tw(/^PRIVACY,$/, 0, 20.2), lux2: tw(/^LUXURY,$/, 0, 20.8), longterm: tw(/^LONG-TERM$/, 0, 21.9),
    if1: tw(/^IF$/, 0, 23.1), highend: tw(/^HIGH-END$/, 0, 23.7), saad3: tw(/^SAADIYAT$/, 2, 25.0), worth: tw(/^WORTH$/, 0, 25.9),
    num2: tw(/^NUMBER$/, 1, 26.6), yas: tw(/^YAS$/, 0, 27.6), entert: tw(/^ENTERTAINMENT$/, 0, 29.2), youve2: tw(/^YOU'VE$/, 1, 31.4), ferrari: tw(/^FERRARI$/, 0, 31.5), warner: tw(/^WARNER$/, 0, 32.6), formula: tw(/^FORMULA$/, 0, 33.6), attract: tw(/^ATTRACTIONS$/, 0, 35.3),
    but1: tw(/^BUT$/, 0, 38.1), tourist: tw(/^TOURIST$/, 0, 41.1), anymore: tw(/^ANYMORE\.$/, 0, 41.7), growing: tw(/^GROWING$/, 0, 43.0), resid1: tw(/^RESIDENTIAL$/, 0, 43.3),
    that: tw(/^THAT$/, 0, 44.9), rental1: tw(/^RENTAL$/, 0, 45.8), holiday: tw(/^HOLIDAY$/, 0, 47.0), potential: tw(/^POTENTIAL$/, 0, 48.0),
    num3: tw(/^NUMBER$/, 2, 49.7), reem: tw(/^REEM$/, 0, 50.6), al2: tw(/^AL$/, 1, 53.4), financial: tw(/^FINANCIAL$/, 0, 56.5), adgm: tw(/^ADGM,$/, 0, 60.5), onto: tw(/^ONTO$/, 0, 61.5),
    think: tw(/^THINK$/, 0, 62.5), companies: tw(/^COMPANIES$/, 0, 63.5), profs: tw(/^PROFESSIONALS$/, 0, 65.8), live: tw(/^PLACES$/, 0, 66.6), and2: tw(/^AND$/, 0, 67.8, 67.5), stronger: tw(/^STRONGER$/, 0, 68.4), resid2: tw(/^RESIDENTIAL$/, 1, 69.5), apts: tw(/^APARTMENTS\.$/, 0, 70.9),
    rental2: tw(/^RENTAL$/, 1, 72.3), business: tw(/^BUSINESS$/, 0, 73.7), explore: tw(/^WORTH$/, 1, 75.3),
    num4: tw(/^NUMBER$/, 3, 76.8), hud: tw(/^HUDAYRIYAT$/, 0, 77.5), ambitious: tw(/^AMBITIOUS$/, 0, 80.6), waterfront: tw(/^WATERFRONT$/, 0, 81.1), villas: tw(/^VILLAS,$/, 0, 83.6), beaches: tw(/^BEACHES,$/, 0, 84.6), sporting: tw(/^SPORTING$/, 0, 86.5), master: tw(/^MASTER$/, 0, 88.5),
    but2: tw(/^BUT$/, 0, 90.0, 89.5), taking: tw(/^TAKING$/, 0, 93.2), horizon: tw(/^HORIZON,$/, 0, 96.3), develops: tw(/^DEVELOPS\.$/, 0, 99.9),
    which: tw(/^WHICH$/, 0, 101.0), choose: tw(/^CHOOSE\?$/, 0, 103.0), that2: tw(/^THAT$/, 0, 103.7, 103), budget: tw(/^BUDGET,$/, 0, 104.9), goals: tw(/^GOALS,$/, 0, 106.0), most: tw(/^MOST$/, 0, 106.9, 106), exit: tw(/^EXIT$/, 0, 108.1),
    because: tw(/^BECAUSE$/, 0, 109.3), where: tw(/^WHERE$/, 0, 111.4, 110.5), also: tw(/^ALSO$/, 0, 112.6, 112), what: tw(/^WHAT$/, 0, 112.9, 112.5), how1: tw(/^HOW$/, 0, 113.8, 113.5), easily: tw(/^EASILY$/, 0, 115.0),
    im: tw(/^I'M$/, 0, 117.1), abdullah: tw(/^ABDULLAH$/, 0, 117.2), send: tw(/^SEND$/, 0, 119.9), message: tw(/^MESSAGE,$/, 0, 120.5), right: tw(/^RIGHT$/, 0, 121.5),
  };
  const FACE_SEGS = [[0, K.num1 - 0.08], [K.which - 0.2, K.that2 - 0.1], [K.im - 0.3, K.send - 0.25]];
  const PUNCHES = [[K.four, 0.06], [K.which, 0.05], [K.abdullah, 0.05]];
  const IMAGES = { louvre: 'assets/louvre.png', gugg: 'assets/gugg.png', fme: 'assets/fme.png', hud: 'assets/hud.png' };
  const X0 = SAFE.x0;
  const sat = (id, a, b, keys, outline, o0, o1, pins, top) => {
    SAT_SCENES[id] = { a, b: b + 0.6, veil: 'top', keys };
    add({ id, kind: 'sat', a, b, cfg: { outlines: [{ key: outline, t0: o0, t1: o1 }], pins, top } });
  };
  const head = (t, n, name, sub, a, o = {}) => {                                  // the "NUMBER ONE / ISLAND NAME / subtitle" block over a map
    bw(t, 'NUMBER ' + n, 395, a, { size: 44, ls: 10, color: C.dim, w: 700 });
    bw(t, name, 485, o.nameT ?? a + 0.3, { size: 84, ls: 2, hl: true });
    if (sub) bw(t, sub, 565, o.subT ?? a + 1.4, { size: 46, ls: 4, color: C.gold });
  };
  const arrow = (t, x, y, a0) => { const p = ea(t, a0, a0 + 0.4, E.out3); if (p > 0.002) { strokePoly([[x, y], [x, y + 46]], p, { color: C.gold, w: 8 }); if (p > 0.95) strokePoly([[x - 16, y + 30], [x, y + 48], [x + 16, y + 30]], 1, { color: C.gold, w: 8 }); } };

  // ======================================================================= 1. SAADIYAT ===============================================================
  const a1 = K.num1 - 0.08, b1 = K.youve - 0.06;
  sat('sat1', a1, b1, [[0, 54.425, 24.535, 11.9], [2.0, 54.43, 24.54, 12.5], [(b1 - a1) + 0.4, 54.435, 24.545, 12.8]], 'saadiyat', a1 + 0.4, K.saad + 0.9,
    [{ lon: 54.435, lat: 24.545, t: K.saad, title: 'SAADIYAT', sub: 'LUXURY & CULTURE' }],
    t => head(t, 'ONE', 'SAADIYAT ISLAND', 'WHERE LUXURY IS HEADING', K.num1 - 0.05, { nameT: K.saad - 0.1, subT: K.lux - 0.1 }));
  cues.push({ k: 'pin', t: K.saad }, { k: 'wh', t: a1 - 0.1, d: 0.7 });

  const b2 = K.saad2 - 0.06;
  add({ id: 'saad_cards', a: b1, b: b2, box: [330, 1270], fn(t) {
    bw(t, 'ON SAADIYAT', 385, K.youve - 0.05, { size: 50, ls: 8, color: C.dim, w: 700 });
    card(t, 'louvre', { x: 140, y: 470, w: 800, h: 520, a: b1 + 0.04, out: K.gugg - 0.2, from: [-250, 50], rot: -1.6, fit: 'cover', fy: 0, zoom: [1, 1.03], chip: 'WIKIPEDIA · LOUVRE ABU DHABI',
      focus: [{ bbox: [48, 700, 1100, 140], t0: b1 + 0.2, t1: b1 + 0.8, zoom: 1.0 }],
      hl: [{ bbox: [112, 732, 274, 38], t0: K.louvre - 0.05, t1: K.louvre + 0.5 }, { bbox: [545, 786, 218, 38], t0: K.louvre + 0.5, t1: K.louvre + 1.0 }] });
    card(t, 'gugg', { x: 140, y: 470, w: 800, h: 520, a: K.gugg - 0.1, out: b2 - 0.3, from: [250, 50], rot: 1.6, fit: 'cover', fy: 0, zoom: [1, 1.03], chip: 'WIKIPEDIA · GUGGENHEIM',
      focus: [{ bbox: [48, 420, 1100, 140], t0: K.gugg - 0.1, t1: K.gugg + 0.5, zoom: 1.0 }],
      hl: [{ bbox: [112, 438, 363, 38], t0: K.gugg + 0.05, t1: K.gugg + 0.55 }, { bbox: [48, 490, 490, 38], t0: K.project - 0.1, t1: K.project + 0.5 }] });
    pillRow(t, 'building', 'BEACHFRONT COMMUNITIES', 1100, K.beach - 0.2, { w: 820, h: 104 });
    pillRow(t, 'tag', 'EXCLUSIVE PROPERTIES', 1220, K.excl - 0.2, { w: 820, h: 104 });
  } });
  cues.push({ k: 'wh', t: K.louvre - 0.2, d: 0.3 }, { k: 'wh', t: K.gugg - 0.2, d: 0.3 }, { k: 'wh', t: K.beach - 0.2, d: 0.3 }, { k: 'wh', t: K.excl - 0.2, d: 0.3 });

  const b3 = K.num2 - 0.06;
  add({ id: 'saad_buyers', a: b2, b: b3, box: [330, 1270], fn(t) {
    const o1 = K.if1 - 0.12;
    bw(t, 'WEALTHY', 500, K.wealthy - 0.1, { size: 118, ls: 2, hl: true, out: o1 });
    bw(t, 'INTERNATIONAL BUYERS', 610, K.intl - 0.1, { size: 62, ls: 3, out: o1 });
    bw(t, 'LOOKING FOR', 770, K.wealthy + 1.0, { size: 44, ls: 8, color: C.dim, w: 700, out: o1 });
    bw(t, 'PRIVACY', 870, K.privacy - 0.1, { size: 90, ls: 2, out: o1 });
    bw(t, 'LUXURY', 975, K.lux2 - 0.1, { size: 90, ls: 2, out: o1 });
    bw(t, 'LONG-TERM VALUE', 1080, K.longterm - 0.1, { size: 90, ls: 2, color: C.gold, out: o1 });
    bw(t, 'TARGETING THE', 640, K.if1 + 0.15, { size: 50, ls: 8, color: C.dim, w: 700 });
    bw(t, 'HIGH-END MARKET?', 760, K.highend - 0.1, { size: 88, ls: 2 });
    bw(t, 'SAADIYAT', 930, K.saad3 - 0.1, { size: 130, ls: 2, color: C.gold });
    bw(t, 'WORTH CONSIDERING', 1060, K.worth - 0.1, { size: 72, ls: 2, hl: true });
  } });
  cues.push({ k: 'wh', t: K.wealthy - 0.2, d: 0.3 }, { k: 'wh', t: K.if1, d: 0.3 }, { k: 'stamp', t: K.worth - 0.1 });

  // ======================================================================= 2. YAS ====================================================================
  const a4 = b3, b4 = K.youve2 - 0.06;
  sat('sat2', a4, b4, [[0, 54.60, 24.485, 11.9], [2.0, 54.603, 24.486, 12.5], [(b4 - a4) + 0.4, 54.605, 24.486, 12.85]], 'yas', a4 + 0.4, K.yas + 0.9,
    [{ lon: 54.6035, lat: 24.486, t: K.yas, title: 'YAS', sub: 'ENTERTAINMENT & LIFESTYLE' }],
    t => head(t, 'TWO', 'YAS ISLAND', 'ENTERTAINMENT & LIFESTYLE', K.num2 - 0.05, { nameT: K.yas - 0.1, subT: K.entert - 0.1 }));
  cues.push({ k: 'pin', t: K.yas }, { k: 'wh', t: a4 - 0.1, d: 0.7 });

  const b5 = K.but1 - 0.05;
  add({ id: 'yas_pills', a: b4, b: b5, box: [330, 1270], fn(t) {
    bw(t, 'WHAT YOU GET ON YAS', 410, K.youve2 - 0.05, { size: 48, ls: 8, color: C.dim, w: 700 });
    pillRow(t, 'flag', 'FERRARI WORLD', 580, K.ferrari - 0.2, { w: 820, h: 120 });
    pillRow(t, 'building', 'WARNER BROS', 735, K.warner - 0.2, { w: 820, h: 120 });
    pillRow(t, 'bars', 'FORMULA ONE CIRCUIT', 890, K.formula - 0.2, { w: 820, h: 120 });
    pillRow(t, 'up', 'ATTRACTIONS ALL YEAR', 1045, K.attract - 0.2, { w: 820, h: 120 });
  } });
  cues.push({ k: 'wh', t: K.ferrari - 0.2, d: 0.3 }, { k: 'wh', t: K.warner - 0.2, d: 0.3 }, { k: 'wh', t: K.formula - 0.2, d: 0.3 }, { k: 'wh', t: K.attract - 0.2, d: 0.3 });

  const b6 = K.that - 0.05;
  add({ id: 'yas_resident', a: b5, b: b6, box: [330, 1270], fn(t) {
    bw(t, 'BUT FOR INVESTORS', 450, K.but1 - 0.05, { size: 54, ls: 8, color: C.dim, w: 700 });
    const st = ea(t, K.anymore - 0.35, K.anymore + 0.15, E.out4);
    bw(t, 'TOURIST DESTINATION', 640, K.tourist - 0.15, { size: 80, ls: 2, color: st > 0.5 ? C.mute : C.ink });
    if (st > 0.002) line(X0 + 20, 612, X0 + 20 + 780 * st, 612, { color: C.gold, w: 10 });
    bw(t, 'GROWING', 830, K.growing - 0.1, { size: 110, ls: 2, color: C.gold });
    bw(t, 'RESIDENTIAL COMMUNITY', 960, K.resid1 - 0.1, { size: 74, ls: 2, hl: true });
  } });
  cues.push({ k: 'wh', t: K.growing - 0.2, d: 0.3 }, { k: 'stamp', t: K.resid1 - 0.1 });

  const b7 = K.num3 - 0.06;
  add({ id: 'yas_opps', a: b6, b: b7, box: [330, 1270], fn(t) {
    bw(t, 'THAT MEANS OPPORTUNITIES', 430, K.that - 0.05, { size: 46, ls: 6, color: C.dim, w: 700 });
    pillRow(t, 'house', 'RENTAL INCOME', 620, K.rental1 - 0.2, { w: 820, h: 128 });
    pillRow(t, 'tag', 'HOLIDAY HOMES', 790, K.holiday - 0.2, { w: 820, h: 128 });
    pillRow(t, 'chart', 'POTENTIAL APPRECIATION', 960, K.potential - 0.2, { w: 820, h: 128 });
  } });
  cues.push({ k: 'wh', t: K.rental1 - 0.2, d: 0.3 }, { k: 'wh', t: K.holiday - 0.2, d: 0.3 }, { k: 'wh', t: K.potential - 0.2, d: 0.3 });

  // ======================================================================= 3. AL REEM ================================================================
  const a8 = b7, b8 = K.al2 - 0.06;
  sat('sat3', a8, b8, [[0, 54.41, 24.487, 12.6], [1.8, 54.409, 24.4868, 13.4], [(b8 - a8) + 0.4, 54.4087, 24.4868, 13.9]], 'reem', a8 + 0.4, K.reem + 0.9,
    [{ lon: 54.4098, lat: 24.4875, t: K.reem, title: 'AL REEM', sub: 'BUSINESS & RENTAL' }],
    t => head(t, 'THREE', 'AL REEM ISLAND', 'WHERE THINGS GET INTERESTING', K.num3 - 0.05, { nameT: K.reem - 0.15, subT: K.reem + 1.0 }));
  cues.push({ k: 'pin', t: K.reem }, { k: 'wh', t: a8 - 0.1, d: 0.7 });

  const b9 = K.think - 0.06;
  add({ id: 'reem_adgm', a: b8, b: b9, box: [330, 1270], fn(t) {
    bw(t, 'CONNECTED TO THE FINANCIAL SECTOR', 385, K.financial - 0.3, { size: 46, ls: 4, color: C.dim, w: 700 });
    card(t, 'fme', { x: 140, y: 470, w: 800, h: 520, a: b8 + 0.04, out: b9 - 0.3, from: [-250, 50], rot: -1.6, fit: 'cover', fy: 0, zoom: [1, 1.03], chip: 'FINANCE MIDDLE EAST · FEB 2025',
      focus: [{ bbox: [210, 240, 1000, 300], t0: b8 + 0.4, t1: b8 + 1.1, zoom: 1.1 }],
      hl: [{ bbox: [210, 245, 160, 66], t0: K.adgm - 0.2, t1: K.adgm + 0.3 }, { bbox: [672, 245, 395, 66], t0: K.onto - 0.1, t1: K.onto + 0.5 }] });
    bw(t, 'ABU DHABI GLOBAL MARKET', 1130, K.adgm - 0.9, { size: 46, ls: 4, color: C.dim, w: 700 });
    bw(t, 'ADGM', 1235, K.adgm - 0.15, { size: 110, ls: 4, hl: true });
  } });
  cues.push({ k: 'wh', t: K.financial - 0.3, d: 0.3 }, { k: 'stamp', t: K.adgm - 0.15 });

  const b10 = K.and2 - 0.05;
  add({ id: 'reem_chain', a: b9, b: b10, box: [330, 1270], fn(t) {
    bw(t, 'THINK ABOUT IT', 392, b9 + 0.1, { size: 46, ls: 8, color: C.dim, w: 700 });
    pillRow(t, 'building', 'MORE COMPANIES', 560, K.companies - 0.2, { w: 820, h: 128 });
    pillRow(t, 'briefcase', 'MORE PROFESSIONALS', 750, K.profs - 0.2, { w: 820, h: 128 });
    pillRow(t, 'house', 'NEED PLACES TO LIVE', 940, K.live - 0.2, { w: 820, h: 128 });
    arrow(t, CX, 630, K.profs - 0.4); arrow(t, CX, 820, K.live - 0.4);
  } });
  cues.push({ k: 'wh', t: K.companies - 0.2, d: 0.3 }, { k: 'wh', t: K.profs - 0.2, d: 0.3 }, { k: 'wh', t: K.live - 0.2, d: 0.3 });

  const b11 = K.num4 - 0.06;
  add({ id: 'reem_demand', a: b10, b: b11, box: [330, 1270], fn(t) {
    bw(t, 'STRONGER DEMAND', 480, K.stronger - 0.1, { size: 90, ls: 2, hl: true });
    bw(t, 'RESIDENTIAL · APARTMENTS', 590, K.resid2 - 0.1, { size: 54, ls: 4, color: C.gold });
    pillRow(t, 'house', 'RENTAL INCOME', 790, K.rental2 - 0.2, { w: 820, h: 128 });
    pillRow(t, 'briefcase', 'BUSINESS DISTRICTS', 950, K.business - 0.2, { w: 820, h: 128 });
    bw(t, 'WORTH EXPLORING', 1170, K.explore - 0.2, { size: 80, ls: 2, color: C.ink });
  } });
  cues.push({ k: 'wh', t: K.stronger - 0.2, d: 0.3 }, { k: 'wh', t: K.rental2 - 0.2, d: 0.3 }, { k: 'wh', t: K.business - 0.2, d: 0.3 });

  // ======================================================================= 4. HUDAYRIYAT ============================================================
  const a12 = b11, b12 = K.villas - 1.1;
  sat('sat4', a12, b12, [[0, 54.37, 24.42, 11.8], [2.2, 54.365, 24.421, 12.4], [(b12 - a12) + 0.4, 54.362, 24.421, 12.7]], 'hudayriyat', a12 + 0.4, K.hud + 1.0,
    [{ lon: 54.352, lat: 24.4211, t: K.hud, title: 'HUDAYRIYAT', sub: 'WATERFRONT' }],
    t => head(t, 'FOUR', 'HUDAYRIYAT ISLAND', 'AMBITIOUS WATERFRONT', K.num4 - 0.05, { nameT: K.hud - 0.15, subT: K.ambitious - 0.1 }));
  cues.push({ k: 'pin', t: K.hud }, { k: 'wh', t: a12 - 0.1, d: 0.7 });

  const b13 = K.but2 - 0.05;
  add({ id: 'hud_cards', a: b12, b: b13, box: [330, 1270], fn(t) {
    bw(t, 'ON HUDAYRIYAT', 385, K.villas - 1.0, { size: 50, ls: 8, color: C.dim, w: 700 });
    card(t, 'hud', { x: 140, y: 470, w: 800, h: 520, a: b12 + 0.04, out: b13 - 0.3, from: [-250, 50], rot: -1.6, fit: 'cover', fy: 0, zoom: [1, 1.03], chip: 'KHALEEJ TIMES · HUDAYRIYAT',
      focus: [{ bbox: [48, 1200, 1360, 360], t0: b12 + 0.3, t1: b12 + 1.0, zoom: 1.1 }],
      hl: [{ bbox: [48, 1340, 262, 92], t0: K.villas - 0.1, t1: K.villas + 0.5 }, { bbox: [990, 1340, 386, 92], t0: K.beaches - 0.1, t1: K.beaches + 0.5 }] });
    pillRow(t, 'bars', 'SPORTING FACILITIES', 1100, K.sporting - 0.2, { w: 820, h: 104 });
    pillRow(t, 'building', 'MASTER PLANS', 1220, K.master - 0.2, { w: 820, h: 104 });
  } });
  cues.push({ k: 'wh', t: K.villas - 0.3, d: 0.3 }, { k: 'wh', t: K.sporting - 0.2, d: 0.3 }, { k: 'wh', t: K.master - 0.2, d: 0.3 });

  const b14 = K.which - 0.2;
  const GROW = (() => { const o = []; for (let i = 0; i <= 40; i++) { const u = i / 40; o.push([160 + 760 * u, 1010 - 330 * (u * u * 0.7 + u * 0.3) - 10 * Math.sin(u * 9)]); } return o; })();
  add({ id: 'hud_shape', a: b13, b: b14, box: [330, 1270], fn(t) {
    bw(t, 'STILL TAKING SHAPE', 470, K.taking - 0.25, { size: 92, ls: 2, hl: true });
    const gp = ea(t, K.taking, K.develops, E.inOut2);
    if (gp > 0.002) { const hd = strokePoly(GROW, gp, { color: C.gold, w: 9 }); if (hd) { glow(hd.x, hd.y, 60, '233,196,124', 0.5); dot(hd.x, hd.y, 13, C.gold); dot(hd.x, hd.y, 6, '#FFF8E6'); } }
    line(160, 1030, 920, 1030, { color: C.faint, w: 2, alpha: ea(t, K.taking, K.taking + 0.4) });
    bw(t, 'A LONGER INVESTMENT HORIZON', 1130, K.horizon - 0.6, { size: 48, ls: 4, color: C.dim, w: 700 });
    bw(t, 'AS THE COMMUNITY DEVELOPS', 1225, K.develops - 0.9, { size: 56, ls: 2, color: C.gold });
  } });
  cues.push({ k: 'wh', t: K.taking - 0.2, d: 0.35 });

  // ======================================================================= 5. WHICH ONE? (the decision) ================================================
  const b15 = K.that2 - 0.05, b16 = K.because - 0.05;
  add({ id: 'dec1', a: K.that2 - 0.1, b: b16, box: [330, 1270], fn(t) {
    bw(t, 'YOUR CHOICE DEPENDS ON', 410, K.that2 - 0.05, { size: 46, ls: 6, color: C.dim, w: 700 });
    pillRow(t, 'tag', 'YOUR BUDGET', 580, K.budget - 0.2, { w: 820, h: 128 });
    pillRow(t, 'flag', 'YOUR INVESTMENT GOALS', 750, K.goals - 0.2, { w: 820, h: 128 });
    bw(t, 'MOST IMPORTANTLY', 930, K.most - 0.1, { size: 44, ls: 8, color: C.gold, w: 700 });
    bw(t, 'YOUR EXIT STRATEGY', 1060, K.exit - 0.15, { size: 84, ls: 2, hl: true });
  } });
  cues.push({ k: 'wh', t: K.budget - 0.2, d: 0.3 }, { k: 'wh', t: K.goals - 0.2, d: 0.3 }, { k: 'stamp', t: K.exit - 0.1 });

  const b17 = K.im - 0.32;
  add({ id: 'dec2', a: b16, b: b17, box: [330, 1270], fn(t) {
    bw(t, 'MAKING MONEY IN REAL ESTATE', 392, K.because - 0.05, { size: 44, ls: 5, color: C.dim, w: 700 });
    bw(t, 'IS NOT JUST', 470, K.because + 0.5, { size: 44, ls: 8, color: C.dim, w: 700 });
    bw(t, 'WHERE YOU BUY', 600, K.where - 0.1, { size: 96, ls: 2 });
    bw(t, 'IT\'S ALSO', 730, K.also - 0.1, { size: 44, ls: 10, color: C.gold, w: 700 });
    bw(t, 'WHAT YOU BUY', 830, K.what - 0.1, { size: 84, ls: 2 });
    bw(t, 'HOW MUCH YOU PAY', 940, K.how1 - 0.1, { size: 84, ls: 2 });
    bw(t, 'HOW EASILY YOU SELL', 1070, K.easily - 0.1, { size: 72, ls: 2, hl: true });
  } });
  cues.push({ k: 'wh', t: K.where - 0.2, d: 0.3 }, { k: 'wh', t: K.what - 0.2, d: 0.3 }, { k: 'wh', t: K.how1 - 0.2, d: 0.3 }, { k: 'stamp', t: K.easily - 0.1 });

  // ======================================================================= 6. CTA: send me a message ====================================================
  const a18 = K.send - 0.25, send = K.message + 0.3;
  add({ id: 'cta', a: a18, b: DUR, last: true, box: [440, 1280], fn(t) {
    sceneChat(t, { head: 'Send me a message', sub: 'Abdullah Ahli · Abu Dhabi property', show: a18 + 0.2, typeA: K.send - 0.05, typeB: K.message + 0.05, send, msg: 'Hi Abdullah', reply: 'Right opportunity' });
  } });
  cues.push({ k: 'send', t: send });

  // ---- overlays on his face beats ------------------------------------------------------------------------------------------------------------------------
  const OVERLAYS = [
    ovHook([['4 ISLANDS', K.four - 0.05, 'box'], ['IN ABU DHABI', K.abu - 0.05, 'ivory']], { out: FACE_SEGS[0][1] - 0.2, size: 96, y: 330 }),
    ovStamp('WHICH ONE?', K.which, K.choose + 0.6, { y: 400, size: 96 }),
    ovHook([['ABDULLAH AHLI', K.abdullah - 0.05, 'box']], { out: FACE_SEGS[2][1] - 0.15, size: 86, y: 330 }),
  ];
  cues.push({ k: 'stamp', t: K.four - 0.05 }, { k: 'stamp', t: K.abu - 0.05 }, { k: 'stamp', t: K.which }, { k: 'stamp', t: K.abdullah - 0.05 });
  return { FACE_SEGS, PUNCHES, SCENES, OVERLAYS, cues, IMAGES, PIV: [450, 700], FOOT_MAX: 3679 };
}
