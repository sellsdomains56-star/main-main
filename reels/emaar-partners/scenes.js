'use strict';
// ---------------------------------------------------------------------------
// "Emaar's name on the project doesn't always mean Emaar owns the whole community" - HeyGen 7cb7e81c, version v6d85cb63 (54.1 s, English).  60 fps.
// The royal-family roadmap style: Emaar on top, a trunk to each partner community with its split bar (Emaar gold | partner ivory) and both logo
// plates, real pages with a marker on the exact words, his face SMALL the whole time.
// Facts (research 31 Oct 2026, scratchpad research_emaar_palm.md): Mina Rashid Properties LLC 70% (Emaar Development FS 2025), The National 18 Aug 2019
// "a 70:30 joint venture between Emaar and DP World-owned P&O Marinas" (now marketed as Rashid Yachts & Marina); Dubai Hills Estate LLC 50%, JV with
// Meraas since 8 Jun 2013 (Meraas is part of Dubai Holding); Expo Living = Emaar x DWTC joint venture (Emaar, 14 Nov 2024; split not published, so no %);
// Emaar Dubai South DWC LLC 50% with Dubai Aviation City Corporation, whose chairman is Sheikh Ahmed bin Saeed; Dubai Holding 29.73% of Emaar
// Properties, largest shareholder (Dubai Media Office, 12 May 2026).  The project stakes sit in Emaar Development PJSC (80.16% Emaar Properties).
// Safe zone: x 130-950, y 300-1420.
// ---------------------------------------------------------------------------
function buildScenes() {
  const cues = [], SCENES = [], PUNCHES = [], OVERLAYS = [], add = (s) => { SCENES.push(s); return s; };
  const A = (w, from = 0) => { const n = s => s.toUpperCase().replace(/[.,?!:;]+$/, ''); const x = TL.words.find(q => q.t >= from - 1e-6 && n(q.text) === n(w)); if (!x) console.error('anchor missing: ' + w + ' @' + from); return x ? x.t : from; };
  const VEND = TL.voice_dur, END = TL.dur;
  const GOLD = '#E9C47C', GOLD_A = 'rgba(233,196,124,', WHITE_A = 'rgba(243,239,230,', RED = '#E5484D', RED2 = '#FF8A8E', AMBER = '#FFB547', TEAL = ['#2FD8A0', '#A6F3D6'], BLUE = ['#3DB2FF', '#A9DEFF'], GOLDS = ['#C99A4A', '#F3D9A4'];
  const IMAGES = Object.fromEntries(Object.keys(PAGES).map(k => [k, `assets/${k}.png`]));
  for (const k of ['ahmed']) IMAGES[k] = `assets/img/${k}.jpg`;
  for (const k of ['emaar', 'dh', 'meraas', 'dpw']) IMAGES['L_' + k] = `assets/img/logo_${k}.png`;
  const DARK_PLATE = new Set(['dh']);
  const win = (t, a0, a1, d = 0.4) => ea(t, a0, a0 + d) * (1 - ea(t, a1, a1 + 0.4));
  const fit = (s, f, w, ls = 0) => Math.min(1, w / M(s, f, ls));
  const ok = id => IMG[id] && IMG[id].naturalWidth > 0;
  const dur = T => T[1] - T[0];
  HUD_X = 330;                                                                       // titles sit right of his bubble
  const BUBBLE = { t0: 0, src: { cx: 562, cy: 820, size: 600 }, keys: [{ t: 0, cx: 215, cy: 418, r: 78 }, { t: END, cx: 215, cy: 418, r: 78 }] };

  const K = {
    owns: A('owns'), entire: A('entire'), several: A('several'), partners: A('partners'), rashid: A('rashid'), r7030: A('70-30'), dp: A('dp'), p70: A('70%'),
    hills: A('dubai', 13.5), fifty1: A('50-50'), meraas: A('meraas'), now: A('now'), expo: A('expo'), dubai3: A('dubai', 20.5),
    and: A('and', 22), esouth: A('emaar', 22.3), fifty2: A('50-50', 23), aviation: A('aviation'), chaired: A('chaired'), sheikh: A('sheikh'),
    theres: A("there's"), company: A('company', 30), dh2: A('dubai', 31), became: A('became'), largest: A('largest'), may: A('may'), pct: A('29.73%'),
    owning: A('owning'), partnering: A('partnering'), two: A('two'), so: A('so', 42), look: A('look'), brochure: A('brochure'), check: A('check'),
    project: A('project', 46), developer: A('developer'), responsibilities: A('responsibilities'), follow: A('follow'), whos: A("who's"), biggest: A('biggest'),
  };
  const FACE_SEGS = [];
  const S0 = [0, K.several - 0.12], C1 = [S0[1], K.dp + 0.45], P1 = [C1[1], K.hills - 0.12], C2 = [P1[1], K.expo - 0.12], P2 = [C2[1], K.dubai3 - 0.15],
    C3 = [P2[1], K.chaired - 0.15], C4 = [C3[1], K.theres - 0.12], CO = [C4[1], K.may - 0.3], P3 = [CO[1], K.owning - 0.12], D = [P3[1], K.so - 0.1],
    E1 = [D[1], K.check - 0.1], E2 = [E1[1], K.follow - 0.12];

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
    for (const n of s.nodes) (n.kind === 'person' ? person : n.kind === 'tag' ? tag : n.kind === 'tile' ? tile : n.kind === 'jv' ? jv : card)(t, n);
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
  page('p_mina', 'nat_mina', P1, [[P1[0] + 0.1, qy('nat_mina', 0)]], [[0, P1[0] + 0.2, K.p70 + 0.3]]);
  page('p_expo', 'emaar_expo', P2, [[P2[0] + 0.1, qy('emaar_expo', 0)]], [[0, P2[0] + 0.15, P2[1] - 0.25]]);
  page('p_dh', 'dmo_emaar', P3, [[P3[0] + 0.1, qy('dmo_emaar', 0)]], [[0, P3[0] + 0.15, K.pct + 1.2]]);

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
  // a joint-venture card: the community, the split bar (Emaar gold | partner ivory), Emaar's and the partner's logo plates under it
  const jv = (t, n) => {
    const e = pop(t, n.t); if (e <= 0.003) return; const { x, y, w, h } = n, x0 = x - w / 2, y0 = y - h / 2;
    ctx.save(); ctx.globalAlpha *= clamp(ea(t, n.t, n.t + 0.25) * 1.2); ctx.translate(x, y); ctx.scale(lerp(0.86, 1, e), lerp(0.86, 1, e)); ctx.translate(-x, -y);
    box(x0, y0, w, h, 26, GOLD_A + '0.45)');
    const f = F.d(800, 38); T(n.title, x0 + 30, y0 + 56, { font: f, ls: 1, color: '#FFFFFF', align: 'left', sx: fit(n.title, f, w - 60, 1) });
    if (n.note) T(n.note, x0 + 30, y0 + 92, { font: F.d(700, 24), ls: 3, color: C.dim, align: 'left', alpha: ea(t, n.t + 0.3, n.t + 0.7) });
    const bx = x0 + 30, by = y0 + 110, bw = w - 60, bh = 58, p = ea(t, n.tb, n.tb + 0.8, E.inOut2);
    rr(bx, by, bw, bh, bh / 2); ctx.fillStyle = '#0E0E11'; ctx.fill(); ctx.strokeStyle = GOLD_A + '0.3)'; ctx.lineWidth = 1.5; ctx.stroke();
    if (n.pa) {
      const sp = bx + bw * n.pa / 100; ctx.save(); rr(bx, by, bw, bh, bh / 2); ctx.clip();
      ctx.fillStyle = GOLD; ctx.fillRect(bx, by, (sp - bx) * p, bh); ctx.fillStyle = '#E8E2D4'; ctx.fillRect(bx + bw - (bx + bw - sp) * p, by, (bx + bw - sp) * p, bh);
      if (p > 0.98) { ctx.fillStyle = '#131317'; ctx.fillRect(sp - 2, by, 4, bh); } ctx.restore();
      const la = ea(t, n.tb + 0.5, n.tb + 0.9), fp = F.d(800, 36); T(n.pa + '%', bx + 28, by + 42, { font: fp, color: '#17181B', align: 'left', alpha: la }); T((100 - n.pa) + '%', bx + bw - 28, by + 42, { font: fp, color: '#17181B', align: 'right', alpha: la });
    } else { ctx.save(); ctx.globalAlpha *= p; rr(bx, by, bw, bh, bh / 2); ctx.strokeStyle = GOLD; ctx.lineWidth = 3; ctx.stroke(); T('JOINT VENTURE', bx + bw / 2, by + 40, { font: F.d(800, 32), ls: 4, color: GOLD }); ctx.restore(); }   // split not published
    const py = by + bh + 18, pw = 210, ph = 70, rx = bx + bw - pw;
    plate('emaar', bx, py, pw, ph);
    ctx.save(); ctx.globalAlpha *= ea(t, n.tp, n.tp + 0.4, E.out4);
    if (n.b) plate(n.b, rx, py, pw, ph); else { rr(rx, py, pw, ph, 16); ctx.fillStyle = '#101114'; ctx.fill(); ctx.strokeStyle = GOLD_A + '0.35)'; ctx.lineWidth = 1.5; ctx.stroke(); T(n.bmono, rx + pw / 2, py + ph / 2 + 15, { font: F.d(800, 40), ls: 4, color: GOLD }); }
    ctx.restore();
    if (n.bcap) { const a = n.bcapT ?? n.tp + 0.3, fc = F.d(700, 24); T(n.bcap, bx + bw, py + ph + 34, { font: fc, ls: 2, color: GOLD, align: 'right', alpha: ea(t, a, a + 0.4), sx: fit(n.bcap, fc, bw - pw - 20, 2) }); }
    ctx.restore();
  };
  // the hook: Emaar's name ... owns the entire community?
  section(S0, ST(S0), [
    { x: CX, y: 660, w: 820, h: 170, logo: 'emaar', pw: 260, t: 0.2, title: 'EMAAR', sub: 'THE NAME ON THE PROJECT', subT: 0.7, fs: 46 },
    { x: CX, y: 1020, w: 820, h: 170, mono: '?', monoC: AMBER, t: K.entire - 0.3, title: 'THE ENTIRE\nCOMMUNITY', sub: 'NOT ALWAYS', subC: AMBER, subT: K.entire + 0.3, fs: 36 },
  ], [ { pts: [[CX, 745], [CX, 935]], t: K.owns - 0.2, label: 'OWNS ALL OF IT?', at: [CX, 840] } ]);
  // the tree: Emaar on top, a trunk down the left edge, one branch into each partner community
  const CARDS = [
    { title: 'RASHID YACHTS & MARINA', note: 'LAUNCHED AS MINA RASHID', pa: 70, b: 'dpw', bcap: 'P&O MARINAS · DP WORLD', t: K.rashid - 0.1, tb: K.r7030 - 0.1, tp: K.dp - 0.1 },
    { title: 'DUBAI HILLS ESTATE', note: 'JOINT VENTURE SINCE 2013', pa: 50, b: 'meraas', bcap: 'MERAAS · NOW PART OF DUBAI HOLDING', bcapT: K.now - 0.05, t: K.hills - 0.1, tb: K.fifty1 - 0.1, tp: K.meraas - 0.1 },
    { title: 'EXPO LIVING', note: 'EXPO CITY DUBAI · 2024', bmono: 'DWTC', bcap: 'DUBAI WORLD TRADE CENTRE', t: C3[0] + 0.05, tb: K.dubai3 + 0.2, tp: K.dubai3 - 0.05 },
    { title: 'EMAAR SOUTH', note: 'IN DUBAI SOUTH', pa: 50, bmono: 'DACC', bcap: 'DUBAI AVIATION CITY CORPORATION', t: K.esouth - 0.1, tb: K.fifty2 - 0.1, tp: K.aviation - 0.3 },
  ];
  const TREE = (T, cam, n, old) => { const s = T[0] - 1;                          // old = cards already named: on screen from the start
    section(T, cam, [{ x: CX, y: 0, w: 820, h: 170, logo: 'emaar', pw: 260, t: s, title: 'EMAAR', sub: 'MAJOR DEVELOPMENTS · PARTNERS', subT: old ? s : K.several + 0.3, fs: 46 }]
      .concat(CARDS.slice(0, n).map((c, i) => Object.assign({ kind: 'jv', x: 570, y: 360 + i * 350, w: 760, h: 310 }, c, i < old ? { t: s, tb: s, tp: s, bcapT: s } : {}))),
      CARDS.slice(0, n).map((c, i) => ({ pts: [[155, 80], [155, 360 + i * 350], [190, 360 + i * 350]], t: i < old ? s : c.t - 0.35, d: 0.45 })));
  };
  TREE(C1, [[C1[0], 160, 1], [K.rashid - 0.4, 160, 1], [C1[1], 170, 1]], 1, 0);
  TREE(C2, [[C2[0], 450, 1], [C2[1], 460, 1]], 2, 1);
  TREE(C3, [[C3[0], 800, 1], [K.and - 0.3, 800, 1], [K.esouth - 0.05, 1150, 1], [C3[1], 1160, 1]], 4, 2);
  // Emaar South's partner and its chairman
  section(C4, ST(C4), [
    { x: CX, y: 680, w: 820, h: 180, mono: 'DACC', t: C4[0] - 0.1, title: 'DUBAI AVIATION CITY\nCORPORATION', sub: '50% PARTNER IN EMAAR SOUTH', subT: C4[0] + 0.2, fs: 34 },
    { kind: 'person', x: CX, y: 1030, r: 105, img: 'ahmed', t: K.sheikh - 0.1, name: 'AHMED BIN SAEED', title: 'AL MAKTOUM' },
  ], [ { pts: [[CX, 770], [CX, 918]], t: C4[0] + 0.05, label: 'CHAIRED BY', at: [CX, 845] } ]);
  // company level: Dubai Holding -> Emaar Properties
  section(CO, ST(CO), [
    { kind: 'tag', x: CX, y: 650, w: 480, h: 84, icon: 'building', title: 'COMPANY LEVEL', t: K.company - 0.15 },
    { x: CX, y: 840, w: 820, h: 170, logo: 'dh', pw: 230, t: K.dh2 - 0.1, title: 'DUBAI HOLDING', sub: 'LARGEST SHAREHOLDER', subT: K.largest, fs: 42 },
    { x: CX, y: 1200, w: 820, h: 170, logo: 'emaar', pw: 260, t: K.became + 0.15, title: 'EMAAR PROPERTIES', sub: 'LISTED ON THE DFM', subT: K.became + 0.5, fs: 40 },
  ], [ { pts: [[CX, 925], [CX, 1115]], t: K.became, c: 'w', label: 'SHAREHOLDER', at: [CX, 1020] } ]);
  // shares in the company != a partner in one community
  section(D, ST(D), [
    { kind: 'tile', x: 300, y: 800, w: 340, h: 250, icon: 'chart', title: 'SHARES IN\nEMAAR', t: K.owning - 0.1 },
    { kind: 'tile', x: 780, y: 800, w: 340, h: 250, icon: 'house', title: 'PARTNER ON ONE\nCOMMUNITY', t: K.partnering - 0.1 },
  ], []);
  const Dlab = (t) => { const al = win(t, D[0], D[1] - 0.15); if (al <= 0.003) return; ctx.save(); ctx.globalAlpha *= al;
    T('COMPANY LEVEL', 300, 978, { font: F.d(800, 26), ls: 4, color: GOLD, alpha: ea(t, K.owning + 0.4, K.owning + 0.8) }); T('PROJECT LEVEL', 780, 978, { font: F.d(800, 26), ls: 4, color: GOLD, alpha: ea(t, K.partnering + 0.4, K.partnering + 0.8) });
    const e = ea(t, K.two - 0.1, K.two + 0.3, E.back); if (e > 0.003) { ctx.save(); ctx.globalAlpha *= clamp(e); ctx.translate(CX, 800); ctx.scale(lerp(0.6, 1, e), lerp(0.6, 1, e)); dot(0, 0, 50, '#1A1712'); ring(0, 0, 50, { color: RED2, w: 4 }); T('≠', 0, 26, { font: F.d(800, 74), color: RED2 }); ctx.restore(); }
    T('TWO DIFFERENT ARRANGEMENTS', CX, 1110, { font: F.d(800, 40), ls: 2, color: '#FFFFFF', alpha: ea(t, K.two, K.two + 0.4), sx: fit('TWO DIFFERENT ARRANGEMENTS', F.d(800, 40), SAFE.w, 2) });
    ctx.restore(); };
  // look beyond the name on the brochure -> check three things
  section(E1, ST(E1), [
    { x: CX, y: 690, w: 820, h: 190, logo: 'emaar', pw: 260, t: E1[0] + 0.05, title: 'THE NAME ON\nTHE BROCHURE', fs: 38 },
    { kind: 'tag', x: CX, y: 1010, w: 560, h: 84, icon: 'doc', title: 'WHO IS BEHIND IT?', t: K.brochure - 0.1 },
  ], [ { pts: [[CX, 785], [CX, 968]], t: K.look - 0.15, label: 'LOOK BEYOND', at: [CX, 876] } ]);
  const E2rows = t => rows(t, E2, [[680, K.project - 0.1, 'THE PROJECT COMPANY', 'WHO OWNS THE PROJECT', 'ok'], [840, K.developer - 0.1, 'THE DEVELOPER', 'WHO BUILDS AND DELIVERS IT', 'ok'],
    [1000, K.responsibilities - 0.1, 'YOUR CONTRACT', 'WHO IS RESPONSIBLE FOR WHAT', 'ok']]);
  const srcChip = (t, txt, a0, a1) => { const al = win(t, a0, a1); if (al <= 0.003) return; const f = F.d(800, 24), w = Math.min(SAFE.w, M(txt, f, 2) + 48); ctx.save(); ctx.globalAlpha *= al; glassPill(CX - w / 2, 1172, w, 52, 26); T(txt, CX, 1207, { font: f, ls: 2, color: '#FFFFFF', sx: Math.min(1, (SAFE.w - 48) / M(txt, f, 2)) }); ctx.restore(); };

  const overlay = (t) => {
    for (const s of SECT) drawSection(t, s);
    { const v = Math.max(win(t, C2[0], C2[1] - 0.1), win(t, C3[0], C3[1] - 0.1)); if (v > 0.003) {      // the tree scrolls under the title: fade it out above y 720
      const g = ctx.createLinearGradient(0, 0, 0, 720); g.addColorStop(0, 'rgba(8,8,10,1)'); g.addColorStop(0.74, 'rgba(8,8,10,1)'); g.addColorStop(1, 'rgba(8,8,10,0)'); ctx.save(); ctx.globalAlpha *= v; ctx.fillStyle = g; ctx.fillRect(0, 0, W, 720); ctx.restore(); } }
    Dlab(t); E2rows(t);
    hudTitle(t, 'THE NAME ON THE PROJECT', 'WHO OWNS IT?', '', 0.15, S0[1] - 0.15, GOLD);
    hudTitle(t, 'EMAAR', 'WITH PARTNERS', 'SEVERAL MAJOR DEVELOPMENTS', C1[0] + 0.05, K.rashid - 0.25, GOLD);
    hudTitle(t, 'WITH DP WORLD', 'RASHID YACHTS & MARINA', '70 / 30 VENTURE', K.rashid - 0.1, C1[1] - 0.15, GOLD);
    hudTitle(t, 'THE NATIONAL · 2019', 'EMAAR HOLDS 70%', 'P&O MARINAS (DP WORLD) 30%', P1[0] + 0.05, P1[1] - 0.15, GOLD);
    hudTitle(t, 'WITH MERAAS', 'DUBAI HILLS ESTATE', '50 / 50 JOINT VENTURE', C2[0] + 0.05, C2[1] - 0.15, GOLD);
    hudTitle(t, 'EMAAR · 14 NOV 2024', 'EXPO LIVING', 'WITH DUBAI WORLD TRADE CENTRE', P2[0] + 0.05, P2[1] - 0.15, GOLD);
    hudTitle(t, 'WITH DWTC', 'EXPO LIVING', 'A JOINT VENTURE', C3[0] + 0.05, K.and - 0.15, GOLD);
    hudTitle(t, 'WITH DACC', 'EMAAR SOUTH', '50 / 50 VENTURE', K.and - 0.05, C3[1] - 0.15, GOLD);
    hudTitle(t, 'DUBAI AVIATION CITY CORP.', 'ITS CHAIRMAN', 'SHEIKH AHMED BIN SAEED', C4[0] + 0.05, C4[1] - 0.15, GOLD);
    hudTitle(t, 'A SEPARATE CONNECTION', 'COMPANY LEVEL', 'DUBAI HOLDING → EMAAR', CO[0] + 0.05, CO[1] - 0.15, GOLD);
    hudTitle(t, 'MAY 2026', '29.73%', 'LARGEST SHAREHOLDER', P3[0] + 0.05, P3[1] - 0.15, GOLD);
    hudTitle(t, "DON'T MIX THEM UP", 'TWO ARRANGEMENTS', 'SHARES ≠ PARTNERSHIP', D[0] + 0.05, D[1] - 0.15, GOLD);
    hudTitle(t, 'WHEN YOU RESEARCH', 'LOOK BEYOND', 'THE NAME ON THE BROCHURE', E1[0] + 0.05, E1[1] - 0.15, GOLD);
    hudTitle(t, 'BEFORE YOU BUY', 'CHECK THREE THINGS', '', E2[0] + 0.05, E2[1] - 0.15, TEAL[1]);
    srcChip(t, 'THE NATIONAL · 18 AUG 2019', P1[0] + 0.2, P1[1] - 0.15); srcChip(t, 'EMAAR PRESS RELEASE · 14 NOV 2024', P2[0] + 0.2, P2[1] - 0.15);
    srcChip(t, 'DUBAI MEDIA OFFICE · 12 MAY 2026', P3[0] + 0.2, P3[1] - 0.15);
    // the call to action: follow for more "who's behind" breakdowns
    const ce = ea(t, K.follow - 0.1, K.follow + 0.5, E.out4);
    if (ce > 0.003) {
      ctx.save(); ctx.globalAlpha *= ce; ctx.fillStyle = 'rgba(8,8,10,0.9)'; ctx.fillRect(0, 0, W, H); T('ABDULLAH AHLI', CX, 660, { font: F.d(800, 62), ls: 2, color: C.ink }); T('PORTFOLIO STRATEGIST', CX, 714, { font: F.d(700, 34), ls: 6, color: C.gold }); ctx.restore();
      const tap = K.follow + 0.35, on = ea(t, tap, tap + 0.25), pr = 1 - 0.06 * Math.sin(Math.PI * clamp((t - tap) / 0.25)), bw = 460, bh = 108, by = 860;
      ctx.save(); ctx.globalAlpha *= ea(t, K.follow, K.follow + 0.4); ctx.translate(CX, by); ctx.scale(pr, pr);
      rr(-bw / 2, -bh / 2, bw, bh, bh / 2); ctx.fillStyle = on < 0.5 ? C.gold : '#1A1712'; ctx.fill(); if (on >= 0.5) { ctx.strokeStyle = GOLD; ctx.lineWidth = 3; ctx.stroke(); }
      if (on < 0.5) T('FOLLOW', 0, 18, { font: F.d(800, 48), ls: 4, color: '#17181B' }); else { icon('check', -bw / 2 + 62, 0, 20, { p: ea(t, tap + 0.1, tap + 0.5), color: GOLD, w: 5 }); T('FOLLOWING', 28, 17, { font: F.d(800, 44), ls: 3, color: GOLD, sx: fit('FOLLOWING', F.d(800, 44), bw - 150, 3) }); }
      const rp = clamp((t - tap) / 0.6); if (rp > 0 && rp < 1) ring(0, 0, 60 + 220 * rp, { color: 'rgb(233,196,124)', w: 4, alpha: 1 - rp });
      ctx.restore();
      const wa = ea(t, K.whos - 0.15, K.whos + 0.35, E.out4); if (wa > 0.003) { ctx.save(); ctx.globalAlpha *= wa; ctx.translate(0, (1 - wa) * 30); T("WHO'S BEHIND", CX, 1040, { font: F.d(800, 58), ls: 2, color: '#FFFFFF' }); ctx.restore(); }
      const ba = ea(t, K.biggest - 0.2, K.biggest + 0.3, E.out4); if (ba > 0.003) { ctx.save(); ctx.globalAlpha *= ba; ctx.translate(0, (1 - ba) * 30); T("DUBAI'S BIGGEST COMMUNITIES", CX, 1120, { font: F.d(800, 42), ls: 2, color: GOLD, sx: fit("DUBAI'S BIGGEST COMMUNITIES", F.d(800, 42), SAFE.w, 2) }); ctx.restore(); }
    }
  };
  OVERLAYS.push(overlay);

  [S0[0] + 0.2, C1[0], P1[0], C2[0], P2[0], C3[0], C4[0], CO[0], P3[0], D[0], E1[0], E2[0], K.follow].forEach(x => cues.push({ k: 'wh', t: x - 0.2, d: 0.5 }));
  [K.r7030, K.fifty1, K.fifty2, K.pct].forEach(x => cues.push({ k: 'pin', t: x })); cues.push({ k: 'send', t: K.follow + 0.35 });
  return { FACE_SEGS, PUNCHES, SCENES, OVERLAYS, cues, IMAGES, BUBBLE, FOOT_MAX: Math.min(TL.frames, 3242) - 1, NO_CAPTIONS: false, CAP_UNTIL: VEND, STATIC_FACE: false };
}
