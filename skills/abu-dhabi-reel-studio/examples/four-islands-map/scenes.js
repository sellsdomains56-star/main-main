'use strict';
// ---------------------------------------------------------------------------
// "4 key islands in Abu Dhabi" - MAP version. 126 s. One continuous satellite journey is the whole background; he is a small round bubble (top-right) the whole time.
// Whenever he talks about an island the camera flies to it, the island is outlined and its places are called out on the map as he names them, and a frosted checklist
// panel fills row by row ("fully broken down"); real news pages (Wikipedia, Finance Middle East, Khaleej Times) slide in as proof. Safe zone: x 130-950, y 300-1270.
// ---------------------------------------------------------------------------
function buildScenes() {
  const FACE = 'photo';                                                               // 'photo' = small round bubble top-left with his still Instagram portrait; 'video' = the same bubble with the live footage; 'none' = map only
  const SHOW_FACE = FACE !== 'none';
  const cues = [], SCENES = [], tw = (re, n = 0, fb = 0, from = 0) => wt(re, n, fb, from);
  const add = (s) => { SCENES.push(s); return s; };

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

  const FACE_SEGS = [], PUNCHES = [], OVERLAYS = [];                                   // no full-screen face: he is a small round bubble the whole time
  const IMAGES = { louvre: 'assets/louvre.png', gugg: 'assets/gugg.png', fme: 'assets/fme.png', hud: 'assets/hud.png', avatar: 'assets/avatar.png' };
  const POI = {                                                                        // [lon, lat] from OpenStreetMap / Wikipedia
    louvre: [54.3986, 24.5337], gugg: [54.3993, 24.5402], saadBeach: [54.4368, 24.5488],
    ferrari: [54.6099, 24.4841], warner: [54.6004, 24.4920], circuit: [54.6031, 24.4672], seaworld: [54.6190, 24.4859], waterworld: [54.5995, 24.4879], yasMall: [54.6085, 24.4859],
    maryah: [54.3900, 24.5030], reem: [54.4087, 24.4868], hudBeach: [54.3516, 24.4124], surf: [54.3317, 24.4241],
  };
  const ISL = { saadiyat: [54.436, 24.546], yas: [54.603, 24.486], reem: [54.4087, 24.4868], hudayriyat: [54.370, 24.421] };
  const present = (t, a, b) => ea(t, a, a + 0.3) * (1 - ea(t, b, b + 0.3));          // how much a lower-area card is on screen (the checklist panel steps aside)

  // ---- the camera: ONE satellite journey for the whole reel (island centre sits ~190 px above the map centre: room for the panel below)
  const OV = [54.47, 24.488, 11.75, 95], OV2 = [54.47, 24.488, 11.5, 155];   // opening overview / closing overview (smaller, so the checklist panel stays below the islands)
  const keys = [
    camKey(0, ...OV), camKey(K.num1 - 0.9, ...OV),
    camKey(K.num1 + 1.0, 54.436, 24.546, 12.5, 190), camKey(K.louvre - 0.6, 54.436, 24.546, 12.5, 190), camKey(K.gugg + 0.2, 54.4005, 24.5368, 14.0, 150), camKey(K.beach - 0.4, 54.4005, 24.5368, 14.0, 150),
    camKey(K.beach + 1.0, 54.4368, 24.5488, 13.4, 170), camKey(K.wealthy - 0.3, 54.436, 24.546, 12.7, 190), camKey(K.num2 - 0.4, 54.436, 24.546, 12.7, 190),
    camKey(K.num2 + 0.8, 54.52, 24.516, 11.6, 190), camKey(K.yas + 1.2, 54.603, 24.486, 12.5, 190), camKey(K.youve2 - 0.2, 54.603, 24.486, 12.5, 190),
    camKey(K.warner + 0.2, 54.6055, 24.488, 14.0, 150), camKey(K.formula - 0.3, 54.6055, 24.488, 14.0, 150), camKey(K.formula + 0.8, 54.6045, 24.4775, 13.5, 160),
    camKey(K.attract + 0.6, 54.6075, 24.486, 12.9, 190), camKey(K.num3 - 0.6, 54.6075, 24.486, 12.9, 190),
    camKey(K.num3 + 0.7, 54.50, 24.50, 11.6, 190), camKey(K.reem + 1.2, 54.4087, 24.4868, 13.3, 190), camKey(K.financial - 0.4, 54.4087, 24.4868, 13.3, 190), camKey(K.financial + 0.6, 54.3995, 24.4955, 13.1, 190),
    camKey(K.stronger, 54.3995, 24.4955, 13.1, 190), camKey(K.stronger + 1.2, 54.4087, 24.4868, 13.3, 190), camKey(K.num4 - 0.4, 54.4087, 24.4868, 13.3, 190),
    camKey(K.num4 + 0.7, 54.40, 24.45, 11.6, 190), camKey(K.hud + 1.3, 54.370, 24.421, 12.4, 190), camKey(K.villas - 0.6, 54.370, 24.421, 12.4, 190), camKey(K.beaches, 54.3516, 24.4124, 13.6, 170),
    camKey(K.sporting - 0.2, 54.3516, 24.4124, 13.6, 170), camKey(K.sporting + 0.7, 54.3317, 24.4241, 13.8, 170), camKey(K.master + 0.8, 54.370, 24.421, 12.4, 190), camKey(K.which - 0.4, 54.370, 24.421, 12.4, 190),
    camKey(K.which + 1.2, ...OV2),
  ].sort((a, b) => a[0] - b[0]);
  SAT_SCENES.journey = { a: 0, b: DUR, veil: 'top', keys };

  // ---- the face bubble: small, top-left (like the reference), then it grows to the middle for the call to action
  const BUBBLE = !SHOW_FACE ? null : { t0: 0.1, ...(FACE === 'photo' ? { img: 'avatar' } : { src: { cx: 560, cy: 830, size: 640 } }), keys: [{ t: 0, cx: 215, cy: 418, r: 78 }, { t: K.im - 0.4, cx: 215, cy: 418, r: 78 }, { t: K.im + 0.7, cx: 540, cy: 470, r: 125 }] };
  HUD_X = SHOW_FACE ? 330 : SAFE.x0;                                                  // title block: right of the bubble, or at the left edge when there is none

  // ---- the checklist panels ("fully broken down"): what he names, in the order he names it
  const P = (title, a0, a1, items, o = {}) => ({ title, a0, a1, items, ...o });
  const panels = [
    P('SAADIYAT · THE MUSEUMS & BEACH', K.gugg + 3.0, K.wealthy - 0.3, [{ txt: 'LOUVRE ABU DHABI', a: K.louvre }, { txt: 'GUGGENHEIM PROJECT', a: K.gugg }, { txt: 'BEACHFRONT COMMUNITIES', a: K.beach }, { txt: 'EXCLUSIVE PROPERTIES', a: K.excl }]),
    P('SAADIYAT · WHO BUYS', K.wealthy - 0.3, K.num2 - 0.1, [{ txt: 'WEALTHY INTERNATIONAL BUYERS', a: K.wealthy }, { txt: 'PRIVACY', a: K.privacy }, { txt: 'LUXURY', a: K.lux2 }, { txt: 'LONG-TERM VALUE', a: K.longterm }, { txt: 'HIGH-END PROPERTY MARKET', a: K.highend }, { txt: 'WORTH CONSIDERING', a: K.worth, gold: true }]),
    P('YAS · WHAT BRINGS VISITORS', K.youve2 - 0.1, K.but1 - 0.05, [{ txt: 'FERRARI WORLD', a: K.ferrari }, { txt: 'WARNER BROS. WORLD', a: K.warner }, { txt: 'FORMULA ONE CIRCUIT', a: K.formula }, { txt: 'ATTRACTIONS ALL YEAR', a: K.attract }]),
    P('YAS · WHAT IT MEANS FOR INVESTORS', K.tourist - 0.5, K.num3 - 0.1, [{ txt: 'NOT JUST A TOURIST DESTINATION', a: K.tourist }, { txt: 'GROWING RESIDENTIAL COMMUNITY', a: K.resid1, gold: true }, { txt: 'RENTAL INCOME', a: K.rental1 }, { txt: 'HOLIDAY HOMES', a: K.holiday }, { txt: 'POTENTIAL APPRECIATION', a: K.potential }]),
    P('AL REEM · WHY IT WORKS', K.companies - 0.4, K.num4 - 0.1, [{ txt: 'MORE COMPANIES', a: K.companies }, { txt: 'MORE PROFESSIONALS', a: K.profs }, { txt: 'NEED PLACES TO LIVE', a: K.live }, { txt: 'STRONGER DEMAND · APARTMENTS', a: K.stronger }, { txt: 'RENTAL INCOME', a: K.rental2 }, { txt: 'ACCESS TO BUSINESS DISTRICTS', a: K.business }, { txt: 'WORTH EXPLORING', a: K.explore, gold: true }]),
    P('HUDAYRIYAT · WHAT YOU GET', K.villas + 2.4, K.but2 - 0.05, [{ txt: 'AMBITIOUS WATERFRONT DEVELOPMENT', a: K.ambitious }, { txt: 'LUXURY VILLAS', a: K.villas }, { txt: 'BEAUTIFUL BEACHES', a: K.beaches }, { txt: 'WORLD-CLASS SPORTING FACILITIES', a: K.sporting }, { txt: 'MASSIVE RESIDENTIAL MASTER PLANS', a: K.master }]),
    P('HUDAYRIYAT · THE LONG GAME', K.taking - 0.5, K.which - 0.25, [{ txt: 'STILL TAKING SHAPE', a: K.taking, gold: true }, { txt: 'LONGER INVESTMENT HORIZON', a: K.horizon }, { txt: 'OPPORTUNITIES AS IT DEVELOPS', a: K.develops }]),
    P('YOUR CHOICE DEPENDS ON', K.budget - 0.5, K.because - 0.05, [{ txt: 'YOUR BUDGET', a: K.budget }, { txt: 'YOUR INVESTMENT GOALS', a: K.goals }, { txt: 'YOUR EXIT STRATEGY', a: K.exit, gold: true }]),
    P('MAKING MONEY IS ALSO ABOUT', K.where - 0.5, K.im - 0.45, [{ txt: 'WHERE YOU BUY', a: K.where }, { txt: 'WHAT YOU BUY', a: K.what }, { txt: 'HOW MUCH YOU PAY', a: K.how1 }, { txt: 'HOW EASILY YOU CAN SELL', a: K.easily, gold: true }]),
  ];

  // ---- island colours (the same colour follows an island through the whole reel)
  const COL = { saadiyat: ['#6C63FF', '#A79BFF'], yas: ['#2FD8B5', '#93F3DF'], reem: ['#9ED63A', '#DDF47E'], hudayriyat: ['#FF4A3A', '#FFB03C'] };
  const COLS = [
    { key: 'saadiyat', label: ['AL SAADIYAT', 'ISLAND'], wins: [[0.7, K.num1 - 0.3], [K.saad - 0.3, K.num2 - 0.3, 3.4], [K.which + 0.9, K.im - 0.5]] },
    { key: 'yas', label: 'YAS ISLAND', wins: [[1.4, K.num1 - 0.3], [K.yas - 0.3, K.num3 - 0.3, 3.4], [K.which + 1.25, K.im - 0.5]] },
    { key: 'reem', label: ['AL REEM', 'ISLAND'], wins: [[2.1, K.num1 - 0.3], [K.reem - 0.3, K.num4 - 0.3, 3.4], [K.which + 1.6, K.im - 0.5]] },
    { key: 'hudayriyat', label: ['HUDAYRIYAT', 'ISLAND'], wins: [[2.8, K.num1 - 0.3], [K.hud - 0.3, K.which - 0.3, 3.4], [K.which + 1.95, K.im - 0.5]] },
  ].map(c => ({ ...c, c0: COL[c.key][0], c1: COL[c.key][1] }));

  // ---- everything that is drawn over the map
  const top = (t, cam) => {
    // 0. the four islands, each in its own colour with its name written along it (opening, own section, and the closing overview)
    COLS.forEach(c => mapIsland(t, cam, c.key, c.c0, c.c1, c.wins, c.label));
    // 0. the four islands outlined and numbered as he says "four major islands"
    bigTitle(t, '4 KEY ISLANDS', 1180, 0.4, K.num1 - 0.3, { size: 104, sub: 'WHERE TO INVEST' });
    // 1. SAADIYAT
    hudTitle(t, 'NUMBER ONE', 'SAADIYAT ISLAND', 'LUXURY & CULTURE', K.num1 - 0.05, K.num2 - 0.25, COL.saadiyat[1]);
    mapTag(t, cam, { lon: POI.louvre[0], lat: POI.louvre[1], a0: K.louvre - 0.1, a1: K.beach - 0.3, title: 'LOUVRE ABU DHABI', sub: 'MUSEUM', dx: -150, dy: -90 });
    mapTag(t, cam, { lon: POI.gugg[0], lat: POI.gugg[1], a0: K.gugg - 0.1, a1: K.beach - 0.3, title: 'GUGGENHEIM', sub: 'PLANNED MUSEUM', dx: 150, dy: -150 });
    mapTag(t, cam, { lon: POI.saadBeach[0], lat: POI.saadBeach[1], a0: K.beach - 0.1, a1: K.wealthy - 0.2, title: 'BEACHFRONT', sub: 'SAADIYAT BEACH', dx: 0, dy: -110 });
    // 2. YAS
    hudTitle(t, 'NUMBER TWO', 'YAS ISLAND', 'ENTERTAINMENT & LIFESTYLE', K.num2 - 0.05, K.num3 - 0.25, COL.yas[1]);
    mapTag(t, cam, { lon: POI.ferrari[0], lat: POI.ferrari[1], a0: K.ferrari - 0.1, a1: K.attract - 0.2, title: 'FERRARI WORLD', dx: 150, dy: 80 });
    mapTag(t, cam, { lon: POI.warner[0], lat: POI.warner[1], a0: K.warner - 0.1, a1: K.attract - 0.2, title: 'WARNER BROS. WORLD', dx: -90, dy: -95 });
    mapTag(t, cam, { lon: POI.circuit[0], lat: POI.circuit[1], a0: K.formula - 0.1, a1: K.attract - 0.2, title: 'FORMULA ONE CIRCUIT', sub: 'YAS MARINA', dx: 0, dy: 100 });
    mapTag(t, cam, { lon: POI.seaworld[0], lat: POI.seaworld[1], a0: K.attract - 0.1, a1: K.but1, title: 'SEAWORLD', dx: 100, dy: -95 });
    mapTag(t, cam, { lon: POI.waterworld[0], lat: POI.waterworld[1], a0: K.attract + 0.4, a1: K.but1, title: 'YAS WATERWORLD', dx: -130, dy: -105 });
    mapTag(t, cam, { lon: POI.yasMall[0], lat: POI.yasMall[1], a0: K.attract + 0.8, a1: K.but1, title: 'YAS MALL', dx: 80, dy: 105 });
    mapPulse(t, cam, 54.603, 24.486, 2600, K.resid1 - 0.1, K.num3 - 0.3);
    mapTag(t, cam, { lon: 54.603, lat: 24.486, a0: K.resid1, a1: K.num3 - 0.3, title: 'GROWING RESIDENTIAL', sub: 'COMMUNITY', dx: 0, dy: -150 });
    // 3. AL REEM
    hudTitle(t, 'NUMBER THREE', 'AL REEM ISLAND', 'BUSINESS & RENTAL INCOME', K.num3 - 0.05, K.num4 - 0.25, COL.reem[1]);
    mapTag(t, cam, { lon: POI.maryah[0], lat: POI.maryah[1], a0: K.financial - 0.1, a1: K.think + 0.9, title: 'ADGM', sub: 'AL MARYAH · FINANCIAL CENTRE', dx: -60, dy: -120 });
    mapPulse(t, cam, POI.reem[0], POI.reem[1], 1700, K.adgm - 0.1, K.think + 1.0);
    mapTag(t, cam, { lon: POI.reem[0] + 0.004, lat: POI.reem[1] - 0.004, a0: K.adgm, a1: K.think + 1.0, title: 'ADGM EXPANSION', sub: 'ONTO AL REEM', dx: 110, dy: 120 });
    mapFlow(t, cam, POI.maryah, [POI.reem[0], POI.reem[1] - 0.002], K.companies - 0.2, K.stronger - 0.2, { bend: 0.3 });
    mapTag(t, cam, { lon: POI.maryah[0], lat: POI.maryah[1], a0: K.companies, a1: K.stronger - 0.2, title: 'MORE COMPANIES', dx: -70, dy: -110 });
    mapTag(t, cam, { lon: POI.reem[0], lat: POI.reem[1] - 0.002, a0: K.live - 0.2, a1: K.stronger - 0.2, title: 'PLACES TO LIVE', sub: 'PROFESSIONALS MOVE IN', dx: 150, dy: -30 });
    mapPulse(t, cam, POI.reem[0], POI.reem[1], 1300, K.stronger - 0.1, K.num4 - 0.3);
    mapTag(t, cam, { lon: POI.reem[0], lat: POI.reem[1], a0: K.stronger, a1: K.num4 - 0.3, title: 'STRONGER DEMAND', sub: 'APARTMENTS', dx: 60, dy: -140 });
    // 4. HUDAYRIYAT
    hudTitle(t, 'NUMBER FOUR', 'HUDAYRIYAT ISLAND', 'WATERFRONT LIFESTYLE', K.num4 - 0.05, K.which - 0.25, COL.hudayriyat[1]);
    mapTag(t, cam, { lon: POI.hudBeach[0], lat: POI.hudBeach[1], a0: K.beaches - 0.1, a1: K.sporting - 0.2, title: 'HUDAYRIYAT BEACH', dx: 20, dy: -120 });
    mapTag(t, cam, { lon: POI.surf[0], lat: POI.surf[1], a0: K.sporting - 0.1, a1: K.master + 0.3, title: 'SURF ABU DHABI', sub: 'SPORTING FACILITIES', dx: 40, dy: -120 });
    mapBuild(t, cam, 'hudayriyat', K.but2, K.develops);
    // 5. back to the overview: the four islands, numbered
    hudTitle(t, 'WHICH ONE?', 'IT DEPENDS', 'BUDGET · GOALS · EXIT STRATEGY', K.which - 0.05, K.because - 0.25);
    hudTitle(t, 'MAKING MONEY', 'IS NOT JUST WHERE', 'IT\'S WHAT, HOW MUCH & HOW EASILY', K.because - 0.05, K.im - 0.45);
    // 6. the lower-area cards (real news) and the checklist panels
    const cL = present(t, K.louvre - 0.15, K.gugg - 0.1), cG = present(t, K.gugg - 0.1, K.beach - 0.3), cF = present(t, K.financial - 0.1, K.think - 0.1), cK = present(t, K.villas - 0.3, K.villas + 2.4);
    card(t, 'louvre', { x: 150, y: 890, w: 780, h: 340, a: K.louvre - 0.15, out: K.gugg - 0.1, from: [0, 90], rot: -1.2, fit: 'cover', fy: 0, zoom: [1, 1.03], chip: 'WIKIPEDIA · LOUVRE ABU DHABI',
      focus: [{ bbox: [48, 700, 1100, 140], t0: K.louvre - 0.1, t1: K.louvre + 0.4, zoom: 1.0 }], hl: [{ bbox: [112, 732, 274, 38], t0: K.louvre, t1: K.louvre + 0.4 }, { bbox: [545, 786, 218, 38], t0: K.louvre + 0.5, t1: K.louvre + 0.9 }] });
    card(t, 'gugg', { x: 150, y: 890, w: 780, h: 340, a: K.gugg - 0.1, out: K.beach - 0.3, from: [0, 90], rot: 1.2, fit: 'cover', fy: 0, zoom: [1, 1.03], chip: 'WIKIPEDIA · GUGGENHEIM ABU DHABI',
      focus: [{ bbox: [48, 420, 1100, 140], t0: K.gugg - 0.05, t1: K.gugg + 0.4, zoom: 1.0 }], hl: [{ bbox: [112, 438, 363, 38], t0: K.gugg + 0.05, t1: K.gugg + 0.5 }, { bbox: [48, 490, 490, 38], t0: K.project - 0.1, t1: K.project + 0.5 }] });
    card(t, 'fme', { x: 150, y: 890, w: 780, h: 340, a: K.financial - 0.1, out: K.think - 0.1, from: [0, 90], rot: -1.2, fit: 'cover', fy: 0, zoom: [1, 1.03], chip: 'FINANCE MIDDLE EAST · FEB 2025',
      focus: [{ bbox: [210, 240, 1000, 300], t0: K.financial - 0.05, t1: K.financial + 0.5, zoom: 1.1 }], hl: [{ bbox: [210, 245, 160, 66], t0: K.adgm - 0.2, t1: K.adgm + 0.3 }, { bbox: [672, 245, 395, 66], t0: K.onto - 0.1, t1: K.onto + 0.5 }] });
    card(t, 'hud', { x: 150, y: 890, w: 780, h: 340, a: K.villas - 0.3, out: K.villas + 2.4, from: [0, 90], rot: 1.2, fit: 'cover', fy: 0, zoom: [1, 1.03], chip: 'KHALEEJ TIMES · HUDAYRIYAT',
      focus: [{ bbox: [48, 1200, 1360, 360], t0: K.villas - 0.2, t1: K.villas + 0.4, zoom: 1.1 }], hl: [{ bbox: [48, 1340, 262, 92], t0: K.villas - 0.1, t1: K.villas + 0.5 }, { bbox: [990, 1340, 386, 92], t0: K.beaches - 0.1, t1: K.beaches + 0.5 }] });
    const cardOn = Math.max(cL, cG, cF, cK);
    panels.forEach(pn => breakdown(t, { ...pn, alpha: 1 - cardOn }));
    // 7. the end: the map dims, the bubble grows, a message is typed, sent and answered
    const dim = ea(t, K.im - 0.4, K.im + 0.5); if (dim > 0.002) { ctx.save(); ctx.fillStyle = `rgba(8,8,10,${0.62 * dim})`; ctx.fillRect(0, 0, W, H); ctx.restore(); }
    const ce = ea(t, K.im + 0.2, K.im + 0.9, E.out4);
    if (ce > 0.003) {
      ctx.save(); ctx.globalAlpha *= ce; T('ABDULLAH AHLI', CX, 690, { font: F.d(800, 62), ls: 2, color: C.ink }); T('ABU DHABI PROPERTY', CX, 744, { font: F.d(700, 34), ls: 6, color: C.gold }); ctx.restore();
      const send = K.message + 0.3, sent = ea(t, send, send + 0.35), ia = ea(t, K.im + 0.6, K.im + 1.2, E.out4), iy = 1185, X0 = SAFE.x0, X1 = SAFE.x1, BW = X1 - X0, msg = 'Hi Abdullah', typed = msg.slice(0, Math.floor(msg.length * ea(t, K.send - 0.05, K.message + 0.05, E.lin) + 0.0001));
      ctx.save(); ctx.globalAlpha *= ia; rr(X0, iy - 65, BW, 130, 65); ctx.fillStyle = C.panel; ctx.fill(); ctx.strokeStyle = 'rgba(243,239,230,0.28)'; ctx.lineWidth = 3; ctx.stroke();
      T(typed, X0 + 56, iy + 20, { font: F.d(700, 60), color: C.ink, align: 'left', alpha: 1 - sent }); T('Message…', X0 + 56, iy + 20, { font: F.d(700, 60), color: C.mute, align: 'left', alpha: (1 - ea(t, K.send - 0.05, K.send + 0.01)) * (1 - sent) });
      dot(X1 - 66, iy, 48, C.gold); icon('plane', X1 - 66, iy, 20, { p: 1, color: '#17181B', w: 4.5, rot: -0.5 + 0.5 * sent }); ctx.restore();
      const b1 = ea(t, send, send + 0.5, E.out4), b2 = ea(t, send + 0.6, send + 1.1, E.out4);
      if (b1 > 0.002) { ctx.save(); ctx.globalAlpha *= b1; ctx.translate(0, (1 - b1) * 36); const w = M(msg, F.d(700, 58)) + 84; rr(X1 - w, 835, w, 112, 56); ctx.fillStyle = C.gold; ctx.fill(); T(msg, X1 - w / 2, 910, { font: F.d(700, 58), color: '#17181B' }); ctx.restore(); }
      if (b2 > 0.002) { ctx.save(); ctx.globalAlpha *= b2; ctx.translate(0, (1 - b2) * 36); const rp = 'Right opportunity', w = M(rp, F.d(700, 58)) + 140; rr(X0, 965, w, 112, 56); ctx.fillStyle = C.panel; ctx.fill(); ctx.strokeStyle = 'rgba(243,239,230,0.28)'; ctx.lineWidth = 3; ctx.stroke(); icon('check', X0 + 66, 1022, 24, { p: ea(t, send + 0.8, send + 1.2), color: C.gold, w: 5 }); T(rp, X0 + 120, 1042, { font: F.d(700, 58), color: C.ink, align: 'left' }); ctx.restore(); }
    }
  };
  add({ id: 'journey', kind: 'sat', a: 0, b: DUR, last: true, cfg: { top } });
  // name chip under the bubble while he is introduced
  if (SHOW_FACE) OVERLAYS.push(t => { const a = ea(t, 0.5, 1.0) * (1 - ea(t, 4.6, 5.0)); if (a <= 0.003) return; ctx.save(); ctx.globalAlpha *= a; const w = M('ABDULLAH AHLI', F.d(800, 26), 3) + 44; glassPill(130, 514, w, 46, 23); T('ABDULLAH AHLI', 130 + w / 2, 547, { font: F.d(800, 26), ls: 3, color: '#FFFFFF' }); ctx.restore(); });

  // ---- sound: whooshes on the camera moves and the call-outs (very quiet)
  [K.num1, K.louvre - 0.2, K.beach, K.num2, K.youve2, K.num3, K.adgm, K.live, K.num4, K.villas, K.which, K.because].forEach(x => cues.push({ k: 'wh', t: x - 0.1, d: 0.5 }));
  [K.louvre, K.gugg, K.ferrari, K.warner, K.formula, K.financial, K.adgm, K.beaches, K.sporting].forEach(x => cues.push({ k: 'pin', t: x }));
  cues.push({ k: 'send', t: K.message + 0.3 });
  return { FACE_SEGS, PUNCHES, SCENES, OVERLAYS, cues, IMAGES, BUBBLE, FOOT_MAX: 3679 };
}
