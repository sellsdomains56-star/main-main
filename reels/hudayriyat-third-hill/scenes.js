'use strict';
// ---------------------------------------------------------------------------
// "The third hill on Hudayriyat Island" - HeyGen take 5aeb5ed0 (49 s, English), Abdullah Ahli's twin.
// No full-screen face: the map runs from the first frame; his face is the small round bubble top-left.
// Hills: the satellite shows three terraced landforms on Hudayriyat - two side by side on the north part (Modon: villas on hills of 45 and 55 m,
// Nawayef East / West) and a larger one on the southern lobe at the water (marked as the third hill; identified from the imagery, not from a map).
// 65 m, 13,000-40,000 sq ft and "3 of 16 communities" are his figures (shown as "expected" / "reportedly" as he says).  Safe zone: x 130-950, y 300-1420.
// ---------------------------------------------------------------------------
function buildScenes() {
  const cues = [], SCENES = [], tw = (re, n = 0, fb = 0, from = 0) => wt(re, n, fb, from);
  const add = (s) => { SCENES.push(s); return s; };

  const K = {
    priv1: tw(/^COMPLETE$/, 0, 4.08), you1: tw(/^YOU$/, 0, 5.1), neigh: tw(/^NEIGHBORS$/, 0, 7.4), garden: tw(/^GARDEN\.$/, 0, 9.0), but1: tw(/^BUT$/, 0, 9.93), third1: tw(/^THIRD$/, 0, 10.06),
    modon: tw(/^MODON$/, 0, 13.12), terr: tw(/^TERRACED$/, 0, 14.72), every: tw(/^EVERY$/, 0, 16.04), higher1: tw(/^HIGHER$/, 0, 16.84), that1: tw(/^THAT$/, 0, 18.41),
    open: tw(/^OPEN$/, 0, 18.64), more: tw(/^MORE$/, 0, 19.7), roofs: tw(/^ROOFTOPS$/, 0, 21.08), third2: tw(/^THIRD$/, 1, 22.66), m65: tw(/^65$/, 0, 23.82), first2: tw(/^FIRST$/, 0, 25.7),
    beach1: tw(/^BEACH$/, 0, 27.1), now1: tw(/^NOW$/, 0, 28.02), plots1: tw(/^PLOTS$/, 0, 29.31), s13: tw(/^13,000$/, 0, 30.02), s40: tw(/^40,000$/, 0, 31.54), rare: tw(/^RARE\.$/, 0, 33.62),
    out: tw(/^OUT$/, 0, 34.75), n16: tw(/^16$/, 0, 34.96), three: tw(/^THREE$/, 0, 38.28), elev: tw(/^ELEVATION,$/, 0, 41.31), massive: tw(/^MASSIVE$/, 0, 42.11), priv3: tw(/^PRIVACY,$/, 1, 43.0),
    beach2: tw(/^BEACH$/, 1, 44.36), comment: tw(/^COMMENT$/, 0, 46.78), hill: tw(/^HILL$/, 0, 46.96, 46.5),
  };

  const FACE_SEGS = [], PUNCHES = [], OVERLAYS = [], IMAGES = {};
  const GOLD = '#E9C47C', HUD = ['#E9C47C', '#FFE2A8'], RED = '#FF6B5A', SKY = '#A9DEFF';

  const T_H1 = [0, K.but1 - 0.15], T_H2 = [K.but1 - 0.15, K.now1 - 0.15], T_H3 = [K.now1 - 0.15, K.comment - 0.2];
  const rel = (T, t) => t - T[0], dur = T => T[1] - T[0];
  const flight = (id, [a, b], keys) => { SAT_SCENES[id] = { a, b, veil: 'map', keys: keys.map(k => camKey(...k)).sort((p, q) => p[0] - q[0]) }; add({ id, kind: 'sat', a, b, cfg: {} }); return SAT_SCENES[id]; };
  flight('h1', T_H1, [[0, 54.392, 24.395, 12.0, 150, 18], [dur(T_H1) + 0.5, 54.388, 24.39, 12.35, 150, 24]]);
  flight('h2', T_H2, [[0, 54.385, 24.388, 12.6, 150, 26], [1.3, 54.382, 24.381, 13.55, 150, 42], [rel(T_H2, K.third2) - 0.2, 54.382, 24.380, 13.75, 150, 46], [rel(T_H2, K.first2) + 0.3, 54.375, 24.395, 12.95, 170, 30], [dur(T_H2) + 0.5, 54.375, 24.395, 13.0, 170, 30]]);
  flight('h3', T_H3, [[0, 54.38, 24.383, 13.3, 150, 34], [rel(T_H3, K.elev), 54.38, 24.382, 13.6, 150, 40], [dur(T_H3) + 0.5, 54.38, 24.385, 13.3, 150, 34]]);

  const BUBBLE = { t0: 0.1, src: { cx: 562, cy: 820, size: 600 }, keys: [{ t: 0, cx: 215, cy: 418, r: 78 }, { t: K.comment - 0.2, cx: 215, cy: 418, r: 78 }, { t: K.comment + 0.9, cx: 540, cy: 470, r: 125 }] };
  HUD_X = 330;

  const S = id => SCENES.find(s => s.id === id).cfg;
  const PT = GEO.x.points || {}, H1 = PT.hill1 || [54.3631, 24.4134], H2 = PT.hill2 || [54.3827, 24.4091], H3 = PT.hill3 || [54.3819, 24.3782], BCH = PT.beach3 || [54.378, 24.3705];
  const tag = (t, cam, [lon, lat], txt, c, a0, dx = 0, dy = 0, a1 = 0) => {
    const al = ea(t, a0, a0 + 0.35) * (a1 ? 1 - ea(t, a1, a1 + 0.35) : 1); if (al <= 0.003) return;
    const [x, y] = satProj(cam, lon, lat), f = F.d(800, 26), w = M(txt, f, 1.5) + 36, X = Math.max(SAFE.x0, Math.min(SAFE.x1 - w, x + dx - w / 2)), Y = y + dy, e = ea(t, a0, a0 + 0.45, E.back);
    ctx.save(); ctx.globalAlpha *= al; ctx.translate(0, (1 - e) * 14); rr(X, Y - 22, w, 44, 22); ctx.fillStyle = 'rgba(8,8,10,0.8)'; ctx.fill();
    rr(X, Y - 22, 8, 44, 4); ctx.fillStyle = c; ctx.fill(); T(txt, X + w / 2 + 4, Y + 9, { font: f, ls: 1.5, color: '#FFFFFF' }); ctx.restore();
  };
  S('h1').top = (t, cam) => {
    mapArea(t, cam, 'hud', { c: HUD, a0: 0.25, dur: 1.6, on: [0.9, T_H1[1]], labelOn: 1.2, label: 'HUDAYRIYAT ISLAND', sub: 'ABU DHABI', dx: 170, dy: -170, tag: 0 });
    mapScale(t, cam, 0.6, 0);
  };
  S('h2').top = (t, cam) => {
    mapArea(t, cam, 'hud', { c: HUD, a0: T_H2[0] - 2, dur: 0.1, base: 0.45, tag: 0 });
    mapPulse(t, cam, H3[0], H3[1], 1300, K.third1 - 0.1, 0);
    tag(t, cam, H3, 'THE THIRD HILL', GOLD, K.third1 + 0.1, 0, -70);
    mapPulse(t, cam, H1[0], H1[1], 650, K.first2 - 0.2, 0); mapPulse(t, cam, H2[0], H2[1], 650, K.first2 - 0.1, 0);
    tag(t, cam, [(H1[0] + H2[0]) / 2, (H1[1] + H2[1]) / 2], 'THE FIRST TWO HILLS', SKY, K.first2, 0, -64);
    mapLandmark(t, cam, { lon: BCH[0], lat: BCH[1], a0: K.beach1 - 0.1, text: 'PRIVATE BEACH ACCESS', icon: 'dot', side: 'r', dy: 30 });
    mapScale(t, cam, T_H2[0] + 1.3, 0);
  };
  S('h3').top = (t, cam) => {
    mapArea(t, cam, 'hud', { c: HUD, a0: T_H3[0] - 2, dur: 0.1, base: 0.4, tag: 0 });
    mapPulse(t, cam, H3[0], H3[1], 1300, T_H3[0] + 0.2, 0);
    tag(t, cam, H3, 'THE THIRD HILL', GOLD, T_H3[0] + 0.3, 0, -70);
    mapLandmark(t, cam, { lon: BCH[0], lat: BCH[1], a0: K.beach2 - 0.1, text: 'PRIVATE BEACH ACCESS', icon: 'dot', side: 'r', dy: 30 });
  };

  // ---- side-view diagrams: flat rows (the neighbours look in) vs a terraced hillside (each row looks over the roofs below)
  const house = (x, y, s, c, al = 1) => { ctx.save(); ctx.globalAlpha *= al; ctx.beginPath(); ctx.moveTo(x - s, y); ctx.lineTo(x - s, y - s * 0.9); ctx.lineTo(x, y - s * 1.6); ctx.lineTo(x + s, y - s * 0.9); ctx.lineTo(x + s, y); ctx.closePath(); ctx.fillStyle = c; ctx.fill(); ctx.restore(); };
  const dash = (x1, y1, x2, y2, c, p, w = 3) => { if (p <= 0.003) return; ctx.save(); ctx.setLineDash([10, 9]); ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 + (x2 - x1) * p, y1 + (y2 - y1) * p); ctx.strokeStyle = c; ctx.lineWidth = w; ctx.stroke(); ctx.restore(); };
  const flatPanel = (t) => {
    const a0 = K.priv1 - 0.3, a1 = T_H1[1] - 0.15, al = ea(t, a0, a0 + 0.4) * (1 - ea(t, a1, a1 + 0.35)); if (al <= 0.003) return;
    const X = SAFE.x0, Wd = SAFE.w, y0 = 1000, h = 262, gy = y0 + 196;
    ctx.save(); ctx.globalAlpha *= al; ctx.translate(0, (1 - ea(t, a0, a0 + 0.5, E.out4)) * 30); glassPill(X, y0, Wd, h, 28);
    T('MOST VILLAS · SIDE BY SIDE', X + 34, y0 + 46, { font: F.d(800, 26), ls: 5, color: GOLD, align: 'left' });
    line(X + 40, gy, X + Wd - 40, gy, { color: 'rgba(243,239,230,0.35)', w: 3 });
    const xs = [X + 150, X + 410, X + 670];
    xs.forEach((x, i) => { house(x, gy, 46, '#F3EFE6', ea(t, K.you1 - 0.2 + i * 0.15, K.you1 + 0.2 + i * 0.15)); rr(x + 58, gy - 10, 120, 10, 4); ctx.fillStyle = 'rgba(47,216,160,0.75)'; ctx.globalAlpha *= 1; ctx.fill(); });
    const p = ea(t, K.neigh - 0.1, K.neigh + 0.8, E.inOut2); dash(xs[1] - 20, gy - 66, xs[0] + 110, gy - 16, RED, p);
    if (p > 0.97) { ctx.save(); ctx.globalAlpha *= ea(t, K.neigh + 0.7, K.neigh + 1.0); ring(xs[0] + 112, gy - 16, 16, { color: RED, w: 4 }); T('YOUR NEIGHBOUR CAN SEE IN', X + 34, y0 + 84, { font: F.d(800, 22), ls: 2, color: RED, align: 'left' }); ctx.restore(); }
    ctx.restore();
  };
  const terracePanel = (t) => {
    const a0 = K.terr - 0.3, a1 = K.third2 - 0.25, al = ea(t, a0, a0 + 0.4) * (1 - ea(t, a1, a1 + 0.35)); if (al <= 0.003) return;
    const X = SAFE.x0, Wd = SAFE.w, y0 = 960, h = 302, base = y0 + 270, stepW = 170, stepH = 44;
    ctx.save(); ctx.globalAlpha *= al; ctx.translate(0, (1 - ea(t, a0, a0 + 0.5, E.out4)) * 30); glassPill(X, y0, Wd, h, 28);
    T('A TERRACED HILLSIDE', X + 34, y0 + 46, { font: F.d(800, 26), ls: 5, color: GOLD, align: 'left' });
    // the steps rise from right (the beach) to left (the top of the hill)
    ctx.beginPath(); ctx.moveTo(X + Wd - 30, base);
    for (let i = 0; i < 4; i++) { const xr = X + Wd - 30 - i * stepW, yy = base - (i + 1) * stepH; ctx.lineTo(xr, yy); ctx.lineTo(xr - stepW, yy); }
    ctx.lineTo(X + 30, base); ctx.closePath(); const g = ctx.createLinearGradient(0, base - 4 * stepH, 0, base); g.addColorStop(0, 'rgba(233,196,124,0.55)'); g.addColorStop(1, 'rgba(233,196,124,0.12)'); ctx.fillStyle = g; ctx.fill();
    for (let i = 0; i < 4; i++) {
      const e = ea(t, K.every + i * 0.25, K.every + 0.35 + i * 0.25, E.back), xr = X + Wd - 30 - i * stepW - stepW / 2, yy = base - (i + 1) * stepH;
      house(xr, yy, 30 * e, '#F3EFE6', e);
      const vp = ea(t, K.open - 0.1 + i * 0.12, K.open + 0.6 + i * 0.12, E.inOut2); dash(xr + 32, yy - 40, X + Wd - 20, yy - 40 - 26, '#7FE7FF', vp, 2.5);
    }
    ctx.restore();
  };
  const chips = (t, items, a0, a1, yTop) => {
    const al = ea(t, a0, a0 + 0.3) * (1 - ea(t, a1, a1 + 0.35)); if (al <= 0.003) return;
    const X = SAFE.x0, Wd = SAFE.w, gap = 12, w = (Wd - gap * (items.length - 1)) / items.length, h = 64;
    ctx.save(); ctx.globalAlpha *= al;
    items.forEach(([txt, a], i) => { const e = ea(t, a - 0.05, a + 0.35, E.out4); if (e <= 0.003) return; const x = X + i * (w + gap); ctx.save(); ctx.globalAlpha *= e; ctx.translate(0, (1 - e) * 18); glassPill(x, yTop, w, h, 22); T(txt, x + w / 2, yTop + 41, { font: F.d(800, 24), ls: 1, color: '#FFFFFF', sx: Math.min(1, (w - 20) / M(txt, F.d(800, 24), 1)) }); ctx.restore(); });
    ctx.restore();
  };
  // ---- heights: the first two hills (Modon: 45 and 55 m) and the third (65 m, expected)
  const heights = (t) => {
    const a0 = K.third2 - 0.2, a1 = T_H2[1] - 0.2, al = ea(t, a0, a0 + 0.4) * (1 - ea(t, a1, a1 + 0.35)); if (al <= 0.003) return;
    const X = SAFE.x0, Wd = SAFE.w, y0 = 1000, h = 262, base = y0 + 214, k = 2.4;
    ctx.save(); ctx.globalAlpha *= al; ctx.translate(0, (1 - ea(t, a0, a0 + 0.5, E.out4)) * 30); glassPill(X, y0, Wd, h, 28);
    T('HILL HEIGHT', X + 34, y0 + 46, { font: F.d(800, 26), ls: 5, color: GOLD, align: 'left' });
    const bars = [['45 M', 45, SKY, K.first2, 'HILL 1'], ['55 M', 55, SKY, K.first2 + 0.2, 'HILL 2'], ['65 M', 65, GOLD, K.m65, 'THE THIRD HILL']];
    bars.forEach(([lab, v, c, a, name], i) => {
      const e = ea(t, a - 0.05, a + 0.7, E.out3); if (e <= 0.003) return; const x = X + 330 + i * 160, bh = v * k * e;
      ctx.save(); ctx.globalAlpha *= ea(t, a - 0.1, a + 0.2); rr(x, base - bh, 96, bh, 12); ctx.fillStyle = c; ctx.fill();
      T(lab, x + 48, base - bh - 12, { font: F.d(800, 28), color: '#FFFFFF' }); T(name, x + 48, base + 30, { font: F.d(700, 17), ls: 1.5, color: C.dim, sx: Math.min(1, 150 / M(name, F.d(700, 17), 1.5)) }); ctx.restore();
    });
    T('EXPECTED', X + 34, y0 + 120, { font: F.d(800, 40), color: GOLD, align: 'left', alpha: ea(t, K.m65, K.m65 + 0.3) });
    T('65 M · THIRD HILL', X + 34, y0 + 160, { font: F.d(700, 22), ls: 2, color: '#FFFFFF', align: 'left', alpha: ea(t, K.m65, K.m65 + 0.3) });
    T('HILLS 1-2: MODON', X + 34, y0 + 236, { font: F.d(700, 17), ls: 2, color: C.mute, align: 'left', alpha: ea(t, K.first2, K.first2 + 0.3) });
    ctx.restore();
  };
  // ---- plot sizes and "3 of 16"
  const plots = (t) => {
    const a0 = K.plots1 - 0.3, a1 = K.elev - 0.3, al = ea(t, a0, a0 + 0.4) * (1 - ea(t, a1, a1 + 0.35)); if (al <= 0.003) return;
    const X = SAFE.x0, Wd = SAFE.w, y0 = 900, h = 362;
    ctx.save(); ctx.globalAlpha *= al; ctx.translate(0, (1 - ea(t, a0, a0 + 0.5, E.out4)) * 30); glassPill(X, y0, Wd, h, 28);
    T('PLOT SIZES · SQ FT', X + 34, y0 + 46, { font: F.d(800, 26), ls: 5, color: GOLD, align: 'left' });
    const lo = Math.round(13000 * ea(t, K.s13 - 0.05, K.s13 + 0.6, E.out3) / 100) * 100, hi = Math.round(40000 * ea(t, K.s40 - 0.05, K.s40 + 0.7, E.out3) / 100) * 100;
    T(numberStr(lo, 0) + (t > K.s40 - 0.1 ? ' – ' + numberStr(hi, 0) : ''), X + 34, y0 + 124, { font: F.d(800, 66), color: '#FFFFFF', align: 'left', alpha: ea(t, K.s13 - 0.1, K.s13 + 0.2) });
    T('≈1,200 – 3,700 M²', X + 34, y0 + 164, { font: F.d(700, 22), ls: 2, color: C.dim, align: 'left', alpha: ea(t, K.s40 + 0.5, K.s40 + 0.9) });
    line(X + 30, y0 + 190, X + Wd - 30, y0 + 190, { color: 'rgba(243,239,230,0.2)', w: 2, alpha: ea(t, K.out - 0.2, K.out) });
    const ga = ea(t, K.out - 0.2, K.out + 0.3); if (ga > 0.003) {
      ctx.save(); ctx.globalAlpha *= ga;
      for (let i = 0; i < 16; i++) { const e = ea(t, K.n16 + i * 0.04, K.n16 + 0.3 + i * 0.04, E.back), lit = i < 3 && t > K.three - 0.05, x = X + 52 + (i % 8) * 58, y = y0 + 236 + Math.floor(i / 8) * 58; dot(x, y, 19 * e, lit ? GOLD : 'rgba(243,239,230,0.22)'); if (lit) ring(x, y, 25, { color: GOLD, w: 2, alpha: ea(t, K.three, K.three + 0.4) }); }
      T('ONLY 3 OF 16', X + Wd - 34, y0 + 262, { font: F.d(800, 40), color: GOLD, align: 'right', alpha: ea(t, K.three - 0.05, K.three + 0.3) });
      T('COMMUNITIES WITH LAND IN ABU DHABI', X + Wd - 34, y0 + 296, { font: F.d(700, 17), ls: 1.5, color: C.dim, align: 'right', alpha: ea(t, K.three, K.three + 0.3) });
      T('OFFER THIS PLOT SIZE · REPORTEDLY', X + Wd - 34, y0 + 322, { font: F.d(700, 17), ls: 1.5, color: C.dim, align: 'right', alpha: ea(t, K.three + 0.4, K.three + 0.7) });
      ctx.restore();
    }
    ctx.restore();
  };

  const overlay = (t) => {
    hudTitle(t, 'EVEN THE MOST EXPENSIVE VILLAS', 'COMPLETE PRIVACY', 'THE ONE THING THEY STRUGGLE TO OFFER', 0.3, T_H1[1] - 0.1, GOLD);
    hudTitle(t, 'HUDAYRIYAT ISLAND · MODON', 'THE THIRD HILL', 'VILLAS ON A TERRACED HILLSIDE', T_H2[0] + 0.1, K.third2 - 0.2, GOLD);
    hudTitle(t, 'THE THIRD HILL', '65 M · EXPECTED', 'HIGHER THAN THE FIRST TWO HILLS', K.third2 - 0.15, T_H2[1] - 0.1, GOLD);
    hudTitle(t, 'NOW LOOK AT THE LAND', 'MASSIVE PLOTS', '13,000 – 40,000 SQ FT', T_H3[0] + 0.1, K.elev - 0.2, GOLD);
    hudTitle(t, 'ALL IN ONE LOCATION', 'THE THIRD HILL', 'HUDAYRIYAT ISLAND · ABU DHABI', K.elev - 0.15, T_H3[1] - 0.1, GOLD);
    flatPanel(t); terracePanel(t);
    chips(t, [['OPEN VIEWS', K.open], ['MORE PRIVACY', K.more], ['NO ROOFTOPS IN VIEW', K.roofs]], K.open - 0.2, K.third2 - 0.25, 880);
    heights(t); plots(t);
    breakdown(t, { title: 'ALL IN ONE LOCATION', a0: K.elev - 0.3, a1: T_H3[1] - 0.15, items: [{ txt: 'ELEVATION', a: K.elev }, { txt: 'MASSIVE PLOTS', a: K.massive }, { txt: 'PRIVACY', a: K.priv3 }, { txt: 'PRIVATE BEACH ACCESS', a: K.beach2 - 0.3, gold: true }] });

    const ce = ea(t, K.comment + 0.1, K.comment + 0.8, E.out4);
    if (ce > 0.003) {
      ctx.save(); ctx.globalAlpha *= ce; ctx.fillStyle = 'rgba(8,8,10,0.9)'; ctx.fillRect(0, 0, W, H); ctx.restore();
      ctx.save(); ctx.globalAlpha *= ce; T('ABDULLAH AHLI', CX, 690, { font: F.d(800, 62), ls: 2, color: C.ink }); T('PORTFOLIO STRATEGIST', CX, 744, { font: F.d(700, 34), ls: 6, color: C.gold }); ctx.restore();
      const send = K.hill + 0.8, sent = ea(t, send, send + 0.35), ia = ea(t, K.comment + 0.4, K.comment + 0.9, E.out4), iy = 1185, X0 = SAFE.x0, X1 = SAFE.x1, BW = X1 - X0, msg = 'HILL', typed = msg.slice(0, Math.floor(msg.length * ea(t, K.hill - 0.05, K.hill + 0.35, E.lin) + 0.0001));
      ctx.save(); ctx.globalAlpha *= ia; rr(X0, iy - 65, BW, 130, 65); ctx.fillStyle = C.panel; ctx.fill(); ctx.strokeStyle = 'rgba(243,239,230,0.28)'; ctx.lineWidth = 3; ctx.stroke();
      T(typed, X0 + 56, iy + 20, { font: F.d(700, 60), color: C.ink, align: 'left', alpha: 1 - sent }); T('Add a comment…', X0 + 56, iy + 20, { font: F.d(700, 60), color: C.mute, align: 'left', alpha: (1 - ea(t, K.hill - 0.05, K.hill + 0.05)) * (1 - sent) });
      dot(X1 - 66, iy, 48, C.gold); icon('plane', X1 - 66, iy, 20, { p: 1, color: '#17181B', w: 4.5, rot: -0.5 + 0.5 * sent }); ctx.restore();
      const b1 = ea(t, send, send + 0.5, E.out4), b2 = ea(t, send + 0.8, send + 1.3, E.out4);
      if (b1 > 0.002) { ctx.save(); ctx.globalAlpha *= b1; ctx.translate(0, (1 - b1) * 36); const w = M(msg, F.d(700, 58)) + 84; rr(X1 - w, 900, w, 112, 56); ctx.fillStyle = C.gold; ctx.fill(); T(msg, X1 - w / 2, 975, { font: F.d(700, 58), color: '#17181B' }); ctx.restore(); }
      if (b2 > 0.002) { ctx.save(); ctx.globalAlpha *= b2; ctx.translate(0, (1 - b2) * 36); const rp = "Sending you the investor's guide", f = F.d(700, 42), w = Math.min(BW, M(rp, f) + 130); rr(X0, 1030, w, 112, 56); ctx.fillStyle = C.panel; ctx.fill(); ctx.strokeStyle = 'rgba(243,239,230,0.28)'; ctx.lineWidth = 3; ctx.stroke(); icon('check', X0 + 66, 1087, 24, { p: ea(t, send + 1.0, send + 1.4), color: C.gold, w: 5 }); T(rp, X0 + 112, 1102, { font: f, color: C.ink, align: 'left', sx: Math.min(1, (w - 140) / M(rp, f)) }); ctx.restore(); }
    }
    const nm = ea(t, 0.5, 1.0) * (1 - ea(t, 3.4, 3.8));
    if (nm > 0.003) { ctx.save(); ctx.globalAlpha *= nm; const f = F.d(800, 26), w = M('ABDULLAH AHLI', f, 3) + 44; glassPill(130, 514, w, 46, 23); T('ABDULLAH AHLI', 130 + w / 2, 547, { font: f, ls: 3, color: '#FFFFFF' }); ctx.restore(); }
  };
  OVERLAYS.push(overlay);

  [T_H2[0], T_H3[0], K.comment].forEach(x => cues.push({ k: 'wh', t: x - 0.1, d: 0.5 }));
  [K.third1, K.m65, K.three].forEach(x => cues.push({ k: 'pin', t: x }));
  cues.push({ k: 'send', t: K.hill + 0.8 });
  return { FACE_SEGS, PUNCHES, SCENES, OVERLAYS, cues, IMAGES, BUBBLE, FOOT_MAX: 1479 };
}
