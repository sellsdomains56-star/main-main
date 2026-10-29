'use strict';
// ---------------------------------------------------------------------------
// "Who's developing all that empty land around Dubai Silicon Oasis?" - HeyGen take 6f85e7b7 (version v6a81e3c5, 44.4 s, English).  60 fps.
// Same look as ../dubai-royal-roadmap (logo cards, gold / white lines that draw themselves, photo cards, real pages with a marker on the exact words),
// but his face stays SMALL the whole time (the round bubble top-left, never full screen).  The map opens it (Dubai Silicon Oasis, then Academic City /
// Al Ruwayyah 1 and Nad Al Sheba); each developer gets a roadmap branch (logo -> project -> facts) and its page; the overview ends on what could change.
// Facts (research 29 Oct 2026): Greenz by Danube (launched 1 Apr 2026, Academic City, townhouses and villas); Tilal Binghatti (~10 million sq ft,
// Academic City); Dubai Police Academy in Al Ruwayyah 1 (to be completed 2027), compensating Dubai Holding for the academy's land in Al Sufouh; Aldar x
// Dubai Holding JV (6 Feb 2026): plot of ~4 million sqm opposite Nad Al Sheba, apartments, townhouses, villas.  The police General HQ is in Al Twar and
// no source says it is moving, so the screen says only "NOT THE POLICE HQ".  Safe zone: x 130-950, y 300-1420.
// ---------------------------------------------------------------------------
function buildScenes() {
  const cues = [], SCENES = [], PUNCHES = [], OVERLAYS = [], add = (s) => { SCENES.push(s); return s; };
  const A = (w, from = 0) => { const n = s => s.toUpperCase().replace(/[.,?!:;]+$/, ''); const x = TL.words.find(q => q.t >= from - 1e-6 && n(q.text) === n(w)); if (!x) console.error('anchor missing: ' + w + ' @' + from); return x ? x.t : from; };
  const VEND = TL.voice_dur, END = TL.dur;
  const GOLD = '#E9C47C', GOLD_A = 'rgba(233,196,124,', WHITE_A = 'rgba(243,239,230,', RED2 = '#FF8A8E', TEAL = ['#2FD8A0', '#A6F3D6'], BLUE = ['#3DB2FF', '#A9DEFF'], VIO = ['#8C7BFF', '#CFC6FF'], GOLDS = ['#C99A4A', '#F3D9A4'];
  const IMAGES = Object.fromEntries(Object.keys(PAGES).map(k => [k, `assets/${k}.png`]));
  for (const k of ['greenz', 'tilal', 'academy']) IMAGES[k] = `assets/img/${k}.jpg`; IMAGES.dso_sat = 'assets/dso_sat.jpg';
  const LOGO = { danube: 'danube_logo', binghatti: 'binghatti_logo', aldar: 'aldar_logo', dh: 'dubai_holding_logo', police: 'dubai_police_logo' };
  for (const [k, f] of Object.entries(LOGO)) IMAGES['L_' + k] = `assets/img/${f}.png`;
  const DARK_PLATE = new Set(['binghatti', 'dh', 'aldar']);
  const P = GEO.x.points || {};
  const win = (t, a0, a1, d = 0.4) => ea(t, a0, a0 + d) * (1 - ea(t, a1, a1 + 0.4));
  const fit = (s, f, w, ls = 0) => Math.min(1, w / M(s, f, ls));
  const ok = id => IMG[id] && IMG[id].naturalWidth > 0;
  const dur = T => T[1] - T[0];
  HUD_X = 330;                                                                       // titles sit right of his bubble
  const BUBBLE = { t0: 0, src: { cx: 562, cy: 820, size: 600 }, keys: [{ t: 0, cx: 215, cy: 418, r: 78 }, { t: END, cx: 215, cy: 418, r: 78 }] };

  const K = {
    several: A('several'), danube: A('danube'), greenz: A('greenz'), academic: A('academic'), bringing: A('bringing'), townhouses: A('townhouses'), area: A('area.'),
    binghatti: A("binghatti's"), tilal: A('tilal'), spans: A('spans'), ten: A('10'), feet: A('feet.'), theres: A("there's"), police: A('police'), academy: A('academy'), ruwayyah: A('ruwayyah'),
    its: A("it's"), relocating: A('relocating'), sufouh: A('sufouh,'), not: A('not'), hq: A('headquarters'), and: A('and', 22.2), aldar: A('aldar'), dh: A('holding'), jv: A('joint'), four: A('4'), sqm: A('metres'),
    opposite: A('opposite'), apartments: A('apartments,'), villas: A('villas', 30.5), so: A('so'), own: A('own'), buying: A('buying,'), change: A('change'), housing: A('housing'), traffic: A('traffic'), services: A('services.'),
    comment: A('comment'), silicon: A('silicon', 40), send: A('send'), breakdown: A('breakdown'),
  };
  const FACE_SEGS = [];
  const M0 = [0, K.danube - 0.1], R1 = [M0[1], K.bringing - 0.15], P1 = [R1[1], K.binghatti - 0.1], R2 = [P1[1], K.spans - 0.1], P2 = [R2[1], K.theres - 0.1],
    R3 = [P2[1], K.ruwayyah + 0.5], P3 = [R3[1], K.not - 0.1], R3b = [P3[1], K.and - 0.1], R4 = [R3b[1], K.four - 0.5], P4 = [R4[1], K.so - 0.05], OV = [P4[1], K.comment - 0.12];

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
      if (n.sub) T(n.sub, x0 + 26, y0 + h - 22, { font: F.d(700, 21), ls: 3, color: GOLD, align: 'left', alpha: ea(t, n.subT ?? n.t, (n.subT ?? n.t) + 0.4), sx: fit(n.sub, F.d(700, 21), w - 52, 3) });
      if (n.credit) T(n.credit, x0 + w - 14, y0 + 26, { font: F.d(700, 15), ls: 1, color: 'rgba(255,255,255,0.75)', align: 'right' });
    } else if (w >= 600) {
      box(x0, y0, w, h); const pw = n.pw || 230, ph = h - 40; if (n.logo) plate(n.logo, x0 + 20, y0 + 20, pw, ph); else { rr(x0 + 20, y0 + 20, pw, ph, 16); ctx.fillStyle = '#101114'; ctx.fill(); ctx.strokeStyle = GOLD_A + '0.35)'; ctx.stroke(); T(n.mono, x0 + 20 + pw / 2, y0 + h / 2 + 16, { font: F.d(800, 46), ls: 3, color: GOLD }); }
      const tx = x0 + pw + 50, mw = x0 + w - 30 - tx, f = F.d(800, n.fs || 34), lines = n.title.split('\n'), ty = y0 + h / 2 + (n.sub ? -10 : 12) - (lines.length - 1) * 21;
      lines.forEach((l, i) => T(l, tx, ty + i * 42, { font: f, ls: 1, color: '#FFFFFF', align: 'left', sx: fit(l, f, mw, 1) }));
      if (n.sub) { const e3 = ea(t, n.subT ?? n.t, (n.subT ?? n.t) + 0.45, E.out4), f3 = F.d(700, 22); ctx.save(); ctx.globalAlpha *= e3; n.sub.split('\n').forEach((l, i) => T(l, tx, ty + (lines.length - 1) * 42 + 44 + i * 30, { font: f3, ls: 2, color: GOLD, align: 'left', sx: fit(l, f3, mw, 2) })); ctx.restore(); }
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
    T(n.title, -w / 2 + 84, 12, { font: F.d(800, 32), ls: 2, color: '#FFFFFF', align: 'left' }); ctx.restore(); };
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
    for (const n of s.nodes) (n.kind === 'person' ? person : n.kind === 'tag' ? tag : card)(t, n);
    ctx.restore();
  };


  // ---------------------------------------------------------------- pages (marker on the exact words)
  const lineBoxes = (rects) => { const L = []; for (const [x, y, w, h] of rects) { const l = L.find(q => Math.abs(q.y - y) < 12); if (l) { l.x0 = Math.min(l.x0, x); l.x1 = Math.max(l.x1, x + w); } else L.push({ x0: x, x1: x + w, y, h }); } return L.sort((a, b) => a.y - b.y).map(l => [l.x0, l.y, l.x1 - l.x0, l.h]); };
  const page = (id, img, T, stops, marks, k0 = 0.95) => {
    const keys = [[0, 538, 330, k0, 0]]; let pr = 0, pc = [538, 330, k0, 0];
    if (stops.length && stops[0][0] - T[0] < 0.9) { pc = [540, stops[0][1] - 110, stops[0][2] ? stops[0][2] * 0.95 : 0.92, 10]; keys[0] = [0, ...pc]; }
    for (const [ta, cy, k = 0.97] of stops) { const r = ta - T[0]; keys.push([Math.max(r - 0.75, pr + 0.05), ...pc]); pc = [540, cy, k, 16]; keys.push([r, ...pc]); pr = r; }
    keys.push([dur(T) + 0.5, pc[0], pc[1] + 6, pc[2] * 1.03, pc[3] + 2]);
    const hl = []; for (const [pi, t0, t1] of marks) { const ls = lineBoxes(PAGES[img].boxes[pi]), tot = ls.reduce((s, b) => s + b[2], 0); let acc = 0; for (const b of ls) { const a = t0 + (t1 - t0) * acc / tot; acc += b[2]; hl.push({ bbox: b, t0: a, t1: t0 + (t1 - t0) * acc / tot }); } }
    add({ id, kind: 'page', img, a: T[0], b: T[1], keys, hl });
  };
  const qy = (img, pi) => { const r = PAGES[img].boxes[pi]; return (Math.min(...r.map(b => b[1])) + Math.max(...r.map(b => b[1] + b[3]))) / 2; };
  page('p_danube', 'danube', P1, [[P1[0] + 0.1, qy('danube', 0)]], [[0, P1[0] + 0.25, K.area + 0.2]]);
  page('p_tilal', 'binghatti', P2, [[P2[0] + 0.1, qy('binghatti', 0), 1.3]], [[0, P2[0] + 0.2, K.feet + 0.3]]);
  page('p_police', 'gn_police', P3, [[P3[0] + 0.1, qy('gn_police', 0)], [K.relocating - 0.1, qy('gn_police', 1)]], [[0, P3[0] + 0.15, K.its - 0.1], [1, K.relocating, K.sufouh + 0.3]]);
  page('p_aldar', 'zawya_aldar', P4, [[P4[0] + 0.1, qy('zawya_aldar', 1)], [K.opposite - 0.4, qy('zawya_aldar', 0)]], [[1, K.four - 0.1, K.sqm + 0.3], [0, K.opposite - 0.1, K.villas + 0.5]]);

  // ---------------------------------------------------------------- the map: Dubai Silicon Oasis, then the corridor around it
  SAT_SCENES.m0 = { a: M0[0], b: M0[1], veil: 'map', keys: [camKey(0, 55.3866, 25.1235, 14.35, 120, 34), camKey(K.several - 0.2, 55.389, 25.126, 14.0, 120, 32), camKey(dur(M0) + 0.5, 55.396, 25.131, 13.25, 100, 26)] };
  add({ id: 'm0', kind: 'sat', a: M0[0], b: M0[1], cfg: { top: (t, cam) => {
    mapArea(t, cam, 'dso', { c: VIO, a0: 0.25, dur: 0.9, on: [0.45, M0[1]] });
    calloutEN(t, cam, P.dso, 'DUBAI SILICON OASIS', 'AND THE EMPTY LAND AROUND IT', VIO[1], 0.7, K.several + 0.4, 0, 200);
    mapArea(t, cam, 'academic', { c: GOLDS, a0: K.several + 0.1, dur: 0.8, on: [K.several + 0.2, M0[1]] }); mapArea(t, cam, 'ruwayyah1', { c: TEAL, a0: K.several + 0.3, dur: 0.8, on: [K.several + 0.4, M0[1]], base: 0.35 });
    mapArea(t, cam, 'nas3', { c: BLUE, a0: K.several + 0.5, dur: 0.8, on: [K.several + 0.6, M0[1]], base: 0.4 }); mapArea(t, cam, 'nas4', { c: BLUE, a0: K.several + 0.6, dur: 0.8, on: [K.several + 0.7, M0[1]], base: 0.4 });
    calloutEN(t, cam, P.academic, 'ACADEMIC CITY · AL RUWAYYAH', 'DANUBE · BINGHATTI · POLICE ACADEMY', GOLD, K.several + 0.5, 0, 0, 230);
    calloutEN(t, cam, P.nas4, 'NAD AL SHEBA', 'ALDAR × DUBAI HOLDING OPPOSITE', BLUE[1], K.several + 1.0, 0, -40, -210);
  } } });
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

  // ---------------------------------------------------------------- the roadmap branches (screen coordinates: camera at y 800)
  const ST = (T) => [[T[0], 800, 1], [T[1], 812, 1.015]];
  section(R1, ST(R1), [
    { x: CX, y: 640, w: 820, h: 140, logo: 'danube', pw: 330, t: R1[0] + 0.05, title: 'DANUBE PROPERTIES', sub: 'LAUNCHED APRIL 2026', subT: K.greenz },
    { x: CX, y: 940, w: 820, h: 280, photo: 'greenz', t: K.greenz - 0.15, title: 'GREENZ BY DANUBE', sub: 'TOWNHOUSES & VILLAS', subT: K.academic + 0.3, credit: 'RENDER: DANUBE PROPERTIES', fy: 0.6 },
    { kind: 'tag', x: CX, y: 1165, w: 520, h: 76, icon: 'flag', title: 'ACADEMIC CITY', t: K.academic - 0.1 },
  ], [ { pts: [[CX, 710], [CX, 800]], t: K.greenz - 0.35, c: 'w', label: 'LAUNCHED', at: [CX, 755], d: 0.35 }, { pts: [[CX, 1080], [CX, 1127]], t: K.academic - 0.25, c: 'w', d: 0.25 } ]);
  section(R2, ST(R2), [
    { x: CX, y: 640, w: 820, h: 140, logo: 'binghatti', pw: 330, t: R2[0] + 0.05, title: 'BINGHATTI', fs: 40 },
    { x: CX, y: 940, w: 820, h: 280, photo: 'tilal', t: K.tilal - 0.15, title: 'TILAL BINGHATTI', sub: 'ACADEMIC CITY', subT: K.tilal + 0.3, credit: 'IMAGE: BINGHATTI', fy: 0.55 },
  ], [ { pts: [[CX, 710], [CX, 800]], t: K.tilal - 0.35, c: 'w', label: 'COMMUNITY', at: [CX, 755], d: 0.35 } ]);
  section(R3, ST(R3), [
    { x: CX, y: 640, w: 820, h: 140, logo: 'police', t: R3[0] + 0.05, title: 'DUBAI POLICE', fs: 40 },
    { x: CX, y: 940, w: 820, h: 280, photo: 'academy', t: K.academy - 0.2, title: 'NEW DUBAI POLICE ACADEMY', sub: '155 HECTARES · DUE 2027', subT: K.academy + 0.4, credit: 'PHOTO: WAM', fy: 0.5 },
    { kind: 'tag', x: CX, y: 1165, w: 520, h: 76, icon: 'flag', title: 'AL RUWAYYAH 1', t: K.ruwayyah - 0.2 },
  ], [ { pts: [[CX, 710], [CX, 800]], t: K.academy - 0.4, c: 'w', label: 'PLANNED', at: [CX, 755], d: 0.35 }, { pts: [[CX, 1080], [CX, 1127]], t: K.ruwayyah - 0.35, c: 'w', d: 0.25 } ]);
  const R3B = (t) => {                                                                // to be clear: the academy moves, the police HQ does not
    const al = win(t, R3b[0], R3b[1] - 0.15); if (al <= 0.003) return; ctx.save(); ctx.globalAlpha *= al;
    const rowc = (y, a, txt, sub, okk) => { const e = ea(t, a - 0.1, a + 0.4, E.out4); if (e <= 0.003) return; ctx.save(); ctx.globalAlpha *= e; ctx.translate((1 - e) * -30, 0);
      box(SAFE.x0, y, SAFE.w, 150, 28, okk ? 'rgba(47,216,160,0.55)' : 'rgba(229,72,77,0.55)'); const cx = SAFE.x1 - 70, cy = y + 75, p = ea(t, a + 0.15, a + 0.55);
      dot(cx, cy, 36, okk ? 'rgba(47,216,160,0.18)' : 'rgba(229,72,77,0.18)'); if (okk) icon('check', cx, cy + 2, 18, { p, color: TEAL[0], w: 5 }); else { ctx.strokeStyle = RED2; ctx.lineWidth = 6; ctx.lineCap = 'round'; const q = 14; ctx.beginPath(); ctx.moveTo(cx - q, cy - q); ctx.lineTo(cx - q + 2 * q * clamp(p * 2), cy - q + 2 * q * clamp(p * 2)); ctx.stroke(); if (p > 0.5) { const b = clamp(p * 2 - 1); ctx.beginPath(); ctx.moveTo(cx + q, cy - q); ctx.lineTo(cx + q - 2 * q * b, cy - q + 2 * q * b); ctx.stroke(); } }
      T(txt, SAFE.x0 + 40, y + 70, { font: F.d(800, 42), color: '#FFFFFF', align: 'left', sx: fit(txt, F.d(800, 42), SAFE.w - 170) }); T(sub, SAFE.x0 + 40, y + 114, { font: F.d(700, 24), ls: 3, color: okk ? TEAL[1] : RED2, align: 'left' }); ctx.restore(); };
    rowc(700, R3b[0] + 0.05, 'THE ACADEMY IS MOVING', 'FROM AL SUFOUH TO AL RUWAYYAH 1', true);
    rowc(890, K.not - 0.05, 'NOT THE POLICE HQ', 'THE HEADQUARTERS IS NOT MOVING', false);
    ctx.restore();
  };
  section(R4, ST(R4), [
    { x: 335, y: 650, w: 380, h: 210, logo: 'aldar', t: R4[0] + 0.05, title: 'ALDAR', fs: 32, ph: 96 },
    { x: 745, y: 650, w: 380, h: 210, logo: 'dh', t: K.dh - 0.15, title: 'DUBAI HOLDING', fs: 30, ph: 96 },
    { x: CX, y: 1010, w: 820, h: 150, mono: 'JV', t: K.jv - 0.1, title: 'JOINT VENTURE', sub: 'APARTMENTS · TOWNHOUSES · VILLAS', subT: K.jv + 0.3, fs: 40 },
  ], [ { pts: [[335, 755], [335, 840], [CX, 840], [CX, 935]], t: K.jv - 0.45, d: 0.4 }, { pts: [[745, 755], [745, 840], [CX, 840]], t: K.jv - 0.45, d: 0.4, label: 'CONFIRMED', at: [CX, 880] } ]);
  const times = (t) => { const e = ea(t, K.dh - 0.1, K.dh + 0.3, E.back) * win(t, R4[0], R4[1] - 0.15); if (e > 0.003) { ctx.save(); ctx.globalAlpha *= clamp(e); T('×', CX, 672, { font: F.d(800, 70), color: GOLD }); ctx.restore(); } };
  // ---------------------------------------------------------------- the overview: Dubai Silicon Oasis -> the four plans -> what could change
  section(OV, ST(OV), [
    { kind: 'person', x: CX, y: 610, r: 88, img: 'dso_sat', t: OV[0] + 0.05, name: 'DUBAI SILICON OASIS', title: 'THE CORRIDOR', small: true },
    { kind: 'tag', x: 335, y: 872, w: 405, h: 70, icon: 'house', title: 'GREENZ', t: OV[0] + 0.5 },
    { kind: 'tag', x: 745, y: 872, w: 405, h: 70, icon: 'building', title: 'TILAL', t: OV[0] + 0.62 },
    { kind: 'tag', x: 335, y: 956, w: 405, h: 70, icon: 'flag', title: 'POLICE ACADEMY', t: OV[0] + 0.74 },
    { kind: 'tag', x: 745, y: 956, w: 405, h: 70, icon: 'briefcase', title: 'ALDAR × DH', t: OV[0] + 0.86 },
    { kind: 'tag', x: CX, y: 1082, w: 560, h: 66, icon: 'house', title: 'HOUSING SUPPLY', t: K.housing - 0.1 },
    { kind: 'tag', x: CX, y: 1157, w: 560, h: 66, icon: 'up', title: 'TRAFFIC', t: K.traffic - 0.1 },
    { kind: 'tag', x: CX, y: 1232, w: 560, h: 66, icon: 'briefcase', title: 'SERVICES', t: K.services - 0.15 },
  ], [
    { pts: [[CX, 800], [CX, 818], [335, 818], [335, 837]], t: OV[0] + 0.35, d: 0.4 }, { pts: [[CX, 818], [745, 818], [745, 837]], t: OV[0] + 0.4, d: 0.4 },
    { pts: [[CX, 991], [CX, 1049]], t: K.change - 0.2, c: 'w', d: 0.4, label: 'COULD CHANGE', at: [CX, 1020] },
  ]);
  const srcChip = (t, txt, a0, a1) => { const al = win(t, a0, a1); if (al <= 0.003) return; const f = F.d(800, 24), w = Math.min(SAFE.w, M(txt, f, 2) + 48); ctx.save(); ctx.globalAlpha *= al; glassPill(CX - w / 2, 1172, w, 52, 26); T(txt, CX, 1207, { font: f, ls: 2, color: '#FFFFFF', sx: Math.min(1, (SAFE.w - 48) / M(txt, f, 2)) }); ctx.restore(); };

  const overlay = (t) => {
    for (const s of SECT) drawSection(t, s);
    R3B(t); times(t);
    hudTitle(t, 'DUBAI SILICON OASIS', "WHO'S DEVELOPING", 'THE EMPTY LAND AROUND IT', 0.15, K.several - 0.2, GOLD);
    hudTitle(t, 'THIS CORRIDOR', 'MAJOR DEVELOPERS', 'ALREADY HAVE PLANS', K.several - 0.1, M0[1] - 0.15, GOLD);
    hudTitle(t, 'DANUBE PROPERTIES', 'GREENZ BY DANUBE', 'TOWNHOUSES & VILLAS · ACADEMIC CITY', R1[0] + 0.05, P1[1] - 0.15, GOLD);
    hudTitle(t, 'BINGHATTI', 'TILAL BINGHATTI', '≈10 MILLION SQ FT', R2[0] + 0.05, P2[1] - 0.15, GOLD);
    hudTitle(t, 'DUBAI POLICE', 'NEW POLICE ACADEMY', 'AL RUWAYYAH 1', R3[0] + 0.05, P3[1] - 0.15, TEAL[1]);
    hudTitle(t, 'TO BE CLEAR', 'THE ACADEMY MOVES', 'NOT THE POLICE HQ', R3b[0] + 0.05, R3b[1] - 0.15, GOLD);
    hudTitle(t, 'JOINT VENTURE', 'ALDAR × DUBAI HOLDING', '≈4 MILLION SQM · OPPOSITE NAD AL SHEBA', R4[0] + 0.05, P4[1] - 0.15, GOLD);
    hudTitle(t, 'IF YOU OWN NEARBY OR PLAN TO BUY', 'WHAT COULD CHANGE', 'HOUSING SUPPLY · TRAFFIC · SERVICES', OV[0] + 0.05, OV[1] - 0.15, GOLD);
    srcChip(t, 'DANUBE PROPERTIES · APRIL 2026', P1[0] + 0.2, P1[1] - 0.15); srcChip(t, 'BINGHATTI · TILAL BINGHATTI AREA GUIDE', P2[0] + 0.2, P2[1] - 0.15);
    srcChip(t, 'GULF NEWS · 4 DEC 2024', P3[0] + 0.2, P3[1] - 0.15); srcChip(t, 'ZAWYA · ALDAR & DUBAI HOLDING · 8 FEB 2026', P4[0] + 0.2, P4[1] - 0.15);
    // the call to action: comment SILICON
    const ce = ea(t, K.comment - 0.1, K.comment + 0.5, E.out4);
    if (ce > 0.003) {
      ctx.save(); ctx.globalAlpha *= ce; ctx.fillStyle = 'rgba(8,8,10,0.9)'; ctx.fillRect(0, 0, W, H); T('ABDULLAH AHLI', CX, 660, { font: F.d(800, 62), ls: 2, color: C.ink }); T('PORTFOLIO STRATEGIST', CX, 714, { font: F.d(700, 34), ls: 6, color: C.gold }); ctx.restore();
      const msg = 'SILICON', send = K.send - 0.05, sent = ea(t, send, send + 0.35), ia = ea(t, K.comment + 0.2, K.comment + 0.7, E.out4), iy = 1185, X0 = SAFE.x0, X1 = SAFE.x1, BW = X1 - X0, typed = msg.slice(0, Math.floor(msg.length * ea(t, K.silicon - 0.05, K.silicon + 0.4, E.lin) + 0.0001)), fm = F.d(700, 58);
      ctx.save(); ctx.globalAlpha *= ia; rr(X0, iy - 65, BW, 130, 65); ctx.fillStyle = C.panel; ctx.fill(); ctx.strokeStyle = 'rgba(243,239,230,0.28)'; ctx.lineWidth = 3; ctx.stroke();
      T(typed, X0 + 56, iy + 20, { font: fm, color: C.ink, align: 'left', alpha: 1 - sent }); T('Add a comment…', X0 + 56, iy + 20, { font: F.d(700, 54), color: C.mute, align: 'left', alpha: (1 - ea(t, K.silicon - 0.05, K.silicon + 0.05)) * (1 - sent) });
      dot(X1 - 66, iy, 48, C.gold); icon('plane', X1 - 66, iy, 20, { p: 1, color: '#17181B', w: 4.5, rot: -0.5 + 0.5 * sent }); ctx.restore();
      const b1 = ea(t, send, send + 0.5, E.out4), b2 = ea(t, K.breakdown - 0.1, K.breakdown + 0.4, E.out4);
      if (b1 > 0.002) { ctx.save(); ctx.globalAlpha *= b1; ctx.translate(0, (1 - b1) * 36); const w = M(msg, fm) + 84; rr(X1 - w, 860, w, 112, 56); ctx.fillStyle = C.gold; ctx.fill(); T(msg, X1 - w / 2, 935, { font: fm, color: '#17181B' }); ctx.restore(); }
      if (b2 > 0.002) { ctx.save(); ctx.globalAlpha *= b2; ctx.translate(0, (1 - b2) * 36); const txt = 'Sending you the breakdown', f = F.d(700, 40), w = Math.min(BW, M(txt, f) + 130); rr(X0, 1000, w, 104, 52); ctx.fillStyle = C.panel; ctx.fill(); ctx.strokeStyle = 'rgba(243,239,230,0.28)'; ctx.lineWidth = 3; ctx.stroke(); icon('check', X0 + 60, 1052, 20, { p: ea(t, K.breakdown + 0.1, K.breakdown + 0.5), color: C.gold, w: 4.5 }); T(txt, X0 + 104, 1066, { font: f, color: C.ink, align: 'left' }); ctx.restore(); }
    }
  };
  OVERLAYS.push(overlay);

  [M0[0] + 0.2, R1[0], P1[0], R2[0], P2[0], R3[0], P3[0], R3b[0], R4[0], P4[0], OV[0], K.comment].forEach(x => cues.push({ k: 'wh', t: x - 0.2, d: 0.5 }));
  [K.ten, K.four, K.ruwayyah].forEach(x => cues.push({ k: 'pin', t: x })); cues.push({ k: 'send', t: K.send - 0.05 });
  return { FACE_SEGS, PUNCHES, SCENES, OVERLAYS, cues, IMAGES, BUBBLE, FOOT_MAX: TL.frames - 1, NO_CAPTIONS: false, CAP_UNTIL: VEND, STATIC_FACE: false };
}
