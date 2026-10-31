'use strict';
// ---------------------------------------------------------------------------
// "Before you buy an office in Dubai, compare these five launches" - HeyGen cfdcf947, version v4235b1c5 (90.4 s, English; the Palm Springs link
// re-used for a new script).  60 fps.  A Dubai map with the five sites, one render card + one real page (marker on the exact words) per project,
// his face SMALL the whole time.
// Facts (research 31 Oct 2026, scratchpad research_offices.md):
//  1 Christian A. Rockefeller Business Tower, LMD, Sheikh Zayed Road: 400 m, 87 storeys, four office collections + five amenity floors (LMD, TradeArabia
//    22 Oct 2026); 332 offices only on a broker listing (Engel & Voelkers) -> shown as such.  2 Berkeley Tower, Ellington Properties x Al Hamra Group,
//    Business Bay: "rising above 60 floors", robotic parking + double-decker lifts (Ellington, 20 Oct 2026).  3 AHS Twin Towers, AHS Properties: the
//    AED 1.1 bn Shangri-La Dubai purchase (11 Jun 2026) and the Grade A office conversion (27 Oct 2026) were two announcements.  4 DAWN at O1NE District,
//    AVENEW Development x KORA Properties, Motor City: first office tower; six commercial towers, retail, healthcare, landscaped public spaces (Khaleej
//    Times, 8 Jul 2026).  5 The Yards Plaza by BEYOND (OMNIYAT Group), City of Arabia, Sheikh Mohammed Bin Zayed Road: 272 offices + G+2 retail and dining.
// Renders are the developers' marketing images.  Map: (c) OpenStreetMap contributors (ODbL); imagery (c) Esri, Maxar, Earthstar Geographics.
// Safe zone: x 130-950, y 300-1420.
// ---------------------------------------------------------------------------
function buildScenes() {
  const cues = [], SCENES = [], PUNCHES = [], OVERLAYS = [], add = (s) => { SCENES.push(s); return s; };
  const A = (w, from = 0) => { const n = s => s.toUpperCase().replace(/[.,?!:;]+$/, ''); const x = TL.words.find(q => q.t >= from - 1e-6 && n(q.text) === n(w)); if (!x) console.error('anchor missing: ' + w + ' @' + from); return x ? x.t : from; };
  const VEND = TL.voice_dur, END = TL.dur;
  const GOLD = '#E9C47C', GOLD_A = 'rgba(233,196,124,', WHITE_A = 'rgba(243,239,230,', RED = '#E5484D', RED2 = '#FF8A8E', AMBER = '#FFB547', TEAL = ['#2FD8A0', '#A6F3D6'], BLUE = ['#3DB2FF', '#A9DEFF'], GOLDS = ['#C99A4A', '#F3D9A4'], WHITES = ['#F3EFE6', '#FFFFFF'];
  const IMAGES = Object.fromEntries(Object.keys(PAGES).map(k => [k, `assets/${k}.png`]));
  for (const k of ['r_rock', 'r_berk', 'r_ahs', 'r_dawn', 'r_yards']) IMAGES[k] = `assets/img/${k}.jpg`;
  for (const k of ['lmd', 'ell', 'alhamra', 'ahs', 'avenew', 'kora', 'beyond', 'o1ne', 'yards']) IMAGES['L_' + k] = `assets/img/logo_${k}.png`;
  const DARK_PLATE = new Set(['beyond', 'o1ne', 'yards']);
  const P = GEO.x.points || {};
  const win = (t, a0, a1, d = 0.4) => ea(t, a0, a0 + d) * (1 - ea(t, a1, a1 + 0.4));
  const fit = (s, f, w, ls = 0) => Math.min(1, w / M(s, f, ls));
  const ok = id => IMG[id] && IMG[id].naturalWidth > 0;
  const dur = T => T[1] - T[0];
  HUD_X = 330;                                                                       // titles sit right of his bubble
  const BUBBLE = { t0: 0, src: { cx: 562, cy: 820, size: 600 }, keys: [{ t: 0, cx: 215, cy: 418, r: 78 }, { t: END, cx: 215, cy: 418, r: 78 }] };

  const K = {
    five: A('five'), locations: A('locations,'), layouts: A('layouts,'), working: A('working'), first: A('first,'), lmd: A('lmd'), sheikh1: A('sheikh'), the1: A('the', 11.8),
    n87: A('87'), n332: A('332'), n5: A('5'), amenities: A('amenities.'), one: A('one', 17.5), high: A('high-rise'), second: A('second,'), ellington: A('ellington'), it1: A('it', 24.3),
    rises: A('rises'), floors2: A('floors,', 25), robotic: A('robotic'), lifts: A('lifts'), third: A('third,'), ahs2: A('ahs', 32), announced3: A('announced', 32.5), dubai3: A('dubai,', 36),
    transform: A('transform'), offices3: A('offices.', 39), this: A('this', 40.5), conversion: A('conversion'), delivery: A('delivery'), fourth: A('fourth,'), motor: A('motor'), its: A("it's", 52.5),
    first2: A('first', 53), six: A('six'), spaces: A('spaces.'), fifth: A('fifth,'), beyond: A('beyond'), city: A('city', 62), sheikh2: A('sheikh', 63.5), it2: A('it', 65.5), n272: A('272'), dining2: A('dining', 68.8), community: A('community.'),
    five2: A('five', 71), who: A('who'), how: A('how'), what: A('what', 76), compare2: A('compare', 77), parking: A('parking,'), usable: A('usable'), fitout: A('fit-out'), service: A('service'), payment: A('payment'), purchase: A('purchase'),
    comment: A('comment'), OFFICE: A('office', 85), budget: A('budget'), business: A('business', 87), rent: A('rent'), lets: A("let's"),
  };
  const FACE_SEGS = [];
  const M0 = [0, K.first - 0.12], C_rock = [M0[1], K.the1 - 0.1], P_rock = [C_rock[1], K.one - 0.12], M1 = [P_rock[1], K.second - 0.12], C_berk = [M1[1], K.it1 - 0.1], P_berk = [C_berk[1], K.third - 0.12],
    C_ahs = [P_berk[1], K.ahs2 - 0.12], P_ahs = [C_ahs[1], K.this - 0.12], R_ahs = [P_ahs[1], K.fourth - 0.12], C_dawn = [R_ahs[1], K.motor - 0.3], M4 = [C_dawn[1], K.its - 0.12], P_dawn = [M4[1], K.fifth - 0.12],
    C_yards = [P_dawn[1], K.city - 0.25], M5 = [C_yards[1], K.it2 - 0.12], P_yards = [M5[1], K.five2 - 0.12], T1 = [P_yards[1], K.compare2 - 0.1], T2 = [T1[1], K.comment - 0.12];

  // ---------------------------------------------------------------- drawing pieces
  const imgCover = (id, x, y, w, h, r, zoom = 1, fx = 0.5, fy = 0.5) => {         // image filling a rounded box (object-fit: cover), focus fx/fy
    if (!ok(id)) return; const im = IMG[id], s = Math.max(w / im.naturalWidth, h / im.naturalHeight) * zoom, dw = im.naturalWidth * s, dh = im.naturalHeight * s;
    ctx.save(); rr(x, y, w, h, r); ctx.clip(); ctx.drawImage(im, x + (w - dw) * fx, y + (h - dh) * fy, dw, dh); ctx.restore();
  };
  const imgContain = (id, x, y, w, h) => { if (!ok(id)) return; const im = IMG[id], s = Math.min(w / im.naturalWidth, h / im.naturalHeight), dw = im.naturalWidth * s, dh = im.naturalHeight * s; ctx.drawImage(im, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh); };
  const plate = (key, x, y, w, h) => {                                             // the company logo on its plate
    const dark = DARK_PLATE.has(key); rr(x, y, w, h, 16); ctx.fillStyle = dark ? '#101114' : '#FFFFFF'; ctx.fill();
    if (dark) { ctx.strokeStyle = GOLD_A + '0.35)'; ctx.lineWidth = 1.5; ctx.stroke(); }
    imgContain('L_' + key, x + 16, y + 12, w - 32, h - 24);
  };
  const box = (x, y, w, h, r = 26, edge = GOLD_A + '0.32)') => {                   // a solid card (no backdrop blur: cheap at 60 fps)
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 30 * SS; ctx.shadowOffsetY = 10 * SS; rr(x, y, w, h, r); ctx.fillStyle = 'rgba(19,19,23,0.96)'; ctx.fill(); ctx.restore();
    rr(x, y, w, h, r); ctx.strokeStyle = edge; ctx.lineWidth = 1.5; ctx.stroke();
  };
  const pop = (t, a, d = 0.55) => ea(t, a, a + d, E.back);
  // a person: round photo, gold ring that closes as he appears, name and title under it
  const person = (t, n) => {
    const e = pop(t, n.t, 0.7); if (e <= 0.003) return; const r = n.r || 112, ap = clamp(ea(t, n.t, n.t + 0.3) * 1.2);
    ctx.save(); ctx.globalAlpha *= ap; ctx.translate(n.x, n.y); ctx.scale(lerp(0.8, 1, e), lerp(0.8, 1, e));
    glow(0, 0, r * 2.2, '233,196,124', 0.16 * ap);
    ctx.save(); ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.clip(); if (ok(n.img)) ctx.drawImage(IMG[n.img], -r, -r, 2 * r, 2 * r); ctx.restore();
    ctx.lineWidth = 6; ctx.strokeStyle = GOLD; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(0, 0, r + 7, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ea(t, n.t + 0.1, n.t + 0.9, E.inOut2)); ctx.stroke();
    ctx.restore();
    if (n.name) { const f = F.d(800, n.small ? 26 : 40), e2 = ea(t, n.t + 0.25, n.t + 0.7, E.out4); ctx.save(); ctx.globalAlpha *= e2; ctx.translate(0, (1 - e2) * 14);
      T(n.name, n.x, n.y + r + (n.small ? 48 : 66), { font: f, ls: 1, color: '#FFFFFF', sx: fit(n.name, f, n.small ? 250 : SAFE.w, 1) });
      if (n.title) T(n.title, n.x, n.y + r + (n.small ? 80 : 106), { font: F.d(700, n.small ? 20 : 26), ls: 4, color: GOLD, sx: fit(n.title, F.d(700, 26), SAFE.w, 4) }); ctx.restore(); }
  };
  // an entity card: wide = logo plate left, text right; narrow = plate on top, text below; photo = landmark picture with the logo in a corner
  const card = (t, n) => {
    const e = pop(t, n.t); if (e <= 0.003) return; const { x, y, w, h } = n, x0 = x - w / 2, y0 = y - h / 2;
    ctx.save(); ctx.globalAlpha *= clamp(ea(t, n.t, n.t + 0.25) * 1.2) * (n.dim ? 1 - 0.55 * ea(t, n.dim, n.dim + 0.5) : 1); ctx.translate(x, y); ctx.scale(lerp(0.86, 1, e), lerp(0.86, 1, e)); ctx.translate(-x, -y);
    if (n.photo) {
      ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 30 * SS; ctx.shadowOffsetY = 10 * SS; rr(x0, y0, w, h, 24); ctx.fillStyle = '#000'; ctx.fill(); ctx.restore();
      imgCover(n.photo, x0, y0, w, h, 24, 1 + 0.06 * prog(t, n.t, n.t + 8), n.fx ?? 0.5, n.fy ?? 0.5);
      const g = ctx.createLinearGradient(0, y0 + h * 0.35, 0, y0 + h); g.addColorStop(0, 'rgba(8,8,10,0)'); g.addColorStop(1, 'rgba(8,8,10,0.92)'); ctx.save(); rr(x0, y0, w, h, 24); ctx.clip(); ctx.fillStyle = g; ctx.fillRect(x0, y0, w, h); ctx.restore();
      rr(x0, y0, w, h, 24); ctx.strokeStyle = GOLD_A + '0.45)'; ctx.lineWidth = 2; ctx.stroke();
      if (n.logo) plate(n.logo, x0 + 16, y0 + 16, Math.min(190, w * 0.48), 74);
      const f = F.d(800, n.fs || 32); T(n.title, x0 + 26, y0 + h - (n.sub ? 54 : 28), { font: f, ls: 1, color: '#FFFFFF', align: 'left', sx: fit(n.title, f, w - 52, 1) });
      if (n.sub) T(n.sub, x0 + 26, y0 + h - 22, { font: F.d(700, 21), ls: 3, color: n.subC || GOLD, align: 'left', alpha: ea(t, n.subT ?? n.t, (n.subT ?? n.t) + 0.4), sx: fit(n.sub, F.d(700, 21), w - 52, 3) });
      if (n.credit) T(n.credit, x0 + w - 14, y0 + 26, { font: F.d(700, 15), ls: 1, color: 'rgba(255,255,255,0.75)', align: 'right' });
    } else if (w >= 600) {
      box(x0, y0, w, h, 26, n.edge || GOLD_A + '0.32)'); const pw = n.pw || 230, ph = h - 40; if (n.logo) plate(n.logo, x0 + 20, y0 + 20, pw, ph); else { rr(x0 + 20, y0 + 20, pw, ph, 16); ctx.fillStyle = '#101114'; ctx.fill(); ctx.strokeStyle = GOLD_A + '0.35)'; ctx.stroke(); T(n.mono, x0 + 20 + pw / 2, y0 + h / 2 + 16, { font: F.d(800, 46), ls: 3, color: n.monoC || GOLD }); }
      const tx = x0 + pw + 50, mw = x0 + w - 30 - tx, f = F.d(800, n.fs || 34), lines = n.title.split('\n'), ty = y0 + h / 2 + (n.sub ? -10 : 12) - (lines.length - 1) * 21;
      lines.forEach((l, i) => T(l, tx, ty + i * 42, { font: f, ls: 1, color: '#FFFFFF', align: 'left', sx: fit(l, f, mw, 1) }));
      if (n.sub) { const e3 = ea(t, n.subT ?? n.t, (n.subT ?? n.t) + 0.45, E.out4), f3 = F.d(700, 22); ctx.save(); ctx.globalAlpha *= e3; n.sub.split('\n').forEach((l, i) => T(l, tx, ty + (lines.length - 1) * 42 + 44 + i * 30, { font: f3, ls: 2, color: n.subC || GOLD, align: 'left', sx: fit(l, f3, mw, 2) })); ctx.restore(); }
    } else {
      box(x0, y0, w, h); const ph = n.ph || 86; if (n.logo) plate(n.logo, x0 + 18, y0 + 18, w - 36, ph); else { rr(x0 + 18, y0 + 18, w - 36, ph, 16); ctx.fillStyle = '#101114'; ctx.fill(); ctx.strokeStyle = GOLD_A + '0.35)'; ctx.stroke(); T(n.mono, x, y0 + 18 + ph / 2 + 16, { font: F.d(800, 44), ls: 4, color: GOLD }); }
      const f = F.d(800, n.fs || 30), lines = n.title.split('\n'), ty = y0 + 18 + ph + 46;
      lines.forEach((l, i) => T(l, x, ty + i * 36, { font: f, ls: 1, color: '#FFFFFF', sx: fit(l, f, w - 36, 1) }));
      if (n.sub) T(n.sub, x, ty + (lines.length - 1) * 36 + 36, { font: F.d(700, 21), ls: 3, color: GOLD, alpha: ea(t, n.subT ?? n.t, (n.subT ?? n.t) + 0.4), sx: fit(n.sub, F.d(700, 21), w - 36, 3) });
    }
    ctx.restore();
  };
  const tag = (t, n) => { const e = pop(t, n.t, 0.45); if (e <= 0.003) return; const { x, y, w, h } = n; ctx.save(); ctx.globalAlpha *= clamp(e); ctx.translate(x, y); ctx.scale(lerp(0.8, 1, e), lerp(0.8, 1, e));
    box(-w / 2, -h / 2, w, h, h / 2, GOLD_A + '0.55)'); dot(-w / 2 + 44, 0, 24, C.goldSoft); icon(n.icon, -w / 2 + 44, 0, 13, { p: ea(t, n.t, n.t + 0.5), color: GOLD, w: 3 });
    T(n.title, -w / 2 + 84, 12, { font: F.d(800, 32), ls: 2, color: '#FFFFFF', align: 'left', sx: fit(n.title, F.d(800, 32), w - 110, 2) }); ctx.restore(); };
  // a line that draws itself with a bright head, then keeps a soft pulse running along it; label = a pill on it
  const pointAt = (pts, u) => { const L = polyLen(pts) * clamp(u); let acc = 0; for (let i = 1; i < pts.length; i++) { const s = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); if (acc + s >= L) { const k = s ? (L - acc) / s : 0; return [lerp(pts[i - 1][0], pts[i][0], k), lerp(pts[i - 1][1], pts[i][1], k)]; } acc += s; } return pts[pts.length - 1]; };
  const edge = (t, e) => {
    const p = ea(t, e.t, e.t + (e.d || 0.55), E.inOut2); if (p <= 0.003) return; const gold = e.c !== 'w', col = gold ? GOLD : '#F3EFE6';
    ctx.save(); if (e.dim) ctx.globalAlpha *= 1 - 0.55 * ea(t, e.dim, e.dim + 0.5);
    strokePoly(e.pts, p, { color: gold ? GOLD_A + '0.25)' : WHITE_A + '0.18)', w: 12 }); strokePoly(e.pts, p, { color: col, w: 4 });
    const hd = pointAt(e.pts, p); if (p < 0.999) { glow(hd[0], hd[1], 40, gold ? '233,196,124' : '243,239,230', 0.55); dot(hd[0], hd[1], 7, '#FFFFFF'); }
    else { const u = ((t - e.t) / 1.7) % 1, q = pointAt(e.pts, u); glow(q[0], q[1], 26, gold ? '233,196,124' : '243,239,230', 0.35 * Math.sin(Math.PI * u)); dot(q[0], q[1], 4.5, gold ? '#FFF3D6' : '#FFFFFF', 0.8 * Math.sin(Math.PI * u)); }
    if (e.label) { const la = ea(t, e.lt ?? e.t + 0.25, (e.lt ?? e.t + 0.25) + 0.35, E.out4); if (la > 0.003) { const [lx, ly] = e.at || pointAt(e.pts, 0.5), f = F.d(800, 22), w = M(e.label, f, 3) + 40;
      ctx.save(); ctx.globalAlpha *= la; ctx.translate(lx, ly); ctx.scale(lerp(0.85, 1, la), lerp(0.85, 1, la)); rr(-w / 2, -21, w, 42, 21); ctx.fillStyle = gold ? '#1A1712' : '#141417'; ctx.fill(); ctx.strokeStyle = gold ? GOLD : WHITE_A + '0.6)'; ctx.lineWidth = 2; ctx.stroke();
      T(e.label, 0, 8, { font: f, ls: 3, color: gold ? GOLD : '#FFFFFF' }); ctx.restore(); } }
    ctx.restore();
  };
  // a section: nodes and edges in "world" coordinates, a camera that walks down (keys [abs t, cam y, zoom]); everything fades in/out with the section
  const SECT = [];
  const section = (T0, cam, nodes, edges) => SECT.push({ T: T0, cam, nodes, edges });
  const camAt = (keys, t) => { let i = 0; while (i < keys.length - 2 && t > keys[i + 1][0]) i++; const [ta, ya, za] = keys[i], [tb, yb, zb] = keys[Math.min(i + 1, keys.length - 1)], u = tb > ta ? E.inOut3(clamp((t - ta) / (tb - ta))) : 1; return [lerp(ya, yb, u), lerp(za ?? 1, zb ?? 1, u)]; };
  const drawSection = (t, s) => {
    const al = ea(t, s.T[0] - 0.05, s.T[0] + 0.35, E.out3) * (1 - ea(t, s.T[1] - 0.15, s.T[1] + 0.3, E.in2)); if (al <= 0.003) return;
    const [cy, z] = camAt(s.cam, t), drift = (1 - ea(t, s.T[0] - 0.05, s.T[0] + 0.6, E.out4)) * 40 - ea(t, s.T[1] - 0.15, s.T[1] + 0.3, E.in2) * 40;
    ctx.save(); ctx.globalAlpha *= al; ctx.translate(CX, 800 + drift); ctx.scale(z, z); ctx.translate(-CX, -cy);
    for (const e of s.edges) edge(t, e);
    for (const n of s.nodes) (n.kind === 'person' ? person : n.kind === 'tag' ? tag : n.kind === 'tile' ? tile : card)(t, n);
    ctx.restore();
  };


  // a tile: a big icon in a ring, the label under it (the "what to plan" grid)
  const tile = (t, n) => {
    const e = pop(t, n.t); if (e <= 0.003) return; const { x, y, w, h } = n, x0 = x - w / 2, y0 = y - h / 2;
    ctx.save(); ctx.globalAlpha *= clamp(ea(t, n.t, n.t + 0.25) * 1.2); ctx.translate(x, y); ctx.scale(lerp(0.86, 1, e), lerp(0.86, 1, e)); ctx.translate(-x, -y);
    box(x0, y0, w, h, 26, GOLD_A + '0.45)'); const cy = y0 + 72; glow(x, cy, 70, '233,196,124', 0.18); dot(x, cy, 46, '#1A1712'); ring(x, cy, 46, { color: GOLD, w: 3 });
    icon(n.icon, x, cy, 24, { p: ea(t, n.t + 0.1, n.t + 0.7), color: GOLD, w: 4 });
    const f = F.d(800, 32); n.title.split('\n').forEach((l, i, a) => T(l, x, y0 + h - 34 - (a.length - 1 - i) * 38, { font: f, ls: 1, color: '#FFFFFF', sx: fit(l, f, w - 30, 1) }));
    ctx.restore();
  };

  // ---------------------------------------------------------------- pages (marker on the exact words)
  const lineBoxes = (rects) => { const L = []; for (const [x, y, w, h] of rects) { const l = L.find(q => Math.abs(q.y - y) < 12); if (l) { l.x0 = Math.min(l.x0, x); l.x1 = Math.max(l.x1, x + w); } else L.push({ x0: x, x1: x + w, y, h }); } return L.sort((a, b) => a.y - b.y).map(l => [l.x0, l.y, l.x1 - l.x0, l.h]); };
  const page = (id, img, T, stops, marks, k0 = 0.95) => {
    const keys = [[0, 538, 330, k0, 0]]; let pr = 0, pc = [538, 330, k0, 0];
    if (stops.length && stops[0][0] - T[0] < 0.9) { pc = [540, stops[0][1] - 110, 0.92, 10]; keys[0] = [0, ...pc]; }
    for (const [ta, cy, k = 0.97] of stops) { const r = ta - T[0]; keys.push([Math.max(r - 0.75, pr + 0.05), ...pc]); pc = [540, cy, k, 16]; keys.push([r, ...pc]); pr = r; }
    keys.push([dur(T) + 0.5, pc[0], pc[1] + 6, pc[2] * 1.03, pc[3] + 2]);
    const hl = []; for (const [pi, t0, t1] of marks) { const ls = lineBoxes(PAGES[img].boxes[pi]), tot = ls.reduce((s, b) => s + b[2], 0); let acc = 0; for (const b of ls) { const a = t0 + (t1 - t0) * acc / tot; acc += b[2]; hl.push({ bbox: b, t0: a, t1: t0 + (t1 - t0) * acc / tot }); } }
    add({ id, kind: 'page', img, a: T[0], b: T[1], keys, hl });
  };
  const qy = (img, pi) => { const r = PAGES[img].boxes[pi]; return (Math.min(...r.map(b => b[1])) + Math.max(...r.map(b => b[1] + b[3]))) / 2; };
  page('p_rock', 'ta_rock', P_rock, [[P_rock[0] + 0.1, (qy('ta_rock', 0) + qy('ta_rock', 1)) / 2]], [[0, K.n87 - 0.25, K.n87 + 0.7], [1, K.n5 - 0.4, K.amenities + 0.6]]);
  page('p_berk', 'ell_pr', P_berk, [[P_berk[0] + 0.1, qy('ell_pr', 0) + 120], [K.robotic - 0.1, qy('ell_pr', 1)]], [[0, K.rises - 0.1, K.floors2 + 0.3], [1, K.robotic, K.lifts + 0.7]]);
  page('p_ahs', 'ahs_pr', P_ahs, [[P_ahs[0] + 0.1, (qy('ahs_pr', 0) + qy('ahs_pr', 1)) / 2]], [[0, K.announced3, K.dubai3 + 0.4], [1, K.transform - 0.2, K.offices3 + 0.4]]);
  page('p_dawn', 'kt_o1ne', P_dawn, [[P_dawn[0] + 0.1, qy('kt_o1ne', 1)], [K.six - 0.15, qy('kt_o1ne', 0)]], [[1, K.first2 - 0.2, K.six - 0.9], [0, K.six - 0.05, K.spaces + 0.4]]);
  page('p_yards', 'beyond_yp', P_yards, [[P_yards[0] + 0.1, qy('beyond_yp', 0)]], [[0, K.n272 - 0.2, K.dining2 + 0.5]]);

  // ---------------------------------------------------------------- the maps
  const calloutEN = (t, cam, [lon, lat], label, sub, color, a0, a1, dx = 0, dy = -150) => {
    const al = ea(t, a0, a0 + 0.3) * (a1 ? 1 - ea(t, a1, a1 + 0.4) : 1); if (al <= 0.003) return;
    const [ax, ay] = satProj(cam, lon, lat), f = F.d(800, 30), f2 = F.d(700, 21), tw2 = Math.max(M(label, f, 1), sub ? M(sub, f2, 2) : 0), pw = Math.min(SAFE.w, tw2 + 70), ph = sub ? 100 : 66;
    const lx = clamp(ax + dx, SAFE.x0 + pw / 2, SAFE.x1 - pw / 2), ly = clamp(ay + dy, 620 + ph / 2, 1270 - ph / 2), e = ea(t, a0, a0 + 0.5, E.back), p = ea(t, a0 - 0.1, a0 + 0.35, E.out3);
    const ex = clamp(ax, lx - pw / 2 + 24, lx + pw / 2 - 24), ey = ay < ly ? ly - ph / 2 : ly + ph / 2, my = lerp(ay, ey, 0.55);
    ctx.save(); ctx.globalAlpha *= al; ring(ax, ay, 15, { color: '#FFFFFF', w: 3 }); dot(ax, ay, 6.5, '#FFFFFF');
    const leg = [[ax, ay], [ax, my], [ex, my], [ex, ey]].filter((q, i, arr) => !i || Math.hypot(q[0] - arr[i - 1][0], q[1] - arr[i - 1][1]) > 0.5);
    strokePoly(leg, p, { color: 'rgba(8,9,11,0.6)', w: 6 }); strokePoly(leg, p, { color: '#FFFFFF', w: 2.5 });
    ctx.translate(lx, ly); ctx.scale(lerp(0.88, 1, e), lerp(0.88, 1, e)); ctx.globalAlpha *= clamp(e * 1.4);
    ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 18 * SS; rr(-pw / 2, -ph / 2, pw, ph, 18); ctx.fillStyle = 'rgba(10,11,14,0.9)'; ctx.fill(); ctx.shadowColor = 'transparent';
    rr(-pw / 2, -ph / 2, 10, ph, [18, 0, 0, 18]); ctx.fillStyle = color; ctx.fill();
    T(label, -pw / 2 + 32, -ph / 2 + 44, { font: f, ls: 1, color: '#FFFFFF', align: 'left', sx: fit(label, f, pw - 50, 1) }); if (sub) T(sub, -pw / 2 + 32, ph / 2 - 22, { font: f2, ls: 2, color, align: 'left', sx: fit(sub, f2, pw - 50, 2) });
    ctx.restore();
  };
  const numPin = (t, cam, [lon, lat], n, a0, a1, badge) => {                         // a numbered site marker (1, 2, 3) with an optional badge
    const e = ea(t, a0, a0 + 0.5, E.back) * (a1 ? 1 - ea(t, a1, a1 + 0.3) : 1); if (e <= 0.003) return; const [x, y] = satProj(cam, lon, lat);
    ctx.save(); ctx.globalAlpha *= clamp(e); glow(x, y, 70, '233,196,124', 0.45); ctx.translate(x, y); ctx.scale(lerp(0.6, 1, e), lerp(0.6, 1, e)); dot(0, 0, 30, GOLD); ring(0, 0, 38, { color: '#FFFFFF', w: 3 }); T(String(n), 0, 12, { font: F.d(800, 34), color: '#17181B' });
    if (badge) { const be = ea(t, badge, badge + 0.4, E.back); if (be > 0.003) { const f = F.d(800, 22), w = M('MASTER PLAN ✓', f, 2) + 36; ctx.globalAlpha *= clamp(be); rr(46, -22, w, 44, 22); ctx.fillStyle = '#1A1712'; ctx.fill(); ctx.strokeStyle = TEAL[0]; ctx.lineWidth = 2; ctx.stroke(); T('MASTER PLAN ✓', 46 + w / 2, 8, { font: f, ls: 2, color: TEAL[1] }); } }
    ctx.restore();
  };
  const flight = (id, T, keys, top) => { SAT_SCENES[id] = { a: T[0], b: T[1], veil: 'map', keys: keys.map(k => camKey(...k)).sort((p, q) => p[0] - q[0]) }; add({ id, kind: 'sat', a: T[0], b: T[1], cfg: { top } }); };
  const mapTagEN = (t, cam, [lon, lat], txt, a0, a1, dy) => {                         // a small labelled marker on the map (the overview)
    const e = ea(t, a0, a0 + 0.45, E.back) * (a1 ? 1 - ea(t, a1, a1 + 0.3) : 1); if (e <= 0.003) return;
    const [x, y] = satProj(cam, lon, lat), f = F.d(800, 26), w = M(txt, f, 2) + 44, lx = clamp(x, SAFE.x0 + w / 2, SAFE.x1 - w / 2), ly = clamp(y + dy, 620, 1270);
    ctx.save(); ctx.globalAlpha *= clamp(e); ring(x, y, 16, { color: '#FFFFFF', w: 3 }); dot(x, y, 7, '#FFFFFF');
    ctx.translate(lx, ly); ctx.scale(lerp(0.85, 1, e), lerp(0.85, 1, e)); rr(-w / 2, -26, w, 52, 26); ctx.fillStyle = 'rgba(10,11,14,0.92)'; ctx.fill(); ctx.strokeStyle = GOLD; ctx.lineWidth = 2; ctx.stroke();
    T(txt, 0, 10, { font: f, ls: 2, color: '#FFFFFF' }); ctx.restore();
  };
  const pinN = (t, cam, pt, n, a0, a1, hot) => {                                     // a numbered site pin; hot = the one being talked about
    const e = ea(t, a0, a0 + 0.45, E.back) * (a1 ? 1 - ea(t, a1, a1 + 0.3) : 1); if (e <= 0.003) return; const [x, y] = satProj(cam, pt[0], pt[1]);
    ctx.save(); ctx.globalAlpha *= clamp(e); if (hot) glow(x, y, 80, '233,196,124', 0.5); ctx.translate(x, y); ctx.scale(lerp(0.6, 1, e), lerp(0.6, 1, e));
    dot(0, 0, hot ? 30 : 24, hot ? GOLD : '#F3EFE6'); ring(0, 0, hot ? 38 : 30, { color: '#FFFFFF', w: 3 }); T(String(n), 0, hot ? 12 : 10, { font: F.d(800, hot ? 34 : 28), color: '#17181B' }); ctx.restore();
  };
  flight('m0', M0, [[0, 55.27, 25.135, 11.15, 0, 10], [dur(M0) + 0.5, 55.275, 25.13, 11.35, 0, 20]], (t, cam) => {
    mapRoad(t, cam, 'E11', { a0: 0.3, dur: 1.4, alpha: 0.9 }); mapRoad(t, cam, 'E311', { a0: 0.6, dur: 1.4, alpha: 0.75, color: '#F3EFE6' });
    pinN(t, cam, P.ahs, 3, K.five + 0.1, 0); pinN(t, cam, P.rock, 1, K.five + 0.25, 0); pinN(t, cam, P.berk, 2, K.five + 0.4, 0); pinN(t, cam, P.dawn, 4, K.five + 0.55, 0); pinN(t, cam, P.yards, 5, K.five + 0.7, 0);
    mapTagEN(t, cam, P.rock, 'SHEIKH ZAYED RD · BUSINESS BAY', K.locations - 0.1, 0, -120);
    mapTagEN(t, cam, P.dawn, 'MOTOR CITY', K.locations + 0.2, 0, 100);
    mapTagEN(t, cam, P.yards, 'CITY OF ARABIA', K.locations + 0.4, 0, -100);
  });
  flight('m1', M1, [[0, 55.266, 25.199, 13.4, 0, 20], [dur(M1) + 0.5, 55.266, 25.199, 13.6, 0, 26]], (t, cam) => {
    mapArea(t, cam, 'bbay', { c: BLUE, a0: M1[0], dur: 0.8, base: 0.25 }); mapArea(t, cam, 'downtown', { c: GOLDS, a0: M1[0] + 0.1, dur: 0.8, base: 0.25 });
    mapRoad(t, cam, 'E11', { a0: M1[0], dur: 0.8, alpha: 0.9 });
    pinN(t, cam, P.ahs, 3, M1[0] + 0.2, 0); pinN(t, cam, P.berk, 2, M1[0] + 0.3, 0); pinN(t, cam, P.rock, 1, M1[0] + 0.1, 0, true);
    calloutEN(t, cam, P.rock, 'ROCKEFELLER BUSINESS TOWER', '400 M · 87 STOREYS', GOLD, M1[0] + 0.4, 0, 120, 240);
  });
  flight('m4', M4, [[0, 55.235, 25.05, 12.9, 0, 20], [dur(M4) + 0.5, 55.235, 25.05, 13.1, 0, 26]], (t, cam) => {
    mapArea(t, cam, 'motor', { c: TEAL, a0: M4[0] + 0.05, dur: 0.9, on: [M4[0] + 0.2, M4[1]], base: 0.35 });
    pinN(t, cam, P.dawn, 4, M4[0] + 0.3, 0, true);
    calloutEN(t, cam, P.dawn, 'O1NE DISTRICT · MOTOR CITY', 'NEXT TO DUBAI AUTODROME', TEAL[1], M4[0] + 0.5, 0, 0, 230);
  });
  flight('m5', M5, [[0, 55.31, 25.085, 12.4, 0, 20], [dur(M5) + 0.5, 55.315, 25.085, 12.6, 0, 26]], (t, cam) => {
    mapRoad(t, cam, 'E311', { a0: M5[0] + 0.1, dur: 1.0, alpha: 0.95, hi: ea(t, K.sheikh2 - 0.1, K.sheikh2 + 0.4) });
    pinN(t, cam, P.yards, 5, M5[0] + 0.3, 0, true);
    calloutEN(t, cam, P.yards, 'CITY OF ARABIA', 'SHEIKH MOHAMMED BIN ZAYED RD', GOLD, M5[0] + 0.5, 0, -40, 230);
  });

  // ---------------------------------------------------------------- roadmap branches (screen coordinates: camera at y 800)
  const ST = (T) => [[T[0], 800, 1], [T[1], 812, 1.015]];
  const rows = (t, T0, items) => {                                                    // status rows: ok (teal check), no (red cross), q (amber question)
    const al = win(t, T0[0], T0[1] - 0.15); if (al <= 0.003) return; ctx.save(); ctx.globalAlpha *= al;
    items.forEach(([y, a, txt, sub, kind]) => { const e = ea(t, a - 0.1, a + 0.4, E.out4); if (e <= 0.003) return; ctx.save(); ctx.globalAlpha *= e; ctx.translate((1 - e) * -30, 0);
      const col = kind === 'ok' ? TEAL[0] : kind === 'no' ? '#E5484D' : AMBER, colL = kind === 'ok' ? TEAL[1] : kind === 'no' ? RED2 : AMBER;
      box(SAFE.x0, y, SAFE.w, 140, 28, col + '99'); const cx = SAFE.x1 - 70, cy = y + 70, p = ea(t, a + 0.15, a + 0.55);
      dot(cx, cy, 36, col + '2E'); if (kind === 'ok') icon('check', cx, cy + 2, 18, { p, color: col, w: 5 }); else if (kind === 'q') T('?', cx, cy + 16, { font: F.d(800, 46), color: AMBER, alpha: p });
      else { ctx.strokeStyle = RED2; ctx.lineWidth = 6; ctx.lineCap = 'round'; const q = 14; ctx.beginPath(); ctx.moveTo(cx - q, cy - q); ctx.lineTo(cx - q + 2 * q * clamp(p * 2), cy - q + 2 * q * clamp(p * 2)); ctx.stroke(); if (p > 0.5) { const b = clamp(p * 2 - 1); ctx.beginPath(); ctx.moveTo(cx + q, cy - q); ctx.lineTo(cx + q - 2 * q * b, cy - q + 2 * q * b); ctx.stroke(); } }
      T(txt, SAFE.x0 + 40, y + 64, { font: F.d(800, 38), color: '#FFFFFF', align: 'left', sx: fit(txt, F.d(800, 38), SAFE.w - 170) }); T(sub, SAFE.x0 + 40, y + 106, { font: F.d(700, 23), ls: 3, color: colL, align: 'left', sx: fit(sub, F.d(700, 23), SAFE.w - 170, 3) }); ctx.restore(); });
    ctx.restore();
  };
  // one render card per project: number badge, developer logo, the project and where it is
  const projCard = (T, img, logo, n, title, sub, credit, fy = 0.5, extra = []) => section(T, ST(T), [
    { kind: 'tag', x: CX, y: 610, w: 300, h: 66, icon: 'flag', title: `NO. ${n}`, t: T[0] + 0.05 },
    { x: CX, y: 900, w: 820, h: 420, photo: img, logo, t: T[0] + 0.15, title, sub, subT: T[0] + 0.5, credit, fs: 38, fy },
  ].concat(extra), [ { pts: [[CX, 643], [CX, 690]], t: T[0] + 0.1, c: 'w', d: 0.25 } ]);
  projCard(C_rock, 'r_rock', 'lmd', 1, 'CHRISTIAN A. ROCKEFELLER\nBUSINESS TOWER', 'BY LMD · SHEIKH ZAYED ROAD', 'RENDER · LMD');
  projCard(C_berk, 'r_berk', 'ell', 2, 'BERKELEY TOWER', 'ELLINGTON × AL HAMRA · BUSINESS BAY', 'RENDER · ELLINGTON');
  projCard(C_ahs, 'r_ahs', 'ahs', 3, 'AHS TWIN TOWERS', 'THE FORMER SHANGRI-LA DUBAI', 'RENDER · AHS PROPERTIES');
  projCard(C_dawn, 'r_dawn', 'avenew', 4, 'DAWN · O1NE DISTRICT', 'AVENEW × KORA · MOTOR CITY', 'RENDER · AVENEW');
  projCard(C_yards, 'r_yards', 'beyond', 5, 'THE YARDS PLAZA', 'BY BEYOND · CITY OF ARABIA', 'RENDER · BEYOND');
  const R_ahsRows = t => rows(t, R_ahs, [[700, R_ahs[0] + 0.05, 'A CONVERSION PROJECT', 'UNDERSTAND THE SCOPE OF WORK', 'q'], [860, K.delivery - 0.2, 'DELIVERY COMMITMENTS', 'CHECK THEM IN WRITING', 'q']]);
  // what decides it: who, how they get there, what it costs to own
  section(T1, ST(T1), [
    { kind: 'tile', x: 265, y: 800, w: 250, h: 220, icon: 'briefcase', title: 'WHO USES\nIT', t: K.who - 0.15 },
    { kind: 'tile', x: 540, y: 800, w: 250, h: 220, icon: 'plane', title: 'HOW THEY\nGET THERE', t: K.how - 0.15 },
    { kind: 'tile', x: 815, y: 800, w: 250, h: 220, icon: 'tag', title: 'COST TO\nOWN', t: K.what - 0.15 },
  ], []);
  const CMP = [['PARKING', K.parking], ['USABLE SPACE', K.usable], ['FIT-OUT COSTS', K.fitout], ['SERVICE CHARGES', K.service], ['PAYMENT SCHEDULE', K.payment], ['PURCHASE PRICE', K.purchase]];
  section(T2, ST(T2), CMP.map(([ti, a], i) => ({ kind: 'tag', x: i % 2 ? 745 : 335, y: 660 + Math.floor(i / 2) * 120, w: 390, h: 84, icon: i === 5 ? 'tag' : 'check', title: ti, t: a - 0.15 })), []);
  const srcChip = (t, txt, a0, a1) => { const al = win(t, a0, a1); if (al <= 0.003) return; const f = F.d(800, 24), w = Math.min(SAFE.w, M(txt, f, 2) + 48); ctx.save(); ctx.globalAlpha *= al; glassPill(CX - w / 2, 1172, w, 52, 26); T(txt, CX, 1207, { font: f, ls: 2, color: '#FFFFFF', sx: Math.min(1, (SAFE.w - 48) / M(txt, f, 2)) }); ctx.restore(); };
  const note332 = (t) => { const al = win(t, K.n332 - 0.1, P_rock[1] - 0.15); if (al <= 0.003) return; const txt = '332 OFFICES · PER A BROKER LISTING', f = F.d(800, 24), w = M(txt, f, 2) + 56;
    ctx.save(); ctx.globalAlpha *= al; rr(CX - w / 2, 1094, w, 58, 29); ctx.fillStyle = '#1A1712'; ctx.fill(); ctx.strokeStyle = AMBER; ctx.lineWidth = 2.5; ctx.stroke(); T(txt, CX, 1132, { font: f, ls: 2, color: AMBER }); ctx.restore(); };

  const overlay = (t) => {
    for (const s of SECT) drawSection(t, s);
    R_ahsRows(t); note332(t);
    hudTitle(t, 'BEFORE YOU BUY AN OFFICE', 'FIVE LAUNCHES', 'DIFFERENT LOCATIONS · LAYOUTS', 0.15, M0[1] - 0.15, GOLD);
    hudTitle(t, 'NO. 1 · SHEIKH ZAYED ROAD', 'ROCKEFELLER TOWER', 'BY LMD', C_rock[0] + 0.05, P_rock[1] - 0.15, GOLD);
    hudTitle(t, 'NO. 1', 'A HIGH-RISE ADDRESS', 'BETWEEN BUSINESS BAY AND DOWNTOWN', M1[0] + 0.05, M1[1] - 0.15, GOLD);
    hudTitle(t, 'NO. 2 · BUSINESS BAY', 'BERKELEY TOWER', 'ELLINGTON × AL HAMRA', C_berk[0] + 0.05, P_berk[1] - 0.15, GOLD);
    hudTitle(t, 'NO. 3 · SHEIKH ZAYED ROAD', 'AHS TWIN TOWERS', 'ACQUIRED JUN 2026 · OFFICES OCT 2026', C_ahs[0] + 0.05, P_ahs[1] - 0.15, GOLD);
    hudTitle(t, 'NO. 3', 'A CONVERSION', 'NOT A NEW BUILD', R_ahs[0] + 0.05, R_ahs[1] - 0.15, AMBER);
    hudTitle(t, 'NO. 4 · MOTOR CITY', 'DAWN · O1NE DISTRICT', 'AVENEW × KORA', C_dawn[0] + 0.05, P_dawn[1] - 0.15, TEAL[1]);
    hudTitle(t, 'NO. 5 · CITY OF ARABIA', 'THE YARDS PLAZA', 'BY BEYOND', C_yards[0] + 0.05, P_yards[1] - 0.15, GOLD);
    hudTitle(t, 'FIVE PROJECTS', 'THE RIGHT CHOICE', 'DEPENDS ON YOUR OFFICE', T1[0] + 0.05, T1[1] - 0.15, GOLD);
    hudTitle(t, 'COMPARE', 'THE FULL COST', 'ALONGSIDE THE PURCHASE PRICE', T2[0] + 0.05, T2[1] - 0.15, GOLD);
    srcChip(t, 'TRADEARABIA · 22 OCT 2026', P_rock[0] + 0.2, P_rock[1] - 0.15); srcChip(t, 'ELLINGTON PROPERTIES · 20 OCT 2026', P_berk[0] + 0.2, P_berk[1] - 0.15);
    srcChip(t, 'AHS PROPERTIES · BUSINESS WIRE · 27 OCT 2026', P_ahs[0] + 0.2, P_ahs[1] - 0.15); srcChip(t, 'KHALEEJ TIMES · 8 JUL 2026', P_dawn[0] + 0.2, P_dawn[1] - 0.15);
    srcChip(t, 'BEYOND DEVELOPMENTS · THE YARDS PLAZA', P_yards[0] + 0.2, P_yards[1] - 0.15);
    // the call to action: comment OFFICE with your budget; for your business or to rent out
    const ce = ea(t, K.comment - 0.1, K.comment + 0.5, E.out4);
    if (ce > 0.003) {
      ctx.save(); ctx.globalAlpha *= ce; ctx.fillStyle = 'rgba(8,8,10,0.9)'; ctx.fillRect(0, 0, W, H); T('ABDULLAH AHLI', CX, 640, { font: F.d(800, 62), ls: 2, color: C.ink }); T('PORTFOLIO STRATEGIST', CX, 694, { font: F.d(700, 34), ls: 6, color: C.gold }); ctx.restore();
      const msg = 'OFFICE', send = K.OFFICE + 0.45, sent = ea(t, send, send + 0.35), ia = ea(t, K.comment + 0.05, K.comment + 0.45, E.out4), iy = 1260, X0 = SAFE.x0, X1 = SAFE.x1, BW = X1 - X0, typed = msg.slice(0, Math.floor(msg.length * ea(t, K.OFFICE - 0.05, K.OFFICE + 0.3, E.lin) + 0.0001)), fm = F.d(700, 58);
      ctx.save(); ctx.globalAlpha *= ia; rr(X0, iy - 65, BW, 130, 65); ctx.fillStyle = C.panel; ctx.fill(); ctx.strokeStyle = 'rgba(243,239,230,0.28)'; ctx.lineWidth = 3; ctx.stroke();
      T(typed, X0 + 56, iy + 20, { font: fm, color: C.ink, align: 'left', alpha: 1 - sent }); T('Add a comment…', X0 + 56, iy + 20, { font: F.d(700, 54), color: C.mute, align: 'left', alpha: (1 - ea(t, K.OFFICE - 0.05, K.OFFICE + 0.05)) * (1 - sent) });
      dot(X1 - 66, iy, 48, C.gold); icon('plane', X1 - 66, iy, 20, { p: 1, color: '#17181B', w: 4.5, rot: -0.5 + 0.5 * sent }); ctx.restore();
      const b1 = ea(t, send, send + 0.5, E.out4);
      if (b1 > 0.002) { ctx.save(); ctx.globalAlpha *= b1; ctx.translate(0, (1 - b1) * 36); const w = M(msg, fm) + 84; rr(X1 - w, 770, w, 112, 56); ctx.fillStyle = C.gold; ctx.fill(); T(msg, X1 - w / 2, 845, { font: fm, color: '#17181B' }); ctx.restore(); }
      const fc = F.d(800, 32), chip = (txt, a, xr, y) => { const e = ea(t, a, a + 0.45, E.back); if (e <= 0.003) return; const w = M(txt, fc, 2) + 60; ctx.save(); ctx.globalAlpha *= clamp(e); ctx.translate(xr - w / 2, y); ctx.scale(lerp(0.8, 1, e), lerp(0.8, 1, e)); rr(-w / 2, -36, w, 72, 36); ctx.fillStyle = '#1A1712'; ctx.fill(); ctx.strokeStyle = GOLD; ctx.lineWidth = 2.5; ctx.stroke(); T(txt, 0, 11, { font: fc, ls: 2, color: GOLD }); ctx.restore(); return w; };
      chip('YOUR BUDGET', K.budget - 0.15, X1, 960);
      const wr = M('TO RENT OUT', fc, 2) + 60; chip('TO RENT OUT', K.rent - 0.15, X1, 1052); chip('FOR YOUR BUSINESS', K.business - 0.15, X1 - wr - 18, 1052);
      const b2 = ea(t, K.lets - 0.2, K.lets + 0.3, E.out4);
      if (b2 > 0.002) { ctx.save(); ctx.globalAlpha *= b2; ctx.translate(0, (1 - b2) * 30); const txt = "Let's narrow down the options", f = F.d(700, 38), w = Math.min(BW, M(txt, f) + 120); rr(X0, 1100 + 0, w, 0, 0); ctx.restore(); T(txt, CX, 1160, { font: f, color: C.ink, alpha: b2 }); }
    }
  };
  OVERLAYS.push(overlay);

  [M0[0] + 0.2, C_rock[0], P_rock[0], M1[0], C_berk[0], P_berk[0], C_ahs[0], P_ahs[0], R_ahs[0], C_dawn[0], M4[0], P_dawn[0], C_yards[0], M5[0], P_yards[0], T1[0], T2[0], K.comment].forEach(x => cues.push({ k: 'wh', t: x - 0.2, d: 0.5 }));
  [K.n87, K.n272].forEach(x => cues.push({ k: 'pin', t: x })); cues.push({ k: 'send', t: K.OFFICE + 0.45 });
  return { FACE_SEGS, PUNCHES, SCENES, OVERLAYS, cues, IMAGES, BUBBLE, FOOT_MAX: Math.min(TL.frames, 5424) - 1, NO_CAPTIONS: false, CAP_UNTIL: VEND, STATIC_FACE: false };
}
