'use strict';
// ---------------------------------------------------------------------------
// "Buying on Palm Jumeirah? These five addresses offer very different versions of luxury" - HeyGen a6cbddda (59.8 s, English).  60 fps.
// The map where the place matters (Palm outline from OSM, five numbered addresses), real pages with a marker on the exact words, his face SMALL.
// Facts (research 31 Oct 2026, scratchpad research_emaar_palm.md): Atlantis The Royal (East Crescent; photo EditQ, CC0); Serenia Living: "comprises 226
// residences" and "completed in February 2026" (Palma Development PR, 1 Apr 2026; Palma's project page says 225); ORLA: "designed by Foster + Partners and
// will be managed by ... Dorchester Collection" (The National, 1 Dec 2022), resident-only beach club on 150 m of beach, "Completed by 2027" (Omniyat);
// Six Senses Residences: "Select Group will deliver 162 residential units" (Gulf News, 23 Dec 2021), owners' access to Six Senses Place; AVA: "16
// Residences and 1 Sky Palace" (Omniyat).  ORLA's pin is approximate.  Map: (c) OpenStreetMap contributors (ODbL); imagery (c) Esri, Maxar, Earthstar.
// Safe zone: x 130-950, y 300-1420.
// ---------------------------------------------------------------------------
function buildScenes() {
  const cues = [], SCENES = [], PUNCHES = [], OVERLAYS = [], add = (s) => { SCENES.push(s); return s; };
  const A = (w, from = 0) => { const n = s => s.toUpperCase().replace(/[.,?!:;]+$/, ''); const x = TL.words.find(q => q.t >= from - 1e-6 && n(q.text) === n(w)); if (!x) console.error('anchor missing: ' + w + ' @' + from); return x ? x.t : from; };
  const VEND = TL.voice_dur, END = TL.dur;
  const GOLD = '#E9C47C', GOLD_A = 'rgba(233,196,124,', WHITE_A = 'rgba(243,239,230,', RED = '#E5484D', RED2 = '#FF8A8E', AMBER = '#FFB547', TEAL = ['#2FD8A0', '#A6F3D6'], BLUE = ['#3DB2FF', '#A9DEFF'], GOLDS = ['#C99A4A', '#F3D9A4'], WHITES = ['#F3EFE6', '#FFFFFF'];
  const IMAGES = Object.fromEntries(Object.keys(PAGES).map(k => [k, `assets/${k}.png`]));
  IMAGES.royal = 'assets/img/royal.jpg';
  const DARK_PLATE = new Set([]);
  const P = GEO.x.points || {};
  const win = (t, a0, a1, d = 0.4) => ea(t, a0, a0 + d) * (1 - ea(t, a1, a1 + 0.4));
  const fit = (s, f, w, ls = 0) => Math.min(1, w / M(s, f, ls));
  const ok = id => IMG[id] && IMG[id].naturalWidth > 0;
  const dur = T => T[1] - T[0];
  HUD_X = 330;                                                                       // titles sit right of his bubble
  const BUBBLE = { t0: 0, src: { cx: 562, cy: 820, size: 600 }, keys: [{ t: 0, cx: 215, cy: 418, r: 78 }, { t: END, cx: 215, cy: 418, r: 78 }] };

  const K = {
    five: A('five'), atlantis: A('atlantis'), combines: A('combines'), serenia: A('serenia'), n226: A('226'), palma: A('palma'), orla: A('orla'), brings: A('brings'),
    foster: A('Foster + Partners'), private: A('private'), six: A('six'), n162: A('162'), with29: A('with', 29.3), and33: A('and', 33), smaller: A('smaller'), n16: A('16'),
    but: A('but'), compare: A('compare'), view: A('view'), layout: A('layout'), privacy: A('privacy'), service: A('service'), beach2: A('beach', 48), management2: A('management', 49),
    check: A('check'), completion2: A('completion', 50), handover: A('handover'), dm: A('dm'), DOORS: A('doors'), budget: A('budget'), personal: A('personal'), investment2: A('investment', 57), lets: A("let's"),
  };
  const FACE_SEGS = [];
  const H0 = [0, K.atlantis - 0.12], A1 = [H0[1], K.combines + 1.45], A2 = [A1[1], K.serenia - 0.12], P1 = [A2[1], K.orla - 0.12], M2 = [P1[1], K.brings - 0.12],
    P2 = [M2[1], K.six - 0.12], P3 = [P2[1], K.and33 - 0.12], M3 = [P3[1], K.smaller - 0.3], B0 = [M3[1], K.but - 0.12], B1 = [B0[1], K.compare - 0.12],
    C1 = [B1[1], K.check - 0.12], C2 = [C1[1], K.dm - 0.12];
  const ADDR = [['royal', 'ATLANTIS THE ROYAL'], ['serenia', 'SERENIA LIVING'], ['orla', 'ORLA'], ['sixsenses', 'SIX SENSES RESIDENCES'], ['ava', 'AVA']];

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
    box(x0, y0, w, h, 26, GOLD_A + '0.45)'); const nl = n.title.split('\n').length, tTop = y0 + h - 60 - (nl - 1) * 38, r = Math.min(46, (tTop - y0 - 18) / 2), cy = Math.min(y0 + 72, (y0 + 8 + tTop) / 2);   // two-line labels push the icon up
    glow(x, cy, 70 * r / 46, '233,196,124', 0.18); dot(x, cy, r, '#1A1712'); ring(x, cy, r, { color: GOLD, w: 3 });
    icon(n.icon, x, cy, 24 * r / 46, { p: ea(t, n.t + 0.1, n.t + 0.7), color: GOLD, w: 4 });
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
  page('p_serenia', 'serenia', P1, [[P1[0] + 0.1, qy('serenia', 0)], [K.palma - 0.3, qy('serenia', 1)]], [[0, K.n226 - 0.3, K.n226 + 1.6], [1, K.palma - 0.1, P1[1] - 0.3]]);
  page('p_orla', 'nat_orla', P2, [[P2[0] + 0.1, qy('nat_orla', 0)]], [[0, K.foster - 1.0, K.private - 0.6]]);
  page('p_six', 'sixsenses', P3, [[P3[0] + 0.1, qy('sixsenses', 0)]], [[0, K.n162 - 0.8, K.n162 + 1.2]]);

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
  const palm = (t, cam, a0, dur = 0.05) => ['pj0', 'pj1', 'pj2'].forEach(k => mapArea(t, cam, k, { c: GOLDS, a0, dur, base: 0.32 }));
  flight('m0', H0, [[0, 55.132, 25.118, 13.95, 0, 10], [dur(H0) + 0.5, 55.132, 25.118, 14.1, 0, 16]], (t, cam) => {
    palm(t, cam, 0.25, 1.2);
    ADDR.forEach(([k], i) => numPin(t, cam, P[k], i + 1, K.five - 0.1 + i * 0.12, 0));
  });
  flight('m1', A1, [[0, 55.132, 25.118, 14.1, 0, 16], [1.0, 55.1273, 25.1378, 15.25, 0, 28], [dur(A1) + 0.5, 55.1273, 25.1378, 15.35, 0, 30]], (t, cam) => {
    palm(t, cam, A1[0] - 2); numPin(t, cam, P.royal, 1, A1[0] - 2, 0);
    calloutEN(t, cam, P.royal, 'ATLANTIS THE ROYAL', 'EAST CRESCENT · RESIDENCES + RESORT', GOLD, A1[0] + 0.9, 0, 0, 230);
  });
  flight('m2', M2, [[0, 55.125, 25.12, 14.5, 0, 18], [1.0, 55.1142, 25.1258, 15.35, 0, 28], [dur(M2) + 0.5, 55.1142, 25.1258, 15.45, 0, 30]], (t, cam) => {
    palm(t, cam, M2[0] - 2); numPin(t, cam, P.serenia, 2, M2[0] - 2, 0); numPin(t, cam, P.orla, 3, M2[0] + 0.6, 0);
    mapTagEN(t, cam, P.serenia, 'SERENIA LIVING', M2[0] + 0.9, 0, 110);
    calloutEN(t, cam, P.orla, 'ORLA BY OMNIYAT', 'WEST CRESCENT · PIN APPROXIMATE', GOLD, M2[0] + 1.0, 0, 0, -170);
  });
  flight('m3', M3, [[0, 55.135, 25.11, 14.3, 0, 18], [1.0, 55.1508, 25.1032, 15.3, 0, 28], [dur(M3) + 0.5, 55.1508, 25.1032, 15.4, 0, 30]], (t, cam) => {
    palm(t, cam, M3[0] - 2); numPin(t, cam, P.ava, 5, M3[0] + 0.5, 0);
    calloutEN(t, cam, P.ava, 'AVA AT PALM JUMEIRAH', 'BY OMNIYAT · AT THE TRUNK ENTRANCE', GOLD, M3[0] + 0.9, 0, -60, 220);
  });

  // ---------------------------------------------------------------- roadmap branches
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
  section(A2, ST(A2), [
    { x: CX, y: 920, w: 820, h: 620, photo: 'royal', fy: 0.4, t: A2[0] + 0.05, title: 'ATLANTIS THE ROYAL', sub: 'RESIDENCES + A RESORT DESTINATION', subT: A2[0] + 0.4, credit: 'PHOTO: EDITQ, CC0', fs: 40 },
  ], []);
  // how many homes: three of the five, on one scale
  const HOMES = [['SERENIA LIVING', 226, 'PALMA · 2026'], ['SIX SENSES RESIDENCES', 162, 'SELECT GROUP · 2021 LAUNCH'], ['AVA', 17, '16 RESIDENCES + 1 SKY PALACE']];
  const homes = (t) => { const al = win(t, B0[0], B0[1] - 0.15); if (al <= 0.003) return; ctx.save(); ctx.globalAlpha *= al; const X0 = SAFE.x0, BW = SAFE.w;
    T('NUMBER OF HOMES', CX, 650, { font: F.d(800, 34), ls: 3, color: GOLD });
    HOMES.forEach(([name, v, sub], i) => { const y = 750 + i * 150, a = B0[0] + 0.1 + i * 0.25, e = ea(t, a, a + 0.4, E.out4), p = ea(t, a + 0.15, a + 1.0, E.inOut2); if (e <= 0.003) return;
      ctx.save(); ctx.globalAlpha *= e; T(name, X0, y, { font: F.d(800, 32), color: '#FFFFFF', align: 'left' }); T(String(Math.round(v * p)), X0 + BW, y + 2, { font: F.d(800, 40), color: '#FFFFFF', align: 'right' });
      rr(X0, y + 18, BW, 36, 18); ctx.fillStyle = '#0E0E11'; ctx.fill(); ctx.strokeStyle = GOLD_A + '0.25)'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.save(); rr(X0, y + 18, BW, 36, 18); ctx.clip(); rr(X0, y + 18, Math.max(36, BW * v / 226 * p), 36, 18); ctx.fillStyle = GOLD; ctx.fill(); ctx.restore();
      T(sub, X0, y + 86, { font: F.d(700, 22), ls: 3, color: C.dim, align: 'left' }); ctx.restore(); });
    ctx.restore(); };
  const B1rows = t => rows(t, B1, [[700, K.but, 'FEWER HOMES = BETTER INVESTMENT?', 'NOT AUTOMATICALLY', 'no']]);
  section(C1, ST(C1), [['VIEW', K.view, 'up'], ['LAYOUT', K.layout, 'building'], ['PRIVACY', K.privacy, 'house'], ['SERVICE\nCHARGES', K.service, 'tag'], ['BEACH\nACCESS', K.beach2, 'drop'], ['MANAGEMENT', K.management2, 'briefcase']].map(([ti, a, ic], i) =>
    ({ kind: 'tile', x: [265, 540, 815][i % 3], y: 820 + Math.floor(i / 3) * 235, w: 250, h: 215, icon: ic, title: ti, t: a - 0.15 })), []);
  const C2rows = t => rows(t, C2, [[700, K.completion2 - 0.1, 'COMPLETION STATUS', 'FOR THE EXACT PROPERTY', 'q'], [860, K.handover - 0.1, 'HANDOVER STATUS', 'CONFIRMED IN WRITING', 'q']]);
  const srcChip = (t, txt, a0, a1) => { const al = win(t, a0, a1); if (al <= 0.003) return; const f = F.d(800, 24), w = Math.min(SAFE.w, M(txt, f, 2) + 48); ctx.save(); ctx.globalAlpha *= al; glassPill(CX - w / 2, 1172, w, 52, 26); T(txt, CX, 1207, { font: f, ls: 2, color: '#FFFFFF', sx: Math.min(1, (SAFE.w - 48) / M(txt, f, 2)) }); ctx.restore(); };

  const overlay = (t) => {
    for (const s of SECT) drawSection(t, s);
    homes(t); B1rows(t); C2rows(t);
    hudTitle(t, 'BUYING ON PALM JUMEIRAH?', 'FIVE ADDRESSES', 'VERY DIFFERENT VERSIONS OF LUXURY', 0.15, H0[1] - 0.15, GOLD);
    hudTitle(t, 'ADDRESS 1 · EAST CRESCENT', 'ATLANTIS THE ROYAL', 'RESIDENCES + RESORT', A1[0] + 0.05, A2[1] - 0.15, GOLD);
    hudTitle(t, 'ADDRESS 2 · PALMA DEVELOPMENT', 'SERENIA LIVING', '226 HOMES · 4 TOWERS · WEST CRESCENT', P1[0] + 0.05, K.palma - 0.2, GOLD);
    hudTitle(t, 'SERENIA LIVING', 'COMPLETED', 'FEBRUARY 2026 · HANDOVER STARTED', K.palma - 0.1, P1[1] - 0.15, TEAL[1]);
    hudTitle(t, 'ADDRESS 3 · OMNIYAT', 'ORLA', 'FOSTER + PARTNERS · DORCHESTER COLLECTION', M2[0] + 0.05, K.private - 0.3, GOLD);
    hudTitle(t, 'ORLA · OMNIYAT', 'RESIDENT-ONLY BEACH CLUB', '150 M OF BEACH · COMPLETION BY 2027', K.private - 0.2, P2[1] - 0.15, GOLD);
    hudTitle(t, 'ADDRESS 4 · SELECT GROUP', 'SIX SENSES RESIDENCES', '162 HOMES · 2021 LAUNCH', P3[0] + 0.05, K.with29 - 0.2, GOLD);
    hudTitle(t, 'SIX SENSES RESIDENCES', 'WELLNESS FOCUS', "OWNERS' ACCESS TO SIX SENSES PLACE", K.with29 - 0.1, P3[1] - 0.15, TEAL[1]);
    hudTitle(t, 'ADDRESS 5 · OMNIYAT', 'AVA AT PALM JUMEIRAH', '16 RESIDENCES + 1 SKY PALACE', M3[0] + 0.05, B0[1] - 0.15, GOLD);
    hudTitle(t, 'BUT', 'FEWER HOMES', 'NOT AUTOMATICALLY A BETTER INVESTMENT', B1[0] + 0.05, B1[1] - 0.15, RED2);
    hudTitle(t, 'COMPARE', 'THE EXACT UNIT', 'NOT JUST THE ADDRESS', C1[0] + 0.05, C1[1] - 0.15, GOLD);
    hudTitle(t, 'THEN CHECK', 'COMPLETION · HANDOVER', 'FOR THAT PROPERTY', C2[0] + 0.05, C2[1] - 0.15, AMBER);
    srcChip(t, 'PALMA DEVELOPMENT · 1 APR 2026 (VIA ALBAWABA)', P1[0] + 0.2, P1[1] - 0.15); srcChip(t, 'THE NATIONAL · 1 DEC 2022', P2[0] + 0.2, P2[1] - 0.15); srcChip(t, 'GULF NEWS · 23 DEC 2021', P3[0] + 0.2, P3[1] - 0.15);
    // the call to action: DM DOORS with your budget, personal use or investment
    const ce = ea(t, K.dm - 0.1, K.dm + 0.5, E.out4);
    if (ce > 0.003) {
      ctx.save(); ctx.globalAlpha *= ce; ctx.fillStyle = 'rgba(8,8,10,0.9)'; ctx.fillRect(0, 0, W, H); T('ABDULLAH AHLI', CX, 640, { font: F.d(800, 62), ls: 2, color: C.ink }); T('PORTFOLIO STRATEGIST', CX, 694, { font: F.d(700, 34), ls: 6, color: C.gold }); ctx.restore();
      const msg = 'DOORS', send = K.DOORS + 0.4, sent = ea(t, send, send + 0.35), ia = ea(t, K.dm + 0.05, K.dm + 0.45, E.out4), iy = 1260, X0 = SAFE.x0, X1 = SAFE.x1, BW = X1 - X0, typed = msg.slice(0, Math.floor(msg.length * ea(t, K.DOORS - 0.05, K.DOORS + 0.3, E.lin) + 0.0001)), fm = F.d(700, 58);
      ctx.save(); ctx.globalAlpha *= ia; rr(X0, iy - 65, BW, 130, 65); ctx.fillStyle = C.panel; ctx.fill(); ctx.strokeStyle = 'rgba(243,239,230,0.28)'; ctx.lineWidth = 3; ctx.stroke();
      T(typed, X0 + 56, iy + 20, { font: fm, color: C.ink, align: 'left', alpha: 1 - sent }); T('Message…', X0 + 56, iy + 20, { font: F.d(700, 54), color: C.mute, align: 'left', alpha: (1 - ea(t, K.DOORS - 0.05, K.DOORS + 0.05)) * (1 - sent) });
      dot(X1 - 66, iy, 48, C.gold); icon('plane', X1 - 66, iy, 20, { p: 1, color: '#17181B', w: 4.5, rot: -0.5 + 0.5 * sent }); ctx.restore();
      const b1 = ea(t, send, send + 0.5, E.out4);
      if (b1 > 0.002) { ctx.save(); ctx.globalAlpha *= b1; ctx.translate(0, (1 - b1) * 36); const w = M(msg, fm) + 84; rr(X1 - w, 770, w, 112, 56); ctx.fillStyle = C.gold; ctx.fill(); T(msg, X1 - w / 2, 845, { font: fm, color: '#17181B' }); ctx.restore(); }
      const fc = F.d(800, 30), chips = [['YOUR BUDGET', K.budget - 0.15], ['PERSONAL USE', K.personal - 0.15], ['INVESTMENT', K.investment2 - 0.15]], cw = chips.map(([s]) => M(s, fc, 2) + 52);
      let cx = X1 - cw.reduce((a, b) => a + b + 14, -14);
      chips.forEach(([txt, a], i) => { const w = cw[i], e = ea(t, a, a + 0.45, E.back), x = cx + w / 2; cx += w + 14; if (e <= 0.003) return;
        ctx.save(); ctx.globalAlpha *= clamp(e); ctx.translate(x, 960); ctx.scale(lerp(0.8, 1, e), lerp(0.8, 1, e)); rr(-w / 2, -35, w, 70, 35); ctx.fillStyle = '#1A1712'; ctx.fill(); ctx.strokeStyle = GOLD; ctx.lineWidth = 2.5; ctx.stroke(); T(txt, 0, 11, { font: fc, ls: 2, color: GOLD }); ctx.restore(); });
      const b2 = ea(t, K.lets - 0.1, K.lets + 0.4, E.out4);
      if (b2 > 0.002) { ctx.save(); ctx.globalAlpha *= b2; ctx.translate(0, (1 - b2) * 36); const txt = 'The addresses that fit you', f = F.d(700, 40), w = Math.min(BW, M(txt, f) + 130); rr(X0, 1045, w, 104, 52); ctx.fillStyle = C.panel; ctx.fill(); ctx.strokeStyle = 'rgba(243,239,230,0.28)'; ctx.lineWidth = 3; ctx.stroke(); icon('check', X0 + 60, 1097, 20, { p: ea(t, K.lets, K.lets + 0.4), color: C.gold, w: 4.5 }); T(txt, X0 + 104, 1111, { font: f, color: C.ink, align: 'left', sx: fit(txt, f, w - 130) }); ctx.restore(); }
    }
  };
  OVERLAYS.push(overlay);

  [H0[0] + 0.2, A1[0], A2[0], P1[0], M2[0], P2[0], P3[0], M3[0], B0[0], B1[0], C1[0], C2[0], K.dm].forEach(x => cues.push({ k: 'wh', t: x - 0.2, d: 0.5 }));
  [K.n226, K.n162, K.n16].forEach(x => cues.push({ k: 'pin', t: x })); cues.push({ k: 'send', t: K.DOORS + 0.4 });
  return { FACE_SEGS, PUNCHES, SCENES, OVERLAYS, cues, IMAGES, BUBBLE, FOOT_MAX: Math.min(TL.frames, 3586) - 1, NO_CAPTIONS: false, CAP_UNTIL: VEND, STATIC_FACE: false };
}
