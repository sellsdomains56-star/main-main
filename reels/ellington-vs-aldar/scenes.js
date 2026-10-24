'use strict';
// ---------------------------------------------------------------------------
// "Ellington vs Aldar - two upcoming master communities" - HeyGen take c29a8ac6 (54 s, English), Abdullah Ahli's twin.
// No full-screen face: the map runs from the first frame; his face is the small round bubble top-left.
// Ellington: "near Mira Oasis, off E611" - listings place it in Al Yalayis 1 (the OSM district that contains Mira Oasis); no boundary is published, so the
// district is outlined with Mira Oasis as the reference. Aldar: "opposite Academic City, next to Dubai Silicon Oasis" - a glow between the two, the Blue Line drawn.
// The numbers (18M sq ft, 3,000-3,500 homes, ~8,000 homes) are his, shown as "planned" / "expected" as he says.  Safe zone: x 130-950, y 300-1420.
// ---------------------------------------------------------------------------
function buildScenes() {
  const cues = [], SCENES = [], tw = (re, n = 0, fb = 0, from = 0) => wt(re, n, fb, from);
  const add = (s) => { SCENES.push(s); return s; };

  const K = {
    two2: tw(/^TWO$/, 1, 2.75), ell1: tw(/^ELLINGTON$/, 0, 4.54), ald1: tw(/^ALDAR\.$/, 0, 5.16), but1: tw(/^BUT$/, 0, 6.2), lets: tw(/^LET'S$/, 0, 8.24),
    mira: tw(/^MIRA$/, 0, 9.96), e611: tw(/^E611,$/, 0, 11.28), m18: tw(/^18$/, 0, 12.78), h3000: tw(/^3,000$/, 0, 15.04), h3500: tw(/^3,500$/, 0, 16.12),
    focus: tw(/^FOCUS$/, 0, 17.88), lower: tw(/^LOWER$/, 0, 18.72), green: tw(/^GREEN$/, 0, 19.86), family1: tw(/^FAMILY$/, 0, 21.12), now1: tw(/^NOW$/, 0, 21.64),
    opp: tw(/^OPPOSITE$/, 0, 23.28), acad: tw(/^ACADEMIC$/, 0, 23.64), dso: tw(/^SILICON$/, 0, 25.7), h8000: tw(/^8,000$/, 0, 27.12), metro: tw(/^METRO$/, 0, 29.48),
    andthat: tw(/^THAT'S$/, 0, 30.7), ell2: tw(/^ELLINGTON$/, 1, 32.65), space: tw(/^SPACE,$/, 0, 33.42), privacy: tw(/^PRIVACY,$/, 0, 34.4), life: tw(/^LIFESTYLE\.$/, 0, 35.26),
    ald2: tw(/^ALDAR$/, 0, 36.52), conn1: tw(/^CONNECTIVITY,$/, 0, 37.3), emp: tw(/^EMPLOYMENT$/, 0, 38.18), rental1: tw(/^RENTAL$/, 0, 39.92), so: tw(/^SO$/, 0, 41.08),
    ell3: tw(/^ELLINGTON$/, 2, 42.69), but2: tw(/^BUT$/, 1, 44.34), ald3: tw(/^ALDAR$/, 1, 47.09), twomaj: tw(/^TWO$/, 2, 48.22), comment: tw(/^COMMENT$/, 0, 51.69), compare: tw(/^COMPARE$/, 0, 51.92),
  };

  const FACE_SEGS = [], PUNCHES = [], OVERLAYS = [], IMAGES = {};
  const GOLD = '#E9C47C', ELL = ['#2FD8A0', '#A6F3D6'], ALD = ['#3DB2FF', '#A9DEFF'], MIRA = ['#C9B8FF', '#E6DDFF'];

  const T_A0 = [0, K.lets - 0.15], T_A1 = [K.lets - 0.15, K.now1 - 0.15], T_A2 = [K.now1 - 0.15, K.andthat - 0.2], T_A3 = [K.andthat - 0.2, K.comment - 0.2];
  const rel = (T, t) => t - T[0], dur = T => T[1] - T[0];
  const flight = (id, [a, b], keys) => { SAT_SCENES[id] = { a, b, veil: 'map', keys: keys.map(k => camKey(...k)).sort((p, q) => p[0] - q[0]) }; add({ id, kind: 'sat', a, b, cfg: {} }); return SAT_SCENES[id]; };
  flight('a0', T_A0, [[0, 55.33, 25.06, 11.3, 120, 16], [dur(T_A0) + 0.5, 55.345, 25.065, 11.45, 120, 22]]);
  flight('a1', T_A1, [[0, 55.31, 25.03, 12.2, 140, 24], [1.4, 55.302, 25.016, 13.1, 150, 32], [dur(T_A1) + 0.5, 55.303, 25.016, 13.25, 150, 34]]);
  flight('a2', T_A2, [[0, 55.37, 25.08, 12.0, 140, 24], [1.4, 55.398, 25.118, 13.0, 150, 30], [rel(T_A2, K.metro) - 0.4, 55.398, 25.118, 13.0, 150, 30], [dur(T_A2) + 0.5, 55.392, 25.125, 12.75, 150, 30]]);
  flight('a3', T_A3, [[0, 55.35, 25.068, 11.12, 210, 6], [dur(T_A3) + 0.5, 55.35, 25.068, 11.22, 210, 8]]);

  const BUBBLE = { t0: 0.1, src: { cx: 562, cy: 820, size: 600 }, keys: [{ t: 0, cx: 215, cy: 418, r: 78 }, { t: K.comment - 0.2, cx: 215, cy: 418, r: 78 }, { t: K.comment + 0.9, cx: 540, cy: 470, r: 125 }] };
  HUD_X = 330;

  const S = id => SCENES.find(s => s.id === id).cfg;
  const PT = GEO.x.points || {}, ALDp = PT.aldar || [55.401, 25.122], ELLp = PT.ellington || [55.2977, 25.0138];
  const tag = (t, cam, [lon, lat], txt, c, a0, dx = 0, dy = 0, a1 = 0) => {     // a small name tag on the map
    const al = ea(t, a0, a0 + 0.35) * (a1 ? 1 - ea(t, a1, a1 + 0.35) : 1); if (al <= 0.003) return;
    const [x, y] = satProj(cam, lon, lat), f = F.d(800, 26), w = M(txt, f, 1.5) + 36, X = Math.max(SAFE.x0, Math.min(SAFE.x1 - w, x + dx - w / 2)), Y = y + dy, e = ea(t, a0, a0 + 0.45, E.back);
    ctx.save(); ctx.globalAlpha *= al; ctx.translate(0, (1 - e) * 14); rr(X, Y - 22, w, 44, 22); ctx.fillStyle = 'rgba(8,8,10,0.8)'; ctx.fill();
    rr(X, Y - 22, 8, 44, 4); ctx.fillStyle = c; ctx.fill(); T(txt, X + w / 2 + 4, Y + 9, { font: f, ls: 1.5, color: '#FFFFFF' }); ctx.restore();
  };
  const roads = (t, cam, a, al = 0.9, plain = false) => {
    mapRoad(t, cam, 'E611', { a0: a, dur: 1.4, alpha: al, shields: plain ? [] : [[55.30, 25.04], [55.33, 25.08]], ...(plain ? { name: '' } : {}) });
    mapRoad(t, cam, 'E311', { a0: a + 0.35, dur: 1.4, alpha: al * 0.8, shields: plain ? [] : [[55.25, 25.07], [55.28, 25.10]], ...(plain ? { name: '' } : {}) });
  };
  S('a0').top = (t, cam) => {
    roads(t, cam, 0.3);
    mapArea(t, cam, 'yalayis1', { c: ELL, a0: K.ell1 - 0.3, dur: 0.8, on: [K.ell1 - 0.2, T_A0[1]], base: 0.6, tag: 0 });
    tag(t, cam, ELLp, 'ELLINGTON', ELL[0], K.ell1, 0, 70);
    mapPulse(t, cam, ALDp[0], ALDp[1], 1200, K.ald1 - 0.15, 0);
    tag(t, cam, ALDp, 'ALDAR', ALD[0], K.ald1, 0, -60);
    mapScale(t, cam, 0.6, 0);
  };
  S('a1').top = (t, cam) => {
    mapRoad(t, cam, 'E611', { a0: T_A1[0] - 0.2, dur: 1.2, hi: 0.8, shields: [[55.285, 25.028], [55.275, 25.016]] });
    mapArea(t, cam, 'yalayis1', { c: ELL, a0: T_A1[0], dur: 1.0, on: [T_A1[0] + 0.3, T_A1[1]], label: 'AL YALAYIS 1', sub: "ELLINGTON'S MASTER COMMUNITY", dx: 120, dy: -150, base: 0.5, tag: 0 });
    mapArea(t, cam, 'mira', { c: MIRA, a0: K.mira - 0.2, dur: 0.7, on: [K.mira - 0.1, T_A1[1]], base: 0.7, tag: 0 });
    tag(t, cam, cen0('mira'), 'MIRA OASIS', MIRA[0], K.mira, -10, 64);
    mapScale(t, cam, T_A1[0] + 1.2, 0);
  };
  S('a2').top = (t, cam) => {
    mapArea(t, cam, 'dso', { c: ['#FFFFFF', '#CFE6FF'], a0: K.dso - 0.25, dur: 0.8, on: [K.dso - 0.15, T_A2[1]], base: 0.5, tag: 0 });
    mapArea(t, cam, 'academic', { c: ['#7FE7FF', '#C7F6FF'], a0: K.acad - 0.25, dur: 0.8, on: [K.acad - 0.15, T_A2[1]], base: 0.5, tag: 0 });
    tag(t, cam, cen0('academic'), 'ACADEMIC CITY', '#7FE7FF', K.acad, 40, 70);
    tag(t, cam, cen0('dso'), 'DUBAI SILICON OASIS', '#FFFFFF', K.dso, -40, -64);
    mapPulse(t, cam, ALDp[0], ALDp[1], 900, K.opp - 0.2, 0);
    tag(t, cam, ALDp, 'ALDAR', ALD[0], K.opp, 150, 4);
    if (OUTLINES.blue_main) { mapFlowLine(t, cam, OUTLINES.blue_main, K.metro - 0.2, 1.6); if (OUTLINES.blue_branch) mapFlowLine(t, cam, OUTLINES.blue_branch, K.metro + 0.6, 1.0); }
    mapScale(t, cam, T_A2[0] + 1.2, 0);
  };
  S('a3').top = (t, cam) => {
    roads(t, cam, T_A3[0] - 2, 0.75, true);
    mapArea(t, cam, 'yalayis1', { c: ELL, a0: T_A3[0], dur: 0.8, on: [K.ell2 - 0.2, K.ald2 - 0.2], base: 0.6, tag: 0 });
    mapArea(t, cam, 'dso', { c: ALD, a0: T_A3[0] + 0.2, dur: 0.8, on: [K.ald2 - 0.2, K.so - 0.2], base: 0.5, tag: 0 });
    if (OUTLINES.blue_main) mapFlowLine(t, cam, OUTLINES.blue_main, T_A3[0], 0.1, 0.8);
    tag(t, cam, ELLp, 'ELLINGTON', ELL[0], T_A3[0] + 0.3, -90, -44);
    tag(t, cam, ALDp, 'ALDAR', ALD[0], T_A3[0] + 0.5, 90, 40);
    mapScale(t, cam, T_A3[0] + 0.6, 0);
  };
  function cen0(k) { return centroid(OUTLINES[k] || [[0, 0]]); }
  // the Blue Line: its OSM alignment, drawn as a glowing route
  function mapFlowLine(t, cam, pts, a0, d, alpha = 1) {
    const p = ea(t, a0, a0 + d, E.inOut2); if (p <= 0.002) return;
    const runs = projRuns(cam, geoSlice(pts, 0, p)); ctx.save(); ctx.globalAlpha *= alpha; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    for (const r of runs) { strokePoly(r, 1, { color: 'rgba(8,9,11,0.6)', w: 10 }); ctx.shadowColor = '#3DB2FF'; ctx.shadowBlur = 14 * SS; strokePoly(r, 1, { color: '#5CC4FF', w: 5 }); ctx.shadowColor = 'transparent'; }
    ctx.restore();
  }

  // ---- the stat cards (one per community)
  const stat = (t, o) => {
    const al = ea(t, o.a0, o.a0 + 0.4) * (1 - ea(t, o.a1, o.a1 + 0.35)); if (al <= 0.003) return;
    const X = SAFE.x0, Wd = SAFE.w, rowH = 92, y0 = 1262 - (70 + o.rows.length * rowH + 16);
    ctx.save(); ctx.globalAlpha *= al; ctx.translate(0, (1 - ea(t, o.a0, o.a0 + 0.5, E.out4)) * 30); glassPill(X, y0, Wd, 1262 - y0, 28);
    rr(X, y0, 10, 1262 - y0, 5); ctx.fillStyle = o.c; ctx.fill();
    T(o.title, X + 40, y0 + 46, { font: F.d(800, 27), ls: 6, color: o.c, align: 'left' });
    o.rows.forEach((r, i) => {
      const e = ea(t, r.a - 0.05, r.a + 0.4, E.out4); if (e <= 0.003) return; const y = y0 + 70 + i * rowH;
      ctx.save(); ctx.globalAlpha *= e; ctx.translate((1 - e) * -26, 0);
      T(r.big, X + 40, y + 52, { font: F.d(800, 48), color: '#FFFFFF', align: 'left' });
      T(r.small, X + 40 + M(r.big, F.d(800, 48)) + 22, y + 50, { font: F.d(700, 24), ls: 2, color: C.dim, align: 'left', sx: Math.min(1, (Wd - 110 - M(r.big, F.d(800, 48))) / M(r.small, F.d(700, 24), 2)) });
      ctx.restore();
    });
    ctx.restore();
  };
  // ---- the comparison: two columns that fill as he names each quality, then "if you are buying for ..."
  const compare = (t) => {
    const a0 = K.ell2 - 0.3, a1 = T_A3[1] - 0.15, al = ea(t, a0, a0 + 0.4) * (1 - ea(t, a1, a1 + 0.35)); if (al <= 0.003) return;
    const X = SAFE.x0, Wd = SAFE.w, gap = 16, w = (Wd - gap) / 2, y0 = 870, h = 300;
    const cols = [['ELLINGTON', ELL[0], [['SPACE', K.space], ['PRIVACY', K.privacy], ['LIFESTYLE', K.life]], K.ell2], ['ALDAR', ALD[0], [['CONNECTIVITY', K.conn1], ['EMPLOYMENT HUBS', K.emp], ['RENTAL DEMAND', K.rental1]], K.ald2]];
    ctx.save(); ctx.globalAlpha *= al; ctx.translate(0, (1 - ea(t, a0, a0 + 0.5, E.out4)) * 30);
    cols.forEach(([name, c, rows, a], i) => {
      const x = X + i * (w + gap), e = ea(t, a - 0.1, a + 0.35); ctx.save(); ctx.globalAlpha *= 0.35 + 0.65 * e; glassPill(x, y0, w, h, 26);
      rr(x, y0, w, 8, 4); ctx.fillStyle = c; ctx.fill(); T(name, x + 30, y0 + 58, { font: F.d(800, 36), ls: 2, color: c, align: 'left' });
      rows.forEach(([txt, ra], j) => { const re = ea(t, ra - 0.05, ra + 0.4, E.out4); if (re <= 0.003) return; const y = y0 + 112 + j * 62; ctx.save(); ctx.globalAlpha *= re; dot(x + 44, y - 9, 13, c); icon('check', x + 44, y - 8, 7, { color: '#0A0A0B', w: 3 }); T(txt, x + 70, y, { font: F.d(800, 28), color: '#FFFFFF', align: 'left', sx: Math.min(1, (w - 90) / M(txt, F.d(800, 28))) }); ctx.restore(); });
      ctx.restore();
    });
    // the verdict rows
    const vy = y0 + h + 18, vr = [['FAMILY LIVING', 'ELLINGTON', ELL[0], K.so], ['CONNECTIVITY + RENTAL', 'ALDAR', ALD[0], K.but2]];
    vr.forEach(([q, ans, c, a], i) => {
      const e = ea(t, a - 0.05, a + 0.4, E.out4); if (e <= 0.003) return; const y = vy + i * 0; ctx.save(); ctx.globalAlpha *= e;
      const x = X + i * (w + gap); rr(x, y, w, 64, 32); ctx.fillStyle = 'rgba(8,8,10,0.78)'; ctx.fill(); ctx.strokeStyle = c; ctx.lineWidth = 2.5; ctx.stroke();
      T(q + ' → ' + ans, x + w / 2, y + 42, { font: F.d(800, 24), ls: 1, color: '#FFFFFF', sx: Math.min(1, (w - 30) / M(q + ' → ' + ans, F.d(800, 24), 1)) }); ctx.restore();
    });
    ctx.restore();
  };

  const overlay = (t) => {
    hudTitle(t, "TWO OF DUBAI'S BIGGEST NEW MASTER COMMUNITIES", 'ELLINGTON VS ALDAR', 'WHICH ONE MAKES MORE SENSE?', 0.3, T_A0[1] - 0.1, GOLD);
    hudTitle(t, 'ELLINGTON', 'NEAR MIRA OASIS', 'RIGHT OFF E611 · AL YALAYIS 1', T_A1[0] + 0.1, T_A1[1] - 0.1, ELL[0]);
    hudTitle(t, 'ALDAR', 'OPPOSITE ACADEMIC CITY', 'NEXT TO DUBAI SILICON OASIS', T_A2[0] + 0.1, T_A2[1] - 0.1, ALD[0]);
    hudTitle(t, 'THE BIGGEST DIFFERENCE', 'TWO STRATEGIES', 'LIFESTYLE VS CONNECTIVITY', T_A3[0] + 0.1, T_A3[1] - 0.1, GOLD);
    stat(t, { title: 'ELLINGTON · PLANNED', c: ELL[0], a0: K.m18 - 0.3, a1: K.focus - 0.35, rows: [{ big: '≈18M', small: 'SQ FT OF LAND', a: K.m18 }, { big: '3,000–3,500', small: 'HOMES', a: K.h3000 }] });
    breakdown(t, { title: 'THE FOCUS', a0: K.focus - 0.3, a1: T_A1[1] - 0.15, bottom: 1262, items: [{ txt: 'LOWER DENSITY', a: K.lower }, { txt: 'GREEN SPACES', a: K.green }, { txt: 'FAMILY LIVING', a: K.family1, gold: true }], alpha: 1 });
    stat(t, { title: 'ALDAR · EXPECTED', c: ALD[0], a0: K.h8000 - 0.3, a1: T_A2[1] - 0.2, rows: [{ big: '≈8,000', small: 'HOMES', a: K.h8000 }, { big: 'BLUE LINE', small: 'UPCOMING METRO', a: K.metro }] });
    compare(t);

    const ce = ea(t, K.comment + 0.1, K.comment + 0.8, E.out4);
    if (ce > 0.003) {
      ctx.save(); ctx.globalAlpha *= ce; ctx.fillStyle = 'rgba(8,8,10,0.9)'; ctx.fillRect(0, 0, W, H); ctx.restore();
      ctx.save(); ctx.globalAlpha *= ce; T('ABDULLAH AHLI', CX, 690, { font: F.d(800, 62), ls: 2, color: C.ink }); T('PORTFOLIO STRATEGIST', CX, 744, { font: F.d(700, 34), ls: 6, color: C.gold }); ctx.restore();
      const send = K.compare + 0.9, sent = ea(t, send, send + 0.35), ia = ea(t, K.comment + 0.4, K.comment + 0.9, E.out4), iy = 1185, X0 = SAFE.x0, X1 = SAFE.x1, BW = X1 - X0, msg = 'COMPARE', typed = msg.slice(0, Math.floor(msg.length * ea(t, K.compare - 0.05, K.compare + 0.5, E.lin) + 0.0001));
      ctx.save(); ctx.globalAlpha *= ia; rr(X0, iy - 65, BW, 130, 65); ctx.fillStyle = C.panel; ctx.fill(); ctx.strokeStyle = 'rgba(243,239,230,0.28)'; ctx.lineWidth = 3; ctx.stroke();
      T(typed, X0 + 56, iy + 20, { font: F.d(700, 60), color: C.ink, align: 'left', alpha: 1 - sent }); T('Add a comment…', X0 + 56, iy + 20, { font: F.d(700, 60), color: C.mute, align: 'left', alpha: (1 - ea(t, K.compare - 0.05, K.compare + 0.05)) * (1 - sent) });
      dot(X1 - 66, iy, 48, C.gold); icon('plane', X1 - 66, iy, 20, { p: 1, color: '#17181B', w: 4.5, rot: -0.5 + 0.5 * sent }); ctx.restore();
      const b1 = ea(t, send, send + 0.5, E.out4), b2 = ea(t, send + 0.8, send + 1.3, E.out4);
      if (b1 > 0.002) { ctx.save(); ctx.globalAlpha *= b1; ctx.translate(0, (1 - b1) * 36); const w = M(msg, F.d(700, 58)) + 84; rr(X1 - w, 900, w, 112, 56); ctx.fillStyle = C.gold; ctx.fill(); T(msg, X1 - w / 2, 975, { font: F.d(700, 58), color: '#17181B' }); ctx.restore(); }
      if (b2 > 0.002) { ctx.save(); ctx.globalAlpha *= b2; ctx.translate(0, (1 - b2) * 36); const rp = 'Sending you the full comparison', f = F.d(700, 42), w = Math.min(BW, M(rp, f) + 130); rr(X0, 1030, w, 112, 56); ctx.fillStyle = C.panel; ctx.fill(); ctx.strokeStyle = 'rgba(243,239,230,0.28)'; ctx.lineWidth = 3; ctx.stroke(); icon('check', X0 + 66, 1087, 24, { p: ea(t, send + 1.0, send + 1.4), color: C.gold, w: 5 }); T(rp, X0 + 112, 1102, { font: f, color: C.ink, align: 'left', sx: Math.min(1, (w - 140) / M(rp, f)) }); ctx.restore(); }
    }
    const nm = ea(t, 0.5, 1.0) * (1 - ea(t, 3.4, 3.8));
    if (nm > 0.003) { ctx.save(); ctx.globalAlpha *= nm; const f = F.d(800, 26), w = M('ABDULLAH AHLI', f, 3) + 44; glassPill(130, 514, w, 46, 23); T('ABDULLAH AHLI', 130 + w / 2, 547, { font: f, ls: 3, color: '#FFFFFF' }); ctx.restore(); }
  };
  OVERLAYS.push(overlay);

  [T_A1[0], T_A2[0], T_A3[0], K.comment].forEach(x => cues.push({ k: 'wh', t: x - 0.1, d: 0.5 }));
  [K.ell1, K.ald1, K.mira, K.acad, K.dso].forEach(x => cues.push({ k: 'pin', t: x }));
  cues.push({ k: 'send', t: K.compare + 0.9 });
  return { FACE_SEGS, PUNCHES, SCENES, OVERLAYS, cues, IMAGES, BUBBLE, FOOT_MAX: 1624 };
}
