'use strict';
// ---------------------------------------------------------------------------
// "Ideal time to invest in Dubai" - MAP version, USD cut (his re-recorded take: figures in US dollars; the AED figures of the source stay as a small second line), 75.0 s. One continuous satellite journey over Dubai is the whole background; Abdullah Ahli is a small round
// live-video bubble (top-left). Every number he says is shown the moment he says it: HUD title (right of the bubble), a frosted panel or a real page as proof
// (Dubai Media Office release of 13 Oct 2026, RTA release on the Blue Line), call-outs on real places (Al Maktoum Airport, the districts of the Blue Line).
// Safe zone: x 130-950, y 300-1270. Facts: Dubai Media Office, 13 Oct 2026 (Mohammed bin Rashid Leadership Forum); RTA / Dubai Media Office 9 Nov 2025.
// ---------------------------------------------------------------------------
function buildScenes() {
  const FACE = 'video';                                                               // 'video' = the live footage in the small circle; 'photo' = still portrait (assets/avatar.png); 'none'
  const SHOW_FACE = FACE !== 'none';
  const cues = [], SCENES = [], tw = (re, n = 0, fb = 0, from = 0) => wt(re, n, fb, from);
  const add = (s) => { SCENES.push(s); return s; };

  // ---- key times (from the spoken words)
  const K = {
    hook: tw(/^WHY$/, 0, 0.2), ideal: tw(/^IDEAL$/, 0, 1.6), dubai1: tw(/^DUBAI\?$/, 0, 2.9),
    cur: tw(/^CURRENTLY$/, 0, 3.7), two1: tw(/^571\.8$/, 0, 4.7), trill: tw(/^BILLION$/, 0, 6.0), under: tw(/^UNDERWAY$/, 0, 7.2),
    half: tw(/^HALF$/, 0, 8.3), one1: tw(/^299\.5$/, 0, 9.8), real: tw(/^REAL$/, 0, 11.6), y2030: tw(/^2030\.$/, 0, 12.3),
    were: tw(/^WE'RE$/, 0, 13.4), h350: tw(/^350,000$/, 0, 15.1), planned: tw(/^PLANNED\.$/, 0, 17.0),
    notall: tw(/^BUT$/, 0, 17.7), alm: tw(/^AL$/, 0, 18.5), airport: tw(/^AIRPORT$/, 0, 19.2), b128: tw(/^34\.9$/, 0, 20.4), cap: tw(/^CAPACITY$/, 0, 23.9), p260: tw(/^260$/, 0, 24.7), year: tw(/^YEAR\.$/, 0, 27.1),
    another: tw(/^ANOTHER$/, 0, 27.4), b100: tw(/^27\.2$/, 0, 27.7), roads: tw(/^ROADS$/, 0, 29.9), metro: tw(/^METRO$/, 0, 30.7), blue1: tw(/^BLUE$/, 0, 32.2), gold: tw(/^GOLD$/, 0, 32.5),
    blue2: tw(/^BLUE$/, 1, 34.0), km30: tw(/^30$/, 0, 35.1), st14: tw(/^14$/, 0, 36.4), sept: tw(/^SEPTEMBER$/, 0, 38.8), y2029: tw(/^2029\.$/, 0, 39.1),
    according: tw(/^ACCORDING$/, 0, 40.5), even: tw(/^EVEN$/, 0, 41.8), coming: tw(/^COMING\.$/, 0, 42.8), describes: tw(/^DESCRIBES$/, 0, 43.6), building: tw(/^BUILDING$/, 0, 44.6),
    idea: tw(/^IDEA$/, 0, 46.7), infra: tw(/^INFRASTRUCTURE,$/, 0, 47.9), biz: tw(/^BUSINESSES,$/, 0, 49.0), room: tw(/^ROOM$/, 0, 50.2), work: tw(/^WORK\.$/, 0, 51.3),
    but2: tw(/^BUT$/, 1, 51.8), investors: tw(/^INVESTORS$/, 0, 52.5), understand: tw(/^UNDERSTAND\.$/, 0, 53.2), just: tw(/^JUST$/, 0, 54.1), growing: tw(/^GROWING$/, 0, 54.9), every: tw(/^EVERY$/, 0, 55.7, 54), invest: tw(/^INVESTMENT\.$/, 0, 56.9),
    those: tw(/^THOSE$/, 0, 57.9, 57), h350b: tw(/^350,000$/, 1, 57.9), compet: tw(/^COMPETITION$/, 0, 60.7), supply: tw(/^SUPPLY\.$/, 0, 61.8),
    which: tw(/^WHICH$/, 0, 62.1), location: tw(/^LOCATION$/, 0, 63.6), developer: tw(/^DEVELOPER$/, 0, 64.7), important: tw(/^IMPORTANT$/, 0, 65.6), ever: tw(/^EVER\.$/, 0, 66.2),
    if1: tw(/^IF$/, 0, 66.4), personally: tw(/^PERSONALLY$/, 0, 67.9), send: tw(/^SEND$/, 0, 69.3), message: tw(/^MESSAGE$/, 0, 70.2), word: tw(/^WORD$/, 0, 70.8), dub2: tw(/^DUBAI\.$/, 0, 71.0),
  };

  const FACE_SEGS = [], PUNCHES = [], OVERLAYS = [];
  const IMAGES = { mo: 'assets/mo.png', rta: 'assets/rta.png', sheikh: 'assets/sheikh.jpg', skyline: 'assets/skyline.jpg', marina: 'assets/marina.jpg', airport: 'assets/airport.jpg', metro: 'assets/metro.jpg', rtasite: 'assets/rtasite.jpg' };
  if (FACE === 'photo') IMAGES.avatar = 'assets/avatar.png';
  const POI = {                                                                        // [lon, lat] (OpenStreetMap / Nominatim; district centres are indicative)
    airport: [55.1595, 24.8863], mirdif: [55.4231, 25.2218], dso: [55.3855, 25.1217], intcity: [55.4128, 25.1754], creek: [55.3604, 25.1980],
  };
  const STN = { creek: [55.3399, 25.2182], harbour: [55.3619, 25.1987], ic: [55.4133, 25.1579], dso: [55.3888, 25.1208], acad: [55.4124, 25.0977], cp: [55.3898, 25.2306] };   // station areas on the OSM alignment
  const present = (t, a, b) => ea(t, a, a + 0.3) * (1 - ea(t, b, b + 0.3));          // how much a lower-area card is on screen (panels step aside)

  // ---- the camera: ONE satellite journey for the whole reel
  const OV = [55.20, 25.12, 10.5, 105], MID = [55.25, 25.17, 11.1, 120], OV2 = [55.26, 25.11, 10.6, 120];
  const keys = [
    camKey(0, ...OV), camKey(K.cur - 0.1, ...OV), camKey(K.cur + 1.6, ...MID), camKey(K.notall - 0.3, ...MID),
    camKey(K.airport + 0.9, 55.1027, 24.8863, 12.2, 170), camKey(K.year, 55.1027, 24.8863, 12.2, 170),
    camKey(K.roads, ...OV2), camKey(K.blue1 + 1.0, ...OV2), camKey(K.blue2 + 1.0, 55.3766, 25.164, 11.3, 185), camKey(K.y2029 + 0.6, 55.3766, 25.164, 11.3, 185),
    camKey(K.coming + 1.0, ...OV), camKey(K.which, ...OV2), camKey(DUR, 55.22, 25.12, 10.8, 105),
  ].sort((a, b) => a[0] - b[0]);
  SAT_SCENES.journey = { a: 0, b: DUR, veil: 'top', keys };

  // ---- the face bubble: small, top-left; grows to the middle for the call to action
  const BUBBLE = !SHOW_FACE ? null : { t0: 0.1, ...(FACE === 'photo' ? { img: 'avatar' } : { src: { cx: 560, cy: 830, size: 640 } }), keys: [{ t: 0, cx: 215, cy: 418, r: 78 }, { t: K.if1 - 0.2, cx: 215, cy: 418, r: 78 }, { t: K.if1 + 0.9, cx: 540, cy: 470, r: 125 }] };
  HUD_X = SHOW_FACE ? 330 : SAFE.x0;

  // ---- frosted checklist panels (rows tick as he says each point)
  const P = (title, a0, a1, items, o = {}) => ({ title, a0, a1, items, ...o });
  const panels = [
    P('AL MAKTOUM INTERNATIONAL AIRPORT', K.alm - 0.4, K.another - 0.1, [{ txt: '$34.9 BILLION INVESTMENT', a: K.b128 }, { txt: 'CAPACITY · UP TO 260 MILLION PASSENGERS A YEAR', a: K.p260 }]),
    P('ROADS & METRO · $27.2 BILLION', K.another - 0.3, K.blue2 - 0.1, [{ txt: 'ROAD UPGRADES', a: K.roads }, { txt: 'NEW METRO LINES', a: K.metro }, { txt: 'BLUE LINE', a: K.blue1 }, { txt: 'GOLD LINE', a: K.gold }]),
    P('THE IDEA', K.idea - 0.4, K.but2 - 0.1, [{ txt: 'MORE INFRASTRUCTURE', a: K.infra }, { txt: 'MORE BUSINESSES', a: K.biz }, { txt: 'MORE ROOM TO LIVE AND WORK', a: K.room, gold: true }]),
    P('INVESTORS NEED TO UNDERSTAND', K.but2 - 0.2, K.those - 0.1, [{ txt: 'DUBAI IS GROWING', a: K.growing }, { txt: 'NOT EVERY PROPERTY IS A GOOD INVESTMENT', a: K.every, gold: true }]),
    P('350,000 PLANNED HOMES MEAN', K.those - 0.1, K.which - 0.1, [{ txt: 'MORE COMPETITION', a: K.compet }, { txt: 'MORE SUPPLY', a: K.supply, gold: true }]),
    P('WHICH IS WHY', K.which - 0.2, K.if1 - 0.15, [{ txt: 'THE RIGHT LOCATION', a: K.location }, { txt: 'THE RIGHT DEVELOPER', a: K.developer }, { txt: 'MORE IMPORTANT THAN EVER', a: K.important, gold: true }]),
  ];

  // ---- everything that is drawn over the map
  const top = (t, cam) => {
    // call-outs on real places
    mapPulse(t, cam, ...POI.airport, 4200, K.airport - 0.1, K.another - 0.2);
    mapTag(t, cam, { lon: POI.airport[0], lat: POI.airport[1], a0: K.alm - 0.1, a1: K.another - 0.2, title: 'AL MAKTOUM', sub: 'INTERNATIONAL AIRPORT', dx: 20, dy: 135 });
    // the Blue Line itself: the real alignment (OpenStreetMap), drawn on as he says "will stretch 30 kilometers"; stations pop up as the line passes them
    mapRoute(t, cam, OUTLINES.blue_main, K.blue2 - 0.1, K.according - 0.3, { dur: 2.6 });
    mapRoute(t, cam, OUTLINES.blue_branch, K.km30 + 0.1, K.according - 0.3, { dur: 1.5 });
    [['CREEK', STN.creek, 'l', 0.15, -14], ['DUBAI CREEK HARBOUR', STN.harbour, 'l', 0.75, 12], ['INTERNATIONAL CITY', STN.ic, 'r', 1.5], ['DUBAI SILICON OASIS', STN.dso, 'l', 1.9], ['ACADEMIC CITY', STN.acad, 'r', 2.5], ['CENTREPOINT', STN.cp, 'r', 2.2]].forEach(([nm, p, side, d, dy]) =>
      mapDot(t, cam, { lon: p[0], lat: p[1], a0: K.blue2 + d, a1: K.according - 0.3, text: nm, side, size: 26, dy: dy || 0 }));

    // HUD title per beat (right of the bubble)
    const cnt = (a, b, v, dec) => numberStr(v * ea(t, a, b, E.out3), dec);
    hudTitle(t, '13 OCTOBER 2026', 'IDEAL TIME TO INVEST?', 'SHEIKH MOHAMMED BIN RASHID', K.hook - 0.1, K.cur - 0.15);
    hudTitle(t, 'DUBAI · PROJECTS UNDER WAY', '$' + cnt(K.cur, K.two1 + 0.5, 571.8, 1) + ' BILLION', 'ACTIVE PROJECTS · AED 2.1 TRILLION', K.cur - 0.05, K.half - 0.2);
    hudTitle(t, 'REAL ESTATE · THROUGH 2030', '$' + cnt(K.half, K.one1 + 0.5, 299.5, 1) + ' BILLION', 'MORE THAN HALF · AED 1.1 TRILLION', K.half - 0.1, K.were - 0.2);
    hudTitle(t, 'HOUSING', cnt(K.were, K.h350 + 0.9, 350000, 0) + ' NEW HOMES', 'PLANNED', K.were - 0.1, K.notall - 0.15);
    hudTitle(t, 'AVIATION', 'AL MAKTOUM AIRPORT', '$' + cnt(K.notall, K.b128 + 0.8, 34.9, 1) + ' BILLION · AED 128 BILLION', K.notall - 0.05, K.another - 0.2, '#8CC8FF');
    hudTitle(t, 'ROADS & METRO', '$' + cnt(K.another, K.b100 + 0.6, 27.2, 1) + ' BILLION', 'AED 100 BILLION · BLUE AND GOLD LINES', K.another - 0.1, K.blue2 - 0.15);
    hudTitle(t, 'METRO BLUE LINE', cnt(K.blue2, K.km30 + 0.5, 30, 0) + ' KM' + (t > K.st14 - 0.4 ? ' · ' + cnt(K.st14 - 0.4, K.st14 + 0.5, 14, 0) + ' STATIONS' : ''), 'OPENING SEPTEMBER 2029', K.blue2 - 0.05, K.according - 0.15, '#8CC8FF');
    hudTitle(t, 'SHEIKH MOHAMMED', 'MORE TO COME', 'MORE PROJECTS TO BE ANNOUNCED', K.according - 0.05, K.describes - 0.15);
    hudTitle(t, 'HIS WORDS', 'A CITY WITHIN A CITY', null, K.describes - 0.05, K.idea - 0.15);
    hudTitle(t, 'THE IDEA', 'SIMPLE: MORE ROOM', 'TO LIVE AND WORK', K.idea - 0.05, K.but2 - 0.15);
    hudTitle(t, 'INVESTORS NEED TO UNDERSTAND', 'NOT EVERY PROPERTY', 'IS A GOOD INVESTMENT', K.but2 - 0.05, K.those - 0.15);
    hudTitle(t, 'PLANNED HOMES', '350,000', 'MORE SUPPLY · MORE COMPETITION', K.those - 0.05, K.which - 0.15);
    hudTitle(t, 'WHICH IS WHY', 'LOCATION & DEVELOPER', 'MATTER MORE THAN EVER', K.which - 0.05, K.if1 - 0.25);

    // lower area: real pages (proof) ...
    const cA = present(t, 0.45, K.half - 0.2), cB = present(t, K.according - 0.1, K.idea - 0.1), cC = present(t, K.blue2 - 0.15, K.st14 + 1.0), cD = present(t, K.st14 + 1.0, K.according - 0.1);
    const mk = (b, t0, t1) => ({ bbox: b, t0, t1 });
    card(t, 'mo', { x: 150, y: 890, w: 780, h: 340, a: 0.45, out: K.half - 0.2, from: [0, 90], rot: -1.2, fit: 'cover', fy: 0, zoom: [1, 1.03], chip: 'DUBAI MEDIA OFFICE · 13 OCT · FIGURES IN AED',
      focus: [{ bbox: [0, 5040, 1440, 240], t0: K.hook, t1: K.hook + 0.5, zoom: 1.0 }, { bbox: [0, 4800, 1440, 200], t0: K.cur + 0.4, t1: K.two1 - 0.2, zoom: 1.0 }],
      hl: [mk([607, 5110, 795, 52], K.ideal - 0.1, K.dubai1), mk([37, 5178, 384, 52], K.dubai1 - 0.1, K.dubai1 + 0.4), mk([1251, 4839, 152, 52], K.two1 - 0.1, K.two1 + 0.4), mk([35, 4906, 754, 52], K.trill - 0.1, K.under)] });
    card(t, 'mo', { x: 150, y: 890, w: 780, h: 340, a: K.according - 0.1, out: K.idea - 0.1, from: [0, 90], rot: 1.2, fit: 'cover', fy: 0, zoom: [1, 1.03], chip: 'DUBAI MEDIA OFFICE · 13 OCT',
      focus: [{ bbox: [0, 4880, 1440, 200], t0: K.according - 0.05, t1: K.even, zoom: 1.0 }, { bbox: [0, 4850, 1440, 200], t0: K.describes, t1: K.building, zoom: 1.0 }],
      hl: [mk([921, 4906, 481, 52], K.even - 0.1, K.coming), mk([37, 4974, 469, 52], K.coming - 0.4, K.coming + 0.3), mk([256, 4839, 614, 52], K.building - 0.1, K.building + 1.2)] });
    card(t, 'rta', { x: 150, y: 890, w: 780, h: 340, a: K.blue2 - 0.15, out: K.st14 + 1.0, from: [0, 90], rot: -1.2, fit: 'cover', fy: 0, zoom: [1, 1.03], chip: 'RTA · DUBAI MEDIA OFFICE',
      focus: [{ bbox: [0, 3050, 1440, 140], t0: K.blue2 - 0.05, t1: K.blue2 + 0.4, zoom: 1.0 }, ],
      hl: [mk([1215, 3036, 187, 52], K.km30 - 0.1, K.km30 + 0.5), mk([37, 3105, 651, 52], K.km30 + 0.3, K.st14 + 0.8)] });
    card(t, 'rtasite', { x: 150, y: 890, w: 780, h: 340, a: K.st14 + 1.0, out: K.according - 0.1, from: [0, 90], rot: 1.2, fit: 'cover', fx: 0.5, fy: 0.42, zoom: [1, 1.06], chip: 'RTA · BLUE LINE SITE' });
        // real-life photos on the map band (left side), each with the credit on its chip
    const ph = (id, a, out, o = {}) => card(t, id, { x: 140, y: 595, w: 340, h: 232, a, out, from: [-90, 0], rot: -2, fit: 'cover', zoom: [1, 1.07], ...o });
    ph('skyline', K.cur - 0.1, K.half - 0.2, { chip: 'DUBAI SKYLINE · COMMONS' });
    ph('marina', K.were - 0.1, K.notall - 0.15, { chip: 'DUBAI MARINA · COMMONS', fx: 0.6 });
    ph('airport', K.notall, K.another - 0.2, { chip: 'AL MAKTOUM · COMMONS', fx: 0.3 });
    ph('metro', K.another - 0.1, K.blue2 - 0.2, { chip: 'DUBAI METRO · COMMONS', fx: 0.35 });
    ph('skyline', K.describes - 0.1, K.but2 - 0.2, { chip: 'CREEK HARBOUR · COMMONS' });
    ph('marina', K.those - 0.1, K.which - 0.2, { chip: 'DUBAI MARINA · COMMONS', fx: 0.6 });
    badge(t, 'sheikh', 760, 690, 105, 0.35, 'SHEIKH MOHAMMED', { out: K.cur - 0.15, fx: 0.5, fy: 0.22, zoom: 1.5 });
    const cardOn = Math.max(cA, cB, cC, cD);

    // ... and the two custom panels: real estate share (bar) and the homes counter
    const pa = (a0, a1) => ea(t, a0, a0 + 0.4, E.out3) * (1 - ea(t, a1, a1 + 0.4)) * (1 - cardOn);
    const rea = pa(K.half - 0.3, K.were - 0.1);
    if (rea > 0.003) {
      const X = SAFE.x0, Wd = SAFE.w, h = 300, y0 = 1262 - h, bx = X + 34, bw = Wd - 68, by = y0 + 86, bh = 70, g = ea(t, K.one1 - 0.2, K.one1 + 1.2, E.out3), gw = bw * (299.5 / 571.8) * g;
      ctx.save(); ctx.globalAlpha *= rea; ctx.translate(0, (1 - ea(t, K.half - 0.3, K.half + 0.2, E.out4)) * 36); glassPill(X, y0, Wd, h, 28);
      T('REAL ESTATE · THROUGH 2030', X + 34, y0 + 42, { font: F.d(800, 28), ls: 7, color: C.gold, align: 'left' });
      rr(bx, by, bw, bh, 16); ctx.fillStyle = 'rgba(243,239,230,0.13)'; ctx.fill();
      if (gw > 2) { rr(bx, by, Math.max(gw, 32), bh, 16); ctx.fillStyle = C.gold; ctx.fill(); }
      T('$299.5 BILLION', bx + 24, by + 47, { font: F.d(800, 36), ls: 1, color: '#0A0A0B', align: 'left', alpha: ea(t, K.one1 + 0.5, K.one1 + 1.0) });
      T('OTHER PROJECTS', bx + bw - 22, by + 47, { font: F.d(700, 30), ls: 2, color: C.dim, align: 'right', alpha: ea(t, K.one1 + 0.8, K.one1 + 1.3) });
      T('MORE THAN HALF OF $571.8 BILLION', X + 34, y0 + 218, { font: F.d(800, 38), ls: 1, color: C.ink, align: 'left', alpha: ea(t, K.half, K.half + 0.5) });
      T('AED 1.1 TRILLION OF AED 2.1 TRILLION', X + 34, y0 + 266, { font: F.d(700, 30), ls: 2, color: C.dim, align: 'left', alpha: ea(t, K.real - 0.2, K.real + 0.3) });
      ctx.restore();
    }
    const hma = pa(K.were - 0.3, K.notall - 0.1);
    if (hma > 0.003) {
      const X = SAFE.x0, Wd = SAFE.w, h = 300, y0 = 1262 - h, n = ea(t, K.h350 - 0.2, K.h350 + 1.1, E.out3);
      ctx.save(); ctx.globalAlpha *= hma; ctx.translate(0, (1 - ea(t, K.were - 0.3, K.were + 0.2, E.out4)) * 36); glassPill(X, y0, Wd, h, 28);
      T('HOUSING · PLANNED', X + 34, y0 + 42, { font: F.d(800, 28), ls: 7, color: C.gold, align: 'left' });
      T(numberStr(Math.round(350000 * n), 0), CX, y0 + 164, { font: F.d(800, 116), ls: 2, color: C.ink });
      T('NEW HOMES BEING PLANNED', CX, y0 + 216, { font: F.d(800, 34), ls: 6, color: C.gold });
      for (let i = 0; i < 9; i++) { const e = ea(t, K.h350 + 0.1 + i * 0.09, K.h350 + 0.6 + i * 0.09, E.back); if (e > 0.01) icon('house', X + 80 + i * ((Wd - 160) / 8), y0 + 262, 21 * e, { p: 1, color: i % 3 === 1 ? C.gold : C.goldSoft, w: 3.5 }); }
      ctx.restore();
    }
    panels.forEach(pn => breakdown(t, { ...pn, alpha: 1 - cardOn }));

    // the end: the map dims, the bubble grows, "Dubai" is typed, sent and answered
    const dim = ea(t, K.if1 - 0.2, K.if1 + 0.6); if (dim > 0.002) { ctx.save(); ctx.fillStyle = `rgba(8,8,10,${0.62 * dim})`; ctx.fillRect(0, 0, W, H); ctx.restore(); }
    const ce = ea(t, K.if1 + 0.3, K.if1 + 1.0, E.out4);
    if (ce > 0.003) {
      ctx.save(); ctx.globalAlpha *= ce; T('ABDULLAH AHLI', CX, 690, { font: F.d(800, 62), ls: 2, color: C.ink }); T('PORTFOLIO STRATEGIST', CX, 744, { font: F.d(700, 34), ls: 6, color: C.gold }); ctx.restore();
      const send = K.dub2 + 0.6, sent = ea(t, send, send + 0.35), ia = ea(t, K.if1 + 0.8, K.if1 + 1.4, E.out4), iy = 1185, X0 = SAFE.x0, X1 = SAFE.x1, BW = X1 - X0, msg = 'Dubai', typed = msg.slice(0, Math.floor(msg.length * ea(t, K.word - 0.1, K.dub2 + 0.1, E.lin) + 0.0001));
      ctx.save(); ctx.globalAlpha *= ia; rr(X0, iy - 65, BW, 130, 65); ctx.fillStyle = C.panel; ctx.fill(); ctx.strokeStyle = 'rgba(243,239,230,0.28)'; ctx.lineWidth = 3; ctx.stroke();
      T(typed, X0 + 56, iy + 20, { font: F.d(700, 60), color: C.ink, align: 'left', alpha: 1 - sent }); T('Message…', X0 + 56, iy + 20, { font: F.d(700, 60), color: C.mute, align: 'left', alpha: (1 - ea(t, K.word - 0.1, K.word + 0.0)) * (1 - sent) });
      dot(X1 - 66, iy, 48, C.gold); icon('plane', X1 - 66, iy, 20, { p: 1, color: '#17181B', w: 4.5, rot: -0.5 + 0.5 * sent }); ctx.restore();
      const b1 = ea(t, send, send + 0.5, E.out4), b2 = ea(t, send + 0.8, send + 1.3, E.out4);
      if (b1 > 0.002) { ctx.save(); ctx.globalAlpha *= b1; ctx.translate(0, (1 - b1) * 36); const w = M(msg, F.d(700, 58)) + 84; rr(X1 - w, 835, w, 112, 56); ctx.fillStyle = C.gold; ctx.fill(); T(msg, X1 - w / 2, 910, { font: F.d(700, 58), color: '#17181B' }); ctx.restore(); }
      if (b2 > 0.002) { ctx.save(); ctx.globalAlpha *= b2; ctx.translate(0, (1 - b2) * 36); const rp = "Here's where I'd look", w = M(rp, F.d(700, 58)) + 140; rr(X0, 965, w, 112, 56); ctx.fillStyle = C.panel; ctx.fill(); ctx.strokeStyle = 'rgba(243,239,230,0.28)'; ctx.lineWidth = 3; ctx.stroke(); icon('check', X0 + 66, 1022, 24, { p: ea(t, send + 1.0, send + 1.4), color: C.gold, w: 5 }); T(rp, X0 + 120, 1042, { font: F.d(700, 58), color: C.ink, align: 'left' }); ctx.restore(); }
    }
  };
  add({ id: 'journey', kind: 'sat', a: 0, b: DUR, last: true, cfg: { top } });
  // name chip under the bubble while he is introduced
  if (SHOW_FACE) OVERLAYS.push(t => { const a = ea(t, 0.5, 1.0) * (1 - ea(t, 3.6, 4.0)); if (a <= 0.003) return; ctx.save(); ctx.globalAlpha *= a; const w = M('ABDULLAH AHLI', F.d(800, 26), 3) + 44; glassPill(130, 514, w, 46, 23); T('ABDULLAH AHLI', 130 + w / 2, 547, { font: F.d(800, 26), ls: 3, color: '#FFFFFF' }); ctx.restore(); });

  // ---- sound: whooshes on the beat changes and call-outs (very quiet)
  [K.cur, K.half, K.were, K.notall, K.another, K.blue2, K.according, K.idea, K.but2, K.those, K.which].forEach(x => cues.push({ k: 'wh', t: x - 0.1, d: 0.5 }));
  [K.alm, K.blue2 + 0.2].forEach(x => cues.push({ k: 'pin', t: x }));
  cues.push({ k: 'send', t: K.dub2 + 0.6 });
  return { FACE_SEGS, PUNCHES, SCENES, OVERLAYS, cues, IMAGES, BUBBLE, FOOT_MAX: 2158 };
}
