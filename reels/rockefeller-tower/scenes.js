'use strict';
// ---------------------------------------------------------------------------
// "Rockefeller Business Tower, Sheikh Zayed Road" - HeyGen take 597dfab3 (45 s, English), Abdullah Ahli's twin.
// No full-screen face: the map runs from the first frame (Esri satellite, OSM geometry via mapfx.js); his face is the small round bubble top-left.
// The tower: Christian A. Rockefeller Business Tower by LMD, Sheikh Zayed Road, Business Bay side (25.1946 N, 55.2653 E; PropSearch + Viara pages agree).
// Prices, office types and the payment plan are exactly what he says (20% + 4% DLD, 5% every 6 months, 50% on handover = 50/50). Safe zone: x 130-950, y 300-1420.
// ---------------------------------------------------------------------------
function buildScenes() {
  const cues = [], SCENES = [], tw = (re, n = 0, fb = 0, from = 0) => wt(re, n, fb, from);
  const add = (s) => { SCENES.push(s); return s; };

  const K = {
    szr1: tw(/^SHEIKH$/, 0, 1.38), prices1: tw(/^PRICES$/, 0, 2.56), rock: tw(/^ROCKEFELLER$/, 0, 4.42), office: tw(/^OFFICE$/, 0, 5.83), below: tw(/^BELOW$/, 0, 6.6), m44: tw(/^4\.4$/, 0, 6.9),
    p4000: tw(/^4,000$/, 0, 9.7), p4600: tw(/^4,600$/, 0, 10.66), you1: tw(/^YOU$/, 0, 13.02), indiv: tw(/^INDIVIDUAL$/, 0, 13.58), half: tw(/^HALF$/, 0, 14.88), entire: tw(/^ENTIRE$/, 0, 15.84),
    but: tw(/^BUT$/, 0, 17.09), plan: tw(/^PAYMENT$/, 0, 18.36), fifty: tw(/^50-50\.$/, 0, 19.0), up20: tw(/^20%$/, 0, 20.1), dld: tw(/^4%$/, 0, 21.78), p5: tw(/^5%$/, 0, 23.6), six: tw(/^6$/, 0, 24.56),
    rem50: tw(/^50%$/, 0, 25.9), handover: tw(/^HANDOVER\.$/, 0, 26.74), special: tw(/^SPECIAL$/, 0, 28.08), now1: tw(/^NOW$/, 0, 30.96), loc: tw(/^LOCATION$/, 0, 31.38), design: tw(/^DESIGN$/, 0, 33.5),
    brands: tw(/^BRANDS$/, 0, 34.68), this1: tw(/^THIS$/, 0, 37.09), want: tw(/^WANT$/, 0, 40.44), comment: tw(/^COMMENT$/, 0, 43.05), report: tw(/^REPORT$/, 0, 43.22),
  };

  const FACE_SEGS = [], PUNCHES = [], OVERLAYS = [], IMAGES = {};
  const GOLD = '#E9C47C', BLUE = ['#3DB2FF', '#A9DEFF'], TEAL = ['#2FD8A0', '#A6F3D6'], VIO = ['#8C7BFF', '#CFC6FF'];

  const T_R1 = [0, K.office - 0.15], T_R2 = [K.office - 0.15, K.but - 0.15], T_R3 = [K.but - 0.15, K.now1 - 0.15], T_R4 = [K.now1 - 0.15, K.comment - 0.2];
  const dur = T => T[1] - T[0];
  const flight = (id, [a, b], keys) => { SAT_SCENES[id] = { a, b, veil: 'map', keys: keys.map(k => camKey(...k)).sort((p, q) => p[0] - q[0]) }; add({ id, kind: 'sat', a, b, cfg: {} }); return SAT_SCENES[id]; };
  const TW = [55.2653, 25.1946];
  flight('r1', T_R1, [[0, 55.236, 25.163, 13.0, 120, 30], [K.rock - 0.3, 55.2653, 25.1946, 14.5, 130, 44], [dur(T_R1) + 0.5, 55.2655, 25.1948, 14.7, 140, 46]]);
  flight('r2', T_R2, [[0, 55.2655, 25.1948, 14.8, 170, 46], [dur(T_R2) + 0.5, 55.2662, 25.1952, 15.05, 170, 50]]);
  flight('r3', T_R3, [[0, 55.2662, 25.1952, 14.6, 120, 40], [dur(T_R3) + 0.5, 55.2668, 25.1958, 14.4, 120, 42]]);
  flight('r4', T_R4, [[0, 55.2668, 25.1958, 14.4, 150, 40], [1.4, 55.2705, 25.2005, 14.0, 150, 38], [dur(T_R4) + 0.5, 55.2712, 25.2012, 14.1, 150, 40]]);

  const BUBBLE = { t0: 0.1, src: { cx: 562, cy: 820, size: 600 }, keys: [{ t: 0, cx: 215, cy: 418, r: 78 }, { t: K.comment - 0.2, cx: 215, cy: 418, r: 78 }, { t: K.comment + 0.9, cx: 540, cy: 470, r: 125 }] };
  HUD_X = 330;

  const S = id => SCENES.find(s => s.id === id).cfg;
  const PT = GEO.x.points || {}, BK = PT.burj_khalifa || [55.27413, 25.19703];
  // the tower marker: a glowing beam standing on its plot (a marker, not to scale)
  const beam = (t, cam, a0, h = 150) => {
    const al = ea(t, a0, a0 + 0.5); if (al <= 0.003) return;
    const [x, y] = satProj(cam, TW[0], TW[1]), e = ea(t, a0, a0 + 0.9, E.out4), hh = h * e;
    ctx.save(); ctx.globalAlpha *= al; glow(x, y, 70, '233,196,124', 0.35);
    const g = ctx.createLinearGradient(0, y - hh, 0, y); g.addColorStop(0, 'rgba(233,196,124,0)'); g.addColorStop(0.35, 'rgba(255,226,168,0.85)'); g.addColorStop(1, '#FFE2A8');
    rr(x - 5, y - hh, 10, hh, 5); ctx.fillStyle = g; ctx.fill(); dot(x, y, 9, '#FFFFFF'); ring(x, y, 16 + 6 * Math.sin(t * 3), { color: GOLD, w: 2.5, alpha: 0.7 }); ctx.restore();
  };
  const towerTag = (t, cam, a0, txt, left = false) => {
    const al = ea(t, a0, a0 + 0.35); if (al <= 0.003) return;
    const [x, y] = satProj(cam, TW[0], TW[1]), f = F.d(800, 26), w = M(txt, f, 1.5) + 40, X = left ? Math.max(SAFE.x0, x - 28 - w) : Math.min(SAFE.x1 - w, x + 28), Y = y - 120, e = ea(t, a0, a0 + 0.45, E.back);
    ctx.save(); ctx.globalAlpha *= al; ctx.translate(0, (1 - e) * 14); rr(X, Y - 24, w, 48, 24); ctx.fillStyle = 'rgba(8,8,10,0.8)'; ctx.fill(); rr(X, Y - 24, 8, 48, 4); ctx.fillStyle = GOLD; ctx.fill();
    T(txt, X + w / 2 + 4, Y + 9, { font: f, ls: 1.5, color: '#FFFFFF' }); ctx.restore();
  };
  S('r1').top = (t, cam) => {
    mapRoad(t, cam, 'E11', { a0: 0.3, dur: 1.8, hi: 0.8, shields: [[55.248, 25.177], [55.255, 25.184]] });
    mapLandmark(t, cam, { lon: BK[0], lat: BK[1], a0: 1.6, text: 'BURJ KHALIFA', icon: 'tower', side: 'r', dy: -30 });
    beam(t, cam, K.rock - 0.4); towerTag(t, cam, K.rock, 'ROCKEFELLER TOWER');
  };
  S('r2').top = (t, cam) => { mapRoad(t, cam, 'E11', { a0: T_R2[0] - 1, dur: 0.1, alpha: 0.85, name: '' }); beam(t, cam, T_R2[0] - 1, 170); towerTag(t, cam, T_R2[0] - 1, 'ROCKEFELLER TOWER'); };
  S('r3').top = (t, cam) => { mapRoad(t, cam, 'E11', { a0: T_R3[0] - 1, dur: 0.1, alpha: 0.7, name: '' }); beam(t, cam, T_R3[0] - 1, 150); };
  S('r4').top = (t, cam) => {
    mapRoad(t, cam, 'E11', { a0: T_R4[0], dur: 1.2, hi: 0.9, shields: [[55.262, 25.19], [55.279, 25.209]] });
    mapArea(t, cam, 'difc', { c: BLUE, a0: K.loc + 0.2, on: [K.loc + 0.3, K.design], label: 'DIFC', dx: 120, dy: -130, tag: 0.95 });
    mapArea(t, cam, 'downtown', { c: VIO, a0: K.loc + 0.5, on: [K.loc + 0.6, K.design], label: 'DOWNTOWN', dx: 190, dy: 30, tag: 0.95 });
    mapArea(t, cam, 'bbay', { c: TEAL, a0: K.loc + 0.8, on: [K.loc + 0.9, K.design], label: 'BUSINESS BAY', dx: -170, dy: 80, tag: 0.95 });
    beam(t, cam, T_R4[0] + 0.2, 130); towerTag(t, cam, K.loc - 0.1, 'ROCKEFELLER TOWER', true);
    mapScale(t, cam, T_R4[0] + 1.2, 0);
  };

  // ---- price: "below AED 4.4 million", "AED 4,000 - 4,600 per sq ft"
  const pricePanel = (t) => {
    const a0 = K.office - 0.2, a1 = K.you1 - 0.3, al = ea(t, a0, a0 + 0.4) * (1 - ea(t, a1, a1 + 0.35)); if (al <= 0.003) return;
    const X = SAFE.x0, Wd = SAFE.w, y0 = 1010, h = 252;
    ctx.save(); ctx.globalAlpha *= al; ctx.translate(0, (1 - ea(t, a0, a0 + 0.5, E.out4)) * 30); glassPill(X, y0, Wd, h, 28);
    T('OFFICES FROM', X + 34, y0 + 46, { font: F.d(800, 26), ls: 6, color: GOLD, align: 'left' });
    const e1 = ea(t, K.m44 - 0.1, K.m44 + 0.8, E.out3);
    T('BELOW AED ' + (4.4 * e1).toFixed(1) + 'M', X + 34, y0 + 116, { font: F.d(800, 62), color: '#FFFFFF', align: 'left', alpha: ea(t, K.below - 0.1, K.below + 0.2) });
    line(X + 30, y0 + 146, X + Wd - 30, y0 + 146, { color: 'rgba(243,239,230,0.2)', w: 2 });
    T('PER SQ FT', X + 34, y0 + 186, { font: F.d(800, 24), ls: 5, color: GOLD, align: 'left', alpha: ea(t, K.p4000 - 0.2, K.p4000 + 0.2) });
    const lo = Math.round(4000 * ea(t, K.p4000 - 0.05, K.p4000 + 0.6, E.out3) / 10) * 10, hi = Math.round(4600 * ea(t, K.p4600 - 0.05, K.p4600 + 0.6, E.out3) / 10) * 10;
    T('AED ' + numberStr(lo, 0) + (t > K.p4600 - 0.1 ? ' – ' + numberStr(hi, 0) : ''), X + 34, y0 + 232, { font: F.d(800, 44), color: '#FFFFFF', align: 'left', alpha: ea(t, K.p4000 - 0.1, K.p4000 + 0.2) });
    ctx.restore();
  };
  // ---- the three office formats: a floor of 4 bays, lit 1 / 2 / 4
  const formats = (t) => {
    const a0 = K.you1 - 0.25, a1 = T_R2[1] - 0.2, al = ea(t, a0, a0 + 0.4) * (1 - ea(t, a1, a1 + 0.35)); if (al <= 0.003) return;
    const items = [['INDIVIDUAL OFFICES', 1, K.indiv], ['HALF FLOORS', 2, K.half], ['ENTIRE FLOORS', 4, K.entire]];
    const X = SAFE.x0, Wd = SAFE.w, h = 82, gap = 14, y0 = 1262 - 3 * h - 2 * gap;
    ctx.save(); ctx.globalAlpha *= al;
    items.forEach(([txt, n, a], i) => {
      const e = ea(t, a - 0.1, a + 0.4, E.out4); if (e <= 0.003) return;
      const y = y0 + i * (h + gap); ctx.save(); ctx.globalAlpha *= e; ctx.translate((1 - e) * -30, 0); glassPill(X, y, Wd, h, 24);
      for (let k = 0; k < 4; k++) { rr(X + 30 + k * 46, y + 24, 40, h - 48, 6); ctx.fillStyle = k < n ? GOLD : 'rgba(243,239,230,0.14)'; ctx.fill(); }
      T(txt, X + 236, y + h / 2 + 12, { font: F.d(800, 34), ls: 1, color: '#FFFFFF', align: 'left' });
      ctx.restore();
    });
    ctx.restore();
  };
  // ---- the payment plan: 20% upfront (+4% DLD) -> 5% every 6 months (x6) -> 50% on handover
  const planPanel = (t) => {
    const a0 = K.plan - 0.3, a1 = T_R3[1] - 0.2, al = ea(t, a0, a0 + 0.4) * (1 - ea(t, a1, a1 + 0.35)); if (al <= 0.003) return;
    const X = SAFE.x0, Wd = SAFE.w, y0 = 760, h = 500, bx = X + 34, bw = Wd - 68, by = y0 + 150, bh = 64;
    ctx.save(); ctx.globalAlpha *= al; ctx.translate(0, (1 - ea(t, a0, a0 + 0.5, E.out4)) * 30); glassPill(X, y0, Wd, h, 30);
    T('PAYMENT PLAN', X + 34, y0 + 50, { font: F.d(800, 28), ls: 6, color: GOLD, align: 'left' });
    T('50 / 50', X + Wd - 34, y0 + 58, { font: F.d(800, 54), color: '#FFFFFF', align: 'right', alpha: ea(t, K.fifty - 0.1, K.fifty + 0.3) });
    rr(bx, by, bw, bh, 18); ctx.fillStyle = 'rgba(243,239,230,0.08)'; ctx.fill();
    const px = v => bx + bw * v / 100;
    const seg = (v0, v1, c, a, d = 0.5) => { const e = ea(t, a, a + d, E.out3); if (e <= 0.003) return; rr(px(v0) + 2, by + 4, (px(v1) - px(v0) - 4) * e, bh - 8, 14); ctx.fillStyle = c; ctx.fill(); };
    seg(0, 20, GOLD, K.up20 - 0.05);
    for (let k = 0; k < 6; k++) seg(20 + k * 5, 25 + k * 5, '#F3D9A4', K.p5 + k * 0.28, 0.3);
    seg(50, 100, 'rgba(61,178,255,0.9)', K.rem50 - 0.05, 0.7);
    // labels under the bar
    const lab = (x, txt, sub, a, align = 'left') => { const e = ea(t, a, a + 0.35); if (e <= 0.003) return; T(txt, x, by + bh + 52, { font: F.d(800, 34), color: '#FFFFFF', align, alpha: e }); T(sub, x, by + bh + 86, { font: F.d(700, 21), ls: 2, color: C.mute, align, alpha: e }); };
    lab(px(0), '20%', 'UPFRONT', K.up20); lab(px(35), '5% × 6', 'EVERY 6 MONTHS', K.p5, 'center'); lab(px(100), '50%', 'ON HANDOVER', K.rem50, 'right');
    // the DLD fee badge
    const de = ea(t, K.dld - 0.1, K.dld + 0.35, E.back);
    if (de > 0.003) { ctx.save(); ctx.globalAlpha *= de; const w = 300, x = bx, y = by + bh + 120; rr(x, y, w, 56, 28); ctx.fillStyle = 'rgba(233,196,124,0.16)'; ctx.fill(); ctx.strokeStyle = GOLD; ctx.lineWidth = 2; ctx.stroke(); T('+ 4% DLD FEE', x + w / 2, y + 37, { font: F.d(800, 26), ls: 2, color: GOLD }); ctx.restore(); }
    // early-investor pricing
    const se = ea(t, K.special - 0.1, K.special + 0.4, E.out4);
    if (se > 0.003) { ctx.save(); ctx.globalAlpha *= se; const x = bx + 320, w = bw - 320, y = by + bh + 120; rr(x, y, w, 56, 28); ctx.fillStyle = 'rgba(8,8,10,0.6)'; ctx.fill(); ctx.strokeStyle = 'rgba(243,239,230,0.35)'; ctx.lineWidth = 2; ctx.stroke(); T('EARLY-INVESTOR PRICING · POSSIBLE', x + w / 2, y + 36, { font: F.d(800, 22), ls: 1.5, color: '#FFFFFF', sx: Math.min(1, (w - 30) / M('EARLY-INVESTOR PRICING · POSSIBLE', F.d(800, 22), 1.5)) }); ctx.restore(); }
    T('50% DURING CONSTRUCTION · 50% ON HANDOVER', CX, y0 + h - 26, { font: F.d(700, 19), ls: 2, color: C.mute, alpha: ea(t, K.handover, K.handover + 0.4) });
    ctx.restore();
  };

  const overlay = (t) => {
    hudTitle(t, 'NEW ON SHEIKH ZAYED ROAD', 'A BUSINESS TOWER', 'THE PRICES MIGHT SURPRISE YOU', 0.3, K.rock - 0.25, GOLD);
    hudTitle(t, 'SHEIKH ZAYED ROAD · BY LMD', 'ROCKEFELLER TOWER', 'BUSINESS TOWER · GRADE-A OFFICES', K.rock - 0.2, T_R2[1] - 0.1, GOLD);
    hudTitle(t, 'HERE IS WHERE IT GETS INTERESTING', 'THE PAYMENT PLAN', '20% NOW · 50% AT HANDOVER', T_R3[0] + 0.1, T_R3[1] - 0.1, GOLD);
    hudTitle(t, 'NOW ADD', 'THE LOCATION', 'SHEIKH ZAYED ROAD · DIFC · DOWNTOWN', T_R4[0] + 0.1, K.this1 - 0.2, GOLD);
    hudTitle(t, 'IT COULD BECOME', 'A NEW BUSINESS ADDRESS', 'HOW DOES IT COMPARE NEARBY?', K.this1 - 0.15, T_R4[1] - 0.1, GOLD);
    pricePanel(t); formats(t); planPanel(t);
    breakdown(t, { title: 'WHAT ADDS TO IT', a0: K.loc - 0.35, a1: K.this1 + 1.2, items: [{ txt: 'LOCATION · SHEIKH ZAYED ROAD', a: K.loc }, { txt: "THE BUILDING'S DESIGN", a: K.design }, { txt: 'MAJOR BRANDS · REPORTEDLY MOVING IN', a: K.brands, gold: true }] });

    // the call to action
    const ce = ea(t, K.comment + 0.1, K.comment + 0.8, E.out4);
    if (ce > 0.003) {
      ctx.save(); ctx.globalAlpha *= ce; ctx.fillStyle = 'rgba(8,8,10,0.9)'; ctx.fillRect(0, 0, W, H); ctx.restore();
      ctx.save(); ctx.globalAlpha *= ce; T('ABDULLAH AHLI', CX, 690, { font: F.d(800, 62), ls: 2, color: C.ink }); T('PORTFOLIO STRATEGIST', CX, 744, { font: F.d(700, 34), ls: 6, color: C.gold }); ctx.restore();
      const send = K.report + 0.9, sent = ea(t, send, send + 0.35), ia = ea(t, K.comment + 0.4, K.comment + 0.9, E.out4), iy = 1185, X0 = SAFE.x0, X1 = SAFE.x1, BW = X1 - X0, msg = 'REPORT', typed = msg.slice(0, Math.floor(msg.length * ea(t, K.report - 0.05, K.report + 0.5, E.lin) + 0.0001));
      ctx.save(); ctx.globalAlpha *= ia; rr(X0, iy - 65, BW, 130, 65); ctx.fillStyle = C.panel; ctx.fill(); ctx.strokeStyle = 'rgba(243,239,230,0.28)'; ctx.lineWidth = 3; ctx.stroke();
      T(typed, X0 + 56, iy + 20, { font: F.d(700, 60), color: C.ink, align: 'left', alpha: 1 - sent }); T('Add a comment…', X0 + 56, iy + 20, { font: F.d(700, 60), color: C.mute, align: 'left', alpha: (1 - ea(t, K.report - 0.05, K.report + 0.05)) * (1 - sent) });
      dot(X1 - 66, iy, 48, C.gold); icon('plane', X1 - 66, iy, 20, { p: 1, color: '#17181B', w: 4.5, rot: -0.5 + 0.5 * sent }); ctx.restore();
      const b1 = ea(t, send, send + 0.5, E.out4), b2 = ea(t, send + 0.8, send + 1.3, E.out4);
      if (b1 > 0.002) { ctx.save(); ctx.globalAlpha *= b1; ctx.translate(0, (1 - b1) * 36); const w = M(msg, F.d(700, 58)) + 84; rr(X1 - w, 900, w, 112, 56); ctx.fillStyle = C.gold; ctx.fill(); T(msg, X1 - w / 2, 975, { font: F.d(700, 58), color: '#17181B' }); ctx.restore(); }
      if (b2 > 0.002) { ctx.save(); ctx.globalAlpha *= b2; ctx.translate(0, (1 - b2) * 36); const rp = 'Sending you the full comparison', f = F.d(700, 42), w = Math.min(BW, M(rp, f) + 130); rr(X0, 1030, w, 112, 56); ctx.fillStyle = C.panel; ctx.fill(); ctx.strokeStyle = 'rgba(243,239,230,0.28)'; ctx.lineWidth = 3; ctx.stroke(); icon('check', X0 + 66, 1087, 24, { p: ea(t, send + 1.0, send + 1.4), color: C.gold, w: 5 }); T(rp, X0 + 112, 1102, { font: f, color: C.ink, align: 'left', sx: Math.min(1, (w - 140) / M(rp, f)) }); ctx.restore(); }
    }
    const nm = ea(t, 0.5, 1.0) * (1 - ea(t, 3.4, 3.8));
    if (nm > 0.003) { ctx.save(); ctx.globalAlpha *= nm; const f = F.d(800, 26), w = M('ABDULLAH AHLI', f, 3) + 44; glassPill(130, 514, w, 46, 23); T('ABDULLAH AHLI', 130 + w / 2, 547, { font: f, ls: 3, color: '#FFFFFF' }); ctx.restore(); }
  };
  OVERLAYS.push(overlay);

  [T_R2[0], T_R3[0], T_R4[0], K.comment].forEach(x => cues.push({ k: 'wh', t: x - 0.1, d: 0.5 }));
  [K.rock, K.up20, K.rem50, K.loc].forEach(x => cues.push({ k: 'pin', t: x }));
  cues.push({ k: 'send', t: K.report + 0.9 });
  return { FACE_SEGS, PUNCHES, SCENES, OVERLAYS, cues, IMAGES, BUBBLE, FOOT_MAX: 1359 };
}
