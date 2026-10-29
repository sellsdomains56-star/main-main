'use strict';
// ---------------------------------------------------------------------------
// "Palm Springs by Nakheel is a proposed new villa and townhouse community near Palm Jebel Ali" - HeyGen cfdcf947 (53.6 s, English).  60 fps.
// Same look as ../dh-villa-pja (the same project: map + roadmap + real pages), his face SMALL the whole time.
// Facts (research 29 Oct 2026, scratchpad research_villa.md): Palm Springs is reported only by broker / channel-partner listings (28-29 Oct 2026):
// Nakheel (Dubai Holding Real Estate), Hessyan First / Jebel Ali, access via Sheikh Zayed Road and D53, 3-4 bed townhouses and 4-5 bed villas;
// no plot, price, payment plan or handover published; nothing on the Nakheel / Dubai Holding press pages -> "proposed", approximate area, no price.
// Dubai Media Office 28 Apr 2024: AED128 billion terminal, 260 million passengers.  jafza.ae: 11,000+ businesses.  Palm Jebel Ali: 13.4 km2.
// Map: (c) OpenStreetMap contributors (ODbL); imagery (c) Esri, Maxar, Earthstar Geographics.  Safe zone: x 130-950, y 300-1420.
// ---------------------------------------------------------------------------
function buildScenes() {
  const cues = [], SCENES = [], PUNCHES = [], OVERLAYS = [], add = (s) => { SCENES.push(s); return s; };
  const A = (w, from = 0) => { const n = s => s.toUpperCase().replace(/[.,?!:;]+$/, ''); const x = TL.words.find(q => q.t >= from - 1e-6 && n(q.text) === n(w)); if (!x) console.error('anchor missing: ' + w + ' @' + from); return x ? x.t : from; };
  const VEND = TL.voice_dur, END = TL.dur;
  const GOLD = '#E9C47C', GOLD_A = 'rgba(233,196,124,', WHITE_A = 'rgba(243,239,230,', RED = '#E5484D', RED2 = '#FF8A8E', AMBER = '#FFB547', TEAL = ['#2FD8A0', '#A6F3D6'], BLUE = ['#3DB2FF', '#A9DEFF'], GOLDS = ['#C99A4A', '#F3D9A4'], WHITES = ['#F3EFE6', '#FFFFFF'];
  const IMAGES = Object.fromEntries(Object.keys(PAGES).map(k => [k, `assets/${k}.png`]));
  const LOGO = { nakheel: 'nakheel_logo_white_original' };
  for (const [k, f] of Object.entries(LOGO)) IMAGES['L_' + k] = `assets/img/${f}.png`;
  const DARK_PLATE = new Set(['nakheel']);
  const P = GEO.x.points || {};
  const SITE = [55.052, 24.957];                                                    // the reported area: Hessyan 1 beside D53 / Sheikh Zayed Road (approximate; no plot published)
  const TERM = [55.1592, 24.8864];                                                  // Al Maktoum International Airport passenger terminal (OSM way 170139991)
  const win = (t, a0, a1, d = 0.4) => ea(t, a0, a0 + d) * (1 - ea(t, a1, a1 + 0.4));
  const fit = (s, f, w, ls = 0) => Math.min(1, w / M(s, f, ls));
  const ok = id => IMG[id] && IMG[id].naturalWidth > 0;
  const dur = T => T[1] - T[0];
  HUD_X = 330;                                                                       // titles sit right of his bubble
  const BUBBLE = { t0: 0, src: { cx: 562, cy: 820, size: 600 }, keys: [{ t: 0, cx: 215, cy: 418, r: 78 }, { t: END, cx: 215, cy: 418, r: 78 }] };

  const K = {
    location: A('location'), price0: A('price.'), palm1: A('palm'), nakheel: A('nakheel'), proposed: A('proposed'), villa: A('villa'), townhouse: A('townhouse'), near: A('near'), palm2: A('palm', 8.6), sheikh: A('sheikh'),
    early: A('early'), contemporary: A('contemporary'), green: A('green'), spacious: A('spacious'), final: A('final'),
    but: A('but'), palm3: A('palm', 21.5), jafza: A('jafza'), and2: A('and', 26), b128: A('128'), al: A('al', 29), adds: A('adds'),
    for2: A('for', 34), villa2: A('villa', 35), launch: A('launch'), the2: A('the', 38.5), price: A('price', 40), plot: A('plot'), payment: A('payment'), handover: A('handover'), not: A('not', 44.5), waterfront: A('waterfront'),
    comment: A('comment'), SPRINGS: A('springs', 47), message: A('message'), budget: A('budget.'), confirmed: A('confirmed'),
  };
  const FACE_SEGS = [];
  const M0 = [0, K.palm1 - 0.12], S1 = [M0[1], K.near - 0.1], M1 = [S1[1], K.early - 0.12], R1 = [M1[1], K.but - 0.12], M2 = [R1[1], K.and2 - 0.12],
    P1 = [M2[1], K.adds - 0.12], M3 = [P1[1], K.for2 - 0.12], T1 = [M3[1], K.the2 - 0.12], C1 = [T1[1], K.comment - 0.12];

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
  page('p_dwc', 'dmo_dwc', P1, [[P1[0] + 0.1, qy('dmo_dwc', 0)]], [[0, K.and2 + 0.4, K.al + 1.0]]);

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
  const near = (t, cam, a0, a1) => { mapArea(t, cam, 'hessyan1', { c: TEAL, a0, dur: 0.8, on: [a0 + 0.2, a1 || 999], base: 0.35, a1 }); mapPulse(t, cam, SITE[0], SITE[1], 650, a0 + 0.2, a1); };
  flight('m0', M0, [[0, 55.085, 25.0, 11.45, 0, 10], [dur(M0) + 0.5, 55.035, 24.985, 12.0, 0, 22]], (t, cam) => {
    mapRoad(t, cam, 'E11', { a0: 0.3, dur: 1.6, alpha: 0.95 });
    near(t, cam, K.location - 0.2);
  });
  flight('m1', M1, [[0, 55.03, 24.985, 12.2, 0, 18], [dur(M1) + 0.5, 55.03, 24.985, 12.45, 0, 24]], (t, cam) => {
    mapRoad(t, cam, 'E11', { a0: M1[0] - 2, dur: 0.1, alpha: 0.95, hi: ea(t, K.sheikh - 0.1, K.sheikh + 0.4) });
    near(t, cam, M1[0] - 2);
    calloutEN(t, cam, SITE, 'REPORTED AREA', 'HESSYAN 1 · PLOT NOT PUBLISHED', TEAL[1], M1[0] + 0.3, 0, 40, 230);
    mapArea(t, cam, 'palm', { c: GOLDS, a0: K.palm2 - 0.3, dur: 0.9, on: [K.palm2 - 0.1, M1[1]], base: 0.45 });
    calloutEN(t, cam, P.palm, 'PALM JEBEL ALI', '', GOLD, K.palm2 - 0.1, 0, 60, -200);
  });
  flight('m2', M2, [[0, 55.035, 24.99, 12.0, 0, 18], [dur(M2) + 0.5, 55.035, 24.99, 12.2, 0, 22]], (t, cam) => {
    mapRoad(t, cam, 'E11', { a0: M2[0] - 2, dur: 0.1, alpha: 0.85 }); near(t, cam, M2[0] - 2);
    mapArea(t, cam, 'palm', { c: GOLDS, a0: K.palm3 - 0.3, dur: 0.8, on: [K.palm3 - 0.1, M2[1]], base: 0.45 });
    mapArea(t, cam, 'jafza', { c: BLUE, a0: K.jafza - 0.3, dur: 0.8, on: [K.jafza - 0.1, M2[1]], base: 0.45 });
    mapTagEN(t, cam, P.palm, 'DEVELOPING COAST', K.palm3, 0, -110);
    mapTagEN(t, cam, P.jafza, 'EMPLOYMENT HUB', K.jafza, 0, -100);
  });
  flight('m3', M3, [[0, 55.08, 24.94, 11.6, 0, 18], [dur(M3) + 0.5, 55.095, 24.935, 11.75, 0, 22]], (t, cam) => {
    mapRoad(t, cam, 'E11', { a0: M3[0] - 2, dur: 0.1, alpha: 0.85 }); near(t, cam, M3[0] - 2);
    mapArea(t, cam, 'jafza', { c: BLUE, a0: M3[0] - 2, dur: 0.1, base: 0.3 }); mapArea(t, cam, 'palm', { c: GOLDS, a0: M3[0] - 2, dur: 0.1, base: 0.3 });
    mapArea(t, cam, 'dwc', { c: BLUE, a0: M3[0] + 0.05, dur: 0.9, on: [M3[0] + 0.2, M3[1]], base: 0.45 });
    mapMeasure(t, cam, SITE, TERM, { a0: M3[0] + 0.5, dur: 1.0, to: 'THE TERMINAL', at: 0.5 });
    calloutEN(t, cam, P.dwc, 'AL MAKTOUM INTERNATIONAL AIRPORT', 'AED 128 BN EXPANSION', BLUE[1], M3[0] + 0.3, 0, -40, 250);
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
  // Palm Springs by Nakheel: proposed villas and townhouses
  section(S1, ST(S1), [
    { x: CX, y: 650, w: 820, h: 160, logo: 'nakheel', pw: 300, t: S1[0] + 0.05, title: 'PALM SPRINGS', sub: 'BY NAKHEEL · PROPOSED', subT: K.proposed - 0.1, fs: 40 },
    { kind: 'tile', x: 335, y: 900, w: 390, h: 210, icon: 'house', title: 'VILLAS', t: K.villa - 0.15 },
    { kind: 'tile', x: 745, y: 900, w: 390, h: 210, icon: 'building', title: 'TOWNHOUSES', t: K.townhouse - 0.15 },
  ], [ { pts: [[CX, 730], [CX, 762], [335, 762], [335, 795]], t: K.villa - 0.45, d: 0.3 }, { pts: [[CX, 762], [745, 762], [745, 795]], t: K.townhouse - 0.4, d: 0.3 } ]);
  const R1rows = t => rows(t, R1, [[620, K.contemporary - 0.15, 'CONTEMPORARY HOMES', 'EARLY MARKETING', 'q'], [770, K.green - 0.15, 'GREEN SURROUNDINGS', 'EARLY MARKETING', 'q'],
    [920, K.spacious - 0.15, 'SPACIOUS LAYOUTS', 'EARLY MARKETING', 'q'], [1070, K.final - 0.15, 'SPECS AND PRICES', 'NOT OFFICIALLY CONFIRMED', 'no']]);
  // for villa / townhouse buyers: a launch worth following
  section(T1, ST(T1), [
    { kind: 'tile', x: 335, y: 720, w: 390, h: 200, icon: 'house', title: 'VILLA BUYERS', t: K.villa2 - 0.3 },
    { kind: 'tile', x: 745, y: 720, w: 390, h: 200, icon: 'building', title: 'TOWNHOUSE BUYERS', t: K.villa2 + 0.2 },
    { kind: 'tag', x: CX, y: 960, w: 700, h: 76, icon: 'flag', title: 'A LAUNCH WORTH FOLLOWING', t: K.launch - 0.2 },
  ], [ { pts: [[335, 820], [335, 880], [CX, 880], [CX, 922]], t: K.launch - 0.5, d: 0.3 }, { pts: [[745, 820], [745, 880], [CX, 880]], t: K.launch - 0.45, d: 0.25 } ]);
  // the comparison that matters
  section(C1, ST(C1), [
    { kind: 'tile', x: 335, y: 740, w: 390, h: 200, icon: 'tag', title: 'PRICE PER SQ FT', t: K.price - 0.15 },
    { kind: 'tile', x: 745, y: 740, w: 390, h: 200, icon: 'house', title: 'PLOT SIZE', t: K.plot - 0.15 },
    { kind: 'tile', x: 335, y: 960, w: 390, h: 200, icon: 'doc', title: 'PAYMENT PLAN', t: K.payment - 0.15 },
    { kind: 'tile', x: 745, y: 960, w: 390, h: 200, icon: 'check', title: 'HANDOVER DATE', t: K.handover - 0.15 },
  ], []);
  const C1rows = t => rows(t, [K.not - 0.3, C1[1]], [[1085, K.not - 0.2, 'CHEAPER THAN WATERFRONT?', 'NOT THE RIGHT TEST ON ITS OWN', 'no']]);
  const srcChip = (t, txt, a0, a1) => { const al = win(t, a0, a1); if (al <= 0.003) return; const f = F.d(800, 24), w = Math.min(SAFE.w, M(txt, f, 2) + 48); ctx.save(); ctx.globalAlpha *= al; glassPill(CX - w / 2, 1172, w, 52, 26); T(txt, CX, 1207, { font: f, ls: 2, color: '#FFFFFF', sx: Math.min(1, (SAFE.w - 48) / M(txt, f, 2)) }); ctx.restore(); };

  const overlay = (t) => {
    for (const s of SECT) drawSection(t, s);
    R1rows(t); C1rows(t);
    hudTitle(t, "DON'T MISS THIS ONE", 'LOOK AT THE LOCATION', 'BEFORE YOU JUDGE THE PRICE', 0.15, M0[1] - 0.15, GOLD);
    hudTitle(t, 'NEW · BY NAKHEEL', 'PALM SPRINGS', 'PROPOSED VILLAS & TOWNHOUSES', S1[0] + 0.05, S1[1] - 0.15, GOLD);
    hudTitle(t, 'NEAR PALM JEBEL ALI', 'OFF SHEIKH ZAYED ROAD', 'EXACT SITE NOT YET CONFIRMED', M1[0] + 0.05, M1[1] - 0.15, TEAL[1]);
    hudTitle(t, 'EARLY MARKETING MATERIAL', 'WHAT IT POINTS TO', 'NOTHING FINAL YET', R1[0] + 0.05, R1[1] - 0.15, AMBER);
    hudTitle(t, "LOOK AT WHAT'S AROUND IT", 'COAST · JOBS', 'PALM JEBEL ALI · JAFZA', M2[0] + 0.05, M2[1] - 0.15, GOLD);
    hudTitle(t, 'AL MAKTOUM INTERNATIONAL AIRPORT', 'AED 128 BILLION', 'THE EXPANSION', P1[0] + 0.05, P1[1] - 0.15, BLUE[1]);
    hudTitle(t, 'ANOTHER MAJOR INVESTMENT', 'THIS SIDE OF DUBAI', '', M3[0] + 0.05, M3[1] - 0.15, BLUE[1]);
    hudTitle(t, 'FOR VILLA & TOWNHOUSE BUYERS', 'WORTH FOLLOWING', '', T1[0] + 0.05, T1[1] - 0.15, GOLD);
    hudTitle(t, 'THE REAL COMPARISON', 'PRICE PER SQ FT', 'PLOT · PAYMENT PLAN · HANDOVER', C1[0] + 0.05, C1[1] - 0.15, GOLD);
    srcChip(t, 'DUBAI MEDIA OFFICE · 28 APR 2024', P1[0] + 0.2, P1[1] - 0.15);
    // the call to action: comment SPRINGS, or message your budget
    const ce = ea(t, K.comment - 0.1, K.comment + 0.5, E.out4);
    if (ce > 0.003) {
      ctx.save(); ctx.globalAlpha *= ce; ctx.fillStyle = 'rgba(8,8,10,0.9)'; ctx.fillRect(0, 0, W, H); T('ABDULLAH AHLI', CX, 640, { font: F.d(800, 62), ls: 2, color: C.ink }); T('PORTFOLIO STRATEGIST', CX, 694, { font: F.d(700, 34), ls: 6, color: C.gold }); ctx.restore();
      const msg = 'SPRINGS', send = K.SPRINGS + 0.45, sent = ea(t, send, send + 0.35), ia = ea(t, K.comment + 0.05, K.comment + 0.45, E.out4), iy = 1260, X0 = SAFE.x0, X1 = SAFE.x1, BW = X1 - X0, typed = msg.slice(0, Math.floor(msg.length * ea(t, K.SPRINGS - 0.05, K.SPRINGS + 0.35, E.lin) + 0.0001)), fm = F.d(700, 58);
      ctx.save(); ctx.globalAlpha *= ia; rr(X0, iy - 65, BW, 130, 65); ctx.fillStyle = C.panel; ctx.fill(); ctx.strokeStyle = 'rgba(243,239,230,0.28)'; ctx.lineWidth = 3; ctx.stroke();
      T(typed, X0 + 56, iy + 20, { font: fm, color: C.ink, align: 'left', alpha: 1 - sent }); T('Add a comment…', X0 + 56, iy + 20, { font: F.d(700, 54), color: C.mute, align: 'left', alpha: (1 - ea(t, K.SPRINGS - 0.05, K.SPRINGS + 0.05)) * (1 - sent) });
      dot(X1 - 66, iy, 48, C.gold); icon('plane', X1 - 66, iy, 20, { p: 1, color: '#17181B', w: 4.5, rot: -0.5 + 0.5 * sent }); ctx.restore();
      const b1 = ea(t, send, send + 0.5, E.out4);
      if (b1 > 0.002) { ctx.save(); ctx.globalAlpha *= b1; ctx.translate(0, (1 - b1) * 36); const w = M(msg, fm) + 84; rr(X1 - w, 770, w, 112, 56); ctx.fillStyle = C.gold; ctx.fill(); T(msg, X1 - w / 2, 845, { font: fm, color: '#17181B' }); ctx.restore(); }
      { const e = ea(t, K.message - 0.15, K.message + 0.3, E.back), fc = F.d(800, 34), txt = 'OR DM YOUR BUDGET', w = M(txt, fc, 2) + 64; if (e > 0.003) { ctx.save(); ctx.globalAlpha *= clamp(e); ctx.translate(X1 - w / 2, 960); ctx.scale(lerp(0.8, 1, e), lerp(0.8, 1, e)); rr(-w / 2, -38, w, 76, 38); ctx.fillStyle = '#1A1712'; ctx.fill(); ctx.strokeStyle = GOLD; ctx.lineWidth = 2.5; ctx.stroke(); T(txt, 0, 12, { font: fc, ls: 2, color: GOLD }); ctx.restore(); } }
      const b2 = ea(t, K.confirmed - 0.35, K.confirmed + 0.15, E.out4);
      if (b2 > 0.002) { ctx.save(); ctx.globalAlpha *= b2; ctx.translate(0, (1 - b2) * 36); const txt = 'Launch details when confirmed', f = F.d(700, 40), w = Math.min(BW, M(txt, f) + 130); rr(X0, 1045, w, 104, 52); ctx.fillStyle = C.panel; ctx.fill(); ctx.strokeStyle = 'rgba(243,239,230,0.28)'; ctx.lineWidth = 3; ctx.stroke(); icon('check', X0 + 60, 1097, 20, { p: ea(t, K.confirmed - 0.1, K.confirmed + 0.3), color: C.gold, w: 4.5 }); T(txt, X0 + 104, 1111, { font: f, color: C.ink, align: 'left', sx: fit(txt, f, w - 130) }); ctx.restore(); }
    }
  };
  OVERLAYS.push(overlay);

  [M0[0] + 0.2, S1[0], M1[0], R1[0], M2[0], P1[0], M3[0], T1[0], C1[0], K.comment].forEach(x => cues.push({ k: 'wh', t: x - 0.2, d: 0.5 }));
  [K.b128].forEach(x => cues.push({ k: 'pin', t: x })); cues.push({ k: 'send', t: K.SPRINGS + 0.45 });
  return { FACE_SEGS, PUNCHES, SCENES, OVERLAYS, cues, IMAGES, BUBBLE, FOOT_MAX: Math.min(TL.frames, 3214) - 1, NO_CAPTIONS: false, CAP_UNTIL: VEND, STATIC_FACE: false };
}
