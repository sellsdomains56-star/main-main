'use strict';
// ---------------------------------------------------------------------------
// Microsoft, Citadel and OpenAI expanding in the UAE - two HeyGen scripts on the same facts: "UK, quick question" (31fdcdfa, 53.4 s, CTA "UK") and
// "Citadel, Microsoft and OpenAI are expanding in the UAE" (f2b407a1 version v8af223de, 77.8 s, CTA "ENTRY").  60 fps.  One file builds both (VAR).
// Real pages with a marker on the exact words, roadmap cards, his face SMALL the whole time.
// Facts (research 31 Oct 2026, research_macro.md): Microsoft "will invest $15.2 billion USD in the UAE between the start of this initiative in 2023 and the
// end of this decade, in 2029" (release 3 Nov 2025, copy on uaepreferred.com; ~$7.3bn spent 2023-2025).  Citadel Advisors (DIFC) Limited: DFSA licence
// 28 Apr 2026 (register blocked here) -> Hedgeweek 30 Apr 2026 on screen.  Stargate UAE: G42, OpenAI, Oracle, NVIDIA, SoftBank, Cisco, announced 22 May
// 2025 ("announced", not "selected"; first 200 MW due 2026).  Abu Dhabi Media Office 17 Jul 2026: H1 2026 real estate FDI AED13.8bn, +309%; the UK
// "ranked among the leading sources" (no per-country ranking).  Safe zone: x 130-950, y 300-1420.
// ---------------------------------------------------------------------------
const VAR = 'uk';
function buildScenes() {
  const cues = [], SCENES = [], PUNCHES = [], OVERLAYS = [], add = (s) => { SCENES.push(s); return s; };
  const A = (w, from = 0) => { const n = s => s.toUpperCase().replace(/[.,?!:;]+$/, ''); const x = TL.words.find(q => q.t >= from - 1e-6 && n(q.text) === n(w)); if (!x) console.error('anchor missing: ' + w + ' @' + from); return x ? x.t : from; };
  const VEND = TL.voice_dur, END = TL.dur;
  const GOLD = '#E9C47C', GOLD_A = 'rgba(233,196,124,', WHITE_A = 'rgba(243,239,230,', RED = '#E5484D', RED2 = '#FF8A8E', AMBER = '#FFB547', TEAL = ['#2FD8A0', '#A6F3D6'], BLUE = ['#3DB2FF', '#A9DEFF'], GOLDS = ['#C99A4A', '#F3D9A4'], WHITES = ['#F3EFE6', '#FFFFFF'];
  const IMAGES = Object.fromEntries(Object.keys(PAGES).map(k => [k, `assets/${k}.png`]));
  const DARK_PLATE = new Set([]);
  const win = (t, a0, a1, d = 0.4) => ea(t, a0, a0 + d) * (1 - ea(t, a1, a1 + 0.4));
  const fit = (s, f, w, ls = 0) => Math.min(1, w / M(s, f, ls));
  const ok = id => IMG[id] && IMG[id].naturalWidth > 0;
  const dur = T => T[1] - T[0];
  HUD_X = 330;                                                                       // titles sit right of his bubble
  const BUBBLE = { t0: 0, src: { cx: 562, cy: 820, size: 600 }, keys: [{ t: 0, cx: 215, cy: 418, r: 78 }, { t: END, cx: 215, cy: 418, r: 78 }] };

  const UK = VAR === 'uk';
  const K = UK ? {
    ms1: A('microsoft,'), cit1: A('citadel'), oai1: A('openai'), have: A('have'), fits: A('fits'), ms2: A('microsoft', 8), n152: A('$15.2'), cit2: A("citadel's"), and2: A('and', 18.9), stargate: A('stargate'),
    british: A('british'), uk2: A('uk', 26), these: A('these'), guarantee: A('guarantee'), but: A('but', 35), businesses: A('businesses'), work: A('work,'), rent: A('rent.'),
    if: A('if'), budget1: A('budget,'), tax: A('tax'), rental: A('rental'), second: A('second'), future: A('future'), send: A('send'), KW: A('uk', 49.5), budget2: A('budget.', 50), compare: A('compare'),
  } : {
    cit1: A('citadel,'), ms1: A('microsoft'), oai1: A('openai'), different: A('different'), same: A('same'), cit2: A("citadel's"), april: A('april'), ms2: A('microsoft', 12), n152: A('$15.2'), that1: A('that', 19.4), already: A('already'),
    and3: A('and', 22.8), stargate: A('stargate'), these: A('these'), global: A('global'), technology: A('technology'), access: A('access'), infrastructure: A('infrastructure'), regional: A('regional'),
    companies: A('companies'), offices: A('offices,'), suppliers: A('suppliers'), specialist: A('specialist'), their: A('their', 42), depends: A('depends'), hiring: A('hiring,'), salaries: A('salaries'), where: A('where', 47.9),
    separately: A('separately,'), n138: A('13.8'), p309: A('309%'), that2: A('that', 59), caused: A('caused'), it: A('it', 61.2), if: A('if'), areas: A('areas'), price: A('price', 70.9),
    comment: A('comment'), KW: A('entry'), budget2: A('budget'), dubai: A('dubai', 74.8), abu: A('abu', 75.5), lets: A("let's"),
  };
  const FACE_SEGS = [];
  let L1, Q1, P_ms, P_cit, P_g42, P_fdi, R1, R2, R3, N1, N2, CTA0;
  if (UK) { L1 = [K.ms1 - 0.3, K.have - 0.1]; Q1 = [L1[1], K.ms2 - 0.12]; P_ms = [Q1[1], K.cit2 - 0.12]; P_cit = [P_ms[1], K.and2 - 0.1]; P_g42 = [P_cit[1], K.british - 0.12];
    P_fdi = [P_g42[1], K.these - 0.12]; R1 = [P_fdi[1], K.but - 0.12]; R2 = [R1[1], K.if - 0.12]; R3 = [R2[1], K.send - 0.12]; CTA0 = K.send - 0.12; }
  else { L1 = [0, K.cit2 - 0.12]; P_cit = [L1[1], K.ms2 - 0.12]; P_ms = [P_cit[1], K.and3 - 0.1]; P_g42 = [P_ms[1], K.these - 0.12]; N1 = [P_g42[1], K.companies - 0.12]; N2 = [N1[1], K.separately - 0.12];
    P_fdi = [N2[1], K.that2 - 0.12]; R1 = [P_fdi[1], K.if - 0.12]; R2 = [R1[1], K.comment - 0.12]; CTA0 = K.comment - 0.12; }

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
  page('p_ms', 'ms', P_ms, UK ? [[P_ms[0] + 0.1, qy('ms', 0)]] : [[P_ms[0] + 0.1, qy('ms', 0)], [K.that1 - 0.2, qy('ms', 1)]], UK ? [[0, K.n152 - 0.3, K.n152 + 4.0]] : [[0, K.n152 - 0.4, K.n152 + 4.4], [1, K.already - 0.1, K.already + 1.5]]);
  page('p_cit', 'citadel', P_cit, [[P_cit[0] + 0.1, qy('citadel', 0)]], [[0, P_cit[0] + 0.3, P_cit[1] - 0.6]]);
  page('p_g42', 'g42', P_g42, [[P_g42[0] + 0.1, qy('g42', 0)]], [[0, K.stargate - 1.0, P_g42[1] - 0.5]]);
  page('p_fdi', 'admo_fdi', P_fdi, [[P_fdi[0] + 0.1, UK ? qy('admo_fdi', 1) + 100 : qy('admo_fdi', 0) + 170]],   // keeps the page's stray '[AA1]' editor mark above the frame
    UK ? [[1, K.uk2 - 0.2, P_fdi[1] - 0.5]] : [[0, K.n138 - 0.6, K.p309 + 1.6]]);

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
  // the three names, then the same country
  section(L1, ST(L1), [
    { x: 265, y: 760, w: 250, h: 230, mono: 'MSFT', t: K.ms1 - 0.1, title: 'MICROSOFT', fs: 28, ph: 96 },
    { x: 540, y: 760, w: 250, h: 230, mono: 'CITADEL', t: K.cit1 - 0.1, title: 'HEDGE FUND', fs: 24, ph: 96 },
    { x: 815, y: 760, w: 250, h: 230, mono: 'OPENAI', t: K.oai1 - 0.1, title: 'AI', fs: 28, ph: 96 },
    { kind: 'tag', x: CX, y: 1010, w: 620, h: 76, icon: 'flag', title: UK ? 'EXPANDING IN THE UAE' : 'THE SAME COUNTRY: THE UAE', t: UK ? K.oai1 + 0.4 : K.same - 0.1 },
  ], [ { pts: [[265, 875], [265, 930], [CX, 930], [CX, 972]], t: (UK ? K.oai1 : K.same) - 0.2, c: 'w', d: 0.3 }, { pts: [[815, 875], [815, 930], [CX, 930]], t: (UK ? K.oai1 : K.same) - 0.15, c: 'w', d: 0.25 }, { pts: [[540, 875], [540, 930]], t: (UK ? K.oai1 : K.same) - 0.1, c: 'w', d: 0.2 } ]);
  const rowsUK = UK ? [
    t => rows(t, Q1, [[700, Q1[0] + 0.05, 'WHY HERE?', 'HAVE YOU LOOKED AT IT', 'q'], [860, K.fits - 0.2, 'DOES IT FIT YOUR PLANS?', 'YOUR INVESTMENT PLANS', 'q']]),
    t => rows(t, R1, [[760, R1[0] + 0.05, 'PROPERTY RETURNS', 'NOT GUARANTEED BY THESE ANNOUNCEMENTS', 'no']]),
  ] : [];
  if (UK) {
    section(R2, ST(R2), [['WHERE BUSINESSES\nARE EXPANDING', K.businesses, 'building'], ['WHERE PEOPLE\nWORK', K.work, 'briefcase'], ['WHAT THEY CAN\nAFFORD TO RENT', K.rent, 'tag']].map(([ti, a, ic], i) =>
      ({ kind: 'tile', x: [265, 540, 815][i], y: 820, w: 250, h: 230, icon: ic, title: ti, t: a - 0.4 })), []);
    section(R3, ST(R3), [
      { kind: 'tag', x: 335, y: 640, w: 390, h: 76, icon: 'tag', title: 'YOUR BUDGET', t: K.budget1 - 0.15 },
      { kind: 'tag', x: 745, y: 640, w: 390, h: 76, icon: 'doc', title: 'YOUR TAX POSITION', t: K.tax - 0.15 },
      { kind: 'tile', x: 265, y: 890, w: 250, h: 220, icon: 'chart', title: 'RENTAL\nINCOME', t: K.rental - 0.15 },
      { kind: 'tile', x: 540, y: 890, w: 250, h: 220, icon: 'house', title: 'A SECOND\nHOME', t: K.second - 0.15 },
      { kind: 'tile', x: 815, y: 890, w: 250, h: 220, icon: 'plane', title: 'A FUTURE\nMOVE', t: K.future - 0.15 },
    ], [ { pts: [[CX, 680], [CX, 740], [265, 740], [265, 778]], t: K.rental - 0.4, c: 'w', d: 0.3 }, { pts: [[CX, 740], [CX, 778]], t: K.second - 0.3, c: 'w', d: 0.2 }, { pts: [[CX, 740], [815, 740], [815, 778]], t: K.future - 0.35, c: 'w', d: 0.25 } ]);
  } else {
    section(N1, ST(N1), [
      { kind: 'tag', x: 335, y: 640, w: 390, h: 76, icon: 'bars', title: 'GLOBAL FINANCE', t: K.global - 0.15 },
      { kind: 'tag', x: 745, y: 640, w: 390, h: 76, icon: 'cube', title: 'TECHNOLOGY', t: K.technology - 0.15 },
      { kind: 'tile', x: 265, y: 900, w: 250, h: 220, icon: 'tag', title: 'ACCESS TO\nCAPITAL', t: K.access - 0.15 },
      { kind: 'tile', x: 540, y: 900, w: 250, h: 220, icon: 'building', title: 'INFRA-\nSTRUCTURE', t: K.infrastructure - 0.15 },
      { kind: 'tile', x: 815, y: 900, w: 250, h: 220, icon: 'briefcase', title: 'REGIONAL\nBUSINESS', t: K.regional - 0.15 },
    ], []);
    section(N2, ST(N2), [
      { kind: 'tag', x: CX, y: 620, w: 520, h: 72, icon: 'building', title: 'COMPANIES NEED', t: N2[0] + 0.05 },
      { kind: 'tile', x: 265, y: 830, w: 250, h: 200, icon: 'building', title: 'OFFICES', t: K.offices - 0.15 },
      { kind: 'tile', x: 540, y: 830, w: 250, h: 200, icon: 'cube', title: 'SUPPLIERS', t: K.suppliers - 0.15 },
      { kind: 'tile', x: 815, y: 830, w: 250, h: 200, icon: 'briefcase', title: 'SPECIALIST\nTEAMS', t: K.specialist - 0.15 },
    ], [ { pts: [[CX, 656], [CX, 700], [265, 700], [265, 730]], t: K.offices - 0.4, d: 0.3 }, { pts: [[CX, 700], [CX, 730]], t: K.suppliers - 0.3, d: 0.2 }, { pts: [[CX, 700], [815, 700], [815, 730]], t: K.specialist - 0.35, d: 0.25 } ]);
    rowsUK.push(t => rows(t, [K.their - 0.1, N2[1]], [[990, K.their, 'HOUSING DEMAND DEPENDS ON', 'ACTUAL HIRING · SALARIES · WHERE THE JOBS ARE', 'q']]));
    rowsUK.push(t => rows(t, R1, [[700, R1[0] + 0.05, 'PROOF THESE COMPANIES CAUSED IT', "THAT'S NOT WHAT THIS SHOWS", 'no'], [860, K.it - 0.1, 'PROPERTY INVESTMENT GROWING', 'ALONGSIDE BUSINESS COMMITMENTS', 'ok']]));
    section(R2, ST(R2), [
      { kind: 'tile', x: 335, y: 820, w: 390, h: 230, icon: 'flag', title: 'AREAS SERVING\nTHE JOB HUBS', t: K.areas - 0.2 },
      { kind: 'tile', x: 745, y: 820, w: 390, h: 230, icon: 'tag', title: 'YOUR ENTRY\nPRICE', t: K.price - 0.4 },
    ], []);
  }
  const srcChip = (t, txt, a0, a1) => { const al = win(t, a0, a1); if (al <= 0.003) return; const f = F.d(800, 24), w = Math.min(SAFE.w, M(txt, f, 2) + 48); ctx.save(); ctx.globalAlpha *= al; glassPill(CX - w / 2, 1172, w, 52, 26); T(txt, CX, 1207, { font: f, ls: 2, color: '#FFFFFF', sx: Math.min(1, (SAFE.w - 48) / M(txt, f, 2)) }); ctx.restore(); };

  const overlay = (t) => {
    for (const s of SECT) drawSection(t, s);
    rowsUK.forEach(f => f(t));
    if (UK) {
      hudTitle(t, 'UK', 'QUICK QUESTION', 'BIG NAMES ARE EXPANDING HERE', 0.15, L1[1] - 0.15, GOLD);
      hudTitle(t, 'HAVE YOU LOOKED AT', 'WHY?', '', Q1[0] + 0.05, Q1[1] - 0.15, AMBER);
      hudTitle(t, 'TOO', 'BRITISH INVESTORS', 'IN ABU DHABI PROPERTY · H1 2026', P_fdi[0] + 0.05, P_fdi[1] - 0.15, GOLD);
      hudTitle(t, 'THESE ANNOUNCEMENTS', 'NO GUARANTEE', 'OF PROPERTY RETURNS', R1[0] + 0.05, R1[1] - 0.15, RED2);
      hudTitle(t, 'BUT THEY GIVE YOU', 'REASONS TO STUDY', '', R2[0] + 0.05, R2[1] - 0.15, GOLD);
      hudTitle(t, 'BASED IN THE UK?', 'START HERE', '', R3[0] + 0.05, R3[1] - 0.15, GOLD);
    } else {
      hudTitle(t, 'CITADEL · MICROSOFT · OPENAI', 'ONE COUNTRY', 'KEEPS APPEARING IN THEIR PLANS', 0.15, L1[1] - 0.15, GOLD);
      hudTitle(t, 'WHY IT MATTERS', 'CLOSER TO GLOBAL NETWORKS', 'FINANCE · TECHNOLOGY', N1[0] + 0.05, N1[1] - 0.15, GOLD);
      hudTitle(t, 'COMPANIES NEED PEOPLE', 'AND PEOPLE NEED HOMES', 'BUT HOW MANY?', N2[0] + 0.05, N2[1] - 0.15, AMBER);
      hudTitle(t, 'SEPARATELY · ABU DHABI', 'AED 13.8 BN FDI', 'REAL ESTATE · H1 2026 · +309%', P_fdi[0] + 0.05, P_fdi[1] - 0.15, GOLD);
      hudTitle(t, 'BE CAREFUL', 'CORRELATION', 'NOT CAUSATION', R1[0] + 0.05, R1[1] - 0.15, AMBER);
      hudTitle(t, 'RELOCATING OR INVESTING?', 'COMPARE', '', R2[0] + 0.05, R2[1] - 0.15, GOLD);
    }
    hudTitle(t, 'MICROSOFT', '$15.2 BILLION', 'IN THE UAE · 2023 TO 2029', P_ms[0] + 0.05, P_ms[1] - 0.15, BLUE[1]);
    hudTitle(t, 'CITADEL', 'LICENSED IN DUBAI', 'APRIL 2026 · DIFC', P_cit[0] + 0.05, P_cit[1] - 0.15, BLUE[1]);
    hudTitle(t, 'STARGATE UAE · ABU DHABI', 'FIRST OUTSIDE THE US', 'ANNOUNCED MAY 2025 · OPENAI A PARTNER', P_g42[0] + 0.05, P_g42[1] - 0.15, BLUE[1]);
    srcChip(t, 'MICROSOFT RELEASE · 3 NOV 2025 (UAE PREFERRED COPY)', P_ms[0] + 0.2, P_ms[1] - 0.15); srcChip(t, 'HEDGEWEEK · 30 APR 2026', P_cit[0] + 0.2, P_cit[1] - 0.15);
    srcChip(t, 'G42 · 22 MAY 2025', P_g42[0] + 0.2, P_g42[1] - 0.15); srcChip(t, 'ABU DHABI MEDIA OFFICE · 17 JUL 2026', P_fdi[0] + 0.2, P_fdi[1] - 0.15);
    // the call to action
    const ce = ea(t, CTA0, CTA0 + 0.6, E.out4);
    if (ce > 0.003) {
      ctx.save(); ctx.globalAlpha *= ce; ctx.fillStyle = 'rgba(8,8,10,0.9)'; ctx.fillRect(0, 0, W, H); T('ABDULLAH AHLI', CX, 640, { font: F.d(800, 62), ls: 2, color: C.ink }); T('PORTFOLIO STRATEGIST', CX, 694, { font: F.d(700, 34), ls: 6, color: C.gold }); ctx.restore();
      const msg = UK ? 'UK' : 'ENTRY', send = K.KW + 0.45, sent = ea(t, send, send + 0.35), ia = ea(t, CTA0 + 0.15, CTA0 + 0.55, E.out4), iy = 1260, X0 = SAFE.x0, X1 = SAFE.x1, BW = X1 - X0, typed = msg.slice(0, Math.floor(msg.length * ea(t, K.KW - 0.05, K.KW + 0.3, E.lin) + 0.0001)), fm = F.d(700, 58);
      ctx.save(); ctx.globalAlpha *= ia; rr(X0, iy - 65, BW, 130, 65); ctx.fillStyle = C.panel; ctx.fill(); ctx.strokeStyle = 'rgba(243,239,230,0.28)'; ctx.lineWidth = 3; ctx.stroke();
      T(typed, X0 + 56, iy + 20, { font: fm, color: C.ink, align: 'left', alpha: 1 - sent }); T(UK ? 'Message…' : 'Add a comment…', X0 + 56, iy + 20, { font: F.d(700, 54), color: C.mute, align: 'left', alpha: (1 - ea(t, K.KW - 0.05, K.KW + 0.05)) * (1 - sent) });
      dot(X1 - 66, iy, 48, C.gold); icon('plane', X1 - 66, iy, 20, { p: 1, color: '#17181B', w: 4.5, rot: -0.5 + 0.5 * sent }); ctx.restore();
      const b1 = ea(t, send, send + 0.5, E.out4);
      if (b1 > 0.002) { ctx.save(); ctx.globalAlpha *= b1; ctx.translate(0, (1 - b1) * 36); const w = M(msg, fm) + 84; rr(X1 - w, 770, w, 112, 56); ctx.fillStyle = C.gold; ctx.fill(); T(msg, X1 - w / 2, 845, { font: fm, color: '#17181B' }); ctx.restore(); }
      const fc = F.d(800, 32), chip = (txt, a, xr, y) => { const e = ea(t, a, a + 0.45, E.back); if (e <= 0.003) return; const w = M(txt, fc, 2) + 60; ctx.save(); ctx.globalAlpha *= clamp(e); ctx.translate(xr - w / 2, y); ctx.scale(lerp(0.8, 1, e), lerp(0.8, 1, e)); rr(-w / 2, -36, w, 72, 36); ctx.fillStyle = '#1A1712'; ctx.fill(); ctx.strokeStyle = GOLD; ctx.lineWidth = 2.5; ctx.stroke(); T(txt, 0, 11, { font: fc, ls: 2, color: GOLD }); ctx.restore(); };
      chip('YOUR BUDGET', K.budget2 - 0.15, X1, 960);
      if (UK) T('Dubai vs Abu Dhabi for your plans', CX, 1100, { font: F.d(700, 38), color: C.ink, alpha: ea(t, K.compare - 0.2, K.compare + 0.3, E.out4) });
      else { const wr = M('ABU DHABI', fc, 2) + 60; chip('ABU DHABI', K.abu - 0.15, X1, 1052); chip('DUBAI', K.dubai - 0.15, X1 - wr - 18, 1052);
        T("Let's explore your options", CX, 1160, { font: F.d(700, 38), color: C.ink, alpha: ea(t, K.lets - 0.2, K.lets + 0.3, E.out4) }); }
    }
  };
  OVERLAYS.push(overlay);

  [L1, P_ms, P_cit, P_g42, P_fdi, R1, R2].concat(UK ? [Q1, R3] : [N1, N2]).forEach(T0 => cues.push({ k: 'wh', t: T0[0] - 0.2, d: 0.5 })); cues.push({ k: 'wh', t: CTA0 - 0.1, d: 0.5 });
  [K.n152].concat(UK ? [] : [K.n138]).forEach(x => cues.push({ k: 'pin', t: x })); cues.push({ k: 'send', t: K.KW + 0.45 });
  return { FACE_SEGS, PUNCHES, SCENES, OVERLAYS, cues, IMAGES, BUBBLE, FOOT_MAX: Math.min(TL.frames, 3206) - 1, NO_CAPTIONS: false, CAP_UNTIL: VEND, STATIC_FACE: false };
}
